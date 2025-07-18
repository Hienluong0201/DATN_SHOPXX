import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image,
  ActivityIndicator, TextInput, Modal, FlatList, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useAuth } from '../store/useAuth';
import { useProducts } from '../store/useProducts';
import CustomModal from './components/CustomModal';
import { useStripe } from '@stripe/stripe-react-native';
import { AppState } from 'react-native';

// --- Utils ---
const extractProvince = (addressString) => {
  if (!addressString) return '';
  const parts = addressString.split(',');
  return parts[parts.length - 1].trim().toLowerCase();
};
const calculateShippingFee = (fromAddress, toAddress) => {
  const fromProvince = extractProvince(fromAddress);
  const toProvince = extractProvince(toAddress);
  if (fromProvince === toProvince) return 20000;
  return 30000;
};
const SHOP_PROVINCE = 'hồ chí minh';

const AddressScreen = () => {
  const { user } = useAuth();
  const { selectedProducts } = useLocalSearchParams();
  const products = selectedProducts ? JSON.parse(selectedProducts) : [];
  const { fetchProductVariants } = useProducts();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [addresses, setAddresses] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [variantLoading, setVariantLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherModal, setVoucherModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'error',
    title: '',
    message: '',
  });
  const [zaloAppTransId, setZaloAppTransId] = useState(null);


  // --- Show modal lỗi/thành công ---
  const showModal = (type, title, message) => {
    setModalConfig({ type, title, message });
    setModalVisible(true);
  };

  // --- Fetch Địa chỉ ---
  const fetchAddresses = useCallback(async () => {
    if (!user?._id) {
      setAddresses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await AxiosInstance().get(`/adress?userID=${user._id}`);
      const fetchedAddresses = res || [];
      setAddresses(fetchedAddresses);
      if (fetchedAddresses.length > 0) {
        const defaultAddr = fetchedAddresses.find(addr => addr.isDefault) || fetchedAddresses[0];
        setSelectedAddress(defaultAddr);
      } else {
        setSelectedAddress(null);
      }
    } catch (err) {
      setAddresses([]);
      setSelectedAddress(null);
      console.log('Lỗi lấy địa chỉ:', err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // --- Fetch Voucher ---
  const fetchVouchers = useCallback(async () => {
    try {
      const res = await AxiosInstance().get('/voucher');
      setVouchers(res.data || []);
    } catch {
      setVouchers([]);
    }
  }, []);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);
  useEffect(() => { fetchVouchers(); }, [fetchVouchers]);

  // --- Phí ship tự động theo địa chỉ ---
  const shippingFee = selectedAddress
    ? calculateShippingFee(SHOP_PROVINCE, selectedAddress.address)
    : 0;

  // --- Tổng sản phẩm ---
  const productsTotal = products.reduce(
    (total, item) => total + (item.price * (item.quantity || 1)),
    0
  );

  // --- Tính giảm giá voucher (nếu có) ---
  const getDiscountValue = () => {
    if (!selectedVoucher) return 0;
    if (productsTotal < selectedVoucher.minOrderValue) return 0;
    if (selectedVoucher.discountType === 'percent') {
      return Math.floor(productsTotal * (selectedVoucher.discountValue / 100));
    }
    return selectedVoucher.discountValue;
  };
  const voucherDiscount = getDiscountValue();
  const totalAmount = Math.max(0, productsTotal + shippingFee - voucherDiscount);

  // --- Phương thức thanh toán ---
  const paymentMethods = [
    { id: 'cash', name: 'Tiền mặt khi nhận hàng', gateway: null },
    { id: 'credit_card', name: 'Thẻ tín dụng/Thẻ ghi nợ', gateway: 'Stripe' },
    { id: 'zalopay', name: 'Thanh toán bằng ZaloPay', gateway: 'ZaloPay' },
  ];
  //Kiểm tra trạng thái thanh toán zalo pay
  const checkZaloPayStatus = async (app_trans_id) => {
    try {
      // Gọi API backend kiểm tra trạng thái ZaloPay
      const statusRes = await AxiosInstance().post('/order/zalopay-status', {
        app_trans_id
      });
      console.log('Kết quả check trạng thái ZaloPay:', statusRes);

      if (statusRes.return_code === 1) {
        // Thành công!
        showModal('success', 'Thanh toán thành công', 'Giao dịch của bạn đã được xử lý!');
        // Có thể điều hướng qua trang hoàn tất đơn hàng
        // router.push({pathname: '/checkout', params: ...})
      } else if (statusRes.return_code === 3) {
        // Chưa thanh toán
        showModal('warning', 'Đang chờ thanh toán', 'Giao dịch chưa được thực hiện. Vui lòng thanh toán trên ZaloPay và thử lại.');
      } else {
        showModal('error', 'Lỗi thanh toán', statusRes.return_message || 'Không xác định được trạng thái giao dịch!');
      }
    } catch (err) {
      showModal('error', 'Lỗi', err.response?.data?.error || err.message || 'Không thể kiểm tra trạng thái!');
    }
  };

  // --- Gửi đơn hàng ---
const handleContinue = async () => {
  if (!selectedAddress) {
    showModal('error', 'Lỗi', 'Vui lòng chọn địa chỉ giao hàng!');
    return;
  }
  if (products.length === 0) {
    showModal('error', 'Lỗi', 'Không có sản phẩm nào được chọn!');
    return;
  }
  if (!selectedPaymentMethod) {
    showModal('error', 'Lỗi', 'Vui lòng chọn phương thức thanh toán!');
    return;
  }
  if (selectedVoucher && productsTotal < selectedVoucher.minOrderValue) {
    showModal('error', 'Voucher không áp dụng', `Đơn hàng tối thiểu phải từ ${selectedVoucher.minOrderValue.toLocaleString('vi-VN')}đ để sử dụng voucher này!`);
    return;
  }

  setVariantLoading(true);
  try {
    // Chuẩn bị order items
    const orderItems = await Promise.all(
      products.map(async (item) => {
        let variantID = item.variantID;
        if (!variantID) {
          const variants = await fetchProductVariants(item.productId);
          const selectedVariant = variants.find(
            (variant) => variant.color === item.color && variant.size === item.size
          ) || variants[0];
          variantID = selectedVariant?._id || '683da229786c576173343579';
        }
        return {
          variantID,
          quantity: item.quantity || 1,
          price: item.price || 150000,
          productId: item.productId,
          categoryID: item.categoryID,
        };
      })
    );

    const orderPayload = {
      userID: user._id,
      paymentInfo: {
        paymentMethod: selectedPaymentMethod.id === 'credit_card' ? 'Stripe' : selectedPaymentMethod.id === 'zalopay' ? 'ZaloPay' : 'Cash',
        status: 'Pending',
      },
      shippingAddress: selectedAddress.address,
      name: selectedAddress.name || 'Nguyễn Văn A',
      sdt: selectedAddress.sdt || '0909123456',
      items: orderItems,
      shippingFee,
      totalAmount,
      voucherCode: selectedVoucher?.code,
    };

    const orderResponse = await AxiosInstance().post('/order/checkout', orderPayload);

    if (!orderResponse.order?._id) {
      showModal('error', 'Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại.');
      return;
    }

    const params = {
      orderId: orderResponse.order._id,
      selectedAddress: JSON.stringify(selectedAddress),
      selectedProducts: JSON.stringify(products),
      shippingFee: shippingFee.toString(),
      voucherDiscount: voucherDiscount.toString(),
      productsTotal: productsTotal.toString(),
      totalAmount: totalAmount.toString(),
      paymentStatus: selectedPaymentMethod.id === 'credit_card' ? 'completed' : selectedPaymentMethod.id === 'zalopay' ? 'pending' : 'pending',
    };

    // Tiền mặt khi nhận hàng
    if (selectedPaymentMethod.id === 'cash') {
      router.push({
        pathname: '/checkout',
        params,
      });
      return;
    }

    // Thanh toán Stripe (Credit Card)
    if (selectedPaymentMethod.id === 'credit_card') {
      try {
        setPaymentLoading(true);
        const stripePayload = {
          orderId: orderResponse.order._id,
          amount: totalAmount,
          currency: 'vnd',
        };
        const stripeResponse = await AxiosInstance().post('/order/stripe-payment-intent', stripePayload);
        const { clientSecret, error } = stripeResponse;
        if (error || !clientSecret) {
          throw new Error(error || 'Không nhận được clientSecret từ server');
        }

        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'Your Shop Name',
          allowsDelayedPaymentMethods: true,
        });

        if (initError) {
          showModal('error', 'Lỗi', `Không thể khởi tạo thanh toán: ${initError.message}`);
          return;
        }

        const { error: paymentError } = await presentPaymentSheet();
        if (paymentError) {
          showModal('error', 'Lỗi', `Thanh toán thất bại: ${paymentError.message}`);
          return;
        }

        showModal('success', 'Thành công', 'Thanh toán đã được xử lý thành công!');
        router.push({
          pathname: '/checkout',
          params,
        });
      } catch (stripeError) {
        showModal('error', 'Lỗi', `Không thể xử lý thanh toán: ${stripeError.message || 'Vui lòng thử lại'}`);
      } finally {
        setPaymentLoading(false);
      }
      return;
    }

    // Thanh toán ZaloPay
    if (selectedPaymentMethod.id === 'zalopay') {
      try {
        setPaymentLoading(true);
        const zalopayPayload = {
          orderId: orderResponse.order._id,
          amount: totalAmount,
          currency: 'vnd',
        };
        const zalopayResponse = await AxiosInstance().post('/order/zalopay', zalopayPayload);

        const { order_url, return_code, return_message, app_trans_id } = zalopayResponse;
        if (return_code !== 1) {
          throw new Error(return_message || 'Không thể tạo giao dịch ZaloPay');
        }

        if (order_url && app_trans_id) {
          setZaloAppTransId(app_trans_id); // <-- Lưu app_trans_id để auto check khi quay lại app!
          const canOpen = await Linking.canOpenURL(order_url);
          if (canOpen) {
            await Linking.openURL(order_url);
            showModal('success', 'Thành công', 'Đã mở ứng dụng ZaloPay để thanh toán!');
            // KHÔNG push sang checkout ở đây nữa, để check trạng thái tự động!
          } else {
            throw new Error('Không thể mở ứng dụng ZaloPay');
          }
        } else {
          throw new Error('Không nhận được order_url hoặc app_trans_id từ server');
        }
      } catch (zalopayError) {
        showModal('error', 'Lỗi', `Không thể xử lý thanh toán ZaloPay: ${zalopayError.message || 'Vui lòng thử lại'}`);
      } finally {
        setPaymentLoading(false);
      }
      return;
    }

  } catch (err) {
    showModal('error', 'Lỗi', err.response?.data?.message || err.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
  } finally {
    setVariantLoading(false);
  }
};
//check thanh toán
useEffect(() => {
  if (!zaloAppTransId) return;
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active' && zaloAppTransId) {
      checkZaloPayStatus(zaloAppTransId);
    }
  });
  return () => subscription.remove();
}, [zaloAppTransId]);

  // --- UI chọn voucher ---
  const renderVoucher = ({ item }) => {
    const expired = !item.isActive || (new Date(item.validTo) < new Date());
    return (
      <TouchableOpacity
        style={[
          voucherStyles.card,
          expired && voucherStyles.expiredCard,
          selectedVoucher?.code === item.code && voucherStyles.selectedCard
        ]}
        disabled={expired}
        onPress={() => setSelectedVoucher(item)}
        activeOpacity={0.8}
      >
        <View style={voucherStyles.row}>
          <Text style={voucherStyles.code}>{item.code}</Text>
          <View style={[
            voucherStyles.badge,
            { backgroundColor: item.isActive ? "#d1fae5" : "#fee2e2" }
          ]}>
            <Ionicons
              name={item.isActive ? "checkmark-circle" : "close-circle"}
              size={15}
              color={item.isActive ? "#059669" : "#b91c1c"}
              style={{ marginRight: 4 }}
            />
            <Text style={{
              color: item.isActive ? "#059669" : "#b91c1c",
              fontWeight: "700"
            }}>
              {expired ? "Hết hạn" : "Đang hoạt động"}
            </Text>
          </View>
        </View>
        <Text style={voucherStyles.typeValue}>
          {item.discountType === 'percent'
            ? `Giảm ${item.discountValue}%`
            : `Giảm ${item.discountValue.toLocaleString('vi-VN')}đ`}
        </Text>
        <Text style={voucherStyles.info}>
          Đơn tối thiểu: <Text style={voucherStyles.minOrder}>{item.minOrderValue.toLocaleString('vi-VN')}đ</Text>
        </Text>
        <Text style={voucherStyles.info}>
          Hiệu lực: {new Date(item.validFrom).toLocaleDateString('vi-VN')} - {new Date(item.validTo).toLocaleDateString('vi-VN')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.rootContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2c2c2c" />
          </TouchableOpacity>
          <Text style={styles.title}>Xác nhận đơn hàng</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Địa chỉ giao hàng */}
        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>Địa chỉ giao hàng</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#8B5A2B" style={{ marginVertical: 8 }} />
          ) : !user?._id ? (
            <Text style={{ color: '#999' }}>Bạn cần đăng nhập để sử dụng chức năng này.</Text>
          ) : addresses.length === 0 ? (
            <Text style={{ color: '#999' }}>Chưa có địa chỉ. Vui lòng thêm mới!</Text>
          ) : (
            <>
              {addresses.map(addr => (
                <TouchableOpacity
                  key={addr._id}
                  style={[
                    styles.addressItem,
                    selectedAddress?._id === addr._id && styles.selectedAddress,
                  ]}
                  onPress={() => setSelectedAddress(addr)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={selectedAddress?._id === addr._id ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={selectedAddress?._id === addr._id ? '#ee4d2d' : '#aaa'}
                    style={{ marginRight: 7 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', color: '#2c2c2c' }}>
                      {addr.name || 'Tên người nhận'} | {addr.sdt}
                    </Text>
                    <Text style={{ color: '#666' }}>{addr.address}</Text>
                    {addr.isDefault && (
                      <Text style={{ fontSize: 12, color: '#27ae60' }}>[Mặc định]</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/addressDetail')}>
            <Text style={styles.addText}>+ Thêm địa chỉ mới</Text>
          </TouchableOpacity>
        </View>

        {/* Voucher */}
        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>Mã giảm giá (Voucher)</Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#f0f2f5',
              padding: 10, borderRadius: 10, alignItems: 'center', flexDirection: 'row'
            }}
            onPress={() => setVoucherModal(true)}
          >
            <Ionicons name="pricetag" size={20} color="#059669" />
            <Text style={{ marginLeft: 10, fontWeight: '600', color: '#059669', flex: 1 }}>
              {selectedVoucher ? `Đang áp dụng: ${selectedVoucher.code}` : 'Chọn voucher'}
            </Text>
            <Ionicons name="chevron-forward" size={22} color="#bbb" />
          </TouchableOpacity>
          {selectedVoucher && (
            <TouchableOpacity
              onPress={() => setSelectedVoucher(null)}
              style={{ marginTop: 7, alignSelf: 'flex-start', padding: 4, borderRadius: 5, backgroundColor: '#fef2f2' }}
            >
              <Text style={{ color: '#b91c1c', fontSize: 13 }}>Bỏ chọn voucher</Text>
            </TouchableOpacity>
          )}
        </View>
        <Modal visible={voucherModal} transparent animationType="slide" onRequestClose={() => setVoucherModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center' }}>
            <View style={{
              backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 24, maxHeight: 400,
              padding: 18, elevation: 6
            }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#059669', marginBottom: 14 }}>
                Danh sách Voucher
              </Text>
              <FlatList
                data={vouchers}
                keyExtractor={item => item._id}
                renderItem={renderVoucher}
                ListEmptyComponent={<Text style={{ color: '#999', textAlign: 'center', padding: 25 }}>Không có voucher</Text>}
                contentContainerStyle={{ paddingBottom: 16 }}
              />
              <TouchableOpacity
                onPress={() => setVoucherModal(false)}
                style={{ alignSelf: 'flex-end', marginTop: 6, padding: 8, borderRadius: 6, backgroundColor: '#f0f2f5' }}
              >
                <Text style={{ color: '#059669', fontWeight: 'bold' }}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Thanh toán */}
        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>Phương thức thanh toán</Text>
          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.addressItem,
                selectedPaymentMethod?.id === method.id && styles.selectedAddress,
              ]}
              onPress={() => setSelectedPaymentMethod(method)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={selectedPaymentMethod?.id === method.id ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={selectedPaymentMethod?.id === method.id ? '#ee4d2d' : '#aaa'}
                style={{ marginRight: 7 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', color: '#2c2c2c' }}>{method.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Đơn hàng */}
        <View style={styles.orderSection}>
          <Text style={styles.sectionTitle}>Đơn hàng của bạn</Text>
          {variantLoading || paymentLoading ? (
            <ActivityIndicator size="small" color="#8B5A2B" style={{ marginVertical: 8 }} />
          ) : null}
          {products.length === 0 ? (
            <Text style={{ color: '#999', padding: 15 }}>Không có sản phẩm nào được chọn.</Text>
          ) : (
            products.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Image
                  source={{ uri: item.image || 'https://via.placeholder.com/80x80?text=Product' }}
                  style={styles.itemImage}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name || 'Tên sản phẩm'}</Text>
                  <Text style={styles.itemSize}>
                    Màu: {item.color || 'N/A'} | Size: {item.size || 'N/A'} | Số lượng: {item.quantity || 1}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {(item.price * item.quantity || 0).toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              </View>
            ))
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8, paddingHorizontal: 5 }}>
            <Text style={{ fontWeight: '600', fontSize: 15 }}>Tạm tính</Text>
            <Text style={{ fontWeight: '600', fontSize: 15, color: '#059669' }}>
              {productsTotal ? productsTotal.toLocaleString('vi-VN') : '0'}đ
            </Text>
          </View>
          {selectedVoucher && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3, paddingHorizontal: 5 }}>
              <Text style={{ fontWeight: '600', fontSize: 15, color: '#059669' }}>
                Giảm giá voucher
              </Text>
              <Text style={{ fontWeight: '700', fontSize: 15, color: '#b91c1c' }}>
                -{voucherDiscount.toLocaleString('vi-VN')}đ
              </Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3, paddingHorizontal: 5 }}>
            <Text style={{ fontWeight: '600', fontSize: 15 }}>Phí vận chuyển</Text>
            <Text style={{ fontWeight: '600', fontSize: 15, color: '#8B5A2B' }}>
              {shippingFee ? shippingFee.toLocaleString('vi-VN') : '0'}đ
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5, paddingHorizontal: 5 }}>
            <Text style={{ fontWeight: '700', fontSize: 17, color: '#c0392b' }}>Tổng thanh toán</Text>
            <Text style={{ fontWeight: '700', fontSize: 17, color: '#c0392b' }}>
              {totalAmount.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.continueButton, (variantLoading || paymentLoading) && styles.disabledButton]}
          onPress={handleContinue}
          disabled={variantLoading || paymentLoading}
        >
          <Text style={styles.continueText}>
            {paymentLoading ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
          </Text>
        </TouchableOpacity>
      </View>

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

const voucherStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 13,
    padding: 15,
    marginBottom: 13,
    borderWidth: 1.1,
    borderColor: "#e0e7ef"
  },
  expiredCard: {
    opacity: 0.4
  },
  selectedCard: {
    borderColor: '#059669',
    backgroundColor: '#e6fcf4'
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  code: { fontSize: 17, fontWeight: '900', color: "#059669", letterSpacing: 1, textTransform: "uppercase" },
  badge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3, paddingHorizontal: 12, borderRadius: 16 },
  typeValue: { fontWeight: 'bold', fontSize: 15.5, color: "#0284c7", marginVertical: 2 },
  info: { fontSize: 13.5, color: "#4b5563", marginTop: 0.5 },
  minOrder: { fontWeight: 'bold', color: "#b91c1c" }
});

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: '#f0f2f5' ,marginTop : 40},
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { padding: 5 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', flex: 1, textAlign: 'center' },
  placeholder: { width: 24 },
  addressCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3 },
  addressLabel: { fontSize: 16, fontWeight: '600', color: '#2c2c2c', marginBottom: 5 },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 10,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedAddress: {
    borderColor: '#ee4d2d',
    backgroundColor: '#fff6f2',
  },
  addButton: { backgroundColor: '#f0f2f5', padding: 10, borderRadius: 10, alignItems: 'center', marginTop: 7 },
  addText: { fontSize: 14, color: '#8B5A2B', fontWeight: '600' },
  orderSection: { marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  orderItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 3, alignItems: 'center' },
  itemImage: { width: 60, height: 60, resizeMode: 'cover', borderRadius: 10 },
  itemDetails: { flex: 1, marginLeft: 15 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  itemSize: { fontSize: 14, color: '#666', marginTop: 5 },
  itemPrice: { fontSize: 14, color: '#c0392b', fontWeight: '700', marginTop: 5 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 12,
  },
  continueButton: {
    backgroundColor: '#8B5A2B',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddressScreen;