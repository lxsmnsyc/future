import Subscription from './subscription';
import { Function, Action } from './utils/types/function';

type Resolve<T, R> = Function<T, R | PromiseLike<R>> | null | undefined;
type Reject<R> = Function<any, R | PromiseLike<R>> | null | undefined;
type Finally = Action | null | undefined;

/**
 * An instanciated, cancellable computation from a given [[Future]].
 * 
 * @typeparam T the type of the value to be computed.
 * @category Core
 */
export default class Computation<T> implements Subscription, PromiseLike<T> {
  private done: boolean = false;
  private cancelled: boolean = false;
  private result: Promise<T>;

  constructor(result: Promise<T>, private subscription: Subscription) {
    this.result = new Promise<T>((resolve, reject) => {
      result.then(
        value => {
          if (!this.done && !this.cancelled) {
            this.done = true;
            resolve(value);
          }
        },
        error => {
          if (!this.cancelled) {
            this.cancel();
          }
          reject(error);
        },
      )
    });
  }

  /**
   * Cancels the computation.
   */
  public cancel() {
    if (!this.done) {
      this.cancelled = true;
      this.subscription.cancel();
    }
  }

  /**
   * Register callbacks that receives resolved value/rejected error.
   * @param resolve A callback receiving the resolved value.
   * @param reject A callback receiving the rejected error.
   */
  public then<S = T, F = never>(resolve?: Resolve<T, S>, reject?: Reject<F>) {
    return this.result.then(resolve, reject);
  }

  /**
   * Register a callback that receives the rejected error.
   * @param reject A callback receiving the rejected error. 
   */
  public catch<R>(reject?: Reject<R>) {
    return this.result.catch(reject);
  }

  /**
   * Register a callback that executes after the computation succeeds/fails.
   * @param action A callback that executes regardless if the computation succeeds or fails.
   */
  public finally(action?: Finally) {
    return this.result.finally(action);
  }

  /**
   * Returns a boolean value which tells if the instance
   * has already done computing.
   */
  public isDone() {
    return this.done;
  }
  
  /**
   * Returns a boolean value which tells if the instance
   * is cancelled.
   */
  public isCancelled() {
    return this.cancelled;
  }
}