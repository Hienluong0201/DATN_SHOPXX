// app/home/wishlist.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image,ActivityIndicator } from 'react-native';
import { useAuth } from '../../store/useAuth';
import { router } from 'expo-router';
import { useProducts } from '../../store/useProducts';

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlist, loading, error } = useProducts();

  const navigateToProductDetail = (productId: string) =>
    router.push({ pathname: './productDetail', params: { productId } });

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
      <Text style={styles.title}>Danh sách yêu thích</Text>
      {wishlist.length === 0 ? (
        <Text style={styles.emptyText}>Danh sách yêu thích trống</Text>
      ) : (
        wishlist.map((item) => (
          <TouchableOpacity
            key={item.WishlistID}
            style={styles.card}
            onPress={() => navigateToProductDetail(item.ProductID)}
          >
            <Image source={{ uri: item.Image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.Name}</Text>
              <Text style={styles.price}>{item.Price}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
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
  emptyText: { fontSize: 16, color: '#2c2c2c', textAlign: 'center', marginTop: 20 },
  errorText: { fontSize: 16, color: '#c0392b', textAlign: 'center', marginTop: 20 },
});

export default Wishlist;