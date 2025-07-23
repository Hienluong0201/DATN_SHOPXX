import React, { useState,useRef } from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useProducts } from '../store/useProducts';
import { useAuth } from '../store/useAuth';
import { router } from 'expo-router';
import AxiosInstance from '../axiosInstance/AxiosInstance';

// CHỈ IMPORT LinearGradient từ expo-linear-gradient (KHÔNG import react-native-linear-gradient!)
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

export default function SearchScreen() {
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistId } = useProducts();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const debounceTimer = useRef(null);
  const fetchProducts = async (query, pageNum, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      let queryString = `/products?page=${pageNum}&limit=10`;
      if (query) {
        queryString += `&name=${encodeURIComponent(query)}`;
      }
      const productResponse = await AxiosInstance().get(queryString);
      const fetchedProducts = await Promise.all(
        (productResponse.products || []).map(async (product) => {
          if (!product._id) return null;
          let imageURLs = ['https://via.placeholder.com/150'];
          let rating = 5;
          try {
            const imageResponse = await AxiosInstance().get(`/img?productID=${product._id}`);
            imageURLs = imageResponse[0]?.imageURL || imageURLs;
          } catch {}
          try {
            const ratingResponse = await AxiosInstance().get(`/review/product/${product._id}/average-rating`);
            rating = ratingResponse.averageRating || 0;
          } catch {}
          return {
            ProductID: product._id,
            CategoryID: product.categoryID || '',
            Name: product.name,
            Description: product.description || '',
            Price: product.price.toLocaleString('vi-VN'),
            Image: imageURLs[0],
            Rating: rating,
          };
        })
      );
      const validProducts = fetchedProducts.filter(p => p !== null);
      setProducts(prev => reset ? validProducts : [...prev, ...validProducts]);
      setHasMore(validProducts.length >= 10);
    } catch (err) {
      setError('Không thể tải sản phẩm. Vui lòng thử lại.');
      Alert.alert('Lỗi', 'Không thể tải sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.length > 0) {
      debounceTimer.current = setTimeout(() => {
        fetchProducts(query, 1, true);
      }, 1000); // 2 giây
    } else {
      setProducts([]);
    }
  };

  const loadMoreProducts = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(searchQuery, nextPage);
    }
  };

  const handleToggleWishlist = (product) => {
    if (!user?._id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm vào danh sách yêu thích.');
      return;
    }
    if (isInWishlist(product.ProductID)) {
      const wishId = getWishlistId(product.ProductID);
      if (wishId) removeFromWishlist(wishId);
    } else {
      addToWishlist(product, user._id);
    }
  };

  const navigateToProductDetail = (productId) =>
    router.push({ pathname: './productDetail', params: { productId } });

  // Skeleton loading với shimmer
  const renderSkeletonItem = () => (
    <View style={styles.productCard}>
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        style={[styles.productImage, styles.skeletonImage]}
      />
      <View style={styles.productInfo}>
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={[styles.skeletonText, { width: '80%', height: 14, marginBottom: 5 }]}
        />
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={[styles.skeletonText, { width: '60%', height: 14 }]}
        />
      </View>
    </View>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigateToProductDetail(item.ProductID)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.Image }}
          style={styles.productImage}
          defaultSource={{ uri: 'https://via.placeholder.com/150' }}
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleToggleWishlist(item)}
        >
          <Ionicons
            name={isInWishlist(item.ProductID) ? 'heart' : 'heart-outline'}
            size={20}
            color={isInWishlist(item.ProductID) ? '#FF0000' : '#8B4513'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
          {item.Name}
        </Text>
        <Text style={styles.productPrice}>{item.Price}đ</Text>
      </View>
    </TouchableOpacity>
  );

  // Khi đang loading lần đầu (page 1), hiện skeleton
  if (loading && page === 1) {
  // Render skeleton như 2 cột luôn
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
          autoFocus={true}
        />
        <MaterialIcons name="search" size={24} color="#8B4513" style={styles.searchIcon} />
      </View>
      <FlatList
        data={Array.from({ length: 8 })} // ví dụ 8 skeleton
        renderItem={renderSkeletonItem}
        keyExtractor={(_, i) => `skeleton-${i}`}
        numColumns={2}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
          autoFocus={true}
        />
        <MaterialIcons name="search" size={24} color="#8B4513" style={styles.searchIcon} />
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : products.length === 0 && searchQuery ? (
        <Text style={styles.noResultsText}>Không tìm thấy sản phẩm nào.</Text>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.ProductID}
          contentContainerStyle={styles.listContent}
          numColumns={2}
         ListFooterComponent={
            loading && page > 1 ? (
              <FlatList
                data={Array.from({ length: 4 })}
                renderItem={renderSkeletonItem}
                keyExtractor={(_, i) => `skeleton-more-${i}`}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                scrollEnabled={false}
              />
            ) : hasMore ? (
              <TouchableOpacity
                style={[styles.loadMoreButton, loading && { opacity: 0.5 }]}
                onPress={loadMoreProducts}
                disabled={loading}
              >
                <Text style={styles.loadMoreText}>Tải thêm</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: '#333',
  },
  searchIcon: {
    marginLeft: 10,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  productCard: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: '1%',
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
  productPrice: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
  loadMoreButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    marginVertical: 10,
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
});
