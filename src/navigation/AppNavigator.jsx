/**
 * @file AppNavigator.jsx
 * @module Navigation/AppNavigator
 * @descriptionc Defines the main navigation stack for the application, including the Splash and Onboarding screens. It also manages the status bar color based on the current screen.
 */

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../styles/Themes';

// --- Screen Imports ---
import Splash from '../screens/splash-screen/Splash';

// --- Main Imports ---
import MainLayout from '../navigation/layout/Main.layout';

// --- Notes Imports
import CreateNote from '../screens/dashboard-screen/notes-screen/CreateNote'
import NoteView from '../screens/dashboard-screen/notes-screen/NoteView'

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [statusBarColor, setStatusBarColor] = useState(theme.colors.primary);

  return (
    <>
      <StatusBar
        backgroundColor={statusBarColor}
        barStyle="light-content"
        translucent={false}
      />

      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          gestureEnabled: true,
        }}
      >
        {/* --- ENTRY POINT --- */}
        <Stack.Screen name="Splash">
          {props => <Splash {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>       

        {/* --- MAIN ROUTE --- */}
        <Stack.Screen name="Main">
          {props => (
            <MainLayout {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>     

        {/* --- NOTES ROUTE --- */}
        <Stack.Screen name="CreateNote">
          {props => (
            <CreateNote {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>     

         <Stack.Screen name="NoteView">
          {props => (
            <NoteView {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>     

      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
