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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { useAuth } from '../store/useAuth';
import { io } from 'socket.io-client';

const emptyImg = require('../assets/images/laughing.png'); // Đổi path đúng với hình bạn lưu

const ChatWithShop = () => {
  const { user } = useAuth();
  const userID = user?._id; // KHÔNG dùng mặc định!
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch messages when mount
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

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userID) return;
    const payload = { userID, sender: 'user', text: newMessage };
    setLoading(true);
    try {
      await AxiosInstance().post('/messages', payload);
      setNewMessage('');
      // socket realtime sẽ nhận tin nhắn mới
    } catch (err) {
      setError('Không gửi được tin nhắn. Vui lòng thử lại.');
      Alert.alert('Lỗi', 'Không gửi được tin nhắn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Socket setup
  useEffect(() => {
    if (!userID) return;

    fetchMessages(); // load tin nhắn ban đầu

    const socket = io("https://datn-sever.onrender.com");
    socketRef.current = socket;

    socket.on("connect", () => {
      // console.log("Socket connected", socket.id);
    });

    socket.on("new_message", (msg) => {
      if (msg.userID === userID) {
        setMessages((prev) => [
          ...prev,
          {
            id: msg._id,
            sender: msg.sender,
            text: msg.text,
            timestamp: new Date(msg.timestamp).toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          }
        ]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userID]);

  const goBack = () => {
    router.back();
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userMessage : styles.shopMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTimestamp}>{item.timestamp}</Text>
    </View>
  );

  // ---- Giao diện khi chưa đăng nhập ----
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
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2c2c2c" />
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
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        <View style={styles.inputContainer}>
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
      <View style={{ height: 100 }} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', marginTop: 20 },
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
});

export default ChatWithShop;
