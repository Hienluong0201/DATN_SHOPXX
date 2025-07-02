import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../store/useAuth';
import AxiosInstance from '../../axiosInstance/AxiosInstance';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import CustomModal from '../components/CustomModal';

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'success' as 'success' | 'error' | 'warning',
    title: '',
    message: '',
    showConfirmButton: false,
    onConfirm: () => {},
  });

  const showModal = (
    type: 'success' | 'error' | 'warning',
    title: string,
    message: string,
    showConfirmButton = false,
    onConfirm = () => {}
  ) => {
    setModalConfig({ type, title, message, showConfirmButton, onConfirm });
    setModalVisible(true);
  };

  const fetchWishlist = async () => {
    if (!user?._id) {
      console.log('User ID không tồn tại:', user);
      setError('Vui lòng đăng nhập để xem danh sách yêu thích.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);
      const response = await AxiosInstance().get(`/wishlist?userID=${user._id}`);
      console.log('Dữ liệu từ API /wishlist:', response);

      const mappedWishlist = await Promise.all(
        (Array.isArray(response) ? response : []).map(async (item) => {
          let imageURLs = ['https://via.placeholder.com/100/cccccc?text=No+Image'];
          try {
            const imageResponse = await AxiosInstance().get(`/img?productID=${item.productID._id}`);
            console.log(`Dữ liệu từ API /img cho sản phẩm ${item.productID._id}:`, imageResponse);
            imageURLs = imageResponse[0]?.imageURL || imageURLs;
          } catch (imgError) {
            console.warn(`Không thể lấy hình ảnh cho sản phẩm ${item.productID._id}:`, imgError);
          }
          return {
            WishlistID: item._id,
            ProductID: item.productID._id,
            Name: item.productID.name,
            Image: imageURLs[0],
            Price: item.productID.price,
            Description: item.productID.description || '',
          };
        })
      );

      console.log('Dữ liệu mappedWishlist:', mappedWishlist);
      setWishlist(mappedWishlist);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi tải danh sách yêu thích:', err);
      setError('Không thể tải danh sách yêu thích. Vui lòng thử lại.');
      setWishlist([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    showModal(
      'warning',
      'Xác nhận',
      'Bạn muốn xóa sản phẩm này khỏi danh sách yêu thích?',
      true,
      async () => {
        try {
          await AxiosInstance().delete(`/wishlist/${wishlistId}`);
          setWishlist(wishlist.filter((item) => item.WishlistID !== wishlistId));
          showModal('success', 'Thành công', 'Đã xóa sản phẩm khỏi danh sách yêu thích.');
        } catch (err) {
          console.error('Lỗi khi xóa yêu thích:', err);
          showModal('error', 'Lỗi', 'Không thể xóa sản phẩm khỏi danh sách yêu thích.');
        }
      }
    );
  };

  useEffect(() => {
    console.log('User hiện tại:', user);
    fetchWishlist();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWishlist();
  };

  const navigateToProductDetail = (productId: string) =>
    router.push({ pathname: '../productDetail', params: { productId } });

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#d4af37']}
          tintColor="#d4af37"
        />
      }
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.title}>Danh Sách Yêu Thích</Text>
      {wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={50} color="#999" />
          <Text style={styles.emptyText}>Danh sách yêu thích trống</Text>
          <Text style={styles.emptySubText}>Thêm sản phẩm vào danh sách để xem tại đây!</Text>
        </View>
      ) : (
        wishlist.map((item) => (
          <TouchableOpacity
            key={item.WishlistID}
            style={styles.card}
            onPress={() => navigateToProductDetail(item.ProductID)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: item.Image }}
              style={styles.image}
              defaultSource={{ uri: 'https://via.placeholder.com/100/cccccc?text=Loading' }}
            />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
                {item.Name}
              </Text>
              <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
                {item.Description}
              </Text>
              <Text style={styles.price}>{item.Price.toLocaleString('vi-VN')}đ</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFromWishlist(item.WishlistID)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}
      <CustomModal
        isVisible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
        onConfirm={modalConfig.onConfirm}
        showConfirmButton={modalConfig.showConfirmButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc', // Màu nền nhẹ nhàng, hiện đại
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Màu nền sáng, sạch sẽ
    marginTop: 40,
  },
  scrollContent: {
    padding: 20, // Tăng padding để giao diện thoáng hơn
    paddingBottom: 30,
  },
  title: {
    fontSize: 32, // Tăng kích thước tiêu đề
    fontWeight: '700',
    color: '#1e293b', // Màu xanh đậm hiện đại
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5, // Thêm khoảng cách chữ cho tinh tế
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80, // Tăng không gian cho phần trống
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#475569', // Màu xám đậm nhẹ
    textAlign: 'center',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 16,
    color: '#94a3b8', // Màu xám nhạt
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16, // Bo góc mềm mại hơn
    marginBottom: 20,
    padding: 12,
    elevation: 6, // Tăng đổ bóng cho nổi bật
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1, // Thêm viền nhẹ
    borderColor: '#e2e8f0', // Viền xám nhạt
  },
  image: {
    width: 110, // Tăng kích thước hình ảnh
    height: 110,
    borderRadius: 12, // Bo góc hình ảnh
    backgroundColor: '#f1f5f9', // Màu nền khi hình ảnh đang tải
    borderWidth: 1,
    borderColor: '#e2e8f0', // Viền nhẹ cho hình ảnh
  },
  info: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18, // Tăng kích thước tên sản phẩm
    fontWeight: '600',
    color: '#1e293b', // Màu chữ đậm
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#64748b', // Màu xám trung tính
    marginBottom: 8,
    lineHeight: 20, // Tăng khoảng cách dòng cho dễ đọc
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dc2626', // Màu đỏ tươi sáng hơn
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ef4444', // Màu đỏ nổi bật hơn
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Thêm đổ bóng cho nút
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#dc2626', // Màu đỏ lỗi
    textAlign: 'center',
    marginTop: 30,
  },
});
export default Wishlist;