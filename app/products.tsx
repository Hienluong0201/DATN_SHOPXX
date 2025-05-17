import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons'; // icon cho nút quay lại

const Products = () => {
  const sampleProducts = [
    {
      ProductID: 1,
      CategoryID: 1,
      Name: 'Áo Polo Nam',
      Description: 'Áo Polo cao cấp',
      Price: '499.000 VNĐ',
      Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg',
    },
    {
      ProductID: 2,
      CategoryID: 2,
      Name: 'Quần Jeans',
      Description: 'Quần Jeans thời thượng',
      Price: '799.000 VNĐ',
      Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg',
    },
  ];

  const categories = [
    { CategoryID: 1, Name: 'Áo Nam' },
    { CategoryID: 2, Name: 'Quần Nam' },
  ];

  const navigateToProductDetail = (productId) =>
    router.push({ pathname: './productDetail', params: { productId } });

  return (
    <ScrollView style={styles.container}>
      {/* Nút quay lại */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color="#000" />
        <Text style={styles.backText}>Quay lại</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Sản phẩm</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat.CategoryID} style={styles.categoryCard}>
            <Text style={styles.categoryName}>{cat.Name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {sampleProducts.map((product) => (
        <TouchableOpacity
          key={product.ProductID}
          style={styles.productCard}
          onPress={() => navigateToProductDetail(product.ProductID)}
        >
          <Image source={{ uri: product.Image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.Name}</Text>
            <Text style={styles.productPrice}>{product.Price}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f0f2f5',marginTop: 30 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  backText: { marginLeft: 5, fontSize: 16, color: '#000' },
  title: { fontSize: 24, fontWeight: '800', margin: 10, color: '#1a1a1a' },
  categoryContainer: { flexDirection: 'row', paddingVertical: 10 },
  categoryCard: { padding: 10, marginRight: 10, backgroundColor: '#2c2c2c', borderRadius: 10 },
  categoryName: { color: '#d4af37', fontSize: 16 },
  productCard: { backgroundColor: '#fff', padding: 10, marginBottom: 10, borderRadius: 15, elevation: 5 },
  productImage: { width: 140, height: 140, resizeMode: 'cover', borderRadius: 10 },
  productInfo: { alignItems: 'center', marginTop: 10 },
  productName: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  productPrice: { fontSize: 14, color: '#c0392b', fontWeight: '700' },
});

export default Products;
