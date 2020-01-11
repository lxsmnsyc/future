import { fromSupplier, cache, fromAction } from '../../src';

describe('cache', () => {
  it('should compute once and resolve the same value for all', async () => {
    const main = fromSupplier(Math.random);

    const future = cache()(main);

    const values = await Promise.all([future.get(), future.get()]);

    return expect(values[0]).toEqual(values[1]);
  });

  it('should compute once and reject the same value for all', () => {
    const main = fromAction(() => { throw 'Hello'; });

    const future = cache()(main);

    return expect(Promise.all([future.get(), future.get()])).rejects.toEqual('Hello');
  });
});