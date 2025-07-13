// BannerComponent.tsx
import React from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BannerComponentProps {
  fadeAnim: Animated.Value;
  categories: any[];
  navigateToCategory: (categoryId: string) => void;
}

export default function BannerComponent({ fadeAnim, categories, navigateToCategory }: BannerComponentProps) {
  return (
    <Animated.View style={[styles.bannerCarouselContainer, { opacity: fadeAnim }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={styles.bannerItem}>
          <Image
            source={{ uri: 'https://theme.hstatic.net/1000090364/1001154354/14/slider_1.jpg?v=739' }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Big Sale</Text>
            <Text style={styles.bannerSubtitle}>Giảm đến 50%</Text>
            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => navigateToCategory(categories[0]?.CategoryID || '')}
            >
              <Text style={styles.bannerButtonText}>SHOP NOW</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bannerItem}>
          <Image
            source={{ uri: 'https://theme.hstatic.net/1000090364/1001154354/14/slider_1.jpg?v=739' }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Hàng Mới Về</Text>
            <Text style={styles.bannerSubtitle}>Nhiều mẫu đẹp</Text>
            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => navigateToCategory(categories[0]?.CategoryID || '')}
            >
              <Text style={styles.bannerButtonText}>SHOP NOW</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bannerItem}>
          <Image
            source={{ uri: 'https://theme.hstatic.net/1000090364/1001154354/14/slider_1.jpg?v=739' }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Voucher Tháng 6</Text>
            <Text style={styles.bannerSubtitle}>Săn deal cực sốc</Text>
            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => navigateToCategory(categories[0]?.CategoryID || '')}
            >
              <Text style={styles.bannerButtonText}>SHOP NOW</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bannerCarouselContainer: {
    height: 150,
    marginHorizontal: 15,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  bannerItem: {
    width: 340,
    height: 150,
    position: 'relative',
    marginRight: 12,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 19,
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 13,
  },
  bannerButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerButtonText: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: '600',
  },
});