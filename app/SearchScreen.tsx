import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useProducts } from '../store/useProducts'; // Điều chỉnh đường dẫn nếu cần
import { useAuth } from '../store/useAuth'; // Điều chỉnh đường dẫn nếu cần
import { router } from 'expo-router';
import AxiosInstance from '../axiosInstance/AxiosInstance'; // Import AxiosInstance

export default function SearchScreen() {
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistId } = useProducts();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = async (query: string, pageNum: number, reset: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      let queryString = `/products?page=${pageNum}&limit=10`;
      if (query) {
        queryString += `&name=${encodeURIComponent(query)}`;
      }
      console.log('API Query:', queryString); // Log URL API được gọi

      const productResponse = await AxiosInstance().get(queryString);
      console.log('API Response:', productResponse); // Log toàn bộ phản hồi API

      const fetchedProducts = await Promise.all(
        (productResponse.products || []).map(async (product: any) => {
          if (!product._id) return null;
          let imageURLs = ['https://via.placeholder.com/150'];
          let rating = 5;
          try {
            const imageResponse = await AxiosInstance().get(`/img?productID=${product._id}`);
            console.log(`Image Response for ${product._id}:`, imageResponse); // Log phản hồi hình ảnh
            imageURLs = imageResponse[0]?.imageURL || imageURLs;
          } catch (imgErr) {
            console.log(`Image Error for ${product._id}:`, imgErr); // Log lỗi hình ảnh
          }
          try {
            const ratingResponse = await AxiosInstance().get(`/review/product/${product._id}/average-rating`);
            console.log(`Rating Response for ${product._id}:`, ratingResponse); // Log phản hồi rating
            rating = ratingResponse.averageRating || 0;
          } catch (rateErr) {
            console.log(`Rating Error for ${product._id}:`, rateErr); // Log lỗi rating
          }

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
      console.log('Valid Products:', validProducts); // Log danh sách sản phẩm sau xử lý
      setProducts(prev => reset ? validProducts : [...prev, ...validProducts]);
      setHasMore(validProducts.length >= 10);
    } catch (err) {
      console.log('Fetch Products Error:', err); // Log lỗi API
      setError('Không thể tải sản phẩm. Vui lòng thử lại.');
      Alert.alert('Lỗi', 'Không thể tải sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    console.log('Search Query:', query); // Log từ khóa tìm kiếm
    setSearchQuery(query);
    setPage(1);
    if (query.length > 0) {
      fetchProducts(query, 1, true);
    } else if (query.length === 0) {
      setProducts([]);
    }
  };

  const loadMoreProducts = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      console.log('Loading More, Page:', nextPage); // Log trang tải thêm
      setPage(nextPage);
      fetchProducts(searchQuery, nextPage);
    }
  };

  const handleToggleWishlist = (product: any) => {
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

  const navigateToProductDetail = (productId: string) =>
    router.push({ pathname: './productDetail', params: { productId } });

  const renderSkeletonItem = () => (
    <View style={styles.productCard}>
      <View style={[styles.productImage, styles.skeletonImage]} />
      <View style={styles.productInfo}>
        <View style={[styles.skeletonText, { width: '80%', height: 14, marginBottom: 5 }]} />
        <View style={[styles.skeletonText, { width: '60%', height: 14 }]} />
      </View>
    </View>
  );

  const renderProduct = ({ item }: any) => (
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
      ) : loading && page === 1 ? (
        <View style={styles.gridContainer}>
          {[...Array(4)].map((_, index) => (
            <View key={`skeleton-${index}`}>{renderSkeletonItem()}</View>
          ))}
        </View>
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
            hasMore && !loading ? (
              <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreProducts}>
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