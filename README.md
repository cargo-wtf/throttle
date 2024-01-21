# Cargo Throttle – Rate Limit your Cargo Application

## Overview

This module provides a rate limiting middleware for Cargo applications. The
middleware limits the number of requests a client can make within a specified
timeframe. It works by maintaining a cache of request timestamps for each client
and blocking further requests if the client has exceeded the limit.

## Usage

To use the Throttle middleware, you need to provide it with a configuration
object that specifies the following options:

```ts
type RateLimitConfig = {
  idProvider: IdProvider;
  cacheProvider?: RateLimitCache;
  timeframe?: number;
  limit?: number;
};
```

- `idProvider`: A function that returns a unique identifier for each request.
  This identifier will be used to store the request timestamp in the cache.
- `cacheProvider`: (Optional) An implementation of the RateLimitCache interface.
  Defaults to an in-memory cache.
- `timeframe`: (Optional) The duration of the time frame in milliseconds.
  Defaults to 1000 milliseconds (one second).
- `limit`: (Optional) The maximum number of requests allowed within the time
  frame. Defaults to 50.

  Here's an example of how to use the Throttle middleware:

```ts
import { Throttle } from "./throttle";

app.use(Throttle({ idProvider: (ctx) => ctx.request.userID }));
```

### RateLimiter Class

The RateLimiter class is responsible for managing the rate limiting logic. It
takes a RateLimitConfig object as its constructor argument.

```ts
class RateLimiter {
  constructor(config: RateLimitConfig);

  async limit(id: string): Promise<boolean>;
}
```

#### Methods

- `limit(id: string): Promise<boolean>: Checks if the number of requests for the
  given id within the time frame has exceeded the limit. If so, it returns true.
  Otherwise, it returns false.

### InMemoryCache Class

The `InMemoryCache` class implements the RateLimitCache interface and provides
an in-memory implementation for storing request timestamps.

#### Methods

- `count(id: string, timeFrame: number): Promise<number>`: Returns the number of
  requests for the given id within the time frame. If no requests have been made
  for that id within the time frame, it returns 0.

## Key Considerations

- The Throttle middleware is designed to protect your application from
  denial-of-service attacks by limiting the number of requests from a single
  client.
- The InMemoryCache class is a simple and efficient way to store request
  timestamps in memory.
