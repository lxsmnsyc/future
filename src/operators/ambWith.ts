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
import CompositeSubscription from '../utils/subscriptions/composite-subscription';
import Computation from '../computation';

/**
 * @ignore
 */
class FutureAmbWith<T> extends Future<T> {
  constructor(private future: Future<T>, private other: Future<T>) {
    super();
  }

  get(): Computation<T> {
    const subscription = new CompositeSubscription();
    const main = new CompositeSubscription();

    main.add(subscription);

    const promise = new Promise<T>((resolve, reject) => {
      const res = (value: T) => !main.cancelled && resolve(value);

      const computationA = this.future.get();
      const computationB = this.other.get();
  
      subscription.add(computationA);
      subscription.add(computationB); 

      computationA.then(
        value => {
          main.remove(subscription);
          main.add(computationA);
          res(value);
          subscription.remove(computationA);
          subscription.cancel();
        },
        error => {
          reject(error);
          subscription.cancel();
        },
      );

      computationB.then(
        value => {
          main.remove(subscription);
          main.add(computationB);
          res(value);
          subscription.remove(computationB);
          subscription.cancel();
        },
        error => {
          reject(error);
          subscription.cancel();
        },
      );
    });

    return new Computation<T>(promise, main);
  }
}

/**
 * Resolves the [[Computation]] instance to the fastest given [[Future]]. 
 * 
 * Example below resolves the `ambWith` instance to B as it its faster than A.
 *
 * ```typescript
 * const A = Future.timer('Hello', 500);
 * const B = Future.timer('World', 400);
 * 
 * A.compose(Future.ambWith(B))
 *  .get()
 *  .then(console.log); // World
 * ```
 * @category Transformers
 * @typeparam T Type of the computed value
 * @param other a [[Future]] instance to race with.
 */
export default function ambWith<T>(other: Future<T>): FutureTransformer<T, T> {
  return (future: Future<T>): Future<T> => new FutureAmbWith<T>(future, other);
}