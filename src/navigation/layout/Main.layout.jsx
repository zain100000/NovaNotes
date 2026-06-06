/**
 * @fileOverview MainLayout.jsx
 * @module Navigation/MainLayout
 * @description
 * Acts as the primary state controller for the application's authenticated view.
 * It manages the conditional rendering of screens within the CustomDrawer without
 * relying on external navigation libraries, ensuring a seamless transition between
 * features like Notes, Reminders, and Settings.
 */

import React, { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import CustomDrawer from '../navigator/Drawer.navigator';
import { theme } from '../../styles/Themes';

// --- Screen Imports ---
import NotesScreen from '../../screens/dashboard-screen/notes-screen/Notes';
import ArchivedNotes from '../../screens/dashboard-screen/archived-screen/Archived';
import DeletedNotes from '../../screens/dashboard-screen/deleted-screen/Deleted';

const { width, height } = Dimensions.get('window');

const MainLayout = () => {
  /**
   * activeScreen: Tracks the currently selected menu item
   */
  const [activeScreen, setActiveScreen] = useState('Notes');

  /**
   * Logic to switch between components based on state.
   * Each component is rendered inside the Drawer container.
   */
  const renderScreen = () => {
    switch (activeScreen) {
      case 'Notes':
        return <NotesScreen />;

      case 'Archived':
        return <ArchivedNotes />;

      case 'Deleted':
        return <DeletedNotes />;

      default:
        return <NotesScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <CustomDrawer
        activeScreen={activeScreen}
        onNavigate={screenName => setActiveScreen(screenName)}
      >
        {renderScreen()}
      </CustomDrawer>
    </View>
  );
};

export default MainLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: theme.colors.dark,
  },

  contentWrapper: {
    flex: 1,
  },
});
