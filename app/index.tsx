import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ImageBackground } from 'react-native';

const logoImage = require('../assets/images/logo.png');

// Đổi link này sang link ảnh bạn muốn
const bgImage = { uri: 'https://www.vietnamworks.com/hrinsider/wp-content/uploads/2023/12/mot-chiec-hinh-nen-vua-dang-yeu-vua-huyen-ao-cho-ban-nu.jpg' };

export default function SplashScreen() {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]),
    ).start();

    const timer = setTimeout(() => {
      router.replace('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const textColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', '#ffd700'],
  });

  return (
    <ImageBackground source={bgImage} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.centerContent}>
        <Animated.Image
          source={logoImage}
          style={[
            styles.logo,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,26,0.35)', // overlay mờ cho nổi logo/text, chỉnh lại nếu muốn đậm/nhạt
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  text: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
