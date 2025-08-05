import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  Search,
  CreditCard as Edit,
  Trash2,
  Package,
  X,
  Image as ImageIcon,
} from 'lucide-react-native';
import { productService, categoryService } from '@/services/api';
import { Product, Category } from '@/types/api';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Cloudinary upload helper
const CLOUDINARY_UPLOAD_PRESET = 'mittal'; // <-- Replace with your Cloudinary unsigned upload preset
const CLOUDINARY_CLOUD_NAME = 'dqkxpmdsf'; // As per prompt
const CLOUDINARY_API = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

async function uploadImageToCloudinary(uri: string): Promise<string> {
  // Convert local file to form data for Cloudinary
  const data = new FormData();
  // Cloudinary expects a file field named 'file'
  data.append('file', {
    uri,
    type: 'image/jpeg',
    name: `upload_${Date.now()}.jpg`,
  } as any);
  data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_API, {
    method: 'POST',
    body: data,
  });
  const file = await res.json();
  if (file.secure_url) {
    return file.secure_url;
  } else {
    throw new Error('Failed to upload image to Cloudinary');
  }
}

export default function AdminProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Form state for editing product (including multiple images)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    images: [] as string[], // Array of image URIs (local or remote)
    categoryId: '',
    availableStock: '',
    isFeatured: false,
    isBestseller: false,
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    fetchProducts(1, true);
    fetchCategories();
  }, []);

  const fetchProducts = async (pageToFetch = 1, reset = false) => {
    try {
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);
      const response = await productService.getProducts({
        page: pageToFetch,
        limit: 15,
      });
      if (response.success) {
        // The backend returns { products: Product[], ... }
        const newProducts = response.data.products || [];
        if (reset) {
          setProducts(newProducts);
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
        }
        setHasMore(newProducts.length === 15);
        setPage(pageToFetch);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

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

  // Helper: upload all local images to Cloudinary, return array of URLs
  const uploadImagesIfNeeded = async (images: string[]) => {
    // If the image is already a remote URL (starts with http), skip upload
    const uploadedUrls: string[] = [];
    for (const img of images) {
      console.log('uploading images...');

      // Local file, upload
      const url = await uploadImageToCloudinary(img);
      uploadedUrls.push(url);
    }
    return uploadedUrls;
  };

  const handleUpdateProduct = async () => {
    try {
      if (
        !editingProduct ||
        !formData.name ||
        !formData.price ||
        !formData.categoryId
      ) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      setImageUploading(true);

      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        imageUrls = await uploadImagesIfNeeded(formData.images);
      }

      console.log(imageUrls);
      // For backend compatibility, send the first image as imageUrl, and all as images
      const productData: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl: imageUrls[0], // for backend compatibility
        images: imageUrls, // for future-proofing/multiple images
        categoryId: parseInt(formData.categoryId),
        availableStock: parseInt(formData.availableStock),
        isFeatured: formData.isFeatured,
        isBestseller: formData.isBestseller,
        createdAt: editingProduct.createdAt,
        rating: editingProduct.rating || 0,
        taxPercent: editingProduct.taxPercent || 5,
      };

      const response = await productService.updateProduct(
        String(editingProduct.id),
        productData
      );
      if (response.success) {
        Alert.alert('Success', 'Product updated successfully');
        setEditingProduct(null);
        setEditModalVisible(false);
        resetForm();
        fetchProducts(1, true);
      } else {
        Alert.alert('Error', response.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product');
    } finally {
      setImageUploading(false);
    }
  };

  const handleDeleteProduct = async (
    productId: string | number,
    productName: string
  ) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await productService.deleteProduct(
                String(productId)
              );
              if (response.success) {
                Alert.alert('Success', 'Product deleted successfully');
                fetchProducts(1, true);
              } else {
                Alert.alert(
                  'Error',
                  response.error || 'Failed to delete product'
                );
              }
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      images: [],
      categoryId: '',
      availableStock: '',
      isFeatured: false,
      isBestseller: false,
    });
  };

  // When opening the edit modal, allow editing multiple images
  const openEditModal = (product: Product) => {
    setEditingProduct(product);

    // Try to get all images if available, fallback to imageUrl
    let images: string[] = [];
    // If backend returns images array, use it, else fallback to imageUrl
    if (
      Array.isArray((product as any).images) &&
      (product as any).images.length > 0
    ) {
      images = (product as any).images;
    } else if (product.imageUrl) {
      images = [product.imageUrl];
    } else if ((product as any).image_url) {
      images = [(product as any).image_url];
    }

    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      images,
      categoryId: product.categoryId.toString(),
      availableStock: product.availableStock.toString(),
      isFeatured: product.isFeatured,
      isBestseller: product.isBestseller,
    });
    setEditModalVisible(true);
  };

  // Image picker for multiple images
  const pickImages = async () => {
    try {
      setImageUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
        selectionLimit: 5 - formData.images.length,
      });

      if (!result.canceled) {
        // result.assets is an array of selected images
        const uris = result.assets.map((asset) => asset.uri);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uris].slice(0, 5),
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProduct = ({ item }: { item: Product }) => {
    // Try to get all images if available, fallback to imageUrl
    let images: string[] = [];
    if (
      Array.isArray((item as any).images) &&
      (item as any).images.length > 0
    ) {
      images = (item as any).images;
    } else if (item.imageUrl) {
      images = [item.imageUrl];
    } else if ((item as any).image_url) {
      images = [(item as any).image_url];
    }
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => openEditModal(item)}
        activeOpacity={0.85}
      >
        <Image
          source={{
            uri:
              images.length > 0
                ? images[0]
                : 'https://images.pexels.com/photos/6585751/pexels-photo-6585751.jpeg?auto=compress&cs=tinysrgb&w=500',
          }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productCategory}>{item.category?.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
          </View>
          <Text
            style={[
              styles.stockText,
              item.availableStock < 10 && styles.lowStock,
            ]}
          >
            Stock: {item.availableStock}
          </Text>
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Edit size={16} color="#0066CC" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteProduct(item.id, item.name)}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // "Load More" button for pagination
  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.loadMoreContainer}>
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={() => {
            if (!isLoadingMore && hasMore) {
              fetchProducts(page + 1, false);
            }
          }}
          disabled={isLoadingMore}
        >
          {isLoadingMore ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loadMoreButtonText}>Load More Products</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // Edit Modal for product (with multiple image support)
  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      animationType="slide"
      onRequestClose={() => {
        setEditModalVisible(false);
        setEditingProduct(null);
        resetForm();
      }}
    >
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.formContainer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={styles.formTitle}>Edit Product</Text>
            <TouchableOpacity
              onPress={() => {
                setEditModalVisible(false);
                setEditingProduct(null);
                resetForm();
              }}
            >
              <X size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
              placeholder="Product name"
            />
          </View>
          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              placeholder="Product description"
              multiline
            />
          </View>
          {/* Price and Stock */}
          <View style={[styles.inputGroup, styles.row]}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, price: text }))
                }
                placeholder="Price"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Stock</Text>
              <TextInput
                style={styles.input}
                value={formData.availableStock}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, availableStock: text }))
                }
                placeholder="Stock"
                keyboardType="numeric"
              />
            </View>
          </View>
          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView
              style={styles.pickerContainer}
              contentContainerStyle={{ paddingVertical: 0 }}
              nestedScrollEnabled
              horizontal={false}
              showsVerticalScrollIndicator={true}
              showsHorizontalScrollIndicator={false}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    formData.categoryId === cat.id.toString() &&
                      styles.selectedCategory,
                  ]}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: cat.id.toString(),
                    }))
                  }
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      formData.categoryId === cat.id.toString() &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {/* Images (multiple) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Images</Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 8,
              }}
            >
              {formData.images.map((uri, idx) => (
                <View
                  key={uri + idx}
                  style={{
                    position: 'relative',
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Image
                    source={{ uri }}
                    style={{ width: 64, height: 64, borderRadius: 8 }}
                  />
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: '#fff',
                      borderRadius: 12,
                      padding: 2,
                      elevation: 2,
                    }}
                    onPress={() => removeImage(idx)}
                  >
                    <X size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              {formData.images.length < 5 && (
                <TouchableOpacity
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    backgroundColor: '#F3F4F6',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={pickImages}
                  disabled={imageUploading}
                >
                  {imageUploading ? (
                    <ActivityIndicator color="#0066CC" />
                  ) : (
                    <ImageIcon size={28} color="#6B7280" />
                  )}
                </TouchableOpacity>
              )}
            </View>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              You can upload up to 5 images.
            </Text>
          </View>
          {/* Featured and Bestseller */}
          <View style={[styles.inputGroup, styles.row]}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() =>
                setFormData((prev) => ({
                  ...prev,
                  isFeatured: !prev.isFeatured,
                }))
              }
            >
              <View
                style={[
                  styles.checkbox,
                  formData.isFeatured && styles.checkboxChecked,
                ]}
              >
                {formData.isFeatured && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Featured</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() =>
                setFormData((prev) => ({
                  ...prev,
                  isBestseller: !prev.isBestseller,
                }))
              }
            >
              <View
                style={[
                  styles.checkbox,
                  formData.isBestseller && styles.checkboxChecked,
                ]}
              >
                {formData.isBestseller && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>Bestseller</Text>
            </TouchableOpacity>
          </View>
          {/* Actions */}
          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setEditModalVisible(false);
                setEditingProduct(null);
                resetForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateProduct}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-product')}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Products List */}
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
          onEndReachedThreshold={0.7}
          onEndReached={() => {
            if (!isLoadingMore && hasMore) {
              fetchProducts(page + 1, false);
            }
          }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Package size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? 'Try adjusting your search'
              : 'Add your first product to get started'}
          </Text>
        </View>
      )}
      {renderEditModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#0066CC',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    marginLeft: 12,
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
    flexShrink: 1,
    flexWrap: 'wrap',
    maxWidth: 120,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#0066CC',
  },
  originalPrice: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  stockText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
  lowStock: {
    color: '#EF4444',
  },
  productActions: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    maxHeight: 180,
    minHeight: 40,
    backgroundColor: '#fff',
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedCategory: {
    backgroundColor: '#E6F2FF',
  },
  categoryOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  selectedCategoryText: {
    color: '#0066CC',
    fontFamily: 'Inter-SemiBold',
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
  loadMoreContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  loadMoreButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 180,
  },
  loadMoreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
