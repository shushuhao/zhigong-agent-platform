import type { StoreApi, UseBoundStore } from 'zustand';

type StoreWithSelectors<StoreState> = {
  use: {
    [K in keyof StoreState]: () => StoreState[K];
  };
};

export const createSelectors = <StoreState extends object>(
  store: UseBoundStore<StoreApi<StoreState>>
) => {
  type StoreKey = keyof StoreState;

  const useStore =
    store as UseBoundStore<StoreApi<StoreState>> & StoreWithSelectors<StoreState>;
  useStore.use = {} as StoreWithSelectors<StoreState>['use'];

  (Object.keys(store.getState()) as StoreKey[]).forEach((key) => {
    useStore.use[key] = () => store((state) => state[key]);
  });

  return useStore;
};
