/**
 * @file StatusBar
 * @module Hooks/useStatusBarConfig
 * @description A custom React hook to configure the system StatusBar settings for NovaNotes, ensuring a consistent and immersive user experience across both Android and iOS platforms. This hook abstracts away platform-specific logic, allowing developers to easily set the status bar style, background color, and translucency with simple parameters.
 */

import { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';

/**
 * Hook to configure the system StatusBar settings. 
 */
export const useStatusBarConfig = (
  barStyle = 'light-content',
  backgroundColor = 'transparent',
  translucent = true,
) => {
  useEffect(() => {
    StatusBar.setBarStyle(barStyle);

    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(backgroundColor);
      StatusBar.setTranslucent(translucent);
    }
  }, [barStyle, backgroundColor, translucent]);
};
