import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { create } from 'zustand';

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

// User từ Firebase (Google, v.v)
type FirebaseUser = {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
};

type AuthUser = User | FBUser | FirebaseUser;

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

// Kiểm tra user từ Firebase
const isValidFirebaseUser = (data: any): data is FirebaseUser => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.uid === 'string' &&
    typeof data.email === 'string'
  );
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,

  login: async (user: AuthUser) => {
    try {
      if (!isValidUser(user) && !isValidFBUser(user) && !isValidFirebaseUser(user)) {
        throw new Error('Invalid user data');
      }
       console.log("🧠 Đang lưu user:", user); // log ra để chắc chắn
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
    console.log("🧩 Dữ liệu user lấy từ AsyncStorage:", userData);

    if (userData) {
      let parsedUser: AuthUser;
      try {
        parsedUser = JSON.parse(userData);
        console.log("✅ Parsed user:", parsedUser);
      } catch (parseError) {
        console.error('❌ Lỗi parse user:', parseError);
        set({ user: null });
        return;
      }

      if (
        !isValidUser(parsedUser) &&
        !isValidFBUser(parsedUser) &&
        !isValidFirebaseUser(parsedUser)
      ) {
        console.warn('⚠️ Dữ liệu user không hợp lệ');
        set({ user: null });
        return;
      }

      // ✅ Gán luôn user vào store
      set({ user: parsedUser });
    } else {
      console.warn('⚠️ Không tìm thấy dữ liệu user');
      set({ user: null });
    }
  } catch (error) {
    console.error('❌ Lỗi load user:', error);
    set({ user: null });
  }
},


  setUser: (user) => set({ user }),
}));
