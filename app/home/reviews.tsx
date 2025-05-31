// app/home/reviews.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const Reviews = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        // TODO: Gọi API để lấy danh sách đánh giá
        // Ví dụ: const response = await AxiosInstance().get('/reviews');
        // setReviews(response);
        setReviews([]);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Không thể tải đánh giá. Vui lòng thử lại sau.');
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleSubmit = async () => {
    // TODO: Gọi API để gửi đánh giá
    // Ví dụ: await AxiosInstance().post('/reviews', { rating, comment });
    console.log({ rating, comment });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#d4af37" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Đánh giá sản phẩm</Text>
      <TextInput
        style={styles.input}
        placeholder="Đánh giá (1-5)"
        keyboardType="numeric"
        onChangeText={(text) => setRating(parseInt(text) || 0)}
      />
      <TextInput
        style={styles.input}
        placeholder="Nhận xét"
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Gửi đánh giá</Text>
      </TouchableOpacity>
      {reviews.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
      ) : (
        reviews.map((review) => (
          <View key={review.ReviewID} style={styles.reviewCard}>
            <Text>Đánh giá: {review.Rating}/5</Text>
            <Text>Nhận xét: {review.Comment}</Text>
            <Text>Ngày: {review.CommentDate}</Text>
          </View>
        ))
      )}
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
  emptyText: { fontSize: 16, color: '#2c2c2c', textAlign: 'center', marginTop: 20 },
  errorText: { fontSize: 16, color: '#c0392b', textAlign: 'center', marginTop: 20 },
});

export default Reviews;