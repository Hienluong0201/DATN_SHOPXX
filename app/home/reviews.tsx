import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const reviews = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const sampleReviews = [{ ReviewID: 1, UserID: 1, ProductID: 1, Rating: 4, Comment: 'Sản phẩm tốt!', CommentDate: '2025-05-17' }];

  const handleSubmit = () => {
    // Logic thêm đánh giá (dữ liệu mẫu)
    console.log({ rating, comment });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Đánh giá sản phẩm</Text>
      <TextInput style={styles.input} placeholder="Đánh giá (1-5)" keyboardType="numeric" onChangeText={(text) => setRating(parseInt(text) || 0)} />
      <TextInput style={styles.input} placeholder="Nhận xét" value={comment} onChangeText={setComment} multiline />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Gửi đánh giá</Text>
      </TouchableOpacity>
      {sampleReviews.map((review) => (
        <View key={review.ReviewID} style={styles.reviewCard}>
          <Text>Đánh giá: {review.Rating}/5</Text>
          <Text>Nhận xét: {review.Comment}</Text>
          <Text>Ngày: {review.CommentDate}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f0f2f5' },
  title: { fontSize: 24, fontWeight: '800', margin: 10, color: '#1a1a1a' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 12, marginBottom: 15 },
  button: { backgroundColor: '#d4af37', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  reviewCard: { backgroundColor: '#fff', padding: 10, marginBottom: 10, borderRadius: 10, elevation: 3 },
});

export default reviews;