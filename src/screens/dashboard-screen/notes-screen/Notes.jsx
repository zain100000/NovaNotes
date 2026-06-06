/**
 * @file NotesScreen.jsx
 * @module Screens/Main/Notes
 * @description Offline-first dashboard featuring a local 2-column grid.
 * No backend syncing or token management required.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Header from '../../../utilities/custom-components/header/header/Header.header';
import NoteCard from '../../../utilities/custom-components/card/note-card/Note.card';
import { theme } from '../../../styles/Themes';
import { useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SelectionModal from '../../../utilities/custom-components/modal/Selection.modal';
import { useNavigation } from '@react-navigation/native';
import { useStatusBarConfig } from '../../../utilities/custom-hooks/status-bar/StatusBar.hook';
import PopOver from '../../../utilities/custom-components/pop-over/PopOver.utility';

const { width, height } = Dimensions.get('window');

const NotesScreen = ({ openDrawer }) => {
  useStatusBarConfig();
  const navigation = useNavigation();

  // 1. Selector logic: Get notes directly from the persisted Redux state
  // No "loading" or "isInitialLoad" needed because data is local and instant
  const notes = useSelector(state => state.note?.notes) || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showNoteTypePopover, setShowNoteTypePopover] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // 2. Navigation & Selection logic
  const handlePress = id => {
    if (selectedIds.length > 0) {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
      );
      return;
    }

    const selectedNote = notes.find(n => n.id === id);
    navigation.navigate('NoteView', { note: selectedNote });
  };

  const handleLongPress = id => {
    setSelectedIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  const clearSelection = () => setSelectedIds([]);

  // 3. Animations
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fadeAnim, floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  // 4. Filtering (Local Search)
  const filteredNotes = notes.filter(
    note =>
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="lightbulb-on-outline"
            size={width * 0.15}
            color={theme.colors.primary}
          />
        </View>
      </Animated.View>
      <Text style={styles.emptyTitle}>Your notes are empty</Text>
      <Text style={styles.emptySubtitle}>Notes you add appear here</Text>
    </Animated.View>
  );

  const handleNoteTypeSelect = type => {
    setShowNoteTypePopover(false);
    navigation.navigate('CreateNote', {
      type,
      fromScreen: 'NotesScreen',
    });
  };

  return (
    <View style={styles.container}>
      <Header
        openDrawer={openDrawer}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search"        
      />

      <View style={styles.content}>
        <FlatList
          data={filteredNotes}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[
            styles.listContent,
            filteredNotes.length === 0 && { flex: 1 },
            selectedIds.length > 0 && { paddingTop: theme.spacing(10) },
          ]}
          showsVerticalScrollIndicator={false}
          // Note: RefreshControl removed because there is no backend to "pull" from
          renderItem={({ item }) => (
            <NoteCard
              title={item.title}
              content={item.content}
              isSelected={selectedIds.includes(item.id)}
              onPress={() => handlePress(item.id)}
              onLongPress={() => handleLongPress(item.id)}
              isPinned={item.isPinned}
              backgroundColor={item.backgroundColor}
              tags={item.tags}
              type={item.type || 'text'}
              checklistItems={item.checklistItems || []}
            />
          )}
          ListEmptyComponent={renderEmptyState}
        />
      </View>

      {!showNoteTypePopover && (
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => setShowNoteTypePopover(true)}
          >
            <MaterialCommunityIcons
              name="plus"
              size={width * 0.08}
              color={theme.colors.dark}
            />
          </TouchableOpacity>
        </View>
      )}

      <SelectionModal
        isVisible={selectedIds.length > 0}
        selectionCount={selectedIds.length}
        selectedIds={selectedIds}
        onClose={clearSelection}
      />

      <PopOver
        isVisible={showNoteTypePopover}
        onClose={() => setShowNoteTypePopover(false)}
        onSelect={handleNoteTypeSelect}
      />
    </View>
  );
};

export default NotesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d1b1b',
  },

  content: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: height * 0.15,
  },

  columnWrapper: {
    gap: theme.spacing(1),
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconCircle: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: (width * 0.25) / 2,
    backgroundColor: 'rgba(246, 195, 67, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },

  emptyTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    marginBottom: theme.spacing(1),
  },

  emptySubtitle: {
    color: theme.colors.gray,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.medium,
    opacity: 0.5,
    textAlign: 'center',
  },

  addButtonContainer: {
    position: 'absolute',
    bottom: height * 0.03,
    right: width * 0.05,
    zIndex: 10,
  },

  addButton: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: (width * 0.15) / 2,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
