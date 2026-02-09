import type { IDialogService, DialogCount, DialogCommonProps, DialogPromiseProps, StoreState } from './dialog-service.type';
import { promiseWithResolvers } from '@/util/async';
import { useRef } from 'react';
import { createStore } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { useZustand } from 'use-zustand';

const initialState: StoreState = {
  dialogs: [],
};

class DialogInterruptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DialogInterruptError';
  }
}

export class DialogService implements IDialogService {
  readonly store = createStore<StoreState>(() => initialState);

  get state() {
    return this.store.getState();
  }

  private setState(partial: Partial<StoreState> | ((state: StoreState) => Partial<StoreState>)) {
    this.store.setState(partial);
  }

  get Collection() {
    const DialogCollection = () => {
      const dialogs = useZustand(this.store, (state) => state.dialogs);

      return (
        <>
          {dialogs.map((d) => (
            <d.comp key={d.id} {...d.props} />
          ))}
        </>
      );
    };
    return DialogCollection;
  }

  show<T, E>(
    component: React.ComponentType<T>,
    props: Omit<T, 'open'> & DialogPromiseProps<E>
  ): Promise<E> {
    const id = `dialog-${uuidv4()}`;
    const { resolve, reject, promise } = promiseWithResolvers<E>();

    const closeShowDialog = () => {
      this.close(id);
      reject(new DialogInterruptError('Dialog closed'));
    };

    const createCompWrapper = () => {
      const DialogWrapper = (innerProps: T & DialogPromiseProps<E>) => {
        const { onOpenChange } = innerProps as DialogCommonProps & DialogPromiseProps<E>;
        const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

        // 用于延迟移除对话框，给关闭动画留出时间
        // 在动画期间如果对话框重新打开，则取消移除操作
        const handleOpenChange = (open: boolean) => {
          if (open) {
            if (timerRef.current) {
              // 对话框重新打开时，清除待执行的移除操作
              clearTimeout(timerRef.current);
              timerRef.current = undefined;
            }
            this.open(id);
          } else {
            // 延迟200ms后从列表中移除对话框（等待关闭动画完成）
            this.hide(id);
            timerRef.current = setTimeout(closeShowDialog, 200);
          }
          onOpenChange?.(open);
        };

        const OriginalComponent = component;
        return (
          <OriginalComponent
            {...innerProps}
            onOpenChange={handleOpenChange}
            onResolve={(data: E) => {
              (innerProps as any).onResolve?.(data);
              resolve(data);
            }}
          />
        );
      };
      return DialogWrapper;
    };

    this.setState((state) => ({
      dialogs: [...state.dialogs, {
        id,
        comp: createCompWrapper(),
        props: { open: true, ...props },
      }],
    }));

    return promise;
  }

  close(dialogId: string): void {
    this.setState((state) => ({
      dialogs: state.dialogs.filter((d) => d.id !== dialogId),
    }));
  }

  open(dialogId: string): void {
    this.setState((state) => ({
      dialogs: state.dialogs.map((d) =>
        d.id === dialogId
          ? { ...d, props: { ...(d.props || {}), open: true } }
          : d
      ),
    }));
  }

  hide(dialogId: string): void {
    this.setState((state) => ({
      dialogs: state.dialogs.map((d) =>
        d.id === dialogId
          ? { ...d, props: { ...(d.props || {}), open: false } }
          : d
      ),
    }));
  }

  hideAll(): void {
    this.setState((state) => ({
      dialogs: state.dialogs.map((d) => ({
        ...d,
        props: { ...(d.props || {}), open: false },
      })),
    }));
  }

  update(dialogId: string, newProps: object): void {
    this.setState((state) => ({
      dialogs: state.dialogs.map((d) =>
        d.id === dialogId
          ? { ...d, props: { ...(d.props || {}), ...newProps } }
          : d
      ),
    }));
  }

  getCount(): DialogCount {
    const dialogs = this.state.dialogs;
    const openedDialogs = dialogs.filter((d) => d.props.open);
    return {
      opened: openedDialogs.length,
      total: dialogs.length,
    };
  }
}

