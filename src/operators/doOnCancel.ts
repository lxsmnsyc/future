import Future from '../future';
import { Action } from '../utils/types/function';
import Computation from '../computation';
import { FutureTransformer } from '../transformer';
import WithCallbacksSubscription from '../utils/subscriptions/with-callbacks-subscription';

class FutureDoOnCancel<T> extends Future<T> {
  constructor(
    private future: Future<T>,
    private onCancel: Action,
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

      subscription.addListener(this.onCancel);

      computation.then(
        res,
        err => {
          rej(err);
          subscription.cancel();
        },
      );
    });

    return new Computation<T>(promise, subscription);
  }
}

export default function doOnCancel<T>(onCancel: Action): FutureTransformer<T, T> {
  return (future: Future<T>): Future<T> => new FutureDoOnCancel(future, onCancel);
}