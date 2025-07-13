// SearchComponent.tsx
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface SearchComponentProps {
  onFilterPress: () => void;
}

export default function SearchComponent({ onFilterPress }: SearchComponentProps) {
  return (
    <View style={styles.searchContainer}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => router.push({ pathname: './SearchScreen' })}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm"
          placeholderTextColor="#999"
          editable={false}
        />
      </TouchableOpacity>
      <MaterialIcons name="search" size={24} color="#8B4513" style={styles.searchIcon} />
      <TouchableOpacity onPress={onFilterPress}>
        <MaterialIcons name="filter-list" size={24} color="#8B4513" style={styles.filterIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: '#333',
  },
  searchIcon: {
    marginLeft: 10,
  },
  filterIcon: {
    marginLeft: 10,
  },
});