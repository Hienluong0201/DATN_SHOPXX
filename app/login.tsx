import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useAuth } from '../store/useAuth';

export default function LoginScreen() {
  const [isEmailLogin, setIsEmailLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const handleEmailLogin = async () => {
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

  const handlePhoneSubmit = async () => {
    if (phone === '') {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const response = await AxiosInstance().post('/users/send-otp', {
        phone,
      });

      if (response.message === 'Mã OTP đã được gửi đến số điện thoại') {
        router.push({ pathname: '/OTPScreen', params: { phone } });
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể gửi mã OTP');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    Alert.alert('Thông báo', `Đăng nhập bằng ${platform} đang được phát triển...`);
  };

  const goToRegister = () => {
    router.push('/register');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity onPress={() => setIsEmailLogin(true)}>
          <Text style={[styles.toggleText, isEmailLogin && styles.toggleTextActive]}>Email</Text>
        </TouchableOpacity>
        <Text style={styles.toggleSeparator}> / </Text>
        <TouchableOpacity onPress={() => setIsEmailLogin(false)}>
          <Text style={[styles.toggleText, !isEmailLogin && styles.toggleTextActive]}>Số điện thoại</Text>
        </TouchableOpacity>
      </View>

      {isEmailLogin ? (
        <>
          <View style={styles.inputWrapper}>
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
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.inputIcon}>
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotPasswordBtn}>
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.disabledBtn]}
            onPress={handleEmailLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginText}>{loading ? 'Đang đăng nhập...' : 'Sign In'}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.disabledBtn]}
            onPress={handlePhoneSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginText}>{loading ? 'Đang xử lý...' : 'Tiếp tục'}</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.dividerText}>Hoặc đăng nhập bằng</Text>

      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('Apple')}>
          <MaterialCommunityIcons name="apple" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('Google')}>
          <MaterialCommunityIcons name="google" size={24} color="#DB4437" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('Facebook')}>
          <MaterialCommunityIcons name="facebook" size={24} color="#3B5998" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={goToRegister} style={styles.registerBtn}>
        <Text style={styles.registerText}>
          Bạn chưa có tài khoản? <Text style={styles.registerLink}>Sign Up</Text>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
  },
  toggleTextActive: {
    color: '#8B4513',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  toggleSeparator: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 5,
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
  inputIcon: {
    marginLeft: 10,
  },
  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#666',
    fontSize: 14,
  },
  loginBtn: {
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
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  dividerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginVertical: 20,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  socialBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  registerBtn: {
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#000',
    textDecorationLine: 'underline',
  },
});