import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecretSantaGroup, Participant } from '../types/secret-santa';
import { useSelector } from 'react-redux';

interface Props {
  groupId: string;
}

export default function SecretSantaGroupManager({ groupId }: Props) {
  const [group, setGroup] = useState<SecretSantaGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    try {
      const groupData = await AsyncStorage.getItem(`@secretSanta:group:${groupId}`);
      if (groupData) {
        const group = JSON.parse(groupData);
        
        // Get all users data from AsyncStorage
        const usersData = await AsyncStorage.getItem('@users');
        const users = usersData ? JSON.parse(usersData) : {};
        
        // Update names of all participants
        let updated = false;
        group.participants = group.participants.map((p: any) => {
          const userData = users[p.id];
          if (userData && userData.name && p.name !== userData.name) {
            updated = true;
            return { ...p, name: userData.name };
          }
          return p;
        });
        
        if (updated) {
          await AsyncStorage.setItem(`@secretSanta:group:${groupId}`, JSON.stringify(group));
        }
        
        setGroup(group);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить данные группы');
    } finally {
      setLoading(false);
    }
  };

  const handleShareInvite = async () => {
    try {
      const inviteId = Math.random().toString(36).substring(2, 18);
      const invite = {
        id: inviteId,
        groupId: groupId,
        createdBy: group?.createdBy,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: 'active',
        maxUses: 1000,
        currentUses: 0,
        metadata: {
          groupName: group?.name,
          creatorName: 'Admin', // TODO: Replace with actual user name
        }
      };

      await AsyncStorage.setItem(`@secretSanta:invite:${inviteId}`, JSON.stringify(invite));
      
      const inviteLink = `https://giftidea.app/invite/secretsanta/${inviteId}`;
      await Share.share({
        message: `Присоединяйтесь к нашей группе Тайного Санты "${group?.name}"! Нажмите на эту ссылку для участия: ${inviteLink}`,
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось поделиться приглашением');
    }
  };

  const handleDistribute = async () => {
    if (!group || group.participants.length < 3) {
      Alert.alert('Ошибка', 'Для распределения нужно минимум 3 участника');
      return;
    }

    try {
      // Создаем копию массива участников
      const participants = [...group.participants];
      
      // Перемешиваем массив
      for (let i = participants.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [participants[i], participants[j]] = [participants[j], participants[i]];
      }

      // Создаем пары
      const pairs = participants.map((participant, index) => ({
        santaId: participant.id,
        recipientId: participants[(index + 1) % participants.length].id
      }));

      const updatedGroup: SecretSantaGroup = {
        ...group,
        status: 'distributed',
        distribution: {
          pairs,
          distributedAt: new Date()
        }
      };

      await AsyncStorage.setItem(`@secretSanta:group:${groupId}`, JSON.stringify(updatedGroup));
      setGroup(updatedGroup);

      Alert.alert('Успешно', 'Участники распределены!');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось распределить участников');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <Text>Группа не найдена</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{group.name}</Text>
      
      <View style={styles.stats}>
        <Text style={styles.statText}>
          Участников: {group.participants.length}
        </Text>
        <Text style={styles.statText}>
          Статус: {group.status === 'active' ? 'Активна' : 'Распределена'}
        </Text>
      </View>

      {group.status === 'active' && (
        <>
          <TouchableOpacity style={styles.button} onPress={handleShareInvite}>
            <Text style={styles.buttonText}>Пригласить участников</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.distributeButton]} 
            onPress={handleDistribute}
          >
            <Text style={styles.buttonText}>Распределить участников</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.sectionTitle}>Участники:</Text>
      <FlatList
        data={group.participants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.participantItem}>
            <Text style={styles.participantName}>{item.name}</Text>
            {item.wishlist && (
              <Text style={styles.wishlist} numberOfLines={1}>
                {item.wishlist}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statText: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#ff0099',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  distributeButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  participantItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  wishlist: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 