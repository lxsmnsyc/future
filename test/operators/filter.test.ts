import { success, filter, fromAction } from "../../src";

describe('filter', () => {
  it('should resolve to the item if the item passes the predicate', () => {
    const A = success('Hello');
    const F = filter(() => true)(A);

    return expect(F.get()).resolves.toEqual('Hello');
  });
  it('should reject if the given Future rejects', () => {
    const A = fromAction(() => { throw 'Hello'; });
    const F = filter(() => true)(A);

    return expect(F.get()).rejects.toEqual('Hello');
  });
  it('should not resolve if the computed value fails the predicate', () => {
    const run = new Promise((resolve, reject) => {
      const A = success('Hello');
      const F = filter(() => false)(A);

      F.get().then(reject, reject);

      setTimeout(() => {
        resolve(true);
      });
    });

    return expect(run).resolves.toEqual(true);
  });
});