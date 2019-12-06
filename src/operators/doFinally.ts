import Future from '../future';
import { Action } from '../utils/types/function';
import Computation from '../computation';
import { FutureTransformer } from '../transformer';
import WithCallbacksSubscription from '../utils/subscriptions/with-callbacks-subscription';

class FutureDoFinally<T> extends Future<T> {
  constructor(
    private future: Future<T>,
    private onFinally: Action,
  ) {
    super();
  }

  get(): Computation<T> {
    const computation = this.future.get();

    const subscription = new WithCallbacksSubscription();

    subscription.addListener(() => computation.cancel());
    
    const promise = new Promise<T>((resolve, reject) => {
      const res = (value: T) => !subscription.cancelled && resolve(value);
      const rej = (value: Error) => !subscription.cancelled && reject(value);

      subscription.addListener(this.onFinally);

      computation.then(
        value => {
          try {
            this.onFinally();
          } catch (e) {
            rej(e);
            subscription.removeListener(this.onFinally);
            subscription.cancel();
            return;
          }
          res(value);
        },
        err => {
          try {
            this.onFinally();
          } catch (e) {
            rej(e);
            subscription.removeListener(this.onFinally);
            subscription.cancel();
            return;
          }
          rej(err);
          subscription.cancel();
        },
      );
    });

    return new Computation<T>(promise, subscription);
  }
}

/**
 * Runs a side-effect with the given [[Action]] when a [[Computation]] instance
 * resolves, rejects or gets cancelled.
 * @category Transformers
 * @param onFinally [[Action]] to be called.
 * @typeparam T type of the computed value
 */
export default function doFinally<T>(onFinally: Action): FutureTransformer<T, T> {
  return (future: Future<T>): Future<T> => new FutureDoFinally(future, onFinally);
}