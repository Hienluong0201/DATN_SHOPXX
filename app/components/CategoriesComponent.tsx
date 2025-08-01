import React from 'react';
import { Animated, ScrollView, Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface CategoriesComponentProps {
  slideAnim: any;
  categories: any[];
  navigateToCategory: (categoryId: string) => void;
}

export default function CategoriesComponent({ slideAnim, categories, navigateToCategory }: CategoriesComponentProps) {
  return (
    <Animated.View style={[styles.section, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.categoryHeader}>
        <Text style={styles.sectionTitle}>Danh Mục</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: './categoryDetail' })}>
          <Text style={styles.viewAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.CategoryID}
            style={styles.categoryCard}
            onPress={() => navigateToCategory(category.CategoryID)}
            activeOpacity={0.8}
          >
            <View style={styles.categoryIcon}>
              <Image
                source={category.Icon}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.categoryName}>{category.Name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#8B4513',
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIcon: {
    backgroundColor: '#f0f0f0',
    borderRadius: 50,
    padding: 15,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 36,
    height: 36,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 2,
  },
});