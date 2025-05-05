import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Share, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Link, Users, Gift } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppLocalization } from './LocalizationWrapper';

const { width } = Dimensions.get('window');

type SecretSantaProps = {
  onClose?: () => void;
};

const SecretSanta = ({ onClose }: SecretSantaProps) => {
  const router = useRouter();
  const [wishlistText, setWishlistText] = useState('');
  const { t } = useAppLocalization();

  const handleSaveWishlist = async () => {
    if (wishlistText.trim()) {
      try {
        await AsyncStorage.setItem('@secretSanta:wishlist', wishlistText);
        Alert.alert('Успешно', 'Ваши пожелания сохранены');
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось сохранить пожелания');
      }
    } else {
      Alert.alert('Ошибка', 'Пожалуйста, введите ваши пожелания');
    }
  };

  const handleShareInvitation = async () => {
    try {
      const inviteLink = 'https://your-app.com/invite/secretsanta/' + Math.random().toString(36).substring(2, 10);
      await Share.share({
        message: `Присоединяйтесь к нашему обмену подарками Тайный Санта! Нажмите на эту ссылку для участия: ${inviteLink}`,
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось поделиться приглашением');
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Верхний блок с заголовком */}
      <View style={styles.headerBox}>
        <Text style={styles.title}>Тайный Санта</Text>
        
        <View style={styles.logoContainer}>
          <Gift color="#fff" size={28} />
        </View>
        
        <Text style={styles.subtitle}>Что в нового в версии:</Text>
      </View>

      {/* Анкета для Санты */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Анкета для Санты</Text>
          <View style={styles.iconBadge}>
            <Gift color="#fff" size={16} />
          </View>
        </View>
        
        <Text style={styles.cardDescription}>
          Прикрепите к анкете свои желания и записку, например, с адресом доставки или какие подарки вам больше по душе.
        </Text>
        
        <TextInput
          style={styles.textInput}
          placeholder="Введите ваши пожелания и детали доставки..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          value={wishlistText}
          onChangeText={setWishlistText}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleSaveWishlist}>
          <Text style={styles.buttonText}>Сохранить пожелания</Text>
        </TouchableOpacity>
      </View>

      {/* Приглашение по ссылке */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Приглашение по ссылке</Text>
          <View style={styles.iconBadge}>
            <Link color="#fff" size={16} />
          </View>
        </View>
        
        <Text style={styles.cardDescription}>
          Копируйте ссылку на приглашение и скидывайте в ватсапы, телеграмы или почты.
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={handleShareInvitation}>
          <Text style={styles.buttonText}>Поделиться ссылкой</Text>
        </TouchableOpacity>
      </View>

      {/* До 1000 участников */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>До 1000 участников</Text>
          <View style={styles.iconBadge}>
            <Users color="#fff" size={16} />
          </View>
        </View>
        
        <Text style={styles.cardDescription}>
          Приглашайте в игру до 1000 участников. Подойдёт для больших семей или корпораций.
        </Text>
      </View>

      {/* Специальная подборка */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Специальная подборка</Text>
          <View style={styles.iconBadge}>
            <Gift color="#fff" size={16} />
          </View>
        </View>
        
        <Text style={styles.cardDescription}>
          Если ваш подопечный не заполнил анкету — ничего страшного, мы приготовили классную подборку идей подарков для «Тайных Сант».
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={() => router.push('/gift-assistant')}>
          <Text style={styles.buttonText}>Получить идеи подарков</Text>
        </TouchableOpacity>
      </View>
      
      <View style={{height: 10}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    paddingHorizontal: 12,
  },
  headerBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ff0099',
    borderRadius: 16,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff0099',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ff0099',
    marginTop: 15,
    textAlign: 'center',
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ff0099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff0099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    color: '#333',
    marginBottom: 12,
    fontSize: 14,
    minHeight: 80,
  },
  button: {
    backgroundColor: '#ff0099',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default SecretSanta; 