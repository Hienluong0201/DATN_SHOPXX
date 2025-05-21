import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  phone?: string; // Giữ lại phone như trường tùy chọn
};

type AuthState = {
  user: User | null;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,

  login: async (user: User) => {
    try {
      // Lưu trạng thái đăng nhập và thông tin người dùng vào AsyncStorage
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Error saving user to AsyncStorage:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // Xóa thông tin đăng nhập và người dùng khỏi AsyncStorage
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('user');
      set({ user: null });
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  loadUser: async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser: User = JSON.parse(userData);
        // Chỉ set user nếu khác user hiện tại để tránh setState liên tục
        if (JSON.stringify(get().user) !== JSON.stringify(parsedUser)) {
          set({ user: parsedUser });
        }
      } else {
        // Nếu không có user trong AsyncStorage thì clear luôn
        if (get().user !== null) {
          set({ user: null });
        }
      }
    } catch (error) {
      console.error('Error loading user from AsyncStorage:', error);
    }
  },

  setUser: (user) => set({ user }),
}));