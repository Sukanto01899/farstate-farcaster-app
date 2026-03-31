import { Redis } from "@upstash/redis";

type RateLimitConfig = {
  keyPrefix: string;
  id: string;
  limit: number;
  windowSeconds: number;
};

export type RateLimitResult =
  | {
      ok: true;
      limit: number;
      remaining: number;
      resetSeconds: number;
    }
  | {
      ok: false;
      limit: number;
      remaining: 0;
      resetSeconds: number;
      retryAfterSeconds: number;
    };

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function secondsUntilWindowReset(windowSeconds: number) {
  const n = nowSeconds();
  const mod = n % windowSeconds;
  return windowSeconds - mod;
}

/**
 * Fixed-window rate limit.
 * - Uses an incrementing counter per {keyPrefix}:{id}:{windowBucket}
 * - TTL is set on first hit so old buckets expire
 * - Fail-open on Redis errors
 */
export async function consumeRateLimit({
  keyPrefix,
  id,
  limit,
  windowSeconds,
}: RateLimitConfig): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return {
      ok: true,
      limit,
      remaining: limit,
      resetSeconds: secondsUntilWindowReset(windowSeconds),
    };
  }

  const redis = new Redis({ url, token });
  if (!id || id === "unknown") {
    return {
      ok: true,
      limit,
      remaining: limit,
      resetSeconds: secondsUntilWindowReset(windowSeconds),
    };
  }

  const resetSeconds = secondsUntilWindowReset(windowSeconds);
  const bucket = Math.floor(nowSeconds() / windowSeconds);
  const key = `${keyPrefix}:${id}:${bucket}`;

  try {
    const current = await redis.incr(key);
    if (current === 1) {
      // Keep a little longer than the window to tolerate clock skew.
      await redis.expire(key, windowSeconds * 2);
    }

    if (current > limit) {
      return {
        ok: false,
        limit,
        remaining: 0,
        resetSeconds,
        retryAfterSeconds: resetSeconds,
      };
    }

    return {
      ok: true,
      limit,
      remaining: Math.max(0, limit - current),
      resetSeconds,
    };
  } catch {
    // Redis unavailable; do not take the API down.
    return {
      ok: true,
      limit,
      remaining: limit,
      resetSeconds,
    };
  }
}
