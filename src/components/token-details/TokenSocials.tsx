import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TokenSocialsProps {
  socialLinks: {
    platform: string;
    handle: string;
    icon: string;
  }[];
}

export default function TokenSocials({ socialLinks }: TokenSocialsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOCIALS</Text>
      {socialLinks.map((social) => (
        <TouchableOpacity key={social.platform} style={styles.socialRow}>
          <View style={styles.leftSection}>
            <Ionicons name={social.icon as any} size={20} color="#666666" />
            <Text style={styles.platform}>{social.platform}</Text>
          </View>
          <View style={styles.rightSection}>
            <Text style={styles.handle}>{social.handle}</Text>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginBottom: 100, // Space for floating button
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  platform: {
    fontSize: 14,
    color: '#000000',
  },
  handle: {
    fontSize: 14,
    color: '#666666',
  },
}); 