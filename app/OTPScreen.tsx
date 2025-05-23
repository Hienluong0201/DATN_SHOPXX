import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useAuth } from '../store/useAuth';

export default function OTPScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { phone } = useLocalSearchParams();
  const { login } = useAuth();

  const handleVerifyOTP = async () => {
    if (otp === '') {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      return;
    }

    if (otp.length !== 6) {
      Alert.alert('Lỗi', 'Mã OTP phải có 6 chữ số');
      return;
    }

    setLoading(true);
    try {
      const response = await AxiosInstance().post('/users/login', {
        phone,
        otp,
      });

      if (response.message === 'Đăng nhập thành công') {
        await login(response.user);
        router.replace('/home');
      } else {
        Alert.alert('Lỗi', response.message || 'Xác minh OTP thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Xác minh OTP thất bại. Vui lòng kiểm tra lại mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance().post('/users/send-otp', {
        phone,
      });

      if (response.message === 'Mã OTP đã được gửi đến số điện thoại') {
        Alert.alert('Thành công', 'Mã OTP mới đã được gửi');
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể gửi mã OTP');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác minh OTP</Text>
      <Text style={styles.subtitle}>
        Nhập mã OTP được gửi đến số điện thoại {phone}
      </Text>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Mã OTP"
          value={otp}
          onChangeText={setOtp}
          style={styles.input}
          placeholderTextColor="#999"
          keyboardType="numeric"
          maxLength={6}
        />
      </View>

      <TouchableOpacity
        style={[styles.verifyBtn, loading && styles.disabledBtn]}
        onPress={handleVerifyOTP}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.verifyText}>{loading ? 'Đang xác minh...' : 'Xác minh'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResendOTP} style={styles.resendBtn}>
        <Text style={styles.resendText}>Gửi lại mã OTP</Text>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  verifyBtn: {
    backgroundColor: '#8B4513',
    paddingVertical: 14,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledBtn: {
    backgroundColor: '#A9A9A9',
  },
  verifyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resendBtn: {
    alignItems: 'center',
  },
  resendText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});