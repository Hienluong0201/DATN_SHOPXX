import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, ScrollView, Linking } from 'react-native';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useAuth } from '../store/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import CustomModal from './components/CustomModal';

const COUNTDOWN_MINUTES = 15;

const Payment = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [now, setNow] = useState(Date.now());

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'error', // 'success' | 'error' | 'warning'
    title: '',
    message: ''
  });

  const showModal = (type, title, message) => {
    setModalConfig({ type, title, message });
    setModalVisible(true);
  };

  // Cập nhật now mỗi giây (giúp tất cả countdown đều chạy)
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Lấy các đơn ZaloPay pending của user
  useEffect(() => {
    if (!user?._id) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await AxiosInstance().get(`/order/unpaid-zalopay`);
        // Chỉ lấy đơn của user hiện tại
        const unpaidOrders = (res.orders || []).filter(o => o.userID === user._id);
        unpaidOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(unpaidOrders);
        if (unpaidOrders.length === 0) setMsg('Bạn không có đơn hàng ZaloPay nào cần thanh toán.');
        setLoading(false);
      } catch (err) {
        setMsg('Không thể lấy dữ liệu đơn hàng.');
        setOrders([]);
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // Hàm Thanh toán lại Zalopay
  const handlePay = async (order) => {
    try {
      const resp = await AxiosInstance().post('/order/zalopay', {
        amount: order.finalTotal,
        orderId: order._id
      });

      if (resp?.order_url) {
        const supported = await Linking.canOpenURL(resp.order_url);
        if (supported) {
          await Linking.openURL(resp.order_url);
          showModal('success', 'Đã chuyển đến ZaloPay', 'Hãy hoàn tất thanh toán trong app ZaloPay.');
        } else {
          showModal('error', 'Không mở được ZaloPay', 'Hãy kiểm tra lại hoặc cài đặt app ZaloPay!');
        }
      } else {
        showModal('error', 'Lỗi', 'Không lấy được link thanh toán ZaloPay.');
      }
    } catch (e) {
      showModal('error', 'Lỗi', e.response?.data?.error || e.message || 'Không thể tạo lại thanh toán ZaloPay!');
    }
  };

  // Hàm lấy thời gian còn lại cho từng order
  const getTimeLeft = (createdAt) => {
    const created = new Date(createdAt).getTime();
    const expireAt = created + COUNTDOWN_MINUTES * 60 * 1000;
    const left = Math.max(0, Math.floor((expireAt - now) / 1000));
    return left;
  };

  // Hàm chuyển sang chi tiết đơn hàng
  const navigateToOrderDetail = (orderId) => {
    router.push({ pathname: './orderDetail', params: { orderId: orderId.toString() } });
  };

  return (
    <View style={styles.container}>
      {/* Nút Back */}
      <View style={styles.backButtonWrap}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#8B5A2B" />
        </TouchableOpacity>
      </View>
      <Text style={styles.pageTitle}>Đơn hàng chờ thanh toán</Text>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator color="#8B5A2B" size="large" />
          <Text style={styles.description}>Đang lấy đơn hàng...</Text>
        </View>
      ) : orders.length === 0 ? (
        <Text style={styles.noOrder}>{msg}</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
          {orders.map((order) => {
            const timeLeft = getTimeLeft(order.createdAt);
            const m = Math.floor(timeLeft / 60);
            const s = (timeLeft % 60).toString().padStart(2, "0");

            return (
              <TouchableOpacity
                key={order._id}
                style={styles.orderCard}
                onPress={() => navigateToOrderDetail(order._id)}
                activeOpacity={0.85}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>Đơn #{order._id.slice(-6).toUpperCase()}</Text>
                  <View style={styles.badgePending}>
                    <Ionicons name="time-outline" size={15} color="#FBC02D" style={{marginRight: 4}} />
                    <Text style={{color: '#FBC02D', fontWeight: 'bold'}}>Chờ thanh toán</Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={17} color="#666" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{order.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={17} color="#666" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{order.sdt}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={17} color="#666" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{order.shippingAddress}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="cash-outline" size={17} color="#666" style={styles.infoIcon} />
                  <Text style={styles.infoText}>
                    <Text style={{color: "#C90000", fontWeight: "bold"}}>
                      {order.finalTotal?.toLocaleString()} đ
                    </Text>
                  </Text>
                </View>
                <View style={styles.countdownRow}>
                  <Ionicons name="alarm-outline" size={20} color="#D32F2F" style={styles.infoIcon} />
                  {timeLeft > 0 ? (
                    <Text style={styles.countdownText}>
                      Thời gian còn lại: <Text style={{color:'#D32F2F'}}>{m}:{s}</Text>
                    </Text>
                  ) : (
                    <Text style={styles.timeupText}>Đã hết thời gian thanh toán!</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.payButton, timeLeft <= 0 && styles.payButtonDisabled]}
                  onPress={() => handlePay(order)}
                  disabled={timeLeft <= 0}
                  activeOpacity={0.85}
                >
                  <Ionicons name="logo-usd" size={18} color="#fff" />
                  <Text style={styles.payButtonText}>Thanh toán ngay</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
      <CustomModal
        isVisible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 45, paddingHorizontal: 8 },
  backButtonWrap: { position: 'absolute', top: 60, left: 16, zIndex: 100 },
  pageTitle: { textAlign: 'center', fontSize: 23, fontWeight: 'bold', color: '#8B5A2B', marginBottom: 18, marginTop: 10 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#B57A4A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#EED8C2',
  },
  orderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  orderId: { fontWeight: 'bold', fontSize: 16, color: '#8B5A2B' },
  badgePending: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFDE7', borderRadius: 12, paddingVertical: 3, paddingHorizontal: 9
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  infoIcon: { marginRight: 7 },
  infoText: { color: '#444', fontSize: 15 },
  countdownRow: { flexDirection: 'row', alignItems: 'center', marginTop: 7, marginBottom: 15 },
  countdownText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 16, marginLeft: 4 },
  timeupText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 15, marginLeft: 4 },
  payButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#8B5A2B', paddingVertical: 11, borderRadius: 18, marginTop: 10
  },
  payButtonDisabled: { backgroundColor: '#ccc' },
  payButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
  description: { fontSize: 15, color: '#888', textAlign: 'center', marginTop: 18 },
  noOrder: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 70 },
});

export default Payment;
