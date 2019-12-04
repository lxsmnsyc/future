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
import { FutureTransformer } from '../transformer';
import { Predicate } from '../utils/types/function';
import Computation from '../computation';
import { WithUpstreamSubscription } from '../utils/subscriptions/with-upstream-subscription';

class FutureFilter<T> extends Future<T> {
  constructor(
    private upstream: Future<T>,
    private predicate: Predicate<T>,
  ) {
    super();
  }

  get(): Computation<T> {
    const computation = this.upstream.get();

    const subscription = new WithUpstreamSubscription(computation);

    const promise = new Promise<T>((resolve, reject) => {
      const res = (value: T) => !subscription.cancelled && resolve(value);
      const rej = (value: Error) => !subscription.cancelled && reject(value);

      computation.then(
        value => {
          if (subscription.cancelled) {
            return;
          }

          let result;
          try {
            result = this.predicate(value);
          } catch (err) {
            rej(err);
            subscription.cancel();
            return;
          }

          if (result) {
            res(value);
          }
        },
        (err) => {
          rej(err);
          subscription.cancel();
        },
      );
    });

    return new Computation<T>(promise, subscription);
  }
}

/**
 * Resolves the given Future if the resolved value passes the given predicate.
 * @param predicate 
 */
export default function filter<T>(predicate: Predicate<T>): FutureTransformer<T, T> {
  return (future: Future<T>): Future<T> => new FutureFilter<T>(future, predicate);
}