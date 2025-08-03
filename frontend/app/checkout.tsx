import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Smartphone,
  Banknote,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { orderService, addressService } from '@/services/api';
import { Address } from '@/types/api';
import RazorpayCheckout from 'react-native-razorpay';
import axios from 'axios';
import base64 from 'react-native-base64';

export default function CheckoutScreen() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Address form state
  const [addressForm, setAddressForm] = useState({
    label: '',
    house: '',
    street: '',
    city: '',
    landmark: '',
    address1: '',
  });

  const subtotal = getTotalPrice();
  const deliveryCharge = 99;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + deliveryCharge + tax;

  const paymentMethods = [
    {
      id: 'upi',
      title: 'UPI Payment',
      subtitle: 'Pay using UPI apps',
      icon: Smartphone,
    },
    {
      id: 'card',
      title: 'Credit/Debit Card',
      subtitle: 'Visa, Mastercard, RuPay',
      icon: CreditCard,
    },
    {
      id: 'cod',
      title: 'Cash on Delivery',
      subtitle: 'Pay when you receive',
      icon: Banknote,
    },
  ];

  // Load addresses on component mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    if (!user) return;

    setIsLoadingAddresses(true);
    try {
      const response = await addressService.getAddresses();
      console.log(response.data, 'this is the get address response');
      if (response.success && response.data) {
        //@ts-ignore
        setAddresses(response.data.addresses);
        // Auto-select first address if available
        if (
          response.data.addresses &&
          response.data.addresses.length > 0 &&
          !selectedAddress
        ) {
          setSelectedAddress(response.data.addresses[0]);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      label: '',
      house: '',
      street: '',
      city: '',
      landmark: '',
      address1: '',
    });
    setEditingAddress(null);
  };

  const handleAddAddress = () => {
    resetAddressForm();
    setShowAddAddressModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setAddressForm({
      label: address.label,
      house: address.house,
      street: address.street,
      city: address.city,
      landmark: address.landmark || '',
      address1: address.address1 || '',
    });
    setEditingAddress(address);
    setShowAddAddressModal(true);
  };

  const handleDeleteAddress = async (addressId: number) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await addressService.deleteAddress(addressId);
              if (response.success) {
                await loadAddresses();
                if (selectedAddress?.id === addressId) {
                  setSelectedAddress(null);
                }
              } else {
                Alert.alert(
                  'Error',
                  response.error || 'Failed to delete address'
                );
              }
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const handleSubmitAddress = async () => {
    if (
      !addressForm.label ||
      !addressForm.house ||
      !addressForm.street ||
      !addressForm.city
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmittingAddress(true);
    try {
      let response;
      if (editingAddress) {
        response = await addressService.updateAddress(
          editingAddress.id,
          addressForm
        );
      } else {
        response = await addressService.addAddress(addressForm);
      }

      if (response.success && response.data) {
        await loadAddresses();
        setShowAddAddressModal(false);
        resetAddressForm();
        if (!editingAddress) {
          setSelectedAddress(response.data);
        }
      } else {
        Alert.alert('Error', response.error || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (isLoading) return;

    if (!user) {
      Alert.alert('Error', 'Please login to place an order');
      return;
    }

    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting Razorpay order creation');
      const keyId = 'rzp_test_is54OWfrzNduVS';
      const keySecret = 'd0yFPlL9kW9reLCU3ol2bNeF';

      // Use base64 from 'react-native-base64' for React Native compatibility
      // const auth = base64.encode(`${keyId}:${keySecret}`);
      // let orderRes;
      // try {
      //   orderRes = await axios.post(
      //     'https://api.razorpay.com/v1/orders',
      //     {
      //       amount: total * 100, // Amount in paise
      //       currency: 'INR',
      //       receipt: `receipt_${Date.now()}`,
      //       payment_capture: 1,
      //     },
      //     {
      //       headers: {
      //         Authorization: `Basic ${auth}`,
      //         'Content-Type': 'application/json',
      //       },
      //     }
      //   );
      // } catch (orderErr) {
      //   console.error('Failed to create Razorpay order:', orderErr);
      //   Alert.alert('Error', 'Failed to create payment order');
      //   setIsLoading(false);
      //   return;
      // }

      // console.log('Razorpay order created successfully:', orderRes.data);

      // const order = orderRes.data;
      const order = {
        amount: total * 100, // amount in paise, dynamically set
        id: '',
      };

      // 2. Razorpay payment UI
      const options = {
        description: 'Order Payment',
        image: 'https://i.imgur.com/3g7nmJC.jpg',
        currency: 'INR',
        key: keyId, // public key only
        amount: order.amount.toString(),
        name: 'VermaAndCompany',
        order_id: order.id,
        prefill: {
          email: user.email || 'example@email.com',
          contact: user.phone || '9123456789',
          name: user.name || 'Test User',
        },
        theme: { color: '#53a20e' },
      };

      console.log('Opening Razorpay payment UI with options:', options);

      try {
        RazorpayCheckout.open(options)
          .then((data) => {
            // handle success
            // Alert.alert(`Success: ${data.razorpay_payment_id}`);
            const orderData = {
              user_id: user.id,
              total_amount: total,
              delivery_address: `${selectedAddress.label}, ${
                selectedAddress.house
              }, ${selectedAddress.street}, ${selectedAddress.city}${
                selectedAddress.landmark ? `, ${selectedAddress.landmark}` : ''
              }`,
              payment_method: 'razorpay',
              payment_id: data.razorpay_payment_id,
              order_items: items.map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price,
              })),
            };

            console.log('✅ Final Order Data:');
          })
          .catch((error) => {
            // handle failure
            alert(`Error: ${error.code} | ${error.description}`);
          });
        console.log('Razorpay payment success:');

        // 3. On success, place your order

        // Simulate success screen
        clearCart();
        router.replace('/order-success');
      } catch (error: any) {
        console.error('Razorpay payment failed:', error);
        Alert.alert(
          'Payment Failed',
          typeof error === 'object' && error !== null && 'description' in error
            ? String(error.description)
            : 'Payment was not completed'
        );
      }
    } catch (error: any) {
      console.error(
        'Error placing order:',
        typeof error === 'object' && error !== null && 'description' in error
          ? String(error.description)
          : String(error)
      );
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAddressCard = (address: Address) => (
    <TouchableOpacity
      key={address.id}
      style={[
        styles.addressCard,
        selectedAddress?.id === address.id && styles.selectedAddressCard,
      ]}
      onPress={() => setSelectedAddress(address)}
    >
      <View style={styles.addressHeader}>
        <View style={styles.addressInfo}>
          <Text style={styles.addressLabel}>{address.label}</Text>
          <Text style={styles.addressText}>
            {address.house}, {address.street}
          </Text>
          <Text style={styles.addressText}>
            {address.city}
            {address.landmark ? `, ${address.landmark}` : ''}
          </Text>
        </View>
        <View style={styles.addressActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditAddress(address)}
          >
            <Edit size={16} color="#c6aa55" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteAddress(address.id)}
          >
            <Trash2 size={16} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
      {selectedAddress?.id === address.id && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedText}>Selected</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#2e3f47" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#c6aa55" />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddAddress}
            >
              <Plus size={20} color="#c6aa55" />
            </TouchableOpacity>
          </View>

          {isLoadingAddresses ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#c6aa55" />
              <Text style={styles.loadingText}>Loading addresses...</Text>
            </View>
          ) : addresses.length > 0 ? (
            <View style={styles.addressesContainer}>
              {addresses.map(renderAddressCard)}
            </View>
          ) : (
            <View style={styles.emptyAddressContainer}>
              <Text style={styles.emptyAddressText}>No addresses found</Text>
              <TouchableOpacity
                style={styles.addAddressButton}
                onPress={handleAddAddress}
              >
                <Text style={styles.addAddressButtonText}>Add Address</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderSummary}>
            {items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Text style={styles.orderItemName} numberOfLines={1}>
                  {item.name} x {item.quantity}
                </Text>
                <Text style={styles.orderItemPrice}>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedPayment === method.id && styles.paymentMethodSelected,
                ]}
                onPress={() => setSelectedPayment(method.id)}
              >
                <View style={styles.paymentMethodLeft}>
                  <View
                    style={[
                      styles.paymentIcon,
                      selectedPayment === method.id &&
                        styles.paymentIconSelected,
                    ]}
                  >
                    <method.icon
                      size={20}
                      color={
                        selectedPayment === method.id ? '#ffffff' : '#c6aa55'
                      }
                    />
                  </View>
                  <View style={styles.paymentText}>
                    <Text style={styles.paymentTitle}>{method.title}</Text>
                    <Text style={styles.paymentSubtitle}>
                      {method.subtitle}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radioButton,
                    selectedPayment === method.id && styles.radioButtonSelected,
                  ]}
                >
                  {selectedPayment === method.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Coupon Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coupon Code</Text>
          <View style={styles.couponContainer}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter coupon code"
              placeholderTextColor="#9b9591"
            />
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Price Breakdown & Place Order */}
      <View style={styles.footer}>
        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal:</Text>
            <Text style={styles.priceValue}>₹{subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery:</Text>
            <Text style={styles.priceValue}>₹{deliveryCharge}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax (18%):</Text>
            <Text style={styles.priceValue}>₹{tax.toLocaleString()}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            isLoading && styles.placeOrderButtonDisabled,
            // Remove disabling style if not needed
          ]}
          onPress={handlePlaceOrder}
          // Only disable if loading, not if !selectedAddress
          disabled={isLoading}
        >
          <Text style={styles.placeOrderText}>
            {isLoading ? 'Placing Order...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add/Edit Address Modal */}
      <Modal
        visible={showAddAddressModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowAddAddressModal(false);
                resetAddressForm();
              }}
            >
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </Text>
            <TouchableOpacity
              onPress={handleSubmitAddress}
              disabled={isSubmittingAddress}
            >
              <Text
                style={[
                  styles.saveButton,
                  isSubmittingAddress && styles.saveButtonDisabled,
                ]}
              >
                {isSubmittingAddress ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Label *</Text>
              <TextInput
                style={styles.formInput}
                value={addressForm.label}
                onChangeText={(text) =>
                  setAddressForm({ ...addressForm, label: text })
                }
                placeholder="e.g., Home, Work"
                placeholderTextColor="#9b9591"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>House/Flat Number *</Text>
              <TextInput
                style={styles.formInput}
                value={addressForm.house}
                onChangeText={(text) =>
                  setAddressForm({ ...addressForm, house: text })
                }
                placeholder="e.g., 123, Flat 4A"
                placeholderTextColor="#9b9591"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Street Address *</Text>
              <TextInput
                style={styles.formInput}
                value={addressForm.street}
                onChangeText={(text) =>
                  setAddressForm({ ...addressForm, street: text })
                }
                placeholder="e.g., Main Street, Sector 15"
                placeholderTextColor="#9b9591"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>City *</Text>
              <TextInput
                style={styles.formInput}
                value={addressForm.city}
                onChangeText={(text) =>
                  setAddressForm({ ...addressForm, city: text })
                }
                placeholder="e.g., Mumbai"
                placeholderTextColor="#9b9591"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Landmark (Optional)</Text>
              <TextInput
                style={styles.formInput}
                value={addressForm.landmark}
                onChangeText={(text) =>
                  setAddressForm({ ...addressForm, landmark: text })
                }
                placeholder="e.g., Near Metro Station"
                placeholderTextColor="#9b9591"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Additional Address (Optional)
              </Text>
              <TextInput
                style={styles.formInput}
                value={addressForm.address1}
                onChangeText={(text) =>
                  setAddressForm({ ...addressForm, address1: text })
                }
                placeholder="Any additional details"
                placeholderTextColor="#9b9591"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#e7e0d0',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
    paddingHorizontal: 24,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
    marginLeft: 8,
  },
  addButton: {
    marginLeft: 'auto',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#9b9591',
  },
  addressesContainer: {
    gap: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f3f3',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d3bfb3',
  },
  selectedAddressCard: {
    borderColor: '#c6aa55',
    borderWidth: 2,
    backgroundColor: 'rgba(198, 170, 85, 0.05)',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#c6aa55',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  selectedText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  emptyAddressContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyAddressText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#9b9591',
    marginBottom: 10,
  },
  addAddressButton: {
    backgroundColor: '#c6aa55',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addAddressButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  orderSummary: {
    backgroundColor: '#f3f3f3',
    padding: 16,
    borderRadius: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2e3f47',
    marginRight: 16,
  },
  orderItemPrice: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#631e25',
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#d3bfb3',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  paymentMethodSelected: {
    borderColor: '#c6aa55',
    backgroundColor: 'rgba(198, 170, 85, 0.05)',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(198, 170, 85, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIconSelected: {
    backgroundColor: '#c6aa55',
  },
  paymentText: {
    marginLeft: 12,
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d3bfb3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#c6aa55',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#c6aa55',
  },
  couponContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d3bfb3',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2e3f47',
  },
  applyButton: {
    backgroundColor: '#c6aa55',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
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
  priceBreakdown: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#d3bfb3',
    paddingTop: 8,
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
  },
  priceValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2e3f47',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#631e25',
  },
  placeOrderButton: {
    backgroundColor: '#631e25',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#e7e0d0',
  },
  cancelButton: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#c6aa55',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
  },
  saveButton: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#c6aa55',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2e3f47',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d3bfb3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2e3f47',
    minHeight: 50,
  },
});
