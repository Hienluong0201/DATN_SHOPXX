// app/index.tsx
import { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bắt đầu animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Sau 3 giây chuyển qua login
    const timeout = setTimeout(() => {
      router.replace('/login');
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.logo, { opacity: fadeAnim }]}>
        X Shop
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // nền đen cho nổi
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
});
