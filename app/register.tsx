import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons'; 
import AxiosInstance from '../axiosInstance/AxiosInstance';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleRegister = async () => {
  if (!username || !password || !confirmPassword || !email ) {
    Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
    return;
  }

  if (password !== confirmPassword) {
    Alert.alert('Lỗi', 'Mật khẩu không khớp');
    return;
  }

  const payload = {
    name: username,
    email,
    password,
  };

  console.log('Dữ liệu gửi đi:', payload); // Log dữ liệu gửi đi

 try {
  const res = await AxiosInstance().post('/users/register', payload);
  console.log('Dữ liệu nhận về:', res); // res chính là dữ liệu trả về

  if (res && res._id) {
    Alert.alert('Thành công', `${res.name} đã đăng ký thành công!`);
    router.replace('/login');
  } else {
    Alert.alert('Lỗi', 'Đăng ký thất bại, vui lòng thử lại');
  }
} catch (error: any) {
  const message =
    error.response?.data?.message ||
    error.message ||
    'Có lỗi xảy ra, vui lòng thử lại sau';
  Alert.alert('Lỗi', message);
}

};


  // Hàm render input có icon
  const renderInput = (iconName, iconLib, placeholder, value, onChangeText, secure = false, keyboardType = 'default') => {
    const IconComponent = iconLib === 'FontAwesome5' ? FontAwesome5 : MaterialIcons;
    return (
      <View style={styles.inputWrapper}>
        <IconComponent name={iconName} size={20} color="#4B7BEC" style={styles.icon} />
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          placeholderTextColor="#999"
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Ký Tài Khoản</Text>

      {renderInput('user', 'FontAwesome5', 'Tài khoản', username, setUsername)}
      {renderInput('lock', 'FontAwesome5', 'Mật khẩu', password, setPassword, true)}
      {renderInput('lock', 'FontAwesome5', 'Nhập lại mật khẩu', confirmPassword, setConfirmPassword, true)}
      {renderInput('email', 'MaterialIcons', 'Email', email, setEmail, false, 'email-address')}

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4B7BEC',
    marginBottom: 36,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#4B7BEC',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
