// app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProductProvider } from '../store/useProducts';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useAuth } from '../store/useAuth';
import { useRegisterPushToken } from '../store/useRegisterPushToken';
import * as Notifications from 'expo-notifications';

export default function RootLayout() {
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const user = useAuth((s) => s.user);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loginStatus = await AsyncStorage.getItem('isLoggedIn');
        console.log('[auth] isLoggedIn in storage =', loginStatus);
        setIsLoggedIn(loginStatus === 'true');
        console.log('[auth] calling loadUser() …');
        await useAuth.getState().loadUser();
        console.log('[auth] user after load:', useAuth.getState().user);
      } catch (error) {
        console.error('[auth] Error checking login status:', error);
        setIsLoggedIn(false);
      } finally {
        setCheckingLogin(false);
      }
    };
    checkLoginStatus();
  }, []);

  // Đăng ký token khi đã có user._id
  useEffect(() => {
    console.log('[push] user changed →', user?._id);
  }, [user?._id]);
  useRegisterPushToken(user?._id);

  // Log khi user bấm vào thông báo
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      const data: any = resp.notification.request.content.data;
      console.log('[push] notification tapped, data =', data);
    });
    return () => sub.remove();
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
      <StripeProvider publishableKey="pk_test_51RgKzePvoIcsq5u2eVmhcJ8cgf1m6w5CgGDb6J4TSfRPovJxCP1vPMelS2Bm6fvgglD4QSxVTtdQqLPmmgfmG29G009Vy0WQBL">
        <ProductProvider>
          <Stack
            initialRouteName={isLoggedIn ? 'home' : 'index'}
            screenOptions={{ headerShown: false }}
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
      </StripeProvider>
    </GestureHandlerRootView>
  );
}
