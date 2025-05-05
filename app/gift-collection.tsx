import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableNativeFeedback,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Share,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { 
  ArrowLeft, 
  Gift, 
  Plus, 
  Trash2, 
  Share as ShareIcon, 
  Edit,
  Copy,
  Check,
  DollarSign,
  Users,
  Calendar
} from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useTheme } from '@/components/ThemeProvider';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import CreateGiftCollectionForm from '@/components/CreateGiftCollectionForm';

const { width } = Dimensions.get('window');

interface Contribution {
  id: string;
  name: string;
  amount: number;
  date: string;
}

interface GiftCollection {
  id: string;
  title: string;
  recipient: string;
  occasion: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  dueDate: string;
  image: string;
  contributors: Contribution[];
  isArchived: boolean;
}

export default function GiftCollectionScreen() {
  const { theme, colors } = useTheme();
  const { t } = useAppLocalization();
  const isDark = theme === 'dark';
  
  // Sample data - in a real app, this would come from an API or state management
  const [collections, setCollections] = useState<GiftCollection[]>([
    {
      id: '1',
      title: 'Birthday Gift for Anna',
      recipient: 'Anna Smith',
      occasion: 'Birthday',
      description: 'Let\'s collect money for a nice birthday gift for Anna. Thinking of getting her that watch she\'s been eyeing!',
      targetAmount: 15000,
      currentAmount: 9500,
      dueDate: '2023-12-25',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=500',
      contributors: [
        { id: '1', name: 'You', amount: 2000, date: '2023-11-20' },
        { id: '2', name: 'Mike Johnson', amount: 3000, date: '2023-11-21' },
        { id: '3', name: 'Sarah Parker', amount: 1500, date: '2023-11-23' },
        { id: '4', name: 'Alex Wilson', amount: 3000, date: '2023-11-25' },
      ],
      isArchived: false
    },
    {
      id: '2',
      title: 'Farewell Gift for David',
      recipient: 'David Brown',
      occasion: 'Farewell',
      description: 'David is leaving the company after 5 years. Let\'s give him a nice memory to take with him!',
      targetAmount: 10000,
      currentAmount: 6000,
      dueDate: '2023-12-15',
      image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=500',
      contributors: [
        { id: '1', name: 'You', amount: 1500, date: '2023-11-18' },
        { id: '2', name: 'Lisa Kim', amount: 2000, date: '2023-11-19' },
        { id: '3', name: 'John Doe', amount: 2500, date: '2023-11-22' },
      ],
      isArchived: false
    }
  ]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [collectionDetails, setCollectionDetails] = useState<GiftCollection | null>(null);
  
  const handleCreateCollection = () => {
    console.log('Opening collection form modal');
    setFormModalVisible(true);
  };
  
  const handleFormSubmit = (newCollection: GiftCollection) => {
    console.log('Form submitted with data:', newCollection);
    // Add the new collection to the state
    setCollections([newCollection, ...collections]);
    setFormModalVisible(false);
  };
  
  const handleViewCollection = (collection: GiftCollection) => {
    setCollectionDetails(collection);
    setModalVisible(true);
  };
  
  const handleShareCollection = async (collection: GiftCollection) => {
    try {
      const shareUrl = `giftapp://collection/${collection.id}`;
      
      await Share.share({
        message: `Help collect money for ${collection.title}! We've collected ${collection.currentAmount} out of ${collection.targetAmount} so far. Join here: ${shareUrl}`,
        url: shareUrl,
        title: `Help with ${collection.title}`
      });
    } catch (error) {
      console.error("Error sharing collection:", error);
    }
  };
  
  const handleDeleteCollection = (collectionId: string) => {
    Alert.alert(
      t('giftCollection.delete.title'),
      t('giftCollection.delete.message'),
      [
        {
          text: t('giftCollection.delete.cancel'),
          style: "cancel"
        },
        {
          text: t('giftCollection.delete.confirm'),
          style: "destructive",
          onPress: () => {
            // In a real app, call an API to delete
            setCollections(collections.filter(c => c.id !== collectionId));
          }
        }
      ]
    );
  };
  
  const getProgressPercentage = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100);
  };
  
  const formatCurrency = (amount: number) => {
    return `₽${amount.toLocaleString()}`;
  };
  
  const renderCollectionCard = (collection: GiftCollection) => {
    const progress = getProgressPercentage(collection.currentAmount, collection.targetAmount);
    const remainingAmount = collection.targetAmount - collection.currentAmount;
    
    // Card content wrapper - remains the same for both platforms
    const cardContent = (
      <>
        <Image source={{ uri: collection.image }} style={styles.collectionImage} />
        
        <View style={styles.cardContent}>
          <Text style={[styles.collectionTitle, { color: isDark ? '#FFFFFF' : colors.gray800 }]}>
            {collection.title}
          </Text>
          
          <View style={styles.detailsRow}>
            <View style={styles.iconTextContainer}>
              <Users size={14} color={isDark ? '#FFFFFF' : colors.primary} />
              <Text style={[styles.detailsText, { color: isDark ? '#FFFFFF' : colors.gray600 }]}>
                {collection.contributors.length} {t('giftCollection.participants')}
              </Text>
            </View>
            
            <View style={styles.iconTextContainer}>
              <Calendar size={14} color={isDark ? '#FFFFFF' : colors.primary} />
              <Text style={[styles.detailsText, { color: isDark ? '#FFFFFF' : colors.gray600 }]}>
                {t('giftCollection.until')} {new Date(collection.dueDate).toLocaleDateString('ru-RU')}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : COLORS.gray200 }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress}%`, backgroundColor: isDark ? '#FF6B9D' : colors.primary }
                ]} 
              />
            </View>
            
            <View style={styles.amountRow}>
              <Text style={[styles.currentAmount, { color: isDark ? '#FFFFFF' : colors.primary }]}>
                {formatCurrency(collection.currentAmount)}
              </Text>
              <Text style={[styles.targetAmount, { color: isDark ? '#FFFFFF' : colors.gray600 }]}>
                {t('giftCollection.of')} {formatCurrency(collection.targetAmount)}
              </Text>
            </View>
          </View>
          
          <View style={styles.actionsRow}>
            {Platform.OS === 'android' ? (
              <TouchableNativeFeedback
                background={TouchableNativeFeedback.Ripple(colors.primary + '40', false)}
                onPress={() => Alert.alert('Contribute', 'Add your contribution to this collection')}
                useForeground={true}
              >
                <View style={[styles.cardActionButton, { backgroundColor: isDark ? 'rgba(255, 107, 157, 0.25)' : `${colors.primary}15` }]}>
                  <DollarSign size={18} color={isDark ? '#FFFFFF' : colors.primary} />
                  <Text style={[styles.actionButtonText, { color: isDark ? '#FFFFFF' : colors.primary }]}>{t('giftCollection.contribute')}</Text>
                </View>
              </TouchableNativeFeedback>
            ) : (
              <TouchableOpacity 
                style={[styles.cardActionButton, { backgroundColor: isDark ? 'rgba(255, 107, 157, 0.25)' : `${colors.primary}15` }]}
                onPress={() => Alert.alert('Contribute', 'Add your contribution to this collection')}
                activeOpacity={0.7}
              >
                <DollarSign size={18} color={isDark ? '#FFFFFF' : colors.primary} />
                <Text style={[styles.actionButtonText, { color: isDark ? '#FFFFFF' : colors.primary }]}>{t('giftCollection.contribute')}</Text>
              </TouchableOpacity>
            )}
            
            {Platform.OS === 'android' ? (
              <TouchableNativeFeedback
                background={TouchableNativeFeedback.Ripple(isDark ? '#FFFFFF40' : '#00000040', true)}
                onPress={() => handleShareCollection(collection)}
                useForeground={true}
              >
                <View style={[styles.iconButton, { backgroundColor: isDark ? '#333333' : colors.gray100 }]}>
                  <ShareIcon size={18} color={isDark ? '#FFFFFF' : colors.gray600} />
                </View>
              </TouchableNativeFeedback>
            ) : (
              <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: isDark ? '#333333' : colors.gray100 }]}
                onPress={() => handleShareCollection(collection)}
                activeOpacity={0.7}
              >
                <ShareIcon size={18} color={isDark ? '#FFFFFF' : colors.gray600} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </>
    );
    
    // Use different TouchableComponent based on platform
    if (Platform.OS === 'android') {
      return (
        <View key={collection.id} style={[styles.collectionCard, { backgroundColor: isDark ? '#121212' : colors.white }]}>
          <TouchableNativeFeedback
            background={TouchableNativeFeedback.Ripple('#CCCCCC', false)}
            onPress={() => handleViewCollection(collection)}
          >
            <View style={styles.rippleContainer}>
              {cardContent}
            </View>
          </TouchableNativeFeedback>
        </View>
      );
    } else {
      // iOS case
      return (
        <TouchableOpacity
          key={collection.id}
          style={[
            styles.collectionCard,
            { backgroundColor: isDark ? '#121212' : colors.white }
          ]}
          onPress={() => handleViewCollection(collection)}
          activeOpacity={0.9}
        >
          {cardContent}
        </TouchableOpacity>
      );
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.white }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <Stack.Screen 
        options={{
          headerShown: false
        }}
      />
      
      {/* Header */}
      <LinearGradient
        colors={[isDark ? '#FF6B9D' : colors.primaryLight, isDark ? '#121212' : colors.white]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={isDark ? '#FFFFFF' : colors.gray800} />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : colors.gray800 }]}>
              {t('giftCollection.title')}
            </Text>
            <Text style={[styles.headerSubtitle, { color: isDark ? '#FFFFFF' : colors.gray600 }]}>
              {t('giftCollection.subtitle')}
            </Text>
          </View>
          
          {Platform.OS === 'android' ? (
            <TouchableNativeFeedback
              background={TouchableNativeFeedback.Ripple('#FFFFFF', true)}
              onPress={handleCreateCollection}
              useForeground={true}
            >
              <View 
                style={[
                  styles.createButton, 
                  { backgroundColor: colors.primary }
                ]}
              >
                <Plus size={24} color='#FFFFFF' />
              </View>
            </TouchableNativeFeedback>
          ) : (
            <TouchableOpacity 
              style={[
                styles.createButton, 
                { backgroundColor: colors.primary }
              ]}
              onPress={handleCreateCollection}
              activeOpacity={0.7}
            >
              <Plus size={24} color='#FFFFFF' />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
      
      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : colors.gray800 }]}>
          {t('giftCollection.activeFunds')}
        </Text>
        
        {collections.filter(c => !c.isArchived).map(renderCollectionCard)}
      </ScrollView>
      
      {/* Collection Form Modal (outside of ScrollView to ensure it's above all content) */}
      <CreateGiftCollectionForm
        visible={formModalVisible}
        onClose={() => setFormModalVisible(false)}
        onSubmit={handleFormSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight! + 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.gray800,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    marginTop: 4,
    opacity: 0.9,
  },
  createButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: COLORS.gray800,
  },
  collectionCard: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    transform: [{ scale: 1 }],
  },
  collectionImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: COLORS.gray800,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 13,
    color: COLORS.gray600,
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  targetAmount: {
    fontSize: 13,
    color: COLORS.gray600,
    marginLeft: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    overflow: 'hidden',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    overflow: 'hidden',
  },
  rippleContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  
  buttonContentWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  
  iconButtonWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  createRippleContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  
  createButtonWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
  },
}); 