import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { 
  Cake, 
  Heart, 
  TreePine, 
  HeartHandshake,
  Coins,
  CreditCard,
  DollarSign,
  Package,
  Ticket,
  Palette,
} from 'lucide-react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';

type FilterCategory = 'occasion' | 'budget' | 'type' | 'location';

interface CategoryFiltersProps {
  onSelectFilter: (category: FilterCategory, value: string) => void;
  selectedFilters: {
    occasion: string;
    budget: string;
    type: string;
    location: string;
  };
}

export default function CategoryFilters({ onSelectFilter, selectedFilters }: CategoryFiltersProps) {
  const { t } = useAppLocalization();

  const occasions = [
    { id: 'birthday', label: t('filters.occasions.birthday'), value: 'birthday', icon: Cake },
    { id: 'anniversary', label: t('filters.occasions.anniversary'), value: 'anniversary', icon: Heart },
    { id: 'new_year', label: t('filters.occasions.new_year'), value: 'new_year', icon: TreePine },
    { id: 'valentine', label: t('filters.occasions.valentine'), value: 'valentine', icon: HeartHandshake },
  ];

  const budgets = [
    { id: 'cheap', label: t('filters.budgets.cheap'), value: 'cheap', icon: Coins },
    { id: 'medium', label: t('filters.budgets.medium'), value: 'medium', icon: CreditCard },
    { id: 'expensive', label: t('filters.budgets.expensive'), value: 'expensive', icon: DollarSign },
  ];

  const giftTypes = [
    { id: 'emotional', label: t('filters.types.emotional'), value: 'emotional', icon: Heart },
    { id: 'practical', label: t('filters.types.practical'), value: 'practical', icon: Package },
    { id: 'experience', label: t('filters.types.experience'), value: 'experience', icon: Ticket },
    { id: 'handmade', label: t('filters.types.handmade'), value: 'handmade', icon: Palette },
  ];

  const renderCategoryItem = (item: any, category: FilterCategory) => {
    const Icon = item.icon;
    const isSelected = selectedFilters[category] === item.value;
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.categoryButton,
          isSelected && styles.selectedCategoryButton
        ]}
        onPress={() => onSelectFilter(category, item.value)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isSelected && styles.selectedIconContainer]}>
          <Icon size={16} color={isSelected ? COLORS.white : COLORS.valentinePink} />
        </View>
        <Text 
          style={[
            styles.categoryLabel,
            isSelected && styles.selectedCategoryLabel
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCategorySection = (title: string, items: any[], category: FilterCategory) => (
    <View style={styles.categorySection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {items.map(item => renderCategoryItem(item, category))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderCategorySection(t('filters.occasions.title'), occasions, 'occasion')}
      {renderCategorySection(t('filters.budgets.title'), budgets, 'budget')}
      {renderCategorySection(t('filters.types.title'), giftTypes, 'type')}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8FA',
    paddingBottom: SPACING.lg,
  },
  categorySection: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.gray800,
    marginLeft: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  categoryList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#FFE6EF',
    shadowColor: COLORS.gray500,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.valentinePink,
    borderColor: COLORS.valentinePink,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  selectedIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  selectedCategoryLabel: {
    color: COLORS.white,
    fontWeight: '600',
  },
}); 