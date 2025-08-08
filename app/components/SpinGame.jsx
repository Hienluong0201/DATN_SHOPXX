import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import AxiosInstance from '../../axiosInstance/AxiosInstance';
import { useAuth } from '../../store/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WHEEL_COLORS = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40', '#ff7979'];
const LABELS = [
  '0%', 
  '0%', 
  '0%', 
  '10%', 
  '20%', 
  '30%', 
  '40%',
];

export default function SpinGame({ onClose, onResult }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState('');
  const [loadingResult, setLoadingResult] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const { user } = useAuth();
  const userId = user?._id;
  const SPIN_KEY = `last_spin_${userId}`;

  // Tính thời gian còn lại, cập nhật mỗi giây nếu còn hạn
  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Kiểm tra lần quay gần nhất khi mở trang
  useEffect(() => {
    checkSpinAvailable();
  }, [userId]);

  const checkSpinAvailable = async () => {
    try {
      const lastSpin = await AsyncStorage.getItem(SPIN_KEY);
      if (lastSpin) {
        const now = Date.now();
        const diff = now - Number(lastSpin);
        if (diff < 24 * 60 * 60 * 1000) {
          setCanSpin(false);
          setTimeLeft(Math.ceil((24 * 60 * 60 * 1000 - diff) / 1000));
          return;
        }
      }
      setCanSpin(true);
      setTimeLeft(0);
    } catch (e) {
      setCanSpin(true);
      setTimeLeft(0);
    }
  };

  // Quay và hiển thị kết quả
  const spin = async () => {
    setSpinning(true);
    setResult('');
    setLoadingResult(true);

    // Kiểm tra lần quay gần nhất (bảo vệ chắc chắn)
    const lastSpin = await AsyncStorage.getItem(SPIN_KEY);
    if (lastSpin) {
      const now = Date.now();
      const diff = now - Number(lastSpin);
      if (diff < 24 * 60 * 60 * 1000) {
        setResult('Bạn chỉ được quay 1 lần mỗi 24 tiếng. Quay lại sau!');
        setSpinning(false);
        setLoadingResult(false);
        setCanSpin(false);
        setTimeLeft(Math.ceil((24 * 60 * 60 * 1000 - diff) / 1000));
        return;
      }
    }

    try {
      const res = await AxiosInstance().post('/voucherDetail/spin', { userId });
      const { message, prizeIndex = 0 } = res;

      // Lưu lại thời gian quay mới
      await AsyncStorage.setItem(SPIN_KEY, String(Date.now()));
      setCanSpin(false);
      setTimeLeft(24 * 60 * 60);

      // Tính góc quay trùng kết quả
      const slice = 360 / LABELS.length;
      const randomOffset = Math.random() * slice;
      const targetDeg = 360 * 4 + (slice * prizeIndex + randomOffset);

      Animated.timing(spinAnim, {
        toValue: targetDeg,
        duration: 2600,
        useNativeDriver: true,
      }).start(() => {
        setResult(message || 'Đã quay xong!');
        setSpinning(false);
        setLoadingResult(false);
        onResult && onResult(message || 'Đã quay xong!');
      });
    } catch (err) {
      setResult('Lỗi kết nối!');
      setSpinning(false);
      setLoadingResult(false);
    }
  };

  // Hiện text phần thưởng trên bánh xe
  const renderWheel = () => {
    const radius = 100;
    const textRadius = 72;
    return (
      <Svg height={240} width={240} viewBox="0 0 200 200">
        <G origin="100,100">
          {WHEEL_COLORS.map((color, i) => {
            const angle = 360 / WHEEL_COLORS.length;
            const startAngle = i * angle;
            const endAngle = (i + 1) * angle;
            const x1 = 100 + radius * Math.sin((startAngle * Math.PI) / 180);
            const y1 = 100 - radius * Math.cos((startAngle * Math.PI) / 180);
            const x2 = 100 + radius * Math.sin((endAngle * Math.PI) / 180);
            const y2 = 100 - radius * Math.cos((endAngle * Math.PI) / 180);
            const midAngle = startAngle + angle / 2;
            const textX = 100 + textRadius * Math.sin((midAngle * Math.PI) / 180);
            const textY = 100 - textRadius * Math.cos((midAngle * Math.PI) / 180);

            return (
              <G key={i}>
                <Path
                  d={`M100,100 L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z`}
                  fill={color}
                />
                <SvgText
                  x={textX}
                  y={textY}
                  fontSize="13"
                  fill="#222"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  transform={`rotate(${midAngle},${textX},${textY})`}
                >
                  {LABELS[i]}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    );
  };

  // Hàm format thời gian còn lại (giờ:phút:giây)
  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.wrap}>
      <Text style={{ fontWeight: "bold", fontSize: 22, marginBottom: 8 }}>🎯 Vòng quay may mắn!</Text>
      <Animated.View
        style={{
          alignSelf: 'center',
          transform: [{
            rotate: spinAnim.interpolate({
              inputRange: [0, 360],
              outputRange: ['0deg', '360deg']
            })
          }]
        }}>
        {renderWheel()}
        <View pointerEvents="none" style={styles.pointer}>
          <Ionicons name="caret-up" size={48} color="#f87171" />
        </View>
      </Animated.View>
      <View style={{ alignItems: 'center', marginVertical: 18 }}>
        <TouchableOpacity
          style={[
            styles.spinBtn,
            (!canSpin || spinning || loadingResult) && { backgroundColor: '#cbd5e1' }
          ]}
          onPress={spin}
          disabled={!canSpin || spinning || loadingResult}
        >
          <Ionicons name="sync-circle" size={23} color="#fff" style={{ marginRight: 5 }} />
          <Text style={{ color: "#fff", fontWeight: 'bold', fontSize: 17 }}>
            {(spinning || loadingResult) ? 'Đang quay...' : 'Quay!'}
          </Text>
        </TouchableOpacity>
        {!canSpin && timeLeft > 0 && (
          <Text style={{ color: "#ef4444", marginTop: 8 }}>
            Bạn chỉ được quay 1 lần mỗi 24 tiếng. Vui lòng quay lại sau: <Text style={{ fontWeight: 'bold' }}>{formatTime(timeLeft)}</Text>
          </Text>
        )}
      </View>
      {loadingResult ? (
        <ActivityIndicator color="#059669" style={{ marginTop: 8 }} />
      ) : result ? (
        <Text style={{ marginTop: 8, fontWeight: 'bold', color: "#be185d", fontSize: 18 }}>
          🎉 {result}
        </Text>
      ) : null}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={{ color: "#059669", fontWeight: 'bold', fontSize: 15 }}>Đóng</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    elevation: 8
  },
  spinBtn: {
    backgroundColor: "#059669",
    paddingVertical: 13,
    paddingHorizontal: 35,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center'
  },
  closeBtn: {
    marginTop: 16,
    alignSelf: "center"
  },
  pointer: {
    position: "absolute",
    left: "50%",
    top: 0,
    transform: [{ translateX: -24 }],
    zIndex: 100,
  }
});