import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useAuth } from '../../store/useAuth';
import { router } from 'expo-router';

const wishlist = () => {
  const { user } = useAuth();
  const sampleWishlist = [{ WishlistID: 1, UserID: 1, ProductID: 1, Name: 'Áo Polo Nam', Price: '499.000 VNĐ', Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg' }];

  const navigateToProductDetail = (productId) => router.push({ pathname: '/productDetail', params: { productId } });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Danh sách yêu thích</Text>
      {sampleWishlist.map((item) => (
        <TouchableOpacity key={item.WishlistID} style={styles.card} onPress={() => navigateToProductDetail(item.ProductID)}>
          <Image source={{ uri: item.Image }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.Name}</Text>
            <Text style={styles.price}>{item.Price}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f0f2f5' },
  title: { fontSize: 24, fontWeight: '800', margin: 10, color: '#1a1a1a' },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, margin: 10, borderRadius: 15, elevation: 5 },
  image: { width: 100, height: 100, resizeMode: 'cover', borderRadius: 10 },
  info: { marginLeft: 10, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  price: { fontSize: 14, color: '#c0392b', fontWeight: '700' },
});

export default wishlist;