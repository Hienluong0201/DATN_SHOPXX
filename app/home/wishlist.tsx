import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Dimensions,
  FlatList,
} from 'react-native';
import { useAuth } from '../../store/useAuth';
import AxiosInstance from '../../axiosInstance/AxiosInstance';
import { Ionicons } from '@expo/vector-icons';
import CustomModal from '../components/CustomModal';

const emptyImg = require('../../assets/images/laughing.png');
const { width } = Dimensions.get('window');
const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const response = await AxiosInstance().get(`/wishlist?userID=${user._id}`);
      const mappedWishlist = await Promise.all(
        (Array.isArray(response) ? response : []).map(async (item) => {
          let imageURLs = ['https://via.placeholder.com/200x200/cccccc?text=No+Image'];
          try {
            const imageResponse = await AxiosInstance().get(`/img?productID=${item.productID._id}`);
            imageURLs = imageResponse[0]?.imageURL || imageURLs;
          } catch {}
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
    } catch {
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
        } catch {
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
        <ActivityIndicator size="large" color="#e11d48" />
      </View>
    );
  }

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
            activeOpacity={0.85}
          >
            <Ionicons name="log-in-outline" size={24} color="#fff" />
            <Text style={styles.btnText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.authBtn, styles.backBtn]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back-outline" size={24} color="#fff" />
            <Text style={styles.btnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderWishlistItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.91}
      onPress={() => navigateToProductDetail(item.ProductID)}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: item.Image }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => removeFromWishlist(item.WishlistID)}
          activeOpacity={0.65}
        >
          <Ionicons name="heart" size={26} color="#f43f5e" />
        </TouchableOpacity>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.name} numberOfLines={2}>{item.Name}</Text>
        <Text style={styles.price}>{item.Price.toLocaleString('vi-VN')}đ</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Yêu Thích</Text>
      {wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={54} color="#e11d48" />
          <Text style={styles.emptyText}>Chưa có sản phẩm yêu thích</Text>
          <Text style={styles.emptySubText}>Thêm vào để xem lại dễ dàng hơn!</Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          numColumns={2}
          keyExtractor={(item) => item.WishlistID}
          renderItem={renderWishlistItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.grid,{ paddingBottom: 70 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#e11d48']}
              tintColor="#e11d48"
            />
          }
        />
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
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#be123c',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  grid: {
    paddingLeft: CARD_MARGIN,
    paddingRight: CARD_MARGIN,
    paddingBottom: 28,
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 18,
    marginHorizontal: CARD_MARGIN / 2, // căn đều 2 bên
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 10,
    zIndex: 2,
    backgroundColor: '#fff',
    padding: 7,
    borderRadius: 30,
    elevation: 7,
    shadowColor: '#f43f5e',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
  },
  infoBox: {
    paddingVertical: 11,
    paddingHorizontal: 13,
    minHeight: 68,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#27272a',
    marginBottom: 6,
    lineHeight: 19,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f43f5e',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 70,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#e11d48',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: '#c026d3',
    textAlign: 'center',
    marginTop: 7,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  emptyImage: {
    width: width * 0.48,
    height: width * 0.48,
    marginBottom: 28,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#c026d3',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  authDesc: {
    fontSize: 16,
    color: '#b91c1c',
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
    backgroundColor: '#d97706',
  },
  backBtn: {
    backgroundColor: '#6d28d9',
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
