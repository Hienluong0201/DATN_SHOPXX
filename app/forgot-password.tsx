import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { router } from 'expo-router';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (email.trim() === '') {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    setLoading(true);
    try {
      const response = await AxiosInstance().post('/users/forgot-password', { email });

      if (response.message === 'Mã xác thực đã được gửi đến email') {
        Alert.alert('Thành công', 'Vui lòng kiểm tra email để nhận mã xác nhận');
        router.push('/reset-password');
      } else {
       Alert.alert('Lỗi', response.message || 'Gửi mã thất bại');
      }
    } catch (error) {
      console.log('Error object:', error);
      Alert.alert('HEHE', 'Có đăng ký mail này đâu mà giử ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên Mật Khẩu</Text>

      <View style={styles.inputWrapper}>
        <MaterialCommunityIcons
          name="email-outline"
          size={20}
          color="#4B7BEC"
          style={styles.icon}
        />
        <TextInput
          placeholder="Nhập email của bạn"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity
        style={[styles.sendBtn, loading && styles.disabledBtn]}
        onPress={handleSendCode}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
        ) : (
          <MaterialCommunityIcons
            name="send"
            size={24}
            color="#fff"
            style={{ marginRight: 8 }}
          />
        )}
        <Text style={styles.sendText}>{loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}</Text>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4B7BEC',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4B7BEC',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  sendBtn: {
    flexDirection: 'row',
    backgroundColor: '#4B7BEC',
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4B7BEC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 7,
  },
  disabledBtn: {
    backgroundColor: '#8faadc',
  },
  sendText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
