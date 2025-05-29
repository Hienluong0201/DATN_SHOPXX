// app/home/orders.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AxiosInstance from '../../axiosInstance/AxiosInstance';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // TODO: Gọi API để lấy danh sách đơn hàng
        // Ví dụ: const response = await AxiosInstance().get('/orders');
        // setOrders(response);
        setOrders([]);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Không thể tải đơn hàng. Vui lòng thử lại sau.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const navigateToOrderDetail = (orderId: string) => {
    router.push({ pathname: './orderDetail', params: { orderId: orderId.toString() } });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#d4af37" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Đơn hàng của bạn</Text>
      {orders.length === 0 ? (
        <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
      ) : (
        orders.map((order) => (
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
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f0f2f5' },
  title: { fontSize: 24, fontWeight: '800', margin: 10, color: '#1a1a1a' },
  orderCard: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 15, elevation: 5 },
  emptyText: { fontSize: 16, color: '#2c2c2c', textAlign: 'center', marginTop: 20 },
  errorText: { fontSize: 16, color: '#c0392b', textAlign: 'center', marginTop: 20 },
});

export default Orders;