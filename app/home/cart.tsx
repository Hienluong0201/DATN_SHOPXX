import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  GestureResponderEvent
} from 'react-native';
import { useProducts } from '../../store/useProducts';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const Cart = () => {
  const sampleCart = [
    { CartID: 1, Image: 'https://example.com/brown_jacket.jpg', Name: 'Brown Jacket', Price: '$39.97', Quantity: 1 },
    { CartID: 2, Image: 'https://example.com/brown_suit.jpg', Name: 'Brown Suit', Price: '$120.00', Quantity: 1 },
    { CartID: 3, Image: 'https://example.com/brown_jacket_xl.jpg', Name: 'Brown Jacket Size XL', Price: '$39.97', Quantity: 1 },
  ];

  const { cart, loading, error, removeFromCart } = useProducts();
  const navigateToCheckout = () => router.push('../address');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#CDA15E" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const displayCart = cart.length > 0 ? cart : sampleCart;

  const renderRightActions = (progress: any, dragX: any, item: any) => {
    const handleDelete = (event: GestureResponderEvent) => {
      removeFromCart(item.CartID);
    };

    return (
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>Xóa</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Giỏ hàng</Text>
      <View style={styles.separator} />
      {displayCart.length === 0 ? (
        <Text style={styles.emptyText}>Giỏ hàng trống</Text>
      ) : (
        <>
          {displayCart.map((item) => (
            <Swipeable
              key={item.CartID}
              renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
            >
              <View style={styles.card}>
                <Image source={{ uri: item.Image }} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.Name}</Text>
                  <Text style={styles.price}>{item.Price} x {item.Quantity}</Text>
                </View>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity style={styles.quantityButton}>
                    <Text style={styles.quantityText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.Quantity}</Text>
                  <TouchableOpacity style={styles.quantityButton}>
                    <Text style={styles.quantityText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Swipeable>
          ))}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Mã giảm giá</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Phí dịch vụ</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalText}>Thành tiền</Text>
              <Text style={styles.totalValue}>$199.94</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={navigateToCheckout}>
            <Text style={styles.checkoutButtonText}>Xác nhận thanh toán</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8', padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 },
  separator: { height: 1, backgroundColor: '#E0E0E0', marginBottom: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginBottom: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center'
  },
  image: { width: 80, height: 80, borderRadius: 14, resizeMode: 'cover' },
  info: { marginLeft: 14, flex: 1 },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A2A2A',
    marginBottom: 4,
    fontFamily: 'serif', // Sang trọng hơn, có thể đổi thành font custom nếu muốn
  },
  price: { fontSize: 14, color: '#CDA15E', fontWeight: '600' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: {
    backgroundColor: '#EFEFEF',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6
  },
  quantityText: { fontSize: 16, color: '#555', fontWeight: '600' },
  quantity: { fontSize: 16, color: '#1A1A1A', fontWeight: '600' },
  summary: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  summaryText: { fontSize: 15, color: '#444' },
  summaryValue: { fontSize: 15, fontWeight: '600', color: '#444' },
  totalText: { fontSize: 16, color: '#000', fontWeight: 'bold' },
  totalValue: { fontSize: 16, color: '#000', fontWeight: 'bold' },
  checkoutButton: {
    backgroundColor: '#CDA15E',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 40
  },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  emptyText: { fontSize: 16, color: '#888', textAlign: 'center', marginTop: 30 },
  errorText: { fontSize: 16, color: '#c0392b', textAlign: 'center', marginTop: 20 },
  deleteButton: {
    backgroundColor: '#CDA15E',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: 70,
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20
  },
  deleteText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default Cart;
