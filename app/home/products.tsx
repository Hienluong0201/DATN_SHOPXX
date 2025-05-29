import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, FlatList, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useProducts } from '../../store/useProducts';

// Thành phần ProductCard
const ProductCard = ({ product, onPress }) => (
  <TouchableOpacity style={styles.productCard} onPress={onPress}>
    <Image source={{ uri: product.Image }} style={styles.productImage} />
    <Text style={styles.productName}>{product.Name}</Text>
    <View style={styles.ratingContainer}>
      <MaterialIcons name="star" size={16} color="#FFD700" />
      <Text style={styles.ratingText}>{product.Rating || '4.9'}</Text>
    </View>
    <Text style={styles.productPrice}>{product.Price.toLocaleString()}đ</Text>
  </TouchableOpacity>
);

const Products = () => {
  const { categoryId } = useLocalSearchParams();
  const { categories, products, getProductsByCategory, loading, error } = useProducts();

  // Lọc sản phẩm theo danh mục, mặc định tất cả nếu không có categoryId
  const filteredProducts = categoryId ? getProductsByCategory(categoryId as string) : products;

  const navigateToProductDetail = (productId: string) =>
    router.push({ pathname: './productDetail', params: { productId } });

  // Danh sách danh mục bao gồm "Tất cả"
  const categoryList = [{ CategoryID: 'all', Name: 'Tất cả' }, ...categories];

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
    <View style={styles.container}>
      {/* Header với nút back */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Danh Mục</Text>
      </View>

      {/* Danh mục (category tabs) cố định trên cùng */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categoryList.map((cat) => (
          <TouchableOpacity
            key={cat.CategoryID}
            style={[
              styles.categoryCard,
              cat.CategoryID === (categoryId || 'all') && styles.selectedCategory,
            ]}
            onPress={() =>
              router.push({
                pathname: './products',
                params: { categoryId: cat.CategoryID === 'all' ? undefined : cat.CategoryID },
              })
            }
          >
            <Text style={styles.categoryName}>{cat.Name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Danh sách sản phẩm với padding-top để tránh bị che bởi category tabs */}
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có sản phẩm trong danh mục này</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigateToProductDetail(item.ProductID)}
            />
          )}
          keyExtractor={(item) => item.ProductID}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 50,
    backgroundColor: '#fff',
    zIndex: 1, 
  },
  backButton: {
    padding: 5,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  categoryContainer: {
    position: 'absolute', 
    top: 70, 
    left: 0,
    right: 0,
    height: 40, 
    backgroundColor: '#fff',
    zIndex: 1, 
  },
  categoryContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  categoryCard: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    justifyContent: 'center',
  },
  selectedCategory: {
    backgroundColor: '#d4af37',
  },
  categoryName: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10, 
  },
  emptyText: {
    fontSize: 16,
    color: '#2c2c2c',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#c0392b',
    textAlign: 'center',
    marginTop: 20,
  },
  productList: {
    paddingTop: 60, 
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    elevation: 2,
  },
  productImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  ratingText: {
    fontSize: 12,
    color: '#000',
    marginLeft: 5,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default Products;