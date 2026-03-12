import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { privateKeyToAccount } from "viem/accounts";
import { getRequestIp, runDropSecurityChecks } from "@/lib/drop-security";
import { requireQuickAuthFid } from "@/lib/quickauth";
import {
  questDropVerificationRule,
} from "@/lib/quest-drop-verification";
import {
  evaluateQuestVerification,
  fetchQuestVerification,
} from "@/lib/quest-verification";

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
    const securityCheck = await runDropSecurityChecks({
      fid,
      userAddress,
      contract,
      ip: getRequestIp(request.headers),
    });
    if (!securityCheck.ok) {
      return NextResponse.json(
        { error: securityCheck.error, isSuccess: false },
        { status: securityCheck.status },
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

    const questVerification = evaluateQuestVerification(
      verificationResponse.verification,
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
        verifyingContract: securityCheck.contract as `0x${string}`,
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
        user: securityCheck.userAddress,
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
