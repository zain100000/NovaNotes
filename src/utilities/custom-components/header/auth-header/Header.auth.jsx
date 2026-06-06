/**
 * @file Auth Header.jsx
 * @module AuthHeader
 * @description A sleek and modern authentication header component for NovaNotes, designed to enhance the user experience during sign-in and sign-up processes. This component features a stylish logo display and a bold, welcoming title, all crafted with a contemporary aesthetic that aligns with NovaNotes's brand identity. The AuthHeader is built to be responsive and visually appealing, making it an essential part of the onboarding journey for new users.
 */

import React from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import { theme } from '../../../../styles/Themes';

const { width, height } = Dimensions.get('window');

const AuthHeader = ({ logo, title }) => {
  return (
    <View style={styles.headerContainer}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.authText}>{title}</Text>
    </View>
  );
};

export default AuthHeader;

const styles = StyleSheet.create({
  headerContainer: {
    height: height * 0.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: width * 0.6,
    height: height * 0.16,
    objectFit: 'contain',
    resizeMode: 'contain',
  },

  authText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.bold,
    marginLeft: -width * 0.064,
  },
});
