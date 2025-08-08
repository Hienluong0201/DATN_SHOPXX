// File: HomeLayout.js (sau khi chỉnh)
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CartScreen from './cart';
import IndexScreen from './index';
import ProfileScreen from './profile';
import WishlistScreen from './wishlist';
import VideoScreen from '../video';
import ChatWithShop from '../reviews'; // Đưa vào Modal

const Tab = createBottomTabNavigator();

export default function HomeLayout() {
  const [modalVisible, setModalVisible] = useState(false);

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

      {/* Nút chat nổi */}
      <Pressable
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={26} color="#fff" />
      </Pressable>

      {/* Modal chat */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ChatWithShop onClose={() => setModalVisible(false)} />
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
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
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
    zIndex: 999,
  },
});