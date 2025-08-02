import React, { useState, useCallback ,useMemo} from 'react';
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
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { useProducts } from '../store/useProducts';
import { useAuth } from '../store/useAuth';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { Ionicons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import CustomModal from './components/CustomModal'; // Import CustomModal (đảm bảo đường dẫn đúng)
import { Video } from 'expo-av';
import { KeyboardAvoidingView, Platform } from 'react-native';
import * as Linking from 'expo-linking';
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


const ProductDetail = () => {
const { productId } = useLocalSearchParams();
const id = Array.isArray(productId) ? productId[0] : productId;
const { getProductById, addToCart, fetchProductVariants, loading, error } = useProducts()
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [reviewTab, setReviewTab] = useState(0);
  const { width } = useWindowDimensions();
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState('1');
  const [currentIndex, setCurrentIndex] = useState(0);
  const gallery = useMemo(() => {
    if (!product) return [];
    return [
      ...(Array.isArray(product.Videos) && product.Videos.length > 0
        ? product.Videos.map((v) => ({ type: 'video', url: v }))
        : []),
      ...(Array.isArray(product.Images) && product.Images.length > 0
        ? product.Images.map((img) => ({ type: 'image', url: img }))
        : [{ type: 'image', url: product.Image }]),
    ];
  }, [product]);

  // Hàm mở tìm kiếm hình ảnh trên TinEye
const openTinEyeImageSearch = (imageUrl) => {
  const url = `https://tineye.com/search?url=${encodeURIComponent(imageUrl)}`;
  Linking.openURL(url);
};
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
  if (!id || typeof id !== 'string' || isDataLoaded) return;
  setIsDataLoaded(false);

  let productRes = null;
  let fetchedVariants = [];
  let images = [];
  let videos = [];
  let imgData = null;

  // 1. Lấy chi tiết sản phẩm
  try {
    productRes = await AxiosInstance().get(`/products/${id}`);
  } catch (err) {
  }

  // 2. Lấy biến thể sản phẩm
  try {
    fetchedVariants = await fetchProductVariants(id);
  } catch (err) {

  }

  // 3. Lấy ảnh/video bảng Image
  try {
  const imgRes = await AxiosInstance().get(`/img?productID=${id}`);
  console.log("==== IMAGE TABLE RESPONSE ====");
  console.log(imgRes);

  images = [];
  videos = [];
  if (Array.isArray(imgRes)) {
    imgRes.forEach(item => {
      if (Array.isArray(item.imageURL) && item.imageURL.length > 0) {
        images.push(...item.imageURL);
      }
      if (Array.isArray(item.videoURL) && item.videoURL.length > 0) {
        videos.push(...item.videoURL);
      }
    });
  } else {
    if (Array.isArray(imgRes.imageURL) && imgRes.imageURL.length > 0) {
      images = imgRes.imageURL;
    }
    if (Array.isArray(imgRes.videoURL) && imgRes.videoURL.length > 0) {
      videos = imgRes.videoURL;
    }
  }
} catch (err) {
  console.log("==== IMAGE TABLE ERROR ====");
  console.log(err);
}

  // 4. Fallback lấy ảnh/video từ product hoặc variant nếu Image chưa có
  if (!images.length && productRes && Array.isArray(productRes.images) && productRes.images.length > 0) {
    images = productRes.images;
    console.log("Fallback IMAGE FROM PRODUCT");
    console.log(images);
  }
  if (!videos.length && productRes && Array.isArray(productRes.videos) && productRes.videos.length > 0) {
    videos = productRes.videos;
    console.log("Fallback VIDEO FROM PRODUCT");
    console.log(videos);
  }
  if (!images.length && fetchedVariants.length > 0) {
    const variantWithImage = fetchedVariants.find(v => Array.isArray(v.images) && v.images.length > 0);
    images = variantWithImage ? variantWithImage.images : [];
    console.log("Fallback IMAGE FROM VARIANT");
    console.log(images);
  }
  if (!images.length) {
    images = ['https://via.placeholder.com/150'];
    console.log("Fallback IMAGE: Placeholder");
  }

  // 5. Thông tin chính sản phẩm
  const baseProduct = productRes || (fetchedVariants.length > 0 ? fetchedVariants[0].productID : {});
  console.log("==== FINAL PRODUCT INFO (FOR UI) ====");
  console.log({
    ProductID: baseProduct._id,
    Name: baseProduct.name,
    Description: baseProduct.description,
    Price: baseProduct.price,
    Image: images[0],
    Images: images,
    Videos: videos,
    Rating: baseProduct.averageRating || 0,
    Status: typeof baseProduct.status === "boolean" ? baseProduct.status : true,
  });

  setProduct({
    ProductID: baseProduct._id,
    Name: baseProduct.name,
    Description: baseProduct.description,
    Price: baseProduct.price,
    Image: images[0],
    Images: images,
    Videos: videos,
    Rating: baseProduct.averageRating || 0,
    Status: typeof baseProduct.status === "boolean" ? baseProduct.status : true,
  });

  setVariants(fetchedVariants || []);
  setSelectedVariant(fetchedVariants.length ? fetchedVariants[0] : null);

  // 6. Lấy review
  try {
    const reviewData = await AxiosInstance().get(`/review/product/${id}`);
    console.log("==== REVIEW DATA ====");
    console.log(reviewData);
    setReviews(reviewData || []);
  } catch (err) {
    console.log("==== REVIEW ERROR ====");
    console.log(err);
    setReviews([]);
  }

  setIsDataLoaded(true);
}, [id, isDataLoaded]);

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
  const calcAverageRating = (reviewsArr) => {
  if (!reviewsArr.length) return 0;
  const total = reviewsArr.reduce((sum, r) => sum + (r.rating || 0), 0);
  return total / reviewsArr.length;
};
const averageRating = calcAverageRating(reviews);
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
           {/* Nút Back */}
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          {/* Icon Giỏ Hàng */}
          <TouchableOpacity onPress={() => router.push('/home/cart')}>
            <Ionicons name="cart-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
          <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 40}
  >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Ảnh sản phẩm */}
      <FlatList
        data={gallery}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        removeClippedSubviews={false}
        windowSize={2}
        initialNumToRender={1}
        onMomentumScrollEnd={e => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        renderItem={({ item, index }) =>
          item.type === 'video' ? (
            <Video
              source={{ uri: item.url }}
              useNativeControls
              resizeMode="contain"
              style={{ width: width, height: 350, backgroundColor: '#000' }}
              onPlaybackStatusUpdate={status => {
                console.log('Video status:', status);
                if (status.isPlaying) console.log('User played video');
              }}
            />
          ) : (
            <Image
              source={{ uri: item.url }}
              style={{ width: width, height: 350, resizeMode: 'contain', backgroundColor: '#f5f5f5' }}
            />
          )
        }
      />      
   {product?.Image && (
  <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 8}}>
    <TouchableOpacity
      style={[styles.compareImageButton, {marginLeft: 8, backgroundColor: '#0089CF'}]}
      onPress={() => openTinEyeImageSearch(product.Image)}
    >
      <Ionicons name="image" size={18} color="#fff" />
      <Text style={styles.compareImageButtonText}>Tìm kiếm hình ảnh TinEye</Text>
    </TouchableOpacity>
  </View>
)}


        <View style={styles.details}>
          <Text style={styles.name}>{product.Name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{product.Price} VNĐ</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                  key={i}
                  name={
                    averageRating >= i
                      ? 'star'
                      : averageRating >= i - 0.5
                      ? 'star-half'
                      : 'star-outline'
                  }
                  size={16}
                  color="#FFD700"
                  style={{ marginRight: 1 }}
                />
              ))}
              <Text style={styles.ratingText}>
                {` ${averageRating.toFixed(1)} (${totalReview} đánh giá)`}
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
              onPress={() => {
                const next = Math.max(1, quantity - 1);
                setQuantity(next);
                setQuantityInput(next.toString());
              }}
              disabled={quantity <= 1}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.quantityInput, { paddingTop: 5 }]}
              value={quantityInput}
              keyboardType="numeric"
              onChangeText={(text) => {
                if (/^\d*$/.test(text)) setQuantityInput(text);
              }}
              onEndEditing={() => {
                let num = parseInt(quantityInput, 10);
                if (isNaN(num) || num < 1) num = 1;
                if (num > (selectedVariant?.stock || 1)) num = selectedVariant?.stock || 1;
                setQuantity(num);
                setQuantityInput(num.toString());
              }}
            />
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                const next = Math.min(quantity + 1, selectedVariant?.stock || 1);
                setQuantity(next);
                setQuantityInput(next.toString());
              }}
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
      </KeyboardAvoidingView>
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
  compareImageButton: {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'center',
  marginVertical: 10,
  backgroundColor: '#4285F4', // Google Blue
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 24,
  elevation: 3,
},
compareImageButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 15,
  marginLeft: 6,
},

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