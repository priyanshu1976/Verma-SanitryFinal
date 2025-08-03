import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Edit, Plus } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { addressService } from '@/services/api'; // Use addressService for API calls

// Add interceptors for token handling (if not already globally set)
import { api } from '@/services/api';
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(new Error(error));
  }
);

interface Address {
  id: number;
  label: string;
  house: string;
  street: string;
  city: string;
  landmark?: string;
  address1?: string;
}

const emptyForm = {
  label: '',
  house: '',
  street: '',
  city: '',
  landmark: '',
  address1: '',
};

export default function AddressBookScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch addresses from API
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await addressService.getAddresses();
      if (res.success && Array.isArray(res.data)) {
        setAddresses(res.data);
      } else if (res.data && Array.isArray((res.data as any).addresses)) {
        setAddresses((res.data as any).addresses);
      } else {
        setAddresses([]);
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to fetch addresses'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Handle add new address
  const handleAddAddress = async () => {
    if (
      !formData.label ||
      !formData.house ||
      !formData.street ||
      !formData.city
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    try {
      setLoading(true);
      const res = await addressService.addAddress({
        label: formData.label,
        house: formData.house,
        street: formData.street,
        city: formData.city,
        landmark: formData.landmark,
        address1: formData.address1,
      });
      if (res.success && res.data) {
        setAddresses((prev) => [...prev, res.data]);
        setFormData({ ...emptyForm });
        setIsAdding(false);
        Alert.alert('Success', 'Address added successfully');
      } else {
        console.log('this ran 1');
        console.log(res);
        throw new Error(res.error || 'Failed to add address');
      }
    } catch (error: any) {
      console.log(error.message, 'this ran');
      Alert.alert('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit address
  const handleEditAddress = (address: Address) => {
    setFormData({
      label: address.label,
      house: address.house,
      street: address.street,
      city: address.city,
      landmark: address.landmark || '',
      address1: address.address1 || '',
    });
    setEditId(address.id);
    setIsEditing(true);
    setIsAdding(false);
  };

  // Handle update address
  const handleUpdateAddress = async () => {
    if (
      !formData.label ||
      !formData.house ||
      !formData.street ||
      !formData.city
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (editId === null) return;
    try {
      setLoading(true);
      const res = await addressService.updateAddress(editId, {
        label: formData.label,
        house: formData.house,
        street: formData.street,
        city: formData.city,
        landmark: formData.landmark,
        address1: formData.address1,
      });
      if (res.success && res.data) {
        setAddresses((prev) =>
          prev.map((addr) => (addr.id === editId ? res.data : addr))
        );
        setFormData({ ...emptyForm });
        setIsEditing(false);
        setEditId(null);
        Alert.alert('Success', 'Address updated successfully');
      } else {
        throw new Error(res.message || 'Failed to update address');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to update address'
      );
    } finally {
      setLoading(false);
    }
  };

  // Address form (for add/edit)
  const renderAddressForm = (mode: 'add' | 'edit') => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>
        {mode === 'add' ? 'Add Address' : 'Edit Address'}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Label (e.g., Home, Office)"
        value={formData.label}
        onChangeText={(text) => setFormData({ ...formData, label: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="House / Flat / Apartment"
        value={formData.house}
        onChangeText={(text) => setFormData({ ...formData, house: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Street / Area"
        value={formData.street}
        onChangeText={(text) => setFormData({ ...formData, street: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Landmark (optional)"
        value={formData.landmark}
        onChangeText={(text) => setFormData({ ...formData, landmark: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Additional Address Info (optional)"
        value={formData.address1}
        onChangeText={(text) => setFormData({ ...formData, address1: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        value={formData.city}
        onChangeText={(text) => setFormData({ ...formData, city: text })}
      />
      <View style={styles.formButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setIsEditing(false);
            setIsAdding(false);
            setFormData({ ...emptyForm });
            setEditId(null);
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={mode === 'add' ? handleAddAddress : handleUpdateAddress}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {mode === 'add' ? 'Add' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render a single address card
  const renderAddress = (address: Address) => (
    <View style={styles.addressCard} key={address.id}>
      <View style={styles.addressHeader}>
        <View style={styles.addressInfo}>
          <Text style={styles.addressName}>{address.label}</Text>
        </View>
        <View style={styles.addressActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditAddress(address)}
          >
            <Edit size={16} color="#c6aa55" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.addressText}>
        {address.house}, {address.street}
      </Text>
      {address.landmark ? (
        <Text style={styles.addressText}>Landmark: {address.landmark}</Text>
      ) : null}
      {address.address1 ? (
        <Text style={styles.addressText}>{address.address1}</Text>
      ) : null}
      <Text style={styles.addressText}>{address.city}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#2e3f47" />
        </TouchableOpacity>
        <Text style={styles.title}>Address Book</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add/Edit Form */}
        {isEditing && renderAddressForm('edit')}
        {isAdding && renderAddressForm('add')}

        {/* Address Display */}
        <View style={styles.addressesSection}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.sectionTitle}>Your Addresses</Text>
            {!isEditing && !isAdding && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#c6aa55',
                  borderRadius: 8,
                  padding: 8,
                }}
                onPress={() => {
                  setIsAdding(true);
                  setIsEditing(false);
                  setFormData({ ...emptyForm });
                  setEditId(null);
                }}
              >
                <Plus size={16} color="#fff" />
                <Text
                  style={{
                    color: '#fff',
                    marginLeft: 4,
                    fontFamily: 'Inter-SemiBold',
                  }}
                >
                  Add
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {addresses.length === 0 && !loading && (
            <Text style={{ color: '#9b9591', marginTop: 16 }}>
              No addresses found.
            </Text>
          )}
          {addresses.map((address) => (
            <View style={styles.addressCard} key={address.id}>
              <View style={styles.addressHeader}>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressName}>{address.label}</Text>
                </View>
                <View style={styles.addressActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditAddress(address)}
                  >
                    <Edit size={16} color="#c6aa55" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.addressText}>
                {address.house}, {address.street}
              </Text>
              {address.landmark ? (
                <Text style={styles.addressText}>
                  Landmark: {address.landmark}
                </Text>
              ) : null}
              {address.address1 ? (
                <Text style={styles.addressText}>{address.address1}</Text>
              ) : null}
              <Text style={styles.addressText}>{address.city}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2e3f47',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#9b9591',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#c6aa55',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  addressesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addressInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
    marginRight: 8,
  },
  addressActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#2e3f47',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
  },
});
