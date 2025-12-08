// app/api/subscription/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getSubscription,
  getRateCount,
  currentDateDhaka,
  STANDARD_TEXT_LIMIT,
  SUB_TEXT_LIMIT,
  STANDARD_IMAGE_LIMIT,
  SUB_IMAGE_LIMIT,
} from "@/lib/limits";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  // const auth = req.headers.get("authorization") || "";
  let userId: string | null = body.fid;
  // if (auth.startsWith("Bearer ")) userId = auth.slice(7).trim();
  // if (!userId && body.userId) userId = String(body.userId).trim();
  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 401 });

  const subRaw = await getSubscription(userId);
  let tier = "free";
  let expiresAt: number | null = null;
  if (subRaw) {
    try {
      const parsed = JSON.parse(subRaw);
      if (parsed.tier) tier = parsed.tier;
      expiresAt =
        Number(parsed.expiresAt || parsed.expiry || parsed.expiresAtMs) || null;
    } catch {
      const maybe = Number(subRaw);
      if (!isNaN(maybe)) {
        tier = "pro";
        expiresAt = maybe;
      }
    }
  }

  const text_limit =
    tier === "pro" && expiresAt && Date.now() < expiresAt
      ? SUB_TEXT_LIMIT
      : STANDARD_TEXT_LIMIT;
  const text_used = await getRateCount(userId, currentDateDhaka(), "text");
  const image_limit =
    tier === "pro" && expiresAt && Date.now() < expiresAt
      ? SUB_IMAGE_LIMIT
      : STANDARD_IMAGE_LIMIT;
  const image_used = await getRateCount(userId, currentDateDhaka(), "image");

  return NextResponse.json({
    tier,
    expiresAt,
    text_limit,
    image_limit,
    text_used,
    image_used,
    text_remaining: Math.max(0, text_limit - text_used),
    image_remaining: Math.max(0, image_limit - image_used),
  });
}
