import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../store/useAuth';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Easing,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import AxiosInstance from '../../axiosInstance/AxiosInstance';

export default function HomeScreen() {
  const { user, loadUser, setUser } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [categories, setCategories] = useState([]); // State lưu danh mục
  const [productsByCategory, setProductsByCategory] = useState({}); // State lưu sản phẩm theo danh mục

  // Hàm gọi API để lấy danh mục
  const fetchCategories = async () => {
    try {
      const response = await AxiosInstance().get('/category');
      console.log('API Categories Response:', response);
      const fetchedCategories = response.map((category) => ({
        CategoryID: category._id,
        Name: category.name,
        Icon: getIconForCategory(category.name),
        Description: category.description,
        Status: category.status,
      }));
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Lỗi', 'Không thể tải danh mục. Vui lòng thử lại sau.');
    }
  };

  // Hàm gọi API để lấy sản phẩm
  const fetchProducts = async () => {
    try {
      const response = await AxiosInstance().get('/products');
      console.log('API Products Response:', response);
      const products = response.products;

      // Tạo object để nhóm sản phẩm theo categoryID
      const groupedProducts = {};
      for (const product of products) {
        const categoryId = product.categoryID;
        if (!groupedProducts[categoryId]) {
          groupedProducts[categoryId] = [];
        }

        // Gọi API lấy hình ảnh cho sản phẩm
        const imageResponse = await AxiosInstance().get(`/img?productID=${product._id}`);
        const imageURLs = imageResponse[0]?.imageURL || ['https://via.placeholder.com/150']; // Fallback nếu không có ảnh

        groupedProducts[categoryId].push({
          ProductID: product._id,
          CategoryID: product.categoryID,
          Name: product.name,
          Price: product.price.toLocaleString('vi-VN'), // Định dạng giá
          Rating: 4.0, // Giả lập rating vì API không cung cấp
          Image: imageURLs[0], // Lấy ảnh đầu tiên
        });
      }

      setProductsByCategory(groupedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Lỗi', 'Không thể tải sản phẩm. Vui lòng thử lại sau.');
    }
  };

  // Hàm ánh xạ tên danh mục với icon
  const getIconForCategory = (name) => {
    switch (name) {
      case 'Áo Khoác':
        return 'jacket-outline';
      case 'Áo Polo':
        return 'shirt-outline';
      case 'Áo Thun':
        return 'shirt-outline';
      case 'Áo Sơ Mi':
        return 'shirt-outline';
      case 'Quần Dài':
        return 'man-outline';
      case 'Quần Đùi':
        return 'man-outline';
      default:
        return 'cube-outline';
    }
  };

  useEffect(() => {
    loadUser();
    fetchCategories(); // Gọi API danh mục
    fetchProducts(); // Gọi API sản phẩm

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

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    setUser(null);
    router.replace('./login');
    Alert.alert('Đăng xuất', 'Bạn đã đăng xuất thành công.');
  };

  const navigateToCategory = (categoryId) => router.push({ pathname: './products', params: { categoryId } });
  const navigateToProductDetail = (productId) => router.push({ pathname: './productDetail', params: { productId } });

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
            <TouchableOpacity style={styles.bannerButton} onPress={() => navigateToCategory(categories[0]?.CategoryID)}>
              <Text style={styles.bannerButtonText}>SHOP NOW</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Danh mục */}
        <Animated.View style={[styles.section, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.categoryHeader}>
            <Text style={styles.sectionTitle}>Danh Mục</Text>
            <TouchableOpacity>
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
          const products = productsByCategory[category.CategoryID];
          if (!products || products.length === 0) return null;

          return (
            <Animated.View
              key={category.CategoryID}
              style={[styles.section, { transform: [{ translateY: slideAnim }] }]}
            >
              <View style={styles.categoryHeader}>
                <Text style={styles.sectionTitle}>{category.Name}</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>Tất cả</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.gridContainer}>
                {products.map((product) => (
                  <TouchableOpacity
                    key={product.ProductID}
                    style={styles.productCard}
                    onPress={() => navigateToProductDetail(product.ProductID)}
                  >
                    <Image source={{ uri: product.Image }} style={styles.productImage} />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.Name}</Text>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>{product.Rating}</Text>
                      </View>
                      <Text style={styles.productPrice}>{product.Price}đ</Text>
                    </View>
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

// Styles giữ nguyên như code gốc
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
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 10,
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
});