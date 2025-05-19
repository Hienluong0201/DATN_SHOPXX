import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

const Header = ({ user, onLogout, style }) => {
  return (
    <View style={[styles.header, style]}>
      <Text style={styles.greeting}>Xin chào, {user?.username ?? 'bạn'}!</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  greeting: {
    fontSize: 28,
    color: '#d4af37',
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#c0392b',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Header;