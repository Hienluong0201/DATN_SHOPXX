import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Định nghĩa User chuẩn từ API của bạn
type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  phone?: string;
};

// User đơn giản từ Facebook
type FBUser = {
  id: string;
  name: string;
  email?: string;
};

type AuthUser = User | FBUser;

type AuthState = {
  user: AuthUser | null;
  login: (user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
};

// Kiểm tra User chuẩn từ API
const isValidUser = (data: any): data is User => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data._id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.email === 'string' &&
    typeof data.role === 'string' &&
    typeof data.isActive === 'boolean' &&
    typeof data.createdAt === 'string' &&
    typeof data.updatedAt === 'string' &&
    typeof data.__v === 'number'
  );
};

// Kiểm tra user từ Facebook
const isValidFBUser = (data: any): data is FBUser => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.name === 'string'
  );
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,

  login: async (user: AuthUser) => {
    try {
      if (!isValidUser(user) && !isValidFBUser(user)) {
        throw new Error('Invalid user data');
      }

      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Error saving user to AsyncStorage:', error);
      Alert.alert('Lỗi', 'Không thể đăng nhập. Vui lòng thử lại.');
      throw error;
    }
  },

  logout: async () => {
    try {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (isLoggedIn === 'true') {
        await AsyncStorage.removeItem('isLoggedIn');
        await AsyncStorage.removeItem('user');
        set({ user: null });
      }
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
      throw error;
    }
  },

  loadUser: async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        let parsedUser: AuthUser;
        try {
          parsedUser = JSON.parse(userData);
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          set({ user: null });
          return;
        }

        if (!isValidUser(parsedUser) && !isValidFBUser(parsedUser)) {
          console.warn('Invalid user data in AsyncStorage');
          set({ user: null });
          return;
        }

        const currentUser = get().user;
        const isSameUser = currentUser && ('_id' in currentUser)
          ? currentUser._id === (parsedUser as any)._id
          : currentUser?.id === (parsedUser as any).id;

        if (!isSameUser) {
          set({ user: parsedUser });
        }
      } else {
        if (get().user !== null) {
          set({ user: null });
        }
      }
    } catch (error) {
      console.error('Error loading user from AsyncStorage:', error);
      set({ user: null });
    }
  },

  setUser: (user) => set({ user }),
}));
