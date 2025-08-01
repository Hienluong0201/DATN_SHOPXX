import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useAuth } from '../store/useAuth';

const TAB_OPTIONS = [
  'Tất cả',
  'Chờ xử lý',
  'Đã thanh toán',
  'Đang giao',
  'Đã giao',
  'Đã hủy',
];
const getPaymentLabel = (method : any) => {
  if (!method) return 'Không rõ';
  const lower = method.toLowerCase();
  if (lower.includes('credit')) return 'Thẻ tín dụng';
  if (lower.includes('zalo')) return 'ZaloPay';
  if (lower.includes('momo')) return 'Momo';
  if (lower.includes('vnpay')) return 'VNPay';
  if (lower.includes('bank')) return 'Chuyển khoản ngân hàng';
  if (lower.includes('cash')) return 'Tiền mặt';
  return method;
};

const getPaymentIcon = (method : any) => {
  if (!method) return 'help-circle-outline';
  const lower = method.toLowerCase();
  if (lower.includes('credit')) return 'card-outline';
  if (lower.includes('zalo')) return 'logo-usd'; // Nếu có icon Zalo thì thay
  if (lower.includes('momo')) return 'logo-usd';
  if (lower.includes('bank')) return 'swap-horizontal-outline';
  if (lower.includes('cash')) return 'cash-outline';
  return 'help-circle-outline';
};
const Orders = () => {
  const { user, loadUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [refreshing, setRefreshing] = useState(false);

  // Tách fetchOrders ra cho dùng lại được
  const fetchOrders = useCallback(async () => {
    if (!user?._id) return;
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
      setRefreshing(false); // stop refresh
    }
  }, [user]);

  // useEffect load dữ liệu khi user đã có
  useEffect(() => {
    if (!user?._id) {
      loadUser();
      return;
    }
    fetchOrders();
  }, [user, loadUser, fetchOrders]);

  const navigateToOrderDetail = (orderId) => {
    router.push({ pathname: './orderDetail', params: { orderId: orderId.toString() } });
  };

  const goBack = () => {
    router.push({ pathname: './home' });
  };

  // Lọc đơn hàng theo tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'Tất cả') return true;
    if (activeTab === 'Chờ xử lý') return order.orderStatus === 'pending';
    if (activeTab === 'Đã thanh toán') return order.orderStatus === 'paid';
    if (activeTab === 'Đang giao') return order.orderStatus === 'shipped';
    if (activeTab === 'Đã giao') return order.orderStatus === 'delivered';
    if (activeTab === 'Đã hủy') return order.orderStatus === 'cancelled';
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

  // Badge và màu cho từng trạng thái
  const getStatusProps = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Chờ xử lý', color: '#FBC02D', bg: '#FFFDE7', icon: 'time-outline' };
      case 'paid':
        return { label: 'Đã thanh toán', color: '#28A745', bg: '#E8F5E9', icon: 'cash-outline' };
      case 'shipped':
        return { label: 'Đang giao', color: '#039BE5', bg: '#E3F2FD', icon: 'car-outline' };
      case 'delivered':
        return { label: 'Đã giao', color: '#8B5A2B', bg: '#EFEBE9', icon: 'checkmark-done' };
      case 'cancelled':
        return { label: 'Đã hủy', color: '#D32F2F', bg: '#FFEBEE', icon: 'close-circle' };
      default:
        return { label: status, color: '#888', bg: '#eee', icon: 'help-circle' };
    }
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchOrders();
          }}
          colors={['#8B5A2B']}
          tintColor="#8B5A2B"
        />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Đơn Hàng Của Bạn</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 4, marginBottom: 12 }}
      >
        {TAB_OPTIONS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
              { minWidth: 110, marginRight: 8 }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
        </View>
      ) : (
        filteredOrders.map((order) => {
          const statusProps = getStatusProps(order.orderStatus);
          return (
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
                  { backgroundColor: statusProps.bg }
                ]}>
                  <Ionicons
                    name={statusProps.icon}
                    size={16}
                    color={statusProps.color}
                    style={styles.statusIcon}
                  />
                  <Text style={[styles.statusText, { color: statusProps.color }]}>
                    {statusProps.label}
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
                    name={getPaymentIcon(order.paymentID?.paymentMethod)}
                    size={18}
                    color="#666"
                  />
                  <Text style={styles.detailText}>
                    Thanh toán: {getPaymentLabel(order.paymentID?.paymentMethod)}
                  </Text>
                </View>
              </View>
              <View style={styles.footer}>
                <TouchableOpacity style={styles.detailButton} onPress={() => navigateToOrderDetail(order._id)}>
                  <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', padding: 16,marginTop : 40 },
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
  tab: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    marginBottom: 2,
  },
  activeTab: {
    backgroundColor: '#8B5A2B',
    borderColor: '#8B5A2B',
    borderWidth: 1.5,
  },
  tabText: { fontSize: 14, color: '#666', fontWeight: '600' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
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