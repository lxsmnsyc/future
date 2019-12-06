# @lxsmnsyc/future

> Extension to the ES6 Promise; much better reactivity in JavaScript.

[![NPM](https://img.shields.io/npm/v/@lxsmnsyc/future.svg)](https://www.npmjs.com/package/@lxsmnsyc/future) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @lxsmnsyc/future
```

```bash
yarn add @lxsmnsyc/future
```

## Introduction

`@lxsmnsyc/future` attemps to extend the functionality and solve some problems that exists with the current ES6 Promise.

First difference about `Futures` against `Promises` is that the computation is deferred: You can compose `Futures` without evaluating/scheduling the computation already, which is good specially if you want to
compose your own logic, as well as, since `Promises`' resolution callback executes synchronously, you can choose when will the `Future` run its computation.

By summary: `Futures` are the cold version of `Promises`.

```typescript

// No computation being processed
const delayedHelloWorld = Future.success('Hello').pipe(
  Future.map(value => `${value} World`),
  Future.delay(500),
);

// Begin computation
const computation = delayedHelloWorld.get();

// get the computed value
computation.then((value) => {
  console.log('Success: ', value);
});

// or
const value = await computation;
console.log('Success: ', value);
```

Another difference is that `Futures` are cancellable. Disposing logic in `Promises` has been a problem, and `Futures` helps you with that. If a `Future` is cancelled, the computation stops and the asynchronous value will not be resolved. If you start a `Future` inside an async function, await its value, and cancels it before it has finished its computation, the async function will not continue executing.

```typescript
// Begin computation
const computation = delayedHelloWorld.get();

// get the computed value
computation.then((value) => {
  console.log('Success: ', value);
});

// cancel the computation before it finishes
computation.cancel();
```


## Usage

### Creating Futures

`Future.create` is the basic operator for building your own computation logic for a `Future`.

Example below is a `Future` that resolves `Hello World` after 500 ms.

```typescript
// Create our Future
const delayedHelloWorld = Future.create((emitter) => {
  // create a timer
  const timeout = setTimeout(() => {
    // resolve the value
    emitter.success('Hello World');
  }, 500);

  // Make sure to cleanup our timer
  emitter.onCancel(() => {
    clearTimeout(timeout);
  });
});
```

### Composing Futures

`Futures` have two methods that allows you to transform the `Future` into a another `Future` with different computation logic: `compose` which accepts a transformation function and `pipe` which accepts multiple.

For example, if we want to modify the resolved value of a `Future`, we can use `map`:

```typescript
const greeting = Future.success('Hello')
  .compose(Future.map(value => `${value} World`));

greeting.get().then(console.log); // Hello World
```

### Computation vs Future

There are two core classes in this library: Futures and Computation.

To clarify, a Computation is an instance received by calling the `Future#get`. A Future tells how a Computation instance should run its logic.

## Documentation

Full documentation is available [here](https://lxsmnsyc.github.io/future).

## Build

This project is bootstraped with [TSDX](https://github.com/jaredpalmer/tsdx) with minor changes.

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)
