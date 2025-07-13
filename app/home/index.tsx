import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
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
import CustomModal from '../components/CustomModal';
import { useFocusEffect } from 'expo-router';
import AxiosInstance from '../../axiosInstance/AxiosInstance';
import ProductVariantSelectorModal from '../components/ProductVariantSelectorModal';
import { Image as RNImage } from 'react-native';
export default function HomeScreen() {
  const { user, loadUser, setUser } = useAuth();
  const { categories, products, fetchProducts, loading, error, fetchCategories, fetchWishlist, wishlist, addToWishlist, removeFromWishlist, isInWishlist, getWishlistId, fetchProductVariants } = useProducts();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [currentVariants, setCurrentVariants] = useState<any[]>([]);
  const [modalConfig, setModalConfig] = useState({
    type: 'success' as 'success' | 'error' | 'warning',
    title: '',
    message: '',
  });

  const showModal = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
    setModalConfig({ type, title, message });
    setModalVisible(true);
  };

  useFocusEffect(
  useCallback(() => {
    const loadData = async () => {
      await Promise.all([
        fetchCategories(),
        fetchProducts({ categoryId: 'all', page: 1, limit: 10 }), // ✅ CHỈ GỌI Ở ĐÂY
        loadFavorites(),
        user?._id ? fetchWishlist(user._id) : Promise.resolve(),
      ]);
    };
    loadData();
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
  const initialize = async () => {
    await loadUser();
    await loadFavorites();

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
  };
  initialize();
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
const handleConfirmVariant = async (variantId: string) => {
  if (!user?._id || !currentProduct) return;

  try {
    await AxiosInstance().post('/cart', {
      userID: user._id,
      productVariant: variantId,
      soluong: 1,
    });
    showModal('success', 'Thành công', `${currentProduct.Name} đã được thêm vào giỏ hàng!`);
  } catch (err: any) {
    showModal('error', 'Lỗi', err?.response?.data?.message || 'Không thể thêm vào giỏ hàng.');
  }
};
const addToCartServer = async (product: any) => {
  if (!user?._id) {
    showModal('error', 'Lỗi', 'Vui lòng đăng nhập để thêm vào giỏ hàng!');
    return;
  }

  let variants = [];
  try {
    variants = await fetchProductVariants(product.ProductID);
  } catch {
    showModal('error', 'Lỗi', 'Không thể lấy biến thể sản phẩm!');
    return;
  }

  if (!variants.length) {
    showModal('error', 'Lỗi', 'Sản phẩm này đã dừng kinh doanh!');
    return;
  }

  const imageUrl = product.Image || product.image || product.images?.[0] || '';

  // ✅ Prefetch ảnh trước khi mở modal
  if (imageUrl) {
    try {
      await RNImage.prefetch(imageUrl); // tải trước
      console.log('✅ Ảnh đã prefetch xong:', imageUrl);
    } catch (e) {
      console.warn('⚠️ Prefetch lỗi:', imageUrl);
    }
  }

  setCurrentProduct({
    Image: imageUrl || 'https://via.placeholder.com/100',
    Name: product.Name || product.name || 'Không có tên',
    Price: product.Price || product.price || '0',
  });

  setCurrentVariants(variants);
  // ✅ Sau khi set xong, mở modal
  setVariantModalVisible(true);
};

  const handleToggleWishlist = (product: any) => {
    if (!user?._id) {
      showModal('error', 'Lỗi', 'Vui lòng đăng nhập để thêm vào danh sách yêu thích.');
      return;
    }
    if (isInWishlist(product.ProductID)) {
      const wishId = getWishlistId(product.ProductID);
      if (wishId) removeFromWishlist(wishId);
    } else {
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
      showModal('error', 'Lỗi', 'Không thể tải sản phẩm.');
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
      showModal('error', 'Lỗi', 'Không thể tải thêm sản phẩm.');
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
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => router.push({ pathname: './SearchScreen' })}
            >
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm"
                placeholderTextColor="#999"
                editable={false}
              />
            </TouchableOpacity>
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
              <TouchableOpacity onPress={() => router.push({ pathname: './categoryDetail' })}>
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
            <TouchableOpacity style={styles.quickAccessItem} onPress={() => router.push('/home/wishlist')}>
              <Ionicons name="heart" size={28} color="#FF5161" />
              <Text style={styles.quickAccessLabel}>Yêu thích</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessItem} onPress={() => router.push('./video')}>
              <Ionicons name="receipt" size={28} color="#4287f5" />
              <Text style={styles.quickAccessLabel}>Video</Text>
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
                    onPress={() => addToCartServer(product)}
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
        showsVerticalScrollIndicator={false}
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
      <CustomModal
        isVisible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
     <ProductVariantSelectorModal
  visible={variantModalVisible}
  onClose={() => setVariantModalVisible(false)}
  onConfirm={handleConfirmVariant}
  variants={currentVariants}
  product={currentProduct} // <-- nhớ đảm bảo currentProduct không null khi mở modal
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
    width: 340,
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    marginTop: 50,
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