import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Image, ActivityIndicator, RefreshControl, ScrollView, Dimensions
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useProducts } from '../store/useProducts';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const CARD_WIDTH = (Dimensions.get('window').width - 35) / 2;

const ProductCard = ({ product, onPress }) => (
  <TouchableOpacity style={styles.productCard} onPress={onPress}>
    <Image
      source={{ uri: product.Image || 'https://via.placeholder.com/120' }}
      style={styles.productImage}
    />
    <Text style={styles.productName}>{product.Name || 'Sản phẩm không tên'}</Text>
    <View style={styles.ratingContainer}>
      <MaterialIcons name="star" size={16} color="#FFD700" />
      <Text style={styles.ratingText}>{product.Rating || '4.0'}</Text>
    </View>
    <Text style={styles.productPrice}>{(product.Price || 0).toLocaleString()}đ</Text>
  </TouchableOpacity>
);

const ProductSkeleton = () => (
  <View style={styles.productCard}>
    <ShimmerPlaceHolder
      LinearGradient={LinearGradient}
      style={styles.skeletonImage}
    />
    <ShimmerPlaceHolder
      LinearGradient={LinearGradient}
      style={styles.skeletonLine}
    />
    <ShimmerPlaceHolder
      LinearGradient={LinearGradient}
      style={[styles.skeletonLine, { width: 60 }]}
    />
    <ShimmerPlaceHolder
      LinearGradient={LinearGradient}
      style={[styles.skeletonLine, { width: 50 }]}
    />
  </View>
);

const Products = () => {
  const { categoryId } = useLocalSearchParams();
  const {
    categories,
    products,
    getProductsByCategory,
    fetchProducts,
    fetchCategories,
    loading,
    error
  } = useProducts();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const flatListRef = useRef(null);

  // Tab scroll ref và lưu offset từng tab
  const tabScrollRef = useRef(null);
  const tabLayouts = useRef([]); // [{x, width}]

  // Danh sách tất cả category cho thanh tab ngang
  const categoryList = useMemo(
    () => [{ CategoryID: 'all', Name: 'Tất cả' }, ...(categories || [])],
    [categories]
  );

  // Lấy index category đang chọn dựa vào params truyền từ router
  const selectedCategoryIndex = useMemo(() => {
    if (!categoryId) return 0;
    const idx = categoryList.findIndex((cat) => cat.CategoryID === categoryId);
    return idx !== -1 ? idx : 0;
  }, [categoryId, categoryList]);

  // Lấy đúng danh mục theo index
  const selectedCategory = categoryList[selectedCategoryIndex] || categoryList[0];

  // Danh sách sản phẩm theo danh mục
  const filteredProducts =
    selectedCategory.CategoryID === 'all'
      ? products
      : getProductsByCategory(selectedCategory.CategoryID);

  // Fetch categories 1 lần khi vào trang
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch lại sản phẩm mỗi lần đổi categoryId
  useEffect(() => {
    fetchProducts({ categoryId: categoryId || 'all', page: 1, limit });
    setPage(2);
    setHasMore(true);
    // Scroll lên đầu khi đổi tab
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
    // Scroll tab ra giữa khi đổi tab (kể cả khi đổi qua router ngoài)
    setTimeout(() => {
      if (
        tabScrollRef.current &&
        tabLayouts.current[selectedCategoryIndex]
      ) {
        const { x, width } = tabLayouts.current[selectedCategoryIndex];
        const screenWidth = Dimensions.get('window').width;
        const targetScrollX = Math.max(0, x + width / 2 - screenWidth / 2);
        tabScrollRef.current.scrollTo({ x: targetScrollX, animated: true });
      }
    }, 180);
  }, [categoryId]);

  // Kéo xuống để refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCategories();
      await fetchProducts({ categoryId: categoryId || 'all', page: 1, limit });
      setPage(2);
      setHasMore(true);
    } finally {
      setRefreshing(false);
    }
  };

  // Load thêm sản phẩm (phân trang)
  const loadMoreProducts = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const newProducts = await fetchProducts({
        categoryId: selectedCategory.CategoryID,
        page,
        limit,
      });
      setHasMore(newProducts.length === limit);
      setPage(prev => prev + 1);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Đi tới trang chi tiết sản phẩm
  const navigateToProductDetail = (productId) => {
    router.push({ pathname: './productDetail', params: { productId } });
  };

  // Nếu đang loading lần đầu (page 1) -> skeleton loading
  if (loading && !refreshing && page === 1) {
    return (
      <View style={styles.container}>
        <FlatList
          data={Array.from({ length: 8 })}
          renderItem={ProductSkeleton}
          keyExtractor={(_, i) => `skeleton-${i}`}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productList}
        />
      </View>
    );
  }

  // Nếu lỗi
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Đã xảy ra lỗi'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={filteredProducts}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigateToProductDetail(item.ProductID)}
          />
        )}
        keyExtractor={(item, index) => item.ProductID || `fallback-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#d4af37']}
            tintColor="#d4af37"
          />
        }
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator size="small" color="#d4af37" style={styles.loadingMore} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có sản phẩm trong danh mục này</Text>
          </View>
        }
        ListHeaderComponent={
          <View>
            {/* Header với nút back */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <MaterialIcons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.title}>Danh Mục</Text>
            </View>

            {/* Thanh tab danh mục */}
            <ScrollView
              ref={tabScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryContainer}
              contentContainerStyle={styles.categoryContent}
            >
              {categoryList.map((cat, index) => (
                <TouchableOpacity
                  key={cat.CategoryID}
                  style={[
                    styles.categoryTab,
                    index === selectedCategoryIndex && styles.selectedCategoryTab,
                  ]}
                  onLayout={event => {
                    const { x, width } = event.nativeEvent.layout;
                    tabLayouts.current[index] = { x, width };
                  }}
                  onPress={() => {
                    router.setParams({ categoryId: cat.CategoryID });

                    // Scroll tab ra giữa màn hình khi bấm
                    setTimeout(() => {
                      if (
                        tabScrollRef.current &&
                        tabLayouts.current[index]
                      ) {
                        const { x, width } = tabLayouts.current[index];
                        const screenWidth = Dimensions.get('window').width;
                        const targetScrollX = Math.max(0, x + width / 2 - screenWidth / 2);
                        tabScrollRef.current.scrollTo({ x: targetScrollX, animated: true });
                      }
                    }, 100);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.categoryName}>{cat.Name || 'Không tên'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        }
        stickyHeaderIndices={[0]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 50,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  backButton: {
    padding: 5,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  categoryContainer: {
    marginTop: 5,
    marginBottom: 6,
  },
  categoryContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    justifyContent: 'center',
  },
  selectedCategoryTab: {
    backgroundColor: '#d4af37',
  },
  categoryName: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#2c2c2c',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#c0392b',
    textAlign: 'center',
    marginTop: 20,
  },
  productList: {
    paddingTop: 10,
    paddingBottom: 30,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  productCard: {
    width: CARD_WIDTH,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  productImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  ratingText: {
    fontSize: 12,
    color: '#000',
    marginLeft: 5,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#c0392b',
    marginTop: 4,
  },
  loadingMore: {
    marginVertical: 20,
  },
  skeletonImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#e0e0e0',
  },
  skeletonLine: {
    width: 90,
    height: 14,
    borderRadius: 4,
    marginBottom: 7,
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
  },
});

export default Products;
