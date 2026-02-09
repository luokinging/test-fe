import { cancelable, promiseWithResolvers, type CancelablePromise } from "@/util/async";

type PollingOptions<T> = {
  /** milliseconds */
  interval?: number;
  onFrameResult?: (result: T) => void;
  needInterrupt?: (result: T) => boolean;
  isFinished?: (result: T) => boolean;
  onError?: (error: unknown) => void;
  continueOnError?: boolean;
};
export class ProcessingTaskManager {
  private processingTasks = [] as CancelablePromise<unknown>[];

  pin<T>(promise: Promise<T>) {
    const cancelablePromise = cancelable(promise);
    this.processingTasks.push(cancelablePromise);
    cancelablePromise.then(() => {
      this.processingTasks = this.processingTasks.filter((task) => task !== cancelablePromise);
    });
    return cancelablePromise;
  }

  polling<T extends (...args: any[]) => Promise<any>>(task: T, options: PollingOptions<Awaited<ReturnType<T>>>) {
    const { interval = 5000, continueOnError = false, onFrameResult, needInterrupt, isFinished, onError } = options;

    const { promise: _promise, resolve, reject } = promiseWithResolvers<Awaited<ReturnType<T>>>();
    const promise = this.pin(_promise);

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const wrapper = async (...args: Parameters<T>) => {
      while (!promise.isCanceled) {
        try {
          const result = await task(...args);
          onFrameResult?.(result);

          if (needInterrupt?.(result) || isFinished?.(result)) {
            resolve(result);
            break;
          }
        } catch (error) {
          if (continueOnError) {
            onError?.(error);
          } else {
            reject(error);
            break;
          }
        }
        await sleep(interval);
      }
      return promise;
    };

    wrapper.cancel = () => {
      promise.cancel();
    };

    return wrapper as T & { cancel: () => void };
  }

  cancelAll() {
    this.processingTasks.forEach((task) => task.cancel());
    this.processingTasks = [];
  }
}
