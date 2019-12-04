const Future = require('./dist');

// Create our Future
const A = Future.success('Hello').pipe(
  Future.delay(1000, Future.Schedulers.SYNC.TIMED),
);

const B = Future.success('World').pipe(
  Future.delay(400, Future.Schedulers.SYNC.TIMED),
  Future.delay(500, Future.Schedulers.SYNC.TIMED),
);

Future.amb([A, B]).get().then(console.log);
