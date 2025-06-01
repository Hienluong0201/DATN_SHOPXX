import React, { useState, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Thêm icon cho nút Back
import { router } from 'expo-router';
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
        // Dữ liệu mẫu để khớp với hình ảnh
        const sampleReviews = [
          {
            ReviewID: 1,
            Image: 'https://example.com/brown_jacket.jpg',
            Name: 'Brown Jacket',
            Price: '$39.97',
            Rating: 4,
            Comment: 'Sản phẩm đẹp, giao hàng nhanh.',
            CommentDate: '01/06/2025',
          },
        ];
        setReviews(sampleReviews);
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

  const handleSubmit = () => {
    // TODO: Gọi API để gửi đánh giá
    console.log({ rating, comment });
  };

  const goBack = () => {
    // TODO: Quay lại màn hình trước
    router.back();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={24}
          color="#FFD700"
          onPress={() => setRating(i)}
        />
      );
    }
    return stars;
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
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.title}>Đánh giá</Text>
        <View style={styles.placeholder} />
      </View>
      {reviews.length > 0 && reviews.map((review) => (
        <View key={review.ReviewID} style={styles.productCard}>
          <Image source={{ uri: review.Image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{review.Name}</Text>
            <Text style={styles.productPrice}>{review.Price} | 1 sản phẩm</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editText}>bắt đầu đánh giá</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Text style={styles.question}>Đơn hàng này hài lòng?</Text>
      <View style={styles.starContainer}>{renderStars()}</View>
      <Text style={styles.commentLabel}>Thêm nhận xét của bạn</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập nhận xét"
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={goBack}>
          <Text style={styles.cancelText}>Thoát</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Gửi</Text>
        </TouchableOpacity>
      </View>
      {reviews.length > 0 && (
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Đánh giá từ Insightlancer</Text>
          {reviews.map((review) => (
            <View key={review.ReviewID} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewRating}>{review.Rating}/5</Text>
                <View style={styles.reviewStars}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Ionicons
                      key={i}
                      name={i < review.Rating ? 'star' : 'star-outline'}
                      size={16}
                      color="#FFD700"
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.Comment}</Text>
              <Text style={styles.reviewDate}>{review.CommentDate}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { padding: 5 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', flex: 1, textAlign: 'center' },
  placeholder: { width: 24 },
  productCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, alignItems: 'center', elevation: 3 },
  productImage: { width: 60, height: 60, resizeMode: 'cover', borderRadius: 10 },
  productInfo: { flex: 1, marginLeft: 15 },
  productName: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  productPrice: { fontSize: 14, color: '#666', marginTop: 5 },
  editButton: { backgroundColor: '#f0f2f5', padding: 5, borderRadius: 10 },
  editText: { fontSize: 12, color: '#8B5A2B', fontWeight: '600' },
  question: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', marginBottom: 10 },
  starContainer: { flexDirection: 'row', marginBottom: 15 },
  commentLabel: { fontSize: 16, fontWeight: '600', color: '#2c2c2c', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 12, marginBottom: 15, minHeight: 100, textAlignVertical: 'top' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelButton: { backgroundColor: '#f0f2f5', padding: 12, borderRadius: 12, flex: 1, marginRight: 10, alignItems: 'center' },
  submitButton: { backgroundColor: '#8B5A2B', padding: 12, borderRadius: 12, flex: 1, alignItems: 'center' },
  cancelText: { color: '#2c2c2c', fontSize: 16, fontWeight: '600' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  reviewSection: { marginTop: 20 },
  reviewSectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  reviewCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 3 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  reviewRating: { fontSize: 16, fontWeight: '600', color: '#2c2c2c', marginRight: 10 },
  reviewStars: { flexDirection: 'row' },
  reviewComment: { fontSize: 14, color: '#666', marginTop: 5 },
  reviewDate: { fontSize: 12, color: '#999', marginTop: 5 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
  errorText: { fontSize: 16, color: '#c0392b', textAlign: 'center', marginTop: 20 },
});

export default Reviews;