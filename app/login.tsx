import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useAuth } from '../store/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const response = await AxiosInstance().post('/users/login', {
        email,
        password,
      });

      if (response.message === 'Đăng nhập thành công') {
        await login(response.user);
        router.replace('/home');
      } else {
        Alert.alert('Lỗi', response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert('Thông báo', 'Đăng nhập bằng Google đang được phát triển...');
  };

  const goToRegister = () => {
    router.push('/register');
  };

  return (
    <View style={styles.container}>
      {/* Logo với icon */}
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
      </View>

      {/* Input Email */}
      <View style={styles.inputWrapper}>
        <MaterialCommunityIcons name="email-outline" size={20} color="#4B7BEC" style={styles.inputIcon} />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Input Password */}
      <View style={styles.inputWrapper}>
        <MaterialCommunityIcons name="lock-outline" size={20} color="#4B7BEC" style={styles.inputIcon} />
        <TextInput
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#999"
        />
      </View>

      {/* Nút quên mật khẩu */}
      <TouchableOpacity onPress={() => router.push('/forgot-password')} activeOpacity={0.7} style={styles.forgotPasswordBtn}>
        <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      {/* Nút đăng nhập */}
      <TouchableOpacity
        style={[styles.loginBtn, loading && styles.disabledBtn]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <MaterialCommunityIcons name="loading" size={24} color="#fff" style={{ marginRight: 8 }} />
        ) : (
          <MaterialCommunityIcons name="login" size={24} color="#fff" style={{ marginRight: 8 }} />
        )}
        <Text style={styles.loginText}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</Text>
      </TouchableOpacity>

      {/* Nút đăng nhập Google */}
      <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} activeOpacity={0.8}>
        <MaterialCommunityIcons name="google" size={24} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.googleText}>Đăng nhập bằng Google</Text>
      </TouchableOpacity>

      {/* Chuyển trang đăng ký */}
      <TouchableOpacity onPress={goToRegister} activeOpacity={0.7}>
        <Text style={styles.registerText}>
          Chưa có tài khoản? <Text style={{ textDecorationLine: 'underline', color: '#4B7BEC' }}>Đăng ký</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f7f9fc',
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 40,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: '#4B7BEC',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#4B7BEC',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loginBtn: {
    flexDirection: 'row',
    backgroundColor: '#4B7BEC',
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4B7BEC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 7,
  },
  disabledBtn: {
    backgroundColor: '#8faadc',
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  googleBtn: {
    flexDirection: 'row',
    backgroundColor: '#db4437',
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#db4437',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  googleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
});
