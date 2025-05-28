// app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProductProvider } from '../store/useProducts';

export default function RootLayout() {
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loginStatus = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(loginStatus === 'true');
      setCheckingLogin(false);
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
    <ProductProvider>
      <Stack
        initialRouteName={isLoggedIn ? 'home' : 'index'}
        screenOptions={{
          headerShown: false,
        }}
      />
    </ProductProvider>
  );
}