const Future = require('./dist');

// Create our Future
const A = Future.timer('Hello World', 500).compose(Future.timeout(400));

A.get().then(console.log, console.error);
