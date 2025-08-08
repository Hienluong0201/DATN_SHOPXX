import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Rive from 'rive-react-native';
import { router } from 'expo-router';
import { useAuth } from '../store/useAuth';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import CustomModal from './components/CustomModal';
export default function NewpassScreen() {
  const { user } = useAuth();
  const userId = user?._id;

  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  // state để bật/tắt hiển thị mật khẩu
  const [showCurrent, setShowCurrent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  //state để hiển thị modal
    // 👇 state cho Modal
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmVisible, setModalConfirmVisible] = useState(false);
  const [modalOnConfirm, setModalOnConfirm] = useState<(() => void) | undefined>(undefined);

  const showModal = ({
    type,
    title,
    message,
    showConfirmButton = false,
    onConfirm,
  }: {
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
    showConfirmButton?: boolean;
    onConfirm?: () => void;
  }) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalConfirmVisible(showConfirmButton);
    setModalOnConfirm(() => onConfirm);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setModalOnConfirm(undefined);
  };


  const changePassword = async (userId, oldPassword, newPassword) => {
    return AxiosInstance().post(`/users/${userId}/change-password`, {
      oldPassword,
      newPassword,
    });
  };

  const handleChangePassword = async () => {
    if (!current || !password || !confirm) {
      showModal({
        type: 'warning',
        title: 'Thiếu thông tin',
        message: 'Vui lòng nhập đầy đủ 3 trường: mật khẩu cũ, mật khẩu mới và xác nhận.',
      });
      return;
    }
    if (password.length < 6) {
      showModal({
        type: 'warning',
        title: 'Mật khẩu yếu',
        message: 'Mật khẩu mới phải từ 6 ký tự trở lên.',
      });
      return;
    }
    if (password !== confirm) {
      showModal({
        type: 'error',
        title: 'Không khớp',
        message: 'Mật khẩu xác nhận không khớp.',
      });      return;
    }
    if (!userId) {
      showModal({
        type: 'error',
        title: 'Lỗi người dùng',
        message: 'Không xác định được user. Vui lòng đăng nhập lại.',
      });
      return;
    }

    setLoading(true);
    try {
      await changePassword(userId, current, password);
      setLoading(false);
     showModal({
        type: 'success',
        title: 'Thành công',
        message: 'Đổi mật khẩu thành công!',
        showConfirmButton: true,
        onConfirm: () => {
          hideModal();
          router.back();
        },
      });
      setCurrent('');
      setPassword('');
      setConfirm('');
    } catch (err) {
      setLoading(false);
      let message = err?.response?.data?.message || 'Đổi mật khẩu thất bại!';
      showModal({
        type: 'error',
        title: 'Thất bại',
        message,
      });    }
  };

  const keyboardOffset =
    Platform.OS === 'ios'
      ? 70
      : 12;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Main content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <View style={styles.mainContent}>
            <Rive
              url="https://public.rive.app/community/runtime-files/22487-42095-look.riv"
              autoplay
              style={styles.riveImg}
            />
            <View style={styles.form}>
              
              {/* Mật khẩu cũ */}
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu cũ"
                  secureTextEntry={!showCurrent}
                  value={current}
                  onChangeText={setCurrent}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowCurrent(!showCurrent)}
                >
                  <Ionicons
                    name={showCurrent ? 'eye-off' : 'eye'}
                    size={22}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>

              {/* Mật khẩu mới */}
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu mới"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>

              {/* Xác nhận mật khẩu */}
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Xác nhận lại mật khẩu"
                  secureTextEntry={!showConfirm}
                  value={confirm}
                  onChangeText={setConfirm}
                  returnKeyType="done"
                  onSubmitEditing={handleChangePassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirm(!showConfirm)}
                >
                  <Ionicons
                    name={showConfirm ? 'eye-off' : 'eye'}
                    size={22}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.note}>
              Mật khẩu của bạn sẽ được bảo mật tuyệt đối!
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
       <CustomModal
        isVisible={isModalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={hideModal}
        onConfirm={modalOnConfirm}
        showConfirmButton={modalConfirmVisible}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff',    paddingTop: 22, },
  mainContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderBottomWidth: 0.5,
    borderColor: '#EEE',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 19,
    fontWeight: '700',
    color: '#222',
  },
  riveImg: {
    width: 300,
    height: 300,
    marginTop: 6,
  },
  form: {
    width: '94%',
    backgroundColor: '#faf8f3',
    borderRadius: 18,
    padding: 18,
    marginBottom: 10,
    shadowColor: '#f9e5bb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 9,
    elevation: 2,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    paddingRight: 40, // chừa chỗ cho icon
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -11 }],
  },
  button: {
    backgroundColor: '#8B4513',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 2,
    shadowColor: '#F9C846',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  note: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
});
