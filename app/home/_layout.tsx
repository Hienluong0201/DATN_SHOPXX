import React from 'react';
import { Drawer } from 'expo-router/drawer';
import CustomHeader from '../components/CustomHeader';
import CustomDrawerContent from '../components/CustomDrawerContent';

export default function HomeLayout() {
  return (
    <Drawer
      initialRouteName="index" // Đặt màn hình ban đầu
      screenOptions={{
        headerShown: true,
        header: () => <CustomHeader />,
        drawerPosition: 'left',
        drawerType: 'slide',
        drawerStyle: { width: '80%' }, // Đảm bảo kích thước drawer
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />} // Truyền props đầy đủ
    >
      <Drawer.Screen name="index" options={{ title: 'Trang chủ' }} />
      <Drawer.Screen name="profile" options={{ title: 'Hồ sơ' }} />
      <Drawer.Screen name="wishlist" options={{ title: 'Yêu thích' }} />
      <Drawer.Screen name="reviews" options={{ title: 'Đánh giá' }} />
      <Drawer.Screen name="products" options={{ title: 'Sản phẩm' }} />
      <Drawer.Screen name="productDetail" options={{ title: 'Chi tiết sản phẩm' }} />
      <Drawer.Screen name="cart" options={{ title: 'Giỏ hàng' }} />
      <Drawer.Screen name="orders" options={{ title: 'Đơn hàng' }} />
      <Drawer.Screen name="orderDetail" options={{ title: 'Chi tiết đơn hàng' }} />
    </Drawer>
  );
}