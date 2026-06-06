/**
 * @file ArchivedNotesScreen.jsx
 * @module Screens/Main/ArchivedNotes
 * @description Screen to display archived notes from local Redux state.
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
} from 'react-native';
import Header from '../../../utilities/custom-components/header/header/Header.header';
import NoteCard from '../../../utilities/custom-components/card/note-card/Note.card';
import { theme } from '../../../styles/Themes';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useStatusBarConfig } from '../../../utilities/custom-hooks/status-bar/StatusBar.hook';

const { width, height } = Dimensions.get('window');

const ArchivedNotesScreen = ({ openDrawer }) => {
  useStatusBarConfig();

  const navigation = useNavigation();


  // Access local state from your noteSlice
  const archivedNotes = useSelector(state => state.note.archivedNotes) || [];
  const isLoading = useSelector(state => state.note.loading);

  const [searchQuery, setSearchQuery] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Initial Animation Load
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
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
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const filteredNotes = archivedNotes.filter(
    note =>
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderEmptyState = () => {
    if (isLoading && archivedNotes.length === 0) {
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
              name="archive-outline"
              size={width * 0.16}
              color={theme.colors.primary}
            />
          </View>
        </Animated.View>
        <Text style={styles.emptyTitle}>No Archived Notes</Text>
        <Text style={styles.emptySubtitle}>
          Archived notes will appear here
        </Text>
      </Animated.View>
    );
  };

  const handlePress = note => {
    navigation.navigate('NoteView', { note });
  };

  return (
    <View style={styles.container}>
      <Header
        openDrawer={openDrawer}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search Archived Hive"        
      />

      <View style={styles.content}>
        <FlatList
          data={filteredNotes}
          // Updated to use 'id' as per your local slice logic
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[
            styles.listContent,
            filteredNotes.length === 0 && { flex: 1 },
          ]}
          // Disable scrolling if the list is empty (fixes the centered state issue)
          scrollEnabled={filteredNotes.length > 0}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <NoteCard
              title={item.title}
              content={item.content}
              isPinned={item.isPinned}
              backgroundColor={item.backgroundColor}
              tags={item.tags}
              type={item.type || 'text'}
              checklistItems={item.checklistItems || []}
              onPress={() => handlePress(item)}
            />
          )}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </View>
  );
};

export default ArchivedNotesScreen;

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
    paddingTop: theme.spacing(2),
    paddingBottom: height * 0.1,
  },

  columnWrapper: {
    justifyContent: 'space-between',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Slight offset upwards for better visual balance
    paddingBottom: height * 0.1,
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

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
