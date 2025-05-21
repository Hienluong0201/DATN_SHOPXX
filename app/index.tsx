import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login'); // chuyển sang màn login sau 3 giây
    }, 10000);

    return () => clearTimeout(timer); // cleanup nếu unmount
  }, []);

  return (
    <View style={styles.container}>
      <Image
       
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.text}>Chào mừng bạn đến với Shop!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    color: 'white',
  },
});
