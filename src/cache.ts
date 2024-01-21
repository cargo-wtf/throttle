export interface RateLimitCache {
  count(
    id: string,
    timeframe: number,
  ): Promise<number>;
}

type RateLimitEntry = number[];

export class InMemoryCache implements RateLimitCache {
  #cache = new Map<string, RateLimitEntry>();
  #lastReset: number = Date.now();

  count(id: string, timeframe: number): Promise<number> {
    let count = 0;
    const now = Date.now();

    // Get timestamp count for the requested id;
    const entry = this.#cache.get(id);

    // If timestamp count exists find the timestamps in the current timeframe
    if (entry) {
      const timestamps = [
        ...entry.filter((timestamp) => now - timestamp <= timeframe),
        now,
      ];

      count = timestamps.length;
      this.#cache.set(id, timestamps);
    } else {
      this.#cache.set(id, [Date.now()]);
      count = 1;
    }

    if (this.#lastReset <= now - 1000) {
      this.#cleanup(now, timeframe);
      this.#lastReset = Date.now();
    }

    return Promise.resolve(count);
  }

  #cleanup(now: number, timeframe: number): void {
    for (const [key, entry] of this.#cache.entries()) {
      const timestamps = entry.filter((timestamp) =>
        timestamp >= now - timeframe
      );
      if (timestamps.length) {
        this.#cache.set(key, timestamps);
        continue;
      }
      this.#cache.delete(key);
    }
  }
}
