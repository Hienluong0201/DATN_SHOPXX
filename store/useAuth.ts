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
  setUser: (user: User | null) => void;
};

export const useAuth = create<AuthState>((set, get) => ({
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
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
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
