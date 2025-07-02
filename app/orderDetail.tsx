import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useProducts } from '../store/useProducts';
// Nếu bạn có hook user, thì import useAuth lấy user._id luôn cho chắc chắn:
import { useAuth } from '../store/useAuth';

const PRIMARY = "#e4633b";
const cancelReasonsList = [
  'Đặt nhầm sản phẩm',
  'Thay đổi địa chỉ giao hàng',
  'Không còn nhu cầu',
  'Tìm được giá tốt hơn nơi khác',
  'Thời gian giao lâu',
  'Khác',
];

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
const formatDate = (dateString) =>
  new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatVoucher = (voucher) => {
  if (!voucher) return '';
  if (voucher.discountType === 'percent') {
    return `Giảm ${voucher.discountValue}% (Tối đa ${voucher.usageLimit} lần)`;
  }
  if (voucher.discountType === 'fixed') {
    return `Giảm ${formatPrice(voucher.discountValue)}`;
  }
  return voucher.code;
};

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

const OrderDetail = () => {
  const { orderId } = useLocalSearchParams();
  const { getProductById } = useProducts();
  const { user } = useAuth(); // lấy user nếu đã đăng nhập
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal huỷ đơn
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // Modal review sản phẩm
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null); // item đang được review
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [sendingReview, setSendingReview] = useState(false);

  // Đã review hay chưa? (simple, tuỳ vào BE, ở đây giả sử chưa có check, bạn nên fetch về để biết đã review hay chưa)
  // Nếu BE trả về list review theo user + sản phẩm thì map vào đây là tốt nhất!

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const [detailsRes, orderRes] = await Promise.all([
          AxiosInstance().get(`/orderdetail/order/${orderId}`),
          AxiosInstance().get(`/order/${orderId}`)
        ]);
        // mapping product info
        const enrichedDetails = (Array.isArray(detailsRes) ? detailsRes : []).map(detail => {
          const productId = detail?.variantID?.productID;
          const product = productId ? getProductById(productId) : {};
          let images = [];
          if (Array.isArray(product?.Images) && product.Images.length > 0) images = product.Images;
          else if (Array.isArray(product?.images) && product.images.length > 0) images = product.images;
          else if (product?.Image) images = [product.Image];
          else images = ['https://via.placeholder.com/80'];
          return {
            ...detail,
            Name: product?.Name || 'Sản phẩm không xác định',
            Images: images,
            Brand: product?.Brand || "Không xác định",
            Category: product?.CategoryID || "",
          };
        });
        setOrderDetails(enrichedDetails);
        setOrderInfo(orderRes); // API trả về object đơn hàng
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

  // Huỷ đơn
  const openCancelModal = () => {
    setCancelModalVisible(true);
    setCancelReason('');
    setOtherReason('');
  };
  const submitCancelOrder = async () => {
    if (!cancelReason || (cancelReason === 'Khác' && !otherReason.trim())) {
      Alert.alert('Vui lòng chọn hoặc nhập lý do huỷ!');
      return;
    }
    setSubmittingCancel(true);
    try {
      const reasonText = cancelReason === 'Khác' ? otherReason.trim() : cancelReason;
      await AxiosInstance().put(`/order/${orderInfo._id}`, {
        orderStatus: "cancelled",
        cancelReason: reasonText
      });
      Alert.alert("Thông báo", "Đã hủy đơn hàng thành công");
      setOrderInfo(prev => ({ ...prev, orderStatus: 'cancelled' }));
      setCancelModalVisible(false);
    } catch (error) {
      Alert.alert("Lỗi", error?.response?.data?.message || "Không thể hủy đơn hàng.");
    } finally {
      setSubmittingCancel(false);
    }
  };

  // Mở modal review
  const openReviewModal = (product) => {
    setReviewProduct(product);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalVisible(true);
  };

  // Gửi review sản phẩm
  const sendReviewAPI = async ({ userID, productID, rating, comment }) => {
    try {
      const res = await AxiosInstance().post('/review', {
        userID,
        productID,
        rating,
        comment,
        status: 'true',
      });
      return res.data;
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error.message || 'Lỗi khi gửi đánh giá';
      throw new Error(errorMsg);
    }
  };
  const handleSendReview = async () => {
    // Dùng user._id (nếu bạn dùng useAuth), nếu không thì orderInfo.userID
    const userID = user?._id || orderInfo?.userID;
    if (!userID || !reviewProduct) {
      Alert.alert('Bạn cần đăng nhập!');
      return;
    }
    if (!reviewComment.trim()) {
      Alert.alert('Vui lòng nhập nội dung đánh giá!');
      return;
    }
    setSendingReview(true);
    try {
      await sendReviewAPI({
        userID,
        productID: reviewProduct.variantID.productID,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      Alert.alert('Thành công', 'Đánh giá đã gửi thành công!');
      setReviewModalVisible(false);
    } catch (err) {
      Alert.alert('Lỗi', err?.message || 'Không gửi được đánh giá');
    }
    setSendingReview(false);
  };

  const goBack = () => router.back();
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
        <Text style={styles.infoValue}>
          {orderInfo.paymentID?.paymentMethod === 'Credit Card' ? 'Thẻ tín dụng' : 'Tiền mặt'}
        </Text>
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
              {/* Nút đánh giá khi đã giao (delivered) */}
              {orderInfo.orderStatus === 'delivered' && (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#f7c873', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 7,
                    marginTop: 6, alignSelf: 'flex-start'
                  }}
                  onPress={() => openReviewModal(detail)}
                >
                  <Text style={{ color: '#8B5A2B', fontWeight: 'bold', fontSize: 15 }}>
                    Đánh giá
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
      {/* Tổng tiền + voucher + giảm giá + thực trả */}
      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Tổng cộng</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Mã đơn hàng:</Text>
          <Text style={styles.value}>{orderInfo._id}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Tổng tiền hàng:</Text>
          <Text style={[styles.value, { color: PRIMARY, fontWeight: 'bold', fontSize: 18 }]}>
            {formatPrice(calcTotal())}
          </Text>
        </View>
        {!!orderInfo.voucher && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Mã voucher:</Text>
            <Text style={[styles.value, { color: "#0066cc", fontWeight: 'bold' }]}>
              {orderInfo.voucher.code} ({formatVoucher(orderInfo.voucher)})
            </Text>
          </View>
        )}
        {!!orderInfo.discountAmount && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Giảm giá:</Text>
            <Text style={[styles.value, { color: "#388e3c" }]}>- {formatPrice(orderInfo.discountAmount)}</Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Thực trả:</Text>
          <Text style={[styles.value, { color: "#e4633b", fontWeight: 'bold', fontSize: 20 }]}>
            {formatPrice(orderInfo.finalTotal)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Thanh toán:</Text>
          <Text style={styles.value}>
            {orderInfo.paymentID?.paymentMethod === 'Credit Card' ? 'Thẻ tín dụng' : 'Tiền mặt'}
          </Text>
        </View>
      </View>
      {/* Nút liên hệ + huỷ đơn */}
      <TouchableOpacity style={styles.contactBtn} onPress={() => Alert.alert("Liên hệ shop", "SĐT: 0123456789")}>
        <Ionicons name="call" size={20} color="#fff" style={{ marginRight: 7 }} />
        <Text style={styles.contactText}>Liên hệ shop</Text>
      </TouchableOpacity>
      {orderInfo.orderStatus === 'pending' && (
        <TouchableOpacity
          style={[styles.contactBtn, { backgroundColor: "#D32F2F", marginBottom: 10 }]}
          onPress={openCancelModal}
        >
          <Ionicons name="close-circle-outline" size={20} color="#fff" style={{ marginRight: 7 }} />
          <Text style={styles.contactText}>Huỷ đơn hàng</Text>
        </TouchableOpacity>
      )}
      {/* Modal huỷ đơn */}
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.25)',
          justifyContent: 'center', alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            width: '85%',
            borderRadius: 16,
            padding: 20,
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#D32F2F' }}>Chọn lý do huỷ đơn</Text>
            {cancelReasonsList.map((reason, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setCancelReason(reason)}
                style={{
                  flexDirection: 'row', alignItems: 'center', width: '100%',
                  marginVertical: 4, padding: 10,
                  backgroundColor: cancelReason === reason ? '#FFEBEE' : '#f5f5f5',
                  borderRadius: 10,
                }}
              >
                <Ionicons name={cancelReason === reason ? "radio-button-on" : "radio-button-off"} size={20} color="#D32F2F" />
                <Text style={{ fontSize: 15, marginLeft: 8 }}>{reason}</Text>
              </TouchableOpacity>
            ))}
            {cancelReason === 'Khác' && (
              <TextInput
                style={{
                  borderColor: '#e4633b', borderWidth: 1, borderRadius: 10,
                  marginTop: 10, width: '100%', padding: 10, fontSize: 15
                }}
                placeholder="Nhập lý do huỷ đơn..."
                value={otherReason}
                onChangeText={setOtherReason}
                multiline
                maxLength={200}
              />
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 18 }}>
              <TouchableOpacity
                style={{
                  flex: 1, backgroundColor: '#ccc',
                  borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginRight: 6,
                }}
                onPress={() => setCancelModalVisible(false)}
                disabled={submittingCancel}
              >
                <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 15 }}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1, backgroundColor: '#D32F2F',
                  borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginLeft: 6,
                  opacity: submittingCancel ? 0.7 : 1
                }}
                onPress={submitCancelOrder}
                disabled={submittingCancel}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
                  {submittingCancel ? "Đang gửi..." : "Xác nhận huỷ"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal review sản phẩm */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.2)',
          justifyContent: 'center', alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff', borderRadius: 18,
            width: '90%', padding: 20, alignItems: 'center'
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#8B5A2B', marginBottom: 10 }}>Đánh giá sản phẩm</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 10 }}>
              {reviewProduct?.Name}
            </Text>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              {[1,2,3,4,5].map(i => (
                <TouchableOpacity key={i} onPress={() => setReviewRating(i)}>
                  <Ionicons
                    name={reviewRating >= i ? "star" : "star-outline"}
                    size={30}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={{
                borderColor: '#eee', borderWidth: 1, borderRadius: 8, padding: 10,
                minHeight: 60, fontSize: 15, width: '100%', backgroundColor: '#fafafa'
              }}
              placeholder="Chia sẻ cảm nhận về sản phẩm này..."
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
            />
            <View style={{ flexDirection: 'row', marginTop: 16, width: '100%' }}>
              <TouchableOpacity
                style={{
                  flex: 1, backgroundColor: '#ccc',
                  borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginRight: 6,
                }}
                onPress={() => setReviewModalVisible(false)}
                disabled={sendingReview}
              >
                <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 15 }}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1, backgroundColor: '#e4633b',
                  borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginLeft: 6,
                  opacity: sendingReview ? 0.7 : 1
                }}
                onPress={handleSendReview}
                disabled={sendingReview || !reviewComment.trim()}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
                  {sendingReview ? "Đang gửi..." : "Gửi đánh giá"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  infoLabel: { fontSize: 14, fontWeight: '700', color: '#888', marginBottom: 3, marginTop: 6 },
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
