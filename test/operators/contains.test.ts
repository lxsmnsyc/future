import { success, contains, fromAction } from "../../src";

describe('contains', () => {
  it('should resolve to true if the given item matches the resolved value', () => {
    const A = success('Hello');

    return expect(contains('Hello')(A).get()).resolves.toEqual(true);
  });
  it('should reject if the Future rejects', () => {
    const A = fromAction(() => { throw 'Hello'; })

    return expect(contains('World')(A).get()).rejects.toEqual('Hello');
  });
  it('should reject if the comparer function throws an error', () => {
    const A = success('Hello');

    return expect(contains('World', () => { throw 'Error'; })(A).get()).rejects.toEqual('Error');
  });

  it('should not resolve when cancelled.', () => {
    const B = success('Hello');

    const C = contains('Hello')(B);

    const run = new Promise((resolve, reject) => {
      const computation = C.get();

      computation.then(reject, reject);

      computation.cancel();

      setTimeout(() => {
        resolve(true);
      }, 100);
    });

    return expect(run).resolves.toEqual(true);
    
  });
});