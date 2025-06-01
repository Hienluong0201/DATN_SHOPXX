import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider'; // Updated import
import { Ionicons } from '@expo/vector-icons';

interface AdvancedFilterModalProps {
  visible: boolean;
  onClose: () => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedRating: number;
  setSelectedRating: (rating: number) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: { CategoryID: string; Name: string }[];
  onApplyFilters: () => void;
}

export default function AdvancedFilterModal({
  visible,
  onClose,
  priceRange,
  setPriceRange,
  selectedRating,
  setSelectedRating,
  selectedCategory,
  setSelectedCategory,
  categories,
  onApplyFilters,
}: AdvancedFilterModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Lọc Nâng Cao</Text>

          {/* Lọc theo giá */}
          <Text style={styles.filterLabel}>Khoảng giá</Text>
          <View style={styles.priceRangeContainer}>
            <TextInput
              style={styles.priceInput}
              value={priceRange[0].toString()}
              onChangeText={(text) => setPriceRange([+text || 0, priceRange[1]])}
              keyboardType="numeric"
              placeholder="Giá tối thiểu"
            />
            <Text>-</Text>
            <TextInput
              style={styles.priceInput}
              value={priceRange[1].toString()}
              onChangeText={(text) => setPriceRange([priceRange[0], +text || 1000000])}
              keyboardType="numeric"
              placeholder="Giá tối đa"
            />
          </View>

          {/* Lọc theo đánh giá */}
          <Text style={styles.filterLabel}>Đánh giá tối thiểu</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={5}
            step={1}
            value={selectedRating}
            onValueChange={setSelectedRating}
            minimumTrackTintColor="#8B4513"
            maximumTrackTintColor="#f0f0f0"
            thumbTintColor="#8B4513"
          />
          <Text style={styles.ratingText}>Đánh giá: {selectedRating} sao</Text>

          {/* Lọc theo danh mục */}
          <Text style={styles.filterLabel}>Danh mục</Text>
          <View style={styles.categoryContainer}>
            <TouchableOpacity
              style={[styles.categoryButton, !selectedCategory && styles.categoryButtonSelected]}
              onPress={() => setSelectedCategory('')}
            >
              <Text style={styles.categoryButtonText}>Tất cả</Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.CategoryID}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.CategoryID && styles.categoryButtonSelected,
                ]}
                onPress={() => setSelectedCategory(category.CategoryID)}
              >
                <Text style={styles.categoryButtonText}>{category.Name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nút áp dụng và đóng */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.applyButton} onPress={onApplyFilters}>
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 5,
    fontSize: 14,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
  },
  categoryButtonSelected: {
    backgroundColor: '#8B4513',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  applyButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
});