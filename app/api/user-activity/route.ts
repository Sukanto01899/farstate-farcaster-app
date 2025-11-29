// src/app/api/users/route.ts
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { NextRequest, NextResponse } from "next/server";

const neynar = new NeynarAPIClient({
  apiKey: process.env.NEYNAR_API_KEY!,
});

// In-memory cache
const cache = new Map<number, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Helper: Sleep between requests
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fids = searchParams.get("fids");

  try {
    if (!fids) {
      return NextResponse.json(
        { error: "fids parameter is required" },
        { status: 400 }
      );
    }

    const fid = parseInt(fids.split(",")[0]);

    // Check cache
    const cached = cache.get(fid);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        users: [cached.data],
        fromCache: true,
      });
    }

    // Fetch ALL casts with pagination
    let allCasts: any[] = [];
    let cursor: string | null | undefined = undefined;
    let pageCount = 0;
    const MAX_PAGES = 30; // Safety limit

    console.log(`Fetching all casts for FID: ${fid}`);

    do {
      try {
        const castsResponse = await neynar.fetchCastsForUser({
          fid: fid,
          limit: 150,
          cursor: cursor,
        });

        allCasts = allCasts.concat(castsResponse.casts);
        cursor = castsResponse.next?.cursor;
        pageCount++;

        console.log(`Page ${pageCount}: ${allCasts.length} total casts`);

        // Add delay to avoid rate limits
        if (cursor && pageCount < MAX_PAGES) {
          await sleep(1000); // 1 second delay
        }

        if (pageCount >= MAX_PAGES) {
          console.warn(`Reached max pages (${MAX_PAGES})`);
          break;
        }
      } catch (error: any) {
        if (error.status === 429) {
          console.warn(`Rate limited at page ${pageCount}`);
          break;
        }
        throw error;
      }
    } while (cursor);

    // Calculate stats
    let totalLikesReceived = 0;
    let totalRecastsReceived = 0;
    let totalCommentsReceived = 0;

    allCasts.forEach((cast) => {
      totalLikesReceived += cast.reactions?.likes_count || 0;
      totalRecastsReceived += cast.reactions?.recasts_count || 0;
      totalCommentsReceived += cast.replies?.count || 0;
    });

    const userData = {
      totalCasts: allCasts.length,
      totalLikesReceived,
      totalRecastsReceived,
      totalCommentsReceived,
      isComplete: !cursor,
    };

    // Cache result
    cache.set(fid, { data: userData, timestamp: Date.now() });

    console.log("Fetched user data:", userData);

    return NextResponse.json({
      users: [userData],
      fromCache: false,
    });
  } catch (error: any) {
    console.error("Error:", error);

    // Try to return cached data on error
    if (fids) {
      const fid = parseInt(fids.split(",")[0]);
      const cached = cache.get(fid);
      if (cached) {
        return NextResponse.json({
          users: [cached.data],
          fromCache: true,
          error: "Using cached data due to error",
        });
      }
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: error.status || 500 }
    );
  }
}
