import React, { useState } from "react";
import { View, StyleSheet, Dimensions, Alert, Image } from "react-native";
import { router } from "expo-router";

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

const LiquidSwipeGiftPromo = () => {
  const [index, setIndex] = useState(0);
  const prev = slides[index - 1];
  const next = slides[index + 1];

  const handleFinish = () => {
    if (index === slides.length - 1) {
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LiquidSwipeGiftPromo; 