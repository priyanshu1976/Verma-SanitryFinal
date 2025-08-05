import axios from 'axios';
import {
  User,
  Category,
  Product,
  Order,
  Address,
  AuthResponse,
  ApiResponse,
  PaginatedResponse,
} from '@/types/api';
import * as SecureStore from 'expo-secure-store';

// Create axios instance with base URL and default headers
const API_BASE_URL = process.env.API_BASE_URL || 'http://172.16.214.181:3000/';

console.log(API_BASE_URL, 'this is the baseurl');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  },
});

// Add interceptors for token handling
api.interceptors.request.use(
  async (config) => {
    // Get token from storage
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

// Handle response and format according to ApiResponse type
function formatResponse<T>(promise: Promise<any>): Promise<ApiResponse<T>> {
  return promise
    .then((response) => ({
      success: true,
      data: response.data,
      message: response.data.message ?? '',
    }))
    .catch((error) => {
      // Handle 401 errors by clearing token
      if (error.response?.status === 401) {
        SecureStore.deleteItemAsync('token');
      }
      return {
        success: false,
        error:
          error.response?.data?.message ?? error.message ?? 'An error occurred',
      };
    });
}

// Current user state will be managed by auth context, not here

export const authService = {
  async sendOTP(email: string): Promise<ApiResponse<{ message: string }>> {
    return formatResponse<{ message: string }>(
      api.post('/api/auth/send-code', { email })
    );
  },

  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    return formatResponse<AuthResponse>(
      api.post('/api/auth/login', { email, password })
    );
  },

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    city?: string;
    code: string; // OTP code
  }): Promise<ApiResponse<AuthResponse>> {
    // Format the data as expected by the backend
    // Map city ids to proper city names to match backend validation
    let cityName = userData.city || '';
    if (userData.city === 'chandigarh') cityName = 'Chandigarh';
    if (userData.city === 'mohali') cityName = 'Mohali';
    if (userData.city === 'panchkula') cityName = 'Panchkula';

    const registerData = {
      name: userData.full_name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || '',
      city: cityName, // Send proper city name with correct case
      verificationCode: userData.code,
    };

    return formatResponse<AuthResponse>(
      api.post('/api/auth/register', registerData)
    );
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return formatResponse<User>(api.get('/api/auth/me'));
  },

  async logout(): Promise<ApiResponse<null>> {
    // Clear token from storage when logging out
    await SecureStore.deleteItemAsync('token');
    return formatResponse<null>(api.post('/api/auth/logout'));
  },

  async resetPassword(email: string): Promise<ApiResponse<null>> {
    // This might need to be adjusted based on the actual backend implementation
    return formatResponse<null>(
      api.post('/api/auth/forgot-password', { email, purpose: 'reset' })
    );
  },
};

export const categoryService = {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return formatResponse<Category[]>(api.get('/api/categories'));
  },

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return formatResponse<Category>(api.get(`/api/categories/${id}`));
  },

  async createCategory(
    categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ApiResponse<Category>> {
    return formatResponse<Category>(api.post('/api/categories', categoryData));
  },

  async updateCategory(
    id: string,
    categoryData: Partial<Category>
  ): Promise<ApiResponse<Category>> {
    return formatResponse<Category>(
      api.put(`/api/categories/${id}`, categoryData)
    );
  },

  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    return formatResponse<null>(api.delete(`/api/categories/${id}`));
  },
};

export const productService = {
  async getProducts(params?: {
    category_id?: string;
    search?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Product>> {
    // Convert to query parameters
    const queryParams = new URLSearchParams();
    if (params?.category_id)
      queryParams.append('categoryId', params.category_id);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tags)
      params.tags.forEach((tag) => queryParams.append('tags', tag));
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    let url = '/api/products';
    if (queryString) {
      url += `?${queryString}`;
    }

    return api
      .get(url)
      .then((response) => ({
        success: true,
        data: response.data,
        pagination: {
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages,
        },
      }))
      .catch((error) => ({
        success: false,
        error: error.response?.data?.message || error.message,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      }));
  },

  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    return formatResponse<Product[]>(api.get('/api/products?isFeatured=true'));
  },

  async getBestSellerProducts(): Promise<ApiResponse<Product[]>> {
    return formatResponse<Product[]>(
      api.get('/api/products?isBestseller=true')
    );
  },

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return formatResponse<Product>(api.get(`/api/products/${id}`));
  },

  async createProduct(
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ApiResponse<Product>> {
    return formatResponse<Product>(api.post('/api/products', productData));
  },

  async updateProduct(
    id: string,
    productData: Partial<Product>
  ): Promise<ApiResponse<Product>> {
    return formatResponse<Product>(api.put(`/api/products/${id}`, productData));
  },

  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    return formatResponse<null>(api.delete(`/api/products/${id}`));
  },
};

export const orderService = {
  async getOrders(): Promise<ApiResponse<Order[]>> {
    // For regular users, this endpoint will return their own orders
    return formatResponse<Order[]>(api.get('/api/orders'));
  },

  async getAllOrders(): Promise<ApiResponse<Order[]>> {
    // For admin users only
    return formatResponse<Order[]>(api.get('/api/admin/orders'));
  },

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    // This endpoint might need to be adjusted based on backend implementation
    return formatResponse<Order>(api.get(`/api/orders/${id}`));
  },

  async createOrder(orderData: {
    total_amount: number;
    delivery_address: string;
    payment_method: string;
    order_items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>;
  }): Promise<ApiResponse<Order>> {
    return formatResponse<Order>(api.post('/api/orders', orderData));
  },

  async updateOrderStatus(
    id: string,
    status: string
  ): Promise<ApiResponse<Order>> {
    // This endpoint might need to be adjusted based on backend implementation
    return formatResponse<Order>(
      api.put(`/api/orders/${id}/status`, { status })
    );
  },
};

// Cart service for managing cart items
export const cartService = {
  async getCart(): Promise<ApiResponse<{ items: any[] }>> {
    return formatResponse<{ items: any[] }>(api.get('/api/cart'));
  },

  async addToCart(
    productId: string,
    quantity: number
  ): Promise<ApiResponse<any>> {
    return formatResponse<any>(api.post('/api/cart', { productId, quantity }));
  },

  async removeFromCart(itemId: string): Promise<ApiResponse<null>> {
    return formatResponse<null>(api.delete(`/api/cart/${itemId}`));
  },

  async removeAllFromCart(id: string): Promise<ApiResponse<null>> {
    return formatResponse<null>(api.delete(`/api/cart/all/${id}`));
  },
};

// Payment service for Razorpay integration
export const paymentService = {
  async createOrder(orderId: string): Promise<ApiResponse<any>> {
    return formatResponse<any>(api.post('/api/payment/order', { orderId }));
  },

  async verifyPayment(paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    order_id: string;
  }): Promise<ApiResponse<any>> {
    return formatResponse<any>(api.post('/api/payment/verify', paymentData));
  },
};

// Admin service for dashboard statistics and user management
export const adminService = {
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return formatResponse<User[]>(api.get('/api/admin/users'));
  },

  async getDashboardStats(): Promise<ApiResponse<any>> {
    return formatResponse<any>(api.get('/api/admin/dashboard/stats'));
  },
};

// Address service for managing user addresses
export const addressService = {
  async getAddresses(): Promise<ApiResponse<Address[]>> {
    return formatResponse<Address[]>(api.get('/api/addresses'));
  },

  async addAddress(addressData: {
    label: string;
    house: string;
    street: string;
    city: string;
    landmark?: string;
    address1?: string;
  }): Promise<ApiResponse<Address>> {
    return formatResponse<Address>(api.post('/api/addresses', addressData));
  },

  async updateAddress(
    id: number,
    addressData: {
      label: string;
      house: string;
      street: string;
      city: string;
      landmark?: string;
      address1?: string;
    }
  ): Promise<ApiResponse<Address>> {
    return formatResponse<Address>(
      api.put(`/api/addresses/${id}`, addressData)
    );
  },

  async deleteAddress(id: number): Promise<ApiResponse<null>> {
    return formatResponse<null>(api.delete(`/api/addresses/${id}`));
  },
};
