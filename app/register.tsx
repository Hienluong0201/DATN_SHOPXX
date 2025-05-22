import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword || !email) {
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
  const renderInput = (iconName, iconLib, placeholder, value, onChangeText, secure = false, showSecure = false, toggleShow = null, keyboardType = 'default') => {
    const IconComponent = iconLib === 'FontAwesome5' ? FontAwesome5 : MaterialIcons;
    return (
      <View style={styles.inputWrapper}>
        <IconComponent name={iconName} size={20} color="#8B4513" style={styles.icon} />
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          placeholderTextColor="#999"
          secureTextEntry={secure && !showSecure}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {secure && (
          <TouchableOpacity onPress={toggleShow} style={styles.eyeIcon}>
            <MaterialIcons
              name={showSecure ? 'visibility' : 'visibility-off'}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <MaterialIcons name="arrow-back" size={24} color="#8B4513" />
      </TouchableOpacity>
      <Text style={styles.title}>Đăng Ký Tài Khoản</Text>

      {renderInput('user', 'FontAwesome5', 'Tài khoản', username, setUsername)}
      {renderInput('lock', 'FontAwesome5', 'Mật khẩu', password, setPassword, true, showPassword, () => setShowPassword(!showPassword))}
      {renderInput('lock', 'FontAwesome5', 'Nhập lại mật khẩu', confirmPassword, setConfirmPassword, true, showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}
      {renderInput('email', 'MaterialIcons', 'Email', email, setEmail, false, 'email-address')}

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'center',
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
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  eyeIcon: {
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#8B4513',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});