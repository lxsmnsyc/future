import { success, fromSupplier, defer } from "../../src";

describe('defer', () => {
  it('should resolve to the value of the original Future', () => {
    const A = defer(() => success('Hello'));

    return expect(A.get()).resolves.toEqual('Hello');
  });
  it('should reject if the original computation rejects', () => {
    const A = defer(() => fromSupplier<string>(() => { throw 'Error'; }));

    return expect(A.get()).rejects.toEqual('Error');
  });
  it('should reject if the Future supplier throws an errorl', () => {
    const A = defer(() => { throw 'Error'; });

    return expect(A.get()).rejects.toEqual('Error');
  });
});