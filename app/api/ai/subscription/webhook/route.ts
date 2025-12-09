// app/api/subscription/route.ts
import { setSubscription, setTxHash } from "@/lib/limits";
import { redis } from "@/lib/upstash";
import { verifyTransaction } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/subscription
 * Verify payment and create subscription in Redis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, txHash } = body;

    // console.log({ fid, txHash });

    if (!fid || !txHash) {
      return NextResponse.json(
        { success: false, error: "Missing address or txHash" },
        { status: 400 }
      );
    }

    // Check if already processed
    const key = `sub:${fid}`;
    const existing = await redis.get<string>(key);

    // console.log(existing);

    if (existing) {
      const existingData = JSON.parse(existing);
      if (existingData.txHash === txHash) {
        return NextResponse.json({
          success: true,
          message: "Subscription already active",
          subscription: existingData,
        });
      }
    }

    // Verify transaction on-chain
    const verification = await verifyTransaction(txHash);

    console.log(verification);

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.error },
        { status: 400 }
      );
    }

    // Convert bigint fid to number;
    const verifiedFid = Number(verification.fid.toString());

    // Verify the address matches
    if (verifiedFid !== fid) {
      return NextResponse.json(
        { success: false, error: "Fid mismatch" },
        { status: 400 }
      );
    }

    // Ensure months is present and positive
    const months = Number(verification.months);
    if (!months || months < 0) {
      return NextResponse.json(
        { success: false, error: "Invalid subscription duration" },
        { status: 400 }
      );
    }

    // Calculate duration in seconds
    const durationSeconds = months * 30 * 24 * 60 * 60;

    // Create subscription data
    const subValue = JSON.stringify({
      address: verification.user,
      fid: verifiedFid.toString(),
      months,
      txHash,
      paymentId: verification.paymentId,
      amount: verification.amount.toString(),
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + durationSeconds * 1000).toISOString(),
      timestamp: verification.timestamp,
      tier: "Pro",
    });

    // Store in Redis with expiration
    await setSubscription(verifiedFid.toString(), subValue, durationSeconds);

    // Also store tx hash to prevent double processing
    await setTxHash(verifiedFid.toString(), durationSeconds);

    return NextResponse.json({
      success: true,
      message: "Subscription activated",
      subscription: {
        months,
        expiresIn: durationSeconds,
        expiryDate: new Date(Date.now() + durationSeconds * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscription?address=0x...
 * Check subscription status
 */
export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address required" },
        { status: 400 }
      );
    }

    const key = `subscription:${address.toLowerCase()}`;
    const subData = await redis.get<string>(key);

    if (!subData) {
      return NextResponse.json({
        success: true,
        active: false,
        message: "No active subscription",
      });
    }

    const ttl = await redis.ttl(key);
    const subscription = JSON.parse(subData);

    return NextResponse.json({
      success: true,
      active: true,
      subscription: {
        ...subscription,
        remainingSeconds: ttl,
        remainingDays: Math.floor(ttl / 86400),
      },
    });
  } catch (error) {
    console.error("Check subscription error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
