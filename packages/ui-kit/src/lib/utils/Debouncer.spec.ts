import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Debouncer } from './Debouncer';

describe('Debouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('debounce', () => {
    it('should call the callback after the specified delay', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      debouncer.debounce(500);

      expect(callback).not.toHaveBeenCalled();
      expect(debouncer.isPending).toBe(true);

      vi.advanceTimersByTime(500);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(debouncer.isPending).toBe(false);
    });

    it('should pass arguments to the callback', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      debouncer.debounce(500, 'arg1', 42, { key: 'value' });

      vi.advanceTimersByTime(500);

      expect(callback).toHaveBeenCalledWith('arg1', 42, { key: 'value' });
    });

    it('should reset the timer when called multiple times', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      debouncer.debounce(500).catch(() => {
        /* Expected cancellation */
      });
      vi.advanceTimersByTime(200);

      debouncer.debounce(500).catch(() => {
        /* Expected cancellation */
      });
      vi.advanceTimersByTime(200);

      debouncer.debounce(500);
      vi.advanceTimersByTime(200);

      expect(callback).not.toHaveBeenCalled();
      expect(debouncer.isPending).toBe(true);

      vi.advanceTimersByTime(300);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(debouncer.isPending).toBe(false);
    });

    it('should only call the callback once with the last arguments', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      debouncer.debounce(500, 'first').catch(() => {
        /* Expected cancellation */
      });
      vi.advanceTimersByTime(200);

      debouncer.debounce(500, 'second').catch(() => {
        /* Expected cancellation */
      });
      vi.advanceTimersByTime(200);

      debouncer.debounce(500, 'third');
      vi.advanceTimersByTime(500);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('third');
    });

    it('should handle multiple debounce cycles', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      debouncer.debounce(500, 'first');
      vi.advanceTimersByTime(500);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('first');

      debouncer.debounce(500, 'second');
      vi.advanceTimersByTime(500);

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith('second');
    });

    it('should work with different delay values', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      debouncer.debounce(100);
      vi.advanceTimersByTime(99);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);

      debouncer.debounce(1000);
      vi.advanceTimersByTime(999);
      expect(callback).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should handle zero delay', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      debouncer.debounce(0);

      expect(callback).not.toHaveBeenCalled();
      expect(debouncer.isPending).toBe(true);

      vi.advanceTimersByTime(0);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(debouncer.isPending).toBe(false);
    });
  });

  describe('clear', () => {
    it('should cancel a pending debounced callback', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      debouncer.debounce(500).catch(() => {
        /* Expected cancellation */
      });
      expect(debouncer.isPending).toBe(true);

      debouncer.clear();
      expect(debouncer.isPending).toBe(false);

      vi.advanceTimersByTime(500);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should be safe to call when no timeout is pending', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      expect(() => debouncer.clear()).not.toThrow();
      expect(debouncer.isPending).toBe(false);
    });

    it('should be safe to call multiple times', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      debouncer.debounce(500).catch(() => {
        /* Expected cancellation */
      });
      debouncer.clear();
      debouncer.clear();
      debouncer.clear();

      expect(debouncer.isPending).toBe(false);
      expect(() => debouncer.clear()).not.toThrow();
    });

    it('should clear after callback execution', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      debouncer.debounce(500);
      vi.advanceTimersByTime(500);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(debouncer.isPending).toBe(false);

      debouncer.clear();
      expect(debouncer.isPending).toBe(false);
    });
  });

  describe('isPending', () => {
    it('should return true when a timeout is pending', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      expect(debouncer.isPending).toBe(false);

      debouncer.debounce(500);
      expect(debouncer.isPending).toBe(true);
    });

    it('should return false after the callback is executed', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      debouncer.debounce(500);
      expect(debouncer.isPending).toBe(true);

      vi.advanceTimersByTime(500);
      expect(debouncer.isPending).toBe(false);
    });

    it('should return false after clear is called', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      debouncer.debounce(500).catch(() => {
        /* Expected cancellation */
      });
      expect(debouncer.isPending).toBe(true);

      debouncer.clear();
      expect(debouncer.isPending).toBe(false);
    });

    it('should reflect the state accurately through multiple debounce calls', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      expect(debouncer.isPending).toBe(false);

      debouncer.debounce(500).catch(() => {
        /* Expected cancellation */
      });
      expect(debouncer.isPending).toBe(true);

      debouncer.debounce(500);
      expect(debouncer.isPending).toBe(true);

      vi.advanceTimersByTime(500);
      expect(debouncer.isPending).toBe(false);

      debouncer.debounce(500);
      expect(debouncer.isPending).toBe(true);
    });
  });

  describe('callback property', () => {
    it('should allow updating the callback', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const debouncer = new Debouncer(callback1);

      debouncer.debounce(500).catch(() => {
        /* Ignored */
      });

      debouncer.callback = callback2;

      vi.advanceTimersByTime(500);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should use the updated callback in subsequent debounce calls', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const debouncer = new Debouncer(callback1);

      debouncer.callback = callback2;
      debouncer.debounce(500);

      vi.advanceTimersByTime(500);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('promise-based return values and error handling', () => {
    it('should return a promise that resolves with callback return value', async () => {
      const callback = vi.fn(() => 'return value');
      const debouncer = new Debouncer(callback);

      const promise = debouncer.debounce(500);

      vi.advanceTimersByTime(500);

      const result = await promise;
      expect(result).toBe('return value');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should return a promise that rejects when callback throws', async () => {
      const callback = vi.fn(() => {
        throw new Error('Test error');
      });
      const debouncer = new Debouncer(callback);

      const promise = debouncer.debounce(500);

      vi.advanceTimersByTime(500);

      await expect(promise).rejects.toThrow('Test error');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle async callbacks and resolve with their result', async () => {
      const callback = vi.fn(async () => {
        return Promise.resolve('async result');
      });
      const debouncer = new Debouncer(callback);

      const promise = debouncer.debounce(500);

      vi.advanceTimersByTime(500);

      const result = await promise;
      expect(result).toBe('async result');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle async callbacks that reject', async () => {
      const callback = vi.fn(async () => {
        return Promise.reject(new Error('Async error'));
      });
      const debouncer = new Debouncer(callback);

      const promise = debouncer.debounce(500);

      vi.advanceTimersByTime(500);

      await expect(promise).rejects.toThrow('Async error');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should reject promise when cleared before execution', async () => {
      const callback = vi.fn(() => 'value');
      const debouncer = new Debouncer(callback);

      const promise = debouncer.debounce(500);

      debouncer.clear();

      await expect(promise).rejects.toThrow('Debounced call was cancelled');
      expect(callback).not.toHaveBeenCalled();
    });

    it('should reject previous promise when debounce is called again', async () => {
      const callback = vi.fn((x: string) => x);
      const debouncer = new Debouncer(callback);

      const promise1 = debouncer.debounce(500, 'first');
      vi.advanceTimersByTime(200);

      const promise2 = debouncer.debounce(500, 'second');

      vi.advanceTimersByTime(500);

      await expect(promise1).rejects.toThrow('Debounced call was cancelled');
      await expect(promise2).resolves.toBe('second');
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('second');
    });

    it('should handle multiple sequential promises', async () => {
      const callback = vi.fn((x: number) => x * 2);
      const debouncer = new Debouncer(callback);

      const promise1 = debouncer.debounce(500, 5);
      vi.advanceTimersByTime(500);
      const result1 = await promise1;

      const promise2 = debouncer.debounce(500, 10);
      vi.advanceTimersByTime(500);
      const result2 = await promise2;

      expect(result1).toBe(10);
      expect(result2).toBe(20);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should pass arguments correctly in promise-based calls', async () => {
      const callback = vi.fn((a: string, b: number, c: boolean) => ({ a, b, c }));
      const debouncer = new Debouncer(callback);

      const promise = debouncer.debounce(500, 'test', 42, true);

      vi.advanceTimersByTime(500);

      const result = await promise;
      expect(result).toEqual({ a: 'test', b: 42, c: true });
      expect(callback).toHaveBeenCalledWith('test', 42, true);
    });
  });

  describe('edge cases', () => {
    it('should handle callbacks that throw errors (backward compatibility)', () => {
      const callback = vi.fn(() => {
        throw new Error('Test error');
      });
      const debouncer = new Debouncer(callback);

      debouncer.debounce(500).catch(() => {
        /* Expected error */
      });

      // The promise will catch the error, so this won't throw
      vi.advanceTimersByTime(500);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(debouncer.isPending).toBe(false);
    });

    it('should handle callbacks that return values (backward compatibility)', () => {
      const callback = vi.fn(() => 'return value');
      const debouncer = new Debouncer(callback);

      debouncer.debounce(500);
      vi.advanceTimersByTime(500);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveReturnedWith('return value');
    });

    it('should handle very long delays', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      debouncer.debounce(1000000);
      expect(debouncer.isPending).toBe(true);

      vi.advanceTimersByTime(999999);
      expect(callback).not.toHaveBeenCalled();
      expect(debouncer.isPending).toBe(true);

      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(debouncer.isPending).toBe(false);
    });

    it('should handle complex argument types', () => {
      const callback = vi.fn();
      const debouncer = new Debouncer(callback);

      const complexArgs = [
        { nested: { object: true } },
        [1, 2, 3],
        new Map([['key', 'value']]),
        new Set([1, 2, 3]),
        null,
        undefined,
      ];

      debouncer.debounce(500, ...complexArgs);
      vi.advanceTimersByTime(500);

      expect(callback).toHaveBeenCalledWith(...complexArgs);
    });
  });
});
