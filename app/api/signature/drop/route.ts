import { NextRequest, NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";
import { randomBytes } from "crypto";
import { getRequestIp, runDropSecurityChecks } from "@/lib/drop-security";

export async function POST(request: NextRequest) {
  const { userAddress, contract, chainId } = await request.json();
  const fid = Number(request.headers.get("x-fid"));
  if (!Number.isFinite(fid)) {
    return NextResponse.json(
      { error: "Unauthorized", isSuccess: false },
      { status: 401 },
    );
  }

  // Validate input
  if (!userAddress || !fid || !contract) {
    return NextResponse.json(
      { error: "Invalid input", isSuccess: false },
      { status: 400 },
    );
  }

  const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY;
  if (!SERVER_PRIVATE_KEY) {
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

    const account = privateKeyToAccount(SERVER_PRIVATE_KEY as `0x${string}`);

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

    // Signature generate closed for testing - remove when ready to use
    return NextResponse.json(
      {
        signature: "signature-none",
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
