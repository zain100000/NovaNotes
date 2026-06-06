/**
 * @fileOverview CustomDrawer.jsx
 * @module Components/Navigation/CustomDrawer
 * @description Defines a custom drawer component that provides a sleek and intuitive navigation experience.
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  BackHandler,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../styles/Themes';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.82;

const CustomDrawer = ({ children, activeScreen, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  /**
   * Handles the Android hardware back button to close drawer if open
   */
  useEffect(() => {
    const backAction = () => {
      if (isOpen) {
        toggleDrawer(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [isOpen]);

  /**
   * Toggles the drawer state with smooth timing animation
   * @param {boolean} open - Target state
   */
  const toggleDrawer = open => {
    setIsOpen(open);
    Animated.timing(animation, {
      toValue: open ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  // Interpolations for responsive transitions
  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.7],
  });

  /**
   * Reusable component for Drawer items with pill-shaped selection
   */
  const DrawerItem = ({ label, icon }) => {
    const isActive = activeScreen === label;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.drawerItem,
          isActive && styles.activeItem,
          { marginBottom: theme.gap(1) },
        ]}
        onPress={() => {
          onNavigate(label); // ✅ switch screen
          toggleDrawer(false); // ✅ close drawer
        }}
      >
        <View style={styles.itemContent}>
          <MaterialCommunityIcons
            name={icon}
            size={theme.spacing(3)}
            color={isActive ? theme.colors.dark : theme.colors.gray}
          />
          <Text style={[styles.label, isActive && styles.activeLabel]}>
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Main Screen Content Injection */}
      <View style={styles.mainContent}>
        {React.cloneElement(children, { openDrawer: () => toggleDrawer(true) })}
      </View>

      {/* Backdrop / Overlay */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={() => toggleDrawer(false)}>
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Animated Drawer Panel */}
      <Animated.View
        style={[styles.drawerPanel, { transform: [{ translateX }] }]}
      >
        <View style={styles.safeArea}>
          <View style={styles.headerContainer}>
            <Image
              source={require('../../assets/logo/logo.png')}
              style={{
                width: width * 0.1,
                height: width * 0.1,
                marginLeft: theme.spacing(2),
              }}
            />
            <Text style={styles.headerTitle}>NovaNotes</Text>
          </View>

          <View style={styles.drawerContent}>
            {/* Scrollable section */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <DrawerItem label="Notes" icon="lightbulb-outline" />
              <DrawerItem label="Archived" icon="archive-outline" />
              <DrawerItem label="Deleted" icon="trash-can-outline" />
            </ScrollView>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.dark,
  },

  mainContent: {
    flex: 1,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.dark,
    zIndex: 10,
  },

  drawerPanel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#1C1C1E', // Elevated dark surface
    zIndex: 20,
    borderTopRightRadius: theme.borderRadius.large,
    borderBottomRightRadius: theme.borderRadius.large,
    ...theme.elevation.depth3,
  },

  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.024,
  },

  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.primary,
    fontFamily: theme.typography.black,
    letterSpacing: 0.5,
  },

  scrollContent: {
    paddingRight: theme.spacing(1.5),
  },

  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.016,
    paddingHorizontal: theme.spacing(3),
    borderTopRightRadius: theme.borderRadius.circle,
    borderBottomRightRadius: theme.borderRadius.circle,
  },

  activeItem: {
    backgroundColor: theme.colors.primary,
  },

  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  label: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray,
    marginLeft: theme.spacing(3),
    fontFamily: theme.typography.medium,
  },

  activeLabel: {
    color: theme.colors.dark,
    fontFamily: theme.typography.bold,
  },

  drawerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
});
