import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecretSantaGroup, Participant } from '../types/secret-santa';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

export default function CreateSecretSantaGroup() {
  const [groupName, setGroupName] = useState('');
  const [participateMyself, setParticipateMyself] = useState(true);
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите название группы');
      return;
    }

    try {
      const groupId = Math.random().toString(36).substring(2, 18);
      const creatorId = user?.id || 'current-user-id';
      const creatorName = user?.name || 'Admin';
      let participants: Participant[] = [];
      if (participateMyself) {
        participants.push({
          id: creatorId,
          name: creatorName,
          joinedAt: new Date(),
        });
      }
      const newGroup: SecretSantaGroup = {
        id: groupId,
        name: groupName,
        createdBy: creatorId,
        createdAt: new Date(),
        status: 'active',
        participants,
      };

      await AsyncStorage.setItem(`@secretSanta:group:${groupId}`, JSON.stringify(newGroup));
      
      // Добавить группу в список моих групп
      const myGroupsRaw = await AsyncStorage.getItem('@secretSanta:myGroups');
      let myGroups = myGroupsRaw ? JSON.parse(myGroupsRaw) : [];
      if (!myGroups.includes(groupId)) {
        myGroups.push(groupId);
        await AsyncStorage.setItem('@secretSanta:myGroups', JSON.stringify(myGroups));
      }

      // Generate invite link
      const inviteId = Math.random().toString(36).substring(2, 18);
      const invite = {
        id: inviteId,
        groupId: groupId,
        createdBy: creatorId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: 'active',
        maxUses: 1000,
        currentUses: 0,
        metadata: {
          groupName: groupName,
          creatorName: creatorName,
        }
      };

      await AsyncStorage.setItem(`@secretSanta:invite:${inviteId}`, JSON.stringify(invite));

      Alert.alert(
        'Успешно',
        'Группа создана! Теперь вы можете приглашать участников.',
        [
          {
            text: 'OK',
            onPress: () => router.push(`/secret-santa/group/${groupId}`)
          }
        ]
      );
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать группу');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Создать группу Тайного Санты</Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Участвовать самому</Text>
        <Switch
          value={participateMyself}
          onValueChange={setParticipateMyself}
          thumbColor={participateMyself ? '#ff0099' : '#ccc'}
          trackColor={{ true: '#ffd6ec', false: '#eee' }}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Название группы"
        value={groupName}
        onChangeText={setGroupName}
      />
      <TouchableOpacity style={styles.button} onPress={handleCreateGroup}>
        <Text style={styles.buttonText}>Создать группу</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ff0099',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 