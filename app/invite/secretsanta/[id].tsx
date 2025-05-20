import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Users } from 'lucide-react-native';

export default function SecretSantaInviteScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateInvite = async () => {
      try {
        // Проверяем существование приглашения
        const inviteData = await AsyncStorage.getItem(`@secretSanta:invite:${id}`);
        
        if (!inviteData) {
          setError('Приглашение не найдено или срок его действия истек');
          return;
        }

        const invite = JSON.parse(inviteData);
        
        // Проверяем статус приглашения
        if (invite.status !== 'active') {
          setError('Это приглашение больше не активно');
          return;
        }

        // Проверяем срок действия приглашения
        const now = new Date();
        const expiresAt = new Date(invite.expiresAt);
        if (now > expiresAt) {
          setError('Срок действия приглашения истек');
          return;
        }

        // Проверяем существование группы
        const groupData = await AsyncStorage.getItem(`@secretSanta:group:${invite.groupId}`);
        if (!groupData) {
          setError('Группа тайного Санты не найдена');
          return;
        }

        const group = JSON.parse(groupData);
        if (group.status !== 'active') {
          setError('Группа тайного Санты больше не активна');
          return;
        }

        // Если все проверки пройдены, перенаправляем на страницу тайного Санты
        router.replace({
          pathname: '/secret-santa',
          params: { groupId: invite.groupId }
        });
      } catch (error) {
        console.error('Error validating invite:', error);
        setError('Произошла ошибка при обработке приглашения');
      } finally {
        setIsLoading(false);
      }
    };

    validateInvite();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff0099" />
        <Text style={styles.loadingText}>Проверка приглашения...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        <TouchableOpacity style={styles.button} onPress={() => router.push('/secret-santa/group/new')}>
          <Text style={styles.buttonText}>Создать тайного Санту</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    maxWidth: 300,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  iconBadge: {
    backgroundColor: '#ff0099',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ff0099',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 