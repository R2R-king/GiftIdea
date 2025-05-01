import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  Modal,
  TextInput,
  useColorScheme
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Trash2, Bell, Calendar, Plus, X } from 'lucide-react-native';

type Reminder = {
  id: string;
  personName: string;
  eventType: 'birthday' | 'holiday' | 'other';
  date: Date;
  notifyDaysBefore: number;
  notes: string;
};

type ReminderManagerProps = {
  onClose?: () => void;
};

export const ReminderManager = ({ onClose }: ReminderManagerProps) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<Partial<Reminder>>({
    id: '',
    personName: '',
    eventType: 'birthday',
    date: new Date(),
    notifyDaysBefore: 7,
    notes: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadReminders();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Необходимо разрешение на отправку уведомлений');
    }
  };

  const loadReminders = async () => {
    try {
      const remindersData = await AsyncStorage.getItem('reminders');
      if (remindersData) {
        const parsedReminders = JSON.parse(remindersData);
        // Convert string dates back to Date objects
        const formattedReminders = parsedReminders.map((reminder: any) => ({
          ...reminder,
          date: new Date(reminder.date),
        }));
        setReminders(formattedReminders);
      }
    } catch (error) {
      console.error('Ошибка при загрузке напоминаний:', error);
    }
  };

  const saveReminders = async (updatedReminders: Reminder[]) => {
    try {
      await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders));
    } catch (error) {
      console.error('Ошибка при сохранении напоминаний:', error);
    }
  };

  const addOrUpdateReminder = async () => {
    if (!currentReminder.personName) {
      Alert.alert('Ошибка', 'Необходимо указать имя');
      return;
    }

    let updatedReminders: Reminder[];
    const newReminder = {
      ...currentReminder,
      id: currentReminder.id || Math.random().toString(36).substr(2, 9),
      date: currentReminder.date || new Date(),
      notifyDaysBefore: currentReminder.notifyDaysBefore || 7,
    } as Reminder;

    if (currentReminder.id) {
      // Update existing reminder
      updatedReminders = reminders.map(reminder => 
        reminder.id === currentReminder.id ? newReminder : reminder
      );
    } else {
      // Add new reminder
      updatedReminders = [...reminders, newReminder];
    }

    setReminders(updatedReminders);
    await saveReminders(updatedReminders);
    scheduleNotification(newReminder);
    setModalVisible(false);
    resetForm();
  };

  const deleteReminder = async (id: string) => {
    const updatedReminders = reminders.filter(reminder => reminder.id !== id);
    setReminders(updatedReminders);
    await saveReminders(updatedReminders);
    // Cancel notification if it exists
    await Notifications.cancelScheduledNotificationAsync(id);
  };

  const scheduleNotification = async (reminder: Reminder) => {
    const notificationDate = new Date(reminder.date);
    notificationDate.setDate(notificationDate.getDate() - reminder.notifyDaysBefore);
    
    // Cancel any existing notification for this reminder
    await Notifications.cancelScheduledNotificationAsync(reminder.id);
    
    // If the notification date is in the future, schedule it
    if (notificationDate > new Date()) {
      await Notifications.scheduleNotificationAsync({
        identifier: reminder.id,
        content: {
          title: `Скоро ${reminder.eventType === 'birthday' ? 'день рождения' : 'праздник'}!`,
          body: `${reminder.personName}: через ${reminder.notifyDaysBefore} дней`,
          data: { reminderId: reminder.id },
        },
        trigger: notificationDate,
      });
    }
  };

  const resetForm = () => {
    setCurrentReminder({
      id: '',
      personName: '',
      eventType: 'birthday',
      date: new Date(),
      notifyDaysBefore: 7,
      notes: '',
    });
  };

  const openEditModal = (reminder: Reminder) => {
    setCurrentReminder({ ...reminder });
    setModalVisible(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setCurrentReminder({ ...currentReminder, date: selectedDate });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'birthday': return 'День рождения';
      case 'holiday': return 'Праздник';
      case 'other': return 'Другое';
      default: return type;
    }
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.darkText]}>Напоминания</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Plus color={isDark ? '#fff' : '#000'} size={24} />
        </TouchableOpacity>
      </View>

      {reminders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, isDark && styles.darkText]}>
            У вас пока нет напоминаний
          </Text>
          <TouchableOpacity 
            style={[styles.createButton, isDark && styles.darkButton]}
            onPress={() => {
              resetForm();
              setModalVisible(true);
            }}
          >
            <Text style={[styles.createButtonText, isDark && { color: '#fff' }]}>
              Создать напоминание
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reminders.sort((a, b) => a.date.getTime() - b.date.getTime())}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.reminderCard, isDark && styles.darkCard]}
              onPress={() => openEditModal(item)}
            >
              <View style={styles.reminderHeader}>
                <Text style={[styles.personName, isDark && styles.darkText]}>
                  {item.personName}
                </Text>
                <TouchableOpacity
                  onPress={() => deleteReminder(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Trash2 color={isDark ? '#e57373' : '#f44336'} size={18} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.reminderDetails}>
                <View style={styles.detailRow}>
                  <Calendar color={isDark ? '#aaa' : '#666'} size={16} />
                  <Text style={[styles.detailText, isDark && styles.darkText]}>
                    {formatDate(item.date)} ({getEventTypeLabel(item.eventType)})
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Bell color={isDark ? '#aaa' : '#666'} size={16} />
                  <Text style={[styles.detailText, isDark && styles.darkText]}>
                    Уведомить за {item.notifyDaysBefore} дней
                  </Text>
                </View>
                
                {item.notes ? (
                  <Text style={[styles.notes, isDark && styles.darkText]} numberOfLines={2}>
                    {item.notes}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.reminderList}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, isDark && styles.darkModalView]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.darkText]}>
                {currentReminder.id ? 'Редактировать' : 'Новое напоминание'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={isDark ? '#fff' : '#000'} size={24} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, isDark && styles.darkInput]}
              placeholder="Имя человека или название праздника"
              placeholderTextColor={isDark ? '#aaa' : '#999'}
              value={currentReminder.personName}
              onChangeText={(text) => setCurrentReminder({ ...currentReminder, personName: text })}
            />

            <View style={styles.pickerContainer}>
              <Text style={[styles.pickerLabel, isDark && styles.darkText]}>Тип события:</Text>
              <View style={styles.typePicker}>
                {(['birthday', 'holiday', 'other'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      currentReminder.eventType === type && styles.selectedType,
                      isDark && styles.darkTypeOption,
                      currentReminder.eventType === type && isDark && styles.darkSelectedType,
                    ]}
                    onPress={() => setCurrentReminder({ ...currentReminder, eventType: type })}
                  >
                    <Text style={[
                      styles.typeText,
                      currentReminder.eventType === type && styles.selectedTypeText,
                      isDark && styles.darkTypeText,
                      currentReminder.eventType === type && isDark && styles.darkSelectedTypeText,
                    ]}>
                      {getEventTypeLabel(type)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.datePickerButton, isDark && styles.darkDatePickerButton]}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar color={isDark ? '#fff' : '#000'} size={20} />
              <Text style={[styles.datePickerText, isDark && styles.darkText]}>
                {formatDate(currentReminder.date as Date)}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={currentReminder.date as Date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <View style={styles.pickerContainer}>
              <Text style={[styles.pickerLabel, isDark && styles.darkText]}>
                Уведомить за (дней):
              </Text>
              <View style={styles.daysPicker}>
                {[1, 3, 7, 14, 30].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.daysOption,
                      currentReminder.notifyDaysBefore === days && styles.selectedDays,
                      isDark && styles.darkDaysOption,
                      currentReminder.notifyDaysBefore === days && isDark && styles.darkSelectedDays,
                    ]}
                    onPress={() => setCurrentReminder({ ...currentReminder, notifyDaysBefore: days })}
                  >
                    <Text style={[
                      styles.daysText,
                      currentReminder.notifyDaysBefore === days && styles.selectedDaysText,
                      isDark && styles.darkDaysText,
                      currentReminder.notifyDaysBefore === days && isDark && styles.darkSelectedDaysText,
                    ]}>
                      {days}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={[styles.notesInput, isDark && styles.darkInput]}
              placeholder="Заметки (необязательно)"
              placeholderTextColor={isDark ? '#aaa' : '#999'}
              value={currentReminder.notes}
              onChangeText={(text) => setCurrentReminder({ ...currentReminder, notes: text })}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.saveButton, isDark && styles.darkSaveButton]}
              onPress={addOrUpdateReminder}
            >
              <Text style={styles.saveButtonText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  darkText: {
    color: '#e0e0e0',
  },
  addButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  darkButton: {
    backgroundColor: '#333',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  reminderList: {
    paddingBottom: 16,
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: '#2a2a2a',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  personName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reminderDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
  },
  notes: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  darkModalView: {
    backgroundColor: '#1e1e1e',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  darkInput: {
    backgroundColor: '#333',
    color: '#e0e0e0',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  typePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  darkTypeOption: {
    backgroundColor: '#333',
  },
  selectedType: {
    backgroundColor: '#e1f5fe',
  },
  darkSelectedType: {
    backgroundColor: '#0d47a1',
  },
  typeText: {
    fontSize: 14,
    color: '#555',
  },
  darkTypeText: {
    color: '#e0e0e0',
  },
  selectedTypeText: {
    color: '#0277bd',
    fontWeight: '500',
  },
  darkSelectedTypeText: {
    color: '#fff',
    fontWeight: '500',
  },
  datePickerButton: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 10,
  },
  darkDatePickerButton: {
    backgroundColor: '#333',
  },
  datePickerText: {
    fontSize: 16,
  },
  daysPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  daysOption: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  darkDaysOption: {
    backgroundColor: '#333',
  },
  selectedDays: {
    backgroundColor: '#e8f5e9',
  },
  darkSelectedDays: {
    backgroundColor: '#1b5e20',
  },
  daysText: {
    fontSize: 14,
    color: '#555',
  },
  darkDaysText: {
    color: '#e0e0e0',
  },
  selectedDaysText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  darkSelectedDaysText: {
    color: '#fff',
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#2196f3',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  darkSaveButton: {
    backgroundColor: '#1976d2',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ReminderManager; 