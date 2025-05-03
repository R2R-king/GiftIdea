import Color from "color";
import React from "react";
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from "react-native";
import Svg, { RadialGradient, Defs, Rect, Stop } from "react-native-svg";
import { SlideProps } from "./Wave";

const { width, height } = Dimensions.get("screen");
const SIZE = width - 75;
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    padding: 75,
    paddingTop: 150,
    alignItems: "center",
  },
  image: {
    width: SIZE,
    height: SIZE,
    borderRadius: 20,
    resizeMode: "cover",
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    color: "white",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "System",
    fontWeight: "bold",
  },
  description: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    fontFamily: "System",
  },
  buttonContainer: {
    marginTop: 30,
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

const Slide = ({
  slide: { picture, color, title, description, isLast },
  onFinish,
}: SlideProps) => {
  const lighterColor = Color(color).lighten(0.8).toString();
  
  const handlePress = () => {
    if (isLast && onFinish) {
      onFinish();
    }
  };

  return (
    <>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="gradient" cx="50%" cy="35%">
            <Stop offset="0%" stopColor={lighterColor} />
            <Stop offset="100%" stopColor={color} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#gradient)" />
      </Svg>
      <View style={styles.container}>
        <Image source={picture} style={styles.image} />
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        
        {isLast && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handlePress}>
              <Text style={[styles.buttonText, { color }]}>Начать</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

export default Slide; 