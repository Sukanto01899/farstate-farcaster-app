import { NextResponse } from "next/server";

const BEST_FRIENDS_CACHE_SECONDS = 60 * 60;
const BEST_FRIENDS_STALE_SECONDS = 6 * 60 * 60;

export async function GET(request: Request) {
  const apiKey = process.env.NEYNAR_API_KEY;
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get("fid");

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Neynar API key is not configured. Please add NEYNAR_API_KEY to your environment variables.",
      },
      { status: 500 }
    );
  }

  if (!fid) {
    return NextResponse.json(
      { error: "FID parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/best_friends?fid=${fid}&limit=3`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.statusText}`);
    }

    const { users } = (await response.json()) as {
      users: { user: { fid: number; username: string } }[];
    };

    return NextResponse.json(
      { bestFriends: users },
      {
        headers: {
          "Cache-Control": `public, max-age=0, s-maxage=${BEST_FRIENDS_CACHE_SECONDS}, stale-while-revalidate=${BEST_FRIENDS_STALE_SECONDS}`,
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch best friends:", error);
    return NextResponse.json(
      {
        error:
          "Failed to fetch best friends. Please check your Neynar API key and try again.",
      },
      { status: 500 }
    );
  }
}
