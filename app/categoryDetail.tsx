import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useProducts } from '../store/useProducts';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const CategoryScreen = () => {
  const { categories, fetchCategories, loading } = useProducts();

  useEffect(() => {
    fetchCategories();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push({ pathname: './products', params: { categoryId: item.CategoryID } })}
    >
      <View style={styles.iconWrapper}>
        <Image
          source={{
            uri: 'https://via.placeholder.com/80/eee?text=' + encodeURIComponent(item.Name),
          }}
          style={styles.categoryIcon}
        />
      </View>
      <Text style={styles.categoryName}>{item.Name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Danh mục sản phẩm</Text>
      </View>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={item => item.CategoryID}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={loading ? <Text>Đang tải...</Text> : <Text>Không có danh mục.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', marginTop : 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
    marginRight: 8,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#222' },
  categoryCard: {
    backgroundColor: '#f9f6f1',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 18,
    padding: 14,
    flex: 1,
    marginHorizontal: 5,
  },
  iconWrapper: { marginBottom: 8 },
  categoryIcon: { width: 70, height: 70, borderRadius: 35 },
  categoryName: { fontSize: 15, fontWeight: '500', color: '#633' },
});

export default CategoryScreen;