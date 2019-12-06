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
import { TimedScheduler } from '../scheduler';
import Schedulers from '../schedulers';
import TimeoutError from '../utils/errors/timeout-error';
import CompositeSubscription from '../utils/subscriptions/composite-subscription';

class FutureTimeout<T> extends Future<T> {
  constructor(
    private future: Future<T>,
    private time: number,
    private scheduler: TimedScheduler
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

      const schedule = this.scheduler(() => {
        rej(new TimeoutError(this.time));
        subscription.cancel();
      }, this.time);

      subscription.add(schedule);

      computation.then(
        (value) => {
          res(value);
          schedule.cancel();
        },
        err => {
          rej(err);
          subscription.cancel();
        },
      );
    });

    return new Computation<T>(promise, subscription);
  }
}

/**
 * Rejects with [[TimeoutError]] when this [[Future]]
 * fails to resolve within a certain amount of time.
 * 
 * ```typescript
 * // A Future that resolves after 500ms
 * const delayedHello = Future.timer('Hello', 500);
 * 
 * // Compose a new Future which only allows resolution within 400ms
 * const strict = delayedHello.compose(Future.timeout(400));
 * 
 * // Begin the computation and expect an error
 * strict.get()
 *  .catch(console.log);
 * ```
 * 
 * @category Transformers
 * @param time the amount of time
 * @param scheduler where to schedule the timeout
 */
export default function timeout<T>(time: number, scheduler: TimedScheduler = Schedulers.SYNC.TIMED): FutureTransformer<T, T> {
  return (future: Future<T>): Future<T> => new FutureTimeout<T>(future, time, scheduler);
}