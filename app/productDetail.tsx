import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { useProducts } from '../store/useProducts';
import { useAuth } from '../store/useAuth';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { Ionicons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import CustomModal from './components/CustomModal'; // Import CustomModal (đảm bảo đường dẫn đúng)

// Hàm gọi API thêm vào giỏ hàng
const addToCartAPI = async (userID, productVariant, soluong) => {
  try {
    const res = await AxiosInstance().post('/cart', {
      userID,
      productVariant,
      soluong,
    });
    return res.data;
  } catch (error) {
    const errorMsg = error?.response?.data?.message || error.message || 'Lỗi khi thêm vào giỏ hàng';
    throw new Error(errorMsg);
  }
};

// Hàm gọi API gửi review
const sendReviewAPI = async ({ userID, productID, rating, comment }) => {
  try {
    const res = await AxiosInstance().post('/review', {
      userID,
      productID,
      rating,
      comment,
      status: 'true', // Review mới mặc định trạng thái pending
    });
    return res.data;
  } catch (error) {
    const errorMsg = error?.response?.data?.message || error.message || 'Lỗi khi gửi đánh giá';
    throw new Error(errorMsg);
  }
};

const ProductDetail = () => {
  const { productId } = useLocalSearchParams();
  const { getProductById, addToCart, fetchProductVariants, loading, error } = useProducts();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [reviewTab, setReviewTab] = useState(0);
  const { width } = useWindowDimensions();
  // Review form state
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [sendingReview, setSendingReview] = useState(false);

  // State để quản lý CustomModal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'success' as 'success' | 'error' | 'warning',
    title: '',
    message: '',
    showConfirmButton: false,
    onConfirm: () => {},
  });

  // Hàm hiển thị modal
  const showModal = (
    type: 'success' | 'error' | 'warning',
    title: string,
    message: string,
    showConfirmButton = false,
    onConfirm?: () => void
  ) => {
    setModalConfig({
      type,
      title,
      message,
      showConfirmButton,
      onConfirm: onConfirm || (() => {}),
    });
    setModalVisible(true);
  };

  // Lấy dữ liệu sản phẩm, biến thể, review
  const loadData = useCallback(async () => {
    if (!productId || typeof productId !== 'string' || isDataLoaded) return;
    setIsDataLoaded(false);
    try {
      const fetchedProduct = getProductById(productId);
      const fetchedVariants = await fetchProductVariants(productId);

      // Gọi API lấy review
      let reviewData = [];
      try {
        reviewData = await AxiosInstance().get(`/review/product/${productId}`);
        console.log("du lieu anh " , reviewData)
        setReviews(reviewData || []);
      } catch (err) {
        setReviews([]);
      }

      setProduct(fetchedProduct || null);
      setVariants(fetchedVariants || []);
      setSelectedVariant(fetchedVariants.length ? fetchedVariants[0] : null);
      setIsDataLoaded(true);
    } catch (err) {
      setIsDataLoaded(true);
    }
  }, [productId, getProductById, fetchProductVariants, isDataLoaded]);

  // Reload lại data sau khi gửi review thành công
  const reloadReview = async () => {
    try {
      const reviewData = await AxiosInstance().get(`/review/product/${productId}`);
      setReviews(reviewData || []);
    } catch {}
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Tính số lượng review theo từng sao
  const countByStar = (star) => reviews.filter((r) => r.rating === star).length;
  const totalReview = reviews.length;
  const reviewTabs = [
    { label: `Tất cả (${totalReview})`, value: 0 },
    { label: `5 Sao (${countByStar(5)})`, value: 5 },
    { label: `4 Sao (${countByStar(4)})`, value: 4 },
    { label: `3 Sao (${countByStar(3)})`, value: 3 },
    { label: `2 Sao (${countByStar(2)})`, value: 2 },
    { label: `1 Sao (${countByStar(1)})`, value: 1 },
  ];
  const filteredReviews =
    reviewTab === 0 ? reviews : reviews.filter((r) => r.rating === reviewTab);

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = useCallback(async () => {
    if (!user || !user._id) {
      showModal('warning', 'Thông báo', 'Bạn cần đăng nhập để thêm vào giỏ hàng!');
      return;
    }
    if (product && selectedVariant) {
      try {
        await addToCartAPI(user._id, selectedVariant._id, quantity);
        showModal('success', 'Thành công', 'Đã thêm sản phẩm vào giỏ hàng!');
      } catch (error) {
        showModal('error', 'Lỗi', error?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng.');
      }
    } else {
      showModal('warning', 'Thông báo', 'Vui lòng chọn màu và kích thước!');
    }
  }, [product, selectedVariant, quantity, user]);

  // Mua ngay
  const handleBuyNow = useCallback(async () => {
    if (!user || !user._id) {
      showModal('warning', 'Thông báo', 'Bạn cần đăng nhập để mua ngay!');
      return;
    }
    if (product && selectedVariant) {
      try {
        await addToCartAPI(user._id, selectedVariant._id, quantity);
        showModal('success', 'Thành công', 'Đã thêm vào giỏ hàng, chuyển đến giỏ hàng...', false, () => {
          router.push('/home/cart');
        });
        // Tự động chuyển sau 1 giây
        setTimeout(() => {
          setModalVisible(false);
          router.push('/home/cart');
        }, 1000);
      } catch (error) {
        showModal('error', 'Lỗi', error?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng.');
      }
    } else {
      showModal('warning', 'Thông báo', 'Vui lòng chọn màu và kích thước!');
    }
  }, [product, selectedVariant, quantity, user]);

  // Gửi review
  const handleSendReview = async () => {
    if (!user || !user._id) {
      showModal('warning', 'Thông báo', 'Bạn cần đăng nhập để đánh giá!');
      return;
    }
    if (!reviewComment.trim()) {
      showModal('warning', 'Thông báo', 'Vui lòng nhập nội dung đánh giá!');
      return;
    }
    setSendingReview(true);
    try {
      await sendReviewAPI({
        userID: user._id,
        productID: productId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      showModal('success', 'Thành công', 'Đánh giá đã gửi thành công!');
      setReviewComment('');
      setReviewRating(5);
      reloadReview();
    } catch (err) {
      showModal('error', 'Lỗi', err?.message || 'Không gửi được đánh giá.');
    }
    setSendingReview(false);
  };

  // UI
  if (!isDataLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6200" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error || 'Không tìm thấy sản phẩm'}</Text>
      </View>
    );
  }

  if (variants.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 70 }}>
          <Image source={{ uri: product.Image }} style={styles.image} />
          <View style={styles.details}>
            <Text style={styles.name}>{product.Name}</Text>
            <Text style={styles.price}>{product.Price} VNĐ</Text>
            <View style={{ minHeight: 40, marginBottom: 15 }}>
              <RenderHtml
                contentWidth={width - 30}
                source={{ html: product.Description || '<i>Không có mô tả</i>' }}
                tagsStyles={{
                  p: { color: '#666', fontSize: 14, marginBottom: 6 },
                  h1: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#222' },
                  h2: { fontSize: 18, fontWeight: '700', marginBottom: 6, color: '#222' },
                  h3: { fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#333' },
                  ul: { marginBottom: 6 },
                  li: { color: '#666', fontSize: 14 },
                  strong: { fontWeight: 'bold', color: '#333' },
                  em: { fontStyle: 'italic', color: '#666' },
                  a: { color: '#3498db', textDecorationLine: 'underline' },
                }}
                defaultTextProps={{
                  selectable: true,
                  numberOfLines: undefined,
                  ellipsizeMode: 'tail',
                }}
              />
            </View>
            <Text style={styles.discontinuedText}>Sản phẩm đã ngừng kinh doanh</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Nhóm biến thể theo màu sắc
  const colors = Array.from(new Set(variants.map((v) => v.color)));
  const sizesByColor = (color) =>
    variants.filter((v) => v.color === color).map((v) => v.size);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 70 }}
      >
        {/* Ảnh sản phẩm */}
        <Image source={{ uri: product.Image }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.name}>{product.Name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{product.Price} VNĐ</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                  key={i}
                  name={
                    product.Rating >= i
                      ? 'star'
                      : product.Rating >= i - 0.5
                      ? 'star-half'
                      : 'star-outline'
                  }
                  size={16}
                  color="#FFD700"
                  style={{ marginRight: 1 }}
                />
              ))}
              <Text style={styles.ratingText}>
                {` ${product.Rating ? product.Rating.toFixed(1) : '0.0'} (${totalReview} đánh giá)`}
              </Text>
            </View>
          </View>

          <View style={{ minHeight: 40, marginBottom: 15 }}>
            <RenderHtml
              contentWidth={width - 30}
              source={{ html: product.Description || '<i>Không có mô tả</i>' }}
              tagsStyles={{
                p: { color: '#666', fontSize: 14, marginBottom: 6 },
                h1: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#222' },
                h2: { fontSize: 18, fontWeight: '700', marginBottom: 6, color: '#222' },
                h3: { fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#333' },
                ul: { marginBottom: 6 },
                li: { color: '#666', fontSize: 14 },
                strong: { fontWeight: 'bold', color: '#333' },
                em: { fontStyle: 'italic', color: '#666' },
                a: { color: '#3498db', textDecorationLine: 'underline' },
              }}
              defaultTextProps={{
                selectable: true,
                numberOfLines: undefined,
                ellipsizeMode: 'tail',
              }}
            />
          </View>

          <Text style={styles.section}>Màu sắc</Text>
          <View style={styles.variantRow}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.variantButton,
                  selectedVariant?.color === color ? styles.selectedVariantButton : null,
                ]}
                onPress={() => {
                  const variant = variants.find((v) => v.color === color);
                  setSelectedVariant(variant);
                }}
              >
                <Text style={styles.variantButtonText}>{color}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedVariant && sizesByColor(selectedVariant.color).length > 0 && (
            <>
              <Text style={styles.section}>Kích thước</Text>
              <View style={styles.variantRow}>
                {sizesByColor(selectedVariant.color).map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.variantButton,
                      selectedVariant?.size === size ? styles.selectedVariantButton : null,
                    ]}
                    onPress={() => {
                      const variant = variants.find(
                        (v) => v.color === selectedVariant.color && v.size === size
                      );
                      setSelectedVariant(variant);
                    }}
                  >
                    <Text style={styles.variantButtonText}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          {selectedVariant && (
            <>
              <Text style={styles.section}>Số lượng</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity.toString()}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const num = parseInt(text) || 1;
                    if (num <= (selectedVariant?.stock || 1)) setQuantity(num);
                  }}
                />
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    setQuantity((prev) =>
                      prev < (selectedVariant?.stock || 1) ? prev + 1 : prev
                    )
                  }
                  disabled={quantity >= (selectedVariant?.stock || 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.stockText}>
                  Tồn kho: {selectedVariant?.stock || 0}
                </Text>
              </View>
            </>
          )}

          {/* Tabs + List review */}
          <Text style={[styles.section, { marginTop: 28 }]}>Đánh giá sản phẩm</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {reviewTabs.map((tab) => (
              <TouchableOpacity
                key={tab.value}
                style={[
                  styles.reviewTabButton,
                  reviewTab === tab.value && styles.activeReviewTab,
                ]}
                onPress={() => setReviewTab(tab.value)}
              >
                <Text
                  style={[
                    styles.reviewTabText,
                    reviewTab === tab.value && { color: '#ee4d2d', fontWeight: 'bold' },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {filteredReviews.length === 0 ? (
            <Text style={{ color: '#666', fontStyle: 'italic' }}>
              Chưa có đánh giá nào cho sản phẩm này.
            </Text>
          ) : (
            filteredReviews.map((rv) => (
              <View key={rv._id} style={styles.reviewCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="person-circle" size={28} color="#bbb" />
                  <Text style={{ marginLeft: 5, fontWeight: '600', color: '#333' }}>
                    {rv.userID?.name || 'Người dùng'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= rv.rating ? 'star' : 'star-outline'}
                      size={15}
                      color="#FFD700"
                    />
                  ))}
                  <Text style={{ fontSize: 12, color: '#888', marginLeft: 10 }}>
                    {new Date(rv.reviewDate || rv.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={{ color: '#222', marginTop: 2 }}>{rv.comment}</Text>
                {Array.isArray(rv.images) && rv.images.length > 0 && (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={{ marginTop: 10 }}
  >
    {rv.images.map((img, idx) => (
      <Image
        key={idx}
        source={{ uri: img }}
        style={{
          width: 80,
          height: 80,
          borderRadius: 8,
          marginRight: 8,
          backgroundColor: '#eee',
        }}
      />
    ))}
  </ScrollView>
)}
              </View>
            ))
          )}
        </View>
      </ScrollView>
      {variants.length > 0 && (
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.buttonText}>Thêm vào giỏ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
            <Text style={styles.buttonText}>Mua ngay</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Thêm CustomModal */}
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
  container: { flex: 1, backgroundColor: '#fff', marginTop: 40 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: { width: '100%', height: 350, resizeMode: 'contain', backgroundColor: '#f5f5f5' },
  details: { padding: 15, backgroundColor: '#fff' },
  name: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  priceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  price: { fontSize: 24, fontWeight: '700', color: '#ee4d2d' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, color: '#666', marginLeft: 5 },
  section: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginTop: 10, marginBottom: 5 },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  variantButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedVariantButton: { borderColor: '#ee4d2d', backgroundColor: '#fff5f5' },
  variantButtonText: { fontSize: 14, color: '#1a1a1a' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  quantityButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: { fontSize: 20, color: '#1a1a1a' },
  quantityInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    marginHorizontal: 10,
    fontSize: 16,
  },
  stockText: { fontSize: 14, color: '#666', marginLeft: 10 },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#ff6200',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 10,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#ee4d2d',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loadingText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10 },
  errorText: { fontSize: 16, color: '#ee4d2d', textAlign: 'center', marginTop: 20 },
  discontinuedText: { fontSize: 16, color: '#ee4d2d', textAlign: 'center', marginTop: 20, fontWeight: '600' },
  reviewTabButton: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  activeReviewTab: {
    borderColor: '#ee4d2d',
    backgroundColor: '#ffe6e1',
  },
  reviewTabText: {
    fontSize: 14,
    color: '#444',
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
});

export default ProductDetail;