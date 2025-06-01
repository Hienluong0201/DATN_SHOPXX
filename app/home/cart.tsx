import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, GestureResponderEvent } from 'react-native';
import { useProducts } from '../../store/useProducts';
import Swipeable from 'react-native-gesture-handler/Swipeable'; // Cần cài đặt package này

const Cart = () => {
  // Sample cart data to match the image
  const sampleCart = [
    { CartID: 1, Image: 'https://example.com/brown_jacket.jpg', Name: 'Brown Jacket', Price: '$39.97', Quantity: 1 },
    { CartID: 2, Image: 'https://example.com/brown_suit.jpg', Name: 'Brown Suit', Price: '$120.00', Quantity: 1 },
    { CartID: 3, Image: 'https://example.com/brown_jacket_xl.jpg', Name: 'Brown Jacket Size XL', Price: '$39.97', Quantity: 1 },
  ];

  const { cart, loading, error, removeFromCart } = useProducts(); // Giả sử có hàm removeFromCart

  const navigateToCheckout = () => router.push('../address');

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#d4af37" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Use sample data for now to match the image
  const displayCart = cart.length > 0 ? cart : sampleCart;

  const renderRightActions = (progress: any, dragX: any, item: any) => {
    const handleDelete = (event: GestureResponderEvent) => {
      removeFromCart(item.CartID); // Gọi hàm xóa sản phẩm
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
              <Text style={styles.summaryText}>Thành tiền</Text>
              <Text style={styles.summaryValue}>$199.94</Text>
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
  container: { flex: 1, padding: 10, backgroundColor: '#f0f2f5' },
  title: { fontSize: 24, fontWeight: '800', margin: 10, color: '#1a1a1a' },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, marginBottom: 10, borderRadius: 15, elevation: 5, alignItems: 'center' },
  image: { width: 80, height: 80, resizeMode: 'cover', borderRadius: 10 },
  info: { marginLeft: 10, flex: 1, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  price: { fontSize: 14, color: '#c0392b', fontWeight: '700' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { backgroundColor: '#e0e0e0', padding: 5, borderRadius: 10, marginHorizontal: 5 },
  quantityText: { fontSize: 16, color: '#333', fontWeight: '600' },
  quantity: { fontSize: 16, marginHorizontal: 10, color: '#333' },
  summary: { backgroundColor: '#fff', padding: 10, borderRadius: 15, marginBottom: 10, elevation: 5 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  summaryText: { fontSize: 16, color: '#2c2c2c' },
  summaryValue: { fontSize: 16, color: '#2c2c2c', fontWeight: '600' },
  checkoutButton: { backgroundColor: '#d4af37', padding: 12, borderRadius: 12, alignItems: 'center', margin: 10 },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyText: { fontSize: 16, color: '#2c2c2c', textAlign: 'center', marginTop: 20 },
  errorText: { fontSize: 16, color: '#c0392b', textAlign: 'center', marginTop: 20 },
  deleteButton: { backgroundColor: '#ff4444', justifyContent: 'center', alignItems: 'center', width: 70, height: '100%', borderRadius: 10 },
  deleteText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default Cart;