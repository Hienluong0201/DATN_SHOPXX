import AxiosInstance from '../axiosInstance/AxiosInstance';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router'; // Thêm import router
import { useAuth } from '../store/useAuth';

const ProfileScreen = () => {
  const { user, loadUser, setUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('123 Lê Lợi, Q1, TP.HCM');
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      await loadUser();
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setImage(user.avatar || null);
    }
  }, [user]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Quyền bị từ chối', 'Bạn cần cho phép truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
  if (!name || !email || !phone) {
    Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('password', user.password || '');

    if (image && image !== user.avatar) {
      formData.append('img', {
        uri: image,
        name: `avatar_${user._id}.jpg`,
        type: 'image/jpeg',
      });
    }

    const res = await fetch(`https://datn-sever.onrender.com/users/update/${user._id}`, {
      method: 'PUT', // hoặc POST nếu backend bạn hỗ trợ POST cập nhật
      body: formData,
      headers: {
        Accept: 'application/json',
        // ❌ KHÔNG thêm Content-Type thủ công
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Lỗi cập nhật');
    }

    const updatedUser = {
      ...data.user,
      avatar: image || user.avatar || null,
    };

    setUser(updatedUser);
    Alert.alert('✅ Thành công', 'Thông tin hồ sơ đã được cập nhật.');
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật:', err.message);
    Alert.alert('Lỗi', err.message || 'Không thể cập nhật thông tin');
  }
};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.title}>Hồ sơ cá nhân</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.imagePicker}>
        <TouchableOpacity onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="camera" size={32} color="#666" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.uploadText}>Tải ảnh lên</Text>
      </View>

      <View style={styles.inputCard}>
        <View style={styles.inputGroup}>
          <FontAwesome5 name="user" size={18} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Tên đầy đủ"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputGroup}>
          <MaterialIcons name="email" size={18} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="call" size={18} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="location" size={18} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Địa chỉ"
            placeholderTextColor="#666"
          />
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Vai trò: {user?.role || 'N/A'}</Text>
        <Text style={styles.infoText}>
          Trạng thái: {user?.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
        </Text>
        <Text style={styles.infoText}>
          Ngày tạo: {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
        </Text>
        <Text style={styles.infoText}>
          Cập nhật: {user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Lưu thông tin</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop : 30,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c2c2c',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 24,
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 16,
    color: '#8B5A2B',
    fontWeight: '600',
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    marginBottom: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#2c2c2c',
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#8B5A2B',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;