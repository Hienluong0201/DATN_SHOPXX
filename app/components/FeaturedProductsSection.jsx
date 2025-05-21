import React from 'react';
import { Animated,Text, View, StyleSheet } from 'react-native';
import ProductCard from './ProductCard';

const FeaturedProductsSection = ({ featuredProducts, navigateToProductDetail, slideAnim }) => {
  return (
    <Animated.View style={[styles.section, { transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
      <View style={styles.gridContainer}>
        {featuredProducts.map((product) => (
          <ProductCard
            key={product.ProductID}
            product={product}
            onPress={navigateToProductDetail}
            isFeatured
          />
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
    marginHorizontal: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 15,
    color: '#1a1a1a',
    textTransform: 'uppercase',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
});

export default FeaturedProductsSection;