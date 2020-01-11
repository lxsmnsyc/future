import { timer, success, amb, fromAction } from '../../src';

describe('amb', () => {
  it('should resolve to the fastest resolving computation', () => {
    const A = timer('Hello', 100);
    const B = success('World');

    return expect(amb([A, B]).get()).resolves.toEqual('World');
  });

  it('should immediately reject if the earliest computation rejects', () => {
    const A = fromAction(() => { throw 'Hello'; });
    const B = success('World');

    return expect(amb([A, B]).get()).rejects.toEqual('Hello');
  });
});