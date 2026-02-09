/* eslint-disable react-hooks/exhaustive-deps */

import { useLayoutEffect, useReducer, useRef } from 'react';
import { shallow } from 'zustand/shallow';

export type StoreState<S> = S extends { getState: () => infer T } ? T : never;
export type StoreListener<T> = (state: T, prevState: T) => void;
export type ReadonlyStoreApi<T> = {
  getState: () => T;
  subscribe: (listener: StoreListener<T>) => () => void;
};

export type CombinedStore<Stores extends readonly ReadonlyStoreApi<any>[]> = Stores & {
  __isCombinedStore: true;
  getState: () => { [K in keyof Stores]: StoreState<Stores[K]> };
  subscribe: (listener: () => void) => () => void;
  subscribeSelector: <Slice>(
    selector: () => Slice,
    listener: (slice: Slice, prevSlice: Slice) => void,
    areEqual?: (a: Slice, b: Slice) => boolean
  ) => () => void;
};
function isCombinedStore(store: any): store is CombinedStore<any> {
  return store && store.__isCombinedStore === true;
}

function getInternalStores(store: CombinedStore<any>): ReadonlyStoreApi<any>[] {
  return Array.from(store) as ReadonlyStoreApi<any>[];
}

function flattenAndDeduplicateStores(stores: ReadonlyStoreApi<any>[]): {
  flatStores: ReadonlyStoreApi<any>[];
  storeMap: Map<ReadonlyStoreApi<any>, number>;
} {
  const flatStores: ReadonlyStoreApi<any>[] = [];
  const visited = new WeakSet<ReadonlyStoreApi<any>>();
  const storeMap = new Map<ReadonlyStoreApi<any>, number>();

  function visit(store: ReadonlyStoreApi<any>): void {
    if (visited.has(store)) {
      return;
    }

    visited.add(store);

    if (storeMap.has(store)) {
      return;
    }

    if (isCombinedStore(store)) {
      const internalStores = getInternalStores(store);
      internalStores.forEach(visit);
    } else {
      const index = flatStores.length;
      flatStores.push(store);
      storeMap.set(store, index);
    }
  }

  stores.forEach(visit);
  return { flatStores, storeMap };
}

export function createCombinedStore<Stores extends readonly ReadonlyStoreApi<any>[]>(
  stores: Stores
): CombinedStore<Stores> {
  const { flatStores } = flattenAndDeduplicateStores(Array.from(stores));

  const combinedStore = Object.assign([...stores], {
    __isCombinedStore: true as const,
    getState: () => {
      return stores.map((store) => store.getState()) as { [K in keyof Stores]: StoreState<Stores[K]> };
    },
    subscribe: (listener: () => void) => {
      const unsubscribeFns = flatStores.map((store) =>
        store.subscribe(listener)
      );

      return () => {
        unsubscribeFns.forEach((unsubscribe) => unsubscribe());
      };
    },
    subscribeSelector: <Slice>(
      selector: () => Slice,
      listener: (slice: Slice, prevSlice: Slice) => void,
      areEqual: (a: Slice, b: Slice) => boolean = shallow
    ) => {
      let prevSlice: Slice | undefined;

      const unsubscribe = combinedStore.subscribe(() => {
        const currentSlice = selector();

        if (prevSlice === undefined || !areEqual(prevSlice, currentSlice)) {
          const prev = prevSlice;
          prevSlice = currentSlice;
          listener(currentSlice, prev!);
        } else {
          prevSlice = currentSlice;
        }
      });

      return unsubscribe;
    },
  }) as unknown as CombinedStore<Stores>;

  return combinedStore;
}

export function useCombinedStore<Stores extends readonly ReadonlyStoreApi<any>[], Slice>(
  stores: Stores,
  selector: () => Slice,
  deps: unknown[] = [],
  areEqual: ((a: Slice, b: Slice) => boolean) | null | undefined = null
) {
  const selectorRef = useRef(selector);
  const areEqualRef = useRef(areEqual || shallow);
  selectorRef.current = selector;
  areEqualRef.current = areEqual || shallow;

  const combinedStore = useRef(createCombinedStore(stores));

  const [slice, setSlice] = useReducer(
    (_: Slice, next: Slice) => next,
    undefined,
    () => {
      return selector();
    }
  );

  useLayoutEffect(() => {
    const unsubscribe = combinedStore.current.subscribeSelector(
      selectorRef.current,
      (currentSlice) => setSlice(currentSlice),
      areEqualRef.current
    );

    return unsubscribe;
  }, [stores]);

   
  useLayoutEffect(() => {
    setSlice(selectorRef.current());
  }, deps);

  return slice!;
}
