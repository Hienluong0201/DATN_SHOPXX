import React from 'react';
import { Text, View, TouchableOpacity, Image, StyleSheet } from 'react-native';

const ProductCard = ({ product, onPress, isFeatured = false }) => {
  return (
    <TouchableOpacity
      style={isFeatured ? styles.featuredProductCard : styles.productCard}
      onPress={() => onPress(product.ProductID)}
    >
      <Image source={{ uri: product.Image }} style={isFeatured ? styles.featuredProductImage : styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={isFeatured ? styles.featuredProductName : styles.productName}>{product.Name}</Text>
        <Text style={isFeatured ? styles.featuredProductPrice : styles.productPrice}>{product.Price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  featuredProductCard: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  productCard: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowAmerica: 0.15,
    shadowRadius: 10,
  },
  featuredProductImage: {
    width: 160,
    height: 160,
    resizeMode: 'cover',
    borderRadius: 15,
  },
  productImage: {
    width: 140,
    height: 140,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  productInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  featuredProductName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c2c2c',
    textAlign: 'center',
  },
  featuredProductPrice: {
    fontSize: 16,
    color: '#c0392b',
    fontWeight: '700',
    marginTop: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#c0392b',
    fontWeight: '600',
    marginTop: 5,
  },
});

export default ProductCard;