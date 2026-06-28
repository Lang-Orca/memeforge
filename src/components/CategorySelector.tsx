import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MEME_CATEGORIES, MemeCategory } from '../constants/categories';

interface CategorySelectorProps {
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategorySelector({ selectedCategoryId, onSelectCategory }: CategorySelectorProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Ambiance</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {MEME_CATEGORIES.map((category: MemeCategory) => {
          const selected = category.id === selectedCategoryId;
          return (
            <TouchableOpacity
              key={category.id}
              activeOpacity={0.85}
              onPress={() => onSelectCategory(category.id)}
              style={[styles.chip, selected && styles.selectedChip]}
            >
              <Text style={[styles.chipIcon, selected && styles.selectedChipText]}>{category.icon}</Text>
              <Text style={[styles.chipLabel, selected && styles.selectedChipText]}>{category.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    color: '#dce8f8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 2,
  },
  row: {
    gap: 10,
    paddingRight: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  selectedChip: {
    backgroundColor: 'rgba(0, 212, 255, 0.16)',
    borderColor: '#00d4ff',
  },
  chipIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  chipLabel: {
    color: '#eaf6ff',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedChipText: {
    color: '#ffffff',
  },
});
