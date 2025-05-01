import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Slider from '@react-native-community/slider';
import { useDispatch } from 'react-redux';
import { Filter } from 'lucide-react-native';

type BudgetRangeProps = {
  minPrice?: number;
  maxPrice?: number;
  onRangeChange?: (minValue: number, maxValue: number) => void;
};

export const BudgetRangeFilter = ({ 
  minPrice = 0, 
  maxPrice = 50000,
  onRangeChange,
}: BudgetRangeProps) => {
  const [rangeValues, setRangeValues] = useState<[number, number]>([minPrice, maxPrice]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize from URL params if available
    const minFromUrl = searchParams.minPrice ? Number(searchParams.minPrice) : null;
    const maxFromUrl = searchParams.maxPrice ? Number(searchParams.maxPrice) : null;
    
    if (minFromUrl !== null && maxFromUrl !== null) {
      setRangeValues([minFromUrl, maxFromUrl]);
    }
  }, [searchParams]);

  const handleMinChange = (value: number) => {
    // Ensure min doesn't exceed max
    const newMin = Math.min(value, rangeValues[1] - 100);
    setRangeValues([newMin, rangeValues[1]]);
    
    if (onRangeChange) {
      onRangeChange(newMin, rangeValues[1]);
    }
  };

  const handleMaxChange = (value: number) => {
    // Ensure max doesn't go below min
    const newMax = Math.max(value, rangeValues[0] + 100);
    setRangeValues([rangeValues[0], newMax]);
    
    if (onRangeChange) {
      onRangeChange(rangeValues[0], newMax);
    }
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <Filter color={isDark ? '#e0e0e0' : '#333'} size={18} />
        <Text style={[styles.title, isDark && styles.darkText]}>Ценовой диапазон</Text>
      </View>
      
      <View style={styles.rangeContainer}>
        <Text style={[styles.rangeValue, isDark && styles.darkText]}>
          {formatPrice(rangeValues[0])}
        </Text>
        <Text style={[styles.rangeSeparator, isDark && styles.darkText]}>–</Text>
        <Text style={[styles.rangeValue, isDark && styles.darkText]}>
          {formatPrice(rangeValues[1])}
        </Text>
      </View>
      
      <View style={styles.sliderContainer}>
        <Text style={[styles.minLabel, isDark && styles.darkText]}>Мин.</Text>
        <Slider
          style={styles.slider}
          minimumValue={minPrice}
          maximumValue={maxPrice}
          step={100}
          value={rangeValues[0]}
          onValueChange={handleMinChange}
          minimumTrackTintColor={isDark ? '#555' : '#e0e0e0'}
          maximumTrackTintColor={isDark ? '#2196f3' : '#2196f3'}
          thumbTintColor={isDark ? '#64b5f6' : '#1976d2'}
        />
        <Text style={[styles.maxLabel, isDark && styles.darkText]}>Макс.</Text>
      </View>
      
      <View style={styles.sliderContainer}>
        <Text style={[styles.minLabel, isDark && styles.darkText]}>Мин.</Text>
        <Slider
          style={styles.slider}
          minimumValue={minPrice}
          maximumValue={maxPrice}
          step={100}
          value={rangeValues[1]}
          onValueChange={handleMaxChange}
          minimumTrackTintColor={isDark ? '#2196f3' : '#2196f3'}
          maximumTrackTintColor={isDark ? '#555' : '#e0e0e0'}
          thumbTintColor={isDark ? '#64b5f6' : '#1976d2'}
        />
        <Text style={[styles.maxLabel, isDark && styles.darkText]}>Макс.</Text>
      </View>
      
      <View style={styles.priceRangeLabels}>
        <Text style={[styles.priceLabel, isDark && styles.darkText]}>
          {formatPrice(minPrice)}
        </Text>
        <Text style={[styles.priceLabel, isDark && styles.darkText]}>
          {formatPrice(maxPrice)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  darkContainer: {
    backgroundColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  darkText: {
    color: '#e0e0e0',
  },
  rangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  rangeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rangeSeparator: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  minLabel: {
    width: 40,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  maxLabel: {
    width: 40,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  priceRangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: '#888',
  },
});

export default BudgetRangeFilter; 