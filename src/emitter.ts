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

/**
 * An emitter that allows push-based resolution.
 * @typeparam T type of the value to be resolved by the [[Future]].
 * @category Core
 */
export default interface FutureEmitter<T> {
  /**
   * Resolves the [[Computation]] instance with the given value.
   * @param value The value to be resolved into.
   */
  success: (value: T) => void,

  /**
   * Rejects the [[Computation]] instance with the given value.
   * @param error The error to be rejected into.
   */
  failure: (error: Error) => void,

  /**
   * Registers a callback to be executed when
   * the [[Computation]] instance gets cancelled
   * downstream.
   * @param callback A callback function.
   */
  onCancel: (callback: () => void) => void,

  /**
   * Checks if the [[Computation]] instance is cancelled.
   * @returns The state of cancellation
   */
  isCancelled: () => boolean,
}