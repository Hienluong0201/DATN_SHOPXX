import AxiosInstance from '../axiosInstance/AxiosInstance';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../store/useAuth';

const AddressScreen = () => {
  const { user } = useAuth(); // Lấy thông tin user từ useAuth
  const userID = user?._id; // Lấy userID từ user._id
  const [addresses, setAddresses] = useState([]); // Lưu dữ liệu từ API
  const [selectedAddress, setSelectedAddress] = useState(null); // Theo dõi địa chỉ được chọn
  const [loading, setLoading] = useState(true); // Trạng thái tải
  const [error, setError] = useState(null); // Trạng thái lỗi
  const [modalVisible, setModalVisible] = useState(false); // Điều khiển modal
  const [isEditMode, setIsEditMode] = useState(false); // Phân biệt thêm mới hay chỉnh sửa
  const [currentAddress, setCurrentAddress] = useState({
    _id: '',
    name: '',
    address: '',
    sdt: '',
    isDefault: false,
  }); // Lưu dữ liệu địa chỉ đang chỉnh sửa/thêm mới

  // Gọi API để lấy danh sách địa chỉ
  useEffect(() => {
    if (!userID) {
      setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const response = await AxiosInstance().get(`/adress?userID=${userID}`);
        console.log('API Response:', response); // Log để kiểm tra

        if (Array.isArray(response)) {
          setAddresses(response);
          const defaultAddress = response.find((addr) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress._id);
          }
        } else {
          throw new Error('Dữ liệu API không phải mảng');
        }
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải địa chỉ:', err.message);
        setError('Không thể tải danh sách địa chỉ. Vui lòng thử lại.');
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [userID]);

  // Mở modal để thêm địa chỉ mới
  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentAddress({ _id: '', name: '', address: '', sdt: '', isDefault: false });
    setModalVisible(true);
  };

  // Mở modal để chỉnh sửa địa chỉ
  const openEditModal = (address) => {
    setIsEditMode(true);
    setCurrentAddress({
      _id: address._id,
      name: address.name,
      address: address.address,
      sdt: address.sdt,
      isDefault: address.isDefault,
    });
    setModalVisible(true);
  };

  // Xử lý thêm hoặc cập nhật địa chỉ
  const handleSaveAddress = async () => {
    if (!currentAddress.name || !currentAddress.address || !currentAddress.sdt) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin: Tên, địa chỉ, số điện thoại.');
      return;
    }

    try {
      const payload = {
        userID,
        name: currentAddress.name,
        address: currentAddress.address,
        sdt: currentAddress.sdt,
        isDefault: currentAddress.isDefault,
      };

      if (isEditMode) {
        // Cập nhật địa chỉ
        const response = await AxiosInstance().put(`/adress/${currentAddress._id}`, payload);
        console.log('Cập nhật địa chỉ thành công:', response);
        setAddresses((prev) =>
          prev.map((addr) =>
            addr._id === response._id
              ? response
              : currentAddress.isDefault
              ? { ...addr, isDefault: false }
              : addr
          )
        );
        if (currentAddress.isDefault) {
          setSelectedAddress(response._id);
        }
      } else {
        // Thêm địa chỉ mới
        const response = await AxiosInstance().post('/adress', payload);
        console.log('Thêm địa chỉ thành công:', response);
        setAddresses((prev) => [...prev, response]);
        if (currentAddress.isDefault) {
          setSelectedAddress(response._id);
          setAddresses((prev) =>
            prev.map((addr) =>
              addr._id === response._id ? addr : { ...addr, isDefault: false }
            )
          );
        }
      }

      setModalVisible(false);
      setCurrentAddress({ _id: '', name: '', address: '', sdt: '', isDefault: false });
      Alert.alert('Thành công', isEditMode ? 'Đã cập nhật địa chỉ!' : 'Đã thêm địa chỉ mới!');
    } catch (err) {
      console.error(`Lỗi khi ${isEditMode ? 'cập nhật' : 'thêm'} địa chỉ:`, err.message);
      Alert.alert('Lỗi', `Không thể ${isEditMode ? 'cập nhật' : 'thêm'} địa chỉ. Vui lòng thử lại.`);
    }
  };

  const goBack = () => {
    router.back();
  };

 

  const handleSelectAddress = (addressId) => {
    setSelectedAddress(addressId);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.title}>Địa chỉ</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Đang tải...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : addresses.length === 0 ? (
        <Text style={styles.noDataText}>Không tìm thấy địa chỉ nào.</Text>
      ) : (
        <View style={styles.addressCard}>
          {addresses.map((address) => (
            <TouchableOpacity
              key={address._id}
              style={styles.addressItem}
              onPress={() => handleSelectAddress(address._id)}
            >
              <Ionicons
                name={selectedAddress === address._id ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selectedAddress === address._id ? '#8B5A2B' : '#666'}
                style={styles.radioIcon}
              />
              <View style={styles.addressDetails}>
                <Text style={styles.addressLabel}>
                  {address.name || 'Không có tên'}
                  {address.isDefault && (
                    <Text style={styles.defaultTag}> (Mặc định)</Text>
                  )}
                </Text>
                <Text style={styles.addressValue}>{address.address || 'Không có địa chỉ'}</Text>
                <Text style={styles.phoneValue}>SĐT: {address.sdt || 'Không có số điện thoại'}</Text>
              </View>
              <TouchableOpacity onPress={() => openEditModal(address)}>
                <Ionicons name="ellipsis-vertical" size={20} color="#666" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          
        </View>
      )}
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addText}>+ Thêm địa chỉ mới</Text>
          </TouchableOpacity>

      {/* Modal để thêm hoặc chỉnh sửa địa chỉ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditMode ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tên (ví dụ: Nguyễn Văn A)"
              value={currentAddress.name}
              onChangeText={(text) => setCurrentAddress({ ...currentAddress, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Địa chỉ (ví dụ: 123 Lê Văn Sỹ, Q3)"
              value={currentAddress.address}
              onChangeText={(text) => setCurrentAddress({ ...currentAddress, address: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại (ví dụ: 0909123456)"
              value={currentAddress.sdt}
              onChangeText={(text) => setCurrentAddress({ ...currentAddress, sdt: text })}
              keyboardType="phone-pad"
            />
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                onPress={() =>
                  setCurrentAddress({ ...currentAddress, isDefault: !currentAddress.isDefault })
                }
                style={styles.checkbox}
              >
                <Ionicons
                  name={currentAddress.isDefault ? 'checkbox' : 'checkbox-outline'}
                  size={20}
                  color="#8B5A2B"
                />
                <Text style={styles.checkboxLabel}>Đặt làm địa chỉ mặc định</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSaveAddress}
              >
                <Text style={styles.modalButtonText}>{isEditMode ? 'Cập nhật' : 'Thêm'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { padding: 5 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', flex: 1, textAlign: 'center' },
  placeholder: { width: 24 },
  addressCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3 },
  addressItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  radioIcon: { marginRight: 10 },
  addressDetails: { flex: 1 },
  addressLabel: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  defaultTag: { fontSize: 12, color: '#8B5A2B', fontWeight: '400' },
  addressValue: { fontSize: 14, color: '#666', marginTop: 2 },
  phoneValue: { fontSize: 14, color: '#666', marginTop: 2 },
  addButton: { backgroundColor: '#f0f2f5', padding: 10, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  addText: { fontSize: 14, color: '#8B5A2B', fontWeight: '600' },
  applyButton: { backgroundColor: '#8B5A2B', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  applyText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loadingText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginTop: 20 },
  noDataText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
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
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#2c2c2c',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#2c2c2c',
    marginLeft: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f2f5',
  },
  confirmButton: {
    backgroundColor: '#8B5A2B',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AddressScreen;