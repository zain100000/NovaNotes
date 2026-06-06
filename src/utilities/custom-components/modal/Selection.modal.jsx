/**
 * @file SelectionModal.jsx
 * @module Components/Modal/SelectionModal
 * @description Selection action bar for bulk actions.
 * Optimized for synchronous offline Redux state updates.
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../../styles/Themes';
import { useDispatch, useSelector } from 'react-redux';
import {
  trashNote,
  toggleArchiveNote,
  togglePinNote,
  updateNote,
} from '../../../redux/slices/note.slices'; // Ensure path is correct
import ColorSelectionModal from './ColorSelection.modal';
import Modal from '../../../utilities/custom-components/modal/Modal.utility';

const { width, height } = Dimensions.get('window');

const SelectionModal = ({
  isVisible,
  onClose,
  selectionCount,
  selectedIds = [],
}) => {
  const dispatch = useDispatch();
  const notes = useSelector(state => state.note.notes);

  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const ids = useMemo(
    () => (Array.isArray(selectedIds) ? selectedIds.filter(Boolean) : []),
    [selectedIds],
  );

  // Find first note to get current color context
  const firstNote = notes.find(n => n.id === ids?.[0]);
  const currentBgColor = firstNote?.backgroundColor;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  // --- ACTIONS (SYNCHRONOUS) ---

  const handleTogglePin = () => {
    ids.forEach(id => dispatch(togglePinNote(id)));
    onClose();
  };

  const handleToggleArchive = () => {
    ids.forEach(id => dispatch(toggleArchiveNote(id)));
    onClose();
  };

  const handleDelete = () => {
    if (!ids.length) return;
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirmation(false);
    // Use trashNote as per your new slice logic for soft deletion
    ids.forEach(id => dispatch(trashNote(id)));
    onClose();
  };

  const handleColorSelect = color => {
    ids.forEach(id =>
      dispatch(
        updateNote({
          noteId: id,
          data: { backgroundColor: color },
        }),
      ),
    );
    setColorModalVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <>
      <Animated.View
        style={[
          styles.selectionBar,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons
              name="close"
              size={width * 0.06}
              color={theme.colors.white}
            />
          </TouchableOpacity>
          <Text style={styles.countText}>{selectionCount}</Text>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity onPress={handleTogglePin} style={styles.iconButton}>
            <MaterialCommunityIcons
              name="pin-outline"
              size={width * 0.06}
              color={theme.colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleToggleArchive}
            style={styles.iconButton}
          >
            <MaterialCommunityIcons
              name="archive-outline"
              size={width * 0.06}
              color={theme.colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setColorModalVisible(true)}
            style={styles.iconButton}
          >
            <MaterialCommunityIcons
              name="palette-outline"
              size={width * 0.06}
              color={theme.colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={width * 0.06}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ColorSelectionModal
        isVisible={colorModalVisible}
        onClose={() => setColorModalVisible(false)}
        onSelectColor={handleColorSelect}
        currentColor={currentBgColor}
      />

      <Modal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        title="Move to Trash"
        subtitle={
          ids.length > 1
            ? `Move ${ids.length} notes to trash?`
            : 'Move this note to trash?'
        }
        buttons={[
          {
            label: 'Cancel',
            onClick: () => setShowDeleteConfirmation(false),
            variant: 'secondary',
          },
          {
            label: 'Trash',
            onClick: confirmDelete,
            variant: 'danger',
          },
        ]}
      />
    </>
  );
};

export default SelectionModal;

const styles = StyleSheet.create({
  selectionBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    elevation: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1d1b1b',
    paddingTop: height * 0.05,
    paddingBottom: height * 0.02,
    paddingHorizontal: theme.spacing(2),
    borderBottomWidth: 1,
    borderColor: '#3c4043',
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
    top: height * 0.009,
  },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
    top: height * 0.009,
  },

  iconButton: {
    padding: theme.spacing(1),
  },
  
  countText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.regular,
  },
});
