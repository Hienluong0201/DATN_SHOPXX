// app/home/checkout.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useProducts } from '../store/useProducts';

const Checkout = () => {
  const { cart, loading, error } = useProducts();

  const handlePlaceOrder = () => {
    // TODO: Gọi API để tạo đơn hàng
    router.push('./orders');
  };

  const total = cart.reduce((sum, item) => {
    const price = parseFloat(item.Price.replace(' VNĐ', '').replace('.', '')) * item.Quantity;
    return sum + price;
  }, 0);

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
      <Text style={styles.title}>Thanh toán</Text>
      {cart.length === 0 ? (
        <Text style={styles.emptyText}>Giỏ hàng trống</Text>
      ) : (
        cart.map((item) => (
          <View key={item.CartID} style={styles.card}>
            <Text style={styles.name}>{item.Name}</Text>
            <Text style={styles.price}>
              {item.Price} x {item.Quantity}
            </Text>
          </View>
        ))
      )}
      {cart.length > 0 && (
        <>
          <View style={styles.summary}>
            <Text style={styles.summaryText}>Tổng cộng: {total.toLocaleString()} VNĐ</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handlePlaceOrder}>
            <Text style={styles.buttonText}>Đặt hàng</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f0f2f5' },
  title: { fontSize: 24, fontWeight: '800', margin: 10, color: '#1a1a1a' },
  card: { backgroundColor: '#fff', padding: 10, marginBottom: 10, borderRadius: 15, elevation: 5 },
  name: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  price: { fontSize: 14, color: '#c0392b', fontWeight: '700' },
  summary: { padding: 10, borderTopWidth: 1, borderTopColor: '#ccc', marginTop: 10 },
  summaryText: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  button: { backgroundColor: '#d4af37', padding: 12, borderRadius: 12, alignItems: 'center', margin: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyText: { fontSize: 16, color: '#2c2c2c', textAlign: 'center', marginTop: 20 },
  errorText: { fontSize: 16, color: '#c0392b', textAlign: 'center', marginTop: 20 },
});

export default Checkout;