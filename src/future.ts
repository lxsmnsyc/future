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
import { FutureTransformer } from './transformer';
import Computation from './computation';

/**
 * A deferred process/computation on a value.
 * 
 * Allows you to compose logic without starting the computation.
 * 
 * To begin a computation, a Future instance must be called with
 * its `.get` method, which returns a [[Computation]] instance.
 * 
 * ```typescript
 * // Create a Future that resolves the value 'Hello' after 500 ms.
 * const delayedHello = Future.timer('Hello', 500);
 * 
 * // Begin its computation
 * const computation = delayedHello.get();
 * 
 * // You can cancel the computation
 * // computation.cancel();
 * 
 * // Output the resolved value
 * computation.then(console.log); // 'Hello'
 * ```
 * @typeparam T type for the computed value
 * @category Core
 */
export default abstract class Future<T> {

  /**
   * Transforms this Future instance into another Future instance
   * using the given [[FutureTransformer]] function.
   * @param transformer A transformer function
   * @return A transformed Future instance
   */
  public compose<R>(transformer: FutureTransformer<T, R>): Future<R> {
    return transformer(this);
  }

  /**
   * Transforms this Future instance by passing it through an array of
   * [[FutureTransformer]] functions, wherein the final Future instance
   * is returned.
   * @param transformers An array of transformer functions.
   */
  public pipe(...transformers: FutureTransformer<any, any>[]): Future<any> {
    return transformers.reduce<Future<any>>((acc, transform) => transform(acc), this);
  }

  /**
   * Performs a computation.
   * 
   * @returns A [[Computation]] instance
   */
  abstract get(): Computation<T>;
}