import { delay, success, fromAction } from "../../src";

describe('delay', () => {
  it('should resolve to the original value', () => {
    const A = delay(0)(success('Hello'));

    return expect(A.get()).resolves.toEqual('Hello');
  });
  it('should immediately reject if original computation rejects', () => {
    const run = new Promise((resolve, reject) => {
      const A = delay(100)(fromAction(() => { throw 'Error'; }));

      let rejected = false;

      setTimeout(() => {
        if (rejected) {
          resolve(true);
        } else {
          reject();
        }
      });

      const computation = A.get();
      
      computation.catch(() => {
        rejected = true;
      });

    });

    return expect(run).resolves.toEqual(true);
  });
});