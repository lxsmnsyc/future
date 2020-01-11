import { success, failure, doOnCancel } from "../../src";

describe('doOnCancel', () => {
  it('should resolve to the original value', () => {
    const A = doOnCancel(() => {})(success('Hello'));
    return expect(A.get()).resolves.toEqual('Hello');
  });
  it('should reject to the original rejection as well as call the attached callback', () => {
    const run = new Promise((resolve, reject) => {
      let called = false;
      const A = doOnCancel(() => {
        called = true
      })(failure(new Error('Error')));

      const computation = A.get();

      computation.then(reject, value => { throw value; }).catch(value => {
        if (value.message === 'Error' && called) {
          resolve(true); 
        } else {
          reject();
        }
      });

    });

    return expect(run).resolves.toEqual(true);
  });
});