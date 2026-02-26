import { NextRequest, NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";
import { randomBytes } from "crypto";
import { requireQuickAuthFid } from "@/lib/quickauth";

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
