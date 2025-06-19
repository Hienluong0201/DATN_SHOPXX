import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useProducts } from '../store/useProducts';

const PRIMARY = "#e4633b";

const OrderDetail = () => {
  const { orderId } = useLocalSearchParams();
  const { getProductById } = useProducts();
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        // Lấy chi tiết đơn + info đơn (nếu API cho)
        const [detailsRes, orderRes] = await Promise.all([
          AxiosInstance().get(`/orderdetail/order/${orderId}`),
          AxiosInstance().get(`/order/${orderId}`)
        ]);
        // Enrich sản phẩm
        const enrichedDetails = (Array.isArray(detailsRes) ? detailsRes : []).map(detail => {
          const product = getProductById(detail.variantID.productID) || {};
          let images = [];
          if (Array.isArray(product.Images) && product.Images.length > 0) images = product.Images;
          else if (Array.isArray(product.images) && product.images.length > 0) images = product.images;
          else if (product.Image) images = [product.Image];
          else images = ['https://via.placeholder.com/80'];
          return {
            ...detail,
            Name: product.Name || 'Sản phẩm không xác định',
            Images: images,
            Brand: product.Brand || "Không xác định",
            Category: product.CategoryID || "",
          };
        });
        setOrderDetails(enrichedDetails);
        setOrderInfo(orderRes.order || {});
        setError(null);
      } catch (err) {
        setError('Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.');
        setOrderDetails([]);
        setOrderInfo(null);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrderDetails();
    else {
      setError('Không tìm thấy mã đơn hàng');
      setLoading(false);
    }
  }, [orderId, getProductById]);

  const goBack = () => router.back();

  // Hàm định dạng ngày/giá tiền
  const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  const getStatusProps = (status) => {
    switch (status) {
      case 'pending': return { text: "Chờ xử lý", color: "#FBC02D", icon: "timer-sand" };
      case 'paid': return { text: "Đã thanh toán", color: "#28A745", icon: "credit-card-check" };
      case 'shipped': return { text: "Đang giao", color: "#039BE5", icon: "truck-delivery-outline" };
      case 'delivered': return { text: "Đã giao", color: "#8B5A2B", icon: "check-circle-outline" };
      case 'cancelled': return { text: "Đã hủy", color: "#D32F2F", icon: "close-circle-outline" };
      default: return { text: status, color: "#666", icon: "help" };
    }
  };

  const calcTotal = () => orderDetails.reduce((sum, d) => sum + (d.price * d.quantity), 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
      </View>
    );
  }
  if (error || !orderInfo) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="cart-outline" size={80} color="#ccc" />
        <Text style={styles.errorText}>{error || 'Lỗi dữ liệu'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={goBack}>
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusProps = getStatusProps(orderInfo.orderStatus);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Chi tiết đơn hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Status + info */}
      <View style={styles.statusCard}>
        <MaterialCommunityIcons name={statusProps.icon} size={30} color={statusProps.color} style={{ marginRight: 12 }} />
        <View>
          <Text style={[styles.statusText, { color: statusProps.color }]}>{statusProps.text}</Text>
          <Text style={{ color: "#888", fontSize: 13, marginTop: 3 }}>Ngày đặt: {formatDate(orderInfo.createdAt)}</Text>
        </View>
      </View>

      {/* Thông tin người nhận */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Khách nhận hàng</Text>
        <Text style={styles.infoValue}><Ionicons name="person" size={16} /> {orderInfo.name} | {orderInfo.sdt}</Text>
        <Text style={styles.infoValue}><Ionicons name="location" size={16} /> {orderInfo.shippingAddress}</Text>
        <Text style={styles.infoLabel}>Phương thức thanh toán</Text>
        <Text style={styles.infoValue}>{orderInfo.paymentID?.paymentMethod === 'Credit Card' ? 'Thẻ tín dụng' : 'Tiền mặt'}</Text>
      </View>

      {/* Danh sách sản phẩm */}
      <View style={styles.productList}>
        <Text style={styles.sectionTitle}>Sản phẩm ({orderDetails.length})</Text>
        {orderDetails.map((detail) => (
          <View key={detail._id} style={styles.productCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginRight: 8, flex: 0.8 }}>
              {detail.Images.map((img, idx) => (
                <Image key={idx} source={{ uri: img }} style={styles.productImage} />
              ))}
            </ScrollView>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{detail.Name}</Text>
              <Text style={styles.productDetail}>Mã SP: <Text style={styles.attrValue}>{detail.variantID.productID}</Text></Text>
              <Text style={styles.productDetail}>Thương hiệu: <Text style={styles.attrValue}>{detail.Brand}</Text></Text>
              <Text style={styles.productDetail}>Kích thước: <Text style={styles.attrValue}>{detail.variantID.size}</Text></Text>
              <Text style={styles.productDetail}>Màu sắc: <Text style={styles.attrValue}>{detail.variantID.color}</Text></Text>
              <Text style={styles.productDetail}>Số lượng: <Text style={styles.attrValue}>{detail.quantity}</Text></Text>
              <Text style={styles.productDetail}>Giá: <Text style={styles.productPrice}>{formatPrice(detail.price)}</Text></Text>
            </View>
          </View>
        ))}
      </View>

      {/* Tổng tiền + mã đơn hàng */}
      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Tổng cộng</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Mã đơn hàng:</Text>
          <Text style={styles.value}>{orderInfo._id}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Tổng tiền hàng:</Text>
          <Text style={[styles.value, { color: PRIMARY, fontWeight: 'bold', fontSize: 18 }]}>{formatPrice(calcTotal())}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Thanh toán:</Text>
          <Text style={styles.value}>{orderInfo.paymentID?.paymentMethod === 'Credit Card' ? 'Thẻ tín dụng' : 'Tiền mặt'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.contactBtn} onPress={() => Alert.alert("Liên hệ shop", "SĐT: 0123456789")}>
        <Ionicons name="call" size={20} color="#fff" style={{ marginRight: 7 }} />
        <Text style={styles.contactText}>Liên hệ shop</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', marginTop: 30 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: "#8B5A2B", paddingVertical: 16, paddingHorizontal: 14, marginBottom: 10,
    elevation: 3,
  },
  backButton: { padding: 4 },
  title: { fontSize: 21, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
  statusCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 14, marginTop: 14, borderRadius: 14, padding: 14, elevation: 2
  },
  statusText: { fontWeight: '700', fontSize: 18 },
  infoCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginHorizontal: 14, marginTop: 14, elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#e4633b', marginBottom: 6 },
  infoValue: { fontSize: 15, color: '#222', marginBottom: 4, marginLeft: 4 },
  productList: { marginTop: 18, marginHorizontal: 10 },
  productCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 13, marginBottom: 14,
    padding: 10, alignItems: 'center', elevation: 2,
  },
  productImage: { width: 75, height: 75, borderRadius: 8, marginRight: 8, backgroundColor: "#f3f3f3" },
  productInfo: { flex: 1, minWidth: 120 },
  productName: { fontSize: 15, fontWeight: 'bold', color: '#8B5A2B', marginBottom: 2 },
  productDetail: { fontSize: 14, color: '#555', marginTop: 2 },
  productPrice: { color: '#e4633b', fontWeight: 'bold' },
  attrValue: { color: '#111', fontWeight: '600' },
  summaryCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 15, marginHorizontal: 14, marginTop: 16, elevation: 2,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  label: { color: '#444', fontSize: 14 },
  value: { color: '#333', fontSize: 14, fontWeight: 'bold' },
  contactBtn: {
    backgroundColor: "#e4633b", marginHorizontal: 40, marginTop: 20, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', borderRadius: 20, paddingVertical: 12, elevation: 3
  },
  contactText: { color: "#fff", fontSize: 16, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  errorText: { fontSize: 16, color: '#D32F2F', textAlign: 'center', marginBottom: 20 },
  retryButton: {
    backgroundColor: '#e4633b', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginTop: 14,
  },
  retryButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 12 },
});

export default OrderDetail;
