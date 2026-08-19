# Add Rate Limiting using Upstash Redis

This plan details the steps to implement rate limiting for your Next.js application. We will use Next.js Middleware along with Upstash Redis, which is the industry standard for serverless rate limiting.

## User Review Required

> [!IMPORTANT]
> **Environment Variables Required**
> You will need to create a free account at [Upstash](https://upstash.com/), create a Redis database, and obtain your `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. These will need to be added to your `.env.local` file and your production hosting environment (e.g., Vercel).
> Are you comfortable setting up an Upstash account for this?

## Open Questions

> [!WARNING]
> **Rate Limit Thresholds**
> I am proposing the following default limits:
> - **Payment API (`/api/cashfree`)**: 5 requests per minute per IP (strict)
> - **Other APIs (`/api/*`)**: 30 requests per minute per IP
> Do these limits sound reasonable for your use case, or would you like to adjust them?

## Proposed Changes

### Configuration and Dependencies
We will install the necessary packages for rate limiting.

#### [NEW] Dependencies
- Install `@upstash/ratelimit`
- Install `@upstash/redis`

---

### Core Middleware

#### [NEW] `src/middleware.ts`
Create a new Next.js middleware file to intercept incoming requests before they reach your API routes.
- Initialize the Upstash Redis client.
- Create distinct rate limiters (e.g., one strict limiter for payments, one general limiter for other APIs).
- Extract the user's IP address from the request headers (`x-forwarded-for` or `x-real-ip`).
- Apply the appropriate rate limit based on the URL path.
- Return a `429 Too Many Requests` response if the limit is exceeded.

#### [MODIFY] `.env.local`
- We will add placeholder environment variables for `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` which you will need to fill in.

## Verification Plan

### Manual Verification
1. I will provide you with a temporary script or curl commands to simulate multiple rapid requests to your `/api/cashfree` endpoint.
2. We will verify that after 5 requests within a minute, the server correctly responds with a `429 Too Many Requests` status code and stops processing.
3. We will verify that normal browsing is unaffected.
