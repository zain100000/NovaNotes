/**
 * @file PopOver utility.jsx
 * @module Components/Modal/PopOver
 * @description PopOver for selecting list and text notes
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../../styles/Themes';

const NOTE_TYPES = [
  { type: 'checklist', icon: 'checkbox-marked-outline', label: 'List' },
  { type: 'text', icon: 'format-text', label: 'Text' },
];

const { width, height } = Dimensions.get('window');

const PopOver = ({ isVisible, onClose, onSelect }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setShouldRender(false);
      });
    }
  }, [isVisible, animation]);

  if (!shouldRender) return null;

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const overlayOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
      </TouchableWithoutFeedback>

      <View style={styles.container}>
        {NOTE_TYPES.map((item, index) => {
          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [50 * (index + 1), 0],
          });

          return (
            <Animated.View
              key={item.type}
              style={{
                opacity: opacity,
                transform: [{ translateY }],
                marginBottom: height * 0.02,
              }}
            >
              <TouchableOpacity
                style={styles.pillButton}
                onPress={() => onSelect(item.type)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={width * 0.06}
                  color={theme.colors.white}
                />
                <Text style={styles.label}>{item.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        <Animated.View style={{ opacity: opacity }}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.9}
          >
            <MaterialCommunityIcons
              name="close"
              size={width * 0.06}
              color={theme.colors.dark}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default PopOver;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },

  container: {
    position: 'absolute',
    bottom: height * 0.03,
    right: width * 0.05,
    alignItems: 'flex-end',
    zIndex: 1001,
  },

  pillButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    paddingVertical: height * 0.016,
    paddingHorizontal: width * 0.02,
    borderRadius: theme.borderRadius.circle,
    minWidth: width * 0.3,
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  label: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.medium,
    marginRight: width * 0.034,
  },

  closeButton: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: (width * 0.15) / 2,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});
