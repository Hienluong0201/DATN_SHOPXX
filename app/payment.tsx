import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, ScrollView, Linking, Modal, Pressable } from 'react-native';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useAuth } from '../store/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import CustomModal from './components/CustomModal';
import { useStripe } from '@stripe/stripe-react-native';
import { WebView } from 'react-native-webview';
import { RefreshControl } from 'react-native';
const COUNTDOWN_MINUTES = 15;

const Payment = () => {
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [now, setNow] = useState(Date.now());
  // Modal state cho thông báo
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'error', // 'success' | 'error' | 'warning'
    title: '',
    message: ''
  });
  // Modal state cho chọn phương thức thanh toán
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  // State cho Stripe payment
  const [stripeLoading, setStripeLoading] = useState(false);
  const [vnpayUrl, setVnpayUrl] = useState(null);
  const showModal = (type, title, message) => {
    setModalConfig({ type, title, message });
    setModalVisible(true);
    fetchOrders();
  };

const [refreshing, setRefreshing] = useState(false);

const fetchOrders = async () => {
  setLoading(true);
  try {
    const res = await AxiosInstance().get(`/order/unpaid-gateway-orders`);
    const unpaidOrders = (res.orders || []).filter(o => o.userID === user._id);
    unpaidOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setOrders(unpaidOrders);
    if (unpaidOrders.length === 0)
      setMsg('Bạn không có đơn hàng ZaloPay, Stripe hoặc VNPay nào cần thanh toán.');
  } catch (err) {
    setMsg('Không thể lấy dữ liệu đơn hàng.');
    setOrders([]);
  } finally {
    setLoading(false);
    setRefreshing(false); // reset sau khi kéo xong
  }
};

const onRefresh = () => {
  setRefreshing(true);
  fetchOrders();
};
  // Đổi phương thức thanh toán sang COD
  const handleChangeToCOD = async (order) => {
    try {
      const resp = await AxiosInstance().patch(`/order/${order._id}/change-method`, {
        method: 'Tiền mặt'
      });
      showModal('success', 'Đã chuyển sang tiền mặt', 'Bạn sẽ thanh toán khi nhận hàng.');
      // Reload lại danh sách đơn hàng
      setLoading(true);
      const res = await AxiosInstance().get(`/order/unpaid-gateway-orders`);
      const unpaidOrders = (res.orders || []).filter(o => o.userID === user._id);
      unpaidOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(unpaidOrders);
      setLoading(false);
    } catch (e) {
      showModal('error', 'Lỗi', e.response?.data?.message || 'Không thể chuyển sang COD');
    }
  };
  const handleRetryVNPAY = async () => {
  if (!selectedOrder) return;
  setPaymentModalVisible(false);
  try {
    const resp = await AxiosInstance().post(`/order/${selectedOrder._id}/retry-vnpay`, {
      bankCode: "NCB" // tạm hardcode, sau này có thể cho user chọn bank
    });

    if (resp.paymentUrl) {
      // 👉 mở Modal WebView với link trả về
      setVnpayUrl(resp.paymentUrl);
    } else {
      showModal('error', 'Lỗi', resp.message || 'Không tạo được link VNPAY.');
    }
  } catch (e) {
    showModal(
      'error',
      'Lỗi',
      e.response?.data?.message || 'Không thể tạo lại thanh toán VNPAY!'
    );
  }
};

  // Cập nhật now mỗi giây (giúp countdown chạy)
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Lấy các đơn pending của user
  useEffect(() => {
    if (!user?._id) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await AxiosInstance().get(`/order/unpaid-gateway-orders`);
        const unpaidOrders = (res.orders || []).filter(o => o.userID === user._id);
        unpaidOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(unpaidOrders);
        if (unpaidOrders.length === 0) setMsg('Bạn không có đơn hàng ZaloPay,  Stripe hoặc VNPay nào cần thanh toán.');
        setLoading(false);
      } catch (err) {
        setMsg('Không thể lấy dữ liệu đơn hàng.');
        setOrders([]);
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // Hàm mở modal chọn phương thức thanh toán
  const openPaymentModal = (order) => {
    setSelectedOrder(order);
    setPaymentModalVisible(true);
  };

  // Hàm xử lý thanh toán lại
  const handleRetryPayment = async (paymentMethod) => {
    if (!selectedOrder) return;
    setPaymentModalVisible(false); // Đóng modal chọn phương thức
    setStripeLoading(true); // Bắt đầu loading
    try {
      const resp = await AxiosInstance().post(`/order/${selectedOrder._id}/retry-payment`, {
        paymentMethod
      });

      if (paymentMethod === 'ZaloPay' && resp.paymentResponse?.order_url) {
        const supported = await Linking.canOpenURL(resp.paymentResponse.order_url);
        if (supported) {
          await Linking.openURL(resp.paymentResponse.order_url);
          showModal('success', 'Đã chuyển đến ZaloPay', 'Hãy hoàn tất thanh toán trong app ZaloPay.');
        } else {
          showModal('error', 'Không mở được ZaloPay', 'Hãy kiểm tra lại hoặc cài đặt app ZaloPay!');
        }
      } else if (paymentMethod === 'Stripe' && resp.paymentResponse?.clientSecret) {
        // Khởi tạo PaymentSheet cho Stripe
        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: resp.paymentResponse.clientSecret,
          merchantDisplayName: 'Your Merchant Name',
          allowsDelayedPaymentMethods: true,
        });
        if (initError) {
          showModal('error', 'Lỗi Stripe', initError.message);
          setStripeLoading(false);
          return;
        }
        // Mở PaymentSheet
        const { error: paymentError } = await presentPaymentSheet();
        if (paymentError) {
          showModal('error', 'Lỗi thanh toán', paymentError.message);
        } else {
          // Cập nhật trạng thái đơn hàng thành "paid"
          await AxiosInstance().put(`/order/${selectedOrder._id}`, {
            orderStatus: 'paid',
          });
          showModal('success', 'Thanh toán thành công', 'Đơn hàng đã được thanh toán qua Stripe.');
          // Reload danh sách đơn hàng
          setLoading(true);
          const res = await AxiosInstance().get(`/order/unpaid-gateway-orders`);
          const unpaidOrders = (res.orders || []).filter(o => o.userID === user._id);
          unpaidOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setOrders(unpaidOrders);
        }
      } else {
        showModal('error', 'Lỗi', 'Không lấy được thông tin thanh toán.');
      }
    } catch (e) {
      showModal('error', 'Lỗi', e.response?.data?.message || `Không thể tạo lại thanh toán ${paymentMethod}!`);
    } finally {
      setStripeLoading(false); // Kết thúc loading
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
      {loading || stripeLoading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator color="#8B5A2B" size="large" />
          <Text style={styles.description}>
            {stripeLoading ? 'Đang tải giao diện thanh toán Stripe...' : 'Đang lấy đơn hàng...'}
          </Text>
        </View>
      ) : orders.length === 0 ? (
        <Text style={styles.noOrder}>{msg}</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 36 }} refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }>
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
                    <Ionicons name="time-outline" size={15} color="#FBC02D" style={{ marginRight: 4 }} />
                    <Text style={{ color: '#FBC02D', fontWeight: 'bold' }}>Chờ thanh toán</Text>
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
                    <Text style={{ color: "#C90000", fontWeight: "bold" }}>
                      {order.finalTotal?.toLocaleString()} đ
                    </Text>
                  </Text>
                </View>
                <View style={styles.countdownRow}>
                  <Ionicons name="alarm-outline" size={20} color="#D32F2F" style={styles.infoIcon} />
                  {timeLeft > 0 ? (
                    <Text style={styles.countdownText}>
                      Thời gian còn lại: <Text style={{ color: '#D32F2F' }}>{m}:{s}</Text>
                    </Text>
                  ) : (
                    <Text style={styles.timeupText}>Đã hết thời gian thanh toán!</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.payButton, timeLeft <= 0 && styles.payButtonDisabled]}
                  onPress={() => openPaymentModal(order)}
                  disabled={timeLeft <= 0}
                  activeOpacity={0.85}
                >
                  <Ionicons name="logo-usd" size={18} color="#fff" />
                  <Text style={styles.payButtonText}>Thanh toán ngay</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.codButton, timeLeft <= 0 && styles.payButtonDisabled]}
                  onPress={() => handleChangeToCOD(order)}
                  disabled={timeLeft <= 0}
                  activeOpacity={0.85}
                >
                  <Ionicons name="cash-outline" size={18} color="#fff" />
                  <Text style={styles.payButtonText}>Đổi sang tiền mặt</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
      {/* Modal thông báo */}
      <CustomModal
        isVisible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
      {/* Modal chọn phương thức thanh toán */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModalVisible}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn phương thức thanh toán</Text>
            <TouchableOpacity
              style={[styles.modalButton, stripeLoading && styles.modalButtonDisabled]}
              onPress={() => handleRetryPayment('ZaloPay')}
              disabled={stripeLoading}
            >
              <Ionicons name="wallet-outline" size={24} color="#00a6ff" />
              <Text style={styles.modalButtonText}>Thanh toán bằng ZaloPay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, stripeLoading && styles.modalButtonDisabled]}
              onPress={() => handleRetryPayment('Stripe')}
              disabled={stripeLoading}
            >
              <Ionicons name="card-outline" size={24} color="#6772e5" />
              <Text style={styles.modalButtonText}>Thanh toán bằng Stripe</Text>
            </TouchableOpacity>
            <TouchableOpacity
        style={[styles.modalButton, stripeLoading && styles.modalButtonDisabled]}
        onPress={handleRetryVNPAY}
        disabled={stripeLoading}
      >
        <Ionicons name="logo-usd" size={24} color="#c90000" />
        <Text style={styles.modalButtonText}>Thanh toán bằng VNPAY</Text>
      </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setPaymentModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={!!vnpayUrl}
        animationType="slide"
        onRequestClose={() => {
          showModal('error', 'Thanh toán chưa hoàn tất', 'Bạn đã thoát trước khi thanh toán xong.', true);
          setVnpayUrl(null);
        }}
      >
        <WebView
          source={{ uri: vnpayUrl }}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.status === "success") {
                showModal('success', 'Thanh toán thành công', 'Đơn hàng đã được xử lý!');
              } else {
                showModal('error', 'Thanh toán thất bại', data.message || 'Vui lòng thử lại', true);
              }
            } catch (e) {
              showModal('error', 'Lỗi', 'Không đọc được dữ liệu từ VNPAY.', true);
            }
            setVnpayUrl(null); // đóng WebView
          }}
          onError={() => {
            showModal('error', 'Thanh toán lỗi', 'Kết nối không thành công, vui lòng thử lại.', true);
            setVnpayUrl(null);
          }}
          onNavigationStateChange={(navState) => {
            if (navState.url.includes("vnpay_return")) {
              console.log("👉 Đã quay về returnUrl");
            }
          }}
        />
      </Modal>

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
  codButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4caf50', paddingVertical: 11, borderRadius: 18, marginTop: 10
  },
  payButtonDisabled: { backgroundColor: '#ccc' },
  payButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
  description: { fontSize: 15, color: '#888', textAlign: 'center', marginTop: 18 },
  noOrder: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 70 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#8B5A2B',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    justifyContent: 'center',
  },
  modalButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#444',
    marginLeft: 10,
    fontWeight: '500',
  },
  modalCancelButton: {
    marginTop: 10,
    padding: 10,
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: '500',
  },
});

export default Payment;