import { getNeynarUser } from "@/lib/neynar";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fid: string }> }
) {
  const { fid } = await context.params;
  const nftFId = fid.split(".")[0];

  const user = fid ? await getNeynarUser(Number(nftFId)) : null;

  return NextResponse.json({
    name: `${user?.display_name}`,
    description: "An awesome NFT from Base Spin Warplet Monstar collection.",
    image: user?.pfp_url,
    attributes: [
      {
        trait_type: "Background",
        value: "Purple",
      },
      {
        trait_type: "Eyes",
        value: "Laser",
      },
      {
        trait_type: "Mouth",
        value: "Smile",
      },
      {},
    ],
  });
}
