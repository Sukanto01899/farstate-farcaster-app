// middleware/auth.ts
import { NextResponse, type NextRequest } from "next/server";
import { createClient, Errors } from "@farcaster/quick-auth";
import { consumeRateLimit } from "@/lib/api-rate-limit";

const client = createClient();

function getClientIp(request: NextRequest) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}

function requiresAuth(pathname: string) {
  if (pathname.startsWith("/api/signature/")) return true;
  if (pathname.startsWith("/api/ai/create-thumbnail")) return true;
  if (pathname.startsWith("/api/ai/create-cast")) return true;
  return false;
}

function isWebhookPath(pathname: string) {
  return (
    pathname.startsWith("/api/webhook") ||
    pathname.startsWith("/api/ai/subscription/webhook")
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1) Global rate limit for all API routes (fail-open).
  // Tune with env vars; defaults are conservative.
  const windowSeconds = Number(process.env.API_RATELIMIT_WINDOW_SECONDS || 60);
  const ipLimit = Number(process.env.API_RATELIMIT_MAX_PER_IP || 120);
  const webhookIpLimit = Number(
    process.env.API_RATELIMIT_WEBHOOK_MAX_PER_IP || 600
  );

  const clientIp = getClientIp(request);
  const ipResult = await consumeRateLimit({
    keyPrefix: "rl:api:ip",
    id: clientIp,
    limit: isWebhookPath(pathname) ? webhookIpLimit : ipLimit,
    windowSeconds,
  });

  if (!ipResult.ok) {
    const res = NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
    res.headers.set("Retry-After", String(ipResult.retryAfterSeconds));
    res.headers.set("X-RateLimit-Limit", String(ipResult.limit));
    res.headers.set("X-RateLimit-Remaining", "0");
    res.headers.set("X-RateLimit-Reset", String(ipResult.resetSeconds));
    return res;
  }

  // 2) Only enforce auth on the endpoints that expect x-fid.
  if (!requiresAuth(pathname)) {
    const res = NextResponse.next();
    res.headers.set("X-RateLimit-Limit", String(ipResult.limit));
    res.headers.set("X-RateLimit-Remaining", String(ipResult.remaining));
    res.headers.set("X-RateLimit-Reset", String(ipResult.resetSeconds));
    return res;
  }

  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    const deploymentDomain = process.env.DOMAIN || request.nextUrl.host;
    if (!deploymentDomain) {
      return NextResponse.json(
        { error: "Missing deployment domain" },
        { status: 500 }
      );
    }
    // console.log("Verifying token for domain:", deploymentDomain);
    const payload = await client.verifyJwt({
      token,
      domain: deploymentDomain,
    });
    // payload.sub = user FID
    // console.log("Authenticated FID:", payload);

    if (!payload.sub) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        {
          status: 401,
        }
      );
    }

    //add fid on header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-fid", payload.sub.toString());

    // Optional per-FID limiter for authenticated API traffic.
    const fidLimit = Number(process.env.API_RATELIMIT_MAX_PER_FID || 240);
    const fidResult = await consumeRateLimit({
      keyPrefix: "rl:api:fid",
      id: payload.sub.toString(),
      limit: fidLimit,
      windowSeconds,
    });

    if (!fidResult.ok) {
      const res = NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
      res.headers.set("Retry-After", String(fidResult.retryAfterSeconds));
      res.headers.set("X-RateLimit-Limit", String(fidResult.limit));
      res.headers.set("X-RateLimit-Remaining", "0");
      res.headers.set("X-RateLimit-Reset", String(fidResult.resetSeconds));
      return res;
    }

    const res = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    res.headers.set("X-RateLimit-Limit", String(fidResult.limit));
    res.headers.set("X-RateLimit-Remaining", String(fidResult.remaining));
    res.headers.set("X-RateLimit-Reset", String(fidResult.resetSeconds));
    return res;
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    // thow other errors
    console.error("Auth middleware error:", e);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
}

// middleware  route matcher
export const config = {
  matcher: ["/api/:path*"],
};
