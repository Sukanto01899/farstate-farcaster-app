// app/api/subscription/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getSubscription,
  getRateCount,
  currentDateDhaka,
  STANDARD_LIMIT,
  SUB_LIMIT,
} from "@/lib/limits";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const auth = req.headers.get("authorization") || "";
  let userId: string | null = null;
  if (auth.startsWith("Bearer ")) userId = auth.slice(7).trim();
  if (!userId && body.userId) userId = String(body.userId).trim();
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

  const limit =
    tier === "pro" && expiresAt && Date.now() < expiresAt
      ? SUB_LIMIT
      : STANDARD_LIMIT;
  const used = await getRateCount(userId, currentDateDhaka());

  return NextResponse.json({
    tier,
    expiresAt,
    limit,
    used,
    remaining: Math.max(0, limit - used),
  });
}
