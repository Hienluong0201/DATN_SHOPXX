import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Thêm icon cho nút Back
import { router } from 'expo-router';
const OrderDetail = () => {
  const { orderId } = useLocalSearchParams();

  // Dữ liệu mẫu để khớp với hình ảnh
  const sampleOrderDetails = [
    {
      OrderDetailID: 1,
      OrderID: orderId || 1,
      Image: 'https://example.com/brown_suit.jpg',
      Name: 'Brown Suit',
      Price: '$120.00',
      Quantity: 1,
      PaymentMethod: 'CARD',
      OrderDate: '25/05/2025',
      OrderCode: 'TRK452162442',
      Timeline: [
        { status: 'Đơn hàng đã đặt', date: '23/05/2025', time: '04:25 PM', icon: 'cart' },
        { status: 'Đang liên hệ', date: '23/05/2025', time: '04:25 PM', icon: 'call' },
        { status: 'Đã xuất vận chuyển', date: '23/05/2025', time: '04:25 PM', icon: 'cube' },
        { status: 'Giao hàng thành công', date: '23/05/2025', time: '04:25 PM', icon: 'checkmark-circle' },
      ],
    },
  ];

  const goBack = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.title}>Chi tiết đơn hàng</Text>
        <View style={styles.placeholder} />
      </View>
      {sampleOrderDetails.map((detail) => (
        <View key={detail.OrderDetailID}>
          <View style={styles.productCard}>
            <Image source={{ uri: detail.Image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{detail.Name}</Text>
              <Text style={styles.productPrice}>{detail.Price}</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Ngày đặt hàng</Text>
            <Text style={styles.infoValue}>{detail.OrderDate}</Text>
            <Text style={styles.infoLabel}>Mã đơn hàng</Text>
            <Text style={styles.infoValue}>{detail.OrderCode}</Text>
          </View>
          <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
          <View style={styles.timelineContainer}>
            {detail.Timeline.map((step, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineIcon}>
                  <Ionicons
                    name={step.icon}
                    size={20}
                    color={index === detail.Timeline.length - 1 ? '#28A745' : '#666'}
                  />
                  {index < detail.Timeline.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>
                <View style={styles.timelineDetails}>
                  <Text style={styles.timelineStatus}>{step.status}</Text>
                  <Text style={styles.timelineDate}>{step.date}, {step.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { padding: 5 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', flex: 1, textAlign: 'center' },
  placeholder: { width: 24 },
  productCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3 },
  productImage: { width: 80, height: 80, resizeMode: 'cover', borderRadius: 10 },
  productInfo: { marginLeft: 15, flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  productPrice: { fontSize: 14, color: '#c0392b', fontWeight: '700', marginTop: 5 },
  infoCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3 },
  infoLabel: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  infoValue: { fontSize: 16, color: '#666', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginVertical: 10 },
  timelineContainer: { backgroundColor: '#fff', padding: 15, borderRadius: 15, elevation: 3 },
  timelineItem: { flexDirection: 'row', marginBottom: 15 },
  timelineIcon: { alignItems: 'center', marginRight: 15 },
  timelineLine: { width: 2, height: 30, backgroundColor: '#e0e0e0', position: 'absolute', top: 30, zIndex: -1 },
  timelineDetails: { flex: 1 },
  timelineStatus: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  timelineDate: { fontSize: 14, color: '#666', marginTop: 5 },
});

export default OrderDetail;