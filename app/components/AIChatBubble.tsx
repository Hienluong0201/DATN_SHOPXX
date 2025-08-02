import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Modal, Animated, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AIAdvisorComponent from './AIAdvisorComponent';

export default function AIChatBubble() {
  const [visible, setVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <>
      {/* Floating Bubble */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.bubbleBtn}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="chatbubbles" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal Popup Chat */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animated.View style={[styles.popup, { transform: [{ scale: scaleAnim }] }]}>
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="chatbubbles" size={22} color="#d4af37" style={{ marginRight: 7 }} />
              <Text style={{ fontWeight: 'bold', fontSize: 15, flex: 1 }}>AI Thời Trang</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>
            {/* Nội dung AI chat */}
            <AIAdvisorComponent />
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
bubbleBtn: {
  position: 'absolute',
  bottom: 170, // <-- Đẩy bubble lên cao hơn, tránh bị tabbar che (thường 70~100px)
  right: 28,
  backgroundColor: '#8B4513',
  width: 58,
  height: 58,
  borderRadius: 32,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 30,      // <-- tăng cao
  zIndex: 9999,       // <-- rất cao
  shadowColor: '#222',
  shadowOpacity: 0.18,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 8,
},

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(30,30,30,0.18)',
  },
  popup: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 28,
    borderRadius: 18,
    paddingBottom: 8,
    elevation: 10,
    shadowColor: '#333',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f5eccc',
    backgroundColor: '#fff'
  },
});
