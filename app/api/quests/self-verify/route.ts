import { NextRequest, NextResponse } from "next/server";
import { getAddress, isAddress, verifyMessage } from "viem";
import { questDropVerificationRule } from "@/lib/quest-drop-verification";
import {
  evaluateQuestVerification,
  fetchQuestVerification,
} from "@/lib/quest-verification";

const VERIFY_MESSAGE_PREFIX = "Farstate quest verification";
const VERIFY_MESSAGE_WINDOW_MS = 5 * 60 * 1000;

function parseVerificationMessage(message: string) {
  const parts = message.split("\n");
  if (parts.length !== 3 || parts[0] !== VERIFY_MESSAGE_PREFIX) {
    return null;
  }

  const addressLine = parts[1];
  const issuedAtLine = parts[2];

  if (
    !addressLine.startsWith("Address: ") ||
    !issuedAtLine.startsWith("Issued At: ")
  ) {
    return null;
  }

  return {
    address: addressLine.slice("Address: ".length).trim(),
    issuedAt: issuedAtLine.slice("Issued At: ".length).trim(),
  };
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    userAddress?: string;
    message?: string;
    signature?: `0x${string}`;
  } | null;

  const userAddress = body?.userAddress?.trim();
  const message = body?.message?.trim();
  const signature = body?.signature;

  if (!userAddress || !message || !signature) {
    return NextResponse.json(
      { error: "Missing verification payload", isSuccess: false },
      { status: 400 },
    );
  }

  if (!isAddress(userAddress)) {
    return NextResponse.json(
      { error: "Invalid wallet address", isSuccess: false },
      { status: 400 },
    );
  }

  const parsedMessage = parseVerificationMessage(message);
  if (!parsedMessage || !isAddress(parsedMessage.address)) {
    return NextResponse.json(
      { error: "Invalid verification message", isSuccess: false },
      { status: 400 },
    );
  }

  const issuedAt = Number(parsedMessage.issuedAt);
  if (!Number.isFinite(issuedAt)) {
    return NextResponse.json(
      { error: "Invalid verification timestamp", isSuccess: false },
      { status: 400 },
    );
  }

  if (Math.abs(Date.now() - issuedAt) > VERIFY_MESSAGE_WINDOW_MS) {
    return NextResponse.json(
      { error: "Verification request expired", isSuccess: false },
      { status: 401 },
    );
  }

  const normalizedUserAddress = getAddress(userAddress);
  const normalizedMessageAddress = getAddress(parsedMessage.address);

  if (normalizedUserAddress !== normalizedMessageAddress) {
    return NextResponse.json(
      { error: "Verification address mismatch", isSuccess: false },
      { status: 401 },
    );
  }

  const isValidSignature = await verifyMessage({
    address: normalizedUserAddress,
    message,
    signature,
  });

  if (!isValidSignature) {
    return NextResponse.json(
      { error: "Invalid verification signature", isSuccess: false },
      { status: 401 },
    );
  }

  const hasVerificationRequirement =
    questDropVerificationRule.requireVisit ||
    questDropVerificationRule.requireFree ||
    questDropVerificationRule.requireEmber ||
    questDropVerificationRule.requireCelestial;

  // Disabled verification requirement check for now to allow users to verify with old verification data even after we update the quest verification requirements. We will re-enable this check in the future once we are ready to enforce the new verification requirements and have given users enough time to update their verification data if needed.
  // if (!hasVerificationRequirement) {
  //   return NextResponse.json(
  //     { error: "No quest verification requirement is enabled", isSuccess: false },
  //     { status: 500 },
  //   );
  // }

  const verificationResponse = await fetchQuestVerification(
    request,
    normalizedUserAddress,
  );
  if (!verificationResponse.ok || !("verification" in verificationResponse)) {
    return NextResponse.json(
      { error: verificationResponse.error, isSuccess: false },
      { status: verificationResponse.status },
    );
  }

  const evaluation = evaluateQuestVerification(
    verificationResponse.verification,
    questDropVerificationRule,
  );

  return NextResponse.json(
    {
      address: normalizedUserAddress,
      date: verificationResponse.date,
      verification: verificationResponse.verification,
      requirements: questDropVerificationRule,
      verified: evaluation.ok,
      error: evaluation.ok ? null : evaluation.error,
      isSuccess: evaluation.ok,
    },
    { status: evaluation.ok ? 200 : evaluation.status },
  );
}
