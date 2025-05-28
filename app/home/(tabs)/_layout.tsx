import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import CartScreen from '../cart';
import IndexScreen from '../index';
import ProfileScreen from '../profile';
import ReviewsScreen from '../reviews';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
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
      <Tab.Screen name="reviews" component={ReviewsScreen} />
      <Tab.Screen name="profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 40, // Tăng padding bên trái để "bóp" vào
    right: 40, // Tăng padding bên phải để "bóp" vào
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