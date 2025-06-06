import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { useProducts } from '../store/useProducts';
import { useAuth } from '../store/useAuth';
import AxiosInstance from '../axiosInstance/AxiosInstance';

// Chuẩn hóa giá
const formatPrice = (price: string | number | undefined | null) => {
  if (price == null) return '0';
  const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g, '')) : price;
  return isNaN(numPrice) ? '0' : numPrice.toLocaleString('vi-VN');
};

// Hàm gọi API thêm vào giỏ hàng
const addToCartAPI = async (userID: string, productVariant: string, soluong: number) => {
  try {
    const res = await AxiosInstance().post('/cart', {
      userID,
      productVariant,
      soluong,
    });
    return res.data;
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error.message || 'Lỗi khi thêm vào giỏ hàng';
    throw new Error(errorMsg);
  }
};

const ProductDetail = () => {
  const { productId } = useLocalSearchParams();
  const { getProductById, addToCart, fetchProductVariants, loading, error } = useProducts();
  const [product, setProduct] = useState<any | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const { user } = useAuth();

  // Tải dữ liệu sản phẩm và biến thể
  const loadData = useCallback(async () => {
    if (!productId || typeof productId !== 'string' || isDataLoaded) return;

    setIsDataLoaded(false);
    try {
      const fetchedProduct = getProductById(productId);
      const fetchedVariants = await fetchProductVariants(productId);

      setProduct(fetchedProduct || null);
      setVariants(fetchedVariants || []);
      setSelectedVariant(fetchedVariants.length ? fetchedVariants[0] : null);
      setIsDataLoaded(true);
    } catch (err) {
      setIsDataLoaded(true);
    }
  }, [productId, getProductById, fetchProductVariants, isDataLoaded]);

  // Chỉ gọi loadData một lần khi màn hình focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Xử lý thay đổi số lượng
  const handleQuantityChange = useCallback((action: 'increase' | 'decrease') => {
    if (action === 'increase' && selectedVariant?.stock > quantity) {
      setQuantity((prev) => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  }, [quantity, selectedVariant?.stock]);

  // Xử lý thêm vào giỏ hàng (server-side)
  const handleAddToCart = useCallback(async () => {
    if (!user || !user._id) {
      alert('Bạn cần đăng nhập để thêm vào giỏ hàng!');
      return;
    }
    if (product && selectedVariant) {
      try {
        await addToCartAPI(user._id, selectedVariant._id, quantity);
        alert('Đã thêm vào giỏ hàng!');
        // addToCart(cartItem, quantity); // Nếu muốn đồng bộ local UI, giữ lại dòng này
      } catch (error: any) {
        alert(error?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng.');
      }
    } else {
      alert('Vui lòng chọn biến thể trước khi thêm vào giỏ hàng.');
    }
  }, [product, selectedVariant, quantity, user]);

  // Xử lý mua ngay (giữ nguyên hoặc có thể gọi API phía trên, rồi push checkout)
  const handleBuyNow = useCallback(() => {
    if (product && selectedVariant) {
      const cartItem = {
        ...product,
        variant: {
          variantId: selectedVariant._id,
          size: selectedVariant.size,
          color: selectedVariant.color,
          stock: selectedVariant.stock,
        },
      };
      addToCart(cartItem, quantity);
      router.push('./checkout');
    } else {
      alert('Vui lòng chọn biến thể trước khi mua.');
    }
  }, [product, selectedVariant, quantity, addToCart]);

  // Hiển thị loading
  if (!isDataLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6200" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  // Hiển thị lỗi hoặc không tìm thấy sản phẩm
  if (error || !product) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error || 'Không tìm thấy sản phẩm'}</Text>
      </View>
    );
  }

  // Kiểm tra nếu không có biến thể
  if (variants.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 70 }}>
          <Image source={{ uri: product.Image }} style={styles.image} />
          <View style={styles.details}>
            <Text style={styles.name}>{product.Name}</Text>
            <Text style={styles.price}>{formatPrice(product.Price)} VNĐ</Text>
            <Text style={styles.description}>{product.Description || 'Không có mô tả'}</Text>
            <Text style={styles.discontinuedText}>Sản phẩm đã ngừng kinh doanh</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Nhóm biến thể theo màu sắc
  const colors = Array.from(new Set(variants.map((v) => v.color)));
  const sizesByColor = (color: string) => variants.filter((v) => v.color === color).map((v) => v.size);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 70 }}>
        {/* Ảnh sản phẩm */}
        <Image source={{ uri: product.Image }} style={styles.image} />

        <View style={styles.details}>
          {/* Tên sản phẩm */}
          <Text style={styles.name}>{product.Name}</Text>

          {/* Giá và đánh giá */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(product.Price)} VNĐ</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>{product.Rating || '4.0'} (100 đánh giá)</Text>
            </View>
          </View>

          {/* Mô tả ngắn */}
          <Text style={styles.description}>{product.Description || 'Không có mô tả'}</Text>

          {/* Chọn màu sắc */}
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

          {/* Chọn kích thước */}
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
                      const variant = variants.find((v) => v.color === selectedVariant.color && v.size === size);
                      setSelectedVariant(variant);
                    }}
                  >
                    <Text style={styles.variantButtonText}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Số lượng */}
          {selectedVariant && (
            <>
              <Text style={styles.section}>Số lượng</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange('decrease')}
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
                  onPress={() => handleQuantityChange('increase')}
                  disabled={quantity >= (selectedVariant?.stock || 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.stockText}>Tồn kho: {selectedVariant?.stock || 0}</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Thanh hành động cố định dưới cùng */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  description: { fontSize: 14, color: '#666', marginBottom: 15 },
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
});

export default ProductDetail;
