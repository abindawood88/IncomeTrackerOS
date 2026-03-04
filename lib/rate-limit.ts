export type RateLimitConfig = {
  limit: number;
  windowMs: number;
  prefix?: string;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  source: "redis" | "memory";
};

type MemoryBucket = {
  count: number;
  resetAt: number;
};

const memoryBuckets = new Map<string, MemoryBucket>();
const MAX_BUCKETS = 10_000;

function cleanupMemoryBuckets(now: number): void {
  for (const [key, bucket] of memoryBuckets) {
    if (now >= bucket.resetAt) {
      memoryBuckets.delete(key);
    }
  }

  if (memoryBuckets.size <= MAX_BUCKETS) return;

  const overflow = memoryBuckets.size - MAX_BUCKETS;
  let removed = 0;
  for (const key of memoryBuckets.keys()) {
    memoryBuckets.delete(key);
    removed += 1;
    if (removed >= overflow) break;
  }
}

export function checkMemoryRateLimit(
  key: string,
  config: RateLimitConfig,
  now = Date.now(),
): RateLimitResult {
  cleanupMemoryBuckets(now);

  const scopedKey = `${config.prefix ?? "rate"}:${key}`;
  const bucket = memoryBuckets.get(scopedKey);

  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + config.windowMs;
    memoryBuckets.set(scopedKey, { count: 1, resetAt });
    return {
      allowed: true,
      limit: config.limit,
      remaining: Math.max(config.limit - 1, 0),
      resetAt,
      source: "memory",
    };
  }

  if (bucket.count >= config.limit) {
    return {
      allowed: false,
      limit: config.limit,
      remaining: 0,
      resetAt: bucket.resetAt,
      source: "memory",
    };
  }

  bucket.count += 1;
  memoryBuckets.set(scopedKey, bucket);

  return {
    allowed: true,
    limit: config.limit,
    remaining: Math.max(config.limit - bucket.count, 0),
    resetAt: bucket.resetAt,
    source: "memory",
  };
}

async function callRedis(command: unknown[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 800);
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([command]),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) return null;
    const payload = (await res.json()) as Array<{ result?: unknown; error?: string }>;
    const first = payload?.[0];
    if (!first || first.error) return null;
    return first.result ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function checkRedisRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult | null> {
  const scopedKey = `${config.prefix ?? "rate"}:${key}`;
  const incr = await callRedis(["INCR", scopedKey]);
  if (typeof incr !== "number") return null;

  if (incr === 1) {
    await callRedis(["PEXPIRE", scopedKey, config.windowMs]);
  }

  const ttl = await callRedis(["PTTL", scopedKey]);
  const ttlMs = typeof ttl === "number" && ttl > 0 ? ttl : config.windowMs;
  const resetAt = Date.now() + ttlMs;

  return {
    allowed: incr <= config.limit,
    limit: config.limit,
    remaining: Math.max(config.limit - incr, 0),
    resetAt,
    source: "redis",
  };
}

export async function checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const redisResult = await checkRedisRateLimit(key, config);
  if (redisResult) return redisResult;
  return checkMemoryRateLimit(key, config);
}
