import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { router } from 'expo-router';

const ResetPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email || !code || !newPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const response = await AxiosInstance().post('/users/reset-password', {
        email,
        code,
        newPassword,
      });

      if (response.message === 'Đổi mật khẩu thành công') {
        Alert.alert('Thành công', 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.');
        router.push('/login');
      } else {
        Alert.alert('Lỗi', response.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      console.log('Reset Password Error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt Lại Mật Khẩu</Text>

      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Mã xác thực"
        style={styles.input}
        value={code}
        onChangeText={setCode}
      />

      <TextInput
        placeholder="Mật khẩu mới"
        secureTextEntry
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledBtn]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đổi mật khẩu</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ResetPasswordScreen;

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
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#4B7BEC',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#8faadc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
