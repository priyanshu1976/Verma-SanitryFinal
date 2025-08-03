import React, { useState } from 'react';
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { categoryService } from '@/services/api';
import * as ImagePicker from 'expo-image-picker';

const CLOUDINARY_UPLOAD_PRESET = 'mittal';
const CLOUDINARY_CLOUD_NAME = 'dqkxpmdsf';

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
    return data.secure_url || null;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
}

export default function AddCategoryScreen() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const pickedUri = result.assets[0].uri;
      setImageUploading(true);
      const uploadedUrl = await uploadImageToCloudinary(pickedUri);
      setImageUploading(false);

      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, image_url: uploadedUrl }));
      } else {
        Alert.alert('Upload failed', 'Could not upload image to Cloudinary.');
      }
    }
  };

  const handleAddCategory = async () => {
    try {
      if (!formData.name) {
        Alert.alert('Error', 'Category name is required');
        return;
      }

      setIsLoading(true);
      const categoryData = {
        name: formData.name,
        description: formData.description || undefined,
        image_url:
          formData.image_url ||
          'https://images.pexels.com/photos/6585751/pexels-photo-6585751.jpeg?auto=compress&cs=tinysrgb&w=500',
      };

      const response = await categoryService.createCategory(categoryData);

      if (response.success) {
        Alert.alert('Success', 'Category added successfully');
        router.replace('/(admin)/categories');
      } else {
        Alert.alert('Error', response.error || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.formTitle}>Add New Category</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
              placeholder="Enter category name"
              returnKeyType="next"
              autoFocus
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
              placeholder="Enter category description"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category Image</Text>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={pickImage}
                disabled={imageUploading}
              >
                <Text style={styles.imagePickerButtonText}>
                  {imageUploading ? 'Uploading...' : 'Pick Image'}
                </Text>
              </TouchableOpacity>

              {imageUploading && (
                <ActivityIndicator size="small" color="#0066CC" />
              )}
              {formData.image_url ? (
                <Image
                  source={{ uri: formData.image_url }}
                  style={styles.imagePreview}
                />
              ) : null}
            </View>

            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              value={formData.image_url}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, image_url: text }))
              }
              placeholder="https://example.com/image.jpg"
              autoCapitalize="none"
              autoCorrect={false}
            />
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
              onPress={handleAddCategory}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Adding...' : 'Add Category'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
});
