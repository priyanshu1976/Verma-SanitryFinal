import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Shield,
  Truck,
  RotateCcw,
} from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { productService } from '@/services/api';
import { Product } from '@/types/api';

const { width } = Dimensions.get('window');

// Helper: get images array from product, always return array of image URLs
function getProductImages(product: any): string[] {
  if (!product) return [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    // Prefer image_url or imageUrl from each image object
    return product.images
      .map((img: any) => img.image_url || img.imageUrl || '')
      .filter(Boolean);
  }
  if (product.image_url) return [product.image_url];
  if (product.imageUrl) return [product.imageUrl];
  return [];
}

// Helper: get stock quantity (stock_quantity or stockQuantity or availableStock)
function getStockQuantity(product: any): number {
  return (
    product.stock_quantity ??
    product.stockQuantity ??
    product.availableStock ??
    0
  );
}

// Helper: get original price (original_price or originalPrice or mrp)
function getOriginalPrice(product: any): number | null {
  return product.original_price ?? product.originalPrice ?? product.mrp ?? null;
}

// Helper: get reviews count (reviews_count or reviewsCount)
function getReviewsCount(product: any): number {
  return product.reviews_count ?? product.reviewsCount ?? 0;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productService.getProductById(id as string);
      // Debug: log the response for troubleshooting
      console.log('Product API response:', response.data);
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        Alert.alert('Error', 'Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ padding: 16 }}>
          {/* Image Skeleton */}
          <View
            style={{
              width: '100%',
              aspectRatio: 1,
              backgroundColor: '#ececec',
              borderRadius: 16,
              marginBottom: 24,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: '#e0e0e0',
                opacity: 0.7,
              }}
            />
          </View>
          {/* Title Skeleton */}
          <View
            style={{
              width: '70%',
              height: 28,
              backgroundColor: '#e0e0e0',
              borderRadius: 8,
              marginBottom: 12,
            }}
          />
          {/* Price Skeleton */}
          <View
            style={{
              width: 100,
              height: 22,
              backgroundColor: '#e0e0e0',
              borderRadius: 8,
              marginBottom: 16,
            }}
          />
          {/* Description Skeleton */}
          <View
            style={{
              width: '100%',
              height: 16,
              backgroundColor: '#e0e0e0',
              borderRadius: 8,
              marginBottom: 8,
            }}
          />
          <View
            style={{
              width: '90%',
              height: 16,
              backgroundColor: '#e0e0e0',
              borderRadius: 8,
              marginBottom: 8,
            }}
          />
          <View
            style={{
              width: '80%',
              height: 16,
              backgroundColor: '#e0e0e0',
              borderRadius: 8,
              marginBottom: 24,
            }}
          />
          {/* Add to Cart Button Skeleton */}
          <View
            style={{
              width: '60%',
              height: 48,
              backgroundColor: '#e0e0e0',
              borderRadius: 16,
              alignSelf: 'center',
              marginTop: 24,
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Use helpers to get correct fields
  const images = getProductImages(product);
  const stockQuantity = getStockQuantity(product);
  const originalPrice = getOriginalPrice(product);
  const reviewsCount = getReviewsCount(product);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: images[0], // Use first image for cart
        maxQuantity: stockQuantity,
      });
    }
    Alert.alert(
      'Added to Cart',
      `${product.name} has been added to your cart.`
    );
  };

  const increaseQuantity = () => {
    if (quantity < stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const discountPercentage =
    originalPrice && product.price
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#2e3f47" />
          </TouchableOpacity>
          <View style={styles.headerActions} />
        </View>

        {/* Product Images */}
        <View style={styles.imageContainer}>
          {images.length > 1 ? (
            <>
              <FlatList
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      source={{ uri: item }}
                      style={[
                        styles.productImage,
                        { width: width, height: 300 },
                      ]}
                    />
                  </TouchableOpacity>
                )}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                  setSelectedImageIndex(idx);
                }}
                initialScrollIndex={selectedImageIndex}
                getItemLayout={(_, index) => ({
                  length: width,
                  offset: width * index,
                  index,
                })}
              />
              {/* Image indicators */}
              <View style={styles.imageIndicators}>
                {images.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.imageIndicatorDot,
                      selectedImageIndex === idx
                        ? styles.imageIndicatorDotActive
                        : null,
                    ]}
                  />
                ))}
              </View>
            </>
          ) : images.length === 1 ? (
            <Image source={{ uri: images[0] }} style={styles.productImage} />
          ) : (
            <View
              style={[
                styles.productImage,
                {
                  backgroundColor: '#f3f3f3',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <Text style={{ color: '#9b9591' }}>No Image</Text>
            </View>
          )}
          {discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {product.category?.name && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category.name}</Text>
            </View>
          )}

          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.ratingBadge}>
              <Star size={14} color="#ffffff" fill="#ffffff" />
              <Text style={styles.ratingText}>
                {typeof product.rating === 'number' ? product.rating : 0}
              </Text>
            </View>
            <Text style={styles.reviews}>({reviewsCount} reviews)</Text>
            <View style={styles.verifiedBadge}>
              <Shield size={12} color="#c6aa55" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                ₹{Number(product.price).toLocaleString()}
              </Text>
              {originalPrice && (
                <Text style={styles.originalPrice}>
                  ₹{Number(originalPrice).toLocaleString()}
                </Text>
              )}
            </View>
            {discountPercentage > 0 && (
              <Text style={styles.savings}>
                You save ₹{(originalPrice! - product.price).toLocaleString()}
              </Text>
            )}
          </View>

          <View style={styles.stockSection}>
            <View style={styles.stockIndicator}>
              <View
                style={[
                  styles.stockDot,
                  stockQuantity > 0 ? styles.inStockDot : styles.outOfStockDot,
                ]}
              />
              <Text
                style={[
                  styles.stockText,
                  stockQuantity > 0 ? styles.inStock : styles.outOfStock,
                ]}
              >
                {stockQuantity > 0
                  ? `${stockQuantity} items available`
                  : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Quantity Selector */}
          {stockQuantity > 0 && (
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity <= 1 && styles.quantityButtonDisabled,
                  ]}
                  onPress={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus
                    size={18}
                    color={quantity <= 1 ? '#9b9591' : '#2e3f47'}
                  />
                </TouchableOpacity>
                <Text style={styles.quantity}>{quantity}</Text>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity >= stockQuantity && styles.quantityButtonDisabled,
                  ]}
                  onPress={increaseQuantity}
                  disabled={quantity >= stockQuantity}
                >
                  <Plus
                    size={18}
                    color={quantity >= stockQuantity ? '#9b9591' : '#2e3f47'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Features */}
          <View style={styles.featuresSection}>
            <View style={styles.feature}>
              <Truck size={20} color="#c6aa55" />
              <Text style={styles.featureText}>
                Free delivery on orders above ₹2,999
              </Text>
            </View>
            <View style={styles.feature}>
              <RotateCcw size={20} color="#c6aa55" />
              <Text style={styles.featureText}>7-day easy returns</Text>
            </View>
            <View style={styles.feature}>
              <Shield size={20} color="#c6aa55" />
              <Text style={styles.featureText}>2-year warranty included</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Specifications */}
          {Array.isArray(product.specifications) &&
            product.specifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Specifications</Text>
                <View style={styles.specificationsContainer}>
                  {product.specifications.map((spec: any, index: number) => (
                    <View key={index} style={styles.specItem}>
                      <View style={styles.specBullet} />
                      <Text style={styles.specText}>{spec}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      {stockQuantity > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.totalPrice}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>
                ₹{(Number(product.price) * quantity).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
            >
              <ShoppingCart size={20} color="#ffffff" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#e7e0d0',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  favoriteActive: {
    backgroundColor: '#631e25',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#631e25',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  discountText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  productInfo: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  categoryBadge: {
    backgroundColor: 'rgba(198, 170, 85, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#c6aa55',
  },
  productName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
    marginBottom: 16,
    lineHeight: 30,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c6aa55',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    marginLeft: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#c6aa55',
    marginLeft: 4,
  },
  priceSection: {
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#631e25',
  },
  originalPrice: {
    fontSize: 20,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    textDecorationLine: 'line-through',
    marginLeft: 12,
  },
  savings: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#c6aa55',
  },
  stockSection: {
    marginBottom: 24,
  },
  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  inStockDot: {
    backgroundColor: '#c6aa55',
  },
  outOfStockDot: {
    backgroundColor: '#631e25',
  },
  stockText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  inStock: {
    color: '#c6aa55',
  },
  outOfStock: {
    color: '#631e25',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f3f3f3',
    borderRadius: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 4,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#e7e0d0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f3f3f3',
  },
  quantity: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
    marginHorizontal: 20,
    minWidth: 32,
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#2e3f47',
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    lineHeight: 24,
  },
  specificationsContainer: {
    backgroundColor: '#f3f3f3',
    borderRadius: 16,
    padding: 16,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  specBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#c6aa55',
    marginTop: 8,
    marginRight: 12,
  },
  specText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#2e3f47',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalPrice: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
  },
  totalAmount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#631e25',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginLeft: 16,
  },
  addToCartText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#631e25',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  imageIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e7e0d0',
    marginHorizontal: 4,
  },
  imageIndicatorDotActive: {
    backgroundColor: '#c6aa55',
  },
});
