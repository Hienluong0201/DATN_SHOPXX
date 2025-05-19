import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { useAuth } from './../store/useAuth';
import Header from './components/Header';
import Banner from './components/Banner';
import CategorySection from './components/CategorySection';
import FeaturedProductsSection from './components/FeaturedProductsSection';
import CategoryProductsSection from './components/CategoryProductsSection';

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUser();

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

  const stickyHeaderStyle = {
    opacity: scrollY.interpolate({
      inputRange: [300, 310],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [300, 310],
          outputRange: [-10, 0],
          extrapolate: 'clamp',
        }),
      },
    ],
    backgroundColor: scrollY.interpolate({
      inputRange: [300, 310],
      outputRange: ['#1a1a1a', 'rgba(26, 26, 26, 0.95)'],
      extrapolate: 'clamp',
    }),
  };

  return (
    <View style={styles.container}>
      {/* Header cố định */}
      <Animated.View style={[styles.stickyHeader, stickyHeaderStyle]}>
        <Header user={user} onLogout={handleLogout} />
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Banner */}
        <Banner onPress={navigateToCategory} fadeAnim={fadeAnim} />

        {/* Header ban đầu */}
        <Header user={user} onLogout={handleLogout} />

        {/* Danh mục */}
        <CategorySection
          categories={categories}
          navigateToCategory={navigateToCategory}
          slideAnim={slideAnim}
        />

        {/* Sản phẩm nổi bật */}
        <FeaturedProductsSection
          featuredProducts={featuredProducts}
          navigateToProductDetail={navigateToProductDetail}
          slideAnim={slideAnim}
        />

        {/* Sản phẩm theo danh mục */}
        {categories.map((category) => (
          <CategoryProductsSection
            key={category.CategoryID}
            category={category}
            products={productsByCategory[category.CategoryID]}
            navigateToProductDetail={navigateToProductDetail}
            slideAnim={slideAnim}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});