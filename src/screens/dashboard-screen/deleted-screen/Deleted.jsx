/**
 * @file DeletedNotesScreen.jsx
 * @module Screens/Main/DeletedNotes
 * @description Screen to display deleted notes from local Redux state.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Animated,
  Easing,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../../styles/Themes';
import NoteCard from '../../../utilities/custom-components/card/note-card/Note.card';
import { useSelector, useDispatch } from 'react-redux';
import { restoreNote, emptyTrash } from '../../../redux/slices/note.slices'; // Updated to use your local slice actions
import { useNavigation } from '@react-navigation/native';
import { useStatusBarConfig } from '../../../utilities/custom-hooks/status-bar/StatusBar.hook';
import Modal from '../../../utilities/custom-components/modal/Modal.utility';

const { width, height } = Dimensions.get('window');

const DeletedNotesScreen = ({ openDrawer }) => {
  useStatusBarConfig();

  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Access local state from your noteSlice
  const trashedNotes = useSelector(state => state.note.trashedNotes) || [];
  const isLoading = useSelector(state => state.note.loading);

  const [selectedIds, setSelectedIds] = useState([]);
  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Animation logic remains the same
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleEmptyTrash = () => {
    setShowEmptyTrashModal(true);
  };

  const confirmEmptyTrash = () => {
    setIsProcessing(true);
    // Offline actions are synchronous
    dispatch(emptyTrash());
    setShowEmptyTrashModal(false);
    setIsProcessing(false);
  };

  const handleRestore = () => {
    const idsToRestore =
      selectedIds.length > 0 ? selectedIds : trashedNotes.map(n => n.id);

    if (idsToRestore.length === 0) return;

    setIsProcessing(true);
    // Loop through selected IDs and dispatch restore action
    idsToRestore.forEach(id => {
      dispatch(restoreNote(id));
    });

    setSelectedIds([]);
    setIsProcessing(false);
  };

  const handlePress = note => {
    if (selectedIds.length > 0) {
      toggleSelection(note.id);
    } else {
      navigation.navigate('NoteView', { note, readOnly: true });
    }
  };

  const handleLongPress = id => {
    if (selectedIds.length === 0) {
      setSelectedIds([id]);
    }
  };

  const toggleSelection = id => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    return (
      <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
        <Animated.View style={{ transform: [{ translateY }] }}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="delete-empty-outline"
              size={width * 0.17}
              color={theme.colors.primary}
            />
          </View>
        </Animated.View>
        <Text style={styles.emptyTitle}>Trash is Empty</Text>
        <Text style={styles.emptySubtitle}>Deleted notes will appear here</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.minimalHeader}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={openDrawer} style={styles.drawerBtn}>
            <MaterialCommunityIcons
              name="menu"
              size={width * 0.06}
              color={theme.colors.gray}
            />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Trash</Text>
        </View>

        <View style={styles.headerActions}>
          {(selectedIds.length > 0 || trashedNotes.length > 0) && (
            <TouchableOpacity
              onPress={handleRestore}
              style={styles.restoreButton}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="restore"
                size={width * 0.05}
                color={theme.colors.dark}
              />
              <Text style={styles.restoreText}>
                {selectedIds.length > 0
                  ? `Restore (${selectedIds.length})`
                  : 'Restore All'}
              </Text>
            </TouchableOpacity>
          )}

          {trashedNotes.length > 0 && selectedIds.length === 0 && (
            <TouchableOpacity
              onPress={handleEmptyTrash}
              style={styles.emptyTrashButton}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="delete-empty-outline"
                size={width * 0.06}
                color={theme.colors.error}
              />
              <Text style={styles.emptyTrashText}>Empty</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.warningBanner}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={width * 0.06}
          color={theme.colors.secondary}
        />
        <Text style={styles.warningText}>
          Notes in trash are read-only & cannot be modified!
        </Text>
      </View>

      <FlatList
        data={trashedNotes}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        // 1. Conditionally apply flex: 1 to the container so the empty state fills the screen
        contentContainerStyle={[
          styles.listContent,
          trashedNotes.length === 0 && { flex: 1 },
        ]}
        // 2. Disable scrolling entirely when there are no notes
        scrollEnabled={trashedNotes.length > 0}
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <NoteCard
              title={item.title}
              content={item.content}
              backgroundColor={item.backgroundColor || '#202124'}
              tags={item.tags}
              isSelected={isSelected}
              type={item.type || 'text'}
              checklistItems={item.checklistItems || []}
              onPress={() => handlePress(item)}
              onLongPress={() => handleLongPress(item.id)}
            />
          );
        }}
        ListEmptyComponent={renderEmptyState}
      />

      <Modal
        isOpen={showEmptyTrashModal}
        onClose={() => setShowEmptyTrashModal(false)}
        title="Empty Trash"
        subtitle={`Permanently delete all ${trashedNotes.length} notes in trash? This action cannot be undone.`}
        buttons={[
          {
            label: 'Cancel',
            onClick: () => setShowEmptyTrashModal(false),
            variant: 'secondary',
          },
          {
            label: isProcessing ? 'Deleting...' : 'Empty Trash',
            onClick: confirmEmptyTrash,
            variant: 'danger',
            disabled: isProcessing,
          },
        ]}
      />
    </View>
  );
};

export default DeletedNotesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d1b1b',
  },

  minimalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: height * 0.06,
    paddingHorizontal: width * 0.04,
    paddingBottom: height * 0.02,
  },

  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  drawerBtn: {
    padding: height * 0.01,
  },

  screenTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
    fontFamily: theme.typography.medium,
    marginLeft: width * 0.02,
  },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.12)',
    paddingVertical: height * 0.014,
    paddingHorizontal: width * 0.04,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 152, 0, 0.25)',
  },

  warningText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.medium,
    marginLeft: width * 0.02,
  },

  listContent: {
    paddingHorizontal: width * 0.02,
    paddingTop: height * 0.01,
    paddingBottom: height * 0.12,
  },

  columnWrapper: {
    justifyContent: 'space-between',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconCircle: {
    width: width * 0.33,
    height: width * 0.33,
    borderRadius: width * 0.165,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },

  emptyTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    marginBottom: height * 0.02,
  },

  emptySubtitle: {
    color: theme.colors.gray,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
    textAlign: 'center',
    lineHeight: 22,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconButton: {
    alignSelf: 'flex-end',
  },

  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.012,
    borderRadius: theme.borderRadius.large,
    gap: theme.gap(1),
  },

  restoreText: {
    color: theme.colors.dark,
    fontFamily: theme.typography.semiBold,
    fontSize: theme.typography.fontSize.xs,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
  },

  emptyTrashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.error,
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.01,
    borderRadius: theme.borderRadius.large,
  },

  emptyTrashText: {
    color: theme.colors.error,
    fontFamily: theme.typography.semiBold,
    marginLeft: width * 0.02,
    fontSize: theme.typography.fontSize.sm,
  },
});
