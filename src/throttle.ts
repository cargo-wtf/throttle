import type { Middleware, Next } from "cargo/middleware/middleware.ts";
import type { RequestContext } from "cargo/http/request.ts";
import type { RateLimitCache } from "./cache.ts";
import { RateLimit } from "./ratelimit.ts";
import { HttpException } from "cargo/http/exceptions/http-exception.ts";
import { HttpStatus } from "cargo/http/http-status.ts";

type IdProvider = (ctx: RequestContext) => string;

interface ThrottleConfig {
  idProvider: IdProvider;
  cacheProvider?: RateLimitCache;
  timeframe?: number;
  limit?: number;
}

export function Throttle(options: ThrottleConfig): Middleware {
  const rateLimiter = new RateLimit(options);
  return async (ctx: RequestContext, next: Next) => {
    const block = await rateLimiter.limit(options.idProvider(ctx));
    if (block) {
      // TODO: Change to proper http status (`HttpsStatus.TOO_MANY_REQUEST`) as soon cargo core is updated.
      throw new HttpException("Too many request", HttpStatus.BAD_REQUEST);
    }
    return next(ctx);
  };
}
