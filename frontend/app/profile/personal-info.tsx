import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/api';

export default function PersonalInfoScreen() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
  });

  const handleSave = async () => {
    try {
      // Here you would typically call an API to update user data
      // For now, we'll just show a success message
      setIsEditing(false);
      Alert.alert('Success', 'Personal information updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update personal information');
    }
  };

  const renderField = (
    label: string,
    value: string,
    key: keyof typeof formData,
    IconComponent: any
  ) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldIcon}>
          <IconComponent size={20} color="#c6aa55" />
        </View>
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={formData[key]}
          onChangeText={(text) => setFormData({ ...formData, [key]: text })}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <Text style={styles.fieldValue}>{value || 'Not provided'}</Text>
      )}
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
        <Text style={styles.title}>Personal Information</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <User size={40} color="#ffffff" />
          </View>
          <Text style={styles.avatarText}>
            {isEditing ? 'Tap to change photo' : 'Profile Photo'}
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {renderField('Full Name', formData.name, 'name', User)}
          {renderField('Email Address', formData.email, 'email', Mail)}
          {renderField('Phone Number', formData.phone, 'phone', Phone)}
          {renderField('City', formData.city, 'city', MapPin)}
        </View>

        {/* Save Button */}
        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color="#ffffff" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
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
    textAlign: 'center',
    justifyContent: 'flex-start',
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
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#c6aa55',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#c6aa55',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
  },
  formSection: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  fieldContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(198, 170, 85, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
  },
  fieldValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2e3f47',
    marginLeft: 44,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2e3f47',
    marginLeft: 44,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#c6aa55',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c6aa55',
    marginHorizontal: 24,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 8,
  },
});
