import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, Text, ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Trash2 } from 'lucide-react-native';
import { useAuth } from '../../store/useAuth';
import { useProducts } from '../../store/useProducts';
import AxiosInstance from '../../axiosInstance/AxiosInstance';
import { router, useFocusEffect } from 'expo-router';
import CustomModal from '../components/CustomModal';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const emptyImg = require('../../assets/images/laughing.png');

const Cart = () => {
  const { user } = useAuth();
  const { products, getProductById, getProductOrFetch, primeProducts } = useProducts();
  const [enrichedCart, setEnrichedCart] = useState([]); 
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'success',
    title: '',
    message: '',
    showConfirmButton: false,
    onConfirm: () => {},
  });

  const showModal = (
    type: 'success' | 'error' | 'warning',
    title: string,
    message: string,
    showConfirmButton = false,
    onConfirm = () => {}
  ) => {
    setModalConfig({ type, title, message, showConfirmButton, onConfirm });
    setModalVisible(true);
  };

const fetchCart = useCallback(async () => {
  if (!user?._id) {
    setCart([]);
    setEnrichedCart([]);
    setLoading(false);
    setError('Bạn cần đăng nhập để xem giỏ hàng!');
    return;
  }
  setLoading(true);
  try {
    const response = await AxiosInstance().get(`/cart/${user._id}`);
    setCart(response || []);
    setError(null);
    setSelectedItems(new Array(response.length).fill(false));
    setSelectAll(false);

    // ✅ Enrich giống OrderDetail: ưu tiên cache 50, nếu thiếu thì fetch theo id
    const enriched = await Promise.all(
      (response || []).map(async (item) => {
        const pid = item?.productVariant?.productID?._id;
        let product = pid ? getProductById(pid) : undefined;

        if (!product && pid) {
          product = await getProductOrFetch(pid);
          console.log("🔄 Cart fetched by id (not in cache):", pid, !!product);
        } else {
          console.log("✅ Cart from cache:", pid, !!product);
        }

        let images = [];
        if (Array.isArray(product?.Images) && product.Images.length > 0) images = product.Images;
        else if (Array.isArray(product?.images) && product.images.length > 0) images = product.images;
        else if (product?.Image) images = [product.Image];
        else images = ['https://via.placeholder.com/120'];

        return {
          ...item,
          __view: {
            Name: product?.Name || item?.productVariant?.productID?.name || 'Sản phẩm không xác định',
            Image: images[0],
            Images: images
          }
        };
      })
    );

    const foundCount = enriched.filter(i => i.__view?.Name !== 'Sản phẩm không xác định').length;
    console.log(`🧺 Enriched cart: ${foundCount}/${enriched.length}`);

    setEnrichedCart(enriched);
  } catch (err) {
    setError('Không thể tải giỏ hàng. Vui lòng thử lại.');
    setCart([]);
    setEnrichedCart([]);
  } finally {
    setLoading(false);
  }
}, [user?._id, getProductById, getProductOrFetch]);


  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  useEffect(() => {
    if (user?._id) {
      fetchCart();
    } else {
      setCart([]);
      setLoading(false);
      setError('Bạn cần đăng nhập để xem giỏ hàng!');
    }
  }, [user?._id, fetchCart]);

  const removeFromCart = async (cartId) => {
  showModal(
    'warning',
    'Xác nhận',
    'Bạn muốn xóa sản phẩm này khỏi giỏ hàng?',
    true,
    async () => {
      try {
        await AxiosInstance().delete(`/cart/${cartId}`);
        setCart((prev) => prev.filter((item) => item._id !== cartId));
        // Đồng bộ enrichedCart
        setEnrichedCart((prev) => prev.filter((item) => item._id !== cartId));
        setSelectedItems((prev) => prev.filter((_, i) => cart[i]?._id !== cartId));
        setSelectAll(false);
        showModal('success', 'Thành công', 'Sản phẩm đã được xóa khỏi giỏ hàng.');
      } catch (err) {
        showModal('error', 'Lỗi', 'Không thể xóa sản phẩm khỏi giỏ hàng.');
      }
    }
  );
};
 const updateQuantity = async (cartId, value) => {
  const cartItem = cart.find((item) => item._id === cartId);
  if (!cartItem) return;
  if (value === -1 && cartItem.soluong <= 1) return;
  try {
    const endpoint = value === -1 ? `/cart/${cartId}/decrease` : `/cart/${cartId}/increase`;
    await AxiosInstance().patch(endpoint);
    setCart((prev) =>
      prev.map((item) =>
        item._id === cartId ? { ...item, soluong: item.soluong + value } : item
      )
    );
    // Đồng bộ enrichedCart
    setEnrichedCart((prev) =>
      prev.map((item) =>
        item._id === cartId ? { ...item, soluong: item.soluong + value } : item
      )
    );
  } catch (err) {
    showModal('error', 'Lỗi', 'Số lượng vượt quá tồn kho.');
  }
};

  const navigateToProductDetail = (productId) => {
    if (productId) {
      router.push({
        pathname: '/productDetail',
        params: { productId },
      });
    }
  };

  const toggleSelectItem = (index) => {
    setSelectedItems((prev) => {
      const newSelected = [...prev];
      newSelected[index] = !newSelected[index];
      return newSelected;
    });
    setSelectAll(selectedItems.every((item, i) => (i === index ? !item : item)));
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setSelectedItems(new Array(cart.length).fill(newSelectAll));
  };

  const getTotal = () => {
    const total = cart.reduce(
      (sum, item, index) =>
        selectedItems[index]
          ? sum + (item.productVariant?.productID?.price || 0) * (item.soluong || 1)
          : sum,
      0
    );
    const selectedCount = selectedItems.filter(Boolean).length;
    return { total, selectedCount };
  };

 // Cart.tsx
const navigateToCheckout = () => {
  if (cart.length === 0 || !selectedItems.some(Boolean)) {
    showModal('error', 'Thông báo', 'Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
    return;
  }

  const selectedProducts = cart
    .map((item, index) => {
      if (!selectedItems[index]) return null;

      // tìm đúng item enrich theo _id (an toàn hơn dùng index)
      const enriched = enrichedCart.find(e => e._id === item._id);

      const imgFromEnriched =
        enriched?.__view?.Image ||
        (Array.isArray(enriched?.__view?.Images) ? enriched.__view.Images[0] : undefined);

      const fallbackImg =
        products.find((p) => p.ProductID === item.productVariant?.productID?._id)?.Image ||
        'https://via.placeholder.com/120';

      return {
        cartId: item._id,
        productId: item.productVariant?.productID?._id,
        name: enriched?.__view?.Name || item.productVariant?.productID?.name,
        color: item.productVariant?.color,
        size: item.productVariant?.size,
        price: item.productVariant?.productID?.price,
        quantity: item.soluong,
        image: imgFromEnriched || fallbackImg,                 // 👈 gửi đúng ảnh đã enrich
        images: enriched?.__view?.Images || [imgFromEnriched || fallbackImg], // (tuỳ bạn có cần mảng)
        categoryID: item.productVariant?.productID?.categoryID // nếu cần
      };
    })
    .filter(Boolean);

  router.push({
    pathname: '../address',
    params: { selectedProducts: JSON.stringify(selectedProducts) },
  });
};


  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#ee4d2d" />
      </View>
    );
  }

  if (error && !user?._id) {
    return (
      <View style={styles.authContainer}>
        <Image source={emptyImg} style={styles.emptyImage} resizeMode="contain" />
        <Text style={styles.authTitle}>Bạn chưa đăng nhập</Text>
        <Text style={styles.authDesc}>Vui lòng đăng nhập để quản lý giỏ hàng và đặt hàng nhé!</Text>
        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.authBtn,
              styles.loginBtn,
              pressed && { transform: [{ scale: 0.95 }], opacity: 0.8 },
            ]}
            onPress={() => router.push('/login')}
            accessibilityLabel="Đăng nhập để tiếp tục"
          >
            <Ionicons name="log-in-outline" size={24} color="#fff" />
            <Text style={styles.btnText}>Đăng nhập</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.authBtn,
              styles.backBtn,
              pressed && { transform: [{ scale: 0.95 }], opacity: 0.8 },
            ]}
            onPress={() => router.back()}
            accessibilityLabel="Quay lại trang trước"
          >
            <Ionicons name="arrow-back-outline" size={24} color="#fff" />
            <Text style={styles.btnText}>Quay lại</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Giỏ hàng</Text>
      {cart.length > 0 && (
        <View style={styles.selectAllContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.checkbox,
              selectAll && styles.checkboxSelected,
              pressed && { transform: [{ scale: 0.95 }], opacity: 0.8 },
            ]}
            onPress={toggleSelectAll}
            accessibilityLabel="Chọn tất cả sản phẩm"
          >
            {selectAll && <Text style={styles.checkboxText}>✓</Text>}
          </Pressable>
          <Text style={styles.selectAllText}>Chọn tất cả ({cart.length})</Text>
        </View>
      )}
      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image source={emptyImg} style={styles.emptyImage} resizeMode="contain" />
          <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống!</Text>
          <Pressable
            style={({ pressed }) => [
              styles.authBtn,
              styles.shopNowBtn,
              pressed && { transform: [{ scale: 0.95 }], opacity: 0.8 },
            ]}
            onPress={() => router.push('/home')}
            accessibilityLabel="Mua sắm ngay bây giờ"
          >
            <Text style={styles.btnText}>Mua sắm ngay</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
         {/* THAY TOÀN BỘ KHỐI map Ở PHẦN RENDER BẰNG ĐOẠN NÀY */}
        {enrichedCart.map((item, idx) => {
          const productId = item.productVariant?.productID?._id;
          const imgUrl = item.__view?.Image || 'https://via.placeholder.com/120';
          const productName = item.__view?.Name || item.productVariant?.productID?.name || 'Tên sản phẩm';

          return (
            <Swipeable
              key={item._id}
              renderRightActions={() => (
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteButton,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => removeFromCart(item._id)}
                  accessibilityLabel="Xóa sản phẩm khỏi giỏ hàng"
                >
                  <Trash2 color="white" size={22} />
                </Pressable>
              )}
            >
              <View style={styles.card}>
                <Pressable
                  style={({ pressed }) => [
                    styles.checkbox,
                    selectedItems[idx] && styles.checkboxSelected,
                    pressed && { transform: [{ scale: 0.95 }], opacity: 0.8 },
                  ]}
                  onPress={() => toggleSelectItem(idx)}
                  accessibilityLabel={`Chọn sản phẩm ${productName}`}
                >
                  {selectedItems[idx] && <Text style={styles.checkboxText}>✓</Text>}
                </Pressable>

                <Image source={{ uri: imgUrl }} style={styles.image} />

                <View style={styles.info}>
                  <TouchableOpacity onPress={() => navigateToProductDetail(productId)}>
                    <Text style={styles.name} numberOfLines={2}>
                      {productName}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.variant}>
                    Màu: <Text style={styles.bold}>{item.productVariant?.color}</Text> | Size:{' '}
                    <Text style={styles.bold}>{item.productVariant?.size}</Text>
                  </Text>

                  <View style={styles.rowBetween}>
                    <Text style={styles.price}>
                      {(item.productVariant?.productID?.price || 0).toLocaleString('vi-VN')}đ
                    </Text>

                    <View style={styles.quantityContainer}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.quantityButton,
                          pressed && { backgroundColor: '#e0e0e0' },
                        ]}
                        onPress={() => updateQuantity(item._id, -1)}
                        accessibilityLabel="Giảm số lượng sản phẩm"
                      >
                        <Text style={styles.quantityText}>-</Text>
                      </Pressable>

                      <Text style={styles.quantity}>{item.soluong}</Text>

                      <Pressable
                        style={({ pressed }) => [
                          styles.quantityButton,
                          pressed && { backgroundColor: '#e0e0e0' },
                        ]}
                        onPress={() => updateQuantity(item._id, 1)}
                        accessibilityLabel="Tăng số lượng sản phẩm"
                      >
                        <Text style={styles.quantityText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            </Swipeable>
          );
        })}

          <View style={styles.bottomSection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                Tổng tiền ({getTotal().selectedCount} sản phẩm)
              </Text>
              <Text style={styles.summaryValue}>
                {getTotal().total.toLocaleString('vi-VN')}đ
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.checkoutButton,
                pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
              ]}
              onPress={navigateToCheckout}
              accessibilityLabel="Tiến hành thanh toán"
            >
              <LinearGradient
                colors={['#ff6b6b', '#ee4d2d']}
                style={styles.gradientButton}
              >
                <Text style={styles.checkoutButtonText}>Thanh toán</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      )}
      <CustomModal
        isVisible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
        onConfirm={modalConfig.onConfirm}
        showConfirmButton={modalConfig.showConfirmButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f8',
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f8',
    paddingHorizontal: 30,
    marginTop: 50,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22223b',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  authDesc: {
    fontSize: 16,
    color: '#60606e',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    marginHorizontal: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  loginBtn: {
    backgroundColor: '#ee4d2d',
  },
  backBtn: {
    backgroundColor: '#2d5fee',
  },
  shopNowBtn: {
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 40,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  root: {
    flex: 1,
    backgroundColor: '#f7f7f8',
    paddingTop: 50,
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f7f8',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#222',
    marginLeft: 16,
    marginBottom: 12,
    marginTop: 16,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginBottom: 12,
  },
  selectAllText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
    marginLeft: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: '#888',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#ee4d2d',
    borderColor: '#ee4d2d',
  },
  checkboxText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
    marginLeft: 12,
  },
  info: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 17,
    color: '#222',
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 24,
  },
  variant: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
    color: '#111',
  },
  price: {
    fontSize: 17,
    color: '#ee4d2d',
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 24,
    color: '#222',
    fontWeight: '600',
  },
  quantity: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  deleteButton: {
    backgroundColor: '#ee4d2d',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 100,
    borderRadius: 12,
    marginVertical: 8,
  },
  bottomSection: {
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  summaryValue: {
    fontSize: 19,
    color: '#ee4d2d',
    fontWeight: '700',
  },
  checkoutButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  emptyText: {
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default memo(Cart);
