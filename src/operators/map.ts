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
import Computation from '../computation';
import { Function } from '../utils/types/function';
import WithUpstreamSubscription from '../utils/subscriptions/with-upstream-subscription';


class FutureMap<T, R> extends Future<R> {
  constructor(
    private upstream: Future<T>,
    private mapper: Function<T, R>,
  ) {
    super();
  }

  get(): Computation<R> {
    const computation = this.upstream.get();

    const subscription = new WithUpstreamSubscription(computation);

    const promise = new Promise<R>((resolve, reject) => {
      const res = (value: R) => !subscription.cancelled && resolve(value);
      const rej = (value: Error) => !subscription.cancelled && reject(value);

      computation.then(
        value => {
          if (!subscription.cancelled) {
            let result;
            try {
              result = this.mapper(value);
            } catch (err) {
              rej(err);
              subscription.cancel();
              return;
            }

            res(result);
          }
        },
        (err) => {
          rej(err);
          subscription.cancel();
        },
      );
    })

    return new Computation<R>(promise, subscription);
  }
}

/**
 * Transforms the resolved value of the given [[Future]].
 * 
 * ```typescript
 * const A = Future.timer('Hello', 500);
 * 
 * const greeting = A.compose(Future.map(value => `${value} World`));
 * 
 * greeting.get().then(console.log); // Hello World
 * ```
 * @category Transformers
 * @param mapper a function that transforms the resolved value
 * @typeparam T type of the received computed value
 * @typeparam R type of the resulting computed value from the transformer function
 */
export default function map<T, R>(mapper: Function<T, R>): FutureTransformer<T, R> {
  return (future: Future<T>): Future<R> => new FutureMap<T, R>(future, mapper);
}