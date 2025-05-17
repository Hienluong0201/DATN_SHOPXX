import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform, StatusBar } from 'react-native';

type DrawerParamList = {
  index: undefined;
  profile: undefined;
  cart: undefined;      
  search: undefined;    
};

export default function CustomHeader() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.openDrawer()} style={styles.menuButton}>
        <MaterialIcons name="menu" size={28} color="black" />
      </Pressable>

      <View style={styles.logoContainer}>
        <Pressable onPress={() => navigation.navigate('index')}>
          <Text style={styles.logoText}>X Shop</Text>
        </Pressable>
      </View>

      <View style={styles.rightIcons}>
        <Pressable
          onPress={() => navigation.navigate('search')}
          style={{ marginRight: 16 }}
        >
          <MaterialIcons name="search" size={24} color="black" />
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('profile')}
          style={{ marginRight: 16 }}
        >
          <MaterialIcons name="person" size={24} color="black" />
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('cart')}
        >
          <MaterialIcons name="shopping-cart" size={24} color="black" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
    height: 56 + (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 44),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  menuButton: {
    padding: 4,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
