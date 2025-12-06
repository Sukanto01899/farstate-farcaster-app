// app/api/generate-thumbnail/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  currentDateDhaka,
  getRateCount,
  incrRateCount,
  getSubscription,
  STANDARD_LIMIT,
  SUB_LIMIT,
} from "@/lib/limits";
import { createThumbnailWithAI } from "@/lib/ai";

async function getUserLimit(userId: string): Promise<number> {
  const raw = await getSubscription(userId);
  if (!raw) return STANDARD_LIMIT;
  try {
    const parsed = JSON.parse(raw);
    const expiresAt = Number(
      parsed.expiresAt || parsed.expiry || parsed.expiresAtMs
    );
    if (!isNaN(expiresAt) && Date.now() < expiresAt) return SUB_LIMIT;
    return STANDARD_LIMIT;
  } catch (e) {
    // If stored value is not JSON (legacy) attempt numeric parse
    const maybe = Number(raw);
    if (!isNaN(maybe) && Date.now() < maybe) return SUB_LIMIT;
    return STANDARD_LIMIT;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const auth = req.headers.get("authorization") || "";
    let userId: string | null = null;
    if (auth.startsWith("Bearer ")) userId = auth.slice(7).trim();
    if (!userId && body.userId) userId = String(body.userId).trim();
    if (!userId) {
      return NextResponse.json(
        {
          error:
            "Missing userId (Authorization Bearer or body.userId required)",
        },
        { status: 401 }
      );
    }

    const prompt = (body.prompt || "").trim();
    if (!prompt)
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

    const dateKey = currentDateDhaka();
    const limit = await getUserLimit(userId);
    const current = await getRateCount(userId, dateKey);

    if (current >= limit) {
      return NextResponse.json(
        {
          error: "Daily limit reached",
          limit,
          used: current,
          resetDate: dateKey,
        },
        { status: 429 }
      );
    }

    // Call Gemini / GoogleGenAI to generate image
    const imageBase64 = await createThumbnailWithAI(prompt);

    // Successful generation — increment count and ensure TTL (handled by incrRateCount)
    await incrRateCount(userId, dateKey);

    const used = await getRateCount(userId, dateKey);

    return NextResponse.json(
      {
        contentType: "image/png",
        imageBase64,
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
