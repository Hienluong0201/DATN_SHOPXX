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
import { useAuth } from '../../../store/useAuth';

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
      if (user.avatar) {
        setImage(user.avatar);
      }
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

  const handleSave = () => {
    if (!name || !email || !phone) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const updatedUser = {
      ...user,
      name,
      email,
      phone,
      avatar: image,
    };

    setUser(updatedUser);
    Alert.alert('Thành công', 'Thông tin hồ sơ đã được cập nhật.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>👤 Hồ sơ cá nhân</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="camera" size={32} color="#888" />
          </View>
        )}
        <Text style={styles.uploadText}>Tải ảnh lên</Text>
      </TouchableOpacity>

      <View style={styles.inputGroup}>
        <FontAwesome5 name="user" size={18} color="#555" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Tên đầy đủ"
        />
      </View>

      <View style={styles.inputGroup}>
        <MaterialIcons name="email" size={18} color="#555" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Ionicons name="call" size={18} color="#555" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Số điện thoại"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Ionicons name="location" size={18} color="#555" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Địa chỉ"
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>📌 Vai trò: {user?.role || 'N/A'}</Text>
        <Text style={styles.infoText}>
          ✅ Trạng thái: {user?.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
        </Text>
        <Text style={styles.infoText}>
          🕒 Ngày tạo: {new Date(user?.createdAt || '').toLocaleString()}
        </Text>
        <Text style={styles.infoText}>
          🔁 Cập nhật: {new Date(user?.updatedAt || '').toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>💾 Lưu thông tin</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f6f8' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  imagePicker: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadText: { color: '#007bff', fontWeight: '500' },

  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },

  infoBox: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#eee',
    borderWidth: 1,
    marginBottom: 20,
  },
  infoText: { fontSize: 14, marginBottom: 5, color: '#444' },

  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ProfileScreen;