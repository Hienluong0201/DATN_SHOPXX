import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ReviewsScreen from '../reviews';
import CartScreen from './cart';
import IndexScreen from './index';
import ProfileScreen from './profile';
import WishlistScreen from './wishlist';

const Tab = createBottomTabNavigator();

export default function HomeLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'index') iconName = 'home-outline';
          else if (route.name === 'cart') iconName = 'cart-outline';
          else if (route.name === 'reviews') iconName = 'chatbox-ellipses-outline';
          else if (route.name === 'profile') iconName = 'person-outline';
          else if (route.name === 'wishlist') iconName = 'heart-outline';

          return (
            <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
              <Ionicons name={iconName} size={24} color={focused ? '#8B4513' : '#fff'} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="index" component={IndexScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="cart" component={CartScreen} options={{ title: 'Giỏ hàng' }} />
      <Tab.Screen name="reviews" component={ReviewsScreen} options={{ title: 'Đánh giá' }} />
      <Tab.Screen name="profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
      <Tab.Screen name="wishlist" component={WishlistScreen} options={{ title: 'Yêu thích' }} />
    </Tab.Navigator>
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
});