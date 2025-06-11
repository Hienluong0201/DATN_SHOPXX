import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useAuth } from '../store/useAuth';
import { useProducts } from '../store/useProducts';

const AddressScreen = () => {
  const { user } = useAuth();
  const { selectedProducts } = useLocalSearchParams();
  const products = selectedProducts ? JSON.parse(selectedProducts) : [];
  const { fetchProductVariants } = useProducts();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [variantLoading, setVariantLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // Log product variants (only for debugging, runs once on mount if products exist)
  useEffect(() => {
    if (products.length === 0) return;

    const logProductVariants = async () => {
      try {
        const productId = products[0]?.productId;
        if (!productId) {
          console.log('No productId found in selectedProducts:', products);
          return;
        }

        console.log(`Fetching variants for productId: ${productId}`);
        const variants = await fetchProductVariants(productId);
        console.log(`Product Variants for ${productId}:`, JSON.stringify(variants, null, 2));
        const targetVariant = variants.find(variant => variant._id === '683da229786c576173343579');
        console.log('Target variant (683da229786c576173343579):', targetVariant || 'Not found');
      } catch (err) {
        console.error('Error fetching product variants:', err.message);
      }
    };

    logProductVariants();
  }, []); // Dependency on products ensures it runs only when products change

  // Payment methods
  const paymentMethods = [
    { id: 'cash', name: 'Tiền mặt khi nhận hàng', gateway: null },
    { id: 'credit_card', name: 'ZaloPay', gateway: 'Stripe' },
  ];

  // Fetch addresses on component mount
  const fetchAddresses = useCallback(async () => {
    if (!user?._id) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await AxiosInstance().get(`/adress?userID=${user._id}`);
      console.log('Danh sách địa chỉ:', res);
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
  }, [user?._id]); // Depend only on user._id

  // Fetch addresses only once on mount
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]); // Depend on fetchAddresses to ensure it runs once

  const handleContinue = async () => {
  if (!selectedAddress) {
    alert('Vui lòng chọn địa chỉ giao hàng!');
    return;
  }
  if (products.length === 0) {
    alert('Không có sản phẩm nào được chọn!');
    return;
  }
  if (!selectedPaymentMethod) {
    alert('Vui lòng chọn phương thức thanh toán!');
    return;
  }

  setVariantLoading(true);
  try {
    // Tạo danh sách orderItems từ selectedProducts
    const orderItems = await Promise.all(
      products.map(async (item) => {
        let variantID = item.variantID;
        if (!variantID) {
          const variants = await fetchProductVariants(item.productId);
          console.log(`Variants for productId ${item.productId} in handleContinue:`, JSON.stringify(variants, null, 2));
          const selectedVariant = variants.find(
            (variant) => variant.color === item.color && variant.size === item.size
          ) || variants[0];
          variantID = selectedVariant?._id || '683da229786c576173343579';
        }
        return {
          variantID,
          quantity: item.quantity || 1,
          price: item.price || 150000,
        };
      })
    );

    // Tạo payload cho đơn hàng
    const orderPayload = {
      userID: user._id,
      paymentInfo: {
        paymentMethod: selectedPaymentMethod.id === 'credit_card' ? 'ZaloPay' : 'Cash', // Cập nhật tên phương thức
        status: 'Pending', // Đặt trạng thái là Pending, sẽ cập nhật sau khi thanh toán
      },
      shippingAddress: selectedAddress.address,
      name: selectedAddress.name || 'Nguyễn Văn A',
      sdt: selectedAddress.sdt || '0909123456',
      items: orderItems,
    };

    // Gửi yêu cầu tạo đơn hàng
    const orderResponse = await AxiosInstance().post('/order/checkout', orderPayload);
    console.log('Phản hồi từ API /order/checkout:', orderResponse);

    // Chuyển hướng dựa trên phương thức thanh toán
    if (selectedPaymentMethod.id === 'cash') {
      // Thanh toán bằng tiền mặt -> Chuyển đến trang checkout
      router.push({
        pathname: '/checkout',
        params: {
          orderId: orderResponse._id || 'order_id',
          selectedAddress: JSON.stringify(selectedAddress),
          selectedProducts: JSON.stringify(products),
        },
      });
    } else if (selectedPaymentMethod.id === 'credit_card') {
      // Thanh toán bằng ZaloPay -> Gọi API ZaloPay để lấy URL thanh toán
      try {
        const zaloPayPayload = {
          orderId: orderResponse._id,
          amount: orderItems.reduce((total, item) => total + item.price * item.quantity, 0), // Tổng tiền
          description: `Thanh toán đơn hàng ${orderResponse._id}`,
          userId: user._id,
        };

        // Giả lập gọi API ZaloPay (thay bằng SDK hoặc API thật)
        const zaloPayResponse = await AxiosInstance().post('/payment/zalopay', zaloPayPayload);
        console.log('Phản hồi từ API ZaloPay:', zaloPayResponse);

        // Chuyển hướng đến trang thanh toán ZaloPay
        router.push({
          pathname: './zalopay-payment', // Trang xử lý ZaloPay (hoặc URL từ zaloPayResponse)
          params: {
            paymentUrl: zaloPayResponse.paymentUrl || 'https://zalopay.vn', // URL thật từ ZaloPay
            orderId: orderResponse._id,
            selectedAddress: JSON.stringify(selectedAddress),
            selectedProducts: JSON.stringify(products),
          },
        });
      } catch (zaloPayError) {
        console.error('Lỗi khi gọi API ZaloPay:', zaloPayError.response?.data || zaloPayError.message);
        alert('Không thể khởi tạo thanh toán ZaloPay. Vui lòng thử lại.');
      }
    }
  } catch (err) {
    console.error('Lỗi tạo đơn hàng:', err.response?.data || err.message);
    alert('Không thể tạo đơn hàng. Vui lòng thử lại.');
  } finally {
    setVariantLoading(false);
  }
};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.title}>Xác nhận đơn hàng</Text>
        <View style={styles.placeholder} />
      </View>

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

      <View style={styles.orderSection}>
        <Text style={styles.sectionTitle}>Đơn hàng của bạn</Text>
        {variantLoading && <ActivityIndicator size="small" color="#8B5A2B" style={{ marginVertical: 8 }} />}
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
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={variantLoading}>
        <Text style={styles.continueText}>Tiếp tục thanh toán</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  continueButton: { backgroundColor: '#8B5A2B', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  continueText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default AddressScreen;