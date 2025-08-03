import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CircleCheck as CheckCircle, Package, Chrome as Home } from 'lucide-react-native';

export default function OrderSuccessScreen() {
  const checkScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate check mark
    Animated.sequence([
      Animated.timing(checkScale, {
        toValue: 1.2,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(checkScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animate content
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const orderNumber = 'ORD' + Math.random().toString().substr(2, 6);
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.successIcon, 
            { transform: [{ scale: checkScale }] }
          ]}
        >
          <CheckCircle size={80} color="#10B981" />
        </Animated.View>

        <Animated.View 
          style={[
            styles.textContainer, 
            { opacity: contentOpacity }
          ]}
        >
          <Text style={styles.title}>Order Placed Successfully!</Text>
          <Text style={styles.subtitle}>
            Thank you for your purchase. Your order has been confirmed.
          </Text>

          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order Number:</Text>
              <Text style={styles.detailValue}>{orderNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estimated Delivery:</Text>
              <Text style={styles.detailValue}>{estimatedDelivery}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Package size={24} color="#0066CC" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>What's Next?</Text>
              <Text style={styles.infoDescription}>
                We'll send you tracking information once your order is shipped. 
                You can track your order in the Orders section.
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.buttonContainer, 
            { opacity: contentOpacity }
          ]}
        >
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <Text style={styles.trackButtonText}>Track Your Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Home size={20} color="#6B7280" />
            <Text style={styles.homeButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    marginBottom: 32,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  orderDetails: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  trackButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  trackButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
  },
  homeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginLeft: 8,
  },
});