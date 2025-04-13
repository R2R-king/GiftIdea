import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import AuthService, { ProfileUpdateData } from '@/lib/auth-service';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (visible && user) {
      // Populate fields with existing data when modal opens
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
    }
  }, [visible, user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Simple email validation
      const emailRegex = /\S+@\S+\.\S+/;
      if (email && !emailRegex.test(email)) {
        Alert.alert('Ошибка', 'Пожалуйста, введите корректный email');
        setLoading(false);
        return;
      }
      
      // Create payload with only changed fields
      const profileData: ProfileUpdateData = {};
      if (firstName !== (user?.firstName || '')) profileData.firstName = firstName;
      if (lastName !== (user?.lastName || '')) profileData.lastName = lastName;
      if (email !== (user?.email || '')) profileData.email = email;
      if (avatar !== (user?.avatar || '')) profileData.avatar = avatar;
      if (phone !== (user?.phone || '')) profileData.phone = phone;
      if (bio !== (user?.bio || '')) profileData.bio = bio;
      
      // Only send request if there are changes
      if (Object.keys(profileData).length > 0) {
        await AuthService.updateProfile(profileData);
        Alert.alert('Успех', 'Профиль успешно обновлен');
      }
      
      onClose();
    } catch (error) {
      Alert.alert(
        'Ошибка', 
        error instanceof Error ? error.message : 'Не удалось обновить профиль'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Редактирование профиля</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Аватар */}
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: avatar || 'https://via.placeholder.com/100' }} 
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.changeAvatarButton}>
                <Text style={styles.changeAvatarText}>Изменить фото</Text>
              </TouchableOpacity>
            </View>
            
            {/* Форма редактирования */}
            <Text style={styles.label}>Имя</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Введите имя"
              editable={!loading}
            />
            
            <Text style={styles.label}>Фамилия</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Введите фамилию"
              editable={!loading}
            />
            
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Введите email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            
            <Text style={styles.label}>Телефон</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Введите телефон"
              keyboardType="phone-pad"
              editable={!loading}
            />
            
            <Text style={styles.label}>О себе</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Расскажите о себе"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />
            
            <Text style={styles.label}>URL аватара</Text>
            <TextInput
              style={styles.input}
              value={avatar}
              onChangeText={setAvatar}
              placeholder="URL изображения"
              autoCapitalize="none"
              editable={!loading}
            />
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Сохранить</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: RADIUS.medium,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changeAvatarButton: {
    paddingVertical: 5,
  },
  changeAvatarText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: RADIUS.small,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
  },
});

export default EditProfileModal; 