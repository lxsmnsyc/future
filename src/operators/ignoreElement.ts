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
import { WithUpstreamSubscription } from '../utils/subscriptions/with-upstream-subscription';


class FutureIgnoreElement extends Future<unknown> {
  constructor(
    private upstream: Future<any>,
  ) {
    super();
  }

  get(): Computation<unknown> {
    const computation = this.upstream.get();

    const subscription = new WithUpstreamSubscription(computation);

    const promise = new Promise((resolve, reject) => {
      const res = () => !subscription.cancelled && resolve();
      const rej = (value: Error) => !subscription.cancelled && reject(value);

      computation.then(
        _ => {
          res();
        },
        (err) => {
          rej(err);
          subscription.cancel();
        },
      );
    })

    return new Computation<unknown>(promise, subscription);
  }
}

/**
 * Transforms the resolved value of the given Future.
 * @param mapper a function that transforms the resolved value
 */
export default function ignoreElement(future: Future<any>) {
  return new FutureIgnoreElement(future);
}