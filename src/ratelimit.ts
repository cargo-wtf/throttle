import { InMemoryCache, RateLimitCache } from "./cache.ts";

interface RateLimitConfig {
  timeFrame?: number;
  limitCount?: number;
  cacheProvider?: RateLimitCache;
}

export class RateLimit {
  #config: {
    timeFrame: number;
    limitCount: number;
    cacheProvider: RateLimitCache;
  } = {
    timeFrame: 1000,
    limitCount: 50,
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
      this.#config.timeFrame,
    );
    if (count >= this.#config.limitCount) {
      return true;
    }
    return false;
  }
}
