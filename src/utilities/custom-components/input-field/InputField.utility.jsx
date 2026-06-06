/**
 * @file InputField.jsx
 * @module Components/InputField
 * @description A focused text input component for NovaNotes that supports customizable icons,
 * secure entry, and multiline support.
 */

import React from 'react';
import {
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { theme } from '../../../styles/Themes';
import { globalStyles } from '../../../styles/GlobalStyles';

const { width } = Dimensions.get('screen');

const InputField = ({
  value,
  onChangeText,
  placeholder = '',
  style,
  inputStyle,
  secureTextEntry = false,
  editable = true,
  keyboardType = 'default',
  multiline = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  maxLength,
}) => {
  const containerStyle = [globalStyles.inputContainer, style];

  return (
    <View style={containerStyle}>
      <View
        style={[styles.inputWrapper, { borderColor: theme.colors.primary }]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.gray}
          secureTextEntry={secureTextEntry}
          editable={editable}
          keyboardType={keyboardType}
          multiline={multiline}
          maxLength={maxLength}
          style={[
            globalStyles.input,
            styles.textInput,
            multiline && styles.multiline,
            leftIcon && styles.withLeftIcon,
            rightIcon && styles.withRightIcon,
            inputStyle,
          ]}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
  },

  textInput: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    fontFamily: theme.typography.medium,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.dark,
  },

  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingVertical: 14,
  },

  withLeftIcon: {
    paddingLeft: width * 0.12,
  },

  withRightIcon: {
    paddingRight: width * 0.12,
  },

  leftIconContainer: {
    position: 'absolute',
    left: width * 0.035,
    zIndex: 1,
  },

  rightIconContainer: {
    position: 'absolute',
    right: width * 0.02,
    padding: 10,
  },
});
