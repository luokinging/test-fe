import type { ComponentType } from 'react';

export type DialogCommonProps = {
  open?: boolean;
  onOpenChange?(open: boolean): void;
};

export type DialogPromiseProps<E> = {
  onResolve?: (data: E) => void;
};

export type BasicDialogProps<E = unknown, P extends object = object> = DialogCommonProps & DialogPromiseProps<E> & P;

export type DialogShowOptions<T, E> = {
  component: React.ComponentType<T>;
  props: Omit<T, 'open'> & DialogPromiseProps<E>;
};

export type DialogHandle = {
  close(): void;
  open(): void;
  hide(): void;
  update(props: object): void;
};

export type DialogCount = {
  opened: number;
  total: number;
};

export type DialogCollectionComponent = ComponentType & {
  displayName?: string;
};

export type DialogState = {
  id: string;
  comp: React.ComponentType<any>;
  props: any;
};

export type StoreState = {
  dialogs: DialogState[];
};

export interface IDialogService {
  show<T, E>(component: React.ComponentType<T>, props: Omit<T, 'open'> & DialogPromiseProps<E>): Promise<E>;
  close(dialogId: string): void;
  open(dialogId: string): void;
  hide(dialogId: string): void;
  hideAll(): void;
  update(dialogId: string, props: object): void;
  getCount(): DialogCount;
  get Collection(): DialogCollectionComponent;
}
