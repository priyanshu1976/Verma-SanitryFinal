import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Search,
  Bell,
  Star,
  Plus,
  TrendingUp,
  Heart,
  ShoppingBag,
  Zap,
  Award,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { productService, categoryService } from '@/services/api';
import { Product, Category } from '@/types/api';

const { width } = Dimensions.get('window');
const PRODUCT_WIDTH = (width - 56) / 2; // slightly more gap for better look
const BANNER_HEIGHT = 200;

export default function HomeScreen() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setpage] = useState(2);

  useEffect(() => {
    fetchData();
  }, []);

  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const fetchData = async () => {
    try {
      const [
        categoriesResponse,
        featuredResponse,
        bestsellerResponse,
        allProductsResponse,
      ] = await Promise.all([
        categoryService.getCategories(),
        productService.getFeaturedProducts(),
        productService.getBestSellerProducts(),
        productService.getProducts({}), // Fetch all products
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data?.slice(0, 6) || []);
      }
      if (featuredResponse.success) {
        setFeaturedProducts(featuredResponse.data || []);
      }
      if (bestsellerResponse.success) {
        setBestSellerProducts(bestsellerResponse.data || []);
      }
      if (allProductsResponse.success) {
        setAllProducts(
          Array.isArray(allProductsResponse.data)
            ? allProductsResponse.data
            : allProductsResponse.data?.products || []
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push('/(tabs)/categories')}
    >
      <View style={styles.categoryImageContainer}>
        <Image
          source={{
            uri:
              item.image_url ||
              'https://images.pexels.com/photos/6585751/pexels-photo-6585751.jpeg?auto=compress&cs=tinysrgb&w=500',
          }}
          style={styles.categoryImage}
        />
        <View style={styles.categoryGradient} />
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <View style={styles.categoryBadge}>
          <TrendingUp size={10} color="#ffffff" />
          <Text style={styles.categoryBadgeText}>Hot</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Helper to get correct image and property names for Product
  const getProductImage = (item: Product) =>
    (item as any).imageUrl ||
    (item as any).image_url ||
    'https://images.pexels.com/photos/6585751/pexels-photo-6585751.jpeg?auto=compress&cs=tinysrgb&w=500';

  const getProductOriginalPrice = (item: Product) =>
    (item as any).original_price ?? (item as any).originalPrice;

  const getProductReviewsCount = (item: Product) =>
    (item as any).reviews_count ?? (item as any).reviewsCount ?? 0;

  const getProductStockQuantity = (item: Product) =>
    (item as any).stock_quantity ?? (item as any).stockQuantity ?? 0;

  const renderFeaturedProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.featuredProductCard}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View style={styles.featuredImageContainer}>
        <Image
          source={{ uri: getProductImage(item) }}
          style={styles.featuredProductImage}
        />
        {getProductOriginalPrice(item) && (
          <View style={styles.featuredDiscountBadge}>
            <Text style={styles.featuredDiscountText}>
              {Math.round(
                ((getProductOriginalPrice(item) - item.price) /
                  getProductOriginalPrice(item)) *
                  100
              )}
              % OFF
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.featuredWishlistButton}>
          <Heart size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <View style={styles.featuredProductInfo}>
        <Text style={styles.featuredProductName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.featuredRatingContainer}>
          <View style={styles.ratingBadge}>
            <Star size={10} color="#ffffff" fill="#ffffff" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.reviewsText}>
            ({getProductReviewsCount(item)})
          </Text>
        </View>
        <View style={styles.featuredPriceContainer}>
          <Text style={styles.featuredPrice}>
            ₹{item.price.toLocaleString()}
          </Text>
          {getProductOriginalPrice(item) && (
            <Text style={styles.featuredOriginalPrice}>
              ₹{getProductOriginalPrice(item).toLocaleString()}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.featuredAddButton}
          onPress={(e) => {
            e.stopPropagation();
            addToCart({
              id: String(item.id),
              name: item.name,
              price: item.price,
              image_url: getProductImage(item),
              maxQuantity: getProductStockQuantity(item),
            });
          }}
        >
          <ShoppingBag size={14} color="#ffffff" />
          <Text style={styles.featuredAddText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderBestSellerProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.bestSellerCard}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View style={styles.bestSellerImageContainer}>
        <Image
          source={{ uri: getProductImage(item) }}
          style={styles.bestSellerImage}
        />
        <View style={styles.bestSellerBadge}>
          <Award size={12} color="#ffffff" />
          <Text style={styles.bestSellerBadgeText}>Best Seller</Text>
        </View>
        <TouchableOpacity
          style={styles.quickAddButton}
          onPress={(e) => {
            e.stopPropagation();
            addToCart({
              id: String(item.id),
              name: item.name,
              price: item.price,
              image_url: getProductImage(item),
              maxQuantity: getProductStockQuantity(item),
            });
          }}
        >
          <Plus size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <View style={styles.bestSellerInfo}>
        <Text style={styles.bestSellerName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.bestSellerRating}>
          <Star size={10} color="#c6aa55" fill="#c6aa55" />
          <Text style={styles.bestSellerRatingText}>{item.rating}</Text>
        </View>
        <Text style={styles.bestSellerPrice}>
          ₹{item.price.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render All Products (Grid) - Improved UI
  const renderAllProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.allProductCard}
      onPress={() => router.push(`/product/${item.id}`)}
      activeOpacity={0.92}
    >
      <View style={styles.allProductImageContainer}>
        <Image
          source={{ uri: getProductImage(item) }}
          style={styles.allProductImage}
          resizeMode="cover"
        />
        {getProductOriginalPrice(item) && (
          <View style={styles.allProductDiscountBadge}>
            <Text style={styles.allProductDiscountText}>
              {Math.round(
                ((getProductOriginalPrice(item) - item.price) /
                  getProductOriginalPrice(item)) *
                  100
              )}
              % OFF
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.allProductWishlistButton}
          onPress={(e) => {
            e.stopPropagation();
            // TODO: Add wishlist logic
          }}
        >
          <Heart size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <View style={styles.allProductInfo}>
        <Text style={styles.allProductName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.allProductRatingRow}>
          <View style={styles.allProductRatingBadge}>
            <Star size={10} color="#ffffff" fill="#ffffff" />
            <Text style={styles.allProductRatingText}>{item.rating}</Text>
          </View>
          <Text style={styles.allProductReviewsText}>
            ({getProductReviewsCount(item)})
          </Text>
        </View>
        <View style={styles.allProductPriceRow}>
          <Text style={styles.allProductPrice}>
            ₹{item.price.toLocaleString()}
          </Text>
          {getProductOriginalPrice(item) && (
            <Text style={styles.allProductOriginalPrice}>
              ₹{getProductOriginalPrice(item).toLocaleString()}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.allProductAddButton}
          onPress={(e) => {
            e.stopPropagation();
            addToCart({
              id: String(item.id),
              name: item.name,
              price: item.price,
              image_url: getProductImage(item),
              maxQuantity: getProductStockQuantity(item),
            });
          }}
        >
          <ShoppingBag size={14} color="#ffffff" />
          <Text style={styles.allProductAddText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderListHeader = () => (
    <>
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.userSection}>
            <View style={styles.userAvatar}>
              <Text style={styles.userInitial}>
                {user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.greeting}>
                Hello, {user?.name?.split(' ')[0] || 'User'}!
              </Text>
              <Text style={styles.subtitle}>Discover premium products</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={20} color="#2e3f47" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Premium Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/categories')}
        >
          <Search size={20} color="#9b9591" />
          <Text style={styles.searchPlaceholder}>
            Search for products, brands...
          </Text>
          <View style={styles.searchMic}>
            <Zap size={16} color="#ffffff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Hero Banner */}
      {/* ... unchanged ... */}

      {/* Categories Section */}
      {categories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Shop by Category</Text>
              <Text style={styles.sectionSubtitle}>
                Explore our premium collections
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/categories')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
            keyExtractor={(item) => String(item.id)}
          />
        </View>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Featured Products</Text>
              <Text style={styles.sectionSubtitle}>Handpicked for you</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/categories')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredProducts}
            renderItem={renderFeaturedProduct}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
            keyExtractor={(item) => String(item.id)}
          />
        </View>
      )}

      {/* Best Sellers Grid */}
      {bestSellerProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Best Sellers</Text>
              <Text style={styles.sectionSubtitle}>
                Most loved by customers
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/categories')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={bestSellerProducts}
            renderItem={renderBestSellerProduct}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bestSellersList}
            keyExtractor={(item) => String(item.id)}
          />
        </View>
      )}
    </>
  );

  // Compose the footer for the FlatList (promo banner, loading, etc.)
  const renderListFooter = () => (
    <>
      {/* Promotional Banner */}
      <View style={styles.promoBanner}>
        <View style={styles.promoContent}>
          <View style={styles.promoIcon}>
            <Zap size={24} color="#c6aa55" />
          </View>
          <View style={styles.promoText}>
            <Text style={styles.promoTitle}>Free Delivery</Text>
            <Text style={styles.promoSubtitle}>On orders above ₹2,999</Text>
          </View>
        </View>
        <View style={styles.promoContent}>
          <View style={styles.promoIcon}>
            <Award size={24} color="#c6aa55" />
          </View>
          <View style={styles.promoText}>
            <Text style={styles.promoTitle}>Quality Assured</Text>
            <Text style={styles.promoSubtitle}>Premium products only</Text>
          </View>
        </View>
      </View>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading amazing products...</Text>
        </View>
      )}
    </>
  );

  // Only show the all products grid if there are products
  const showAllProducts = allProducts.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={showAllProducts ? allProducts : []}
        renderItem={showAllProducts ? renderAllProduct : undefined}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={[
          styles.allProductsList,
          { paddingTop: 0, paddingBottom: 32 },
        ]}
        columnWrapperStyle={{ gap: 16, marginBottom: 16 }}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          // Your function to run when end is reached
          console.log('hello');
        }}
        onEndReachedThreshold={0.2}
        // If no products, still show header/footer
        ListEmptyComponent={
          !isLoading && (
            <>
              {renderListHeader()}
              {renderListFooter()}
            </>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  header: {
    backgroundColor: '#e7e0d0',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#c6aa55',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  greeting: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#631e25',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginTop: -12,
    marginBottom: 24,
    zIndex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    marginLeft: 12,
  },
  searchMic: {
    backgroundColor: '#631e25',
    padding: 8,
    borderRadius: 12,
  },
  heroBanner: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
    height: BANNER_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(46, 63, 71, 0.75)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  heroTag: {
    backgroundColor: '#c6aa55',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  heroTagText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#d3bfb3',
    marginBottom: 20,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#631e25',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  heroButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginRight: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#c6aa55',
  },
  categoriesList: {
    paddingLeft: 24,
  },
  categoryCard: {
    width: 120,
    height: 140,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  categoryImageContainer: {
    flex: 1,
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  categoryGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(46, 63, 71, 0.7)',
  },
  categoryContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c6aa55',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginLeft: 4,
  },
  featuredList: {
    paddingLeft: 24,
  },
  featuredProductCard: {
    width: 200,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  featuredImageContainer: {
    position: 'relative',
    height: 160,
  },
  featuredProductImage: {
    width: '100%',
    height: '100%',
  },
  featuredDiscountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#631e25',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredDiscountText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  featuredWishlistButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 8,
    borderRadius: 12,
  },
  featuredProductInfo: {
    padding: 16,
  },
  featuredProductName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    marginBottom: 8,
    lineHeight: 20,
  },
  featuredRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c6aa55',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginLeft: 2,
  },
  reviewsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    marginLeft: 8,
  },
  featuredPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredPrice: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#631e25',
  },
  featuredOriginalPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  featuredAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#631e25',
    paddingVertical: 10,
    borderRadius: 12,
  },
  featuredAddText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 6,
  },
  bestSellersList: {
    paddingLeft: 24,
  },
  bestSellerCard: {
    width: 140,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  bestSellerImageContainer: {
    position: 'relative',
    height: 120,
  },
  bestSellerImage: {
    width: '100%',
    height: '100%',
  },
  bestSellerBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c6aa55',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bestSellerBadgeText: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginLeft: 2,
  },
  quickAddButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#631e25',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bestSellerInfo: {
    padding: 12,
  },
  bestSellerName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    marginBottom: 6,
  },
  bestSellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bestSellerRatingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2e3f47',
    marginLeft: 4,
  },
  bestSellerPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#631e25',
  },
  // --- All Products Improved Styles ---
  allProductsList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  allProductCard: {
    width: PRODUCT_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0e9e2',
  },
  allProductImageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#f7f5f2',
    position: 'relative',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
  },
  allProductImage: {
    width: '100%',
    height: '100%',
  },
  allProductDiscountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#c6aa55',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 2,
  },
  allProductDiscountText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  allProductWishlistButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(99,30,37,0.7)',
    padding: 6,
    borderRadius: 12,
    zIndex: 2,
  },
  allProductInfo: {
    padding: 14,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  allProductName: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    marginBottom: 6,
    lineHeight: 19,
    minHeight: 38,
  },
  allProductRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  allProductRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c6aa55',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 7,
  },
  allProductRatingText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginLeft: 2,
  },
  allProductReviewsText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    marginLeft: 7,
  },
  allProductPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 2,
  },
  allProductPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#631e25',
  },
  allProductOriginalPrice: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#bdb7b2',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  allProductAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#631e25',
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 2,
  },
  allProductAddText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginLeft: 6,
  },
  // --- End All Products Improved Styles ---
  bestSellersList: {
    paddingLeft: 24,
  },
  bestSellerCard: {
    width: 140,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  bestSellerImageContainer: {
    position: 'relative',
    height: 120,
  },
  bestSellerImage: {
    width: '100%',
    height: '100%',
  },
  bestSellerBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c6aa55',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bestSellerBadgeText: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginLeft: 2,
  },
  quickAddButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#631e25',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bestSellerInfo: {
    padding: 12,
  },
  bestSellerName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    marginBottom: 6,
  },
  bestSellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bestSellerRatingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2e3f47',
    marginLeft: 4,
  },
  bestSellerPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#631e25',
  },
  promoBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 32,
    paddingVertical: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  promoContent: {
    alignItems: 'center',
  },
  promoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(198, 170, 85, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  promoText: {
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
  },
  promoSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
  },
});
