import type { NextRequest } from "next/server";
import type { QuestVerificationRule } from "@/lib/quest-drop-verification";

export type QuestVerificationResponse = {
  visit?: {
    completed?: boolean;
    timestamp?: string | null;
  };
  free?: {
    completed?: boolean;
    timestamp?: string | null;
  };
  ember?: {
    completed?: boolean;
    timestamp?: string | null;
    txHash?: string | null;
  };
  celestial?: {
    completed?: boolean;
    timestamp?: string | null;
    txHash?: string | null;
  };
};

type QuestVerificationFailure = {
  ok: false;
  status: number;
  error: string;
};

type QuestVerificationSuccess = {
  ok: true;
  verification: QuestVerificationResponse;
  date: string;
};

export type QuestVerificationResult =
  | QuestVerificationFailure
  | QuestVerificationSuccess;

export function getUtcDateString() {
  return new Date().toISOString().slice(0, 10);
}

export async function fetchQuestVerification(
  _request: NextRequest,
  fid: number,
  date = getUtcDateString(),
): Promise<QuestVerificationResult> {
  const questSecret = process.env.QUEST_PLATFORM_API_SECRET;
  if (!questSecret) {
    return {
      ok: false,
      status: 500,
      error: "QUEST_PLATFORM_API_SECRET is not configured",
    };
  }

  const verifyBaseUrl = process.env.QUEST_VERIFY_URL;
  if (!verifyBaseUrl) {
    return {
      ok: false,
      status: 500,
      error: "QUEST_VERIFY_URL is not configured",
    };
  }

  const verifyUrl = new URL(verifyBaseUrl);
  verifyUrl.searchParams.set("fid", String(fid));
  verifyUrl.searchParams.set("date", date);

  const response = await fetch(verifyUrl.toString(), {
    method: "GET",
    headers: {
      "x-quest-secret": questSecret,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: "Quest verification failed",
    };
  }

  const verification =
    (await response.json().catch(() => null)) as QuestVerificationResponse | null;

  if (!verification) {
    return {
      ok: false,
      status: 502,
      error: "Quest verification returned an invalid response",
    };
  }

  return {
    ok: true as const,
    verification,
    date,
  };
}

export function evaluateQuestVerification(
  verification: QuestVerificationResponse,
  rule: QuestVerificationRule,
) {
  if (rule.requireVisit && !verification.visit?.completed) {
    return {
      ok: false,
      status: 403,
      error: "Visit quest not completed for the current UTC day",
    };
  }

  if (rule.requireFree && !verification.free?.completed) {
    return {
      ok: false,
      status: 403,
      error: "Free claim quest not completed for the current UTC day",
    };
  }

  if (rule.requireEmber && !verification.ember?.completed) {
    return {
      ok: false,
      status: 403,
      error: "Ember claim quest not completed for the current UTC day",
    };
  }

  if (rule.requireCelestial && !verification.celestial?.completed) {
    return {
      ok: false,
      status: 403,
      error: "Celestial claim quest not completed for the current UTC day",
    };
  }

  return { ok: true as const };
}
