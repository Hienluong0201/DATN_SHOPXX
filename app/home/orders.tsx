import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';

const orders = () => {
  const sampleOrders = [
    { OrderID: 1, UserID: 1, ShippingAddress: '123 Le Loi, Q1', OrderStatus: 'Pending', OrderDate: '2025-05-18', Total: '998.000 VNĐ' },
  ];

  const navigateToOrderDetail = (orderId) => {
    router.push({ pathname: './orderDetail', params: { orderId: orderId.toString() } }); // Đảm bảo orderId là string
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Đơn hàng của bạn</Text>
      {sampleOrders.map((order) => (
        <TouchableOpacity
          key={order.OrderID}
          style={styles.orderCard}
          onPress={() => navigateToOrderDetail(order.OrderID)}
        >
          <Text>Đơn hàng #{order.OrderID}</Text>
          <Text>Địa chỉ: {order.ShippingAddress}</Text>
          <Text>Trạng thái: {order.OrderStatus}</Text>
          <Text>Ngày: {order.OrderDate}</Text>
          <Text>Tổng: {order.Total}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f0f2f5' },
  title: { fontSize: 24, fontWeight: '800', margin: 10, color: '#1a1a1a' },
  orderCard: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 15, elevation: 5 },
});

export default orders;