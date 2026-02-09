import * as lodash from 'lodash';

export type StateMiddleware<T> = (state: Partial<T>, prevState: T, reject: () => void) => Partial<T> | void;
export type MiddlewareOption = {
  cloneFn?: <V>(state: V) => V;
};

export class PartialStateMiddlewareManager<T> {
  private middlewares: StateMiddleware<T>[] = [];
  private middlewareDisposers: (() => void)[] = [];

  use(middleware: StateMiddleware<T>): () => void {
    this.middlewares.push(middleware);

    const remove = () => {
      const index = this.middlewares.indexOf(middleware);
      if (index > -1) {
        this.middlewares.splice(index, 1);
      }
    };

    this.middlewareDisposers.push(remove);

    return remove;
  }

  process(newState: Partial<T>, prevState: T, option?: MiddlewareOption): Partial<T> | undefined {
    const { cloneFn = lodash.cloneDeep } = option || {};
    let currentState = cloneFn(newState);
    const clonedPrevState = cloneFn(prevState);

    let isRejected = false;

    const reject = () => {
      isRejected = true;
    };

    for (const middleware of this.middlewares) {
      if (isRejected) {
        return undefined;
      }

      try {
        const result = middleware(currentState, clonedPrevState, reject);

        if (isRejected) {
          return undefined;
        }

        if (result !== undefined) {
          currentState = result;
        }
      } catch (error) {
        console.error('Middleware error:', error);
      }
    }

    return isRejected ? undefined : currentState;
  }

  clear(): void {
    this.middlewareDisposers.forEach((dispose) => dispose());
    this.middlewareDisposers = [];
    this.middlewares = [];
  }
}

export type DataMiddleware<T> = (data: T, prevData: T, reject: () => void) => T | void;
export type DataMiddlewareOption<T> = {
  cloneFn?: (data: T) => T;
};

export class DataMiddlewareManager<T> {
  private middlewares: DataMiddleware<T>[] = [];
  private disposers: (() => void)[] = [];

  use(middleware: DataMiddleware<T>): () => void {
    this.middlewares.push(middleware);

    const remove = () => {
      const index = this.middlewares.indexOf(middleware);
      if (index > -1) {
        this.middlewares.splice(index, 1);
      }
    };

    this.disposers.push(remove);

    return remove;
  }

  process(newData: T, prevData: T, option?: DataMiddlewareOption<T>): T | undefined {
    const { cloneFn = lodash.cloneDeep } = option || {};
    let currentData = cloneFn(newData);
    const clonedPrevData = cloneFn(prevData);

    let isRejected = false;

    const reject = () => {
      isRejected = true;
    };

    for (const middleware of this.middlewares) {
      if (isRejected) {
        return undefined;
      }

      try {
        const result = middleware(currentData, clonedPrevData, reject);

        if (isRejected) {
          return undefined;
        }

        if (result !== undefined) {
          currentData = result;
        }
      } catch (error) {
        console.error('Middleware error:', error);
      }
    }

    return isRejected ? undefined : currentData;
  }

  clear(): void {
    this.disposers.forEach((dispose) => dispose());
    this.disposers = [];
    this.middlewares = [];
  }
}
