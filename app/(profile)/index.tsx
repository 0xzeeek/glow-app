import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../../src/components/navigation/BottomNav';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.gradientBackground}>
        {/* Settings Icon */}
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageWrapper}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/300?img=15' }} 
              style={styles.profileImage} 
            />
          </View>
          <Text style={styles.username}>leo_lepicerie</Text>
        </View>
      </View>

      {/* Balance Section */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceAmount}>$0</Text>
        <Text style={styles.buyingPowerText}>BUYING POWER $0</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.depositButton}>
            <Text style={styles.depositIcon}>+</Text>
            <Text style={styles.depositText}>DEPOSIT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cashOutButton}>
            <Text style={styles.cashOutIcon}>$</Text>
            <Text style={styles.cashOutText}>CASH OUT</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Holdings Section */}
      <View style={styles.holdingsSection}>
        <Text style={styles.noHoldingsTitle}>No Holdings Yet</Text>
        <Text style={styles.noHoldingsText}>Holdings you own will show up here</Text>

        <TouchableOpacity style={styles.exploreButton}>
          <Ionicons name="search" size={20} color="#000000" />
          <Text style={styles.exploreText}>EXPLORE</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <BottomNav activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientBackground: {
    height: 280,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#4B79A1',
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  username: {
    fontSize: 26,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  balanceSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    marginTop: -50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  buyingPowerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  depositButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  depositIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  depositText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cashOutButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cashOutIcon: {
    color: '#666666',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  cashOutText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  holdingsSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  noHoldingsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  noHoldingsText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#000000',
  },
  exploreText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
}); 