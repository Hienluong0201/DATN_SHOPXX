import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useNavigation } from '@react-navigation/native';

const TAB_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang hoạt động', value: 'active' },
  { label: 'Đã hết hạn', value: 'expired' },
];

const VoucherScreen = ({ onSelect }) => {
  const navigation = useNavigation();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch voucher
  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AxiosInstance().get('/voucher');
      setVouchers(res.data || []);
    } catch {
      setVouchers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // Lọc voucher theo tab
  const filteredVouchers = vouchers.filter(v => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return v.isActive;
    if (activeTab === 'expired') return !v.isActive;
    return true;
  });

  // Định dạng ngày
  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

  // Card voucher
  const renderVoucher = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onSelect?.(item)}
      activeOpacity={0.85}
    >
      <View style={styles.row}>
        <Text style={styles.code}>{item.code}</Text>
        <View style={[
          styles.badge,
          { backgroundColor: item.isActive ? "#d1fae5" : "#fee2e2" }
        ]}>
          <Ionicons
            name={item.isActive ? "checkmark-circle" : "close-circle"}
            size={15}
            color={item.isActive ? "#059669" : "#b91c1c"}
            style={{ marginRight: 4 }}
          />
          <Text style={{
            color: item.isActive ? "#059669" : "#b91c1c",
            fontWeight: "700"
          }}>
            {item.isActive ? "Đang hoạt động" : "Hết hạn"}
          </Text>
        </View>
      </View>
      <Text style={styles.typeValue}>
        {item.discountType === 'percent'
          ? `Giảm ${item.discountValue}%`
          : `Giảm ${item.discountValue.toLocaleString()}đ`}
      </Text>
      <Text style={styles.info}>Đơn tối thiểu: <Text style={styles.minOrder}>{item.minOrderValue.toLocaleString()}đ</Text></Text>
      <Text style={styles.info}>Hiệu lực: {formatDate(item.validFrom)} - {formatDate(item.validTo)}</Text>
      {/* ĐÃ BỎ NÚT CHỌN */}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voucher</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 6, marginBottom: 12 ,}}
      >
        {TAB_OPTIONS.map(tab => (
          <TouchableOpacity
            key={tab.value}
            style={[
              styles.tab,
              activeTab === tab.value && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.value)}
            activeOpacity={0.85}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.value && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Danh sách voucher */}
      {loading ? (
        <ActivityIndicator size="large" color="#059669" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={filteredVouchers}
          renderItem={renderVoucher}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingBottom: 22 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchVouchers();
              }}
              colors={['#059669']}
              tintColor="#059669"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetags-outline" size={62} color="#bdbdbd" />
              <Text style={{ color: "#888", marginTop: 12, fontSize: 15 }}>Không có voucher nào</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default VoucherScreen;

const TAB_HEIGHT = 42; // Chiều cao cố định cho tab

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', paddingTop: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
   backgroundColor: '#8B5A2B',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 3,
    shadowColor: '#059669',
  },
  backBtn: { padding: 3, marginRight: 10 },
  headerTitle: { flex: 1, color: "#fff", fontSize: 21, fontWeight: '800', textAlign: 'center', textTransform: "uppercase" },
  tab: {
    height: TAB_HEIGHT,
    paddingVertical: 0,  // Đã set height rồi, padding không cần
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    marginRight: 10,
    borderWidth: 1.2,
    borderColor: "#e0e7ef",
    alignItems: "center",
    justifyContent: "center",
    left: 20
  },
  activeTab: {
    backgroundColor: '#059669',
    borderColor: '#059669',
    elevation: 1,
  },
  tabText: {
    fontSize: 15,
    color: '#059669',
    fontWeight: '700',
    lineHeight: TAB_HEIGHT, // Giữa tab
    textAlign: "center",
    textAlignVertical: "center"
  },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    marginBottom: 18,
    marginHorizontal: 14,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1.1,
    borderColor: "#e0e7ef"
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  code: {
    fontSize: 20,
    fontWeight: '900',
    color: "#059669",
    letterSpacing: 1.5,
    textTransform: "uppercase"
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  typeValue: {
    fontWeight: 'bold',
    fontSize: 16.5,
    color: "#0284c7",
    marginVertical: 3,
  },
  info: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 1.5
  },
  minOrder: {
    fontWeight: 'bold',
    color: "#b91c1c"
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  }
});
