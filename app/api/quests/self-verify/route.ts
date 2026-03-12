import { NextRequest, NextResponse } from "next/server";
import { requireQuickAuthFid } from "@/lib/quickauth";
import { questDropVerificationRule } from "@/lib/quest-drop-verification";
import {
  evaluateQuestVerification,
  fetchQuestVerification,
} from "@/lib/quest-verification";

export async function GET(request: NextRequest) {
  let fid: number;
  try {
    fid = await requireQuickAuthFid(request);
  } catch {
    return NextResponse.json(
      { error: "Unauthorized", isSuccess: false },
      { status: 401 },
    );
  }

  const hasVerificationRequirement =
    questDropVerificationRule.requireVisit ||
    questDropVerificationRule.requireFree ||
    questDropVerificationRule.requireEmber ||
    questDropVerificationRule.requireCelestial;

  if (!hasVerificationRequirement) {
    return NextResponse.json(
      { error: "No quest verification requirement is enabled", isSuccess: false },
      { status: 500 },
    );
  }

  const verificationResponse = await fetchQuestVerification(request, fid);
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
      fid,
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
