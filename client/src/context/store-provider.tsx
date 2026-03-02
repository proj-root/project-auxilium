import { Provider } from 'react-redux';
import { setupListeners } from '@reduxjs/toolkit/query';
import { makeStore, type AppStore } from '@/state/store';
import { useEffect, useRef } from 'react';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (storeRef.current != null) {
      const unsubscribe = setupListeners(storeRef.current.dispatch);
      return unsubscribe;
    }
    return;
  });

  return <Provider store={storeRef.current}>{children}</Provider>;
}
