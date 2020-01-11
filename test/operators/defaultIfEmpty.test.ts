import { success, defaultIfEmpty, fromSupplier } from "../../src";

describe('defaultIfEmpty', () => {
  it('should resolve to the original value if not empty', () => {
    const A = success('Hello');

    const B = defaultIfEmpty('World')(A);

    return expect(B.get()).resolves.toEqual('Hello');
  });
  it('should resolve to the given value if empty', () => {
    const A = success(null);

    const B = defaultIfEmpty<string | null>('World')(A);

    return expect(B.get()).resolves.toEqual('World');
  });
  it('should reject if the computation rejects', () => {
    const A = fromSupplier<string>(() => { throw 'Error'; });
    const B = defaultIfEmpty('World')(A);

    return expect(B.get()).rejects.toEqual('Error');
  });
});