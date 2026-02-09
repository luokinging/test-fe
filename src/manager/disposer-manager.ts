import type { Disposable } from '@/manager/event-emitter';

export class DisposerManager {
  private disposers = [] as Disposable[];

  add(disposer: Disposable) {
    this.disposers.push(disposer);
  }

  addDisposeFn(disposeFn: () => void) {
    this.disposers.push({ dispose: disposeFn });
  }

  dispose() {
    this.disposers.forEach((disposer) => disposer.dispose());
    this.disposers = [];
  }
}
