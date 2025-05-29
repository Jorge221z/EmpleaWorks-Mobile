import React, { createContext, useContext, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';

interface TabTransitionContextType {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  transitionProgress: any; // SharedValue
  isTransitioning: boolean;
  setIsTransitioning: (transitioning: boolean) => void;
}

const TabTransitionContext = createContext<TabTransitionContextType | undefined>(undefined);

export function TabTransitionProvider({ children }: { children: React.ReactNode }) {
  const [currentTab, setCurrentTab] = useState('index');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionProgress = useSharedValue(1);

  return (
    <TabTransitionContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        transitionProgress,
        isTransitioning,
        setIsTransitioning,
      }}
    >
      {children}
    </TabTransitionContext.Provider>
  );
}

export function useTabTransition() {
  const context = useContext(TabTransitionContext);
  if (context === undefined) {
    throw new Error('useTabTransition must be used within a TabTransitionProvider');
  }
  return context;
}
