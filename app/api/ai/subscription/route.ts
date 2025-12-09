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
  let userId: string | null = body.fid;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId/fid" }, { status: 401 });
  }

  const subRaw = await getSubscription(userId);

  let tier = "free";
  let expiresAt: number | null = null;

  if (subRaw) {
    try {
      let parsed;

      // Check if it's already an object
      if (typeof subRaw === "object") {
        parsed = subRaw;
        // console.log("Already an object:", parsed);
      } else if (typeof subRaw === "string") {
        parsed = JSON.parse(subRaw);
        // console.log("Parsed from string:", parsed);
      } else {
        // console.log("Unknown type, treating as timestamp");
        const maybe = Number(subRaw);
        if (!isNaN(maybe)) {
          tier = "free";
          expiresAt = maybe;
        }
      }

      if (parsed) {
        // Check tier (case-insensitive)
        if (parsed.tier) {
          tier = String(parsed.tier).toLowerCase();
        }

        // Try multiple expiry field names
        if (parsed.expiresAt) {
          expiresAt = Number(parsed.expiresAt);
        } else if (parsed.expiryDate) {
          // Convert ISO date string to timestamp
          expiresAt = new Date(parsed.expiryDate).getTime();
        } else if (parsed.expiry) {
          expiresAt = Number(parsed.expiry);
        } else if (parsed.expiresAtMs) {
          expiresAt = Number(parsed.expiresAtMs);
        }
      }
    } catch (error) {
      // console.error("Error processing subscription:", error);
      // Fallback
      const maybe = Number(subRaw);
      if (!isNaN(maybe)) {
        tier = "free";
        expiresAt = maybe;
      }
    }
  } else {
    // console.log("No subscription found for FID:", userId);
  }

  // Check if subscription is active
  const isActive = tier === "pro" && expiresAt && Date.now() < expiresAt;

  const text_limit = isActive ? SUB_TEXT_LIMIT : STANDARD_TEXT_LIMIT;
  const text_used = await getRateCount(userId, currentDateDhaka(), "text");

  const image_limit = isActive ? SUB_IMAGE_LIMIT : STANDARD_IMAGE_LIMIT;
  const image_used = await getRateCount(userId, currentDateDhaka(), "image");

  return NextResponse.json({
    tier: isActive ? "pro" : "free",
    expiresAt,
    text_limit,
    image_limit,
    text_used,
    image_used,
    text_remaining: Math.max(0, text_limit - text_used),
    image_remaining: Math.max(0, image_limit - image_used),
  });
}
