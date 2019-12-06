/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */
import Future from '../future';
import Computation from '../computation';
import BooleanSubscription from '../utils/subscriptions/boolean-subscription';
import { FutureTransformer } from '../transformer';

class FutureCache<T> extends Future<T> {
  private computation?: Computation<T>;

  constructor(private future: Future<T>) {
    super();
  }

  get(): Computation<T> {
    if (!this.computation) {
      this.computation = this.future.get();
    }

    const subscription = new BooleanSubscription();

    const promise = new Promise<T>((resolve, reject) => {
      if (this.computation) {
        this.computation.then(
          value => !subscription.cancelled && resolve(value),
          error => !subscription.cancelled && reject(error),
        );
      }
    });

    return new Computation<T>(promise, subscription);
  }
}

/**
 * Caches the initial computed value for the [[Future]] instance.
 * 
 * ```typescript
 * // Create a Future
 * const delayedHello = Future.timer('Hello', 500);
 * 
 * // Transform into a cached Future
 * const cached = delayedHello.compose(Future.cache());
 * 
 * // Perform the initial computation
 * cached.get().then(console.log);
 * 
 * // Try performing another computation
 * setTimeout(() => {
 *  cached.get().then(console.log); // resolves without delay
 * }, 550);
 * ```
 * 
 * @category Transformers
 */
export default function cache<T>(): FutureTransformer<T, T> {
  return (future: Future<T>): Future<T> => new FutureCache<T>(future);
}