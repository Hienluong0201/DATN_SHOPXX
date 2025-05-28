import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useProducts } from '../../store/useProducts';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const { categoryId } = useLocalSearchParams();
  const { categories, getProductsByCategory, loading, error } = useProducts();

  const products = categoryId ? getProductsByCategory(Number(categoryId)) : [];

  const navigateToProductDetail = (productId: number) =>
    router.push({ pathname: './productDetail', params: { productId: productId.toString() } });

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
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color="#000" />
        <Text style={styles.backText}>Quay lại</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Sản phẩm</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.CategoryID}
            style={styles.categoryCard}
            onPress={() => router.push({ pathname: './products', params: { categoryId: cat.CategoryID.toString() } })}
          >
            <Text style={styles.categoryName}>{cat.Name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {products.length === 0 ? (
        <Text style={styles.emptyText}>Không có sản phẩm trong danh mục này</Text>
      ) : (
        products.map((product) => (
          <ProductCard
            key={product.ProductID}
            product={product}
            onPress={navigateToProductDetail}
          />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f0f2f5', marginTop: 30 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  backText: { marginLeft: 5, fontSize: 16, color: '#000' },
  title: { fontSize: 24, fontWeight: '800', margin: 10, color: '#1a1a1a' },
  categoryContainer: { flexDirection: 'row', paddingVertical: 10 },
  categoryCard: { padding: 10, marginRight: 10, backgroundColor: '#2c2c2c', borderRadius: 10 },
  categoryName: { color: '#d4af37', fontSize: 16 },
  emptyText: { fontSize: 16, color: '#2c2c2c', textAlign: 'center', marginTop: 20 },
  errorText: { fontSize: 16, color: '#c0392b', textAlign: 'center', marginTop: 20 },
});

export default Products;