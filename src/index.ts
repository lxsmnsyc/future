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
import Future from './future';

export default Future;

export { default as Computation } from './computation';
export { default as Emitter } from './emitter';
export { FutureTransformer as Transformer } from './transformer';
export { default as Subscription } from './subscription';
export { Scheduler, TimedScheduler } from './scheduler';
export { default as Schedulers } from './schedulers';

/**
 * Constructors
 */

export { default as amb } from './operators/amb';
export { default as create } from './operators/create';
export { default as concat } from './operators/concat';
export { default as defer } from './operators/defer';
export { default as failure } from './operators/failure';
export { default as fromAction } from './operators/fromAction';
export { default as fromAsync } from './operators/fromAsync';
export { default as fromPromise } from './operators/fromPromise';
export { default as fromSupplier } from './operators/fromSupplier';
export { default as flatten } from './operators/flatten';
export { default as merge } from './operators/merge';
export { default as never } from './operators/never';
export { default as success } from './operators/success';
export { default as timer } from './operators/timer';
export { default as zip } from './operators/zip';

/**
 * Operators
 */
export { default as ambWith } from './operators/ambWith';
export { default as andThen } from './operators/andThen';
export { default as andThenPromise } from './operators/andThenPromise';
export { default as cache } from './operators/cache';
export { default as contains } from './operators/contains';
export { default as computeOn } from './operators/computeOn';
export { default as delay } from './operators/delay';
export { default as defaultIfEmpty } from './operators/defaultIfEmpty';
export { default as doFinally } from './operators/doFinally';
export { default as doOnCancel } from './operators/doOnCancel';
export { default as doOnEvent } from './operators/doOnEvent';
export { default as doOnFailure } from './operators/doOnFailure';
export { default as doOnSuccess } from './operators/doOnSuccess';
export { default as doOnTerminate } from './operators/doOnTerminate'; 
export { default as filter } from './operators/filter';
export { default as flatMap } from './operators/flatMap';
export { default as ignoreElement } from './operators/ignoreElement';
export { default as map } from './operators/map';
export { default as mergeWith } from './operators/mergeWith';
export { default as observeOn } from './operators/observeOn';
export { default as onErrorResume } from './operators/onErrorResume';
export { default as onErrorResumeNext } from './operators/onErrorResumeNext';
export { default as onErrorReturn } from './operators/onErrorReturn';
export { default as onErrorReturnItem } from './operators/onErrorReturnItem';
export { default as retry } from './operators/retry';
export { default as retryCounted } from './operators/retryCounted';
export { default as retryTimed } from './operators/retryTimed';
export { default as retryUntil } from './operators/retryUntil';
export { default as subscribeOn } from './operators/subscribeOn';
export { default as switchIfEmpty } from './operators/switchIfEmpty';
export { default as timeout } from './operators/timeout';
export { default as zipWith } from './operators/zipWith';

/**
 * Subscriptions
 */
export { default as BooleanSubscription } from './utils/subscriptions/boolean-subscription';
export { default as CompositeSubscription } from './utils/subscriptions/composite-subscription';
export { default as EmptySubscription } from './utils/subscriptions/empty-subscription';
export { default as WithCallbacksSubscription } from './utils/subscriptions/with-callbacks-subscription';
export { default as WithUpstreamSubscription } from './utils/subscriptions/with-upstream-subscription';

/**
 * Errors
 */
export { default as TimeoutError } from './utils/errors/timeout-error';