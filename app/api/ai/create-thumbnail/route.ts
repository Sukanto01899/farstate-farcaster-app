// app/api/generate-thumbnail/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  currentDateDhaka,
  getRateCount,
  incrRateCount,
  getSubscription,
  STANDARD_IMAGE_LIMIT,
  SUB_IMAGE_LIMIT,
} from "@/lib/limits";
import { createThumbnailWithAI } from "@/lib/ai";
import { uploadImageToCloudinary } from "@/lib/upload";

async function getUserLimit(userId: string): Promise<number> {
  const raw = await getSubscription(userId);
  if (!raw) return STANDARD_IMAGE_LIMIT;
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
      return SUB_IMAGE_LIMIT;
    }
    return STANDARD_IMAGE_LIMIT;
  } catch (e) {
    // If stored value is not JSON (legacy) attempt numeric parse
    const maybe = Number(raw);
    if (!isNaN(maybe) && Date.now() < maybe) return SUB_IMAGE_LIMIT;
    return STANDARD_IMAGE_LIMIT;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const fid = req.headers.get("x-fid");

    if (!fid) {
      return NextResponse.json(
        {
          error: "Missing fid (Authorization Bearer or body.userId required)",
        },
        { status: 401 }
      );
    }

    const prompt = (body.prompt || "").trim();
    if (!prompt)
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

    const dateKey = currentDateDhaka();
    const limit = await getUserLimit(fid);
    const current = await getRateCount(fid, dateKey, "image");

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

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No candidate returned from image model" },
        { status: 502 }
      );
    }

    // ✅ Upload to get public URL
    const imageUrl = await uploadImageToCloudinary(imageBase64);

    // Successful generation — increment count and ensure TTL (handled by incrRateCount)
    await incrRateCount(fid, dateKey, "image");

    const used = await getRateCount(fid, dateKey, "image");

    return NextResponse.json(
      {
        contentType: "image/png",
        imageBase64,
        message: "Image generated successfully",
        remaining: Math.max(0, limit - used),
        limit,
        date: dateKey,
        imageUrl,
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
