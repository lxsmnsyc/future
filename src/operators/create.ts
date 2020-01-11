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
import FutureEmitter from '../emitter';
import Computation from '../computation';
import WithCallbacksSubscription from '../utils/subscriptions/with-callbacks-subscription';
import { Action, Consumer } from '../utils/types/function';


class FutureCreateEmitter<T> implements FutureEmitter<T> {
  constructor(
    private resolve: (value: T) => void,
    private reject: (error: Error) => void,
    private subscription: WithCallbacksSubscription
  ) {}

  public success(value: T) {
    if (!this.subscription.cancelled) {
      this.resolve(value);
    }
  }

  public failure(error: Error) {
    this.reject(error);
  }

  public onCancel(callback: Action) {
    this.subscription.addListener(callback);
  }

  public isCancelled() {
    return this.subscription.cancelled;
  }
}

class FutureCreate<T> extends Future<T> {
  constructor(private callback: Consumer<FutureCreateEmitter<T>>) {
    super();
  }

  get(): Computation<T> {
    const subscription = new WithCallbacksSubscription();

    const promise = new Promise<T>((resolve, reject) => {
      this.callback(new FutureCreateEmitter<T>(resolve, reject, subscription));
    });

    return new Computation<T>(promise, subscription);
  }
}

/**
 * Creates a [[Future]] with a given callback.
 * 
 * The callback receives a [[FutureEmitter]] instance which
 * you can use to resolve/reject values as well as attach
 * cleanup logic when a [[Computation]] gets cancelled.
 * 
 * ```typescript
 * // Create a Future that resolves 'Hello' after 500ms
 * const delayedHello = Future.create((emitter) => {
 * 
 *   // Our timeout that resolves the value
 *   const timeout = setTimeout(() => {
 *     emitter.success('Hello') 
 *   }, 500);
 * 
 *   // Attach cleanup
 *   emitter.onCancel(() => {
 *     clearTimeout(timeout);
 *   });
 * });
 * ```
 * @category Constructors
 * @param callback a function that receives a [[FutureEmitter]]
 * @typeparam T type of the computed value
 */
export default function create<T>(callback: Consumer<FutureEmitter<T>>): Future<T> {
  return new FutureCreate(callback);
}