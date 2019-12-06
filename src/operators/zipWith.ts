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
import { Function2 } from '../utils/types/function';

/**
 * @ignore
 */
interface Value<T> {
  value: T,
}

/**
 * @ignore
 */
class FutureZipWith<A, B, R> extends Future<R> {
  constructor(
    private future: Future<A>,
    private other: Future<B>,
    private zipper: Function2<A, B, R>,
  ) {
    super();
  }

  get(): Computation<R> {
    const subscription = new CompositeSubscription();
    const main = new CompositeSubscription();

    main.add(subscription);

    const promise = new Promise<R>((resolve, reject) => {
      const res = (value: R) => !main.cancelled && resolve(value);
      const rej = (error: Error) => !main.cancelled && reject(error);

      const computationA = this.future.get();
      const computationB = this.other.get();
  
      subscription.add(computationA);
      subscription.add(computationB);

      let aValue: Value<A> | undefined;
      let bValue: Value<B> | undefined;

      const performZip = () => {
        if (aValue && bValue) {
          let result;

          try {
            result = this.zipper(aValue.value, bValue.value);
          } catch (e) {
            rej(e);
            subscription.cancel();
            return;
          }

          res(result);
        }
      };

      computationA.then(
        value => {
          aValue = { value };

          performZip();
        },
        err => {
          rej(err);
          subscription.cancel();
        },
      );

      computationB.then(
        value => {
          bValue = { value };

          performZip();
        },
        err => {
          rej(err);
          subscription.cancel();
        },
      );
    });

    return new Computation<R>(promise, main);
  }
}

/**
 * Combines and resolves the output of this [[Future]] computation and the other [[Future]] computation.
 * 
 * ```typescript
 * const A = Future.timer('Hello', 500);
 * const B = Future.timer('World', 250);
 * 
 * A.compose(Future.zipWith(B, (a, b) => `${a} ${b}`))
 *  .get()
 *  .then(console.log); // 'Hello World'
 * ```
 * @category Transformers
 * @param other a [[Future]] instance.
 * @param zipper a function that receives the output of the two [[Future]] instances and outputs a combination.
 * @typeparam A type of computed value for this [[Future]].
 * @typeparam B type of computed value for the other [[Future]].
 * @typeparam R type of the combination value.
 */
export default function zipWith<A, B, R>(other: Future<B>, zipper: Function2<A, B, R>): FutureTransformer<A, R> {
  return (future: Future<A>): Future<R> => new FutureZipWith<A, B, R>(future, other, zipper);
}