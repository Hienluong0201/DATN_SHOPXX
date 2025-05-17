import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../store/useAuth'; // dùng useAuth hook

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuth(); // lấy hàm login từ hook

  const handleLogin = async () => {
    if (username === '' || password === '') {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
    } else {
      await login({ username }); // lưu thông tin vào store + AsyncStorage
      router.replace('/home');  // chuyển sang trang chủ
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert('Thông báo', 'Đăng nhập bằng Google đang phát triển...');
  };

  const goToRegister = () => {
    router.push('/register');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>X Shop</Text>

      <TextInput
        placeholder="Tài khoản"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>Đăng nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
        <Text style={styles.googleText}>Đăng nhập bằng Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={goToRegister}>
        <Text style={styles.registerText}>
          Chưa có tài khoản? <Text style={{ textDecorationLine: 'underline' }}>Đăng ký</Text>
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
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
  },
  loginBtn: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleBtn: {
    backgroundColor: '#db4437',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  googleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerText: {
    textAlign: 'center',
    color: '#333',
    fontSize: 14,
  },
});
