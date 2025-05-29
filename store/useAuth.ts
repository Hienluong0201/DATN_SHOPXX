import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Định nghĩa type User với các trường từ API
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

type AuthState = {
  user: User | null;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
};

// Hàm kiểm tra dữ liệu User có hợp lệ không
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

export const useAuth = create<AuthState>((set, get) => ({
  user: null,

  login: async (user: User) => {
    try {
      if (!isValidUser(user)) {
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
        let parsedUser: User;
        try {
          parsedUser = JSON.parse(userData);
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          set({ user: null });
          return;
        }

        if (!isValidUser(parsedUser)) {
          console.error('Invalid user data in AsyncStorage');
          set({ user: null });
          return;
        }

        const currentUser = get().user;
        // So sánh nông để tối ưu hiệu suất
        if (!currentUser || currentUser._id !== parsedUser._id) {
          set({ user: parsedUser });
        }
      } else {
        const currentUser = get().user;
        if (currentUser !== null) {
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