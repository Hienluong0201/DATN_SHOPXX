import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function AdvancedFilterScreen() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [minRating, setMinRating] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const router = useRouter();
  const LIMIT = 10;

  const fetchCategories = async () => {
    const res = await fetch(`https://datn-sever.onrender.com/category?status=true`);
    const data = await res.json();
    setCategories(data);
  };

  const fetchProducts = async (pageNumber = 1, isLoadMore = false) => {
    if (!isLoadMore) {
      setLoading(true);
    } else {
      setIsFetchingMore(true);
    }

    const query = new URLSearchParams({
      categoryName: selectedCategory,
      name,
      sort,
      minPrice,
      maxPrice,
      minRating,
      status: 'true',
      page: pageNumber.toString(),
      limit: LIMIT.toString(),
    });

    try {
      const res = await fetch(`https://datn-sever.onrender.com/products/advanced-search?${query}`);
      const data = await res.json();
      const newProducts = data.products || [];

      if (isLoadMore) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }

      setHasMore(newProducts.length === LIMIT);
    } catch (error) {
      console.error('Fetch products error:', error);
    } 
    setLoading(false);
    setIsFetchingMore(false);
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts(1, false);
  }, []);

  const handleApplyFilter = () => {
    setPage(1);
    fetchProducts(1, false);
  };

  const handleLoadMore = () => {
    if (hasMore && !isFetchingMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, true);
    }
  };

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 16 }} />;
  };

  const renderFilterHeader = () => (
    <View style={styles.container}>
      <Text style={styles.heading}>Bộ Lọc Sản Phẩm</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Danh mục</Text>
        <TouchableOpacity style={styles.selectBox} onPress={() => setCategoryModalVisible(true)}>
          <Ionicons name="grid-outline" size={18} color="#555" style={styles.inputIcon} />
          <Text style={styles.selectText}>{selectedCategory || 'Chọn danh mục'}</Text>
          <Ionicons name="chevron-down" size={18} color="#555" />
        </TouchableOpacity>
        {/* Giá từ - Giá đến */}
        <View style={styles.rowWrap}>
          <View style={styles.halfBox}>
            <Text style={styles.label}>Giá từ</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="cash-outline" size={18} color="#555" style={styles.inputIcon} />
              <TextInput style={styles.input} keyboardType="numeric" placeholder="Min" value={minPrice} onChangeText={setMinPrice} />
            </View>
          </View>
          <View style={styles.halfBox}>
            <Text style={styles.label}>Giá đến</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="cash-outline" size={18} color="#555" style={styles.inputIcon} />
              <TextInput style={styles.input} keyboardType="numeric" placeholder="Max" value={maxPrice} onChangeText={setMaxPrice} />
            </View>
          </View>
        </View>
        {/* Sắp xếp - Sao */}
        <View style={styles.rowWrap}>
          <View style={styles.halfBox}>
            <Text style={styles.label}>Sắp xếp</Text>
            <TouchableOpacity style={styles.selectBox} onPress={() => setSortModalVisible(true)}>
              <Ionicons name="swap-vertical-outline" size={18} color="#555" style={styles.inputIcon} />
              <Text style={styles.selectText}>{sort === 'price_asc' ? 'Giá tăng dần' : sort === 'price_desc' ? 'Giá giảm dần' : 'Không sắp xếp'}</Text>
              <Ionicons name="chevron-down" size={18} color="#555" />
            </TouchableOpacity>
          </View>
          <View style={styles.halfBox}>
            <Text style={styles.label}>Tối thiểu sao</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="star-outline" size={18} color="#555" style={styles.inputIcon} />
              <TextInput style={styles.input} keyboardType="numeric" placeholder="VD: 4" value={minRating} onChangeText={setMinRating} />
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={handleApplyFilter}>
          <LinearGradient colors={['#007AFF', '#005BB5']} style={styles.filterButtonGradient}>
            <Text style={styles.filterButtonText}>Áp dụng bộ lọc</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <Text style={styles.resultTitle}>Sản phẩm</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) => item._id || index.toString()}
          numColumns={2}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListHeaderComponent={renderFilterHeader}
          columnWrapperStyle={{ gap: 8, justifyContent: 'space-between' }}
          contentContainerStyle={{ padding: 8 }}
         renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCardGrid}
            onPress={() => router.push({ pathname: '/productDetail', params: { productId: item._id } })}
          >
            <Image source={{ uri: item.images?.[0] || '' }} style={styles.productImageGrid} />
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productPrice}>{item.price.toLocaleString()}đ</Text>
            <Text style={styles.productRating}>⭐ {item.averageRating}</Text>
          </TouchableOpacity>
        )}
        />
      )}

      {/* Modal danh mục */}
      <Modal visible={categoryModalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCategoryModalVisible(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Chọn Danh Mục</Text>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                onPress={() => {
                  setSelectedCategory(cat.name);
                  setCategoryModalVisible(false);
                  handleApplyFilter();
                }}
                style={styles.modalItemContainer}
              >
                <Text style={styles.modalItem}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal sắp xếp */}
      <Modal visible={sortModalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortModalVisible(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Chọn Sắp Xếp</Text>
            {['', 'price_asc', 'price_desc'].map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  setSort(opt);
                  setSortModalVisible(false);
                  handleApplyFilter();
                }}
                style={styles.modalItemContainer}
              >
                <Text style={styles.modalItem}>
                  {opt === '' ? 'Không sắp xếp' : opt === 'price_asc' ? 'Giá tăng dần' : 'Giá giảm dần'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  productCardGrid: {
  backgroundColor: '#fff',
  flex: 1,
  marginBottom: 12,
  borderRadius: 12,
  padding: 10,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
},
productImageGrid: {
  width: '100%',
  height: 130,
  borderRadius: 8,
  marginBottom: 8,
},

    rowWrap: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap : 8
},
halfBox: {
  flex: 1,
},
  container: { flexGrow: 1, backgroundColor: '#f8f9fa', padding: 8,marginTop : 30 },
  heading: { fontSize: 28, fontWeight: '700', marginBottom: 20, color: '#333', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  label: { fontWeight: '600', marginTop: 16, color: '#444', fontSize: 14 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, marginTop: 8, paddingHorizontal: 12, backgroundColor: '#fff' },
  input: { flex: 1, paddingVertical: 12, color: '#333', fontSize: 16 },
  inputIcon: { marginRight: 10 },
  selectBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, marginTop: 8, backgroundColor: '#fff' },
  selectText: { flex: 1, color: '#333', fontSize: 13 },
  filterButton: { marginTop: 24, borderRadius: 12, overflow: 'hidden' },
  filterButtonGradient: { paddingVertical: 16, alignItems: 'center' },
  filterButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  resultTitle: { fontSize: 22, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#333' },
  productCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  productImage: { width: 90, height: 90, borderRadius: 12, marginRight: 16 },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 16, fontWeight: '600', color: '#333' },
  productPrice: { marginTop: 6, color: '#e74c3c', fontWeight: '700', fontSize: 15 },
  productRating: { marginTop: 4, color: '#f39c12', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '50%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: '#333', textAlign: 'center' },
  modalItemContainer: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalItem: { fontSize: 16, color: '#333', textAlign: 'center' },
});
