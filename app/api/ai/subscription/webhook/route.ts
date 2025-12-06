// app/api/purchase/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { setSubscription } from "@/lib/limits";

const WEBHOOK_SECRET = process.env.COINBASE_WEBHOOK_SECRET || "";
const SUB_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function verifySignature(rawBody: string, signature: string) {
  const crypto = require("crypto");
  const h = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return h === signature;
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("X-CC-Webhook-Signature") || "";

  if (!verifySignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(raw);

  if (event.type !== "charge:confirmed" && event.type !== "charge:resolved") {
    // Not a final payment event we care about
    return NextResponse.json({ ok: true });
  }

  const charge = event.data;
  const metadata = charge.metadata || {};
  const userId = metadata.userId;
  if (!userId)
    return NextResponse.json(
      { error: "No userId in metadata" },
      { status: 400 }
    );

  const expiresAt = Date.now() + SUB_DURATION_MS;
  const subValue = JSON.stringify({ tier: "pro", expiresAt });

  const ttlSeconds = Math.floor(SUB_DURATION_MS / 1000);
  try {
    await setSubscription(userId, subValue, ttlSeconds);
  } catch (e) {
    console.error("Failed to set subscription in Upstash:", e);
    return NextResponse.json(
      { error: "Failed to set subscription" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
