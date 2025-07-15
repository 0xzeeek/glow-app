import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

interface SignOutModalProps {
  visible: boolean;
  onCancel: () => void;
  onSignOut: () => void;
}

const { height: screenHeight } = Dimensions.get('window');

export default function SignOutModal({
  visible,
  onCancel,
  onSignOut,
}: SignOutModalProps) {
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [contentTranslateY] = useState(new Animated.Value(300));

  useEffect(() => {
    if (visible) {
      // Reset animation values
      overlayOpacity.setValue(0);
      contentTranslateY.setValue(300);
      
      // Fade in overlay
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      // Slide up content
      Animated.spring(contentTranslateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out overlay
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      // Slide down content
      Animated.timing(contentTranslateY, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, overlayOpacity, contentTranslateY]);

  const handleCancel = () => {
    // Animate out first
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onCancel();
    });
  };

  const handleSignOut = () => {
    // Animate out first
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onSignOut();
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <Animated.View 
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        />
      </TouchableWithoutFeedback>
      
      <Animated.View 
        style={[
          styles.modalContent,
          {
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        <View style={styles.contentInner}>
          <Text style={styles.title}>Are you sure you want to sign out?</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.signOutButton} 
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
              <Text style={styles.signOutText}>SIGN OUT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  contentInner: {
    padding: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.primary,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: fonts.secondaryMedium,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  signOutButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 100,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontFamily: fonts.secondaryMedium,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
}); 