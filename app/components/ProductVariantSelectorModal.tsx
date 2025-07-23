import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface Variant {
  _id: string;
  color: string;
  size: string;
  stock: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (variantId: string, quantity: number) => void;
  variants: Variant[];
  product: { Image: string; Name: string; Price: string } | null;
}

const ProductVariantSelectorModal: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  variants,
  product,
}) => {
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState<number>(1);
  const [imageError, setImageError] = React.useState(false);

  const colors = Array.from(new Set(variants.map(v => v.color)));

  React.useEffect(() => {
    setImageError(false); // reset mỗi khi đổi sản phẩm
  }, [product?.Image]);

  const sizes = selectedColor
    ? Array.from(new Set(variants.filter(v => v.color === selectedColor).map(v => v.size)))
    : [];

  const selectedVariant = variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  );

  const getSelectedVariantId = (): string | null => {
    return selectedVariant?._id || null;
  };

  const handleConfirm = () => {
    const variantId = getSelectedVariantId();
    if (variantId) {
      onConfirm(variantId, quantity);
      onClose();
    }
  };

  React.useEffect(() => {
    // Reset khi mở modal hoặc đổi màu/size
    setSelectedColor(null);
    setSelectedSize(null);
    setQuantity(1);
  }, [visible]);

  React.useEffect(() => {
    setQuantity(1);
  }, [selectedColor, selectedSize]);

  if (!product) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={{ uri: product.Image || 'https://via.placeholder.com/100' }}
              style={styles.image}
            />
            <View style={styles.productInfo}>
              <Text style={styles.name}>{product.Name}</Text>
              <Text style={styles.price}>{product.Price}đ</Text>
            </View>
          </View>

          {/* Chọn màu */}
          <Text style={styles.sectionTitle}>Chọn màu sắc</Text>
          <ScrollView horizontal contentContainerStyle={styles.variantList}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.variantButton,
                  selectedColor === color && styles.variantButtonSelected,
                ]}
                onPress={() => {
                  setSelectedColor(color);
                  setSelectedSize(null);
                }}
              >
                <Text
                  style={[
                    styles.variantText,
                    selectedColor === color && styles.variantTextSelected,
                  ]}
                >
                  {color}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Chọn size */}
          {selectedColor && (
            <>
              <Text style={styles.sectionTitle}>Chọn kích thước</Text>
              <ScrollView horizontal contentContainerStyle={styles.variantList}>
                {sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.variantButton,
                      selectedSize === size && styles.variantButtonSelected,
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text
                      style={[
                        styles.variantText,
                        selectedSize === size && styles.variantTextSelected,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Chọn số lượng */}
          {selectedColor && selectedSize && selectedVariant && (
            <View style={styles.quantityContainer}>
              <Text style={styles.sectionTitle}>Số lượng</Text>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  onPress={() => setQuantity(q => Math.max(1, q - 1))}
                  style={[styles.quantityBtn, quantity <= 1 && styles.quantityBtnDisabled]}
                  disabled={quantity <= 1}
                >
                  <Text style={styles.quantityBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  onPress={() =>
                    setQuantity(q => Math.min(selectedVariant.stock, q + 1))
                  }
                  style={[
                    styles.quantityBtn,
                    quantity >= selectedVariant.stock && styles.quantityBtnDisabled,
                  ]}
                  disabled={quantity >= selectedVariant.stock}
                >
                  <Text style={styles.quantityBtnText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.stockText}>/ {selectedVariant.stock} còn lại</Text>
              </View>
            </View>
          )}

          {/* Xác nhận */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !(selectedColor && selectedSize && selectedVariant && quantity > 0) && { backgroundColor: '#ccc' },
            ]}
            onPress={handleConfirm}
            disabled={!(selectedColor && selectedSize && selectedVariant && quantity > 0)}
          >
            <Text style={styles.confirmText}>Thêm vào giỏ hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ProductVariantSelectorModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  productInfo: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
    color: '#8B4513',
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 10,
    fontSize: 15,
  },
  variantList: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  variantButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  variantButtonSelected: {
    backgroundColor: '#8B4513',
  },
  variantText: {
    color: '#333',
    fontSize: 14,
  },
  variantTextSelected: {
    color: '#fff',
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityBtn: {
    backgroundColor: '#eee',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 6,
  },
  quantityBtnDisabled: {
    opacity: 0.5,
  },
  quantityBtnText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    width: 32,
    textAlign: 'center',
  },
  stockText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  confirmButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  closeText: {
    color: '#8B4513',
    fontSize: 14,
  },
});
