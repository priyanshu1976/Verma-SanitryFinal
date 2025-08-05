import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { productService, categoryService } from '@/services/api';
import { Category } from '@/types/api';
import * as ImagePicker from 'expo-image-picker';

const CLOUDINARY_UPLOAD_PRESET = 'mittal'; // <-- Replace with your Cloudinary unsigned upload preset
const CLOUDINARY_CLOUD_NAME = 'dqkxpmdsf'; // <-- Replace with your Cloudinary cloud name

async function uploadImageToCloudinary(uri: string): Promise<string | null> {
  try {
    const formData = new FormData();
    // @ts-ignore
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    }
    return null;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
}

export default function AddProductScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    // imageUrl: '', // Remove single imageUrl
    images: [] as string[], // Add images array
    categoryId: '',
    availableStock: '',
    isFeatured: false,
    isBestseller: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [localImages, setLocalImages] = useState<string[]>([]); // For local preview

  // For custom dropdown
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const pickImages = async () => {
    // Ask for permission
    let permissionResult = true;
    // if (Platform.OS === 'ios') {
    //   permissionResult =
    //     await ImagePicker.requestMediaLibraryPermissionsAsync();
    // } else {
    //   permissionResult =
    //     await ImagePicker.requestMediaLibraryPermissionsAsync();
    // }
    // if (permissionResult.status !== 'granted') {
    //   Alert.alert(
    //     'Permission Required',
    //     'Camera roll permission is required to select an image from your device. Please enable it in your device settings.'
    //   );
    //   return;
    // }
    // Pick images
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.8,
      selectionLimit: 5, // Limit to 5 images
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUploading(true);
      const uris = result.assets.map((asset) => asset.uri);
      setLocalImages((prev) => [...prev, ...uris]);
      // Upload all images in parallel
      const uploadPromises = uris.map((uri) => uploadImageToCloudinary(uri));
      const uploadedUrls = await Promise.all(uploadPromises);
      setImageUploading(false);
      const successfulUrls = uploadedUrls.filter((url): url is string => !!url);
      if (successfulUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...successfulUrls],
        }));
      }
      if (successfulUrls.length < uris.length) {
        Alert.alert(
          'Upload failed',
          'Some images could not be uploaded to Cloudinary.'
        );
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setLocalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = async () => {
    try {
      if (!formData.name || !formData.price || !formData.categoryId) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      setIsLoading(true);
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        images:
          formData.images.length > 0
            ? formData.images
            : [
                'https://images.pexels.com/photos/6585751/pexels-photo-6585751.jpeg?auto=compress&cs=tinysrgb&w=500',
              ],
        categoryId: parseInt(formData.categoryId),
        availableStock: parseInt(formData.availableStock) || 0,
        isFeatured: formData.isFeatured,
        isBestseller: formData.isBestseller,
        rating: 0,
        createdAt: new Date(),
        taxPercent: 5, // Default tax percent
      };
      const response = await productService.createProduct(productData as any);
      if (response.success) {
        Alert.alert('Success', 'Product added successfully');
        router.replace('/(admin)/products');
      } else {
        Alert.alert('Error', response.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get selected category name
  const getSelectedCategoryName = () => {
    const cat = categories.find((c) => c.id.toString() === formData.categoryId);
    return cat ? cat.name : 'Select a category';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.formContainer}>
        <Text style={styles.formTitle}>Add New Product</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, name: text }))
            }
            placeholder="Enter product name"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, description: text }))
            }
            placeholder="Enter product description"
            multiline
            numberOfLines={3}
          />
        </View>
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Price *</Text>
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, price: text }))
              }
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Available Stock</Text>
            <TextInput
              style={styles.input}
              value={formData.availableStock}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, availableStock: text }))
              }
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Product Images</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImages}
              disabled={imageUploading}
            >
              <Text style={styles.imagePickerButtonText}>
                {imageUploading ? 'Uploading...' : 'Pick Images'}
              </Text>
            </TouchableOpacity>
            {imageUploading && (
              <ActivityIndicator size="small" color="#0066CC" />
            )}
            {formData.images && formData.images.length > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {formData.images.map((img, idx) => (
                  <View
                    key={img + idx}
                    style={{
                      position: 'relative',
                      marginRight: 8,
                      marginTop: 8,
                    }}
                  >
                    <Image source={{ uri: img }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(idx)}
                    >
                      <Text style={styles.removeImageButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
          {/* Optionally, allow manual input of image URLs */}
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            value={''}
            onChangeText={(text) => {
              // Add image URL to images array if valid
              if (text && text.startsWith('http')) {
                setFormData((prev) => ({
                  ...prev,
                  images: [...prev.images, text],
                }));
              }
            }}
            placeholder="Paste image URL and press enter"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={(e) => {
              const text = e.nativeEvent.text;
              if (text && text.startsWith('http')) {
                setFormData((prev) => ({
                  ...prev,
                  images: [...prev.images, text],
                }));
              }
            }}
            blurOnSubmit={true}
          />
        </View>
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Category *</Text>
            {/* Custom dropdown instead of Picker */}
            <Pressable
              style={styles.customDropdown}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Text
                style={{
                  color: formData.categoryId ? '#1F2937' : '#9CA3AF',
                  fontSize: 16,
                  fontFamily: 'Inter-Regular',
                }}
              >
                {getSelectedCategoryName()}
              </Text>
            </Pressable>
            <Modal
              visible={categoryModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setCategoryModalVisible(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setCategoryModalVisible(false)}
              >
                <View style={styles.modalContent}>
                  <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <Pressable
                        style={styles.modalItem}
                        onPress={() => {
                          setFormData((prev) => ({
                            ...prev,
                            categoryId: item.id.toString(),
                          }));
                          setCategoryModalVisible(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.modalItemText,
                            formData.categoryId === item.id.toString() && {
                              fontWeight: 'bold',
                              color: '#0066CC',
                            },
                          ]}
                        >
                          {item.name}
                        </Text>
                      </Pressable>
                    )}
                    ListHeaderComponent={
                      <Pressable
                        style={styles.modalItem}
                        onPress={() => {
                          setFormData((prev) => ({
                            ...prev,
                            categoryId: '',
                          }));
                          setCategoryModalVisible(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.modalItemText,
                            !formData.categoryId && {
                              fontWeight: 'bold',
                              color: '#0066CC',
                            },
                          ]}
                        >
                          Select a category
                        </Text>
                      </Pressable>
                    }
                  />
                </View>
              </Pressable>
            </Modal>
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  formData.isFeatured && styles.checkboxChecked,
                ]}
                onPress={() =>
                  setFormData((prev) => ({
                    ...prev,
                    isFeatured: !prev.isFeatured,
                  }))
                }
              >
                {formData.isFeatured && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Featured</Text>
            </View>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  formData.isBestseller && styles.checkboxChecked,
                ]}
                onPress={() =>
                  setFormData((prev) => ({
                    ...prev,
                    isBestseller: !prev.isBestseller,
                  }))
                }
              >
                {formData.isBestseller && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Bestseller</Text>
            </View>
          </View>
        </View>
        <View style={styles.formActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleAddProduct}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Adding...' : 'Add Product'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  formContainer: {
    flex: 1,
    padding: 24,
  },
  formTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
    height: 48,
  },
  pickerItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  pickerContainer: {
    // Deprecated, kept for backward compatibility
    display: 'none',
  },
  categoryOption: {
    // Deprecated, kept for backward compatibility
    display: 'none',
  },
  selectedCategory: {
    // Deprecated, kept for backward compatibility
    display: 'none',
  },
  categoryOptionText: {
    // Deprecated, kept for backward compatibility
    display: 'none',
  },
  selectedCategoryText: {
    // Deprecated, kept for backward compatibility
    display: 'none',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0066CC',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  imagePickerButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  imagePickerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  imagePreview: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginLeft: 0,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  removeImageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  // Custom dropdown styles
  customDropdown: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    minHeight: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31,41,55,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: 350,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Inter-Regular',
  },
});
