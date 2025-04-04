import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal,
  X,
  Calendar,
  Wallet,
  Gift,
  Store,
  Cake,
  Heart,
  Star,
  TreePine,
  Coins,
  CreditCard,
  DollarSign,
  HeartHandshake,
  Package,
  Ticket,
  Palette,
  Building2,
  Truck,
  Globe
} from 'lucide-react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';

interface FilterOption {
  id: string;
  label: string;
  value: string;
  icon: any;
}

interface FiltersProps {
  onApplyFilters: (filters: any) => void;
}

type FilterCategory = 'occasion' | 'budget' | 'type' | 'location';

interface SelectedFilters {
  occasion: string;
  budget: string;
  type: string;
  location: string;
}

export default function Filters({ onApplyFilters }: FiltersProps) {
  const { t } = useAppLocalization();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    occasion: '',
    budget: '',
    type: '',
    location: 'all'
  });

  const occasions: FilterOption[] = [
    { id: 'birthday', label: t('filters.occasions.birthday'), value: 'birthday', icon: Cake },
    { id: 'anniversary', label: t('filters.occasions.anniversary'), value: 'anniversary', icon: Heart },
    { id: 'new_year', label: t('filters.occasions.new_year'), value: 'new_year', icon: TreePine },
    { id: 'valentine', label: t('filters.occasions.valentine'), value: 'valentine', icon: HeartHandshake },
  ];

  const budgets: FilterOption[] = [
    { id: 'cheap', label: t('filters.budgets.cheap'), value: 'cheap', icon: Coins },
    { id: 'medium', label: t('filters.budgets.medium'), value: 'medium', icon: CreditCard },
    { id: 'expensive', label: t('filters.budgets.expensive'), value: 'expensive', icon: DollarSign },
  ];

  const giftTypes: FilterOption[] = [
    { id: 'emotional', label: t('filters.types.emotional'), value: 'emotional', icon: Heart },
    { id: 'practical', label: t('filters.types.practical'), value: 'practical', icon: Package },
    { id: 'experience', label: t('filters.types.experience'), value: 'experience', icon: Ticket },
    { id: 'handmade', label: t('filters.types.handmade'), value: 'handmade', icon: Palette },
  ];

  const locations: FilterOption[] = [
    { id: 'all', label: t('filters.locations.all'), value: 'all', icon: Globe },
    { id: 'nearby', label: t('filters.locations.nearby'), value: 'nearby', icon: Building2 },
    { id: 'delivery', label: t('filters.locations.delivery'), value: 'delivery', icon: Truck },
  ];

  const handleFilterSelect = (category: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      ...selectedFilters,
      searchQuery
    });
    setIsExpanded(false);
  };

  const handleClearFilters = () => {
    setSelectedFilters({
      occasion: '',
      budget: '',
      type: '',
      location: 'all'
    });
    setSearchQuery('');
    onApplyFilters({
      occasion: '',
      budget: '',
      type: '',
      location: 'all',
      searchQuery: ''
    });
  };

  const renderFilterSection = (title: string, options: FilterOption[], category: FilterCategory) => (
    <View style={styles.filterSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.optionsContainer}>
        {options.map(option => {
          const Icon = option.icon;
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedFilters[category] === option.value && styles.selectedOption
              ]}
              onPress={() => handleFilterSelect(category, option.value)}
            >
              <Icon 
                size={16} 
                color={selectedFilters[category] === option.value ? '#FFFFFF' : '#64748B'} 
              />
              <Text style={[
                styles.optionText,
                selectedFilters[category] === option.value && styles.selectedOptionText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('filters.search_placeholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94A3B8"
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <SlidersHorizontal size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Expanded Filters */}
      {isExpanded && (
        <ScrollView style={styles.filtersContainer}>
          {renderFilterSection(t('filters.occasions.title'), occasions, 'occasion')}
          {renderFilterSection(t('filters.budgets.title'), budgets, 'budget')}
          {renderFilterSection(t('filters.types.title'), giftTypes, 'type')}
          {renderFilterSection(t('filters.locations.title'), locations, 'location')}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearFilters}
            >
              <X size={16} color="#64748B" />
              <Text style={styles.clearButtonText}>{t('filters.clear')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>{t('filters.apply')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 8,
  },
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    maxHeight: 400,
    backgroundColor: '#FFFFFF',
  },
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  selectedOption: {
    backgroundColor: '#FF0844',
    borderColor: '#FF0844',
  },
  optionText: {
    fontSize: 13,
    color: '#64748B',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  applyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF0844',
  },
  applyButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 