/**
 * A utility class that delays the execution of a callback function until after a specified
 * delay period has elapsed since the last time it was invoked. This is useful for optimizing
 * performance by limiting the rate at which a function executes, such as handling rapid user
 * input events.
 *
 * The debouncer returns a Promise that resolves with the callback's return value or rejects
 * if the callback throws an error or if the debounced call is cancelled.
 *
 * @typeParam TArgs - Tuple type representing the callback function's parameter types
 * @typeParam TReturn - The return type of the callback function
 *
 * @example
 * ```typescript
 * // Basic usage with synchronous callback
 * const debouncer = new Debouncer((value: string) => {
 *   console.log('Search for:', value);
 *   return value.toUpperCase();
 * });
 *
 * const result = await debouncer.debounce(500, 'hello');
 * console.log(result); // 'HELLO'
 * ```
 *
 * @example
 * ```typescript
 * // Handling search input with async callback
 * const searchDebouncer = new Debouncer(async (query: string) => {
 *   const response = await fetch(`/api/search?q=${query}`);
 *   return response.json();
 * });
 *
 * inputElement.addEventListener('input', async (e) => {
 *   try {
 *     const results = await searchDebouncer.debounce(300, e.target.value);
 *     displayResults(results);
 *   } catch (error) {
 *     if (error.message !== 'Debounced call was cancelled') {
 *       console.error('Search failed:', error);
 *     }
 *   }
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Error handling
 * const debouncer = new Debouncer((value: number) => {
 *   if (value < 0) throw new Error('Value must be positive');
 *   return value * 2;
 * });
 *
 * try {
 *   await debouncer.debounce(500, -5);
 * } catch (error) {
 *   console.error('Callback error:', error.message);
 * }
 * ```
 *
 * @since 2025.9.0
 */
export class Debouncer<TArgs extends unknown[] = unknown[], TReturn = unknown> {
  /**
   * The timeout identifier for the pending debounced execution.
   * @internal
   */
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  /**
   * The promise handlers for the current debounced call.
   * @internal
   */
  private pendingPromise: {
    resolve: (value: TReturn) => void;
    reject: (error?: unknown) => void;
  } | null = null;

  /**
   * The callback function to be executed after the debounce delay.
   * This can be updated dynamically to change the debounced behavior.
   */
  public callback: (...args: TArgs) => TReturn;

  /**
   * Creates a new Debouncer instance with the specified callback function.
   *
   * @param callback - The function to debounce. Can be synchronous or asynchronous.
   *
   * @example
   * ```typescript
   * const debouncer = new Debouncer((x: number, y: number) => x + y);
   * ```
   */
  constructor(callback: (...args: TArgs) => TReturn) {
    this.callback = callback;
  }

  /**
   * Schedules the callback to execute after the specified delay. If called again before
   * the delay elapses, the previous call is cancelled and a new delay period begins.
   *
   * @param delay - The number of milliseconds to wait before executing the callback
   * @param args - Arguments to pass to the callback function
   *
   * @returns A Promise that resolves with the callback's return value or rejects if:
   *   - The callback throws an error
   *   - The debounced call is cancelled via `clear()` or another `debounce()` call
   *
   * @example
   * ```typescript
   * const debouncer = new Debouncer((text: string) => text.toUpperCase());
   *
   * // Only the last call executes after 500ms
   * debouncer.debounce(500, 'first');  // Cancelled
   * debouncer.debounce(500, 'second'); // Cancelled
   * const result = await debouncer.debounce(500, 'third'); // Executes
   * console.log(result); // 'THIRD'
   * ```
   */
  public debounce(delay: number, ...args: TArgs): Promise<TReturn> {
    this.clear();

    return new Promise((resolve, reject) => {
      this.pendingPromise = { resolve, reject };

      this.timeoutId = setTimeout(async () => {
        this.timeoutId = null;
        const promise = this.pendingPromise;
        this.pendingPromise = null;

        try {
          const result = await this.callback(...args);
          promise?.resolve(result);
        } catch (error) {
          promise?.reject(error);
        }
      }, delay);
    });
  }

  /**
   * Cancels any pending debounced execution. If a debounced callback is waiting to execute,
   * it will be cancelled and the associated Promise will reject with no error.
   *
   * This method is safe to call multiple times and can be called even when no execution
   * is pending.
   *
   * @example
   * ```typescript
   * const debouncer = new Debouncer(() => console.log('Execute'));
   *
   * const promise = debouncer.debounce(500);
   * debouncer.clear(); // Cancels the pending execution
   *
   * try {
   *   await promise;
   * } catch (error) {
   *   console.log('Execution was cancelled');
   * }
   * ```
   */
  public clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    // Reject pending promise if cleared before execution
    if (this.pendingPromise) {
      this.pendingPromise.reject();
      this.pendingPromise = null;
    }
  }

  /**
   * Indicates whether a debounced callback is currently waiting to execute.
   *
   * @returns `true` if a callback is scheduled to execute, `false` otherwise
   *
   * @example
   * ```typescript
   * const debouncer = new Debouncer(() => console.log('Execute'));
   *
   * console.log(debouncer.isPending); // false
   *
   * debouncer.debounce(500);
   * console.log(debouncer.isPending); // true
   *
   * await new Promise(resolve => setTimeout(resolve, 500));
   * console.log(debouncer.isPending); // false
   * ```
   */
  get isPending(): boolean {
    return this.timeoutId !== null;
  }
}

export default Debouncer;
