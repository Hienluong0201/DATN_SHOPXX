import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Thêm icon cho nút Back
import { router } from 'expo-router';

const AddressScreen = () => {
  const goBack = () => {
    router.back();
  };

  const handleContinue = () => {
    // TODO: Điều hướng đến trang thanh toán
    router.push('/checkout');
  };
 const handleDiachi = () => {
    // TODO: Điều hướng đến trang thanh toán
    router.push('/addressDetail');
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
        <Text style={styles.addressLabel}>Địa chỉ hiện tại</Text>
        <Text style={styles.addressValue}>Bình Thạnh, TP.HCM</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addText} onPress={handleDiachi}>Thêm địa chỉ mới</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.orderSection}>
        <Text style={styles.sectionTitle}>Đơn hàng của bạn</Text>
        <View style={styles.orderItem}>
          <Image
            source={{ uri: 'https://example.com/black_polo.jpg' }}
            style={styles.itemImage}
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>Black Polo</Text>
            <Text style={styles.itemSize}>Size XL</Text>
            <Text style={styles.itemPrice}>350.000đ</Text>
          </View>
        </View>
        <View style={styles.orderItem}>
          <Image
            source={{ uri: 'https://example.com/black_jacket.jpg' }}
            style={styles.itemImage}
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>Black Jacket</Text>
            <Text style={styles.itemSize}>Size XL</Text>
            <Text style={styles.itemPrice}>850.000đ</Text>
          </View>
        </View>
        <View style={styles.orderItem}>
          <Image
            source={{ uri: 'https://example.com/white_shirt.jpg' }}
            style={styles.itemImage}
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>White Shirt</Text>
            <Text style={styles.itemSize}>Size XL</Text>
            <Text style={styles.itemPrice}>350.000đ</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Tiếp tục thanh toán</Text>
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
  addressLabel: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  addressValue: { fontSize: 16, color: '#666', marginVertical: 5 },
  addButton: { backgroundColor: '#f0f2f5', padding: 10, borderRadius: 10, alignItems: 'center' },
  addText: { fontSize: 14, color: '#8B5A2B', fontWeight: '600' },
  orderSection: { marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  orderItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 3, alignItems: 'center' },
  itemImage: { width: 60, height: 60, resizeMode: 'cover', borderRadius: 10 },
  itemDetails: { flex: 1, marginLeft: 15 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  itemSize: { fontSize: 14, color: '#666', marginTop: 5 },
  itemPrice: { fontSize: 14, color: '#c0392b', fontWeight: '700', marginTop: 5 },
  continueButton: { backgroundColor: '#8B5A2B', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  continueText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default AddressScreen;