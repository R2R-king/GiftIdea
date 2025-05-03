import Color from "color";
import React from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import Svg, { RadialGradient, LinearGradient, Defs, Rect, Stop } from "react-native-svg";
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
    height: SIZE * 0.7,
    borderRadius: 20,
    resizeMode: "cover",
    marginBottom: 30,
  },
  title: {
    fontSize: 42,
    color: "white",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "System",
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    fontFamily: "System",
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
});

const Slide = ({
  slide: { picture, color, title, description },
}: SlideProps) => {
  const lighterColor = Color(color).lighten(0.8).toString();
  const darkerColor = Color(color).darken(0.2).toString();

  return (
    <>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="radialGradient" cx="50%" cy="35%">
            <Stop offset="0%" stopColor={lighterColor} />
            <Stop offset="100%" stopColor={color} />
          </RadialGradient>
          <LinearGradient id="linearGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="transparent" />
            <Stop offset="100%" stopColor={darkerColor} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#radialGradient)" />
        <Rect x={0} y={height/2} width={width} height={height/2} fill="url(#linearGradient)" opacity={0.3} />
      </Svg>
      <View style={styles.container}>
        <Image source={picture} style={styles.image} />
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>
    </>
  );
};

export default Slide; 