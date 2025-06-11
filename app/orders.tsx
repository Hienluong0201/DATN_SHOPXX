import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useAuth } from '../store/useAuth';

const Orders = () => {
  const { user, loadUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Tất cả');

  useEffect(() => {
    if (!user?._id) {
      loadUser();
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await AxiosInstance().get(`/order/user/${user._id}`);
        setOrders(response || []);
        setError(null);
      } catch (err) {
        setError('Không thể tải đơn hàng. Vui lòng thử lại sau.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const navigateToOrderDetail = (orderId) => {
    router.push({ pathname: './orderDetail', params: { orderId: orderId.toString() } });
  };

  const goBack = () => {
    router.back();
  };

  // Lọc đơn hàng theo tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'Tất cả') return true;
    if (activeTab === 'Hoàn thành') return order.orderStatus === 'Paid';
    if (activeTab === 'Đã hủy') return order.orderStatus === 'Cancelled';
    return false;
  });

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

  // Rút gọn mã đơn hàng
  const shortenOrderId = (id) => {
    return id.slice(0, 8) + '...';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5A2B" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadUser()}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Đơn Hàng Của Bạn</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.tabContainer}>
        {['Tất cả', 'Hoàn thành', 'Đã hủy'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
        </View>
      ) : (
        filteredOrders.map((order) => (
          <TouchableOpacity
            key={order._id}
            style={styles.orderCard}
            onPress={() => navigateToOrderDetail(order._id)}
            activeOpacity={0.8}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Mã: #{shortenOrderId(order._id)}</Text>
              <View style={[
                styles.statusBadge,
                order.orderStatus === 'Paid' ? styles.successBadge : styles.cancelledBadge
              ]}>
                <Ionicons
                  name={order.orderStatus === 'Paid' ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={order.orderStatus === 'Paid' ? '#28A745' : '#DC3545'}
                  style={styles.statusIcon}
                />
                <Text style={styles.statusText}>
                  {order.orderStatus === 'Paid' ? 'Hoàn thành' : 'Đã hủy'}
                </Text>
              </View>
            </View>
            <View style={styles.orderDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="person-outline" size={18} color="#666" />
                <Text style={styles.detailText}>Người nhận: {order.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={18} color="#666" />
                <Text style={styles.detailText}>Số điện thoại: {order.sdt}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={18} color="#666" />
                <Text style={styles.detailText}>Địa chỉ: {order.shippingAddress}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text style={styles.detailText}>Ngày đặt: {formatDate(order.orderDate)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons
                  name={order.paymentID.paymentMethod === 'Credit Card' ? 'card-outline' : 'cash-outline'}
                  size={18}
                  color="#666"
                />
                <Text style={styles.detailText}>
                  Thanh toán: {order.paymentID.paymentMethod === 'Credit Card' ? 'Thẻ tín dụng' : 'Tiền mặt'}
                </Text>
              </View>
            </View>
            <View style={styles.footer}>
              <TouchableOpacity style={styles.detailButton} onPress={() => navigateToOrderDetail(order._id)}>
                <Text style={styles.detailButtonText}>Xem chi tiết</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f7f7' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#8B5A2B',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: { padding: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', flex: 1, textAlign: 'center' },
  placeholder: { width: 40 },
  tabContainer: { flexDirection: 'row', marginBottom: 16 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeTab: { backgroundColor: '#8B5A2B' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '600' },
  activeTabText: { color: '#ffffff', fontWeight: 'bold' },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16 },
  successBadge: { backgroundColor: '#E8F5E9' },
  cancelledBadge: { backgroundColor: '#FFEBEE' },
  statusIcon: { marginRight: 4 },
  statusText: { fontSize: 12, fontWeight: '600', color: '#333' },
  orderDetails: { marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailText: { fontSize: 14, color: '#333', marginLeft: 8, flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
  detailButton: {
    backgroundColor: '#8B5A2B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  detailButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 12 },
  errorText: { fontSize: 16, color: '#D32F2F', textAlign: 'center', marginTop: 20 },
  retryButton: {
    backgroundColor: '#8B5A2B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'center',
  },
  retryButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
});

export default Orders;