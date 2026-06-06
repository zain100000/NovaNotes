/**
 * @file CreateNote.jsx
 * @module Screens/Main/Notes
 * @description Create & Edit note screen. Optimized for offline Redux state.
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
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
  BackHandler,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../../styles/Themes';
import { useDispatch } from 'react-redux';
import {
  createNote,
  updateNote,
  togglePinNote,
  toggleArchiveNote,
} from '../../../redux/slices/note.slices';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStatusBarConfig } from '../../../utilities/custom-hooks/status-bar/StatusBar.hook';
import Clipboard from '@react-native-clipboard/clipboard';

const { width, height } = Dimensions.get('window');

const CreateNote = () => {
  useStatusBarConfig();

  const { type, note } = useRoute().params || {};
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [checklistItems, setChecklistItems] = useState([
    { text: '', isChecked: false },
  ]);
  const [tags, setTags] = useState([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [copied, setCopied] = useState(false);
  const [noteId, setNoteId] = useState(null);
  const [tagInput, setTagInput] = useState('');

  const mainRef = useRef(null);
  const copyAnimRef = useRef(null);

  useEffect(() => {
    if (note) {
      setNoteId(note.id);
      setTitle(note.title || '');
      setIsPinned(!!note.isPinned);
      setIsArchived(!!note.isArchived);
      setTags(note.tags || []);

      if (note.type === 'checklist') {
        setChecklistItems(
          note.checklistItems?.length > 0
            ? note.checklistItems.map(item => ({
                text: item.text || '',
                isChecked: !!item.isChecked,
              }))
            : [{ text: '', isChecked: false }],
        );
      } else {
        setContent(note.content || '');
      }
    }
  }, [note]);

  const hasContent = useMemo(() => {
    const hasTitle = title.trim().length > 0;
    const hasTags = tags.length > 0;

    let hasBody = false;
    if (type === 'text') {
      hasBody = content.trim().length > 0;
    } else {
      hasBody = checklistItems.some(item => item.text.trim().length > 0);
    }

    return hasTitle || hasBody || hasTags;
  }, [title, content, tags, checklistItems, type]);

  const handleSaveNote = useCallback(() => {
    const isChecklistEmpty =
      type === 'checklist' && checklistItems.every(i => !i.text.trim());
    if (!title.trim() && !content.trim() && isChecklistEmpty) return;

    const validChecklist = checklistItems
      .filter(item => item.text?.trim() !== '')
      .map(item => ({
        text: item.text.trim(),
        isChecked: !!item.isChecked,
      }));

    const noteData = {
      title: title.trim(),
      type: type,
      tags: tags,
      backgroundColor: note?.backgroundColor,
    };

    if (type === 'text') {
      noteData.content = content.trim();
    } else {
      noteData.checklistItems = validChecklist;
    }

    if (!noteId) {
      dispatch(createNote(noteData));
    } else {
      dispatch(updateNote({ noteId, data: noteData }));
    }
  }, [
    title,
    content,
    checklistItems,
    tags,
    type,
    noteId,
    dispatch,
    note?.backgroundColor,
  ]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = indexToRemove => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleToggleChecklistItem = index => {
    const updatedChecklist = checklistItems.map((item, i) =>
      i === index ? { ...item, isChecked: !item.isChecked } : item,
    );
    setChecklistItems(updatedChecklist);
  };

  const handleChecklistItemTextChange = (index, newText) => {
    setChecklistItems(prev =>
      prev.map((item, i) => (i === index ? { ...item, text: newText } : item)),
    );
  };

  const handleTogglePin = () => {
    if (!hasContent) return;
    if (!noteId) {
      handleSaveNote();
    }

    setIsPinned(!isPinned);
    if (noteId) dispatch(togglePinNote(noteId));
  };

  const handleToggleArchive = () => {
    let currentId = noteId;

    if (!currentId) {
      handleSaveNote();
      return;
    }

    const newState = !isArchived;
    setIsArchived(newState);
    dispatch(toggleArchiveNote(currentId));

    if (newState) {
      navigation.goBack();
    }
  };

  const handleBack = useCallback(() => {
    handleSaveNote();

    mainRef.current?.animate({
      from: { opacity: 1, scale: 1, translateY: 0 },
      to: { opacity: 0, scale: 0.9, translateY: 20 },
      duration: 250,
    });

    setTimeout(() => navigation.goBack(), 200);
  }, [handleSaveNote, navigation]);

  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [handleBack]);

  const copyToClipboard = () => {
    let fullNote = `${title || 'Untitled'}\n\n`;
    if (type === 'text') {
      fullNote += content;
    } else {
      fullNote += checklistItems
        .filter(i => i.text.trim())
        .map(i => `${i.isChecked ? '✓' : '○'} ${i.text}`)
        .join('\n');
    }
    if (tags.length > 0) fullNote += `\n\nTags: ${tags.join(', ')}`;

    Clipboard.setString(fullNote);
    setCopied(true);
    copyAnimRef.current?.pulse(400);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Animatable.View ref={mainRef} style={styles.mainContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={width * 0.06}
              color={theme.colors.white}
            />
          </TouchableOpacity>

          <View style={styles.rightIcons}>
            {/* Pin Icon */}
            <TouchableOpacity
              onPress={handleTogglePin}
              style={[styles.iconBtn, !hasContent && styles.disabledIcon]}
              disabled={!hasContent}
            >
              <MaterialCommunityIcons
                name={isPinned ? 'pin' : 'pin-outline'}
                size={width * 0.06}
                color={
                  hasContent ? theme.colors.white : 'rgba(255,255,255,0.2)'
                }
              />
            </TouchableOpacity>

            {/* Archive Icon */}
            <TouchableOpacity
              onPress={handleToggleArchive}
              style={[styles.iconBtn, !hasContent && styles.disabledIcon]}
              disabled={!hasContent}
            >
              <MaterialCommunityIcons
                name={isArchived ? 'archive' : 'archive-outline'}
                size={width * 0.06}
                color={
                  hasContent ? theme.colors.white : 'rgba(255,255,255,0.2)'
                }
              />
            </TouchableOpacity>

            {/* Clipboard Icon */}
            <TouchableOpacity
              onPress={copyToClipboard}
              style={[styles.iconBtn, !hasContent && styles.disabledIcon]}
              disabled={!hasContent}
            >
              <Animatable.View ref={copyAnimRef}>
                <MaterialCommunityIcons
                  name={copied ? 'check-circle' : 'clipboard-outline'}
                  size={22}
                  color={
                    !hasContent
                      ? 'rgba(255,255,255,0.2)'
                      : copied
                      ? theme.colors.success
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
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title Input */}
            <TextInput
              style={styles.titleInput}
              placeholder="Title"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={title}
              onChangeText={setTitle}
              multiline
            />

            {/* Content Logic */}
            {type === 'checklist' ? (
              <View style={styles.checklistContainer}>
                {checklistItems.map((item, index) => (
                  <View key={index} style={styles.checklistItemRow}>
                    <TouchableOpacity
                      onPress={() => handleToggleChecklistItem(index)}
                    >
                      <MaterialCommunityIcons
                        name={
                          item.isChecked
                            ? 'checkbox-marked'
                            : 'checkbox-blank-outline'
                        }
                        size={width * 0.05}
                        color={
                          item.isChecked
                            ? theme.colors.primary
                            : 'rgba(255,255,255,0.6)'
                        }
                      />
                    </TouchableOpacity>
                    <TextInput
                      style={[
                        styles.checklistItemText,
                        item.isChecked && styles.checkedChecklistItem,
                      ]}
                      value={item.text}
                      onChangeText={txt =>
                        handleChecklistItemTextChange(index, txt)
                      }
                      placeholder="Item"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      multiline
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setChecklistItems(prev =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={width * 0.05}
                        color="rgba(255,255,255,0.3)"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addChecklistRow}
                  onPress={() =>
                    setChecklistItems([
                      ...checklistItems,
                      { text: '', isChecked: false },
                    ])
                  }
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={width * 0.05}
                    color={theme.colors.gray}
                  />
                  <Text style={styles.addChecklistText}>Add item</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TextInput
                style={styles.contentInput}
                placeholder="Note..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
            )}

            {/* Tag Section */}
            <View style={styles.tagContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(index)}>
                    <MaterialCommunityIcons
                      name="close"
                      size={width * 0.04}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              ))}

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
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animatable.View>
    </View>
  );
};

export default CreateNote;

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
