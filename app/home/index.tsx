// Main HomeScreen.tsx
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
import SearchComponent from '../components/SearchComponent';
import BannerComponent from '../components/BannerComponent';
import CategoriesComponent from '../components/CategoriesComponent';
import QuickAccessComponent from '../components/QuickAccessComponent';
import ProductsComponent from '../components/ProductsComponent';
import AdvancedFilterScreen from '../AdvancedFilterScreen';

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
          fetchProducts({ categoryId: 'all', page: 1, limit: 10 }),
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

    if (imageUrl) {
      try {
        await RNImage.prefetch(imageUrl);
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
        return <SearchComponent onFilterPress={() => router.push('/AdvancedFilterScreen')} />
      case 'banner':
        return (
          <BannerComponent
            fadeAnim={fadeAnim}
            categories={categories}
            navigateToCategory={navigateToCategory}
          />
        );
      case 'categories':
        return (
          <CategoriesComponent
            slideAnim={slideAnim}
            categories={categories}
            navigateToCategory={navigateToCategory}
          />
        );
      case 'quickAccess':
        return <QuickAccessComponent />;
      case 'products':
        return (
          <ProductsComponent
            slideAnim={slideAnim}
            filteredProducts={filteredProducts}
            loading={loading}
            page={page}
            navigateToProductDetail={navigateToProductDetail}
            handleToggleWishlist={handleToggleWishlist}
            isInWishlist={isInWishlist}
            addToCartServer={addToCartServer}
            loadMoreProducts={loadMoreProducts}
          />
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
        product={currentProduct}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
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
});