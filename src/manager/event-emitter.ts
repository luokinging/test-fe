type Listener<T> = (e: T) => any;

export interface Event<T> {
  (listener: Listener<T>, thisArgs?: any): Disposable;
}

export interface Disposable {
  dispose(): void;
}

/**
 * todo: This is a temporary and simple implementation for the business requirement. It needs to be managed uniformly later.
 * */
export class Emitter<T> {
  private listeners = new Set<Listener<T>>();

  public readonly event: Event<T> = (listener, thisArgs) => {
    const boundListener = thisArgs ? listener.bind(thisArgs) : listener;
    this.listeners.add(boundListener);

    return {
      dispose: () => {
        this.listeners.delete(boundListener);
      },
    };
  };

  public fire(data: T): void {
    for (const listener of Array.from(this.listeners)) {
      try {
        listener(data);
      } catch (err) {
        console.error('Error in event listener', err);
      }
    }
  }

  public dispose(): void {
    this.listeners.clear();
  }
}
