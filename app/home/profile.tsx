import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // Sử dụng cả MaterialIcons và Ionicons
import { router } from 'expo-router';

const ProfileScreen = () => {
  const navigateTo = (path: string) => {
    router.push(path);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.title}>Hồ sơ</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.profileSection}>
        <Image
          source={{ uri: 'https://example.com/avatar.jpg' }} // Thay bằng URL ảnh thực tế
          style={styles.avatar}
        />
        <Text style={styles.userName}>Võ Xuân Toàn</Text>
      </View>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/profileDetail')}>
          <MaterialIcons name="person" size={24} color="#8B4513" />
          <Text style={styles.menuText}>Hồ sơ cá nhân</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B4513" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/payment')}>
          <MaterialIcons name="payment" size={24} color="#8B4513" />
          <Text style={styles.menuText}>Phương thức thanh toán</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B4513" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/orders')}>
          <MaterialIcons name="shopping-bag" size={24} color="#8B4513" />
          <Text style={styles.menuText}>Đơn hàng của bạn</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B4513" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/settings')}>
          <MaterialIcons name="settings" size={24} color="#8B4513" />
          <Text style={styles.menuText}>Cài đặt</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B4513" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/help')}>
          <MaterialIcons name="help" size={24} color="#8B4513" />
          <Text style={styles.menuText}>Trợ giúp</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B4513" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/privacy')}>
          <MaterialIcons name="security" size={24} color="#8B4513" />
          <Text style={styles.menuText}>Chính sách bảo mật</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B4513" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/contact')}>
          <MaterialIcons name="contact-mail" size={24} color="#8B4513" />
          <Text style={styles.menuText}>Liên hệ</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B4513" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('../login')}>
          <MaterialIcons name="exit-to-app" size={24} color="#8B4513" />
          <Text style={styles.menuText}>Đăng xuất</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B4513" style={styles.chevron} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { padding: 5 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', flex: 1, textAlign: 'center' },
  placeholder: { width: 24 },
  profileSection: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ddd', marginBottom: 10 },
  userName: { fontSize: 18, fontWeight: '600', color: '#2c2c2c' },
  menuContainer: { backgroundColor: '#fff', borderRadius: 15, padding: 15, elevation: 3 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  menuText: { fontSize: 16, color: '#2c2c2c', marginLeft: 15, flex: 1, fontWeight: '600' },
  chevron: { marginLeft: 'auto' }, // Đẩy icon sang phải
});

export default ProfileScreen;