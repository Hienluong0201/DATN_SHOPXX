import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  FlatList
} from 'react-native';
import AxiosInstance from '../../axiosInstance/AxiosInstance';
import { Ionicons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

const ModalProductDetail = ({ productId, onClose }) => {
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewTab, setReviewTab] = useState(0);
  const { width } = useWindowDimensions();

  // Gọi API khi productId thay đổi
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    Promise.all([
      AxiosInstance().get(`/api/v1/product/${productId}`),
      AxiosInstance().get(`/api/v1/product/${productId}/variants`),
      AxiosInstance().get(`/review/product/${productId}`)
    ]).then(([prodRes, variantsRes, reviewsRes]) => {
      setProduct(prodRes);
      setVariants(variantsRes || []);
      setSelectedVariant((variantsRes && variantsRes[0]) || null);
      setReviews(reviewsRes || []);
    }).catch(() => {
      setProduct(null);
      setVariants([]);
      setSelectedVariant(null);
      setReviews([]);
    }).finally(() => setLoading(false));
  }, [productId]);

  // Nhóm biến thể theo màu sắc
  const colors = Array.from(new Set(variants.map((v) => v.color)));
  const sizesByColor = (color) =>
    variants.filter((v) => v.color === color).map((v) => v.size);

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

  if (loading) {
    return (
      <View style={modalStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#ee4d2d" />
        <Text style={{marginTop: 10}}>Đang tải thông tin sản phẩm...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={modalStyles.loadingContainer}>
        <Text>Không tìm thấy sản phẩm</Text>
        <TouchableOpacity onPress={onClose}><Text style={{color:'#ee4d2d',marginTop:8}}>Đóng</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={modalStyles.container}>
      {/* Nút Đóng */}
      <TouchableOpacity
        style={modalStyles.closeBtn}
        onPress={onClose}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      >
        <Ionicons name="close" size={28} color="#222" />
      </TouchableOpacity>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* Ảnh sản phẩm */}
        <FlatList
          data={product.Images || [product.Image]}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{
                width: width,
                height: 320,
                resizeMode: 'contain',
                backgroundColor: '#f7f7f7',
              }}
            />
          )}
        />
        <View style={modalStyles.details}>
          <Text style={modalStyles.name}>{product.Name}</Text>
          <View style={modalStyles.priceContainer}>
            <Text style={modalStyles.price}>{product.Price} VNĐ</Text>
            <View style={modalStyles.ratingContainer}>
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
              <Text style={modalStyles.ratingText}>
                {` ${product.Rating ? product.Rating.toFixed(1) : '0.0'} (${totalReview} đánh giá)`}
              </Text>
            </View>
          </View>
          {/* Mô tả sản phẩm */}
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
            />
          </View>

          {/* Chọn màu sắc */}
          {colors.length > 0 && (
            <>
              <Text style={modalStyles.section}>Màu sắc</Text>
              <View style={modalStyles.variantRow}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      modalStyles.variantButton,
                      selectedVariant?.color === color ? modalStyles.selectedVariantButton : null,
                    ]}
                    onPress={() => {
                      const variant = variants.find((v) => v.color === color);
                      setSelectedVariant(variant);
                    }}
                  >
                    <Text style={modalStyles.variantButtonText}>{color}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Chọn size */}
          {selectedVariant && sizesByColor(selectedVariant.color).length > 0 && (
            <>
              <Text style={modalStyles.section}>Kích thước</Text>
              <View style={modalStyles.variantRow}>
                {sizesByColor(selectedVariant.color).map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      modalStyles.variantButton,
                      selectedVariant?.size === size ? modalStyles.selectedVariantButton : null,
                    ]}
                    onPress={() => {
                      const variant = variants.find(
                        (v) => v.color === selectedVariant.color && v.size === size
                      );
                      setSelectedVariant(variant);
                    }}
                  >
                    <Text style={modalStyles.variantButtonText}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Số lượng */}
          {selectedVariant && (
            <>
              <Text style={modalStyles.section}>Số lượng</Text>
              <View style={modalStyles.quantityContainer}>
                <TouchableOpacity
                  style={modalStyles.quantityButton}
                  onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  <Text style={modalStyles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={[modalStyles.quantityInput, { paddingTop: 5 }]}
                  value={quantity.toString()}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const num = parseInt(text) || 1;
                    if (num <= (selectedVariant?.stock || 1)) setQuantity(num);
                  }}
                />
                <TouchableOpacity
                  style={modalStyles.quantityButton}
                  onPress={() =>
                    setQuantity((prev) =>
                      prev < (selectedVariant?.stock || 1) ? prev + 1 : prev
                    )
                  }
                  disabled={quantity >= (selectedVariant?.stock || 1)}
                >
                  <Text style={modalStyles.quantityButtonText}>+</Text>
                </TouchableOpacity>
                <Text style={modalStyles.stockText}>
                  Tồn kho: {selectedVariant?.stock || 0}
                </Text>
              </View>
            </>
          )}

          {/* Tabs + List review */}
          <Text style={[modalStyles.section, { marginTop: 28 }]}>Đánh giá sản phẩm</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {reviewTabs.map((tab) => (
              <TouchableOpacity
                key={tab.value}
                style={[
                  modalStyles.reviewTabButton,
                  reviewTab === tab.value && modalStyles.activeReviewTab,
                ]}
                onPress={() => setReviewTab(tab.value)}
              >
                <Text
                  style={[
                    modalStyles.reviewTabText,
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
              <View key={rv._id} style={modalStyles.reviewCard}>
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
      {/* Bạn có thể bổ sung nút Thêm vào giỏ / Mua ngay phía dưới nếu muốn */}
    </View>
  );
};

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 18,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 4,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
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

export default ModalProductDetail;