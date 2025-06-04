import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../store/useAuth'; // Import useAuth

const ProfileScreen = () => {
  const { user, loadUser } = useAuth(); // Lấy user và loadUser từ useAuth

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await loadUser(); // Tải thông tin user nếu chưa có
      } catch (err) {
        console.error('Lỗi khi tải user:', err.message);
      }
    };
    fetchUser();
  }, []);

  const navigateTo = (path) => {
    router.push(path);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.title}>Hồ sơ</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.profileSection}>
        <Image
          source={{
            uri: user?.avatar || 'https://example.com/default-avatar.jpg', // Sử dụng avatar từ user hoặc mặc định
          }}
          style={styles.avatar}
         
        />
        <Text style={styles.userName}>{user?.name || 'Đang tải...'}</Text>
      </View>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/profileDetail')}>
          <MaterialIcons name="person" size={24} color="#8B5A2B" />
          <Text style={styles.menuText}>Hồ sơ cá nhân</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/payment')}>
          <MaterialIcons name="payment" size={24} color="#8B5A2B" />
          <Text style={styles.menuText}>Phương thức thanh toán</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/orders')}>
          <MaterialIcons name="shopping-bag" size={24} color="#8B5A2B" />
          <Text style={styles.menuText}>Đơn hàng của bạn</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/settings')}>
          <MaterialIcons name="settings" size={24} color="#8B5A2B" />
          <Text style={styles.menuText}>Cài đặt</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/help')}>
          <MaterialIcons name="help" size={24} color="#8B5A2B" />
          <Text style={styles.menuText}>Trợ giúp</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/privacy')}>
          <MaterialIcons name="security" size={24} color="#8B5A2B" />
          <Text style={styles.menuText}>Chính sách bảo mật</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/addressDetail')}>
          <MaterialIcons name="location-on" size={24} color="#8B5A2B" />
          <Text style={styles.menuText}>Địa chỉ</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/contact')}>
          <MaterialIcons name="contact-mail" size={24} color="#8B5A2B" />
          <Text style={styles.menuText}>Liên hệ</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('../login')}>
          <MaterialIcons name="exit-to-app" size={24} color="#8B5A2B" />
          <Text style={styles.menuText}>Đăng xuất</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f2f5', // Đồng bộ màu nền với AddressScreen
    top : 20,
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
    color: '#2c2c2c', // Màu tiêu đề chính
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c2c2c',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c2c2c',
    marginLeft: 15,
    flex: 1,
  },
});

export default ProfileScreen;