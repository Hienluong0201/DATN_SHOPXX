import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

export default function HomeScreen() {
  const { user, loadUser, setUser } = useAuth();
  const { categories, products, getProductsByCategory, loading, error } = useProducts();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadUser();
    loadFavorites();

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

  const saveFavorites = async (updatedFavorites: string[]) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (err) {
      console.error('Lỗi khi lưu danh sách yêu thích:', err);
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

    const data = await response.json();
    
    // Cập nhật danh sách yêu thích cục bộ
    let updatedFavorites;
    if (isFavorited) {
      updatedFavorites = favorites.filter((id) => id !== productId);
      Alert.alert('Thành công', 'Đã xóa khỏi danh sách yêu thích.');
    } else {
      updatedFavorites = [...favorites, productId];
      Alert.alert('Thành công', 'Đã thêm vào danh sách yêu thích.');
    }

    // Lưu danh sách yêu thích vào AsyncStorage
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites);

  } catch (error) {
    console.error('Lỗi khi thêm/xóa yêu thích:', error);
    Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích: ' + error.message);
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

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    setUser(null);
    router.replace('./login');
    Alert.alert('Đăng xuất', 'Bạn đã đăng xuất thành công.');
  };

  const navigateToCategory = (categoryId: string) =>
    router.push({ pathname: './products', params: { categoryId } });
  const navigateToProductDetail = (productId: string) =>
    router.push({ pathname: './productDetail', params: { productId } });

  const applyFilters = () => {
    setFilterModalVisible(false);
  };

  const filteredProducts = (categoryId: string) => {
    let categoryProducts = getProductsByCategory(categoryId);
    return categoryProducts.filter((product) => {
      const matchesPrice = product.Price >= priceRange[0] && product.Price <= priceRange[1];
      const matchesRating = product.Rating >= selectedRating;
      const matchesCategory = selectedCategory ? product.CategoryID === selectedCategory : true;
      return matchesPrice && matchesRating && matchesCategory;
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#d4af37" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const data = [
    { type: 'search', id: 'search' },
    { type: 'banner', id: 'banner' },
    { type: 'categories', id: 'categories' },
    ...categories.map((category) => ({
      type: 'products',
      id: category.CategoryID,
      category,
    })),
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
          <Animated.View style={[styles.bannerContainer, { opacity: fadeAnim }]}>
            <Image
              source={{ uri: 'https://via.placeholder.com/400x150.png?text=New+Collection' }}
              style={styles.bannerImage}
            />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerTitle}>New Collection</Text>
              <Text style={styles.bannerSubtitle}>Discount 50% for transactions</Text>
              <TouchableOpacity
                style={styles.bannerButton}
                onPress={() => navigateToCategory(categories[0]?.CategoryID || '')}
              >
                <Text style={styles.bannerButtonText}>SHOP NOW</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      case 'categories':
        return (
          <Animated.View style={[styles.section, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.categoryHeader}>
              <Text style={styles.sectionTitle}>Danh Mục</Text>
              <TouchableOpacity onPress={() => navigateToCategory('')}>
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
      case 'products':
        const categoryProducts = filteredProducts(item.category.CategoryID);
        if (!categoryProducts || categoryProducts.length === 0) return null;

        return (
          <Animated.View style={[styles.section, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.categoryHeader}>
              <Text style={styles.sectionTitle}>{item.category.Name}</Text>
              <TouchableOpacity onPress={() => navigateToCategory(item.category.CategoryID)}>
                <Text style={styles.viewAllText}>Tất cả</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.gridContainer}>
              {categoryProducts.map((product) => (
                <TouchableOpacity
                  key={product.ProductID}
                  style={styles.productCard}
                  onPress={() => navigateToProductDetail(product.ProductID)}
                >
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: product.Image }} style={styles.productImage} />
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={() => toggleFavorite(product.ProductID)}
                    >
                      <Ionicons
                        name={favorites.includes(product.ProductID) ? 'heart' : 'heart-outline'}
                        size={20}
                        color={favorites.includes(product.ProductID) ? '#FF0000' : '#8B4513'}
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
        estimatedItemSize={200}
        contentContainerStyle={styles.scrollContent}
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
  container: {
    top : 20,
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
});