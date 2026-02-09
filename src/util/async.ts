/**
 * Creates and returns a new promise, plus its `resolve` and `reject` callbacks.
 *
 * Replace with standardized [`Promise.withResolvers`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers) once it is supported
 */
export function promiseWithResolvers<T>(): {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (err?: any) => void;
} {
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
}

export type CancelablePromise<T> = Promise<T> & { cancel: () => void; isCanceled: boolean };
export class PromiseCancelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PromiseCancelError';
  }
}

export function cancelable<T>(promise: PromiseLike<T>) {
  const { promise: _promise, reject, resolve } = promiseWithResolvers<T>();
  promise.then(resolve, reject);

  const cancelablePromise = _promise as CancelablePromise<T>;

  cancelablePromise.isCanceled = false;
  cancelablePromise.cancel = () => {
    cancelablePromise.isCanceled = true;
    reject(new PromiseCancelError('Promise canceled'));
  };

  return _promise as CancelablePromise<T>;
}
