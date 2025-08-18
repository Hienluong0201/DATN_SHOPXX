// File: HomeLayout.js
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Modal,
  Animated,
  Easing,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CartScreen from './cart';
import IndexScreen from './index';
import ProfileScreen from './profile';
import WishlistScreen from './wishlist';
import VideoScreen from '../video';
import ChatWithShop from '../reviews'; // dùng cho "Nhắn với Admin"
import AIAdvisorComponent from '../components/AIAdvisorComponent'; // <-- chỉnh path theo dự án của bạn

const Tab = createBottomTabNavigator();

export default function HomeLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: menuOpen ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [menuOpen]);

  const menuStyle = {
    opacity: anim,
    transform: [
      { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
    ],
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabItem,
          headerShown: false,
          tabBarIcon: ({ focused }) => {
            let iconName;
            if (route.name === 'index') iconName = 'home-outline';
            else if (route.name === 'cart') iconName = 'cart-outline';
            else if (route.name === 'video') iconName = 'film-outline';
            else if (route.name === 'wishlist') iconName = 'heart-outline';
            else if (route.name === 'profile') iconName = 'person-outline';
            return (
              <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                <Ionicons name={iconName} size={24} color={focused ? '#8B4513' : '#fff'} />
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="index" component={IndexScreen} />
        <Tab.Screen name="cart" component={CartScreen} />
        <Tab.Screen name="video" component={VideoScreen} />
        <Tab.Screen name="wishlist" component={WishlistScreen} />
        <Tab.Screen name="profile" component={ProfileScreen} />
      </Tab.Navigator>

      {/* nền mờ để đóng menu nhanh */}
      {menuOpen && <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />}

      {/* Speed-dial menu (giống ảnh) */}
      <Animated.View pointerEvents={menuOpen ? 'auto' : 'none'} style={[styles.speedDial, menuStyle]}>
        <Pressable
          style={styles.action}
          onPress={() => {
            setMenuOpen(false);
            setShowAI(true);
          }}
        >
          
          <View style={[styles.actionIcon, { backgroundColor: '#5E7184' }]}>
            <Ionicons name="sparkles-outline" size={20} color="#fff" />
          </View>
        </Pressable>
        <Pressable
          style={styles.action}
          onPress={() => {
            setMenuOpen(false);
            setShowAdmin(true);
          }}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#2E7D32' }]}>
            <Ionicons name="person-outline" size={20} color="#fff" />
          </View>
        </Pressable>
      </Animated.View>

      {/* Nút chat nổi (mở/đóng speed-dial) */}
      <Pressable
        style={[styles.floatingButton, menuOpen && { transform: [{ rotate: '45deg' }] }]}
        onPress={() => setMenuOpen((v) => !v)}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={26} color="#fff" />
      </Pressable>

      {/* Modal AI */}
      <Modal
      visible={showAI}
      animationType="slide"
      onRequestClose={() => setShowAI(false)}
    >
      <AIAdvisorComponent onClose={() => setShowAI(false)} />
    </Modal>

      {/* Modal Admin / Shop */}
      <Modal visible={showAdmin} animationType="slide" onRequestClose={() => setShowAdmin(false)}>
        <ChatWithShop onClose={() => setShowAdmin(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#8B4513',
    borderTopWidth: 0,
    elevation: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', marginHorizontal: 5 },
  iconContainer: {
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    bottom: 5,
  },
  focusedIconContainer: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  /* FAB */
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 25,
    backgroundColor: '#8B4513',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    zIndex: 1000,
  },

  /* Backdrop khi mở menu */
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    zIndex: 900,
  },

  /* Speed-dial container */
  speedDial: {
    position: 'absolute',
    right: 25,
    bottom: 170, // nằm trên FAB
    zIndex: 950,
    gap: 12,
  },

  /* Mỗi action giống ảnh: chữ bên trái + icon tròn bên phải */
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  actionText: {
    marginRight: 10,
    fontSize: 12,
    color: '#6b6b6b',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
