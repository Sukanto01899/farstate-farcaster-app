import { NextRequest, NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256, encodePacked } from "viem";
import { abi } from "@/contracts/abi";

export async function POST(request: NextRequest) {
  const { userAddress } = await request.json();
  const fid = request.headers.get("x-fid");

  // Validate input
  if (!userAddress || !fid) {
    return NextResponse.json(
      { error: "Invalid input", isSuccess: false },
      { status: 400 }
    );
  }

  const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY;
  if (!SERVER_PRIVATE_KEY) {
    return NextResponse.json(
      { error: "Server configuration error", isSuccess: false },
      { status: 500 }
    );
  }

  try {
    const account = privateKeyToAccount(SERVER_PRIVATE_KEY as `0x${string}`);
    const contractAddress = abi.WCTDrop.address; // Your contract address

    // Create the message hash
    const structuredMessageHash = keccak256(
      encodePacked(
        ["address", "uint256", "address"],
        [userAddress, BigInt(fid), contractAddress]
      )
    );

    // Sign the message
    const signature = await account.signMessage({
      message: { raw: structuredMessageHash },
    });
    console.log(signature, fid);

    return NextResponse.json(
      { signature, fid, isSuccess: true },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Unauthorized", isSuccess: false },
      { status: 401 }
    );
  }
}
