import { InMemoryCache } from "./cache.ts";

Deno.test(InMemoryCache.name, async (t) => {
  await t.step("should return timeframe count", async () => {
    let count = 0;
    const cache = new InMemoryCache();
    const start = Date.now();
    while (count < 1000) {
      await cache.count(`${count}`, 100);
      count++;
      let innerCount = 0;
      while (innerCount < 100) {
        await cache.count(`${count}`, 100);
        innerCount++;
      }
    }

    console.log("Time elapsed", Date.now() - start);

    await sleep(50);

    console.log(await cache.count("sdfdsf", 100));

    await sleep(950);

    console.log(await cache.count("sdfdsf", 100));
  });
});

function sleep(time: number) {
  return new Promise<true>((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}
