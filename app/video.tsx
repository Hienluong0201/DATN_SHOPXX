import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Image, Animated } from 'react-native';
import { useAuth } from '../store/useAuth';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { Video } from 'expo-av';
import { useProducts } from '../store/useProducts';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const API_URL = '/api/v1/videos';

export default function VideoFeedScreen() {
  const { user } = useAuth();
  const { getProductById } = useProducts();
  const [videos, setVideos] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pausedIndexes, setPausedIndexes] = useState<number[]>([]);
  const videoRefs = useRef<any[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
const isFocused = useIsFocused();
  // Animation cho modal
  useEffect(() => {
    if (showLoginModal) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showLoginModal]);

  // Cleanup khi rời trang
useEffect(() => {
  if (!isFocused) {
    // Khi rời trang, dừng video
    videoRefs.current.forEach(ref => ref?.pauseAsync?.());
    console.log('Pause videos vì mất focus');
  } else {
    // Khi quay lại trang, play lại video nếu muốn
    videoRefs.current.forEach((ref, idx) => {
      if (idx === currentIndex && !pausedIndexes.includes(idx)) {
        ref.playAsync?.();
        console.log('Play lại video khi quay lại');
      }
    });
  }
}, [isFocused]);

  const fetchVideos = async (nextPage = 1, refresh = false) => {
    if (!hasMore && !refresh) return;
    if (refresh) setHasMore(true);
    if (refresh) setLoading(true);
    try {
      const res = await AxiosInstance().get(API_URL + `?page=${nextPage}&limit=1`);
      const newVideos = res.videos || [];
      setVideos(prev =>
        nextPage === 1 || refresh ? newVideos : [...prev, ...newVideos]
      );
      setPage(nextPage);
      if (newVideos.length < 1) setHasMore(false);
    } catch (e) {
      console.error('Error fetching videos:', e);
    }
    setRefreshing(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos(1, true);
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((ref, idx) => {
      if (ref) {
        if (idx === currentIndex && !pausedIndexes.includes(idx)) {
          ref.playAsync && ref.playAsync();
        } else {
          ref.pauseAsync && ref.pauseAsync();
        }
      }
    });
  }, [currentIndex, videos.length, pausedIndexes]);

  const handleProductPress = (productId: string) => {
    videoRefs.current.forEach(ref => {
      if (ref) ref.pauseAsync?.();
    });
    router.push({ pathname: '/productDetail', params: { productId } });
  };

  const toggleLike = async (videoId: string) => {
    if (!user?._id) {
      setShowLoginModal(true);
      return;
    }
    try {
      await AxiosInstance().put(`${API_URL}/${videoId}/like`, { userID: user._id });
      const res = await AxiosInstance().get(API_URL + `?page=${currentIndex + 1}&limit=1`);
      setVideos(prev => {
        const updated = [...prev];
        updated[currentIndex] = res.videos[0];
        return updated;
      });
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const togglePauseCurrentVideo = () => {
    setPausedIndexes(prev =>
      prev.includes(currentIndex)
        ? prev.filter(i => i !== currentIndex)
        : [...prev, currentIndex]
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  if (loading && videos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text style={styles.loadingText}>Đang tải video...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={item => item._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onRefresh={() => fetchVideos(1, true)}
        refreshing={refreshing}
        windowSize={2}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        removeClippedSubviews={true}
        onEndReached={() => {
          if (hasMore && !loading && !refreshing) fetchVideos(page + 1);
        }}
        onEndReachedThreshold={0.5}
        renderItem={({ item, index }) => (
          <View style={styles.videoContainer}>
            <TouchableOpacity
              style={styles.touchableOverlay}
              activeOpacity={1}
              onPress={togglePauseCurrentVideo}
            >
              <Video
                ref={ref => (videoRefs.current[index] = ref)}
                source={{ uri: item.videoURL }}
                style={styles.video}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="cover"
                shouldPlay={index === currentIndex && !pausedIndexes.includes(index)}
                useNativeControls={false}
                isLooping
              />
              
              {/* Gradient overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                style={styles.gradientOverlay}
              />

              {/* Play icon khi pause */}
              {index === currentIndex && pausedIndexes.includes(index) && (
                <View style={styles.centerPlayIcon}>
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={40} color="#fff" />
                  </View>
                </View>
              )}

              {/* Side actions */}
              <View style={styles.sideActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: item.likes.includes(user?._id) ? '#FF6B9D' : 'rgba(255,255,255,0.2)' }]}
                  onPress={e => {
                    e.stopPropagation();
                    toggleLike(item._id);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={item.likes.includes(user?._id) ? "heart" : "heart-outline"} 
                    size={28} 
                    color="#fff" 
                  />
                </TouchableOpacity>
                <Text style={styles.actionText}>{formatNumber(item.likes.length)}</Text>

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.actionText}>0</Text>

             
              </View>

              {/* Bottom info */}
              <View style={styles.bottomInfo}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.userID?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.username}>@{item.userID?.name || 'Unknown'}</Text>
                    <Text style={styles.caption}>{item.caption}</Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Ionicons name="eye-outline" size={16} color="#fff" />
                    <Text style={styles.statText}>{formatNumber(item.views)} lượt xem</Text>
                  </View>
                </View>

                {/* Products section */}
                {Array.isArray(item.products) && item.products.length > 0 && (
                  <View style={styles.productsSection}>
                    <Text style={styles.productsSectionTitle}>Sản phẩm trong video</Text>
                    <FlatList
                      data={item.products.slice(0, 3)}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      renderItem={({ item: prod }) => {
                        const prodId = typeof prod === 'string' ? prod : prod?._id;
                        const prodObj = getProductById(prodId);
                        return (
                          <TouchableOpacity
                            style={styles.productCard}
                            onPress={e => {
                              e.stopPropagation();
                              handleProductPress(prodId);
                            }}
                            activeOpacity={0.8}
                          >
                            {prodObj?.Image ? (
                              <Image
                                source={{ uri: prodObj.Image }}
                                style={styles.productImage}
                                resizeMode="cover"
                              />
                            ) : (
                              <View style={styles.productImagePlaceholder}>
                                <Ionicons name="image-outline" size={24} color="#666" />
                              </View>
                            )}
                            <View style={styles.productInfo}>
                              <Text style={styles.productName} numberOfLines={2}>
                                {prodObj?.Name || 'Sản phẩm'}
                              </Text>
                              <View style={styles.productAction}>
                                <Text style={styles.productActionText}>Xem chi tiết</Text>
                                <Ionicons name="chevron-forward" size={14} color="#FF6B9D" />
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      }}
                      keyExtractor={(prod, idx) => {
                        const prodId = typeof prod === 'string' ? prod : prod?._id;
                        return prodId || idx.toString();
                      }}
                    />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 80 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>Chưa có video nào!</Text>
          </View>
        }
        getItemLayout={(_, index) => (
          { length: SCREEN_HEIGHT, offset: SCREEN_HEIGHT * index, index }
        )}
      />

      {/* Enhanced Login Modal */}
      <Modal
        visible={showLoginModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowLoginModal(false)}
          >
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalIcon}>
                  <Ionicons name="lock-closed" size={32} color="#FF6B9D" />
                </View>
                <Text style={styles.modalTitle}>Đăng nhập để tiếp tục</Text>
                <Text style={styles.modalSubtitle}>
                  Bạn cần đăng nhập để thích video và tương tác với cộng đồng
                </Text>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => {
                    setShowLoginModal(false);
                    router.push('/login');
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FF6B9D', '#FF8A80']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.primaryButtonText}>Đăng nhập ngay</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setShowLoginModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>Để sau</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  touchableOverlay: {
    flex: 1,
    width: '100%',
    height: SCREEN_HEIGHT,
  },
  video: {
    position: 'absolute',
    width: '100%',
    height: SCREEN_HEIGHT,
    top: 0,
    left: 0,
    backgroundColor: '#000',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.6,
    zIndex: 1,
  },
  centerPlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
    zIndex: 10,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideActions: {
    position: 'absolute',
    right: 16,
    bottom: 300,
    zIndex: 2,
    alignItems: 'center',
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 80,
    zIndex: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  caption: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 4,
    opacity: 0.9,
  },
  productsSection: {
    marginTop: 8,
  },
  productsSectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.9,
  },
  productCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    marginRight: 12,
    width: 140,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 80,
    backgroundColor: '#f5f5f5',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  productAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productActionText: {
    fontSize: 11,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: SCREEN_HEIGHT,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 32,
    alignItems: 'center',
  },
  modalIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalActions: {
    padding: 24,
    paddingTop: 0,
  },
  primaryButton: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});