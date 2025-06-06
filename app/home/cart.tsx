import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Trash2 } from 'lucide-react-native'; // Sử dụng icon "thùng rác" hiện đại
import { useAuth } from '../../store/useAuth';
import { useProducts } from '../../store/useProducts';
import AxiosInstance from '../../axiosInstance/AxiosInstance';
import { router, useFocusEffect } from 'expo-router';

const Cart = () => {
  const { user } = useAuth();
  const { products } = useProducts();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const removeFromCart = async (cartId: string) => {
    Alert.alert(
      "Xác nhận",
      "Bạn muốn xóa sản phẩm này khỏi giỏ hàng?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await AxiosInstance().delete(`/cart/${cartId}`);
              setCart(prev => prev.filter(item => item._id !== cartId));
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm khỏi giỏ hàng.');
            }
          }
        }
      ]
    );
  };

  const updateQuantity = async (cartId: string, value: number) => {
    const cartItem = cart.find(item => item._id === cartId);
    if (!cartItem) return;
    if (cartItem.soluong + value < 1) return;
    try {
      await AxiosInstance().patch(`/cart/${cartId}`, { soluong: cartItem.soluong + value });
      setCart(prev =>
        prev.map(item =>
          item._id === cartId ? { ...item, soluong: item.soluong + value } : item
        )
      );
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể cập nhật số lượng.');
    }
  };

  const getTotal = () => {
    return cart.reduce(
      (sum, item) =>
        sum +
        (item.productVariant?.productID?.price || 0) * (item.soluong || 1),
      0
    );
  };

  const navigateToCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng trống!');
      return;
    }
    router.push('../address');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#ee4d2d" />
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
    <View style={styles.root}>
      <Text style={styles.title}>Giỏ hàng</Text>
      {cart.length === 0 ? (
        <Text style={styles.emptyText}>Giỏ hàng trống</Text>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 90 }}>
          {cart.map((item, idx) => {
            const productId = item.productVariant?.productID?._id;
            const productInList = products.find(p => p.ProductID === productId);
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
                  <Image
                    source={{ uri: imgUrl }}
                    style={styles.image}
                  />
                  <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={2}>
                      {item.productVariant?.productID?.name || 'Tên sản phẩm'}
                    </Text>
                    <Text style={styles.variant}>
                      Màu: <Text style={styles.bold}>{item.productVariant?.color}</Text> | Size: <Text style={styles.bold}>{item.productVariant?.size}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f7f7f8',
    paddingTop: 8,
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
