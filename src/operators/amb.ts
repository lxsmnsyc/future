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

class FutureAmb<T extends Future<any>[]> extends Future<any> {
  constructor(private futures: T) {
    super();
  }

  get(): Computation<any> {
    const subscription = new CompositeSubscription();
    const main = new CompositeSubscription();

    main.add(subscription);

    const promise = new Promise((resolve, reject) => {
      const res = (value: T) => !main.cancelled && resolve(value);
      const rej = (value: Error) => !main.cancelled && reject(value);

      this.futures.forEach((future) => {
        const computation = future.get();

        subscription.add(computation);

        computation.then(
          value => {
            main.remove(subscription);
            main.add(computation);
            res(value);
            subscription.remove(computation);
            subscription.cancel();
          }, 
          error => {
            rej(error);
            subscription.cancel();
          }
        );
      });
    });

    return new Computation(promise, subscription);
  }
}

export default function amb<T extends Future<any>[]>(futures: T): Future<any> {
  return new FutureAmb<T>(futures);
}