import { never } from "../../src";

describe('never', () => {
  it('should not resolve nor reject', () => {
    const run = new Promise((resolve, reject) => {
      const N = never();

      N.get().then(reject, reject);

      setTimeout(() => {
        resolve(true);
      });
    });

    return expect(run).resolves.toEqual(true);
  });
});