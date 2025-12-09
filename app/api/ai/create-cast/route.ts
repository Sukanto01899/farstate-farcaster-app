import { NextRequest, NextResponse } from "next/server";
import { createCastWithAI } from "@/lib/ai";
import {
  currentDateDhaka,
  getRateCount,
  getSubscription,
  incrRateCount,
  STANDARD_TEXT_LIMIT,
  SUB_TEXT_LIMIT,
} from "@/lib/limits";

/**
 * Fallback in-memory store (non-persistent; only for local dev).
 * Warning: in-memory resets on server restart and will NOT work in multi-instance envs.
 */
const inMemoryStore = new Map<string, number>();

async function getUserLimit(userId: string): Promise<number> {
  const raw = await getSubscription(userId);
  if (!raw) return STANDARD_TEXT_LIMIT;
  try {
    const parsed = JSON.parse(raw);
    const expiresAt = parsed.expiresAt
      ? Number(parsed.expiresAt)
      : parsed.expiryDate
      ? new Date(parsed.expiryDate).getTime()
      : parsed.expiresAtMs
      ? Number(parsed.expiresAtMs)
      : null;

    if (expiresAt && Date.now() < expiresAt) {
      return SUB_TEXT_LIMIT;
    }
    return STANDARD_TEXT_LIMIT;
  } catch (e) {
    // If stored value is not JSON (legacy) attempt numeric parse
    const maybe = Number(raw);
    if (!isNaN(maybe) && Date.now() < maybe) return SUB_TEXT_LIMIT;
    return STANDARD_TEXT_LIMIT;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    // Accept userId via Authorization Bearer or body.userId

    const fid = req.headers.get("x-fid");
    // // let userId: string | null = fid;
    if (!fid) {
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
    const redisKey = `text_rate:${fid}:${dateKey}`;

    // Check current count
    const limit = await getUserLimit(fid);
    const current = await getRateCount(fid, dateKey, "text");
    // console.log({ limit, current });
    if (current >= limit) {
      return NextResponse.json(
        {
          error: "Your Daily limit reached. Back Tomorrow.",
          limit,
          used: current,
          resetDate: dateKey, // Dhaka date when it resets
        },
        { status: 429 }
      );
    }

    const aiData = await createCastWithAI(prompt);

    if (!aiData) {
      return NextResponse.json(
        { error: "No content returned from text model" },
        { status: 502 }
      );
    }

    // At this point the image generation is successful -> increment the user's daily count
    try {
      // Successful generation — increment count and ensure TTL (handled by incrRateCount)
      await incrRateCount(fid, dateKey, "text");
    } catch (e) {
      // If Redis fails, fallback to in-memory increment (best-effort)
      const v = inMemoryStore.get(redisKey) || 0;
      inMemoryStore.set(redisKey, v + 1);
    }

    const used = await getRateCount(fid, dateKey, "text");

    // Return base64 payload. Consumers can directly render or upload to CDN.
    return NextResponse.json(
      {
        contentType: "text",
        cast: aiData,
        message: "Image generated successfully",
        remaining: Math.max(0, limit - used),
        limit,
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
