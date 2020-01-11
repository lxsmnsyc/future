import { timer, success, fromAction, concat } from '../../src';

describe('concat', () => {
  it('should resolve to the last given computation', () => {
    const A = timer('Hello', 100);
    const B = success('World');

    return expect(concat([A, B]).get()).resolves.toEqual('World');
  });

  it('should immediately reject if the earliest computation rejects', () => {
    const A = fromAction(() => { throw 'Hello'; });
    const B = success('World');

    return expect(concat([A, B]).get()).rejects.toEqual('Hello');
  });
});