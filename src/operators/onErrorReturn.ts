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
import CompositeSubscription from '../utils/subscriptions/composite-subscription';

class FutureOnErrorReturn<T> extends Future<T> {
  constructor(
    private future: Future<T>,
    private resume: Function<Error, T>,
  ) {
    super();
  }

  get(): Computation<T> {
    const subscription = new CompositeSubscription();

    const promise = new Promise<T>((resolve, reject) => {
      const res = (value: T) => !subscription.cancelled && resolve(value);
      const rej = (value: Error) => !subscription.cancelled && reject(value);

      const computation = this.future.get();

      subscription.add(computation);

      computation.then(res, err => {
        subscription.remove(computation);
        computation.cancel();

        let result;
        try {
          result = this.resume(err);
        } catch (e) {
          rej(e);
          subscription.cancel();
          return;
        }
        res(result);
      });
    });

    return new Computation<T>(promise, subscription);
  }
}

export default function onErrorReturn<T>(resume: Function<Error, T>): FutureTransformer<T, T> {
  return (future: Future<T>): Future<T> => new FutureOnErrorReturn(future, resume);
}