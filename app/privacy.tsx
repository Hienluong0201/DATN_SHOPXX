import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../store/useAuth';
import MiniGameMenu from './components/MiniGameMenu'; // Đường dẫn đúng
import SpinGame from './components/SpinGame'; // Đường dẫn đúng

const VoucherScreen = () => {
  const navigation = useNavigation();
  const [showMiniGameMenu, setShowMiniGameMenu] = useState(false);
  const [showSpinGame, setShowSpinGame] = useState(false);
  const [publicVouchers, setPublicVouchers] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const { user } = useAuth();
  const userId = user?._id;

  // Lấy shop voucher public
  const fetchPublicVouchers = useCallback(async () => {
    try {
      const res = await AxiosInstance().get('/voucher/public');
      setPublicVouchers(res.data || []);
    } catch {
      setPublicVouchers([]);
    }
  }, []);

  // Lấy ví voucher của tôi
  const fetchMyVouchers = useCallback(async () => {
    try {
      const res = await AxiosInstance().get(`/voucherDetail/my-vouchers/${userId}`);
      setMyVouchers(res || []);
    } catch {
      setMyVouchers([]);
    }
  }, [userId]);

  // Làm mới tất cả
  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPublicVouchers(), fetchMyVouchers()]);
    setLoading(false);
    setRefreshing(false);
  }, [fetchPublicVouchers, fetchMyVouchers]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Nhận voucher (Claim)
  const claimVoucher = async (voucherId) => {
    try {
      const res = await AxiosInstance().post(`/voucherDetail/claim/${voucherId}`, { userId });
      Alert.alert('🎉', res.data.message || 'Nhận voucher thành công!');
      fetchAll();
    } catch (err) {
      Alert.alert('Thông báo', err.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  // Định dạng ngày
  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

  // Card voucher shop
  const renderVoucher = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.code}>{item.code}</Text>
        <View style={[styles.badge, { backgroundColor: "#e0e7ef" }]}>
          <Ionicons name="pricetag" size={15} color="#2563eb" style={{ marginRight: 4 }} />
          <Text style={{ color: "#2563eb", fontWeight: "700" }}>Shop Voucher</Text>
        </View>
      </View>
      <Text style={styles.typeValue}>
        {item.discountType === 'percent'
          ? `Giảm ${item.discountValue}%`
          : `Giảm ${item.discountValue.toLocaleString()}đ`}
      </Text>
      <Text style={styles.info}>Đơn tối thiểu: <Text style={styles.minOrder}>{item.minOrderValue.toLocaleString()}đ</Text></Text>
      <Text style={styles.info}>Hiệu lực: {formatDate(item.validFrom)} - {formatDate(item.validTo)}</Text>
      <TouchableOpacity style={styles.claimBtn} onPress={() => claimVoucher(item._id)}>
        <Text style={styles.claimText}>Nhận voucher</Text>
      </TouchableOpacity>
    </View>
  );

  // Card ví voucher của tôi
  const renderMyVoucher = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.code}>{item.voucher.code}</Text>
        <View style={[
          styles.badge,
          { backgroundColor: item.isUsed ? "#fee2e2" : "#d1fae5" }
        ]}>
          <MaterialIcons
            name={item.isUsed ? "cancel" : "verified"}
            size={15}
            color={item.isUsed ? "#b91c1c" : "#059669"}
            style={{ marginRight: 4 }}
          />
          <Text style={{
            color: item.isUsed ? "#b91c1c" : "#059669",
            fontWeight: "700"
          }}>
            {item.isUsed ? "Đã sử dụng" : "Chưa sử dụng"}
          </Text>
        </View>
      </View>
      <Text style={styles.typeValue}>
        {item.voucher.discountType === 'percent'
          ? `Giảm ${item.voucher.discountValue}%`
          : `Giảm ${item.voucher.discountValue.toLocaleString()}đ`}
      </Text>
      <Text style={styles.info}>Đơn tối thiểu: <Text style={styles.minOrder}>{item.voucher.minOrderValue.toLocaleString()}đ</Text></Text>
      <Text style={styles.info}>Hiệu lực: {formatDate(item.voucher.validFrom)} - {formatDate(item.voucher.validTo)}</Text>
    </View>
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

      {showSpinGame ? (
        <SpinGame
          onClose={() => setShowSpinGame(false)}
          onResult={(result) => {
            if (result && result.startsWith('Voucher')) {
              Alert.alert('Chúc mừng', `Bạn đã trúng: ${result}`);
              fetchAll();
            }
          }}
        />
      ) : showMiniGameMenu ? (
        <MiniGameMenu
          onSpin={() => {
            setShowMiniGameMenu(false);
            setShowSpinGame(true);
          }}
          onFlip={() => {
            setShowMiniGameMenu(false);
            Alert.alert('Lật thẻ', 'Game này đang phát triển!');
          }}
          onEgg={() => {
            setShowMiniGameMenu(false);
            Alert.alert('Đập trứng', 'Game này đang phát triển!');
          }}
        />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchAll();
              }}
              colors={['#059669']}
              tintColor="#059669"
            />
          }
        >
          {/* SHOP VOUCHER - Công khai */}
          <Text style={styles.sectionTitle}>🎁 Voucher shop có thể nhận</Text>
          {loading
            ? <ActivityIndicator size="large" color="#059669" style={{ marginTop: 15 }} />
            : (
              <FlatList
                data={publicVouchers}
                renderItem={renderVoucher}
                keyExtractor={item => item._id}
                contentContainerStyle={{ paddingBottom: 10 }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="pricetags-outline" size={62} color="#bdbdbd" />
                    <Text style={{ color: "#888", marginTop: 8, fontSize: 15 }}>Không có voucher nào công khai để nhận</Text>
                  </View>
                }
                scrollEnabled={false}
              />
            )
          }

          {/* MINI GAME */}
          <Text style={styles.sectionTitle}>🎲 Mini game nhận voucher</Text>
          <TouchableOpacity
            style={styles.claimBtn}
            onPress={() => setShowMiniGameMenu(true)}
          >
            <Ionicons name="game-controller" size={19} color="#fff" style={{ marginRight: 5 }} />
            <Text style={[styles.claimText, { color: "#fff" }]}>Chơi mini game</Text>
          </TouchableOpacity>

          {/* VÍ VOUCHER */}
          <Text style={styles.sectionTitle}>🎫 Voucher đã nhận của bạn</Text>
          <FlatList
            data={myVouchers}
            renderItem={renderMyVoucher}
            keyExtractor={item => item._id}
            contentContainerStyle={{ paddingBottom: 22 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="wallet-outline" size={56} color="#bdbdbd" />
                <Text style={{ color: "#888", marginTop: 8, fontSize: 15 }}>Bạn chưa nhận voucher nào</Text>
              </View>
            }
            scrollEnabled={false}
          />
        </ScrollView>
      )}
    </View>
  );
};

export default VoucherScreen;

// Styles giữ nguyên như cũ
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#6d4c1b",
    marginTop: 26,
    marginBottom: 12,
    marginLeft: 16
  },
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
    marginTop: 30,
  },
  claimBtn: {
    marginTop: 12,
    backgroundColor: "#059669",
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: "flex-start",
    paddingHorizontal: 20
  },
  claimText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15.5,
    textTransform: "uppercase"
  },
});