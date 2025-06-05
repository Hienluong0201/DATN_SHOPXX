import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState, useMemo,useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useAuth } from '../../store/useAuth';
import { useProducts } from '../../store/useProducts';
import AdvancedFilterModal from '../components/AdvancedFilterModal';
import { useFocusEffect } from 'expo-router';
export default function HomeScreen() {

  const { user, loadUser, setUser } = useAuth();
  const { categories, products, fetchProducts, loading, error } = useProducts();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { fetchCategories, fetchWishlist } = useProducts();
  const [page, setPage] = useState(1); 
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist, getWishlistId } = useProducts(); 

  useFocusEffect(
    useCallback(() => {
      fetchCategories(),
    fetchProducts({ categoryId: 'all', page: 1, limit: 10 }),
    loadFavorites(),
    user?._id ? fetchWishlist(user._id) : Promise.resolve()
    }, [user])
  );
  const onRefresh = async () => {
  setRefreshing(true);
  await Promise.all([
    fetchCategories(),
    fetchProducts({ categoryId: 'all', page: 1, limit: 10 }),
    loadFavorites(),
    user?._id ? fetchWishlist(user._id) : Promise.resolve(),
  ]);
  setSelectedCategory('');
  setSelectedRating(0);
  setPriceRange([0, 1000000]);
  setPage(1);
  setRefreshing(false);
};
  useEffect(() => {
    loadUser();
    loadFavorites();
    fetchProducts({ categoryId: 'all', page: 1, limit: 10 });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1000,
      delay: 400,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách yêu thích:', err);
    }
  };
  const toggleFavorite = async (productId: string) => {
    if (!user?._id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm vào danh sách yêu thích.');
      return;
    }

    const isFavorited = favorites.includes(productId);
    try {
      const response = await fetch('https://datn-sever.onrender.com/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: user._id,
          productID: productId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedFavorites = isFavorited
        ? favorites.filter((id) => id !== productId)
        : [...favorites, productId];
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
      Alert.alert('Thành công', isFavorited ? 'Đã xóa khỏi danh sách yêu thích.' : 'Đã thêm vào danh sách yêu thích.');
    } catch (error) {
      console.error('Lỗi khi thêm/xóa yêu thích:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích.');
    }
  };

  const addToCart = async (product: any) => {
    try {
      const cart = await AsyncStorage.getItem('cart');
      let cartItems = cart ? JSON.parse(cart) : [];
      const existingItem = cartItems.find((item: any) => item.ProductID === product.ProductID);

      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
      } else {
        cartItems.push({ ...product, quantity: 1 });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
      Alert.alert('Thành công', `${product.Name} đã được thêm vào giỏ hàng!`);
    } catch (err) {
      console.error('Lỗi khi thêm vào giỏ hàng:', err);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng.');
    }
  };

const handleToggleWishlist = (product) => {
  if (!user?._id) {
    Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm vào danh sách yêu thích.');
    return;
  }
  if (isInWishlist(product.ProductID)) {
    // Nếu đã có, bấm sẽ xoá
    const wishId = getWishlistId(product.ProductID);
    if (wishId) removeFromWishlist(wishId);
  } else {
    // Nếu chưa có, bấm sẽ thêm
    addToWishlist(product, user._id);
  }
};


  const navigateToCategory = async (categoryId: string) => {
    try {
      await fetchProducts({ categoryId: categoryId || 'all', page: 1, limit: 10 });
      setPage(1);
      router.push({ pathname: './products', params: { categoryId } });
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err);
      Alert.alert('Lỗi', 'Không thể tải sản phẩm.');
    }
  };

  const navigateToProductDetail = (productId: string) =>
    router.push({ pathname: './productDetail', params: { productId } });

  const applyFilters = () => {
    setFilterModalVisible(false);
    fetchProducts({ categoryId: selectedCategory || 'all', page: 1, limit: 10 });
    setPage(1);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const price = product.NumericPrice || parseFloat(product.Price.replace(/[^0-9.-]+/g, ''));
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      const matchesRating = product.Rating >= selectedRating;
      const matchesCategory = selectedCategory ? product.CategoryID === selectedCategory : true;
      return matchesPrice && matchesRating && matchesCategory;
    });
  }, [products, priceRange, selectedRating, selectedCategory]);

  const loadMoreProducts = async () => {
    const nextPage = page + 1;
    try {
      await fetchProducts({ categoryId: selectedCategory || 'all', page: nextPage, limit: 10 });
      setPage(nextPage);
    } catch (err) {
      console.error('Lỗi khi tải thêm sản phẩm:', err);
      Alert.alert('Lỗi', 'Không thể tải thêm sản phẩm.');
    }
  };

  const renderSkeletonItem = () => (
    <View style={styles.productCard}>
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

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchProducts({ categoryId: selectedCategory || 'all', page: 1, limit: 10 })}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const data = [
    { type: 'search', id: 'search' },
    { type: 'banner', id: 'banner' },
    { type: 'categories', id: 'categories' },
    { type: 'quickAccess', id: 'quickAccess' },
    { type: 'products', id: 'all_products' },
  ];

  const renderItem = ({ item }: any) => {
    switch (item.type) {
      case 'search':
        return (
          <View style={styles.searchContainer}>
            <TextInput style={styles.searchInput} placeholder="Tìm kiếm" placeholderTextColor="#999" />
            <MaterialIcons name="search" size={24} color="#8B4513" style={styles.searchIcon} />
            <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
              <MaterialIcons name="filter-list" size={24} color="#8B4513" style={styles.filterIcon} />
            </TouchableOpacity>
          </View>
        );
      case 'banner':
  return (
    <Animated.View style={[styles.bannerCarouselContainer, { opacity: fadeAnim }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {/* Banner 1 */}
        <View style={styles.bannerItem}>
          <Image
            source={{ uri: 'https://theme.hstatic.net/1000090364/1001154354/14/slider_1.jpg?v=739' }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Big Sale</Text>
            <Text style={styles.bannerSubtitle}>Giảm đến 50%</Text>
            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => navigateToCategory(categories[0]?.CategoryID || '')}
            >
              <Text style={styles.bannerButtonText}>SHOP NOW</Text>
          </TouchableOpacity>
          </View>
        </View>
        {/* Banner 2 */}
        <View style={styles.bannerItem}>
          <Image
            source={{ uri: 'https://theme.hstatic.net/1000090364/1001154354/14/slider_1.jpg?v=739' }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Hàng Mới Về</Text>
            <Text style={styles.bannerSubtitle}>Nhiều mẫu đẹp</Text>
            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => navigateToCategory(categories[0]?.CategoryID || '')}
            >
            <Text style={styles.bannerButtonText}>SHOP NOW</Text>
          </TouchableOpacity>
          </View>
        </View>
        {/* Banner 3 */}
        <View style={styles.bannerItem}>
          <Image
            source={{ uri: 'https://theme.hstatic.net/1000090364/1001154354/14/slider_1.jpg?v=739' }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Voucher Tháng 6</Text>
            <Text style={styles.bannerSubtitle}>Săn deal cực sốc</Text>
            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => navigateToCategory(categories[0]?.CategoryID || '')}
            >
              <Text style={styles.bannerButtonText}>SHOP NOW</Text>
            </TouchableOpacity>
          </View>
        </View>
        
      </ScrollView>
    </Animated.View>
  );
      case 'categories':
        return (
          <Animated.View style={[styles.section, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.categoryHeader}>
              <Text style={styles.sectionTitle}>Danh Mục</Text>
              <TouchableOpacity onPress={() =>router.push({ pathname: './categoryDetail' })}>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.CategoryID}
                  style={styles.categoryCard}
                  onPress={() => navigateToCategory(category.CategoryID)}
                >
                  <View style={styles.categoryIcon}>
                    <Ionicons name={category.Icon} size={30} color="#8B4513" />
                  </View>
                  <Text style={styles.categoryName}>{category.Name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        );
      case 'quickAccess':
        return (
          <View style={styles.quickAccessContainer}>
            <TouchableOpacity style={styles.quickAccessItem} onPress={() => router.push('../home/cart')}>
              <Ionicons name="cart" size={28} color="#FF8500" />
              <Text style={styles.quickAccessLabel}>Giỏ hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessItem} onPress={() => router.push('/favorites')}>
              <Ionicons name="heart" size={28} color="#FF5161" />
              <Text style={styles.quickAccessLabel}>Yêu thích</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessItem} onPress={() => router.push('/orders')}>
              <Ionicons name="receipt" size={28} color="#4287f5" />
              <Text style={styles.quickAccessLabel}>Đơn mua</Text>
            </TouchableOpacity>
          </View>
        );
      case 'products':
        const allProducts = filteredProducts;
        if (loading && !allProducts.length) {
          return (
            <Animated.View style={[styles.section, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.categoryHeader}>
                <Text style={styles.sectionTitle}>Tất cả sản phẩm</Text>
              </View>
              <View style={styles.gridContainer}>
                {[...Array(6)].map((_, index) => (
                  <View key={`skeleton-${index}`}>{renderSkeletonItem()}</View>
                ))}
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
          <Animated.View style={[styles.section, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.categoryHeader}>
              <Text style={styles.sectionTitle}>Tất cả sản phẩm</Text>
            </View>
            <View style={styles.gridContainer}>
              {allProducts.map((product) => (
                <TouchableOpacity
                  key={product.ProductID}
                  style={styles.productCard}
                  onPress={() => navigateToProductDetail(product.ProductID)}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: product.Image }}
                      style={styles.productImage}
                      defaultSource={{ uri: 'https://via.placeholder.com/150' }}
                    />
                 <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => handleToggleWishlist(product)}
                  >
                    <Ionicons
                      name={isInWishlist(product.ProductID) ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isInWishlist(product.ProductID) ? '#FF0000' : '#8B4513'}
                    />
                  </TouchableOpacity>

                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
                      {product.Name}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>{product.Rating}</Text>
                    </View>
                    <Text style={styles.productPrice}>{product.Price}đ</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => addToCart(product)}
                  >
                    <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
            {allProducts.length >= page * 10 && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMoreProducts}
              >
                <Text style={styles.loadMoreText}>Tải thêm sản phẩm</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={220}
        contentContainerStyle={styles.scrollContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      <AdvancedFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        onApplyFilters={applyFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bannerCarouselContainer: {
    height: 150,
    marginHorizontal: 15,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  bannerItem: {
    width: 340, // hoặc Dimensions.get('window').width - margin*2
    height: 150,
    position: 'relative',
    marginRight: 12,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 19,
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 13,
  },

    quickAccessContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 12,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  quickAccessItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickAccessLabel: {
    fontSize: 13,
    color: '#444',
    marginTop: 5,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 80,
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
  filterIcon: {
    marginLeft: 10,
  },
  bannerContainer: {
    height: 150,
    marginHorizontal: 15,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginVertical: 5,
  },
  bannerButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerButtonText: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: '600',
  },
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
  viewAllText: {
    fontSize: 14,
    color: '#8B4513',
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIcon: {
    backgroundColor: '#f0f0f0',
    borderRadius: 50,
    padding: 15,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
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
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  noProductsText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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