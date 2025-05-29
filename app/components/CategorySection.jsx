import React from 'react';
import { Animated, Text, ScrollView, StyleSheet } from 'react-native';
import CategoryCard from './CategoryCard';

const CategorySection = ({ categories, navigateToCategory, slideAnim }) => {
  // Kiểm tra categories có hợp lệ không
  if (!categories || !Array.isArray(categories)) {
    return (
      <Animated.View style={[styles.section, { transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.sectionTitle}>Không có danh mục để hiển thị</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.section, { transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>Danh mục cao cấp</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map((category) => (
          <CategoryCard
            key={category.CategoryID || `category-${category.Name || Math.random()}`} // Đảm bảo key duy nhất
            category={category}
            onPress={() => navigateToCategory(category.CategoryID || '')}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
    marginHorizontal: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 15,
    color: '#1a1a1a',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
});

export default CategorySection;