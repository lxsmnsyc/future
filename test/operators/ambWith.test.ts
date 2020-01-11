import { timer, success, fromAction, ambWith } from '../../src';

describe('ambWith', () => {
  it('should resolve to the fastest resolving computation', () => {
    const A = timer('Hello', 100);
    const B = success('World');

    return expect(ambWith(B)(A).get()).resolves.toEqual('World');
  });

  it('should immediately resolve if the composing Future resolves first.', () => {
    const A = success('Hello');
    const B = success('World');

    return expect(ambWith<any>(B)(A).get()).resolves.toEqual('Hello');
  });

  it('should immediately reject if the first computation rejects', () => {
    const A = fromAction(() => { throw 'Hello'; });
    const B = success('World');

    return expect(ambWith<any>(B)(A).get()).rejects.toEqual('Hello');
  });

  it('should immediately reject if the earliest computation rejects', () => {
    const A = timer('World', 100);
    const B = fromAction(() => { throw 'Hello'; });

    return expect(ambWith<any>(B)(A).get()).rejects.toEqual('Hello');
  });
});