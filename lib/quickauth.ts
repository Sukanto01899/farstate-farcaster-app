import { Errors, createClient } from "@farcaster/quick-auth";
import type { NextRequest } from "next/server";

const client = createClient();

function getQuickAuthDomain(request: NextRequest): string {
  if (process.env.QUICK_AUTH_DOMAIN) return process.env.QUICK_AUTH_DOMAIN;
  if (process.env.DOMAIN) return process.env.DOMAIN;

  const publicUrl = process.env.NEXT_PUBLIC_URL;
  if (publicUrl) {
    try {
      return new URL(publicUrl).host;
    } catch {
      // ignore malformed env
    }
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) return forwardedHost;

  const host = request.headers.get("host");
  if (host) return host;

  return "miniapps.farcaster.xyz";
}

export async function requireQuickAuthFid(
  request: NextRequest
): Promise<number> {
  const authorization =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new Errors.InvalidTokenError("Missing bearer token");
  }

  const token = authorization.slice("Bearer ".length).trim();
  const payload = await client.verifyJwt({
    token,
    domain: getQuickAuthDomain(request),
  });

  return Number(payload.sub);
}
