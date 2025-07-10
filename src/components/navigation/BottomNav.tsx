import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BottomNavProps {
  activeTab?: 'home' | 'add' | 'profile';
}

export default function BottomNav({ activeTab = 'home' }: BottomNavProps) {
  const router = useRouter();

  const handleHomePress = () => {
    if (activeTab !== 'home') {
      router.replace('/(home)');
    }
  };

  const handleProfilePress = () => {
    if (activeTab !== 'profile') {
      router.replace('/(profile)');
    }
  };

  const handleAddPress = () => {
    // Add screen navigation when implemented
    console.log('Add button pressed');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navItem} onPress={handleHomePress}>
        <Ionicons 
          name={activeTab === 'home' ? 'home' : 'home-outline'} 
          size={24} 
          color={activeTab === 'home' ? '#000000' : '#666666'} 
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={handleAddPress}>
        <View style={styles.addButton}>
          <MaterialIcons name="add" size={24} color="#666666" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={handleProfilePress}>
        <Ionicons 
          name={activeTab === 'profile' ? 'person' : 'person-outline'} 
          size={24} 
          color={activeTab === 'profile' ? '#000000' : '#666666'} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 