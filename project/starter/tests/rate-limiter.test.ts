import { describe, it, expect } from 'vitest';
import {
  RateLimiter,
  DEFAULT_RATE_LIMITS,
} from '../src/utils/rate-limiter';
 
describe('RateLimiter', () => {
  it('starts with no active requests', () => {
    const limiter = new RateLimiter();
 
    const status = limiter.getStatus();
 
    expect(status.activeRequests).toBe(0);
    expect(status.requestsInWindow).toBe(0);
    expect(status.tokensInWindow).toBe(0);
  });
 
  it('records a request when acquire is called', async () => {
    const limiter = new RateLimiter({
      maxConcurrent: 2,
    });
 
    await limiter.acquire(1000);
 
    const status = limiter.getStatus();
 
    expect(status.activeRequests).toBe(1);
    expect(status.requestsInWindow).toBe(1);
    expect(status.tokensInWindow).toBe(1000);
 
    limiter.release();
  });
 
  it('releases an active request', async () => {
    const limiter = new RateLimiter();
 
    await limiter.acquire(500);
 
    expect(limiter.getStatus().activeRequests).toBe(1);
 
    limiter.release();
 
    expect(limiter.getStatus().activeRequests).toBe(0);
  });
 
  it('updates token usage when actual tokens are provided on release', async () => {
    const limiter = new RateLimiter();
 
    await limiter.acquire(1000);
 
    limiter.release(750);
 
    expect(limiter.getStatus().tokensInWindow).toBe(750);
  });
 
  it('respects request and token limits', async () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 2,
      maxTokensPerMinute: 1000,
      maxConcurrent: 2,
    });
 
    expect(limiter.canProceed(500)).toBe(true);
 
    await limiter.acquire(500);
 
    expect(limiter.canProceed(500)).toBe(true);
 
    await limiter.acquire(500);
 
    expect(limiter.canProceed(1)).toBe(false);
 
    limiter.release();
    limiter.release();
  });
 
  it('uses the expected default rate limits', () => {
    expect(DEFAULT_RATE_LIMITS.maxRequestsPerMinute).toBe(50);
    expect(DEFAULT_RATE_LIMITS.maxTokensPerMinute).toBe(100000);
    expect(DEFAULT_RATE_LIMITS.maxConcurrent).toBe(5);
  });
});