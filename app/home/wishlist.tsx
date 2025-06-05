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
  Alert,
} from 'react-native';
import { useAuth } from '../../store/useAuth';
import AxiosInstance from '../../axiosInstance/AxiosInstance';
import { Ionicons } from '@expo/vector-icons'; 
import { useFocusEffect } from 'expo-router';

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

   useFocusEffect(
    React.useCallback(() => {
      fetchWishlist(); // mỗi lần vào lại tab/trang là fetch lại liền
    }, [user])
  );
  // Hàm lấy danh sách yêu thích từ API
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
            Description: item.productID.description || '', // Thêm mô tả
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

  // Hàm xóa sản phẩm khỏi danh sách yêu thích
  const removeFromWishlist = async (wishlistId: string) => {
  try {
    await AxiosInstance().delete(`/wishlist/${wishlistId}`);
    setWishlist(wishlist.filter((item) => item.WishlistID !== wishlistId));
    Alert.alert('Thành công', 'Đã xóa sản phẩm khỏi danh sách yêu thích.');
  } catch (err) {
    console.error('Lỗi khi xóa yêu thích:', err);
    Alert.alert('Lỗi', 'Không thể xóa sản phẩm khỏi danh sách yêu thích.');
  }
};

  // Gọi API khi component mount hoặc user thay đổi
  useEffect(() => {
    console.log('User hiện tại:', user);
    fetchWishlist();
  }, [user]);

  // Hàm xử lý pull-to-refresh
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f5f5f5', // cùng màu với container
},
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#eee', // Màu nền khi hình ảnh đang tải
  },
  info: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#c0392b',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#c0392b',
    borderRadius: 15,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#c0392b',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Wishlist;