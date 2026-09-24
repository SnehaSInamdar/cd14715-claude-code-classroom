import { describe, it, expect } from 'vitest';
import { withRetry, withTimeout } from '../src/utils/error-handler';
 
describe('Error handling utilities', () => {
  it('retries transient failures and eventually succeeds', async () => {
    let attempts = 0;
 
    const result = await withRetry(
      async () => {
        attempts++;
 
        if (attempts < 2) {
          throw new Error('temporary failure');
        }
 
        return 'ok';
      },
      2,
      1
    );
 
    expect(result).toBe('ok');
    expect(attempts).toBe(2);
  });
 
  it('times out long-running operations', async () => {
    await expect(
      withTimeout(
        () => new Promise(resolve => setTimeout(resolve, 50)),
        5
      )
    ).rejects.toThrow();
  });
});
 