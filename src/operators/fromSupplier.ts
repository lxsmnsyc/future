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
import { Supplier } from '../utils/types/function';
import Computation from '../computation';
import EmptySubscription from '../utils/subscriptions/empty-subscription';

class FutureFromSupplier<T> extends Future<T> {
  constructor(private supplier: Supplier<T>) {
    super();
  }

  get(): Computation<T> {
    const promise = new Promise<T>((resolve, reject) => {
      let result;

      try {
        result = this.supplier();
      } catch (err) {
        reject(err);
        return;
      }

      resolve(result);
    });

    return new Computation<T>(promise, EmptySubscription.INSTANCE);
  }
}

/**
 * Runs the given supplier function and resolves with the returned value.
 * 
 * ```typescript
 * Future.fromSupplier(() => 'Hello World')
 *  .get()
 *  .then(console.log); // Hello World
 * ```
 * 
 * @category Constructors
 * @param supplier 
 * @typeparam T type of the value to be returned.
 */
export default function fromSupplier<T>(supplier: Supplier<T>): Future<T> {
  return new FutureFromSupplier<T>(supplier);
}