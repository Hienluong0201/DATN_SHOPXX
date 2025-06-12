import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useProducts } from '../store/useProducts'; // Import context

const OrderDetail = () => {
  const { orderId } = useLocalSearchParams();
  const { getProductById } = useProducts(); // Lấy getProductById từ context
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await AxiosInstance().get(`/orderdetail/order/${orderId}`);
        if (Array.isArray(response)) {
          // Kiểm tra _id hợp lệ
          const validOrderDetails = response.filter(detail => detail._id);
          if (validOrderDetails.length !== response.length) {
            console.warn('Some order details are missing _id:', response);
          }
          // Lấy Name và Image từ ProductContext
          const enrichedDetails = validOrderDetails.map(detail => {
            const product = getProductById(detail.variantID.productID) || {};
            return {
              ...detail,
              Name: product.Name || 'Sản phẩm không xác định',
              Image: product.Image || 'https://via.placeholder.com/80',
            };
          });
          setOrderDetails(enrichedDetails);
          setError(null);
        } else {
          throw new Error('Dữ liệu chi tiết đơn hàng không hợp lệ');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.';
        setError(errorMessage);
        setOrderDetails([]);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) {
      fetchOrderDetails();
    } else {
      setError('Không tìm thấy mã đơn hàng');
      setLoading(false);
    }
  }, [orderId, getProductById]);

  const goBack = () => {
    router.back();
  };

  // Hàm định dạng ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Hàm định dạng giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c2c2c" />
        <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchOrderDetails()}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.title}>Chi tiết đơn hàng</Text>
        <View style={styles.placeholder} />
      </View>
      {orderDetails.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Không có chi tiết đơn hàng</Text>
        </View>
      ) : (
        <View>
          {/* Hiển thị ngày đặt và mã đơn hàng một lần */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Ngày đặt hàng</Text>
            <Text style={styles.infoValue}>{formatDate(orderDetails[0].createdAt)}</Text>
            <Text style={styles.infoLabel}>Mã đơn hàng</Text>
            <Text style={styles.infoValue}>{orderDetails[0].orderID}</Text>
          </View>
          {/* Danh sách sản phẩm */}
          {orderDetails.map((detail) => (
            <View key={detail._id} style={styles.productCard}>
              <Image
                source={{ uri: detail.Image }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{detail.Name}</Text>
                <Text style={styles.productPrice}>{formatPrice(detail.price)}</Text>
                <Text style={styles.productDetail}>Kích thước: {detail.variantID.size}</Text>
                <Text style={styles.productDetail}>Màu sắc: {detail.variantID.color}</Text>
                <Text style={styles.productDetail}>Số lượng: {detail.quantity}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { padding: 5 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', flex: 1, textAlign: 'center' },
  placeholder: { width: 24 },
  productCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3 },
  productImage: { width: 80, height: 80, resizeMode: 'cover', borderRadius: 10 },
  productInfo: { marginLeft: 15, flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  productPrice: { fontSize: 14, color: '#c0392b', fontWeight: '700', marginTop: 5 },
  productDetail: { fontSize: 14, color: '#666', marginTop: 5 },
  infoCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3 },
  infoLabel: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  infoValue: { fontSize: 16, color: '#666', marginBottom: 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' },
  errorText: { fontSize: 16, color: '#D32F2F', textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: '#2c2c2c', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 15 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 12 },
});

export default OrderDetail;