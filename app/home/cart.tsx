import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';

const cart = () => {
  const sampleCart = [{ CartID: 1, UserID: 1, VariantID: 1, Quantity: 2, Name: 'Áo Polo Nam', Price: '499.000 VNĐ', Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg' }];

  const navigateToCheckout = () => router.push('/checkout'); // Giả định trang checkout

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Giỏ hàng</Text>
      {sampleCart.map((item) => (
        <View key={item.CartID} style={styles.card}>
          <Image source={{ uri: item.Image }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.Name}</Text>
            <Text style={styles.price}>{item.Price} x {item.Quantity}</Text>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.button} onPress={navigateToCheckout}>
        <Text style={styles.buttonText}>Thanh toán</Text>
      </TouchableOpacity>
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
});

export default cart;