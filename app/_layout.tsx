import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProductProvider } from '../store/useProducts';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Thêm import này

export default function RootLayout() {
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loginStatus = await AsyncStorage.getItem('isLoggedIn');
        setIsLoggedIn(loginStatus === 'true');
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
      } finally {
        setCheckingLogin(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (checkingLogin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProductProvider>
        <Stack
          initialRouteName={isLoggedIn ? 'home' : 'index'}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="home" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="reset-password" />
          <Stack.Screen name="OTPScreen" />
        </Stack>
      </ProductProvider>
    </GestureHandlerRootView>
  );
}