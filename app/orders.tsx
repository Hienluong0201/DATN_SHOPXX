import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useAuth } from '../store/useAuth'; // Import useAuth

const Orders = () => {
  const { user, loadUser } = useAuth(); // Lấy user từ useAuth
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Tất cả');

  useEffect(() => {
    // Nếu user chưa có thì load user trước
    if (!user?._id) {
      loadUser();
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Gọi API lấy order theo user
        const response = await AxiosInstance().get(`/order/user/${user._id}`);
        setOrders(response); // Nếu response là mảng order
        setError(null);
      } catch (err) {
        setError('Không thể tải đơn hàng. Vui lòng thử lại sau.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const navigateToOrderDetail = (orderId: string) => {
    router.push({ pathname: './orderDetail', params: { orderId: orderId.toString() } });
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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

  // Lọc đơn hàng theo tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'Tất cả') return true;
    if (activeTab === 'Hoàn thành') return order.items?.some(item => item.Status === 'Thành công');
    if (activeTab === 'Đã hủy') return order.items?.some(item => item.Status === 'Đã hủy');
    return false;
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.title}>Đơn hàng của bạn</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.tabContainer}>
        {['Tất cả', 'Hoàn thành', 'Đã hủy'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
{filteredOrders.length === 0 ? (
        <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
      ) : (
        filteredOrders.map((order) => (
          <TouchableOpacity
            key={order._id || order.OrderID}
            style={styles.orderCard}
            onPress={() => navigateToOrderDetail((order._id || order.OrderID).toString())}
          >
            {order.items?.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Image source={{ uri: item.Image || 'https://via.placeholder.com/80' }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.Name}</Text>
                  <Text style={styles.itemSize}>{item.Size}</Text>
                  <Text style={styles.itemPrice}>Theo dõi đơn hàng</Text>
                </View>
                <View style={styles.statusContainer}>
                  <Text style={[
                    styles.statusText,
                    item.Status === 'Thành công' ? styles.success :
                    item.Status === 'Đang chờ' ? styles.pending :
                    styles.cancelled
                  ]}>
                    {item.Status}
                  </Text>
                </View>
              </View>
            ))}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  backButton: { padding: 5 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', flex: 1, textAlign: 'center' },
  placeholder: { width: 24 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  tab: { flex: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 20, alignItems: 'center', marginHorizontal: 5 },
  activeTab: { backgroundColor: '#8B5A2B' },
  tabText: { fontSize: 14, color: '#666' },
  activeTabText: { color: '#fff', fontWeight: '600' },
  orderCard: { backgroundColor: '#fff', marginBottom: 15, borderRadius: 15, elevation: 3 },
  orderItem: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  itemImage: { width: 80, height: 80, resizeMode: 'cover', borderRadius: 10 },
  itemDetails: { flex: 1, marginLeft: 15 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  itemSize: { fontSize: 14, color: '#666', marginTop: 5 },
  itemPrice: { fontSize: 14, color: '#8B5A2B', fontWeight: '600', marginTop: 5 },
  statusContainer: { alignItems: 'flex-end' },
  statusText: { fontSize: 14, fontWeight: '600', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  success: { backgroundColor: '#D4EDDA', color: '#28A745' },
  pending: { backgroundColor: '#FFF3CD', color: '#856404' },
  cancelled: { backgroundColor: '#F8D7DA', color: '#DC3545' },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
  errorText: { fontSize: 16, color: '#c0392b', textAlign: 'center', marginTop: 20 },
});

export default Orders;