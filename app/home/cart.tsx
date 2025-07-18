import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Trash2 } from 'lucide-react-native';
import { useAuth } from '../../store/useAuth';
import { useProducts } from '../../store/useProducts';
import AxiosInstance from '../../axiosInstance/AxiosInstance';
import { router, useFocusEffect } from 'expo-router';
import CustomModal from '../components/CustomModal';
import { Ionicons } from '@expo/vector-icons';

const emptyImg = require('../../assets/images/laughing.png');
const Cart = () => {
  const { user } = useAuth();
  const { products } = useProducts();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
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

  const fetchCart = useCallback(async () => {
    if (!user?._id) {
      setCart([]);
      setLoading(false);
      setError('Bạn cần đăng nhập để xem giỏ hàng!');
      return;
    }
    setLoading(true);
    try {
      const response = await AxiosInstance().get(`/cart/${user._id}`);
      setCart(response || []);
      setError(null);
      setSelectedItems(new Array(response.length).fill(false));
      setSelectAll(false);
    } catch (err) {
      setError('Không thể tải giỏ hàng. Vui lòng thử lại.');
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  useEffect(() => {
    if (user?._id) {
      fetchCart();
    } else {
      setCart([]);
      setLoading(false);
      setError('Bạn cần đăng nhập để xem giỏ hàng!');
    }
  }, [user?._id, fetchCart]);

  const removeFromCart = async (cartId) => {
    showModal(
      'warning',
      'Xác nhận',
      'Bạn muốn xóa sản phẩm này khỏi giỏ hàng?',
      true,
      async () => {
        try {
          await AxiosInstance().delete(`/cart/${cartId}`);
          setCart((prev) => prev.filter((item) => item._id !== cartId));
          setSelectedItems((prev) => prev.filter((_, i) => cart[i]?._id !== cartId));
          setSelectAll(false);
          showModal('success', 'Thành công', 'Sản phẩm đã được xóa khỏi giỏ hàng.');
        } catch (err) {
          showModal('error', 'Lỗi', 'Không thể xóa sản phẩm khỏi giỏ hàng.');
        }
      }
    );
  };

  const updateQuantity = async (cartId, value) => {
    const cartItem = cart.find((item) => item._id === cartId);
    if (!cartItem) return;
    if (value === -1 && cartItem.soluong <= 1) return;
    try {
      const endpoint = value === -1 ? `/cart/${cartId}/decrease` : `/cart/${cartId}/increase`;
      await AxiosInstance().patch(endpoint);
      setCart((prev) =>
        prev.map((item) =>
          item._id === cartId ? { ...item, soluong: item.soluong + value } : item
        )
      );
    } catch (err) {
      showModal('error', 'Lỗi', 'Số lượng vượt quá tồn kho.');
    }
  };

  const navigateToProductDetail = (productId) => {
    if (productId) {
      router.push({
        pathname: '/productDetail',
        params: { productId },
      });
    }
  };

  const toggleSelectItem = (index) => {
    setSelectedItems((prev) => {
      const newSelected = [...prev];
      newSelected[index] = !newSelected[index];
      return newSelected;
    });
    setSelectAll(selectedItems.every((item, i) => (i === index ? !item : item)));
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setSelectedItems(new Array(cart.length).fill(newSelectAll));
  };

  const getTotal = () => {
    return cart.reduce(
      (sum, item, index) =>
        selectedItems[index]
          ? sum + (item.productVariant?.productID?.price || 0) * (item.soluong || 1)
          : sum,
      0
    );
  };

  const navigateToCheckout = () => {
    if (cart.length === 0 || !selectedItems.some((item) => item)) {
      showModal('error', 'Thông báo', 'Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
      return;
    }
    const selectedProducts = cart
      .filter((_, index) => selectedItems[index])
      .map((item) => ({
        cartId: item._id,
        productId: item.productVariant?.productID?._id,
        name: item.productVariant?.productID?.name,
        color: item.productVariant?.color,
        size: item.productVariant?.size,
        price: item.productVariant?.productID?.price,
        quantity: item.soluong,
        image:
          products.find((p) => p.ProductID === item.productVariant?.productID?._id)?.Image ||
          'https://via.placeholder.com/120',
      }));

    router.push({
      pathname: '../address',
      params: { selectedProducts: JSON.stringify(selectedProducts) },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#ee4d2d" />
      </View>
    );
  }

if (error && !user?._id) {
  return (
    <View style={styles.authContainer}>
      <Image source={emptyImg} style={styles.emptyImage} resizeMode="contain" />
      <Text style={styles.authTitle}>Bạn chưa đăng nhập</Text>
      <Text style={styles.authDesc}>Vui lòng đăng nhập để quản lý giỏ hàng và đặt hàng nhé!</Text>
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
    <View style={styles.root}>
      <Text style={styles.title}>Giỏ hàng</Text>
      {cart.length > 0 && (
        <View style={styles.selectAllContainer}>
          <TouchableOpacity
            style={[styles.checkbox, selectAll ? styles.checkboxSelected : null]}
            onPress={toggleSelectAll}
          >
            {selectAll && <Text style={styles.checkboxText}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.selectAllText}>Chọn tất cả</Text>
        </View>
      )}
      {cart.length === 0 ? (
        <Text style={styles.emptyText}>Giỏ hàng trống</Text>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 90 }}>
          {cart.map((item, idx) => {
            const productId = item.productVariant?.productID?._id;
            const productInList = products.find((p) => p.ProductID === productId);
            const imgUrl = productInList?.Image || 'https://via.placeholder.com/120';

            return (
              <Swipeable
                key={item._id}
                renderRightActions={() => (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeFromCart(item._id)}
                  >
                    <Trash2 color="white" size={22} />
                  </TouchableOpacity>
                )}
              >
                <View style={styles.card}>
                  <TouchableOpacity
                    style={[styles.checkbox, selectedItems[idx] ? styles.checkboxSelected : null]}
                    onPress={() => toggleSelectItem(idx)}
                  >
                    {selectedItems[idx] && <Text style={styles.checkboxText}>✓</Text>}
                  </TouchableOpacity>
                  <Image source={{ uri: imgUrl }} style={styles.image} />
                  <View style={styles.info}>
                    <TouchableOpacity onPress={() => navigateToProductDetail(productId)}>
                      <Text style={styles.name} numberOfLines={2}>
                        {item.productVariant?.productID?.name || 'Tên sản phẩm'}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.variant}>
                      Màu: <Text style={styles.bold}>{item.productVariant?.color}</Text> | Size:{' '}
                      <Text style={styles.bold}>{item.productVariant?.size}</Text>
                    </Text>
                    <View style={styles.rowBetween}>
                      <Text style={styles.price}>
                        {(item.productVariant?.productID?.price || 0).toLocaleString('vi-VN')}đ
                      </Text>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateQuantity(item._id, -1)}
                        >
                          <Text style={styles.quantityText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{item.soluong}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateQuantity(item._id, 1)}
                        >
                          <Text style={styles.quantityText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </Swipeable>
            );
          })}
          <View style={styles.bottomSection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Tổng tiền</Text>
              <Text style={styles.summaryValue}>{getTotal().toLocaleString('vi-VN')}đ</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={navigateToCheckout}>
              <Text style={styles.checkoutButtonText}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  authContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f7f7f8',
  paddingHorizontal: 24,
  paddingBottom: 50,
},
emptyImage: {
  width: 220,
  height: 220,
  marginBottom: 26,
},
authTitle: {
  fontSize: 22,
  fontWeight: '700',
  color: '#22223b',
  textAlign: 'center',
  marginBottom: 8,
  letterSpacing: 0.2,
},
authDesc: {
  fontSize: 15,
  color: '#60606e',
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
  backgroundColor: '#ee4d2d',
},
backBtn: {
  backgroundColor: '#2d5fee',
},
btnText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 16,
  marginLeft: 8,
  letterSpacing: 0.2,
},

  root: {
    flex: 1,
    backgroundColor: '#f7f7f8',
    paddingTop: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f7f8',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#222',
    marginLeft: 14,
    marginBottom: 10,
    marginTop: 14,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 18,
    marginBottom: 10,
  },
  selectAllText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
    marginLeft: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    padding: 14,
    shadowColor: '#222',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#888',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#ee4d2d',
    borderColor: '#ee4d2d',
  },
  checkboxText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
    marginBottom: 2,
  },
  variant: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  bold: { fontWeight: '700', color: '#111' },
  price: {
    fontSize: 16,
    color: '#ee4d2d',
    fontWeight: '700',
    marginBottom: 0,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 22,
    color: '#222',
    fontWeight: '600',
  },
  quantity: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  deleteButton: {
    backgroundColor: '#ee4d2d',
    justifyContent: 'center',
    alignItems: 'center',
    width: 54,
    height: 90,
    borderRadius: 12,
    marginVertical: 6,
  },
  bottomSection: {
    marginTop: 8,
    marginBottom: 14,
    paddingHorizontal: 8,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryValue: {
    fontSize: 18,
    color: '#ee4d2d',
    fontWeight: '700',
  },
  checkoutButton: {
    backgroundColor: '#ee4d2d',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#ee4d2d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 3,
    elevation: 2,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: { fontSize: 16, color: '#c0392b', textAlign: 'center', marginTop: 20 },
});

export default Cart;