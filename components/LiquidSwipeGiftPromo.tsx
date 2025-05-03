import React, { useState } from "react";
import { View, StyleSheet, Dimensions, Alert, Image, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Slider, Slide } from "./gift-promo";

// Онлайн изображения для слайдов
const giftImages = {
  gift1: "https://img.freepik.com/free-vector/festive-gift-boxes-concept_74855-7300.jpg",
  gift2: "https://img.freepik.com/free-vector/package-box-with-jewelry-or-accessories-illustration_74855-20631.jpg",
  gift3: "https://img.freepik.com/free-photo/personalized-gift-celebration-arrangement-still-life_23-2149817490.jpg",
  gift4: "https://img.freepik.com/free-photo/modern-technological-devices-arrangement_23-2149049924.jpg",
  gift5: "https://img.freepik.com/free-vector/flat-design-online-shopping-concept_52683-63898.jpg",
};

const slides = [
  {
    color: "#F2A1AD",
    title: "Особенные подарки",
    description:
      "Найдите уникальные идеи для подарков, которые порадуют ваших близких",
    picture: { uri: giftImages.gift1 },
  },
  {
    color: "#6A5ACD",
    title: "Украшения и аксессуары",
    description:
      "Изысканные украшения и стильные аксессуары для особенных моментов",
    picture: { uri: giftImages.gift2 },
  },
  {
    color: "#69C743",
    title: "Персонализированные подарки",
    description:
      "Создайте индивидуальный подарок, который будет напоминать о вас",
    picture: { uri: giftImages.gift3 },
  },
  {
    color: "#FB3A4D",
    title: "Электроника и гаджеты",
    description:
      "Современные технологии и интересные гаджеты для техноэнтузиастов",
    picture: { uri: giftImages.gift4 },
  },
  {
    color: "#F2AD62",
    title: "Начать поиск",
    description:
      "Перейдите в наше приложение и найдите идеальный подарок прямо сейчас!",
    picture: { uri: giftImages.gift5 },
    isLast: true,
  },
];

export const assets = slides.map(({ picture }) => picture);

interface LiquidSwipeGiftPromoProps {
  onFinish?: () => void;
}

const { height } = Dimensions.get('window');

const LiquidSwipeGiftPromo = ({ onFinish }: LiquidSwipeGiftPromoProps) => {
  const [index, setIndex] = useState(0);
  const prev = slides[index - 1];
  const next = slides[index + 1];
  const isLastSlide = index === slides.length - 1;
  const insets = useSafeAreaInsets();

  const handleFinish = () => {
    if (onFinish) {
      onFinish();
    } else {
      try {
        router.replace('/(tabs)');
      } catch (error) {
        // Fallback for when testing - instead of navigation, just show an alert
        Alert.alert("Готово!", "Переход к основному приложению");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Slider
        key={index}
        index={index}
        setIndex={setIndex}
        prev={prev && <Slide slide={prev} onFinish={handleFinish} />}
        next={next && <Slide slide={next} onFinish={handleFinish} />}
      >
        <Slide slide={slides[index]!} onFinish={handleFinish} />
      </Slider>

      {isLastSlide && (
        <TouchableOpacity 
          style={[
            styles.fixedButton, 
            { bottom: Math.max(30, insets.bottom + 10) }
          ]}
          onPress={handleFinish}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>НАЧАТЬ</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedButton: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    backgroundColor: '#FB3A4D',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1000,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default LiquidSwipeGiftPromo; 