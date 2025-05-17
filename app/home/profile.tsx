import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../store/useAuth';

const profile = () => {
  const { user, loadUser, setUser } = useAuth();
  const [name, setName] = useState(user?.username || '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    loadUser();
    // Dữ liệu mẫu địa chỉ
    setEmail(user?.email || 'a@example.com');
    setPhone(user?.phone || '0901234567');
    setAddress('123 Le Loi, Q1, TP.HCM');
  }, [user]);

  const handleSave = () => {
    const updatedUser = { ...user, username: name, email, phone };
    setUser(updatedUser);
    Alert.alert('Thành công', 'Thông tin đã được cập nhật!');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Hồ sơ cá nhân</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tên" />
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Số điện thoại" keyboardType="phone-pad" />
      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Địa chỉ" />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Lưu thông tin</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 20, color: '#1a1a1a' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 12, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#d4af37', padding: 12, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default profile;