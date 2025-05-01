import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  useColorScheme,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { Award, Gift, ChevronRight, Ticket, Coins, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const BONUSES_PER_RUBLE = 0.05; // 5% возврата бонусами

type LoyaltyLevel = {
  id: string;
  name: string;
  bonusMultiplier: number;
  minSpent: number;
  benefits: string[];
  color: string;
  darkColor: string;
};

type BonusTransaction = {
  id: string;
  amount: number;
  date: Date;
  type: 'earned' | 'spent';
  description: string;
};

type Reward = {
  id: string;
  name: string;
  description: string;
  bonusPrice: number;
  imageUrl: string;
  expiresAt?: Date;
};

export const LoyaltyProgram = ({ onClose }: { onClose?: () => void }) => {
  const [bonusBalance, setBonusBalance] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<LoyaltyLevel | null>(null);
  const [transactions, setTransactions] = useState<BonusTransaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  
  // In a real app, this would come from Redux
  const user = useSelector((state: any) => state.auth?.user || null);
  
  const loyaltyLevels: LoyaltyLevel[] = [
    {
      id: 'bronze',
      name: 'Бронзовый',
      bonusMultiplier: 1,
      minSpent: 0,
      benefits: ['5% бонусов от каждой покупки', 'Доступ к специальным акциям'],
      color: '#CD7F32',
      darkColor: '#8B5A2B',
    },
    {
      id: 'silver',
      name: 'Серебряный',
      bonusMultiplier: 1.5,
      minSpent: 10000,
      benefits: [
        '7.5% бонусов от каждой покупки',
        'Бесплатная доставка при заказе от 2000 ₽',
        'Эксклюзивные предложения',
      ],
      color: '#C0C0C0',
      darkColor: '#A9A9A9',
    },
    {
      id: 'gold',
      name: 'Золотой',
      bonusMultiplier: 2,
      minSpent: 30000,
      benefits: [
        '10% бонусов от каждой покупки',
        'Бесплатная доставка на все заказы',
        'Приоритетное обслуживание',
        'Персональный консультант по подаркам',
      ],
      color: '#FFD700',
      darkColor: '#DAA520',
    },
    {
      id: 'platinum',
      name: 'Платиновый',
      bonusMultiplier: 3,
      minSpent: 100000,
      benefits: [
        '15% бонусов от каждой покупки',
        'Все преимущества Золотого уровня',
        'Доступ к предпродажам',
        'Эксклюзивные мероприятия',
        'Особые подарки на день рождения',
      ],
      color: '#E5E4E2',
      darkColor: '#B9B8B5',
    },
  ];
  
  useEffect(() => {
    fetchLoyaltyData();
  }, []);
  
  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call to fetch the user's loyalty data
      // For demo purposes, we'll use mock data or AsyncStorage
      
      // Get data from AsyncStorage (or use mock data if not found)
      const bonusData = await AsyncStorage.getItem('bonusBalance');
      const spentData = await AsyncStorage.getItem('totalSpent');
      const transactionsData = await AsyncStorage.getItem('bonusTransactions');
      
      // Set bonus balance
      const storedBonusBalance = bonusData ? parseInt(bonusData, 10) : null;
      if (storedBonusBalance !== null) {
        setBonusBalance(storedBonusBalance);
      } else {
        // Mock data
        setBonusBalance(750);
        await AsyncStorage.setItem('bonusBalance', '750');
      }
      
      // Set total spent
      const storedTotalSpent = spentData ? parseInt(spentData, 10) : null;
      if (storedTotalSpent !== null) {
        setTotalSpent(storedTotalSpent);
      } else {
        // Mock data
        const mockTotalSpent = 15600;
        setTotalSpent(mockTotalSpent);
        await AsyncStorage.setItem('totalSpent', mockTotalSpent.toString());
      }
      
      // Set transactions
      const storedTransactions = transactionsData ? JSON.parse(transactionsData) : null;
      if (storedTransactions !== null) {
        // Convert date strings back to Date objects
        const formattedTransactions = storedTransactions.map((tx: any) => ({
          ...tx,
          date: new Date(tx.date),
        }));
        setTransactions(formattedTransactions);
      } else {
        // Mock data
        const mockTransactions: BonusTransaction[] = [
          {
            id: 't1',
            amount: 150,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2), // 2 days ago
            type: 'earned',
            description: 'Заказ #1234',
          },
          {
            id: 't2',
            amount: 300,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000 * 5), // 5 days ago
            type: 'earned',
            description: 'Заказ #1230',
          },
          {
            id: 't3',
            amount: 100,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000 * 7), // 7 days ago
            type: 'spent',
            description: 'Скидка на заказ #1229',
          },
          {
            id: 't4',
            amount: 400,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000 * 14), // 14 days ago
            type: 'earned',
            description: 'Заказ #1220',
          },
        ];
        setTransactions(mockTransactions);
        await AsyncStorage.setItem('bonusTransactions', JSON.stringify(mockTransactions));
      }
      
      // Set rewards
      const mockRewards: Reward[] = [
        {
          id: 'r1',
          name: 'Скидка 500 ₽',
          description: 'Скидка 500 ₽ на любой заказ от 2000 ₽',
          bonusPrice: 500,
          imageUrl: 'https://example.com/reward1.jpg',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
        {
          id: 'r2',
          name: 'Бесплатная доставка',
          description: 'Бесплатная доставка следующего заказа',
          bonusPrice: 300,
          imageUrl: 'https://example.com/reward2.jpg',
        },
        {
          id: 'r3',
          name: 'VIP-обслуживание',
          description: 'Месяц VIP-обслуживания и консультации по подбору подарков',
          bonusPrice: 1000,
          imageUrl: 'https://example.com/reward3.jpg',
        },
        {
          id: 'r4',
          name: 'Подарочная упаковка',
          description: 'Премиальная подарочная упаковка для следующего заказа',
          bonusPrice: 200,
          imageUrl: 'https://example.com/reward4.jpg',
        },
      ];
      setRewards(mockRewards);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Determine current loyalty level based on total spent
    const determinedLevel = loyaltyLevels
      .slice()
      .reverse()
      .find(level => totalSpent >= level.minSpent) || loyaltyLevels[0];
    
    setCurrentLevel(determinedLevel);
  }, [totalSpent]);
  
  const calculateProgressToNextLevel = () => {
    if (!currentLevel) return 0;
    
    const currentLevelIndex = loyaltyLevels.findIndex(level => level.id === currentLevel.id);
    
    // If user is at the highest level, progress is 100%
    if (currentLevelIndex === loyaltyLevels.length - 1) {
      return 100;
    }
    
    const nextLevel = loyaltyLevels[currentLevelIndex + 1];
    const currentLevelMin = currentLevel.minSpent;
    const nextLevelMin = nextLevel.minSpent;
    const spentSinceLastLevel = totalSpent - currentLevelMin;
    const requiredForNextLevel = nextLevelMin - currentLevelMin;
    
    return Math.min(100, Math.floor((spentSinceLastLevel / requiredForNextLevel) * 100));
  };
  
  const handleRedeemReward = async (reward: Reward) => {
    if (bonusBalance < reward.bonusPrice) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    // In a real app, this would call an API to redeem the reward
    try {
      // Simulate API call
      setLoading(true);
      
      // Wait a bit to simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update bonus balance
      const newBalance = bonusBalance - reward.bonusPrice;
      setBonusBalance(newBalance);
      await AsyncStorage.setItem('bonusBalance', newBalance.toString());
      
      // Add transaction
      const newTransaction: BonusTransaction = {
        id: `t${Date.now()}`,
        amount: reward.bonusPrice,
        date: new Date(),
        type: 'spent',
        description: `Награда: ${reward.name}`,
      };
      
      const updatedTransactions = [newTransaction, ...transactions];
      setTransactions(updatedTransactions);
      await AsyncStorage.setItem('bonusTransactions', JSON.stringify(updatedTransactions));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setLoading(false);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      setLoading(false);
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={[styles.loadingText, isDark && styles.darkText]}>
          Загрузка программы лояльности...
        </Text>
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={[styles.container, isDark && styles.darkContainer]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Loyalty Card */}
      <View 
        style={[
          styles.loyaltyCard, 
          { 
            backgroundColor: isDark 
              ? currentLevel?.darkColor || '#333' 
              : currentLevel?.color || '#f0f0f0' 
          }
        ]}
      >
        <View style={styles.loyaltyCardHeader}>
          <View style={styles.levelContainer}>
            <Award color="#fff" size={24} />
            <Text style={styles.levelName}>{currentLevel?.name || 'Бронзовый'}</Text>
          </View>
          <Text style={styles.bonusBalance}>{bonusBalance} бонусов</Text>
        </View>
        
        <View style={styles.loyaltyCardBody}>
          <Text style={styles.bonusRate}>
            {currentLevel ? `${currentLevel.bonusMultiplier * BONUSES_PER_RUBLE * 100}%` : '5%'} бонусов от покупок
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${calculateProgressToNextLevel()}%` }
                ]} 
              />
            </View>
            
            {currentLevel && currentLevelIndex < loyaltyLevels.length - 1 && (
              <Text style={styles.progressText}>
                До уровня "{loyaltyLevels[currentLevelIndex + 1].name}": {
                  (loyaltyLevels[currentLevelIndex + 1].minSpent - totalSpent).toLocaleString('ru-RU')
                } ₽
              </Text>
            )}
            
            {currentLevel && currentLevelIndex === loyaltyLevels.length - 1 && (
              <Text style={styles.progressText}>
                Поздравляем! Вы достигли максимального уровня!
              </Text>
            )}
          </View>
        </View>
      </View>
      
      {/* Benefits */}
      <View style={[styles.section, isDark && styles.darkSection]}>
        <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
          Преимущества вашего уровня
        </Text>
        
        {currentLevel?.benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <View style={styles.bulletPoint} />
            <Text style={[styles.benefitText, isDark && styles.darkText]}>
              {benefit}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Rewards */}
      <View style={[styles.section, isDark && styles.darkSection]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            Доступные награды
          </Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.seeAllText}>Все награды</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={rewards}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          style={styles.rewardsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.rewardCard, isDark && styles.darkRewardCard]}
              onPress={() => handleRedeemReward(item)}
              disabled={bonusBalance < item.bonusPrice}
            >
              <View style={styles.rewardImageContainer}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.rewardImage}
                  defaultSource={require('../assets/images/placeholder.png')}
                />
                {bonusBalance < item.bonusPrice && (
                  <View style={styles.lockedOverlay}>
                    <Coins color="#fff" size={20} />
                    <Text style={styles.lockedText}>Нужно больше бонусов</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.rewardInfo}>
                <Text style={[styles.rewardName, isDark && styles.darkText]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.rewardDescription, isDark && styles.darkTextSecondary]} numberOfLines={2}>
                  {item.description}
                </Text>
                
                <View style={styles.rewardFooter}>
                  <View style={styles.rewardPrice}>
                    <Coins color={isDark ? '#64b5f6' : '#2196f3'} size={14} />
                    <Text style={[styles.rewardPriceText, isDark && { color: '#64b5f6' }]}>
                      {item.bonusPrice}
                    </Text>
                  </View>
                  
                  {item.expiresAt && (
                    <View style={styles.rewardExpiry}>
                      <Clock color={isDark ? '#aaa' : '#666'} size={12} />
                      <Text style={[styles.rewardExpiryText, isDark && { color: '#aaa' }]}>
                        до {formatDate(item.expiresAt)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
      
      {/* Transactions */}
      <View style={[styles.section, isDark && styles.darkSection]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            История бонусов
          </Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.seeAllText}>Вся история</Text>
          </TouchableOpacity>
        </View>
        
        {transactions.length === 0 ? (
          <Text style={[styles.emptyText, isDark && styles.darkTextSecondary]}>
            У вас пока нет операций с бонусами
          </Text>
        ) : (
          transactions.slice(0, 5).map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIconContainer}>
                {transaction.type === 'earned' ? (
                  <Coins color="#4CAF50" size={20} />
                ) : (
                  <Ticket color="#FF9800" size={20} />
                )}
              </View>
              
              <View style={styles.transactionInfo}>
                <Text style={[styles.transactionDescription, isDark && styles.darkText]}>
                  {transaction.description}
                </Text>
                <Text style={[styles.transactionDate, isDark && styles.darkTextSecondary]}>
                  {formatDate(transaction.date)}
                </Text>
              </View>
              
              <Text 
                style={[
                  styles.transactionAmount,
                  transaction.type === 'earned' ? styles.earned : styles.spent,
                  isDark && (transaction.type === 'earned' ? styles.darkEarned : styles.darkSpent)
                ]}
              >
                {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

// Определяем текущий уровень для удобства использования в компоненте
const currentLevelIndex = 1; // Для демонстрации, в реальном коде это определяется динамически

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  darkText: {
    color: '#e0e0e0',
  },
  darkTextSecondary: {
    color: '#aaa',
  },
  loyaltyCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loyaltyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  bonusBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  loyaltyCardBody: {
    marginTop: 8,
  },
  bonusRate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 6,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  darkSection: {
    backgroundColor: '#2a2a2a',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2196f3',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2196f3',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  rewardsList: {
    marginLeft: -6,
    marginRight: -6,
  },
  rewardCard: {
    width: width * 0.6,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginHorizontal: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkRewardCard: {
    backgroundColor: '#333',
  },
  rewardImageContainer: {
    height: 120,
    position: 'relative',
  },
  rewardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  lockedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  rewardInfo: {
    padding: 12,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    height: 36,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardPriceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2196f3',
  },
  rewardExpiry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardExpiryText: {
    fontSize: 10,
    color: '#666',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  earned: {
    color: '#4CAF50',
  },
  spent: {
    color: '#FF9800',
  },
  darkEarned: {
    color: '#81C784',
  },
  darkSpent: {
    color: '#FFB74D',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
});

export default LoyaltyProgram; 