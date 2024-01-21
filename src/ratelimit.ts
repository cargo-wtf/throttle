import { InMemoryCache, RateLimitCache } from "./cache.ts";

interface RateLimitConfig {
  timeframe?: number;
  limit?: number;
  cacheProvider?: RateLimitCache;
}

export class RateLimit {
  #config: {
    timeframe: number;
    limit: number;
    cacheProvider: RateLimitCache;
  } = {
    timeframe: 1000,
    limit: 50,
    cacheProvider: new InMemoryCache(),
  };

  constructor(config?: RateLimitConfig) {
    this.#config = {
      ...this.#config,
      ...config,
    };
  }

  async limit(id: string): Promise<boolean> {
    const count = await this.#config.cacheProvider.count(
      id,
      this.#config.timeframe,
    );
    if (count >= this.#config.limit) {
      return true;
    }
    return false;
  }
}
