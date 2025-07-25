import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, StyleSheet, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { useAuth } from '../store/useAuth';
import AxiosInstance from '../axiosInstance/AxiosInstance';
import { Video } from 'expo-av';
import { useProducts } from '../store/useProducts';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
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

  // Thêm state cho modal login
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Cleanup khi rời trang: dừng và giải phóng tất cả video
  useEffect(() => {
    return () => {
      videoRefs.current.forEach(ref => {
        if (ref) {
          ref.pauseAsync?.();
          ref.unloadAsync?.();
        }
      });
    };
  }, []);

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
      // Có thể show Alert nếu muốn
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

  // Like video (bây giờ sẽ mở modal nếu chưa đăng nhập)
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
      // Có thể show Alert nếu muốn
    }
  };

  // Chạm overlay để pause/play video hiện tại
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

  if (loading && videos.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
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
            {index === currentIndex && pausedIndexes.includes(index) && (
              <View style={styles.centerPlayIcon}>
                <Text style={{ fontSize: 68, color: '#fff', opacity: 0.95 }}>▶️</Text>
              </View>
            )}
            <View style={styles.infoOverlay}>
              <Text style={styles.caption}>{item.caption}</Text>
              <Text style={styles.meta}>Người đăng: {item.userID?.name}</Text>
              <Text style={styles.meta}>Lượt xem: {item.views}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                {Array.isArray(item.products) && item.products.length > 0 ? (
                  item.products.map((prod, idx2) => {
                    const prodId = typeof prod === 'string' ? prod : prod?._id;
                    const prodObj = getProductById(prodId);
                    return (
                      <TouchableOpacity
                        key={prodId || idx2}
                        style={styles.productTag}
                        onPress={e => {
                          e.stopPropagation();
                          handleProductPress(prodId);
                        }}
                      >
                        <Text style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                          {prodObj?.Name || 'Xem sản phẩm'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={{ color: '#bdbdbd', fontSize: 13 }}>Chưa gắn sản phẩm nào</Text>
                )}
              </View>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <TouchableOpacity
                  style={styles.likeBtn}
                  onPress={e => {
                    e.stopPropagation();
                    toggleLike(item._id);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    color: item.likes.includes(user?._id) ? '#e91e63' : '#eee',
                    fontWeight: 'bold',
                    fontSize: 17,
                  }}>
                    {item.likes.length} ♥ Thích
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 80 }}
        ListEmptyComponent={<Text style={{ color: '#fff', textAlign: 'center', marginTop: 32 }}>Chưa có video nào!</Text>}
        getItemLayout={(_, index) => (
          { length: SCREEN_HEIGHT, offset: SCREEN_HEIGHT * index, index }
        )}
      />

      {/* Modal đăng nhập khi chưa login mà nhấn Like */}
      <Modal
        visible={showLoginModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setShowLoginModal(false)}
        >
          <View style={{
            width: 320,
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 28,
            alignItems: 'center',
          }}>
            <Ionicons name="log-in-outline" size={50} color="#007AFF" style={{ marginBottom: 14 }} />
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 6, color: '#222' }}>Bạn cần đăng nhập!</Text>
            <Text style={{ color: '#444', fontSize: 15, marginBottom: 26, textAlign: 'center' }}>
              Vui lòng đăng nhập để thực hiện thao tác này.
            </Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#007AFF',
                  paddingHorizontal: 24,
                  paddingVertical: 10,
                  borderRadius: 10,
                  marginRight: 10,
                }}
                onPress={() => {
                  setShowLoginModal(false);
                  router.push('/login'); // Đường dẫn sang màn Login, đổi theo app của bạn
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Đăng nhập</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#e0e0e0',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}
                onPress={() => setShowLoginModal(false)}
              >
                <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 16 }}>Để sau</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  touchableOverlay: {
    flex: 1,
    width: '100%',
    height: SCREEN_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  video: {
    position: 'absolute',
    width: '100%',
    height: SCREEN_HEIGHT,
    top: 0,
    left: 0,
    backgroundColor: '#000',
  },
  centerPlayIcon: {
    position: 'absolute',
    top: '43%',
    alignSelf: 'center',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  infoOverlay: {
    padding: 16,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  caption: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 8,
  },
  meta: {
    color: '#eee',
    fontSize: 14,
    marginBottom: 2,
  },
  likeBtn: {
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  productTag: {
    backgroundColor: '#e0f2f1',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 7,
    marginBottom: 4,
  },
});
