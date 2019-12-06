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

class FutureMerge<S extends Future<any>[]> extends Future<unknown> {
  constructor(
    private sources: S,
  ) {
    super();
  }

  get(): Computation<unknown> {
    const subscription = new CompositeSubscription();
    const main = new CompositeSubscription();

    main.add(subscription);

    const promise = new Promise<unknown>((resolve, reject) => {
      const res = () => !main.cancelled && resolve();
      const rej = (value: Error) => !main.cancelled && reject(value);

      let size = this.sources.length;

      this.sources.forEach((source) => {
        const computation = source.get();

        subscription.add(computation);
  
        computation.then(
          _ => {
            size -= 1;

            if (size === 0) {
              res();
            }
          },
          err => {
            rej(err);
            subscription.cancel();
          },
        )
      });
    });

    return new Computation<unknown>(promise, subscription);
  }
}

/**
 * Runs the [[Computation]] instances from the given array of [[Future]] instances
 * at the same time, resolving after all [[Computation]] has resolved, ignoring
 * their values.
 * 
 * ```typescript
 * const A = Future.timer('Hello', 500);
 * const B = Future.timer('World', 400);
 * 
 * Future.merge([A, B])
 *  .get()
 *  .then(console.log); // Resolves with an empty value after 500ms
 * ```
 * 
 * @category Constructors
 * @param other A [[Future]] instance
 * @typeparam S type of the Future array
 */
export default function merge<S extends Future<any>[]>(sources: S): Future<unknown> {
  return new FutureMerge<S>(sources);
}