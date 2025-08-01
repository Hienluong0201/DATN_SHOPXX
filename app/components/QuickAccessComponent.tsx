// QuickAccessComponent.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function QuickAccessComponent() {
  return (
    <View style={styles.quickAccessContainer}>
      <TouchableOpacity style={styles.quickAccessItem} onPress={() => router.push({ pathname: '../home/cart' })}>
        <Ionicons name="cart" size={28} color="#FF8500" />
        <Text style={styles.quickAccessLabel}>Giỏ hàng</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickAccessItem} onPress={() => router.push('/home/wishlist')}>
        <Ionicons name="heart" size={28} color="#FF5161" />
        <Text style={styles.quickAccessLabel}>Yêu thích</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickAccessItem} onPress={() => router.push('./privacy')}>
        <Ionicons name="receipt" size={28} color="#4287f5" />
        <Text style={styles.quickAccessLabel}>Voucher</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  quickAccessContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 12,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  quickAccessItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickAccessLabel: {
    fontSize: 13,
    color: '#444',
    marginTop: 5,
    fontWeight: '500',
  },
});