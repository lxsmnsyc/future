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
import CompositeSubscription from '../utils/subscriptions/composite-subscription';

class FutureConcat extends Future<any> {
  constructor(
    private sources: Future<any>[],
  ) {
    super();
  }

  get(): Computation<any> {
    const subscription = new CompositeSubscription();

    const promise = new Promise<any>((resolve, reject) => {
      const res = (value: any) => !subscription.cancelled && resolve(value);
      const rej = (value: Error) => !subscription.cancelled && reject(value);

      let current = 0;

      const register = () => {
        const computation = this.sources[current].get();

        subscription.add(computation);

        computation.then(
          value => {
            subscription.remove(computation);
            current += 1;

            if (current < this.sources.length) {
              register();
            } else {
              res(value);
            }
          },
          err => {
            rej(err);
            subscription.cancel();
          },
        );
      };

      register();
    });

    return new Computation<any>(promise, subscription);
  }
}

/**
 * Concatenates the [[Computation]] instance provided by an array of
 * [[Future]] instances into a single [[Computation]], and resolves to
 * last concatenated instance.
 *
 * ```typescript
 * const A = Future.timer('Hello', 500);
 * const B = Future.timer('World', 400);
 * 
 * Future.concat([A, B])
 *  .get()
 *  .then(console.log); // World after 900s
 * ```
 * @category Transformers
 * @typeparam T computed value for the given [[Future]] instance
 * @param futures an Array of [[Future]] instances
 */
export default function concat<T extends Future<any>[]>(sources: T): Future<any> {
  return new FutureConcat(sources);
}