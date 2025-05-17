import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  username: string;
  email?: string;
  phone?: string;
};

type AuthState = {
  user: User | null;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;  // Thêm dòng này
};

export const useAuth = create<AuthState>((set) => ({
  user: null,

  login: async (user) => {
    await AsyncStorage.setItem('isLoggedIn', 'true');
    await AsyncStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  logout: async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('user');
    set({ user: null });
  },

  loadUser: async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      set({ user: JSON.parse(userData) });
    }
  },

  setUser: (user) => set({ user }),  // Thêm hàm setUser để set user trực tiếp
}));
