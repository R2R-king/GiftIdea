import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ImageBackground, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Gift, Plus, Trash2 } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { useTheme } from './ThemeProvider';

export type HolidayEvent = {
  id: string;
  name: string;
  date: string;
  daysLeft: number;
  image: string;
  color?: [string, string];
};

interface UpcomingEventsProps {
  events: HolidayEvent[];
  showSeeAllButton?: boolean;
  onEventPress?: (event: HolidayEvent) => void;
  onGenerateGiftPress?: (event: HolidayEvent) => void;
  onAddEventPress?: () => void;
  onDeleteEvent?: (eventId: string, eventName: string) => void;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  events,
  showSeeAllButton = true,
  onEventPress,
  onGenerateGiftPress,
  onAddEventPress,
  onDeleteEvent
}) => {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';

  const handleEventPress = (event: HolidayEvent) => {
    if (onEventPress) {
      onEventPress(event);
    } else {
      // Default behavior - navigate to gift assistant
      router.push({
        pathname: '/gift-assistant',
        params: { occasion: event.name }
      });
    }
  };

  const handleGenerateGiftPress = (event: HolidayEvent, e: any) => {
    e.stopPropagation(); // Prevent triggering the card press
    if (onGenerateGiftPress) {
      onGenerateGiftPress(event);
    } else {
      // Default behavior
      const prefilledPrompt = `Помоги мне выбрать идеальный подарок на ${event.name}. Мероприятие состоится ${event.date}, осталось ${event.daysLeft} дней.`;
      router.push({
        pathname: '/gift-assistant',
        params: {
          prompt: prefilledPrompt,
          occasion: event.name,
        }
      });
    }
  };

  const handleDeleteButtonPress = (e: any, eventId: string, eventName: string) => {
    e.stopPropagation(); // Prevent triggering the card press
    if (onDeleteEvent) {
      onDeleteEvent(eventId, eventName);
    }
  };

  const navigateToAllEvents = () => {
    // Using the app path format that matches the router's expected format
    router.push('/all-events');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, isDark && { color: colors.textPrimary }]}>Ближайшие мероприятия</Text>
        {showSeeAllButton && (
          <TouchableOpacity onPress={navigateToAllEvents}>
            <Text style={[styles.viewAllButton, isDark && { color: colors.primary }]}>Все события</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            activeOpacity={0.95}
            onPress={() => handleEventPress(event)}
          >
            <ImageBackground 
              source={{ uri: event.image }} 
              style={styles.eventImageBackground}
              imageStyle={styles.eventBackgroundImage}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.6)']}
                style={styles.eventGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                {onDeleteEvent && (
                  <TouchableOpacity 
                    style={styles.deleteEventButton}
                    onPress={(e) => handleDeleteButtonPress(e, event.id, event.name)}
                  >
                    <Trash2 size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
                
                <View style={styles.eventContent}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <View style={styles.eventDetailRow}>
                    <Calendar size={14} color="#FFFFFF" />
                    <Text style={styles.eventDetail}>{event.date}</Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <Text style={styles.daysLeftText}>
                      {event.daysLeft === 0 
                        ? "Сегодня!" 
                        : `Осталось ${event.daysLeft} ${event.daysLeft === 1 ? 'день' : 
                          event.daysLeft < 5 ? 'дня' : 'дней'}`
                      }
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.generateButton}
                    onPress={(e) => handleGenerateGiftPress(event, e)}
                  >
                    <Text style={styles.generateButtonText}>Найти подарок</Text>
                    <Gift size={14} color="#FFFFFF" style={styles.buttonIcon} />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        ))}
        
        {onAddEventPress && (
          <TouchableOpacity
            style={styles.addEventCard}
            activeOpacity={0.9}
            onPress={onAddEventPress}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.addEventCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <View style={styles.addEventContent}>
                <View style={styles.addEventIconContainer}>
                  <Plus size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.addEventText}>Добавить событие</Text>
                <Text style={styles.addEventSubtext}>Создать напоминание</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllButton: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
  eventCard: {
    width: 240,
    height: 180,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImageBackground: {
    width: '100%',
    height: '100%',
  },
  eventBackgroundImage: {
    borderRadius: 12,
  },
  eventGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
    position: 'relative',
  },
  deleteEventButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContent: {
    width: '100%',
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventDetail: {
    fontSize: 13,
    color: '#FFFFFF',
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  daysLeftText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  buttonIcon: {
    marginTop: -1,
  },
  addEventCard: {
    width: 180,
    height: 180,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addEventCardGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  addEventContent: {
    alignItems: 'center',
  },
  addEventIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  addEventText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  addEventSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});

export default UpcomingEvents; 