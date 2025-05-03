import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/theme';
import { ArrowLeft } from 'lucide-react-native';

interface ImageGenerationLog {
  id: string;
  timestamp: string;
  eventName: string;
  status: 'pending' | 'complete' | 'error';
  message: string;
}

export default function ImageGenerationLogsScreen() {
  const [logs, setLogs] = useState<ImageGenerationLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  
  const loadLogs = async () => {
    try {
      setRefreshing(true);
      const storedLogs = await AsyncStorage.getItem('imageGenerationLogs');
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      }
    } catch (error) {
      console.error('Error loading image generation logs:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadLogs();
    
    // Обновляем логи каждые 3 секунды
    const interval = setInterval(loadLogs, 3000);
    return () => clearInterval(interval);
  }, []);
  
  const clearLogs = async () => {
    try {
      await AsyncStorage.setItem('imageGenerationLogs', JSON.stringify([]));
      setLogs([]);
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };
  
  const onRefresh = () => {
    loadLogs();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Логи генерации изображений',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.gray800} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={clearLogs} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Очистить</Text>
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#F8F9FA',
          },
          headerShadowVisible: false,
        }} 
      />
      
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View 
            style={[
              styles.logItem, 
              item.status === 'complete' ? styles.completeLog : 
              item.status === 'error' ? styles.errorLog : 
              styles.pendingLog
            ]}
          >
            <Text style={styles.timestamp}>{item.timestamp}</Text>
            <Text style={styles.eventName}>{item.eventName}</Text>
            <Text style={styles.statusText}>
              {item.status === 'pending' ? '⏳ В процессе' : 
               item.status === 'complete' ? '✅ Завершено' : 
               '❌ Ошибка'}
            </Text>
            <Text style={styles.message}>{item.message}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Нет логов генерации изображений</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  backButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearButton: {
    marginRight: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.error,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  logItem: {
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  pendingLog: {
    backgroundColor: '#FFF9C4',
    borderLeftColor: '#FBC02D',
  },
  completeLog: {
    backgroundColor: '#C8E6C9',
    borderLeftColor: '#4CAF50',
  },
  errorLog: {
    backgroundColor: '#FFCDD2',
    borderLeftColor: '#F44336',
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gray800,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: COLORS.gray700,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray500,
    textAlign: 'center',
  },
}); 