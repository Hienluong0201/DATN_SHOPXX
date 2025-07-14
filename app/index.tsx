import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

// Đường dẫn ảnh logo bạn cần thay đúng với đường dẫn ảnh của bạn
const logoImage = require('../assets/images/logo.png');

export default function SplashScreen() {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;  // khởi đầu scale nhỏ hơn
  const opacityAnim = useRef(new Animated.Value(0)).current;  // khởi đầu mờ

  const colorAnim = useRef(new Animated.Value(0)).current;  // cho text đổi màu

  useEffect(() => {
    // Chuỗi animation cho logo: scale từ 0.8 -> 1.2 -> 1 và opacity từ 0->1
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

    // Animation đổi màu text lặp lại
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

  // Nội suy màu text từ trắng sang vàng rồi trở lại trắng
  const textColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', '#ffd700'], // trắng -> vàng kim
  });

  return (
    <View style={styles.container}>
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
      <Animated.Text style={[styles.text, { color: textColor }]}>
        Chào mừng bạn đến với Shop!
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
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
