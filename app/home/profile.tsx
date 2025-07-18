import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../store/useAuth';
import { useNavigation } from '@react-navigation/native';

// Dùng hình minh họa "chưa đăng nhập"
const emptyImg = require('../../assets/images/laughing.png');

const ProfileScreen = () => {
  const { user, loadUser, logout } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await loadUser();
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

  // Hiển thị giao diện khi chưa đăng nhập
  if (!user?._id) {
    return (
      <View style={styles.authContainer}>
        <Image source={emptyImg} style={styles.emptyImage} resizeMode="contain" />
        <Text style={styles.authTitle}>Bạn chưa đăng nhập</Text>
        <Text style={styles.authDesc}>Hãy đăng nhập để quản lý hồ sơ và các tính năng cá nhân!</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.authBtn, styles.loginBtn]}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={24} color="#fff" />
            <Text style={styles.btnText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.authBtn, styles.backBtn]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back-outline" size={24} color="#fff" />
            <Text style={styles.btnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
            uri: user?.img || 'https://example.com/default-avatar.jpg',
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
          <MaterialIcons name="local-offer" size={24} color="#8B5A2B" />
          <Text style={styles.menuText}>Vorcher</Text>
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
        <TouchableOpacity
          style={styles.menuItem}
          onPress={async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'login' }],
              });
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          }}
        >
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
    backgroundColor: '#f0f2f5',
    top: 20,
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
  // Thêm phần style giao diện chưa đăng nhập
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  emptyImage: {
    width: 220,
    height: 220,
    marginBottom: 26,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c2c2c',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  authDesc: {
    fontSize: 15,
    color: '#60606e',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    marginHorizontal: 8,
    elevation: 3,
  },
  loginBtn: {
    backgroundColor: '#d97706',
  },
  backBtn: {
    backgroundColor: '#2d5fee',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.2,
  },
});

export default ProfileScreen;
