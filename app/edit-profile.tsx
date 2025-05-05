import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { 
  ArrowLeft,
  Camera,
  Mail,
  User,
  Phone,
  Save,
} from 'lucide-react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/store/slices/authSlice';
import { store } from '@/store';

// Define RootState type based on the store
type RootState = ReturnType<typeof store.getState>;

export default function EditProfileScreen() {
  const { t } = useAppLocalization();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  // Initialize with current user data from Redux or fallback to defaults
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || 'Sophie Anderson',
    email: currentUser?.email || 'sophie.a@example.com',
    phone: '+1 234 567 8900',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'
  });

  const handleSave = () => {
    // Update the user data in Redux store
    dispatch(setUser({
      id: currentUser?.id || 'user1',
      name: profileData.name,
      email: profileData.email
    }));

    // Show success message
    Alert.alert(
      t('profile.profileUpdated'),
      t('profile.profileUpdatedMessage'),
      [
        { 
          text: 'OK', 
          onPress: () => router.back() 
        }
      ]
    );
  };

  const handleChangePhoto = () => {
    // In a real app, this would open image picker
    Alert.alert(
      t('profile.changePhoto'),
      t('profile.selectPhotoSource'),
      [
        { 
          text: t('profile.camera'), 
          onPress: () => console.log('Camera selected') 
        },
        { 
          text: t('profile.gallery'), 
          onPress: () => console.log('Gallery selected') 
        },
        { 
          text: t('common.cancel'), 
          style: 'cancel' 
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.editProfile')}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Save size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Image */}
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: profileData.profileImage }}
              style={styles.profileImage}
            />
            <TouchableOpacity 
              style={styles.cameraButton} 
              activeOpacity={0.8}
              onPress={handleChangePhoto}
            >
              <Camera size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>{t('profile.changePhoto')}</Text>
        </View>
        
        {/* Form */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('profile.fullName')}</Text>
            <View style={styles.inputContainer}>
              <User size={20} color={COLORS.gray400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profileData.name}
                onChangeText={(text) => setProfileData({...profileData, name: text})}
                placeholder={t('profile.enterName')}
                placeholderTextColor={COLORS.gray400}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('profile.email')}</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color={COLORS.gray400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profileData.email}
                onChangeText={(text) => setProfileData({...profileData, email: text})}
                placeholder={t('profile.enterEmail')}
                placeholderTextColor={COLORS.gray400}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('profile.phone')}</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={COLORS.gray400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profileData.phone}
                onChangeText={(text) => setProfileData({...profileData, phone: text})}
                placeholder={t('profile.enterPhone')}
                placeholderTextColor={COLORS.gray400}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>
        
        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveProfileButton}
          activeOpacity={0.8}
          onPress={handleSave}
        >
          <Text style={styles.saveProfileText}>{t('profile.saveChanges')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  saveButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  profileImageSection: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.medium,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOWS.small,
  },
  changePhotoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  formSection: {
    paddingHorizontal: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.md,
    height: 50,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray800,
    height: '100%',
  },
  saveProfileButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    height: 54,
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  saveProfileText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
}); 