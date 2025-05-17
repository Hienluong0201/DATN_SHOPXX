import React, { useEffect } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Dữ liệu mẫu
const categories = [
  { CategoryID: 1, Name: 'Áo Nam', Description: 'Áo thời trang dành cho nam' },
  { CategoryID: 2, Name: 'Quần Nam', Description: 'Quần phong cách dành cho nam' },
  { CategoryID: 3, Name: 'Phụ Kiện', Description: 'Phụ kiện thời trang' },
];

const featuredProducts = [
  {
    ProductID: 1,
    CategoryID: 1,
    Name: 'Áo Polo Nam',
    Description: 'Áo Polo cao cấp',
    Price: '499.000 VNĐ',
    Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg',
  },
  {
    ProductID: 2,
    CategoryID: 2,
    Name: 'Quần Jeans',
    Description: 'Quần Jeans thời thượng',
    Price: '799.000 VNĐ',
    Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg',
  },
  {
    ProductID: 3,
    CategoryID: 3,
    Name: 'Dây Lưng Da',
    Description: 'Dây lưng cao cấp',
    Price: '299.000 VNĐ',
    Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg',
  },
];

const productsByCategory = {
  1: [
    {
      ProductID: 4,
      CategoryID: 1,
      Name: 'Áo Sơ Mi Nam',
      Description: 'Áo sơ mi lịch lãm',
      Price: '599.000 VNĐ',
      Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg',
    },
    {
      ProductID: 5,
      CategoryID: 1,
      Name: 'Áo Thun Nam',
      Description: 'Áo thun thoải mái',
      Price: '299.000 VNĐ',
      Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg',
    },
  ],
  2: [
    {
      ProductID: 6,
      CategoryID: 2,
      Name: 'Quần Kaki',
      Description: 'Quần Kaki phong cách',
      Price: '699.000 VNĐ',
      Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg',
    },
    {
      ProductID: 7,
      CategoryID: 2,
      Name: 'Quần Short',
      Description: 'Quần short năng động',
      Price: '399.000 VNĐ',
      Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg',
    },
  ],
  3: [
    {
      ProductID: 8,
      CategoryID: 3,
      Name: 'Kính Mát',
      Description: 'Kính mát thời trang',
      Price: '450.000 VNĐ',
      Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg',
    },
    {
      ProductID: 9,
      CategoryID: 3,
      Name: 'Ví Da',
      Description: 'Ví da cao cấp',
      Price: '350.000 VNĐ',
      Image: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg',
    },
  ],
};

export default function HomeScreen() {
  const { user, loadUser, setUser } = useAuth();
  const fadeAnim = React.useRef(new Animated.Value(0)).current; // Animation cho banner
  const slideAnim = React.useRef(new Animated.Value(50)).current; // Animation cho các section

  useEffect(() => {
    loadUser(); // Load thông tin người dùng khi mở app

    // Animation cho banner (fade in)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    // Animation cho các section (slide up)
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
    <ScrollView style={styles.container}>
      {/* Banner Premium */}
      <Animated.View style={[styles.bannerContainer, { opacity: fadeAnim }]}>
        <Image
          source={{ uri: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg' }}
          style={styles.bannerImage}
        />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>Khám phá phong cách đỉnh cao</Text>
          <Text style={styles.bannerSubtitle}>Ưu đãi độc quyền - Giảm 50% hôm nay!</Text>
          <TouchableOpacity style={styles.bannerButton} onPress={navigateToCategory}>
            <Text style={styles.bannerButtonText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Xin chào, {user?.username ?? 'bạn'}!</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Danh mục (Categories) */}
      <Animated.View style={[styles.section, { transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.sectionTitle}>Danh mục cao cấp</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.CategoryID}
              style={styles.categoryCard}
              onPress={() => navigateToCategory(category.CategoryID)}
            >
              <View style={styles.categoryIcon}>
                <MaterialIcons name="category" size={40} color="#d4af37" />
              </View>
              <Text style={styles.categoryName}>{category.Name}</Text>
              <Text style={styles.categoryDesc}>{category.Description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Sản phẩm nổi bật (Featured Products) */}
      <Animated.View style={[styles.section, { transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
        <View style={styles.gridContainer}>
          {featuredProducts.map((product) => (
            <TouchableOpacity
              key={product.ProductID}
              style={styles.featuredProductCard}
              onPress={() => navigateToProductDetail(product.ProductID)}
            >
              <Image source={{ uri: product.Image }} style={styles.featuredProductImage} />
              <View style={styles.productInfo}>
                <Text style={styles.featuredProductName}>{product.Name}</Text>
                <Text style={styles.featuredProductPrice}>{product.Price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
            <Text style={styles.sectionTitle}>{category.Name} cao cấp</Text>
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
                    <Text style={styles.productPrice}>{product.Price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  bannerContainer: {
    position: 'relative',
    height: 300,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  bannerSubtitle: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 10,
    textAlign: 'center',
  },
  bannerButton: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 5,
  },
  bannerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  greeting: {
    fontSize: 28,
    color: '#d4af37',
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#c0392b',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
    marginHorizontal: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 15,
    color: '#1a1a1a',
    textTransform: 'uppercase',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  categoryCard: {
    width: 160,
    marginRight: 15,
    backgroundColor: '#2c2c2c',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  categoryIcon: {
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d4af37',
    textAlign: 'center',
  },
  categoryDesc: {
    fontSize: 12,
    color: '#bdc3c7',
    textAlign: 'center',
    marginTop: 5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  featuredProductCard: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  productCard: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  featuredProductImage: {
    width: 160,
    height: 160,
    resizeMode: 'cover',
    borderRadius: 15,
  },
  productImage: {
    width: 140,
    height: 140,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  productInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  featuredProductName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c2c2c',
    textAlign: 'center',
  },
  featuredProductPrice: {
    fontSize: 16,
    color: '#c0392b',
    fontWeight: '700',
    marginTop: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#c0392b',
    fontWeight: '600',
    marginTop: 5,
  },
});