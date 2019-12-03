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

class FutureZip<S extends Future<any>[], T extends any[], R> extends Future<R> {
  constructor(
    private sources: S,
    private zipper: (...args: T) => R,
  ) {
    super();
  }

  get(): Computation<R> {
    const subscription = new CompositeSubscription();
    const main = new CompositeSubscription();

    main.add(subscription);

    const promise = new Promise<R>((resolve, reject) => {
      const res = (value: R) => !main.cancelled && resolve(value);
      const rej = (value: Error) => !main.cancelled && reject(value);

      let size = this.sources.length;
      const results: any[] = [];

      const performZip = () => {
        if (size === 0) {
          let result;

          try {
            result = this.zipper(...(results as T));
          } catch (err) {
            rej(err);
            subscription.cancel();
            return;
          }

          res(result);
        }
      };

      this.sources.forEach((source, index) => {
        const computation = source.get();

        subscription.add(computation);
  
        computation.then(
          value => {
            size -= 1;
            results[index] = value;

            performZip();
          },
          err => {
            rej(err);
            subscription.cancel();
          },
        )
      });
    });

    return new Computation<R>(promise, subscription);
  }
}

export default function zip<S extends Future<any>[], T extends any[], R>(sources: S, zipper: (...args: T) => R): Future<R> {
  return new FutureZip<S, T, R>(sources, zipper);
}