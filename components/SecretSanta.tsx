import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Share, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Link, Users, Gift, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppLocalization } from './LocalizationWrapper';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

type SecretSantaProps = {
  onClose?: () => void;
};

const SecretSanta = ({ onClose }: SecretSantaProps) => {
  const router = useRouter();
  const [wishlistText, setWishlistText] = useState('');
  const { t } = useAppLocalization();
  const [myGroups, setMyGroups] = useState<string[]>([]);
  const [groupsData, setGroupsData] = useState<any[]>([]);
  const user = useSelector((state: any) => state.auth.user);

  const loadGroups = async () => {
    const myGroupsRaw = await AsyncStorage.getItem('@secretSanta:myGroups');
    const groupIds = myGroupsRaw ? JSON.parse(myGroupsRaw) : [];
    setMyGroups(groupIds);
    const data = [];
    for (const id of groupIds) {
      const groupRaw = await AsyncStorage.getItem(`@secretSanta:group:${id}`);
      if (groupRaw) {
        data.push(JSON.parse(groupRaw));
      }
    }
    setGroupsData(data);
  };

  const updateCreatorNameInGroups = async () => {
    if (!user?.id || !user?.name) return;
    const myGroupsRaw = await AsyncStorage.getItem('@secretSanta:myGroups');
    const groupIds = myGroupsRaw ? JSON.parse(myGroupsRaw) : [];
    
    // Get all users data
    const usersData = await AsyncStorage.getItem('@users');
    const users = usersData ? JSON.parse(usersData) : {};
    
    for (const id of groupIds) {
      const groupRaw = await AsyncStorage.getItem(`@secretSanta:group:${id}`);
      if (groupRaw) {
        const group = JSON.parse(groupRaw);
        let updated = false;
        
        // Update names of all participants
        group.participants = group.participants.map((p: any) => {
          const userData = users[p.id];
          if (userData && userData.name && p.name !== userData.name) {
            updated = true;
            return { ...p, name: userData.name };
          }
          return p;
        });
        
        if (updated) {
          await AsyncStorage.setItem(`@secretSanta:group:${id}`, JSON.stringify(group));
          
          // Update creator name in invite metadata
          const inviteId = Math.random().toString(36).substring(2, 18);
          const invite = {
            id: inviteId,
            groupId: id,
            createdBy: user.id,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: 'active',
            maxUses: 1000,
            currentUses: 0,
            metadata: {
              groupName: group.name,
              creatorName: user.name,
            }
          };
          await AsyncStorage.setItem(`@secretSanta:invite:${inviteId}`, JSON.stringify(invite));
        }
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      updateCreatorNameInGroups().then(loadGroups);
    }, [user?.name, user?.id])
  );

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
      // Генерируем уникальный идентификатор приглашения
      const inviteId = Math.random().toString(36).substring(2, 18);
      const inviteLink = `https://giftidea.app/invite/secretsanta/${inviteId}`;
      await Share.share({
        message: `Присоединяйтесь к нашему обмену подарками Тайный Санта! Нажмите на эту ссылку для участия: ${inviteLink}`,
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось поделиться приглашением');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    Alert.alert('Роспуск группы', 'Вы уверены, что хотите распустить эту комнату?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Распустить', style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem(`@secretSanta:group:${groupId}`);
          const myGroupsRaw = await AsyncStorage.getItem('@secretSanta:myGroups');
          let myGroups = myGroupsRaw ? JSON.parse(myGroupsRaw) : [];
          myGroups = myGroups.filter((id: string) => id !== groupId);
          await AsyncStorage.setItem('@secretSanta:myGroups', JSON.stringify(myGroups));
          loadGroups();
        }
      }
    ]);
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

      {/* Кнопка создания тайного Санты */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Создать тайного Санту</Text>
          <View style={styles.iconBadge}>
            <Users color="#fff" size={16} />
          </View>
        </View>
        <Text style={styles.cardDescription}>
          После создания вы сможете пригласить участников и распределить пары.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/secret-santa/group/santa-group-manager')}>
          <Text style={styles.buttonText}>Создать тайного Санту</Text>
        </TouchableOpacity>
      </View>

      {groupsData.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>Мои комнаты Тайного Санты:</Text>
          {groupsData.map(group => (
            <View key={group.id} style={[styles.card, { borderColor: '#ff0099', borderWidth: 1, position: 'relative' }]}> 
              <TouchableOpacity style={styles.closeIcon} onPress={() => handleDeleteGroup(group.id)}>
                <X size={20} color="#ff0099" />
              </TouchableOpacity>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{group.name}</Text>
              <Text style={{ color: '#666', marginBottom: 8 }}>Участников: {group.participants.length}</Text>
              <Text style={{ color: '#666', marginBottom: 8 }}>Статус: {group.status === 'active' ? 'Активна' : 'Распределена'}</Text>
              <TouchableOpacity style={styles.button} onPress={() => router.push(`/secret-santa/group/${group.id}`)}>
                <Text style={styles.buttonText}>Перейти в комнату</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

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
          Если ваш подопечный не заполнит анкету — ничего страшного, мы приготовили классную подборку идей подарков для «Тайных Сант».
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
  closeIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
});

export default SecretSanta; 