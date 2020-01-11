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
import CompositeSubscription from '../utils/subscriptions/composite-subscription';

class FutureAndThen<T> extends Future<T> {
  constructor(
    private future: Future<any>,
    private other: Future<T>,
  ) {
    super();
  }

  get(): Computation<T> {
    const subscription = new CompositeSubscription();

    const promise = new Promise<T>(async (resolve, reject) => {
      const res = (value: T) => !subscription.cancelled && resolve(value);

      const computationA = this.future.get();

      subscription.add(computationA);

      try {
        await computationA;
        subscription.remove(computationA);
        const computationB = this.other.get();
        subscription.add(computationB);
        res(await computationB);
      } catch (err) {
        reject(err);
        subscription.cancel();
      }
    });

    return new Computation<T>(promise, subscription);
  }
}

/**
 * Computes and ignores the composed [[Future]] instance and
 * then resolves to the given [[Future]] instance after the computation.
 * 
 * Example below resolves the `amb` instance to B as it its faster than A.
 *
 * ```typescript
 * const A = Future.timer('Hello', 500);
 * const B = Future.timer('World', 400);
 * 
 * A.compose(Future.andThen(B))
 *  .get()
 *  .then(console.log); // World after 900s
 * ```
 * @category Transformers
 * @typeparam T computed value for the given [[Future]] instance
 * @param futures an Array of [[Future]] instances
 */
export default function andThen<T>(other: Future<T>): FutureTransformer<any, T> {
  return (future: Future<any>): Future<T> => new FutureAndThen<T>(future, other);
}