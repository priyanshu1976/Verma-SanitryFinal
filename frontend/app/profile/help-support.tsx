import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  ChevronRight,
} from 'lucide-react-native';

interface FAQ {
  question: string;
  answer: string;
}

export default function HelpSupportScreen() {
  const faqs: FAQ[] = [
    {
      question: 'How do I place an order?',
      answer:
        'Browse our products, add items to your cart, and proceed to checkout. You can pay using various payment methods including cash on delivery.',
    },
    {
      question: 'What is your delivery time?',
      answer:
        'We typically deliver within 24-48 hours for orders within Chandigarh, Mohali, and Panchkula. Delivery times may vary based on location.',
    },
    {
      question: 'Do you offer cash on delivery?',
      answer:
        'Yes, we offer cash on delivery for all orders. You can also pay online using various payment methods.',
    },
    {
      question: 'What if I receive a damaged product?',
      answer:
        'If you receive a damaged product, please contact us immediately. We will arrange a replacement or refund.',
    },
    {
      question: 'Can I cancel my order?',
      answer:
        'You can cancel your order before it is shipped. Once shipped, cancellation may not be possible.',
    },
    {
      question: 'Do you ship outside Chandigarh?',
      answer:
        'Currently, we deliver to Chandigarh, Mohali, and Panchkula. We are working on expanding our delivery areas.',
    },
  ];

  const handleContact = (type: 'email' | 'phone' | 'whatsapp') => {
    switch (type) {
      case 'email':
        Linking.openURL('mailto:support@mittalandco.com');
        break;
      case 'phone':
        Linking.openURL('tel:+919876543210');
        break;
      case 'whatsapp':
        Linking.openURL(
          'whatsapp://send?phone=919876543210&text=Hello, I need help with my order.'
        );
        break;
    }
  };

  const renderContactCard = (
    IconComponent: any,
    title: string,
    subtitle: string,
    action: () => void
  ) => (
    <TouchableOpacity style={styles.contactCard} onPress={action}>
      <View style={styles.contactIcon}>
        <IconComponent size={24} color="#c6aa55" />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#9b9591" />
    </TouchableOpacity>
  );

  const renderFAQ = (faq: FAQ, index: number) => (
    <View key={index} style={styles.faqItem}>
      <Text style={styles.faqQuestion}>{faq.question}</Text>
      <Text style={styles.faqAnswer}>{faq.answer}</Text>
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
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Company Info */}
        <View style={styles.companySection}>
          <Text style={styles.sectionTitle}>Verma & Company</Text>
          <Text style={styles.companyDescription}>
            Your trusted partner for all sanitary and plumbing needs. We provide
            quality products and excellent service to make your home better.
          </Text>
        </View>

        {/* Contact Methods */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          {renderContactCard(Phone, 'Call Us', '+91 98721 17945', () =>
            handleContact('phone')
          )}
          {renderContactCard(Mail, 'Email Us', 'support@mittalandco.com', () =>
            handleContact('email')
          )}
          {renderContactCard(
            MessageCircle,
            'WhatsApp',
            'Chat with us on WhatsApp',
            () => handleContact('whatsapp')
          )}
        </View>

        {/* Business Hours */}
        <View style={styles.hoursSection}>
          <Text style={styles.sectionTitle}>Business Hours</Text>
          <View style={styles.hoursCard}>
            <View style={styles.hoursHeader}>
              <Clock size={20} color="#c6aa55" />
              <Text style={styles.hoursTitle}>Store Hours</Text>
            </View>
            <View style={styles.hoursList}>
              <View style={styles.hourRow}>
                <Text style={styles.dayText}>Monday - Friday</Text>
                <Text style={styles.timeText}>9:00 AM - 8:00 PM</Text>
              </View>
              <View style={styles.hourRow}>
                <Text style={styles.dayText}>Saturday</Text>
                <Text style={styles.timeText}>9:00 AM - 6:00 PM</Text>
              </View>
              <View style={styles.hourRow}>
                <Text style={styles.dayText}>Sunday</Text>
                <Text style={styles.timeText}>10:00 AM - 4:00 PM</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Address */}
        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>Visit Us</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <MapPin size={20} color="#c6aa55" />
              <Text style={styles.addressTitle}>Store Address</Text>
            </View>
            <Text style={styles.addressText}>
              123 Main Street, Sector 22{'\n'}
              Chandigarh, Punjab 160022{'\n'}
              India
            </Text>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map(renderFAQ)}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need more help? Don't hesitate to contact us!
          </Text>
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
  content: {
    flex: 1,
  },
  companySection: {
    backgroundColor: '#ffffff',
    padding: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
    marginBottom: 12,
  },
  companyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(198, 170, 85, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  hoursSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    marginBottom: 16,
  },
  hoursCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  hoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hoursTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    marginLeft: 12,
  },
  hoursList: {
    gap: 12,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2e3f47',
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  addressSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    marginLeft: 12,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
  },
  faqSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
});
