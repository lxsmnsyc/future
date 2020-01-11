import { create } from "../../src";

describe('create', () => {
  it('should resolve if emitter.success is called', () => {
    const A = create(emitter => emitter.success('Hello'));

    return expect(A.get()).resolves.toEqual('Hello');
  });
  it('should resolve if emitter.failure is called', async () => {
    const A = create(emitter => emitter.failure(new Error('Hello')));

    try {
      await A.get();
    } catch (err) {
      return expect(err.message).toEqual('Hello');
    }
  });
  it('should not resolve if computation is cancelled', () => {
    const run = new Promise((resolve, reject) => {
      const A = create(emitter => {
        setTimeout(() => {
          emitter.success('Hello');
        }, 100);
      });

      const computation = A.get();

      computation.then(reject, reject);

      computation.cancel();

      setTimeout(() => {
        resolve(true);
      }, 100);
    });

    return expect(run).resolves.toEqual(true);
  });
  it('should call the onCancel callback if computation is cancelled', () => {
    let called = false;
    const A = create(emitter => {
      emitter.onCancel(() => {
        called = true;
      });
    });

    const run = new Promise((resolve, reject) => {
      const computation = A.get();

      computation.cancel();

      setTimeout(() => {
        if (called) {
          resolve(true);
        } else {
          reject();
        }
      }, 100);
    });

    return expect(run).resolves.toEqual(true);
  });
  it('should return true for isCancelled if computation is cancelled', () => {
    const run = new Promise((resolve, reject) => {
      const A = create(emitter => {
        setTimeout(() => {
          if (emitter.isCancelled()) {
            resolve(true);
          } else {
            reject();
          }
        }, 100);
      });

      const computation = A.get();

      computation.cancel();
    });

    return expect(run).resolves.toEqual(true);
  });
});