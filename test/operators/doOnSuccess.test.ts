import { success, failure, doOnSuccess } from "../../src";

describe('doOnSuccess', () => {
  it('should resolve to the original value as well as call the attached callback', () => {
    const run = new Promise((resolve, reject) => {
      let called = false;
      const A = doOnSuccess<string>(() => {
        called = true;
      })(success('Hello'));

      const computation = A.get();

      computation.then(value => {
        if (value === 'Hello' && called) {
          resolve(true); 
        } else {
          reject();
        }
      }, reject);

    });

    return expect(run).resolves.toEqual(true);
  });
  it('should reject to the original rejection as well as call the attached callback', () => {
    const run = new Promise((resolve, reject) => {
      let called = false;
      const A = doOnSuccess(() => {
        called = true;
      })(failure(new Error('Error')));

      const computation = A.get();

      computation.then(reject, value => {
        if (value.message === 'Error' && !called) {
          resolve(true); 
        } else {
          reject();
        }
      });

    });

    return expect(run).resolves.toEqual(true);
  });
  it('should reject if the attached callback throws an error on resolve.', () => {
    const A = doOnSuccess(() => {
      throw 'Error';
    })(success('Hello'));

    return expect(A.get()).rejects.toEqual('Error');
  });
});