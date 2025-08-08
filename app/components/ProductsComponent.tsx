import React from 'react';
import {
  Animated,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
interface ProductsComponentProps {
  slideAnim?: Animated.Value; // ✅ optional & đúng kiểu
  filteredProducts: any[];
  loading: boolean;
  page: number;
  navigateToProductDetail: (productId: string) => void;
  handleToggleWishlist: (product: any) => void;
  isInWishlist: (productId: string) => boolean;
  addToCartServer: (product: any) => void;
  loadMoreProducts: () => void;
}

const renderSkeletonItem = (key: string) => (
  <View key={key} style={styles.productCard}>
    <View style={[styles.productImage, styles.skeletonImage]} />
    <View style={styles.productInfo}>
      <View style={[styles.skeletonText, { width: '80%', height: 14, marginBottom: 5 }]} />
      <View style={styles.ratingContainer}>
        <View style={[styles.skeletonText, { width: 40, height: 12 }]} />
      </View>
      <View style={[styles.skeletonText, { width: '60%', height: 14 }]} />
    </View>
    <View style={[styles.addToCartButton, styles.skeletonButton]} />
  </View>
);

export default function ProductsComponent({
  slideAnim,
  filteredProducts,
  loading,
  page,
  navigateToProductDetail,
  handleToggleWishlist,
  isInWishlist,
  addToCartServer,
  loadMoreProducts,
}: ProductsComponentProps) {
  const allProducts = filteredProducts;
const [cartLoading, setCartLoading] = React.useState<string | null>(null);
  const containerStyle = slideAnim
    ? [styles.section, { transform: [{ translateY: slideAnim }] }]
    : styles.section;

  if (loading && !allProducts.length) {
    return (
      <Animated.View style={containerStyle}>
        <View style={styles.categoryHeader}>
          <Text style={styles.sectionTitle}>Tất cả sản phẩm</Text>
        </View>
        <View style={styles.gridContainer}>
          {[...Array(6)].map((_, index) => renderSkeletonItem(`skeleton-${index}`))}
        </View>
      </Animated.View>
    );
  }

  if (!allProducts.length) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tất cả sản phẩm</Text>
        <Text style={styles.noProductsText}>Không có sản phẩm nào.</Text>
      </View>
    );
  }

  return (
    <Animated.View style={containerStyle}>
      <View style={styles.categoryHeader}>
        <Text style={styles.sectionTitle}>Tất cả sản phẩm</Text>
      </View>
      <View style={styles.gridContainer}>
        {allProducts.map((product, index) => {
          const productId = product.ProductID || product._id || `product-${index}`;
          const imageUrl = product.Image || product.image || product.images?.[0] || 'https://via.placeholder.com/150';
          const name = product.Name || product.name || 'Sản phẩm';
          const rating = product.Rating || product.averageRating || 0;
          const price = product.Price || product.price || 0;

          return (
            <TouchableOpacity
              key={productId}
              style={styles.productCard}
              onPress={() => navigateToProductDetail(productId)}
            >
              <View style={styles.imageContainer}>
                {Array.isArray(product.Videos) && product.Videos.length > 0 ? (
                  <Video
                    source={{ uri: product.Videos[0] }}
                    style={styles.productImage}
                    useNativeControls={false}
                    resizeMode="cover"
                    isLooping
                    shouldPlay={true}
                    isMuted={true}
                    posterSource={{ uri: imageUrl }}
                    posterStyle={styles.productImage}
                  />
                ) : (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.productImage}
                  />
                )}
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => handleToggleWishlist(product)}
                >
                  <Ionicons
                    name={isInWishlist(productId) ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isInWishlist(productId) ? '#FF0000' : '#8B4513'}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
                  {name}
                </Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>{rating}</Text>
                </View>
                <Text style={styles.productPrice}>{price.toLocaleString()}đ</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.addToCartButton,
                  cartLoading === productId && { backgroundColor: '#e0e0e0' }
                ]}
                onPress={async () => {
                  setCartLoading(productId);
                  await addToCartServer(product);
                  setCartLoading(null);
                }}
                disabled={cartLoading === productId}
              >
                {cartLoading === productId ? (
                  <Text style={[styles.addToCartText, { color: '#8B4513' }]}>Đang thêm...</Text>
                ) : (
                  <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
                )}
              </TouchableOpacity>

            </TouchableOpacity>
          );
        })}
      </View>
     
        {
    loading && allProducts.length > 0 ? (
      <View style={[styles.loadMoreButton, { backgroundColor: '#e0e0e0' }]}>
        <Text style={[styles.loadMoreText, { color: '#ccc' }]}>Đang tải...</Text>
      </View>
    ) : (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={loadMoreProducts}
      >
        <Text style={styles.loadMoreText}>Tải thêm sản phẩm</Text>
      </TouchableOpacity>
    )
  }
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 5,
  },
  productInfo: {
    marginTop: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  ratingText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '600',
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noProductsText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  loadMoreButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  skeletonImage: {
    backgroundColor: '#e0e0e0',
  },
  skeletonText: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonButton: {
    backgroundColor: '#e0e0e0',
  },
});