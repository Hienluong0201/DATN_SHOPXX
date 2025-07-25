import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Checkout = () => {
  const {
    orderId,
    selectedProducts,
    selectedAddress,
    shippingFee,
    voucherDiscount,
    productsTotal,
    totalAmount
  } = useLocalSearchParams();

  const products = selectedProducts ? JSON.parse(selectedProducts) : [];
  const address = selectedAddress ? JSON.parse(selectedAddress) : null;
  const shipping = shippingFee ? Number(shippingFee) : 0;
  const discount = voucherDiscount ? Number(voucherDiscount) : 0;
  const subtotal = productsTotal ? Number(productsTotal) : products.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const total = totalAmount ? Number(totalAmount) : subtotal + shipping - discount;

  // Animation
  const scaleAnim = new Animated.Value(0);
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleViewOrders = () => {
    router.replace('./orders');
  };

  const handleContinueShopping = () => {
    router.push('/home');
  };

  if (!orderId || products.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Không tìm thấy thông tin đơn hàng.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Thành công */}
      <Animated.View style={[styles.successContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons name="checkmark-circle" size={80} color="#27ae60" />
        <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
        <Text style={styles.successMessage}>
          Đơn hàng của bạn đã được đặt. Cảm ơn bạn đã mua sắm!
        </Text>
      </Animated.View>

      {/* Địa chỉ */}
      {address && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>{address.name} | {address.sdt}</Text>
            <Text style={styles.addressText}>{address.address}</Text>
          </View>
        </View>
      )}

      {/* Sản phẩm */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
        {products.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Image
              source={{ uri: item.image || 'https://via.placeholder.com/60x60?text=Product' }}
              style={styles.itemImage}
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name || 'Tên sản phẩm'}</Text>
              <Text style={styles.itemDetailsText}>
                Màu: {item.color || 'N/A'} | Size: {item.size || 'N/A'} | Số lượng: {item.quantity || 1}
              </Text>
              <Text style={styles.itemPrice}>
                {(item.price * item.quantity || 0).toLocaleString('vi-VN')}đ
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Tổng kết chi tiết */}
      <View style={styles.summary}>
        <View style={styles.rowJustify}>
          <Text style={styles.summaryLabel}>Tạm tính:</Text>
          <Text style={styles.summaryValue}>{subtotal.toLocaleString('vi-VN')}đ</Text>
        </View>
        {discount > 0 && (
          <View style={styles.rowJustify}>
            <Text style={[styles.summaryLabel, { color: '#059669' }]}>Giảm giá voucher:</Text>
            <Text style={[styles.summaryValue, { color: '#b91c1c' }]}>- {discount.toLocaleString('vi-VN')}đ</Text>
          </View>
        )}
        <View style={styles.rowJustify}>
          <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
          <Text style={styles.summaryValue}>{shipping.toLocaleString('vi-VN')}đ</Text>
        </View>
        <View style={[styles.rowJustify, { marginTop: 8 }]}>
          <Text style={styles.summaryTotal}>Tổng cộng:</Text>
          <Text style={styles.summaryTotal}>{total.toLocaleString('vi-VN')}đ</Text>
        </View>
      </View>

      {/* Nút */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleViewOrders}>
          <Text style={styles.buttonText}>Xem đơn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleContinueShopping}>
          <Text style={styles.buttonText}>Tiếp tục mua sắm</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa',marginTop : 40 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  successContainer: { alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginTop: 10 },
  successMessage: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 5, paddingHorizontal: 20 },
  card: { backgroundColor: '#fff', padding: 15, marginBottom: 15, borderRadius: 15, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2c2c2c', marginBottom: 10 },
  addressContainer: { padding: 10, backgroundColor: '#fafafa', borderRadius: 10 },
  addressText: { fontSize: 14, color: '#2c2c2c', marginBottom: 5 },
  orderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemImage: { width: 60, height: 60, borderRadius: 10, marginRight: 15 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  itemDetailsText: { fontSize: 14, color: '#666', marginTop: 5 },
  itemPrice: { fontSize: 14, color: '#e74c3c', fontWeight: '700', marginTop: 5 },
  summary: { padding: 15, backgroundColor: '#fff', borderRadius: 15, elevation: 5, marginBottom: 20 },
  summaryLabel: { fontSize: 15, color: '#333', fontWeight: '600' },
  summaryValue: { fontSize: 15, color: '#333', fontWeight: '700' },
  summaryTotal: { fontSize: 18, fontWeight: 'bold', color: '#c0392b' },
  rowJustify: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  primaryButton: { backgroundColor: '#27ae60', padding: 15, borderRadius: 12, flex: 1, marginRight: 10, alignItems: 'center' },
  secondaryButton: { backgroundColor: '#3498db', padding: 15, borderRadius: 12, flex: 1, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorText: { fontSize: 16, color: '#e74c3c', textAlign: 'center', marginTop: 20 },
});

export default Checkout;
