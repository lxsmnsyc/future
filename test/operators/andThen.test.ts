import { timer, success, fromAction, andThen } from '../../src';

describe('andThen', () => {
  it('should resolve to the last resolving computation', () => {
    const A = timer('Hello', 100);
    const B = success('World');

    return expect(andThen(B)(A).get()).resolves.toEqual('World');
  });

  it('should immediately reject if the first computation rejects', () => {
    const A = fromAction(() => { throw 'Hello'; });
    const B = success('World');

    return expect(andThen<any>(B)(A).get()).rejects.toEqual('Hello');
  });

  it('should reject if the next computation rejects', () => {
    const A = timer('World', 100);
    const B = fromAction(() => { throw 'Hello'; });

    return expect(andThen<any>(B)(A).get()).rejects.toEqual('Hello');
  });
});