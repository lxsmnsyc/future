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
import { Function2, Function, Consumer, Action } from '../utils/types/function';
import WithCallbacksSubscription from '../utils/subscriptions/with-callbacks-subscription';

export type OnCancel = Consumer<Action>;
export type PromiseProtect<T> = Function<PromiseLike<T> | Computation<T>, Promise<T> | Computation<T>>;
export type AsyncFunction<T> = Function2<OnCancel, PromiseProtect<T>, Promise<T>>;


class FutureFromAsync<T> extends Future<T> {
  constructor(private fn: AsyncFunction<T>) {
    super();
  }

  get(): Computation<T> {
    const subscription = new WithCallbacksSubscription();

    const promise = new Promise<T>((resolve, reject) => {
      const res = (value: T) => !subscription.cancelled && resolve(value);
      const rej = (value: Error) => !subscription.cancelled && reject(value);

      const onCancel = (action: Action) => {
        subscription.addListener(action);
      };

      const protect = (value: PromiseLike<T> | Computation<T>) => {
        if (value instanceof Computation) {
          subscription.addListener(() => value.cancel());

          return value;
        }
        return new Promise<T>((success, failure) => {
          value.then(
            value => !subscription.cancelled && success(value),
            error => !subscription.cancelled && failure(error),
          );
        });
      };

      let result;
      try {
        result = this.fn(onCancel, protect);
      } catch (e) {
        rej(e);
        subscription.cancel();
        return;
      }

      result.then(res, err => {
        rej(err);
        subscription.cancel();
      });
    });

    return new Computation<T>(promise, subscription);
  }
}

export default function fromAsync<T>(fn: AsyncFunction<T>): Future<T> {
  return new FutureFromAsync<T>(fn);
}