const Future = require('./dist');

const delayedHelloWorld = Future.fromAsync(async (onCancel, protect) => {
  // Construct a delayed promise
  const delayed = new Promise((resolve, reject) => {
    // create the timeout
    const timeout = setTimeout(() => {
      resolve('Hello');
    }, 500);

    // register cancellation
    onCancel(() => {
      clearTimeout(timeout);
    });
  });

  // get the value
  const value = await protect(delayed); // do not resolve if cancelled.

  // return the value
  return `${value} World`;
});

const computation = delayedHelloWorld.get();

computation.then(console.log);
