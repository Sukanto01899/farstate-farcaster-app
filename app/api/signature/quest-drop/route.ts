import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { privateKeyToAccount } from "viem/accounts";
import { requireQuickAuthFid } from "@/lib/quickauth";
import {
  questDropVerificationRule,
  type QuestVerificationRule,
} from "@/lib/quest-drop-verification";

type QuestVerificationResponse = {
  visit?: {
    completed?: boolean;
  };
  free?: {
    completed?: boolean;
  };
  ember?: {
    completed?: boolean;
  };
  celestial?: {
    completed?: boolean;
  };
};

function getUtcDateString() {
  return new Date().toISOString().slice(0, 10);
}

async function verifyQuestRequirements(
  request: NextRequest,
  fid: number,
  rule: QuestVerificationRule,
) {
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
  verifyUrl.searchParams.set("date", getUtcDateString());

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

  if (rule.requireVisit && !verification?.visit?.completed) {
    return {
      ok: false,
      status: 403,
      error: "Visit quest not completed for the current UTC day",
    };
  }

  if (rule.requireFree && !verification?.free?.completed) {
    return {
      ok: false,
      status: 403,
      error: "Free claim quest not completed for the current UTC day",
    };
  }

  if (rule.requireEmber && !verification?.ember?.completed) {
    return {
      ok: false,
      status: 403,
      error: "Ember claim quest not completed for the current UTC day",
    };
  }

  if (rule.requireCelestial && !verification?.celestial?.completed) {
    return {
      ok: false,
      status: 403,
      error: "Celestial claim quest not completed for the current UTC day",
    };
  }

  return { ok: true as const };
}

export async function POST(request: NextRequest) {
  const { userAddress, contract, chainId } = await request.json();

  let fid: number;
  try {
    fid = await requireQuickAuthFid(request);
  } catch {
    return NextResponse.json(
      { error: "Unauthorized", isSuccess: false },
      { status: 401 },
    );
  }

  if (!userAddress || !fid || !contract) {
    return NextResponse.json(
      { error: "Invalid input", isSuccess: false },
      { status: 400 },
    );
  }

  const serverPrivateKey = process.env.SERVER_PRIVATE_KEY;
  if (!serverPrivateKey) {
    return NextResponse.json(
      { error: "Server configuration error", isSuccess: false },
      { status: 500 },
    );
  }

  try {
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

    const questVerification = await verifyQuestRequirements(
      request,
      fid,
      questDropVerificationRule,
    );
    if (!questVerification.ok) {
      return NextResponse.json(
        { error: questVerification.error, isSuccess: false },
        { status: questVerification.status },
      );
    }

    const account = privateKeyToAccount(serverPrivateKey as `0x${string}`);
    const nonce = BigInt(`0x${randomBytes(8).toString("hex")}`);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 10 * 60);
    const resolvedChainId =
      typeof chainId === "number" ? chainId : Number(chainId) || 8453;

    const signature = await account.signTypedData({
      domain: {
        name: "ExclusiveDrop",
        version: "1",
        chainId: resolvedChainId,
        verifyingContract: contract,
      },
      types: {
        Claim: [
          { name: "user", type: "address" },
          { name: "fid", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      },
      primaryType: "Claim",
      message: {
        user: userAddress,
        fid: BigInt(fid),
        nonce,
        deadline,
      },
    });

    return NextResponse.json(
      {
        signature,
        fid,
        nonce: nonce.toString(),
        deadline: deadline.toString(),
        chainId: resolvedChainId,
        isSuccess: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Unauthorized", isSuccess: false },
      { status: 401 },
    );
  }
}
