/**
 * @file Splash.jsx
 * @module Components/Splash
 * @description A visually engaging splash screen for NovaNotes, featuring dynamic animations, a gradient background, and optimized session checking using TanStack Query and AsyncStorage.
 */

import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { theme } from '../../styles/Themes';
import { useStatusBarConfig } from '../../utilities/custom-hooks/status-bar/StatusBar.hook';
import { useSessionCheck } from '../../utilities/custom-hooks/check-session/CheckSession.hook';

const { width, height } = Dimensions.get('screen');

const customLogoEntry = {
  0: {
    opacity: 0,
    scale: 0.3,
    translateY: 100,
    rotate: '-12deg',
  },
  0.5: {
    opacity: 1,
    scale: 1.15,
    translateY: -20,
    rotate: '4deg',
  },
  1: {
    opacity: 1,
    scale: 1,
    translateY: 0,
    rotate: '0deg',
  },
};

const Splash = () => {
  useStatusBarConfig();

  useSessionCheck(2500);

  return (
    <View style={styles.container}>
      <Animatable.View
        animation="fadeIn"
        duration={3000}
        style={StyleSheet.absoluteFill}
      >
        <LinearGradient
          colors={[
            theme.colors.primary,
            theme.colors.tertiary,
            theme.colors.secondary,
          ]}
          start={{ x: 0.4, y: 0 }}
          end={{ x: 0.6, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animatable.View>

      <Animatable.View
        animation={{
          0: { scale: 1, opacity: 0.3 },
          0.5: { scale: 1.2, opacity: 0.8 },
          1: { scale: 1, opacity: 0.3 },
        }}
        iterationCount="infinite"
        duration={7000}
        easing="ease-in-out"
        style={styles.glow1}
      />

      <Animatable.View
        animation={{
          0: { scale: 1, opacity: 0.3 },
          0.5: { scale: 1.3, opacity: 0.7 },
          1: { scale: 1, opacity: 0.3 },
        }}
        iterationCount="infinite"
        duration={9000}
        delay={2000}
        easing="ease-in-out"
        style={styles.glow2}
      />

      <View style={styles.content}>
        <Animatable.View
          animation={customLogoEntry}
          duration={800}
          delay={200}
          style={styles.logoContainer}
        >
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={4000}
            easing="ease-in-out"
          >
            <Animatable.Image
              source={require('../../assets/logo/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animatable.View>
        </Animatable.View>

        <View style={styles.textWrapper}>
          <Animatable.View
            animation="zoomIn"
            duration={800}
            delay={1000}
            style={styles.separatorContainer}
          >
            <LinearGradient
              colors={[
                'transparent',
                theme.colors.primary,
                theme.colors.secondary,
                theme.colors.primary,
                'transparent',
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.separator}
            />
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={1000} delay={1400}>
            <Text style={styles.taglineMain}>NOVA</Text>
            <View style={styles.highlightContainer}>
              <View
                style={[
                  styles.highlightBackground,
                  { backgroundColor: theme.colors.secondary },
                ]}
              />
              <Text style={styles.taglineHighlight}>NOTES</Text>
            </View>
          </Animatable.View>

          <Animatable.Text
            animation="fadeInUp"
            duration={1000}
            delay={1400}
            style={styles.taglineSub}
          >
            Capture your thoughts in a flash
          </Animatable.Text>
        </View>
      </View>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  glow1: {
    position: 'absolute',
    top: height * 0.1,
    left: -width * 0.3,
    width: width * 1.4,
    height: height * 1.4,
    borderRadius: (width * 1.4) / 2,
    backgroundColor: '#ffffff18',
  },

  glow2: {
    position: 'absolute',
    bottom: -width * 0.4,
    right: -width * 0.2,
    width: width * 1.2,
    height: height * 1.2,
    borderRadius: (width * 1.2) / 2,
    backgroundColor: theme.colors.primary + '30',
  },

  logoContainer: {
    marginBottom: theme.spacing(5),
  },

  logo: {
    width: width * 0.75,
    height: height * 0.3,
  },

  textWrapper: {
    alignItems: 'center',
  },

  separatorContainer: {
    width: width * 0.6,
    height: height * 0.005,
    marginVertical: theme.spacing(3),
  },

  separator: {
    flex: 1,
  },

  taglineMain: {
    fontFamily: theme.typography.semiBold,
    fontSize: theme.typography.fontSize.xxl,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: width * 0.02,
    textAlign: 'center',
  },

  highlightContainer: {
    position: 'relative',
    marginTop: -theme.spacing(1),
  },

  highlightBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.borderRadius.medium,
    opacity: 0.3,
  },

  taglineHighlight: {
    fontFamily: theme.typography.semiBold,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.white,
    letterSpacing: width * 0.02,
    textAlign: 'center',
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1),
  },

  taglineSub: {
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: width * 0.002,
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
});
