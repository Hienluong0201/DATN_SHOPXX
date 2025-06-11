import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'

const HelpScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tính năng đang phát triển</Text>
      <Text style={styles.description}>
        Chúng tôi đang nỗ lực hoàn thiện tính năng này. Vui lòng quay lại sau!
      </Text>
    </View>
  )
}

export default HelpScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
})
