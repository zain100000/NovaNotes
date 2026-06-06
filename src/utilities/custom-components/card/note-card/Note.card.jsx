/**
 * @file Note.card.jsx
 * @module Components/Card/NoteCard
 * @description Responsive note card with selection state styling.
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  View,
} from 'react-native';
import { theme } from '../../../../styles/Themes';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const CARD_WIDTH = (width - theme.spacing(6)) / 2;

const NoteCard = ({
  title,
  content,
  onPress,
  onLongPress,
  isSelected,
  isPinned,
  backgroundColor,
  tags = [],
  type = 'text',
  checklistItems = [],
}) => {
  const renderContent = () => {
    if (type === 'checklist' && checklistItems?.length > 0) {
      const normalized = checklistItems.map(item => ({
        ...item,
        isChecked: !!item.isChecked, // Ensure boolean
      }));

      const unchecked = normalized.filter(i => !i.isChecked);
      const checked = normalized.filter(i => i.isChecked);
      const sorted = [...unchecked, ...checked];
      const itemsToShow = sorted.slice(0, 3);

      const completed = checked.length;
      const total = normalized.length;

      return (
        <View style={styles.checklistContainer}>
          {itemsToShow.map((item, index) => (
            <View key={`item-${index}`} style={styles.checklistItem}>
              <MaterialCommunityIcons
                name={
                  item.isChecked ? 'checkbox-marked' : 'checkbox-blank-outline'
                }
                size={width * 0.045}
                color={
                  item.isChecked ? theme.colors.primary : theme.colors.gray
                }
              />
              <Text
                style={[
                  styles.checklistText,
                  item.isChecked && styles.checkedText,
                ]}
                numberOfLines={1}
              >
                {item.text}
              </Text>
            </View>
          ))}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.gap(1),
              marginTop: height * 0.02,
            }}
          >
            <View
              style={{
                width: width * 0.09,
                height: width * 0.09,
                borderRadius: theme.borderRadius.circle,
                borderWidth: 2,
                borderColor:
                  completed === total ? '#4CAF50' : 'rgba(255,255,255,0.3)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color:
                    completed === total
                      ? theme.colors.success
                      : theme.colors.primary,
                  fontSize: width * 0.024,
                  fontFamily: theme.typography.semiBold,
                }}
              >
                {Math.round((completed / total) * 100)}%
              </Text>
            </View>
            <Text
              style={[
                styles.completionText,
                {
                  fontSize: width * 0.034,
                  fontFamily: theme.typography.semiBold,
                  color: theme.colors.primary,
                },
              ]}
            >
              {completed}/{total} completed
            </Text>
          </View>
        </View>
      );
    }

    return (
      <Text style={styles.content} numberOfLines={8}>
        {content || ''}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.cardContainer,
        isSelected && styles.selectedCard,
        { backgroundColor: backgroundColor || '#1d1b1b' },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>
          {title || 'Untitled'}
        </Text>

        {type === 'checklist' && (
          <MaterialCommunityIcons
            name="format-list-checkbox"
            size={width * 0.05}
            color={theme.colors.gray}
          />
        )}

        {isPinned && (
          <MaterialCommunityIcons
            name="pin"
            size={width * 0.06}
            color={theme.colors.gray}
          />
        )}
      </View>

      {renderContent()}

      {/* Tags */}
      {tags.length > 0 && (
        <View style={styles.tagWrapper}>
          {tags.slice(0, 3).map((tag, i) => (
            <View key={i} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NoteCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1d1b1b',
    width: CARD_WIDTH,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: '#3c4043',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },

  selectedCard: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(168, 199, 250, 0.05)',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(1),
  },

  title: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.bold,
    flex: 1,
    marginRight: theme.spacing(1),
  },

  content: {
    color: theme.colors.gray,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.regular,
    lineHeight: 18,
  },

  checklistContainer: {
    marginTop: theme.spacing(0.5),
  },

  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },

  checkboxIcon: {
    marginRight: theme.spacing(1),
  },

  checklistText: {
    color: theme.colors.gray,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.regular,
    flex: 1,
  },

  checkedText: {
    textDecorationLine: 'line-through',
    color: 'rgba(255, 255, 255, 0.4)',
  },

  emptyChecklistText: {
    color: theme.colors.gray,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.regular,
    opacity: 0.5,
    fontStyle: 'italic',
  },

  tags: {
    marginTop: height * 0.01,
  },

  tagWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.gap(1),
    top: height * 0.02,
    marginBottom: height * 0.01
  },

  tagChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.007,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },

  tagText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: width * 0.026,
    fontFamily: theme.typography.medium,
    textTransform: 'lowercase',
  },

  moreTagsText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: theme.typography.fontSize.xs,
    marginLeft: width * 0.01,
  },

  typeIcon: {
    marginRight: theme.spacing(1),
  },

  pinIcon: {
    marginLeft: 'auto',
    transform: [{ rotate: '45deg' }],
  },
});
