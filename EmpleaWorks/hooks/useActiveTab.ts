import { useIsFocused } from '@react-navigation/native';

export function useActiveTab() {
  const isFocused = useIsFocused();
  
  return {
    isTabActive: (tabName?: string) => isFocused,
  };
}
