import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router'; // Sử dụng hook để lấy params

const orderDetail = () => {
  const { orderId } = useLocalSearchParams(); // Lấy orderId từ params
  const sampleOrderDetails = [
    { OrderDetailID: 1, OrderID: 1, VariantID: 1, Quantity: 2, Price: 499000, Name: 'Áo Polo Nam', PaymentMethod: 'CARD' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Chi tiết đơn hàng #{orderId || 'N/A'}</Text>
      {sampleOrderDetails.map((detail) => (
        <View key={detail.OrderDetailID} style={styles.detailCard}>
          <Text>Sản phẩm: {detail.Name}</Text>
          <Text>Số lượng: {detail.Quantity}</Text>
          <Text>Giá: {detail.Price.toLocaleString()} VNĐ</Text>
          <Text>Phương thức thanh toán: {detail.PaymentMethod}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f0f2f5' },
  title: { fontSize: 24, fontWeight: '800', margin: 10, color: '#1a1a1a' },
  detailCard: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 15, elevation: 5 },
});

export default orderDetail;