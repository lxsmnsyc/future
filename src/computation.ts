import Subscription from './subscription';
import { Function, Action } from './utils/types/function';

type Resolve<T, R> = Function<T, R | PromiseLike<R>> | null | undefined;
type Reject<R> = Function<any, R | PromiseLike<R>> | null | undefined;
type Finally = Action | null | undefined;

/**
 * An instanciated, cancellable computation from a given Future.
 */
export default class Computation<T> implements Subscription {
  constructor(private result: Promise<T>, private subscription: Subscription) {}

  public cancel() {
    this.subscription.cancel();
  }

  public then<R>(resolve?: Resolve<T, R>, reject?: Reject<R>) {
    return this.result.then(resolve, reject);
  }

  public catch<R>(reject?: Reject<R>) {
    return this.result.catch(reject);
  }

  public finally(action?: Finally) {
    return this.result.finally(action);
  }
}