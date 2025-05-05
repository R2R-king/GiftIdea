import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Dimensions,
  ActivityIndicator,
  Animated
} from 'react-native';
import { XCircle, Calendar, Camera, DollarSign } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useTheme } from '@/components/ThemeProvider';
import { useAppLocalization } from '@/components/LocalizationWrapper';

const { width, height } = Dimensions.get('window');

interface CreateGiftCollectionFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (collectionData: any) => void;
}

export default function CreateGiftCollectionForm({ 
  visible, 
  onClose, 
  onSubmit 
}: CreateGiftCollectionFormProps) {
  console.log('CreateGiftCollectionForm rendered, visible:', visible);
  
  const { theme, colors } = useTheme();
  const { t } = useAppLocalization();
  const isDark = theme === 'dark';
  
  const [title, setTitle] = useState('');
  const [recipient, setRecipient] = useState('');
  const [occasion, setOccasion] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [dateText, setDateText] = useState('');
  const [loading, setLoading] = useState(false);
  const [formOpacity] = useState(new Animated.Value(0));
  const [overlayOpacity] = useState(new Animated.Value(0));
  
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ru-RU');
  };
  
  const parseDate = (dateString: string): Date | null => {
    // Проверяем, соответствует ли строка формату DD.MM.YYYY
    const regex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
    const match = dateString.match(regex);
    
    if (!match) return null;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // месяцы в JS начинаются с 0
    const year = parseInt(match[3], 10);
    
    // Проверка на корректность даты
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 2000 || year > 2100) {
      return null;
    }
    
    const parsedDate = new Date(year, month, day);
    
    // Проверка, что дата реально существует (например, не 31 февраля)
    if (parsedDate.getDate() !== day || parsedDate.getMonth() !== month || parsedDate.getFullYear() !== year) {
      return null;
    }
    
    return parsedDate;
  };
  
  const handleSubmit = () => {
    // Validate form
    if (!title.trim()) {
      Alert.alert(t('common.error'), t('giftCollection.form.titleRequired'));
      return;
    }
    
    if (!recipient.trim()) {
      Alert.alert(t('common.error'), t('giftCollection.form.recipientRequired'));
      return;
    }
    
    if (!targetAmount.trim() || isNaN(Number(targetAmount))) {
      Alert.alert(t('common.error'), t('giftCollection.form.validAmountRequired'));
      return;
    }
    
    // Проверка минимальной суммы
    const amount = Number(targetAmount);
    if (amount < 1000) {
      Alert.alert(t('common.error'), t('giftCollection.form.minAmountRequired'));
      return;
    }
    
    // Validate date
    let selectedDate;
    if (dateText.trim()) {
      selectedDate = parseDate(dateText);
      if (!selectedDate) {
        Alert.alert(t('common.error'), t('giftCollection.form.invalidDateFormat'));
        return;
      }
    } else {
      selectedDate = dueDate;
    }
    
    // Проверяем, что дата не в прошлом
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      Alert.alert(t('common.error'), t('giftCollection.form.dateInPast'));
      return;
    }
    
    // Show loading indicator
    setLoading(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      // Create new collection object
      const newCollection = {
        id: Date.now().toString(), // Generate a temporary ID
        title,
        recipient,
        occasion,
        description,
        targetAmount: Number(targetAmount),
        currentAmount: 0,
        dueDate: selectedDate.toISOString().split('T')[0],
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=500', // Default image
        contributors: [],
        isArchived: false
      };
      
      // Pass the data to parent component
      onSubmit(newCollection);
      
      // Reset form and loading state
      resetForm();
      setLoading(false);
    }, 800);
  };
  
  const resetForm = () => {
    setTitle('');
    setRecipient('');
    setOccasion('');
    setDescription('');
    setTargetAmount('');
    setDueDate(new Date());
    setDateText(formatDate(new Date()));
  };
  
  const handleCloseModal = () => {
    // Animate the form out before closing
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      resetForm();
      onClose();
    });
  };
  
  const handleDateChange = (text: string) => {
    // Удаляем все символы, кроме цифр и точек
    const sanitizedText = text.replace(/[^\d.]/g, '');
    
    // Автоматически добавляем точки после дня и месяца
    let formattedText = sanitizedText;
    
    // Если ввели 2 цифры дня, добавляем точку
    if (sanitizedText.length === 2 && !sanitizedText.includes('.')) {
      formattedText = sanitizedText + '.';
    }
    // Если ввели 2 цифры месяца (после дня и точки), добавляем точку
    else if (sanitizedText.length === 5 && sanitizedText.indexOf('.') === 2 && sanitizedText.lastIndexOf('.') === 2) {
      formattedText = sanitizedText + '.';
    }
    // Ограничиваем ввод до формата DD.MM.YYYY (10 символов)
    else if (sanitizedText.length > 10) {
      formattedText = sanitizedText.substring(0, 10);
    }
    
    setDateText(formattedText);
  };
  
  const handleAddOneMonth = () => {
    // Устанавливаем дату на текущую + 1 месяц
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);
    setDueDate(futureDate);
    setDateText(formatDate(futureDate));
  };
  
  // Set the initial formatted date when the component mounts
  useEffect(() => {
    console.log('CreateGiftCollectionForm useEffect - setting initial date');
    setDateText(formatDate(dueDate));
  }, []);
  
  useEffect(() => {
    console.log('Modal visibility changed:', visible);
    if (visible) {
      // Animate the form in when the modal becomes visible
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible]);
  
  return (
    <Modal
      visible={visible}
      animationType="none" // Use our own animations
      transparent={true}
      onRequestClose={handleCloseModal}
    >
      <TouchableWithoutFeedback onPress={handleCloseModal}>
        <Animated.View 
          style={[
            styles.modalContainer,
            { opacity: overlayOpacity }
          ]}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View 
              style={[
                styles.formContainer, 
                { 
                  backgroundColor: isDark ? '#1E1E1E' : colors.white,
                  opacity: formOpacity,
                  transform: [
                    {
                      translateY: formOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      })
                    }
                  ]
                }
              ]}
            >
              <View style={styles.formHeader}>
                <Text style={[styles.formTitle, { color: isDark ? colors.white : colors.gray800 }]}>
                  {t('giftCollection.form.title')}
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={handleCloseModal}
                >
                  <XCircle size={24} color={isDark ? colors.gray400 : colors.gray600} />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.formScroll}
                contentContainerStyle={styles.formScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? colors.gray400 : colors.gray600 }]}>
                    {t('giftCollection.form.titleLabel')}*
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { 
                        backgroundColor: isDark ? '#333333' : colors.gray100,
                        color: isDark ? colors.white : colors.gray800
                      }
                    ]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder={t('giftCollection.form.titlePlaceholder')}
                    placeholderTextColor={isDark ? colors.gray500 : colors.gray400}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? colors.gray400 : colors.gray600 }]}>
                    {t('giftCollection.form.recipientLabel')}*
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { 
                        backgroundColor: isDark ? '#333333' : colors.gray100,
                        color: isDark ? colors.white : colors.gray800
                      }
                    ]}
                    value={recipient}
                    onChangeText={setRecipient}
                    placeholder={t('giftCollection.form.recipientPlaceholder')}
                    placeholderTextColor={isDark ? colors.gray500 : colors.gray400}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? colors.gray400 : colors.gray600 }]}>
                    {t('giftCollection.form.occasionLabel')}
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { 
                        backgroundColor: isDark ? '#333333' : colors.gray100,
                        color: isDark ? colors.white : colors.gray800
                      }
                    ]}
                    value={occasion}
                    onChangeText={setOccasion}
                    placeholder={t('giftCollection.form.occasionPlaceholder')}
                    placeholderTextColor={isDark ? colors.gray500 : colors.gray400}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? colors.gray400 : colors.gray600 }]}>
                    {t('giftCollection.form.descriptionLabel')}
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.textArea,
                      { 
                        backgroundColor: isDark ? '#333333' : colors.gray100,
                        color: isDark ? colors.white : colors.gray800
                      }
                    ]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder={t('giftCollection.form.descriptionPlaceholder')}
                    placeholderTextColor={isDark ? colors.gray500 : colors.gray400}
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? colors.gray400 : colors.gray600 }]}>
                    {t('giftCollection.form.targetAmountLabel')}*
                  </Text>
                  <View style={styles.amountInputContainer}>
                    <View style={styles.currencySymbol}>
                      <Text style={[styles.currencyText, { color: isDark ? colors.gray400 : colors.gray600 }]}>₽</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.textInput,
                        styles.amountInput,
                        { 
                          backgroundColor: isDark ? '#333333' : colors.gray100,
                          color: isDark ? colors.white : colors.gray800
                        }
                      ]}
                      value={targetAmount}
                      onChangeText={text => setTargetAmount(text.replace(/[^0-9]/g, ''))}
                      placeholder={t('giftCollection.form.targetAmountPlaceholder')}
                      placeholderTextColor={isDark ? colors.gray500 : colors.gray400}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? colors.gray400 : colors.gray600 }]}>
                    {t('giftCollection.form.dueDateLabel')}*
                  </Text>
                  <View style={styles.dateInputContainer}>
                    <View style={styles.dateInputWrapper}>
                      <Calendar size={18} style={styles.dateIcon} color={isDark ? colors.gray400 : colors.gray600} />
                      <TextInput
                        style={[
                          styles.textInput,
                          styles.dateInput,
                          { 
                            backgroundColor: isDark ? '#333333' : colors.gray100,
                            color: isDark ? colors.white : colors.gray800
                          }
                        ]}
                        value={dateText}
                        onChangeText={handleDateChange}
                        placeholder="ДД.ММ.ГГГГ"
                        placeholderTextColor={isDark ? colors.gray500 : colors.gray400}
                        keyboardType="numeric"
                        maxLength={10}
                      />
                    </View>
                    <View style={styles.dateHelpRow}>
                      <Text style={[styles.dateHelpText, { color: isDark ? colors.gray500 : colors.gray600 }]}>
                        Формат: ДД.ММ.ГГГГ
                      </Text>
                      <TouchableOpacity 
                        style={styles.dateQuickButton}
                        onPress={handleAddOneMonth}
                      >
                        <Text style={[styles.dateQuickButtonText, { color: colors.primary }]}>
                          + 1 месяц
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                
                <View style={styles.formActions}>
                  <TouchableOpacity 
                    style={[styles.cancelButton, { backgroundColor: isDark ? '#333333' : colors.gray200 }]}
                    onPress={handleCloseModal}
                    disabled={loading}
                  >
                    <Text style={[styles.buttonText, { color: isDark ? colors.white : colors.gray800 }]}>
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.submitButton, { backgroundColor: colors.primary }]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={[styles.buttonText, { color: colors.white }]}>
                        {t('giftCollection.form.submit')}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  formContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: RADIUS.lg,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 1001,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    paddingBottom: 10,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  formScroll: {
    maxHeight: height * 0.6,
  },
  formScrollContent: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    height: 50,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  currencySymbol: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  currencyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    paddingLeft: 44,
  },
  dateInputContainer: {
    flexDirection: 'column',
  },
  dateInputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  dateInput: {
    flex: 1,
    paddingLeft: 44,
  },
  dateHelpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  dateHelpText: {
    fontSize: 12,
    color: '#777',
  },
  dateQuickButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
  },
  dateQuickButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    ...SHADOWS.small,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 