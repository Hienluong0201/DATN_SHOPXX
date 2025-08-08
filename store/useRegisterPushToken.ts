// store/useRegisterPushToken.ts
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Linking, Alert } from 'react-native';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useRegisterPushToken(userID?: string) {
  useEffect(() => {
    let mounted = true;

    (async () => {
      console.log('──────────────── push flow start ────────────────');
      console.log('[push] userID =', userID);
      console.log('[push] device.isDevice =', Device.isDevice);
      if (!userID) { console.log('[push] STOP: no userID'); return; }
      if (!Device.isDevice) { console.log('[push] STOP: not a real device'); return; }

      // 1) Quyền
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        console.log('[push] permission(existing) =', existingStatus);
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
          console.log('[push] permission(request) =', finalStatus);
        }
        if (finalStatus !== 'granted') {
          console.log('[push] STOP: permission denied');
          Alert.alert(
            'Cần quyền thông báo',
            'Hãy bật quyền thông báo để nhận tin nhắn mới.',
            [{ text: 'Mở cài đặt', onPress: () => Linking.openSettings() }, { text: 'Để sau', style: 'cancel' }]
          );
          return;
        }
      } catch (e: any) {
        console.log('[push] get/request permission FAILED:', e?.message || e);
        return;
      }

      // 2) Channel (Android)
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
          });
          console.log('[push] android channel = default (MAX)');
        } catch (e: any) {
          console.log('[push] setNotificationChannelAsync FAILED:', e?.message || e);
        }
      }

      // 3) Lấy token (có projectId) + log lỗi FCM
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId ??
        undefined;
      console.log('[push] projectId =', projectId);

      let token: string | null = null;
      try {
        const resp = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        );
        token = resp.data;
        if (!mounted) return;
        console.log('[push] ExpoPushToken =', token);
      } catch (e: any) {
        console.log('[push] getExpoPushTokenAsync FAILED:', e?.message || e);
        console.log('👉 Nếu thấy "FirebaseApp is not initialized":');
        console.log('   - Đặt google-services.json vào android/app/');
        console.log('   - app.json: android.googleServicesFile = "./android/app/google-services.json"');
        console.log('   - Thêm extra.eas.projectId = <ID trên expo.dev>');
        console.log('   - Build lại bằng EAS (dev/prod) hoặc expo run:android');
        return;
      }
      if (!token) { console.log('[push] STOP: token null'); return; }

      // 4) Gửi token lên server
      try {
        const baseURL = (AxiosInstance() as any)?.defaults?.baseURL;
        console.log('[push] Axios baseURL =', baseURL);
        const res = await AxiosInstance().post('/api/push/register', {
          userID, token, platform: 'expo',
        });
        console.log('[push] /api/push/register =>', res?.status, res?.data ?? '');
      } catch (e: any) {
        console.log('[push] register token FAILED:', e?.response?.data || e?.message || e);
        return;
      }

      // 5) Xác nhận server đã lưu
      try {
        const list = await AxiosInstance().get(`/api/push/list/${userID}`);
        console.log('[push] /api/push/list =>', list?.status, list?.data);
      } catch (e: any) {
        console.log('[push] get list FAILED:', e?.response?.data || e?.message || e);
      }

      console.log('──────────────── push flow end ──────────────────');
    })();

    return () => { mounted = false; };
  }, [userID]);
}
