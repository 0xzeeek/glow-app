import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../../src/theme';
import DeleteAccountModal from "../../src/components/shared/DeleteAccountModal";

interface MenuItem {
  icon: string;
  title: string;
  action: () => void;
}

export default function LegalPrivacyScreen() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleTermsOfUse = () => {
    Linking.openURL('https://yourdomain.com/terms'); // Replace with actual URL
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://yourdomain.com/privacy'); // Replace with actual URL
  };

  const handleAcceptableUse = () => {
    Linking.openURL('https://yourdomain.com/acceptable-use'); // Replace with actual URL
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'document-text-outline',
      title: 'TERMS OF USE',
      action: handleTermsOfUse,
    },
    {
      icon: 'lock-closed-outline',
      title: 'PRIVACY POLICY',
      action: handlePrivacyPolicy,
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'ACCEPTABLE USE POLICY',
      action: handleAcceptableUse,
    },
    {
      icon: 'trash-outline',
      title: 'DELETE ACCOUNT',
      action: handleDeleteAccount,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LEGAL & PRIVACY</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.menuItem} 
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon as any} size={24} color={colors.text.primary} />
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.neutral[400]} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.primaryBold,
    fontSize: 16,
    color: colors.text.neutral,
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  menuSection: {
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuTitle: {
    fontFamily: fonts.primaryBold,
    fontSize: 18,
    color: colors.text.primary,
    marginLeft: 16,
  },
}); 