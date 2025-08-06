import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Shield, Github } from 'lucide-react-native';

const DEVELOPERS = [
  {
    name: 'Priyanshu Patel',
    role: 'Lead Developer & App Architect',
    photo: require('assets/images/leetcode.png'), // Place your image in assets/devs/nikhil.jpg
    github: 'https://github.com/priyanshu1976',
    contribution:
      'Contributions: Full-stack development, UI/UX, API integration, deployment, and maintenance.',
    quote: 'Code is like humor. When you have to explain it, it’s bad.',
  },
  {
    name: 'Surya K. Tiwari',
    role: 'Backend Developer, API Specialist & Database Administrator',
    photo: require('assets/images/surya.png'),
    github: 'https://github.com/SuryaKTiwari11',
    contribution:
      'Contributions: API design, database management, and server deployment.',
    quote: 'Simplicity is the soul of efficiency.',
  },
];

export default function PrivacyPolicyScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  const privacySections = [
    {
      title: 'Information We Collect',
      content: [
        'Personal information (name, email, phone number, address)',
        'Order history and preferences',
        'Device information and usage data',
        'Payment information (processed securely through third-party providers)',
      ],
    },
    {
      title: 'How We Use Your Information',
      content: [
        'Process and fulfill your orders',
        'Communicate with you about your orders',
        'Send promotional offers and updates (with your consent)',
        'Improve our services and user experience',
        'Comply with legal obligations',
      ],
    },
    {
      title: 'Information Sharing',
      content: [
        'We do not sell, trade, or rent your personal information',
        'We may share information with delivery partners to fulfill orders',
        'We may share information with payment processors for secure transactions',
        'We may disclose information if required by law',
      ],
    },
    {
      title: 'Data Security',
      content: [
        'We implement industry-standard security measures',
        'Your payment information is encrypted and secure',
        'We regularly review and update our security practices',
        'We limit access to personal information to authorized personnel only',
      ],
    },
    {
      title: 'Your Rights',
      content: [
        'Access and update your personal information',
        'Request deletion of your account and data',
        'Opt-out of marketing communications',
        'File a complaint about our data practices',
      ],
    },
    {
      title: 'Cookies and Tracking',
      content: [
        'We use cookies to improve your browsing experience',
        'You can disable cookies in your browser settings',
        'We may use analytics tools to understand app usage',
        'Third-party services may use their own tracking technologies',
      ],
    },
    {
      title: "Children's Privacy",
      content: [
        'Our services are not intended for children under 13',
        'We do not knowingly collect information from children under 13',
        'If we become aware of such collection, we will delete it immediately',
      ],
    },
    {
      title: 'Changes to This Policy',
      content: [
        'We may update this privacy policy from time to time',
        'We will notify you of significant changes via email or app notification',
        'Continued use of our services constitutes acceptance of changes',
        'You can review the current policy at any time in the app',
      ],
    },
    {
      title: 'Contact Us',
      content: [
        'If you have questions about this privacy policy, please contact us:',
        'Email: privacy@mittalandco.com',
        'Phone: +91 98765 43210',
        'Address: 123 Main Street, Sector 22, Chandigarh, Punjab 160022',
      ],
    },
  ];

  const renderSection = (
    section: { title: string; content: string[] },
    index: number
  ) => (
    <View key={index} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.content.map((item, itemIndex) => (
        <View key={itemIndex} style={styles.bulletPoint}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  const handleGithubPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Developer Info Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.devTitle}>Developer Info</Text>
            {DEVELOPERS.map((dev, idx) => (
              <View key={dev.name} style={styles.devCard}>
                <Image
                  source={dev.photo}
                  style={styles.devPhoto}
                  resizeMode="cover"
                />
                <Text style={styles.devName}>{dev.name}</Text>
                <Text style={styles.devRole}>{dev.role}</Text>
                <Text style={styles.devContribution}>{dev.contribution}</Text>
                <Text style={styles.devQuote}>"{dev.quote}"</Text>
                <View style={styles.socialRow}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleGithubPress(dev.github)}
                  >
                    <Github size={22} color="#2e3f47" />
                    <Text style={styles.socialText}>GitHub</Text>
                  </TouchableOpacity>
                </View>
                {idx !== DEVELOPERS.length - 1 && (
                  <View style={styles.devDivider} />
                )}
              </View>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#2e3f47" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.subtitle}>Last updated: December 2024</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Shield size={24} color="#c6aa55" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Your Privacy Matters</Text>
          <Text style={styles.introText}>
            At Verma & Company, we are committed to protecting your privacy and
            ensuring the security of your personal information. This privacy
            policy explains how we collect, use, and safeguard your information
            when you use our mobile application and services.
          </Text>
        </View>

        {/* Policy Sections */}
        {privacySections.map(renderSection)}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for trusting Verma & Company with your information.
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    marginTop: 2,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(198, 170, 85, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  introSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
    marginBottom: 12,
  },
  introText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#c6aa55',
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(44,44,44,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  devCard: {
    alignItems: 'center',
    marginBottom: 18,
    width: '100%',
  },
  devPhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#c6aa55',
    backgroundColor: '#eee',
  },
  devTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
    marginBottom: 8,
  },
  devName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#c6aa55',
    marginBottom: 2,
  },
  devRole: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 10,
  },
  devContribution: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#2e3f47',
    marginBottom: 8,
    textAlign: 'center',
  },
  devQuote: {
    fontSize: 13,
    fontFamily: 'Inter-Italic',
    color: '#9b9591',
    fontStyle: 'italic',
    marginBottom: 12,
    textAlign: 'center',
  },
  devDivider: {
    width: '80%',
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 8,
    alignSelf: 'center',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 18,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f3f3',
    marginHorizontal: 4,
  },
  socialText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#2e3f47',
    marginLeft: 6,
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 2,
  },
  closeButton: {
    marginTop: 4,
    backgroundColor: '#c6aa55',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    textAlign: 'center',
  },
});
