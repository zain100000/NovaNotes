/**
 * @file Session.hook.jsx
 * @description Simplified hook to handle the transition from Splash to Main.
 */
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';

export const useSessionCheck = (delay = 2500) => {
  const navigation = useNavigation();

  const query = useQuery({
    queryKey: ['splashTimeout'],
    queryFn: async () => {
      // Just a simple timer to ensure animations play out
      await new Promise(resolve => setTimeout(resolve, delay));
      return true;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  useEffect(() => {
    if (query.isSuccess) {
      // Direct navigation to Main
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  }, [query.isSuccess, navigation]);

  return query;
};