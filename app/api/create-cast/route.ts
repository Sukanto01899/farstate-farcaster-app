import { NextRequest, NextResponse } from "next/server";
import { createCastWithAI } from "@/lib/ai";

const DAILY_LIMIT = process.env.DAILY_AI_GEN_LIMIT
  ? parseInt(process.env.DAILY_AI_GEN_LIMIT)
  : 5;

/**
 * Optional Upstash REST Redis usage.
 * Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in env to enable.
 */
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || "";
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";

/**
 * Fallback in-memory store (non-persistent; only for local dev).
 * Warning: in-memory resets on server restart and will NOT work in multi-instance envs.
 */
const inMemoryStore = new Map<string, number>();

/** Helper: get current date string in Asia/Dhaka (UTC+6) as YYYY-MM-DD */
function currentDateDhaka(): string {
  const now = new Date();
  // Add +6 hours to convert UTC -> Asia/Dhaka date
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const dhakaMs = utcMs + 6 * 60 * 60 * 1000;
  const d = new Date(dhakaMs);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Redis helpers using Upstash REST API */
async function redisGet(key: string): Promise<number | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    const v = inMemoryStore.get(key);
    return typeof v === "number" ? v : null;
  }

  const res = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(key)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.result !== null ? Number(json.result) : null;
}

async function redisIncr(key: string, expireSeconds?: number): Promise<number> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    const v = inMemoryStore.get(key) || 0;
    const nv = v + 1;
    inMemoryStore.set(key, nv);
    return nv;
  }

  // Use Upstash incr
  const res = await fetch(`${UPSTASH_URL}/incr/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Redis INCR failed");
  const json = await res.json();
  const newVal: number = Number(json.result);

  // If expireSeconds provided, set ttl (only first time ideally)
  if (expireSeconds) {
    // set the TTL separately
    await fetch(
      `${UPSTASH_URL}/expire/${encodeURIComponent(key)}/${expireSeconds}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  }
  return newVal;
}

/** Compute seconds until Dhaka midnight (used to set Redis TTL so limits reset at Dhaka midnight) */
function secondsUntilDhakaMidnight(): number {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const dhakaMs = utcMs + 6 * 60 * 60 * 1000;
  const d = new Date(dhakaMs);
  // compute next midnight in Dhaka ms
  const next = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate() + 1,
    0,
    0,
    0
  );
  // next minus current dhaka ms
  const seconds = Math.max(0, Math.floor((next - d.getTime()) / 1000));
  return seconds;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    // Accept userId via Authorization Bearer or body.userId

    const fid = req.headers.get("x-fid");
    let userId: string | null = fid;
    if (!userId) {
      return NextResponse.json(
        {
          error:
            "Missing userId (provide in Authorization Bearer or body.userId)",
        },
        { status: 401 }
      );
    }

    const prompt = (body.prompt || "").trim();
    if (!prompt) {
      return NextResponse.json(
        { error: "Missing prompt in request body" },
        { status: 400 }
      );
    }

    const dateKey = currentDateDhaka();
    const redisKey = `rate:${userId}:${dateKey}`;

    // Check current count
    const current = (await redisGet(redisKey)) || 0;
    if (current >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: "Your Daily limit reached. Back Tomorrow.",
          limit: DAILY_LIMIT,
          used: current,
          resetDate: dateKey, // Dhaka date when it resets
        },
        { status: 429 }
      );
    }

    const aiData = await createCastWithAI(prompt);
    console.log(aiData);

    if (!aiData) {
      return NextResponse.json(
        { error: "No candidate returned from image model" },
        { status: 502 }
      );
    }

    // At this point the image generation is successful -> increment the user's daily count
    // For persistence set TTL so the key expires at Dhaka midnight
    const ttl = secondsUntilDhakaMidnight();
    try {
      const newCount = await redisIncr(redisKey, ttl);
      // Optionally set TTL only when newCount === 1 (but Upstash expire is idempotent)
      // We ignore the return value; we already have newCount if needed.
    } catch (e) {
      // If Redis fails, fallback to in-memory increment (best-effort)
      const v = inMemoryStore.get(redisKey) || 0;
      inMemoryStore.set(redisKey, v + 1);
    }

    // Return base64 payload. Consumers can directly render or upload to CDN.
    return NextResponse.json(
      {
        contentType: "text",
        cast: aiData,
        message: "Image generated successfully",
        remaining: Math.max(
          0,
          DAILY_LIMIT -
            ((await redisGet(redisKey)) || inMemoryStore.get(redisKey) || 0)
        ),
        date: dateKey,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("generate-thumbnail error:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
