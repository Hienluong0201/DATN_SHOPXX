import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Thêm icon cho nút Back và radio
import { router } from 'expo-router';

const AddressScreen = () => {
  const goBack = () => {
    router.back();
  };

  const handleApply = () => {
    // TODO: Xử lý áp dụng địa chỉ
    router.push('/checkout'); // Ví dụ điều hướng đến trang thanh toán
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.title}>Địa chỉ</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.addressCard}>
        <View style={styles.addressItem}>
          <Ionicons
            name="radio-button-on"
            size={20}
            color="#8B5A2B"
            style={styles.radioIcon}
          />
          <View style={styles.addressDetails}>
            <Text style={styles.addressLabel}>Nhà</Text>
            <Text style={styles.addressValue}>85/52 Gò Vấp, TP.HCM</Text>
          </View>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </View>
        <View style={styles.addressItem}>
          <Ionicons
            name="radio-button-off"
            size={20}
            color="#666"
            style={styles.radioIcon}
          />
          <View style={styles.addressDetails}>
            <Text style={styles.addressLabel}>Văn phòng</Text>
            <Text style={styles.addressValue}>85/52 Gò Vấp, TP.HCM</Text>
          </View>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </View>
        <View style={styles.addressItem}>
          <Ionicons
            name="radio-button-off"
            size={20}
            color="#666"
            style={styles.radioIcon}
          />
          <View style={styles.addressDetails}>
            <Text style={styles.addressLabel}>Nhà nguội thân</Text>
            <Text style={styles.addressValue}>85/52 Gò Vấp, TP.HCM</Text>
          </View>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </View>
        <View style={styles.addressItem}>
          <Ionicons
            name="radio-button-off"
            size={20}
            color="#666"
            style={styles.radioIcon}
          />
          <View style={styles.addressDetails}>
            <Text style={styles.addressLabel}>Địa chỉ khác</Text>
            <Text style={styles.addressValue}>85/52 Gò Vấp, TP.HCM</Text>
          </View>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addText}>+ Thêm địa chỉ mới</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
        <Text style={styles.applyText}>Áp dụng</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { padding: 5 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', flex: 1, textAlign: 'center' },
  placeholder: { width: 24 },
  addressCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3 },
  addressItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  radioIcon: { marginRight: 10 },
  addressDetails: { flex: 1 },
  addressLabel: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  addressValue: { fontSize: 14, color: '#666', marginTop: 2 },
  addButton: { backgroundColor: '#f0f2f5', padding: 10, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  addText: { fontSize: 14, color: '#8B5A2B', fontWeight: '600' },
  applyButton: { backgroundColor: '#8B5A2B', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  applyText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default AddressScreen;