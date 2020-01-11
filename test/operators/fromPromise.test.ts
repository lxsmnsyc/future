import { fromPromise } from '../../src';

describe('fromPromise', () => {
  it('should resolve with the same resolved value', () => {
    const base = 'hello';

    expect(fromPromise(Promise.resolve(base)).get()).resolves.toEqual(base);
  });

  it('should reject with the same rejected value', async () => {
    const base = 'hello';

    expect(fromPromise(Promise.reject(base)).get()).rejects.toEqual(base);
  });
});