import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const darkBrown = '#5D3A00';

const cartItems = [
  {
    id: 1,
    name: 'Áo len Chunky Cable',
    price: 35,
    size: 'L',
    image: 'https://example.com/jacket.jpg',
    quantity: 1,
    reviews: 1278,
    rating: 5
  },
  {
    id: 2,
    name: 'Áo nỉ Totally Feel Good',
    price: 25,
    size: 'L',
    image: 'https://example.com/sweater.jpg',
    quantity: 1,
    reviews: 2557,
    rating: 5
  }
];

const wishlistItems = [
  {
    id: 3,
    name: 'Quần short bò kem',
    price: 23,
    size: 'XL',
    image: 'https://example.com/shorts.jpg',
    reviews: 1278,
    rating: 5
  },
  {
    id: 4,
    name: 'Áo thun cổ tròn màu thu',
    price: 18,
    size: 'XXL',
    image: 'https://example.com/tshirt.jpg',
    reviews: 1278,
    rating: 5
  },
  {
    id: 5,
    name: 'Áo khoác caro len',
    price: 45,
    size: 'L',
    image: 'https://example.com/coat.jpg',
    reviews: 1278,
    rating: 5
  },
  {
    id: 6,
    name: 'Thắt lưng da nâu',
    price: 15,
    size: 'L',
    image: 'https://example.com/belt.jpg',
    reviews: 1278,
    rating: 5
  }
];

const CartScreen = () => {
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 3;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={24} color={darkBrown} />
        <Text style={styles.headerTitle}>Giỏ hàng của bạn</Text>
      </View>

      {/* Danh sách mua hàng */}
      <Text style={styles.sectionTitle}>Danh sách mua ({cartItems.length})</Text>
      {cartItems.map((item) => (
        <View key={item.id} style={styles.card}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.review}>⭐ {item.rating} ({item.reviews} đánh giá)</Text>
            <Text style={styles.price}>£ {item.price.toFixed(2)}</Text>
            <Text style={styles.size}>Size: {item.size}</Text>

            <View style={styles.actions}>
              <View style={styles.quantityBox}>
                <TouchableOpacity><Text style={styles.quantityButton}>-</Text></TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity><Text style={styles.quantityButton}>+</Text></TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.saveBtn}><Text style={styles.saveText}>Lưu lại</Text></TouchableOpacity>
              <TouchableOpacity style={styles.removeBtn}><Text style={styles.removeText}>Xóa</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {/* Tóm tắt đơn hàng */}
      <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
      <View style={styles.summary}>
        <SummaryRow label={`Sản phẩm (${cartItems.length})`} value={`£ ${total.toFixed(2)}`} />
        <SummaryRow label="Phí vận chuyển" value={`£ ${shipping.toFixed(2)}`} />
        <SummaryRow label="Tổng cộng" value={`£ ${(total + shipping).toFixed(2)}`} bold />
      </View>

      {/* Danh sách yêu thích */}
      <Text style={styles.sectionTitle}>Danh sách yêu thích ({wishlistItems.length})</Text>
      {wishlistItems.map((item) => (
        <View key={item.id} style={styles.card}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.review}>⭐ {item.rating} ({item.reviews} đánh giá)</Text>
            <Text style={styles.price}>£ {item.price.toFixed(2)}</Text>
            <Text style={styles.size}>Size: {item.size}</Text>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.addBtn}><Text style={styles.saveText}>Thêm vào giỏ</Text></TouchableOpacity>
              <TouchableOpacity style={styles.removeBtn}><Text style={styles.removeText}>Xóa</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const SummaryRow = ({ label, value, bold }: any) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.summaryLabel, bold && { fontWeight: 'bold' }]}>{label}</Text>
    <Text style={[styles.summaryValue, bold && { fontWeight: 'bold' }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F1', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: darkBrown, marginLeft: 8 },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: darkBrown, marginTop: 20, marginBottom: 10 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3
  },
  image: { width: 80, height: 80, borderRadius: 10 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '600', color: '#333' },
  review: { fontSize: 13, color: '#888', marginVertical: 2 },
  price: { fontSize: 16, fontWeight: 'bold', color: darkBrown },
  size: { fontSize: 13, color: '#555', marginBottom: 6 },

  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 10,
    paddingHorizontal: 6
  },
  quantityButton: { fontSize: 16, paddingHorizontal: 6, color: darkBrown },
  quantity: { fontSize: 14, fontWeight: '600', marginHorizontal: 4 },

  saveBtn: { paddingHorizontal: 10 },
  removeBtn: { paddingHorizontal: 10 },
  addBtn: { paddingHorizontal: 10 },
  saveText: { color: darkBrown, fontSize: 13 },
  removeText: { color: '#c0392b', fontSize: 13 },

  summary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 14, color: '#444' },
  summaryValue: { fontSize: 14, color: darkBrown }
});

export default CartScreen;
