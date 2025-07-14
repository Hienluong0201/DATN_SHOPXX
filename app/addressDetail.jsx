import AxiosInstance from '../axiosInstance/AxiosInstance';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../store/useAuth';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const AddressScreen = () => {
  const { user } = useAuth();
  const userID = user?._id;
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAddress, setCurrentAddress] = useState({
    _id: '',
    name: '',
    address: '',
    sdt: '',
    isDefault: false,
  });

  // State cho dropdown và bản đồ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [mapMode, setMapMode] = useState(false); // Chế độ bản đồ toàn màn hình
  const [mapRegion, setMapRegion] = useState(null); // Vùng bản đồ
  const [selectedLocation, setSelectedLocation] = useState(null); // Vị trí được chọn trên bản đồ
  const mapRef = useRef(null);

  // Lấy vị trí hiện tại
  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Vui lòng cho phép truy cập vị trí trong cài đặt để sử dụng bản đồ.');
      return false;
    }

    try {
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High, timeout: 10000 });
      const { latitude, longitude } = location.coords;
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setSelectedLocation({ latitude, longitude });
      await updateAddressFromLocation(latitude, longitude);
      return true;
    } catch (err) {
      console.error('Lỗi định vị:', err.message);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại. Vui lòng kiểm tra GPS hoặc thử lại.');
      return false;
    }
  };

  // Cập nhật địa chỉ từ tọa độ
  const updateAddressFromLocation = async (latitude, longitude) => {
    try {
      let address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address.length > 0) {
        const addr = address[0];
        const provinceMatch = provinces.find(p => 
          p.name.toLowerCase().includes((addr.city || addr.region || '').toLowerCase().replace('thành phố', '').trim())
        );
        if (provinceMatch) setSelectedProvince(provinceMatch.code);

        if (selectedProvince && districts.length > 0) {
          const districtMatch = districts.find(d => 
            d.name.toLowerCase().includes((addr.subregion || addr.district || '').toLowerCase().replace('quận', '').trim())
          );
          if (districtMatch) setSelectedDistrict(districtMatch.code);
        }

        if (selectedDistrict && wards.length > 0) {
          const wardMatch = wards.find(w => 
            w.name.toLowerCase().includes((addr.name || '').toLowerCase().replace('phường', '').trim())
          );
          if (wardMatch) setSelectedWard(wardMatch.code);
        }
      }
    } catch (err) {
      console.error('Lỗi khi lấy địa chỉ:', err.message);
    }
  };

  useEffect(() => {
    if (modalVisible && mapMode) {
      getCurrentLocation();
    }
  }, [modalVisible, mapMode]);

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

  // Gọi API để lấy danh sách tỉnh/thành phố khi modal mở
  useEffect(() => {
    if (modalVisible) {
      const fetchProvinces = async () => {
        try {
          const response = await fetch('https://provinces.open-api.vn/api/p/');
          const data = await response.json();
          setProvinces(data);
        } catch (err) {
          console.error('Lỗi khi tải tỉnh/thành phố:', err.message);
          Alert.alert('Lỗi', 'Không thể tải danh sách tỉnh/thành phố.');
        }
      };
      fetchProvinces();
    }
  }, [modalVisible]);

  // Gọi API để lấy quận/huyện khi chọn tỉnh/thành phố
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        try {
          const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`);
          const data = await response.json();
          setDistricts(data.districts || []);
          setSelectedDistrict('');
          setWards([]);
          setSelectedWard('');
          if (selectedLocation) await updateAddressFromLocation(selectedLocation.latitude, selectedLocation.longitude);
        } catch (err) {
          console.error('Lỗi khi tải quận/huyện:', err.message);
          Alert.alert('Lỗi', 'Không thể tải danh sách quận/huyện.');
        }
      };
      fetchDistricts();
    }
  }, [selectedProvince, selectedLocation]);

  // Gọi API để lấy phường/xã khi chọn quận/huyện
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        try {
          const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
          const data = await response.json();
          setWards(data.wards || []);
          setSelectedWard('');
          if (selectedLocation) await updateAddressFromLocation(selectedLocation.latitude, selectedLocation.longitude);
        } catch (err) {
          console.error('Lỗi khi tải phường/xã:', err.message);
          Alert.alert('Lỗi', 'Không thể tải danh sách phường/xã.');
        }
      };
      fetchWards();
    }
  }, [selectedDistrict, selectedLocation]);

  // Mở modal để thêm địa chỉ mới
  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentAddress({ _id: '', name: '', address: '', sdt: '', isDefault: false });
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedWard('');
    setMapMode(false);
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
    const addressParts = address.address.split(', ');
    if (addressParts.length === 3) {
      setSelectedWard(addressParts[0]);
      setSelectedDistrict(addressParts[1]);
      setSelectedProvince(addressParts[2]);
    }
    setMapMode(false);
    setModalVisible(true);
  };

  // Xử lý chọn vị trí trên bản đồ
  const onMapPress = async (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    setMapRegion({
      ...mapRegion,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
    await updateAddressFromLocation(coordinate.latitude, coordinate.longitude);
  };

  // Xử lý thêm hoặc cập nhật địa chỉ
  const handleSaveAddress = async () => {
    if (!currentAddress.name || !selectedProvince || !selectedDistrict || !selectedWard || !currentAddress.sdt) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin: Tên, địa chỉ, số điện thoại.');
      return;
    }

    const provinceName = provinces.find((p) => p.code === parseInt(selectedProvince))?.name || '';
    const districtName = districts.find((d) => d.code === parseInt(selectedDistrict))?.name || '';
    const wardName = wards.find((w) => w.code === parseInt(selectedWard))?.name || '';
    const fullAddress = `${wardName}, ${districtName}, ${provinceName}`;

    try {
      const payload = {
        userID,
        name: currentAddress.name,
        address: fullAddress,
        sdt: currentAddress.sdt,
        isDefault: currentAddress.isDefault,
      };

      if (isEditMode) {
        const response = await AxiosInstance().put(`/adress/${currentAddress._id}`, payload);
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
        const response = await AxiosInstance().post('/adress', payload);
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
      setSelectedProvince('');
      setSelectedDistrict('');
      setSelectedWard('');
      setMapRegion(null);
      setSelectedLocation(null);
      setMapMode(false);
      Alert.alert('Thành công', isEditMode ? 'Đã cập nhật địa chỉ!' : 'Đã thêm địa chỉ mới!');
    } catch (err) {
      console.error(`Lỗi khi ${isEditMode ? 'cập nhật' : 'thêm'} địa chỉ:`, err.message);
      Alert.alert('Lỗi', `Không thể ${isEditMode ? 'cập nhật' : 'thêm'} địa chỉ. Vui lòng thử lại.`);
    }
  };

  // Quay lại giao diện nhập liệu từ bản đồ
  const handleMapConfirm = () => {
    setMapMode(false);
  };

  // Làm mới vị trí
  const refreshLocation = async () => {
    if (await getCurrentLocation()) {
      mapRef.current?.animateToRegion(mapRegion, 1000);
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
              style={[
                styles.addressItem,
                selectedAddress === address._id && styles.selectedAddressItem,
              ]}
              onPress={() => handleSelectAddress(address._id)}
            >
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
          {!mapMode ? (
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
              <Picker
                selectedValue={selectedProvince}
                onValueChange={(itemValue) => setSelectedProvince(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Chọn tỉnh/thành phố" value="" />
                {provinces.map((province) => (
                  <Picker.Item key={province.code} label={province.name} value={province.code} />
                ))}
              </Picker>
              <Picker
                selectedValue={selectedDistrict}
                onValueChange={(itemValue) => setSelectedDistrict(itemValue)}
                style={styles.picker}
                enabled={selectedProvince !== ''}
              >
                <Picker.Item label="Chọn quận/huyện" value="" />
                {districts.map((district) => (
                  <Picker.Item key={district.code} label={district.name} value={district.code} />
                ))}
              </Picker>
              <Picker
                selectedValue={selectedWard}
                onValueChange={(itemValue) => setSelectedWard(itemValue)}
                style={styles.picker}
                enabled={selectedDistrict !== ''}
              >
                <Picker.Item label="Chọn phường/xã" value="" />
                {wards.map((ward) => (
                  <Picker.Item key={ward.code} label={ward.name} value={ward.code} />
                ))}
              </Picker>
              <TouchableOpacity style={styles.mapButton} onPress={() => setMapMode(true)}>
                <Text style={styles.mapButtonText}>Chọn trên bản đồ</Text>
              </TouchableOpacity>
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
          ) : (
            <View style={styles.fullScreenMapContainer}>
              <View style={styles.mapHeader}>
                <TouchableOpacity onPress={handleMapConfirm} style={styles.backButtonMap}>
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.mapTitle}>Chọn địa chỉ trên bản đồ</Text>
                <TouchableOpacity onPress={refreshLocation} style={styles.refreshButton}>
                  <Ionicons name="refresh" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <MapView
                style={styles.fullScreenMap}
                region={mapRegion}
                onPress={onMapPress}
                showsUserLocation={true}
                followsUserLocation={true}
                ref={mapRef}
              >
                {selectedLocation && (
                  <Marker
                    coordinate={selectedLocation}
                    title="Vị trí được chọn"
                  />
                )}
              </MapView>
              <TouchableOpacity style={styles.confirmMapButton} onPress={handleMapConfirm}>
                <Text style={styles.confirmMapButtonText}>Xác nhận vị trí</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5',marginTop: 30 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { padding: 5 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', flex: 1, textAlign: 'center' },
  placeholder: { width: 24 },
  addressCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3 },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 10,
    marginVertical: 5,
  },
  selectedAddressItem: {
    backgroundColor: '#f5e6d3',
    borderWidth: 1,
    borderColor: '#8B5A2B',
  },
  addressDetails: { flex: 1 },
  addressLabel: { fontSize: 16, fontWeight: '600', color: '#2c2c2c' },
  defaultTag: { fontSize: 12, color: '#8B5A2B', fontWeight: '400' },
  addressValue: { fontSize: 14, color: '#666', marginTop: 2 },
  phoneValue: { fontSize: 14, color: '#666', marginTop: 2 },
  addButton: { backgroundColor: '#f0f2f5', padding: 10, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  addText: { fontSize: 14, color: '#8B5A2B', fontWeight: '600' },
  loadingText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginTop: 20 },
  noDataText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
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
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
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
  mapButton: {
    backgroundColor: '#f0f2f5',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  mapButtonText: {
    fontSize: 16,
    color: '#8B5A2B',
    fontWeight: '600',
  },
  fullScreenMapContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#8B5A2B',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  backButtonMap: {
    padding: 5,
  },
  refreshButton: {
    padding: 5,
  },
  mapTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  fullScreenMap: {
    flex: 1,
  },
  confirmMapButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#8B5A2B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  confirmMapButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AddressScreen;