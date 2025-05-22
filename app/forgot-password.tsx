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
        router.push({ pathname: '/reset-password', params: { email } });
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

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#8B4513" />
      </TouchableOpacity>
      <Text style={styles.title}>Quên Mật Khẩu</Text>

      <View style={styles.inputWrapper}>
        <MaterialCommunityIcons
          name="email-outline"
          size={20}
          color="#8B4513"
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
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    backgroundColor: '#8B4513',
    paddingVertical: 14,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 7,
  },
  disabledBtn: {
    backgroundColor: '#A9A9A9',
  },
  sendText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});