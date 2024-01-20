export interface RateLimitCache {
  count(
    id: string,
    timeFrame: number,
  ): Promise<number>;
}

type RateLimitEntry = number[];

export class InMemoryCache implements RateLimitCache {
  #cache = new Map<string, RateLimitEntry>();
  #lastReset: number = Date.now();

  count(id: string, timeFrame: number): Promise<number> {
    let count = 0;
    const now = Date.now();

    // Get get count entry for the requested id;
    const entry = this.#cache.get(id);

    // If count is found
    if (entry) {
      const timestamps = [
        ...entry.filter((timestamp) => now - timestamp <= timeFrame),
        now,
      ];

      count = timestamps.length + 1;
      this.#cache.set(id, [...entry, now]);
    } else {
      this.#cache.set(id, [Date.now()]);
      count = 1;
    }

    if (this.#lastReset <= now - 1000) {
      this.#cleanup(now, timeFrame);
      this.#lastReset = Date.now();
    }

    return Promise.resolve(count);
  }

  #cleanup(now: number, timeFrame: number): void {
    for (const [key, entry] of this.#cache.entries()) {
      const timestamps = entry.filter((timestamp) =>
        timestamp >= now - timeFrame
      );
      if (timestamps.length) {
        this.#cache.set(key, timestamps);
        continue;
      }
      this.#cache.delete(key);
    }
  }
}
