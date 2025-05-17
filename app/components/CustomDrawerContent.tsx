import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../store/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function CustomDrawerContent(props) {
  const { setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('user');
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Kiểm tra nếu props.state tồn tại
  const hasRoutes = props.state && props.state.routes && props.state.routes.length > 0;

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContainer}>
      {/* Header của Drawer */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg' }}
          style={styles.logo}
        />
        <Text style={styles.title}>X Shop</Text>
      </View>

      {/* Danh sách các mục từ Drawer.Screen */}
      {hasRoutes ? (
        <DrawerItemList {...props} />
      ) : (
        <Text style={styles.errorText}>Không có mục điều hướng</Text>
      )}

      {/* Footer của Drawer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem}>
          <MaterialIcons name="settings" size={24} color="#d4af37" />
          <Text style={styles.footerText}>Cài đặt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#d4af37" />
          <Text style={styles.footerText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#d4af37',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    padding: 10,
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#d4af37',
    padding: 20,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  footerText: {
    fontSize: 16,
    color: '#d4af37',
    marginLeft: 10,
  },
});