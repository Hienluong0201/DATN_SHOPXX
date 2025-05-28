import { Drawer } from 'expo-router/drawer';
import React from 'react';
import CustomDrawerContent from '../components/CustomDrawerContent';
import CustomHeader from '../components/CustomHeader';

export default function HomeLayout() {
  return (
    <Drawer
      initialRouteName="(tabs)"
      screenOptions={{
        headerShown: true,
        header: () => <CustomHeader />,
        drawerPosition: 'left',
        drawerType: 'slide',
        drawerStyle: { width: '80%' },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="(tabs)" options={{ title: 'Trang chủ' }} />
      <Drawer.Screen name="wishlist" options={{ title: 'Yêu thích' }} />
      <Drawer.Screen name="products" options={{ title: 'Sản phẩm' }} />
      <Drawer.Screen name="productDetail" options={{ title: 'Chi tiết sản phẩm' }} />
      <Drawer.Screen name="orders" options={{ title: 'Đơn hàng' }} />
      <Drawer.Screen name="orderDetail" options={{ title: 'Chi tiết đơn hàng' }} />
      <Drawer.Screen name="checkout" options={{ title: 'Thanh toán' }} />
    </Drawer>
  );
}
