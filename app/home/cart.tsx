import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useAuth } from '../../store/useAuth';
import AxiosInstance from '../../axiosInstance/AxiosInstance';
import { router } from 'expo-router';

const Cart = () => {
  const { user, loadUser } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?._id) {
      fetchCart();
    } else {
      setCart([]);
      setLoading(false);
      setError('Bạn cần đăng nhập để xem giỏ hàng!');
    }
  }, [user]);

  const fetchCart = async () => {
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
  };

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
    if (cartItem.quantity + value < 1) return;
    try {
      await AxiosInstance().patch(`/cart/${cartId}`, { quantity: cartItem.quantity + value });
      setCart(prev =>
        prev.map(item =>
          item._id === cartId ? { ...item, quantity: item.quantity + value } : item
        )
      );
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể cập nhật số lượng.');
    }
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.productID?.price || 0) * (item.quantity || 1), 0);
  };

  const navigateToCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng trống!');
      return;
    }
    router.push('../address');
  };

  // Giao diện loading
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#d4af37" />
      </View>
    );
  }

  // Giao diện lỗi
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Giỏ hàng</Text>
      {cart.length === 0 ? (
        <Text style={styles.emptyText}>Giỏ hàng trống</Text>
      ) : (
        <>
          {cart.map((item) => (
            <Swipeable
              key={item._id}
              renderRightActions={() => (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeFromCart(item._id)}
                >
                  <Text style={styles.deleteText}>Xóa</Text>
                </TouchableOpacity>
              )}
            >
              <View style={styles.card}>
                <Image
                  source={{ uri: item.productID?.imageURL?.[0] || 'https://via.placeholder.com/80' }}
                  style={styles.image}
                />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.productID?.name || 'Tên sản phẩm'}</Text>
                  <Text style={styles.price}>
                    {(item.productID?.price || 0).toLocaleString('vi-VN')}đ x {item.quantity}
                  </Text>
                </View>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item._id, -1)}
                  >
                    <Text style={styles.quantityText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item._id, 1)}
                  >
                    <Text style={styles.quantityText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Swipeable>
          ))}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Thành tiền</Text>
              <Text style={styles.summaryValue}>{getTotal().toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={navigateToCheckout}>
            <Text style={styles.checkoutButtonText}>Xác nhận thanh toán</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f0f2f5' },
  title: { fontSize: 24, fontWeight: '800', margin: 10, color: '#1a1a1a' },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, marginBottom: 10, borderRadius: 15, elevation: 5, alignItems: 'center' },
  image: { width: 80, height: 80, resizeMode: 'cover', borderRadius: 10 },
  info: { marginLeft: 10, flex: 1, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  price: { fontSize: 14, color: '#c0392b', fontWeight: '700' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { backgroundColor: '#e0e0e0', padding: 5, borderRadius: 10, marginHorizontal: 5 },
  quantityText: { fontSize: 16, color: '#333', fontWeight: '600' },
  quantity: { fontSize: 16, marginHorizontal: 10, color: '#333' },
  summary: { backgroundColor: '#fff', padding: 10, borderRadius: 15, marginBottom: 10, elevation: 5 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  summaryText: { fontSize: 16, color: '#2c2c2c' },
  summaryValue: { fontSize: 16, color: '#2c2c2c', fontWeight: '600' },
  checkoutButton: { backgroundColor: '#d4af37', padding: 12, borderRadius: 12, alignItems: 'center', margin: 10 },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyText: { fontSize: 16, color: '#2c2c2c', textAlign: 'center', marginTop: 20 },
  errorText: { fontSize: 16, color: '#c0392b', textAlign: 'center', marginTop: 20 },
  deleteButton: { backgroundColor: '#ff4444', justifyContent: 'center', alignItems: 'center', width: 70, height: '100%', borderRadius: 10 },
  deleteText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default Cart;
