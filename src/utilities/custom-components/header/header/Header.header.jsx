/**
 * @file Header.js
 * @module Components/Utility/Header
 * @description
 * A streamlined, Google Keep-inspired header. Features a pill-shaped search bar
 * with a menu trigger and an external user avatar.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../../../styles/Themes';
import InputField from '../../input-field/InputField.utility';

const { width, height } = Dimensions.get('window');

const Header = ({
  openDrawer,
  userAvatar,
  searchQuery,
  setSearchQuery,
  placeholder = 'Search Keep',
  onPress,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.headerWrapper, { opacity: fadeAnim }]}>
      {/* Search Bar Pill */}
      <View style={styles.searchPill}>
        <TouchableOpacity
          onPress={openDrawer}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="menu"
            size={24}
            color={theme.colors.gray}
          />
        </TouchableOpacity>

        <TextInput
          placeholder={placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.inputContainer}
          inputStyle={styles.textInput}
          placeholderTextColor={theme.colors.white + '99'}
        />
      </View>

      {/* Avatar Outside the Search Bar */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.avatarWrapper}
        onPress={onPress}
      >
        <Image
          source={
            userAvatar
              ? { uri: userAvatar }
              : require('../../../../assets/placeHolder/placeholder.png')
          }
          style={styles.avatar}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing(2),
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: theme.spacing(1),
    backgroundColor: 'transparent',
  },

  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2e30',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: theme.spacing(1.5),
    marginRight: theme.spacing(1.5),
    ...theme.elevation.depth1,
  },

  iconButton: {
    padding: theme.spacing(0.5),
  },

  inputContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    height: '100%',
  },

  textInput: {
    color: theme.colors.white,
    fontFamily: theme.typography.semiBold,
    fontSize: theme.typography.fontSize.sm,
    marginLeft: theme.spacing(1),
  },

  avatar: {
    width: width * 0.11,
    height: width * 0.11, // must match width
    borderRadius: (width * 0.25) / 2,
    resizeMode: 'cover',
  },
});
