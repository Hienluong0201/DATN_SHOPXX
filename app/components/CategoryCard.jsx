import React from 'react';
import { Animated,Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CategoryCard = ({ category, onPress }) => {
  return (
    <TouchableOpacity style={styles.categoryCard} onPress={() => onPress(category.CategoryID)}>
      <View style={styles.categoryIcon}>
        <MaterialIcons name="category" size={40} color="#d4af37" />
      </View>
      <Text style={styles.categoryName}>{category.Name}</Text>
      <Text style={styles.categoryDesc}>{category.Description}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryCard: {
    width: 160,
    marginRight: 15,
    backgroundColor: '#2c2c2c',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  categoryIcon: {
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d4af37',
    textAlign: 'center',
  },
  categoryDesc: {
    fontSize: 12,
    color: '#bdc3c7',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default CategoryCard;