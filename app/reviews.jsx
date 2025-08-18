import React, { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useAuth } from '../store/useAuth';
import { useProducts } from '../store/useProducts';
import { io } from 'socket.io-client';

const emptyImg = require('../assets/images/laughing.png');
const ORDER_STATUS_VI = {
  pending: "Chờ xử lý",
  paid: "Đã thanh toán",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const ChatWithShop = ({ onClose }) => {
  const { user } = useAuth();
  const userID = user?._id;
  const { fetchProducts, products, loading: productLoading } = useProducts();

  // Message State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);
  const socketRef = useRef(null);

  // Khiếu nại - gửi đơn vào chat
  const [showOrderList, setShowOrderList] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Gửi sản phẩm - gửi vào chat
  const [showProductList, setShowProductList] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [productList, setProductList] = useState([]);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [noMoreProduct, setNoMoreProduct] = useState(false);

  // Nút cuộn xuống cuối
  const [showScrollToEnd, setShowScrollToEnd] = useState(false);

  // ----- FETCH & SOCKET -----
  // Lấy đơn hàng user khi mở modal
  const fetchUserOrders = async () => {
    if (!userID) return;
    setOrdersLoading(true);
    try {
      const res = await AxiosInstance().get(`/order/user/${userID}`);
      console.log('DATA ĐƠN HÀNG:', res);

      // Kiểm tra chi tiết item của đơn đầu tiên (nếu có)
      if (Array.isArray(res) && res.length > 0) {
        res.forEach((order, idx) => {
          console.log(`Đơn hàng [${idx}] có items:`, order.items);
        });
      }

      setUserOrders(Array.isArray(res) ? res : []);
    } catch (err) {
      setUserOrders([]);
      console.log('LỖI LẤY ĐƠN:', err?.response?.data || err?.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load tin nhắn
  const fetchMessages = async () => {
    if (!userID) return;
    setLoading(true);
    try {
      const response = await AxiosInstance().get(`/messages/between?userID=${userID}`);
      const data = Array.isArray(response) ? response : [];
      setMessages(
        data.map((msg) => ({
          id: msg._id,
          sender: msg.sender,
          text: msg.text,
          type: msg.type || 'text',
          orderInfo: msg.orderInfo,
          productInfo: msg.productInfo,
          timestamp: new Date(msg.timestamp).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }))
      );
      setError(null);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      setError('Không thể tải tin nhắn. Vui lòng thử lại sau.');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Gửi tin nhắn thường
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userID) return;
    const payload = { userID, sender: 'user', text: newMessage };
    setLoading(true);
    try {
      await AxiosInstance().post('/messages', payload);
      setNewMessage('');
    } catch (err) {
      setError('Không gửi được tin nhắn. Vui lòng thử lại.');
      Alert.alert('Lỗi', 'Không gửi được tin nhắn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Gửi order vào chat
  const sendOrderToChat = async (order) => {
    if (!userID) return;
    try {
      await AxiosInstance().post('/messages', {
        userID,
        sender: 'user',
        type: 'order',
        orderInfo: {
          orderId: order._id,
          createdAt: order.orderDate,
          total: order.totalAmount,
          status: order.orderStatus,
          items: order.items,
        },
        text: '',
      });
    } catch {
      Alert.alert('Lỗi', 'Không gửi được đơn hàng vào chat.');
    }
  };

  // Gửi sản phẩm vào chat
  const sendProductToChat = async (product) => {
    if (!userID) return;
    try {
      await AxiosInstance().post('/messages', {
        userID,
        sender: 'user',
        type: 'product',
        productInfo: {
          id: product.ProductID,
          name: product.Name,
          image: product.Image,
          price: product.Price,
        },
        text: '',
      });
    } catch {
      Alert.alert('Lỗi', 'Không gửi được sản phẩm vào chat.');
    }
  };

  // Modal sản phẩm: load more
  const loadProductPage = async (page) => {
    setLoadingMoreProducts(true);
    try {
      const res = await fetchProducts({ categoryId: 'all', page, limit: 10 });
      if (Array.isArray(res)) {
        if (page === 1) setProductList(res);
        else setProductList(prev => [...prev, ...res]);
        if (res.length < 10) setNoMoreProduct(true);
        else setNoMoreProduct(false);
      }
    } finally {
      setLoadingMoreProducts(false);
    }
  };

  const openProductModal = async () => {
    setShowProductList(true);
    setProductPage(1);
    setNoMoreProduct(false);
    setProductList([]);
    loadProductPage(1);
  };

  // Socket realtime
  useEffect(() => {
    if (!userID) return;
    fetchMessages();
    const socket = io("https://datn-sever.onrender.com");
    socketRef.current = socket;

    socket.on("new_message", (msg) => {
      if (msg.userID === userID) {
        setMessages((prev) => [
          ...prev,
          {
            id: msg._id,
            sender: msg.sender,
            text: msg.text,
            type: msg.type || 'text',
            orderInfo: msg.orderInfo,
            productInfo: msg.productInfo,
            timestamp: new Date(msg.timestamp).toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          }
        ]);
      }
    });

    return () => socket.disconnect();
    // eslint-disable-next-line
  }, [userID]);

  // Xử lý cuộn FlatList: show nút scroll xuống cuối
  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const visibleHeight = layoutMeasurement.height;
    const y = contentOffset.y;
    const totalContentHeight = contentSize.height;

    if (y + visibleHeight >= totalContentHeight - 80) {
      setShowScrollToEnd(false);
    } else {
      setShowScrollToEnd(true);
    }
  };

  const goBack = () => {
    if (onClose) onClose(); // đóng modal thay vì router.back()
  };

  // Render tin nhắn: text, order hoặc product card
  const renderMessage = ({ item }) => {
    if (item.type === 'order' && item.orderInfo) {
      return (
        <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.shopMessage]}>
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => {
              router.push({
                pathname: '/orderDetail',
                params: { orderId: item.orderInfo.orderId }
              });
            }}
          >
            <View style={styles.orderCardMsg}>
              <Ionicons name="receipt-outline" size={22} color="#b8860b" />
              <Text style={styles.orderMsgTitle}>ĐƠN HÀNG #{item.orderInfo.orderId.slice(0, 8)}</Text>
              <Text style={styles.orderMsgStatus}>
                Trạng thái: {ORDER_STATUS_VI[item.orderInfo.status] || item.orderInfo.status}
              </Text>
              <Text>Tổng: {item.orderInfo.total?.toLocaleString()}đ</Text>
              <Text>Ngày: {new Date(item.orderInfo.createdAt).toLocaleString()}</Text>
              {!!item.orderInfo.items?.length && (
                <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                  {item.orderInfo.items[0].name} x{item.orderInfo.items[0].quantity}...
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      );
    }
    if (item.type === 'product' && item.productInfo) {
      return (
        <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.shopMessage]}>
          <View style={styles.productCardMsg}>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '/productDetail',
                  params: { productId: item.productInfo.id }
                });
              }}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: item.productInfo.image || 'https://via.placeholder.com/100' }}
                style={{ width: 70, height: 70, borderRadius: 9, marginRight: 10, backgroundColor: '#eee' }}
              />
            </TouchableOpacity>
            <View>
              <Text
                style={{ fontWeight: 'bold', fontSize: 15, color: '#6c390a', marginBottom: 2, maxWidth: 90 }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.productInfo.name}
              </Text>
              <Text style={{ color: '#c0392b', fontWeight: '600' }}>{item.productInfo.price}đ</Text>
            </View>
          </View>
        </View>
      );
    }
    // Tin nhắn thường
    return (
      <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.shopMessage]}>
        <Text style={[styles.messageText, { color: item.sender === 'user' ? '#000000' : '#ffffff' }]}>
          {item.text}
        </Text>
        <Text style={styles.messageTimestamp}>{item.timestamp}</Text>
      </View>
    );
  };

  // UI khi chưa đăng nhập
  if (!userID) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Image source={emptyImg} style={styles.emptyImage} resizeMode="contain" />
        <Text style={styles.authTitle}>Bạn chưa đăng nhập</Text>
        <Text style={styles.authDesc}>
          Hãy đăng nhập để sử dụng chức năng chat với shop nhé!
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.authBtn, styles.loginBtn]}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={22} color="#fff" />
            <Text style={styles.btnText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.authBtn, styles.backBtn]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back-outline" size={22} color="#fff" />
            <Text style={styles.btnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* MODAL chọn đơn khi khiếu nại */}
      <Modal
        visible={showOrderList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOrderList(false)}
      >
        <View style={styles.orderModalOverlay}>
          <View style={styles.orderModal}>
            <Text style={styles.orderModalTitle}>Chọn đơn hàng để gửi vào chat</Text>
            {ordersLoading ? (
              <ActivityIndicator size="small" color="#8B4513" />
            ) : userOrders.length === 0 ? (
              <Text style={{ color: "#888", padding: 15 }}>Bạn chưa có đơn hàng nào.</Text>
            ) : (
              <FlatList
                data={userOrders}
                keyExtractor={item => item._id}
                style={{ maxHeight: 360 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.orderCard}
                    onPress={() => {
                      sendOrderToChat(item);
                      setShowOrderList(false);
                    }}
                  >
                    <Ionicons name="receipt-outline" size={22} color="#8B4513" />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.orderId}>#{item._id.slice(0, 8)}</Text>
                      <Text style={styles.orderPrice}>{item.totalAmount?.toLocaleString()}đ</Text>
                      <Text style={styles.orderStatus}>Trạng thái: {ORDER_STATUS_VI[item.orderStatus] || item.orderStatus}</Text>
                      <Text style={styles.orderDate}>{new Date(item.orderDate).toLocaleDateString()}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              style={styles.closeOrderModalBtn}
              onPress={() => setShowOrderList(false)}
            >
              <Text style={styles.closeOrderModalText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL chọn sản phẩm để gửi vào chat */}
      <Modal
        visible={showProductList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProductList(false)}
      >
        <View style={styles.orderModalOverlay}>
          <View style={styles.orderModal}>
            <Text style={styles.orderModalTitle}>Chọn sản phẩm để gửi vào chat</Text>
            <FlatList
              data={productList}
              keyExtractor={item => item.ProductID}
              style={{ maxHeight: 370 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.productModalCard}
                  onPress={() => {
                    sendProductToChat(item);
                    setShowProductList(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: item.Image }} style={styles.productModalImg} />
                  <View>
                    <Text style={styles.productModalName} numberOfLines={1}>{item.Name}</Text>
                    <Text style={styles.productModalPrice}>{item.Price}đ</Text>
                  </View>
                </TouchableOpacity>
              )}
              onEndReached={() => {
                if (!noMoreProduct && !loadingMoreProducts) {
                  const nextPage = productPage + 1;
                  setProductPage(nextPage);
                  loadProductPage(nextPage);
                }
              }}
              onEndReachedThreshold={0.2}
              ListFooterComponent={
                loadingMoreProducts ? (
                  <ActivityIndicator size="small" color="#8B4513" style={{ marginVertical: 10 }} />
                ) : null
              }
            />
            <TouchableOpacity
              style={styles.closeOrderModalBtn}
              onPress={() => setShowProductList(false)}
            >
              <Text style={styles.closeOrderModalText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="close" size={26} color="#2c2c2c" />
          </TouchableOpacity>
          <Text style={styles.title}>Chat với Shop</Text>
          <View style={styles.placeholder} />
        </View>

        {loading && !messages.length ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#27ae60" />
          </View>
        ) : error ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={handleScroll}
            />
            {/* Nút cuộn xuống cuối nếu user đã cuộn lên trên */}
            {showScrollToEnd && (
              <TouchableOpacity
                style={styles.scrollToEndButton}
                onPress={() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                  setShowScrollToEnd(false);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-down-circle" size={36} color="#8B4513" />
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={styles.inputContainer}>
          {/* Khiếu nại đơn */}
          <TouchableOpacity
            style={styles.complainBtn}
            onPress={() => {
              setShowOrderList(true);
              fetchUserOrders();
            }}
          >
            <Ionicons name="receipt-outline" size={24} color="#8B4513" />
          </TouchableOpacity>
          {/* Gửi sản phẩm */}
          <TouchableOpacity
            style={styles.complainBtn}
            onPress={openProductModal}
          >
            <Ionicons name="pricetag-outline" size={24} color="#8B4513" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={loading}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  keyboardContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: { padding: 5 },
  title: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', flex: 1, textAlign: 'center' },
  placeholder: { width: 24 },
  messageList: { padding: 15, flexGrow: 1 },
  messageContainer: { maxWidth: '80%', marginVertical: 5, padding: 12, borderRadius: 15 },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#ecf0f1', borderRadius: 10 },
  shopMessage: { alignSelf: 'flex-start', backgroundColor: '#8B4513', borderRadius: 10 },
  messageText: { fontSize: 16, color: '#2c2c2c' },
  messageTimestamp: { fontSize: 12, color: '#999', marginTop: 5, textAlign: 'right' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  complainBtn: {
    marginRight: 8,
    padding: 7,
    backgroundColor: "#fff6e0",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#f6cf8c",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    maxHeight: 100,
    backgroundColor: '#fafafa',
  },
  sendButton: {
    backgroundColor: '#8B4513',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { fontSize: 16, color: '#e74c3c', textAlign: 'center', marginTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Style cho giao diện chưa đăng nhập
  emptyImage: {
    width: 220,
    height: 220,
    marginBottom: 24,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c2c2c',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  authDesc: {
    fontSize: 15,
    color: '#60606e',
    marginBottom: 28,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    marginHorizontal: 4,
    elevation: 3,
  },
  loginBtn: {
    backgroundColor: '#d97706',
  },
  backBtn: {
    backgroundColor: '#2d5fee',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.2,
  },

  // Modal chọn đơn hàng/sản phẩm
  orderModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 18,
    width: '90%',
    elevation: 10,
    maxHeight: 450,
  },
  orderModalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
    textAlign: 'center',
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f2e7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eddcbe',
  },
  orderId: { fontWeight: 'bold', color: '#8B4513', fontSize: 16 },
  orderPrice: { color: '#b8860b', fontSize: 15, marginTop: 2 },
  orderStatus: { color: '#666', fontSize: 13, marginTop: 1 },
  orderDate: { color: '#999', fontSize: 12, marginTop: 1 },
  closeOrderModalBtn: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: '#e0b35a',
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 32,
  },
  closeOrderModalText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
    letterSpacing: 0.3,
  },

  // Tin nhắn order trong chat
  orderCardMsg: {
    backgroundColor: '#fff3db',
    borderRadius: 13,
    padding: 13,
    alignItems: 'flex-start',
    marginBottom: 4,
    minWidth: 200,
  },
  orderMsgTitle: {
    fontWeight: 'bold',
    color: '#a97a18',
    marginTop: 2,
    marginBottom: 3,
    fontSize: 15,
  },
  orderMsgStatus: {
    color: '#bf7f14',
    fontWeight: '600',
    marginBottom: 3,
    fontSize: 13,
  },
  // Sản phẩm trong chat
  productCardMsg: {
    backgroundColor: '#ffe',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    minWidth: 190,
  },
  productModalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf9f7',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e1d2bc',
  },
  productModalImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  productModalName: {
    fontWeight: 'bold',
    color: '#7b4910',
    fontSize: 15,
    marginBottom: 2,
    maxWidth: 120,
  },
  productModalPrice: {
    color: '#d04413',
    fontSize: 15,
    fontWeight: 'bold',
  },

  // Nút cuộn xuống cuối
  scrollToEndButton: {
    position: 'absolute',
    right: 16,
    bottom: 90,
    zIndex: 999,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default ChatWithShop;