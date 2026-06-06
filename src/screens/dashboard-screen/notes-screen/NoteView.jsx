/**
 * @file NoteView.jsx
 * @module Screens/Main/Notes
 * @description View for displaying a single note with edit capabilities.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../../styles/Themes';
import { useDispatch } from 'react-redux';
import {
  togglePinNote,
  toggleArchiveNote,
  updateNote,
} from '../../../redux/slices/note.slices';
import { useNavigation, useRoute } from '@react-navigation/native';
import { debounce } from 'lodash';
import { useStatusBarConfig } from '../../../utilities/custom-hooks/status-bar/StatusBar.hook';
import Clipboard from '@react-native-clipboard/clipboard';

const { width, height } = Dimensions.get('window');

const NoteViewScreen = () => {
  useStatusBarConfig();

  const { note, readOnly } = useRoute().params;
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const addInputRef = useRef(null);
  const scrollRef = useRef(null); // Ref for scrolling to bottom

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [tags, setTags] = useState(note?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isArchived, setIsArchived] = useState(note?.isArchived || false);
  const [copied, setCopied] = useState(false);
  const [noteType, setNoteType] = useState(note?.type || 'text');
  const [checklistItems, setChecklistItems] = useState(() => {
    if (note?.checklistItems && note.checklistItems.length > 0) {
      return note.checklistItems.map(item => ({
        text: item.text || '',
        isChecked: item.isChecked === true,
        _id: item._id || item.id || `temp-${Date.now()}-${Math.random()}`,
      }));
    }
    return [];
  });
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const copyAnimRef = useRef(null);

  const bgColor = note?.backgroundColor || '#1d1b1b';
  const isReadOnly = readOnly || note?.isDeleted === true;
  const mainRef = useRef(null);

  useEffect(() => {
    mainRef.current?.animate({
      from: { opacity: 0.7, scale: 0.93, translateY: 25 },
      to: { opacity: 1, scale: 1, translateY: 0 },
      duration: 650,
      easing: 'ease-out-quart',
    });
  }, []);

  useEffect(() => {
    if (!isReadOnly) {
      debouncedSave(title, content, tags, noteType, checklistItems);
    }
    return () => debouncedSave.cancel();
  }, [
    title,
    content,
    tags,
    noteType,
    checklistItems,
    debouncedSave,
    isReadOnly,
  ]);

  const handleBack = () => {
    if (!isReadOnly) debouncedSave.flush();
    mainRef.current?.animate({
      from: { opacity: 1, scale: 1, translateY: 0 },
      to: { opacity: 0.6, scale: 0.92, translateY: 30 },
      duration: 320,
      easing: 'ease-in-quart',
    });
    setTimeout(() => navigation.goBack(), 180);
  };

  const handleTogglePin = () => {
    if (isReadOnly) return;
    setIsPinned(!isPinned);
    dispatch(togglePinNote(note._id || note.id));
  };

  const handleToggleArchive = () => {
    if (isReadOnly) return;
    setIsArchived(!isArchived);
    dispatch(toggleArchiveNote(note._id || note.id));
    navigation.goBack();
  };

  const debouncedSave = useCallback(
    debounce(
      (nextTitle, nextContent, nextTags, nextNoteType, nextChecklistItems) => {
        const hasChanged =
          nextTitle !== note.title ||
          nextContent !== note.content ||
          JSON.stringify(nextTags) !== JSON.stringify(note.tags) ||
          nextNoteType !== note.type ||
          JSON.stringify(nextChecklistItems) !==
            JSON.stringify(note.checklistItems);

        if (hasChanged) {
          const cleanedChecklist = nextChecklistItems.map(
            ({ _id, ...item }) => item,
          );
          dispatch(
            updateNote({
              noteId: note._id || note.id,
              data: {
                title: nextTitle,
                content: nextContent,
                tags: nextTags,
                type: nextNoteType,
                checklistItems: cleanedChecklist,
              },
            }),
          );
        }
      },
      1000,
    ),
    [
      note.id,
      note._id,
      note.title,
      note.content,
      note.tags,
      note.type,
      JSON.stringify(note.checklistItems),
      dispatch,
    ],
  );

  const handleAddTag = () => {
    if (isReadOnly) return;
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      // Scroll to bottom so the new tag is visible
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const removeTag = indexToRemove => {
    if (isReadOnly) return;
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleAddChecklistItem = () => {
    if (isReadOnly) return;
    if (newChecklistItem && newChecklistItem.trim()) {
      const newItem = {
        text: newChecklistItem.trim(),
        isChecked: false,
        _id: `temp-${Date.now()}-${Math.random()}`,
      };
      setChecklistItems(prev => [...prev, newItem]);
      setNewChecklistItem('');
      addInputRef.current?.focus();
    }
  };

  const handleToggleChecklistItem = index => {
    if (isReadOnly) return;
    setChecklistItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isChecked: !updated[index].isChecked,
      };
      return updated;
    });
  };

  const handleDeleteChecklistItem = index => {
    if (isReadOnly) return;
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleUpdateChecklistItemText = (index, newText) => {
    if (isReadOnly) return;
    setChecklistItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], text: newText };
      return updated;
    });
  };

  const copyToClipboard = () => {
    let fullNote = `${title}\n\n`;
    if (noteType === 'checklist') {
      fullNote += checklistItems
        .map(item => `${item.isChecked ? '✓' : '○'} ${item.text}`)
        .join('\n');
    } else {
      fullNote += content;
    }
    if (tags.length > 0) fullNote += `\n\nTags: ${tags.join(', ')}`;
    Clipboard.setString(fullNote);
    setCopied(true);
    copyAnimRef.current?.pulse(400);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderChecklist = () => (
    <View style={styles.checklistContainer}>
      {checklistItems.map((item, index) => (
        <View key={item._id || index} style={styles.checklistItemRow}>
          <TouchableOpacity
            onPress={() => handleToggleChecklistItem(index)}
            style={styles.checkboxButton}
            disabled={isReadOnly}
          >
            <MaterialCommunityIcons
              name={
                item.isChecked ? 'checkbox-marked' : 'checkbox-blank-outline'
              }
              size={24}
              color={item.isChecked ? theme.colors.primary : theme.colors.gray}
            />
          </TouchableOpacity>
          <TextInput
            style={[
              styles.checklistItemText,
              item.isChecked && styles.checkedChecklistItem,
            ]}
            value={item.text}
            onChangeText={newText =>
              handleUpdateChecklistItemText(index, newText)
            }
            editable={!isReadOnly}
            multiline
          />
          {!isReadOnly && (
            <TouchableOpacity
              onPress={() => handleDeleteChecklistItem(index)}
              style={styles.deleteChecklistButton}
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color="rgba(255,255,255,0.5)"
              />
            </TouchableOpacity>
          )}
        </View>
      ))}
      {!isReadOnly && (
        <View style={styles.addChecklistRow}>
          <MaterialCommunityIcons
            name="checkbox-blank-outline"
            size={24}
            color={theme.colors.gray}
          />
          <TextInput
            ref={addInputRef}
            style={styles.addChecklistInput}
            placeholder="Add checklist item..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={newChecklistItem}
            onChangeText={setNewChecklistItem}
            onSubmitEditing={handleAddChecklistItem}
            blurOnSubmit={false}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={handleAddChecklistItem}
            style={styles.addButton}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Animatable.View ref={mainRef} style={styles.mainContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={width * 0.06}
              color={theme.colors.white}
            />
          </TouchableOpacity>

          <View style={styles.rightIcons}>
            <View style={styles.typeIndicator}>
              <MaterialCommunityIcons
                name={
                  noteType === 'checklist'
                    ? 'format-list-checkbox'
                    : 'note-text-outline'
                }
                size={width * 0.05}
                color="rgba(255,255,255,0.6)"
              />
            </View>

            <TouchableOpacity
              onPress={handleTogglePin}
              style={[styles.iconBtn, isReadOnly && styles.disabledIcon]}
              disabled={isReadOnly}
            >
              <MaterialCommunityIcons
                name={isPinned ? 'pin' : 'pin-outline'}
                size={width * 0.06}
                color={
                  isReadOnly ? 'rgba(255,255,255,0.3)' : theme.colors.white
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleToggleArchive}
              style={[styles.iconBtn, isReadOnly && styles.disabledIcon]}
              disabled={isReadOnly}
            >
              <MaterialCommunityIcons
                name={isArchived ? 'archive' : 'archive-outline'}
                size={width * 0.06}
                color={
                  isReadOnly ? 'rgba(255,255,255,0.3)' : theme.colors.white
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={copyToClipboard}
              style={[styles.iconBtn, isReadOnly && styles.disabledIcon]}
              disabled={isReadOnly}
            >
              <Animatable.View
                ref={copyAnimRef}
                duration={300}
                transition="backgroundColor"
              >
                <MaterialCommunityIcons
                  name={copied ? 'check-circle' : 'clipboard-outline'}
                  size={width * 0.055}
                  color={
                    copied
                      ? theme.colors.success
                      : isReadOnly
                      ? 'rgba(255,255,255,0.3)'
                      : theme.colors.white
                  }
                />
              </Animatable.View>
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
          >
            <TextInput
              style={styles.titleInput}
              placeholder="Title"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={title}
              onChangeText={setTitle}
              multiline
              editable={!isReadOnly}
            />

            {noteType === 'checklist' ? (
              renderChecklist()
            ) : (
              <TextInput
                style={styles.contentInput}
                placeholder="Note"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                editable={!isReadOnly}
              />
            )}

            <View style={styles.tagContainer}>
              {tags.map((tag, index) => (
                <View
                  key={index}
                  style={[styles.tagChip, isReadOnly && styles.disabledTagChip]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      isReadOnly && styles.disabledTagText,
                    ]}
                  >
                    {tag}
                  </Text>
                  {!isReadOnly && (
                    <TouchableOpacity onPress={() => removeTag(index)}>
                      <MaterialCommunityIcons
                        name="close"
                        size={width * 0.04}
                        color={theme.colors.white}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {!isReadOnly && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <MaterialCommunityIcons
                    name="tag"
                    size={width * 0.04}
                    color="rgba(255,255,255,0.3)"
                  />
                  <TextInput
                    style={styles.tagInput}
                    placeholder="Add tags..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={handleAddTag}
                    onBlur={false}
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animatable.View>
    </View>
  );
};

export default NoteViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d1b1b',
  },

  mainContent: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.024,
    paddingTop: Platform.OS === 'ios' ? height * 0.06 : height * 0.06,
    paddingBottom: height * 0.02,
  },

  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
  },

  typeIndicator: {
    padding: height * 0.01,
    borderRadius: theme.borderRadius.large,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: theme.spacing(1),
  },

  iconBtn: {
    padding: height * 0.01,
    borderRadius: theme.borderRadius.large,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  disabledIcon: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  scrollContent: {
    paddingHorizontal: width * 0.024,
    paddingTop: height * 0.02,
    paddingBottom: Platform.OS === 'ios' ? height * 0.4 : height * 0.2,
  },

  titleInput: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.white,
    marginBottom: height * 0.015,
    marginLeft: width * 0.008,
  },

  contentInput: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: theme.colors.white,
    lineHeight: 30,
    padding: height * 0.01,
    minHeight: height * 0.3,
  },

  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.gap(2),
    marginTop: theme.spacing(2),
    paddingHorizontal: width * 0.008,
  },

  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.01,
    borderRadius: theme.borderRadius.large,
    gap: theme.gap(2),
  },

  tagText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.regular,
  },

  tagInput: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.regular,
    color: theme.colors.white,
    minWidth: width * 0.08,
    left: width * 0.02,
    padding: 0,
  },

  checklistContainer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },

  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(1.5),
    paddingHorizontal: theme.spacing(1),
  },

  checkboxButton: {
    width: width * 0.04,
    height: width * 0.04,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.04,
  },

  addChecklistText: {
    flex: 1,
    color: 'rgba(255,255,255,0.6)',
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.regular,
    marginLeft: width * 0.02,
  },

  addChecklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.01,
    paddingVertical: height * 0.01,
  },

  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: height * 0.01,
  },

  checklistItemText: {
    flex: 1,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.regular,
    paddingVertical: height * 0.01,
    bottom: height * 0.01,
    color: theme.colors.white,
  },

  checkedChecklistItem: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },

  deleteChecklistButton: {
    padding: theme.spacing(0.5),
    marginLeft: theme.spacing(1),
  },

  addChecklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    paddingHorizontal: theme.spacing(1),
    opacity: 0.7,
  },

  addChecklistInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: theme.colors.white,
    paddingVertical: theme.spacing(1),
    paddingHorizontal: theme.spacing(1),
  },

  emptyChecklistHint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    textAlign: 'center',
    marginTop: theme.spacing(4),
    fontStyle: 'italic',
  },
});
