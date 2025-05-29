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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../store/useAuth';
import { useProducts } from '../../../store/useProducts';

export default function HomeScreen() {
  const { user, loadUser, setUser } = useAuth();
  const { categories, products, getProductsByCategory, loading, error } = useProducts();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [favorites, setFavorites] = useState<string[]>([]); // Lưu danh sách ProductID yêu thích

  useEffect(() => {
    loadUser();
    loadFavorites(); // Tải danh sách yêu thích

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

  // Tải danh sách yêu thích từ AsyncStorage
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

  // Lưu danh sách yêu thích vào AsyncStorage
  const saveFavorites = async (updatedFavorites: string[]) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (err) {
      console.error('Lỗi khi lưu danh sách yêu thích:', err);
    }
  };

  // Thêm/xóa sản phẩm khỏi danh sách yêu thích
  const toggleFavorite = (productId: string) => {
    if (!user?._id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm vào danh sách yêu thích.');
      return;
    }
    const isFavorited = favorites.includes(productId);
    const updatedFavorites = isFavorited
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];
    saveFavorites(updatedFavorites);
    Alert.alert('Thành công', isFavorited ? 'Đã xóa khỏi danh sách yêu thích.' : 'Đã thêm vào danh sách yêu thích.');
  };

  // Thêm sản phẩm vào giỏ hàng
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Thanh tìm kiếm */}
        <View style={styles.searchContainer}>
          <TextInput style={styles.searchInput} placeholder="Tìm kiếm" placeholderTextColor="#999" />
          <MaterialIcons name="search" size={24} color="#8B4513" style={styles.searchIcon} />
        </View>

        {/* Banner quảng cáo */}
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

        {/* Danh mục */}
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

        {/* Sản phẩm theo danh mục */}
        {categories.map((category) => {
          const categoryProducts = getProductsByCategory(category.CategoryID);
          if (!categoryProducts || categoryProducts.length === 0) return null;

          return (
            <Animated.View
              key={category.CategoryID}
              style={[styles.section, { transform: [{ translateY: slideAnim }] }]}
            >
              <View style={styles.categoryHeader}>
                <Text style={styles.sectionTitle}>{category.Name}</Text>
                <TouchableOpacity onPress={() => navigateToCategory(category.CategoryID)}>
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
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
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
});