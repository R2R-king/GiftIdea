import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import authService from '../../services/authService';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { User, Mail, Lock } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  
  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const inputAnim1 = useRef(new Animated.Value(0)).current;
  const inputAnim2 = useRef(new Animated.Value(0)).current;
  const inputAnim3 = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Запускаем анимацию появления
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Последовательная анимация для полей ввода
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(inputAnim1, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(inputAnim2, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(inputAnim3, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      
      // Анимация ошибки
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      return;
    }

    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен содержать минимум 6 символов');
      
      // Анимация ошибки
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      return;
    }

    try {
      setLoading(true);
      const response = await authService.register({ username, email, password });
      
      // Сохраняем данные пользователя в Redux store
      dispatch(setUser({
        id: response.username,
        name: response.username,
        email: response.email
      }));
      
      // Анимация успешной регистрации
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Alert.alert('Успех', 'Регистрация прошла успешно!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/profile') }
        ]);
      });
      
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      Alert.alert('Ошибка регистрации', error instanceof Error ? error.message : 'Не удалось зарегистрироваться');
      
      // Анимация ошибки
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
    } finally {
      setLoading(false);
    }
  };
  
  const onPressIn = () => {
    Animated.timing(buttonScale, {
      toValue: 0.97,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <LinearGradient 
      colors={[COLORS.primaryBackground, COLORS.white]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.headerContainer, 
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Создание аккаунта</Text>
            <Text style={styles.subtitle}>Укажите данные для регистрации</Text>
          </Animated.View>

          <View style={styles.formContainer}>
            <Animated.View 
              style={[
                styles.inputContainer,
                {
                  opacity: inputAnim1,
                  transform: [
                    { translateX: Animated.multiply(Animated.subtract(1, inputAnim1), -30) }
                  ]
                }
              ]}
            >
              <User size={20} color={COLORS.gray500} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Имя пользователя"
                placeholderTextColor={COLORS.gray400}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </Animated.View>

            <Animated.View 
              style={[
                styles.inputContainer,
                {
                  opacity: inputAnim2,
                  transform: [
                    { translateX: Animated.multiply(Animated.subtract(1, inputAnim2), -30) }
                  ]
                }
              ]}
            >
              <Mail size={20} color={COLORS.gray500} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.gray400}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </Animated.View>

            <Animated.View 
              style={[
                styles.inputContainer,
                {
                  opacity: inputAnim3,
                  transform: [
                    { translateX: Animated.multiply(Animated.subtract(1, inputAnim3), -30) }
                  ]
                }
              ]}
            >
              <Lock size={20} color={COLORS.gray500} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Пароль"
                placeholderTextColor={COLORS.gray400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </Animated.View>

            <Text style={styles.passwordRequirement}>
              * Пароль должен содержать минимум 6 символов
            </Text>

            <Animated.View
              style={{
                opacity: buttonAnim,
                transform: [
                  { scale: buttonScale },
                  { translateY: Animated.multiply(Animated.subtract(1, buttonAnim), 20) }
                ]
              }}
            >
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={1}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Зарегистрироваться</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          <Animated.View 
            style={[
              styles.footer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: Animated.multiply(Animated.subtract(1, fadeAnim), 20) }]
              }
            ]}
          >
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>или</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Войти в аккаунт</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? height * 0.08 : height * 0.05,
    paddingBottom: SPACING.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.title,
    fontWeight: FONTS.weights.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  formContainer: {
    marginTop: SPACING.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    height: 60,
    ...SHADOWS.small,
  },
  inputIcon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray800,
  },
  passwordRequirement: {
    color: COLORS.gray500,
    fontSize: FONTS.sizes.sm,
    marginBottom: SPACING.xl,
    marginTop: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  button: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.purple,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: SPACING.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray200,
  },
  dividerText: {
    color: COLORS.gray500,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.sm,
  },
  loginButton: {
    height: 56,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  loginButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
  },
});