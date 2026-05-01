import { getNeynarUser } from "@/lib/neynar";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

const ONE_DAY_SECONDS = 60 * 60 * 24;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get("fid");

  const user = fid ? await getNeynarUser(Number(fid)) : null;

  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col justify-center items-center relative bg-purple-900">
        {user?.pfp_url && (
          <div tw="flex w-80 h-80 rounded-full overflow-hidden mb-8 border-8 border-white">
            <img
              src={user.pfp_url}
              alt="Profile"
              tw="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 tw="text-7xl mt-4 text-white opacity-80">
          My Neynar Score{" "}
          <span tw="text-white font-bold ml-4 opacity-100"> {user?.score}</span>
        </h1>
        <p tw="text-5xl mt-3 text-white opacity-80">Powered By Farstate Ai</p>
      </div>
    ),
    {
      width: 1200,
      height: 800,
      headers: {
        // Cache at the edge (CDN) for 1 day to reduce function invocations.
        "Cache-Control": `public, max-age=0, s-maxage=${ONE_DAY_SECONDS}, stale-while-revalidate=${ONE_DAY_SECONDS}`,
      },
    }
  );
}
