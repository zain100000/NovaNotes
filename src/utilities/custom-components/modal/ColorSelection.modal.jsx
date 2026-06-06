/**
 * @file ColorSelectionModal.jsx
 * @module Components/Modal/ColorSelectionModal
 * @description Modal for selecting note colors. Integrates with Redux for state updates.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { theme } from '../../../styles/Themes';

const { width, height } = Dimensions.get('window');

const COLORS = [
  'transparent',
  '#E57373',
  '#FFB74D',
  '#FFF176',
  '#A5D6A7',
  '#80DEEA',
  '#90CAF9',
  '#CE93D8',
  '#F48FB1',
  '#D7CCC8',
];

const ColorSelectionModal = ({
  isVisible,
  onClose,
  onSelectColor,
  currentColor,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Note colour</Text>
          <View style={styles.colorGrid}>
            {COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorCircle,
                  {
                    backgroundColor:
                      color === 'transparent' ? '#1d1b1b' : color,
                  },
                  color === 'transparent' && styles.noColorBorder,
                ]}
                onPress={() =>
                  onSelectColor(color === 'transparent' ? null : color)
                }
              >
                {/* Show block icon for No Color, otherwise show checkmark */}
                {color === 'transparent'
                  ? (!currentColor || currentColor === null) && (
                      <FontAwesome6
                        name="droplet-slash"
                        size={width * 0.06}
                        color={theme.colors.white}
                      />
                    )
                  : currentColor === color && (
                      <MaterialCommunityIcons
                        name="check"
                        size={width * 0.06}
                        color="#1d1b1b"
                      />
                    )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ColorSelectionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: width * 0.9,
    backgroundColor: '#202124',
    borderRadius: theme.borderRadius.large,
    padding: height * 0.04,
    gap: theme.gap(1),
    elevation: 5,
  },

  title: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.medium,
    marginBottom: height * 0.02,
  },

  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.gap(1.8),
  },

  colorCircle: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.08,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  noColorBorder: {
    borderWidth: 2,
    borderColor: theme.colors.gray,
  },
});
