import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useProducts } from '../store/useProducts';
import { useAuth } from '../store/useAuth';
import { router } from 'expo-router';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal, ActivityIndicator } from 'react-native';
const SEARCH_HISTORY_KEY = 'search_history_v1';
const OPENROUTER_KEY = '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';

// ========== AI OUTIFT SUGGEST FUNCTION ==========
async function askAIForOutfitSuggestions(productName, productDesc = '') {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENROUTER_KEY,
        'HTTP-Referer': 'your-app-name',
      },
      body: JSON.stringify({
        model: 'openrouter/horizon-beta',
        messages: [
          {
            role: 'system',
            content: 'Bạn là stylist chuyên nghiệp, hãy trả lời thật ngắn gọn, dễ hiểu, phân tách từng món rõ ràng.'
          },
          {
            role: 'user',
            content: `Gợi ý cho tôi 3-5 set đồ có thể phối đẹp với sản phẩm: ${productName}. 
            Mô tả sản phẩm: ${productDesc}. 
            Chỉ trả về dạng list: mỗi set gồm các món cơ bản, có thể lấy trong shop như: quần, áo, giày, túi, phụ kiện (đừng ghi brand/cửa hàng).`
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    if (data?.choices?.[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }
    return null;
  } catch (e) {
    return null;
  }
}
// ================================================

export default function SearchScreen() {
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistId } = useProducts();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchHistory, setSearchHistory] = useState([]);
  const [outfitSuggest, setOutfitSuggest] = useState({});
  const [suggesting, setSuggesting] = useState('');
  const debounceTimer = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSuggestText, setCurrentSuggestText] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  // --- Search History functions ---
  const saveSearchHistory = async (keyword) => {
    if (!keyword?.trim()) return;
    try {
      let history = [];
      const data = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (data) history = JSON.parse(data);
      history = [keyword, ...history.filter(k => k !== keyword)];
      if (history.length > 10) history = history.slice(0, 10);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
      setSearchHistory(history);
    } catch {}
  };
  const getSearchHistory = async () => {
    try {
      const data = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      setSearchHistory(data ? JSON.parse(data) : []);
    } catch {
      setSearchHistory([]);
    }
  };
  const clearSearchHistory = async () => {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    setSearchHistory([]);
  };
  const removeHistoryItem = async (keyword) => {
    let history = searchHistory.filter(k => k !== keyword);
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    setSearchHistory(history);
  };

  useEffect(() => {
    getSearchHistory();
  }, []);

  // --- Search functions ---
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
      const validProducts = fetchedProducts.filter(
        p => p !== null && (typeof p.Status === 'undefined' || p.Status === true)
      );
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
        saveSearchHistory(query);
      }, 1000); // debounce nhanh hơn
    } else {
      setProducts([]);
    }
  };

  const handleHistoryPress = (query) => {
    setSearchQuery(query);
    fetchProducts(query, 1, true);
    saveSearchHistory(query);
  };

  const loadMoreProducts = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(searchQuery, nextPage);
    }
  };

  // --- Wishlist & Detail ---
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

  // --- Skeleton ---
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

  // --- Product Render (with AI outfit suggest) ---
  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigateToProductDetail(item.ProductID)}
      activeOpacity={0.87}
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

       <TouchableOpacity
  style={{
    marginTop: 10,
    backgroundColor: '#ffe7b0',
    borderRadius: 8,
    padding: 8,
    alignSelf: 'center',
    minWidth: 120,
  }}
  onPress={async () => {
    setModalVisible(true);
    setModalLoading(true);
    setCurrentSuggestText(''); // Xoá gợi ý cũ khi mở modal mới
    const aiResult = await askAIForOutfitSuggestions(item.Name, item.Description);
    setCurrentSuggestText(aiResult || 'Không lấy được gợi ý từ AI.');
    setModalLoading(false);
  }}
>
  <Text style={{ color: '#8B4513', fontWeight: 'bold', textAlign: 'center' }}>
    Gợi ý phối đồ
  </Text>
</TouchableOpacity>

      </View>
    </TouchableOpacity>
  );

  // --- UI ---
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

      {/* Hiện lịch sử tìm kiếm khi chưa có query */}
      {searchQuery.length === 0 && searchHistory.length > 0 && (
        <View style={{ marginHorizontal: 15, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: '#888', fontWeight: '600' }}>Lịch sử tìm kiếm</Text>
            <TouchableOpacity onPress={clearSearchHistory}>
              <Text style={{ color: '#FF6F00', fontWeight: '600' }}>Xóa hết</Text>
            </TouchableOpacity>
          </View>
          {searchHistory.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => handleHistoryPress(item)}>
                <Text style={{ color: '#333', fontSize: 15, paddingVertical: 4 }}>{item}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeHistoryItem(item)} style={{ padding: 8 }}>
                <Ionicons name="close-circle" size={18} color="#aaa" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {loading && page === 1 ? (
        <FlatList
          data={Array.from({ length: 8 })}
          renderItem={renderSkeletonItem}
          keyExtractor={(_, i) => `skeleton-${i}`}
          numColumns={2}
          contentContainerStyle={styles.listContent}
        />
      ) : error ? (
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
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.25}
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
            ) : null
          }
        />
      )}
      <Modal
  visible={modalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={{
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <View style={{
      width: '86%',
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 18,
      alignItems: 'center',
      shadowColor: '#222', shadowOpacity: 0.18, shadowRadius: 10, elevation: 4,
    }}>
      <Text style={{
        fontWeight: 'bold',
        fontSize: 17,
        color: '#8B4513',
        marginBottom: 8,
        textAlign: 'center'
      }}>Gợi ý phối đồ</Text>
      {modalLoading ? (
        <ActivityIndicator size={32} color="#d4af37" style={{ marginVertical: 18 }} />
      ) : (
        <Text style={{
          color: '#333',
          fontSize: 15,
          lineHeight: 22,
          textAlign: 'left',
          marginTop: 8,
        }}>
          {currentSuggestText}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => setModalVisible(false)}
        style={{
          marginTop: 20,
          backgroundColor: '#d4af37',
          borderRadius: 12,
          paddingVertical: 8,
          paddingHorizontal: 36,
        }}
      >
        <Text style={{
          color: '#fff', fontWeight: 'bold', fontSize: 15, textAlign: 'center'
        }}>Đóng</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
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
