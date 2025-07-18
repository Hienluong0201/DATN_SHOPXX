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
  Dimensions,
} from 'react-native';
import { useAuth } from '../../store/useAuth';
import AxiosInstance from '../../axiosInstance/AxiosInstance';
import { Ionicons } from '@expo/vector-icons';
import CustomModal from '../components/CustomModal';

// Thay path này đúng với vị trí bạn để file hình
const emptyImg = require('../../assets/images/laughing.png');

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'success',
    title: '',
    message: '',
    showConfirmButton: false,
    onConfirm: () => {},
  });

  const showModal = (
    type,
    title,
    message,
    showConfirmButton = false,
    onConfirm = () => {}
  ) => {
    setModalConfig({ type, title, message, showConfirmButton, onConfirm });
    setModalVisible(true);
  };

  const fetchWishlist = async () => {
    if (!user?._id) {
      setError('Vui lòng đăng nhập để xem danh sách yêu thích.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);
      const response = await AxiosInstance().get(`/wishlist?userID=${user._id}`);
      const mappedWishlist = await Promise.all(
        (Array.isArray(response) ? response : []).map(async (item) => {
          let imageURLs = ['https://via.placeholder.com/100/cccccc?text=No+Image'];
          try {
            const imageResponse = await AxiosInstance().get(`/img?productID=${item.productID._id}`);
            imageURLs = imageResponse[0]?.imageURL || imageURLs;
          } catch (imgError) {}
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
      setWishlist(mappedWishlist);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách yêu thích. Vui lòng thử lại.');
      setWishlist([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const removeFromWishlist = async (wishlistId) => {
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
          showModal('error', 'Lỗi', 'Không thể xóa sản phẩm khỏi danh sách yêu thích.');
        }
      }
    );
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWishlist();
  };

  const navigateToProductDetail = (productId) =>
    router.push({ pathname: '../productDetail', params: { productId } });

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d4af37" />
      </View>
    );
  }

  // GIAO DIỆN ĐẸP KHI CHƯA ĐĂNG NHẬP
  if (!user?._id) {
    return (
      <View style={styles.authContainer}>
        <Image source={emptyImg} style={styles.emptyImage} resizeMode="contain" />
        <Text style={styles.authTitle}>Đăng nhập để xem danh sách yêu thích</Text>
        <Text style={styles.authDesc}>Hãy đăng nhập để lưu và quản lý các sản phẩm bạn thích nhất!</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.authBtn, styles.loginBtn]}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={24} color="#fff" />
            <Text style={styles.btnText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.authBtn, styles.backBtn]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back-outline" size={24} color="#fff" />
            <Text style={styles.btnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
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

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    marginTop: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 20,
    padding: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  info: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dc2626',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ef4444',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },

  // --- STYLE CHO GIAO DIỆN CHƯA ĐĂNG NHẬP ---
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  emptyImage: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 30,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  authDesc: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    marginHorizontal: 8,
    elevation: 3,
  },
  loginBtn: {
    backgroundColor: '#d97706', // vàng cam hiện đại
  },
  backBtn: {
    backgroundColor: '#6d28d9', // tím hiện đại
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.2,
  },
});
export default Wishlist;
