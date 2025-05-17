import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';

const productDetail = () => {
  const [selectedVariant, setSelectedVariant] = useState({ Size: 'M', Color: 'Nâu', Stock: 50 });
  const product = { ProductID: 1, Name: 'Áo Polo Nam', Description: 'Áo Polo cao cấp', Price: '499.000 VNĐ', Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg' };
  const variants = [{ VariantID: 1, ProductID: 1, Size: 'M', Color: 'Nâu', Stock: 50 }, { VariantID: 2, Size: 'L', Color: 'Đen', Stock: 30 }];

  const addToCart = () => {
    // Logic thêm vào giỏ hàng
    console.log('Thêm vào giỏ:', selectedVariant);
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
  <Text style={styles.backText}>← Quay lại</Text>
</TouchableOpacity>
      <Image source={{ uri: product.Image }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name}>{product.Name}</Text>
        <Text style={styles.price}>{product.Price}</Text>
        <Text style={styles.description}>{product.Description}</Text>
        <Text style={styles.section}>Chọn biến thể:</Text>
        {variants.map((variant, index) => (
          <TouchableOpacity key={index} style={styles.variantCard} onPress={() => setSelectedVariant(variant)}>
            <Text>Size: {variant.Size}, Màu: {variant.Color}, Tồn: {variant.Stock}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.button} onPress={addToCart}>
          <Text style={styles.buttonText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f0f2f5' },
  image: { width: '100%', height: 300, resizeMode: 'cover', borderRadius: 15 },
  details: { padding: 10 },
  name: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  price: { fontSize: 20, color: '#c0392b', fontWeight: '700', marginVertical: 5 },
  description: { fontSize: 16, color: '#2c2c2c', marginBottom: 15 },
  section: { fontSize: 18, fontWeight: '600', marginTop: 15 },
  variantCard: { backgroundColor: '#fff', padding: 10, marginBottom: 10, borderRadius: 10, elevation: 3 },
  button: { backgroundColor: '#d4af37', padding: 12, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    zIndex: 10,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
  
});

export default productDetail;