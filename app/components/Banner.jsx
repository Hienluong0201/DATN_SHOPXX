import React from 'react';
import { Text, View, TouchableOpacity, Image, StyleSheet } from 'react-native';

const Banner = ({ onPress, fadeAnim }) => {
  return (
    <View style={[styles.bannerContainer, { opacity: fadeAnim }]}>
      <Image
        source={{ uri: 'https://media3.coolmate.me/cdn-cgi/image/width=672,height=990,quality=80,format=auto/uploads/January2024/AT.220.NAU.1.jpg' }}
        style={styles.bannerImage}
      />
      <View style={styles.bannerOverlay}>
        <Text style={styles.bannerTitle}>Khám phá phong cách đỉnh cao</Text>
        <Text style={styles.bannerSubtitle}>Ưu đãi độc quyền - Giảm 50% hôm nay!</Text>
        <TouchableOpacity style={styles.bannerButton} onPress={onPress}>
          <Text style={styles.bannerButtonText}>Mua sắm ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'relative',
    height: 300,
    marginBottom: 20,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  bannerSubtitle: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 10,
    textAlign: 'center',
  },
  bannerButton: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 5,
  },
  bannerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Banner;