import { timer, fromAction, andThenPromise } from '../../src';

describe('andThenPromise', () => {
  it('should resolve to the resolving Promise', () => {
    const A = timer('Hello', 100);
    const B = Promise.resolve('World');

    return expect(andThenPromise(B)(A).get()).resolves.toEqual('World');
  });

  it('should immediately reject if the first computation rejects', () => {
    const A = fromAction(() => { throw 'Hello'; });
    const B = Promise.resolve('World');

    return expect(andThenPromise<any>(B)(A).get()).rejects.toEqual('Hello');
  });

  it('should reject if the Promise rejects', () => {
    const A = timer('World', 100);
    const B = Promise.reject('Hello');

    B.catch(() => {});

    return expect(andThenPromise<any>(B)(A).get()).rejects.toEqual('Hello');
  });
});