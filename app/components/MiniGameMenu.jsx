import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function MiniGameMenu({ onSpin, onFlip, onEgg }) {
  return (
    <View style={styles.wrap}>
      <Text style={{ fontWeight: "bold", fontSize: 19, marginBottom: 18, textAlign: "center" }}>
        🚀 Chọn Mini Game
      </Text>
      <TouchableOpacity style={styles.btn} onPress={onSpin}>
        <Ionicons name="sync-circle" size={21} color="#fff" style={{ marginRight: 7 }} />
        <Text style={styles.text}>Vòng quay may mắn</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onFlip}>
        <MaterialCommunityIcons name="cards-playing" size={21} color="#fff" style={{ marginRight: 7 }} />
        <Text style={styles.text}>Lật thẻ bí ẩn</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onEgg}>
        <MaterialCommunityIcons name="egg-easter" size={21} color="#fff" style={{ marginRight: 7 }} />
        <Text style={styles.text}>Đập trứng</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#fff",
    margin: 24,
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    elevation: 7,
    shadowColor: "#333"
  },
  btn: {
    backgroundColor: "#059669",
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    alignSelf: "stretch",
    justifyContent: "center"
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16.5,
    textTransform: "uppercase"
  }
});