import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { timingSafeEqual } from "crypto";
import {
  getUsersNotificationDetails,
  removeInvalidNotificationTokens,
} from "@/lib/kv";

export const runtime = "nodejs";

const requestSchema = z.object({
  title: z.string(),
  body: z.string(),
});

// Configuration
const BATCH_SIZE = 100;
const PARALLEL_BATCHES = 5; // Send 5 batches at once
const REQUEST_TIMEOUT = 10000; // 10 second timeout

function timingSafeEqualString(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

function getAuthSecret(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const bearer =
    authorization?.toLowerCase().startsWith("bearer ") === true
      ? authorization.slice(7).trim()
      : null;

  return (
    bearer ??
    request.headers.get("x-notification-secret") ??
    request.headers.get("x-api-key")
  );
}

async function sendNotificationBatch(
  url: string,
  tokens: string[],
  title: string,
  body: string,
  notificationId: string
) {
  const payload = {
    notificationId,
    title,
    body,
    targetUrl: "https://farstate.vercel.app",
    tokens,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.status === 200) {
      const json = await res.json();
      return {
        successful: json?.result?.successfulTokens?.length || 0,
        invalid: json?.result?.invalidTokens || [],
        rateLimited: json?.result?.rateLimitedTokens?.length || 0,
      };
    } else {
      console.error(`Batch error (${res.status}):`, await res.text());
      return { successful: 0, invalid: [], rateLimited: 0 };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Batch request timeout");
    } else {
      console.error("Batch fetch error:", error);
    }
    return { successful: 0, invalid: [], rateLimited: 0 };
  }
}

export async function POST(request: NextRequest) {
  const requiredSecret = process.env.SEND_NOTIFICATION_SECRET;
  if (!requiredSecret) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Server misconfigured: missing SEND_NOTIFICATION_SECRET environment variable",
      },
      { status: 500 }
    );
  }

  const providedSecret = getAuthSecret(request);
  if (!providedSecret || !timingSafeEqualString(providedSecret, requiredSecret)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      {
        status: 401,
        headers: { "WWW-Authenticate": 'Bearer realm="send-notification"' },
      }
    );
  }

  let requestJson: unknown;
  try {
    requestJson = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return NextResponse.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  const allKeys = await getUsersNotificationDetails();

  const notificationId = `broadcast-${Date.now()}`;

  // Create batches
  const batches: Array<{ url: string; tokens: string[] }> = [];
  for (let i = 0; i < allKeys.length; i += BATCH_SIZE) {
    const batch = allKeys.slice(i, i + BATCH_SIZE);
    batches.push({
      url: batch[0].url,
      tokens: batch.map((u) => u.token),
    });
  }

  console.log(`Sending ${batches.length} batches to ${allKeys.length} users`);

  // Process batches in parallel chunks
  let totalSuccessful = 0;
  let totalInvalid = 0;
  let totalRateLimited = 0;
  const allInvalidTokens: string[] = [];

  for (let i = 0; i < batches.length; i += PARALLEL_BATCHES) {
    const chunk = batches.slice(i, i + PARALLEL_BATCHES);

    // Send multiple batches in parallel
    const results = await Promise.allSettled(
      chunk.map((batch) =>
        sendNotificationBatch(
          batch.url,
          batch.tokens,
          requestBody.data.title,
          requestBody.data.body,
          notificationId
        )
      )
    );

    // Aggregate results
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        totalSuccessful += result.value.successful;
        totalInvalid += result.value.invalid.length;
        totalRateLimited += result.value.rateLimited;
        allInvalidTokens.push(...result.value.invalid);
      }
    });

    console.log(
      `Processed ${Math.min(i + PARALLEL_BATCHES, batches.length)}/${
        batches.length
      } batches`
    );
  }

  // Cleanup invalid tokens ONCE at the end (not per batch)
  if (allInvalidTokens.length > 0) {
    console.log(`Removing ${allInvalidTokens.length} invalid tokens`);
    // Run in background - don't block response
    removeInvalidNotificationTokens(allInvalidTokens).catch((err) =>
      console.error("Failed to remove invalid tokens:", err)
    );
  }

  const summary = {
    successful: totalSuccessful,
    invalid: totalInvalid,
    rateLimited: totalRateLimited,
    totalBatches: batches.length,
    totalUsers: allKeys.length,
  };

  console.log("Broadcast complete:", summary);

  return NextResponse.json({
    success: true,
    results: summary,
  });
}
