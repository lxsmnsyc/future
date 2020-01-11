import { success, computeOn, Schedulers, fromAction } from '../../src';

describe('computeOn', () => {
  it('should resolve specifically on the given scheduler', () => {
    const A = success('Hello');

    const scheduled = computeOn(Schedulers.TIMEOUT.NOW)(A);

    const computation = scheduled.get();

    let flag = false;
    
    Promise.resolve().then(() => {
      flag = true;
    })

    const run = new Promise((resolve, reject) => {
      computation.then(() => {
        if (flag) {
          resolve(true);
        } else {
          reject();
        }
      });
    });

    return expect(run).resolves.toEqual(true);
  });

  it('should reject specifically on the given scheduler', () => {
    const A = fromAction(() => { throw 'Hello'; });

    const scheduled = computeOn(Schedulers.TIMEOUT.NOW)(A);

    const computation = scheduled.get();

    let flag = false;

    const run = new Promise((resolve, reject) => {
      computation.catch(() => {
        if (flag) {
          resolve(true);
        } else {
          reject();
        }
      });
    });
    
    Promise.resolve().then(() => {
      flag = true;
    })

    return expect(run).resolves.toEqual(true);
  });
});