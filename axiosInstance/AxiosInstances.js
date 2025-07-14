// screens/AdvancedFilterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  ScrollView,
  Alert,
} from 'react-native';

export default function AdvancedFilterScreen() {
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const query = new URLSearchParams({
        name,
        categoryName,
        minPrice,
        maxPrice,
        minRating,
        status: 'true', // ✅ chỉ lấy sản phẩm đang bán
      }).toString();

      const res = await fetch(`https://datn-sever.onrender.com/products/advanced-search?${query}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || 'Lỗi khi gọi API');

      setResults(products || []);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tìm sản phẩm');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bộ lọc nâng cao</Text>

      <Text style={styles.label}>Tên sản phẩm:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ví dụ: Áo Thun"
      />

      <Text style={styles.label}>Danh mục:</Text>
      <TextInput
        style={styles.input}
        value={categoryName}
        onChangeText={setCategoryName}
        placeholder="Ví dụ: Quần Dài"
      />

      <Text style={styles.label}>Giá từ:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={minPrice}
        onChangeText={setMinPrice}
        placeholder="100000"
      />

      <Text style={styles.label}>Giá đến:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={maxPrice}
        onChangeText={setMaxPrice}
        placeholder="500000"
      />

      <Text style={styles.label}>Rating tối thiểu:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={minRating}
        onChangeText={setMinRating}
        placeholder="4"
      />

      <Text style={styles.label}>Trạng thái:</Text>
      <Text style={styles.value}>Đang bán</Text>

      <Button title="Tìm kiếm" onPress={handleSearch} />

      {results.length > 0 && (
        <View style={styles.resultsBox}>
          <Text style={styles.resultLabel}>Kết quả:</Text>
          {results.map((item: any) => (
            <View key={item._id} style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>Giá: {item.price}đ</Text>
              <Text>Rating: {item.averageRating}</Text>
              <Text>Danh mục: {item.categoryID?.name}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
  },
  value: {
    marginTop: 4,
    marginBottom: 12,
    color: 'green',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
  resultsBox: {
    marginTop: 20,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
