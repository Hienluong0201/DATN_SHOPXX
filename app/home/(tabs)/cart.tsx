// app/home/cart.tsx
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useProducts } from '../../../store/useProducts';

const Cart = () => {
  const { cart, loading, error } = useProducts();

  const navigateToCheckout = () => router.push('./checkout');

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
      <Text style={styles.title}>Giỏ hàng</Text>
      {cart.length === 0 ? (
        <Text style={styles.emptyText}>Giỏ hàng trống</Text>
      ) : (
        cart.map((item) => (
          <View key={item.CartID} style={styles.card}>
            <Image source={{ uri: item.Image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.Name}</Text>
              <Text style={styles.price}>
                {item.Price} x {item.Quantity}
              </Text>
            </View>
          </View>
        ))
      )}
      {cart.length > 0 && (
        <TouchableOpacity style={styles.button} onPress={navigateToCheckout}>
          <Text style={styles.buttonText}>Thanh toán</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f0f2f5' },
  title: { fontSize: 24, fontWeight: '800', margin: 10, color: '#1a1a1a' },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, marginBottom: 10, borderRadius: 15, elevation: 5 },
  image: { width: 100, height: 100, resizeMode: 'cover', borderRadius: 10 },
  info: { marginLeft: 10, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  price: { fontSize: 14, color: '#c0392b', fontWeight: '700' },
  button: { backgroundColor: '#d4af37', padding: 12, borderRadius: 12, alignItems: 'center', margin: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyText: { fontSize: 16, color: '#2c2c2c', textAlign: 'center', marginTop: 20 },
  errorText: { fontSize: 16, color: '#c0392b', textAlign: 'center', marginTop: 20 },
});

export default Cart;