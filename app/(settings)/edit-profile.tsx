import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { useUser } from '../../src/contexts/UserContext';
import { useEditProfile } from '../../src/hooks/useEditProfile';
import { Profile, SettingsEdit } from '../../assets';

export default function EditProfileScreen() {
  const router = useRouter();
  const { memberSince } = useUser();

  const {
    localUserName,
    localProfileImage,
    isUploadingImage,
    usernameError,
    setLocalUserName,
    handleUsernameBlur,
    handleImageChange,
    saveChanges,
    hasChanges,
  } = useEditProfile();

  const handleBack = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (hasChanges) {
      const saved = await saveChanges();
      if (!saved) {
        Alert.alert('Unable to Save', 'There was an error saving your changes. Please try again.', [
          { text: 'OK' },
        ]);
        return; // Don't navigate back if save failed
      }
    }
    
    router.back();
  };

  const handleEditProfileImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please enable photo library access to change your profile picture.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Use the hook's image handler which includes upload
      await handleImageChange(result.assets[0].uri);
    }
  };

  // Format join date
  const formattedDate = memberSince.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Image Section */}
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: localProfileImage || Profile }} style={styles.profileImage} />
            {isUploadingImage && (
              <View style={styles.imageOverlay}>
                <ActivityIndicator size="large" color={colors.background.primary} />
              </View>
            )}
            <TouchableOpacity
              style={styles.editImageButton}
              onPress={handleEditProfileImage}
              activeOpacity={0.8}
              disabled={isUploadingImage}
            >
              <Image source={SettingsEdit} style={styles.editIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Username Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>USERNAME</Text>
            <View style={[styles.inputContainer, usernameError && styles.inputError]}>
              <TextInput
                style={styles.input}
                value={localUserName}
                onChangeText={setLocalUserName}
                onBlur={handleUsernameBlur}
                placeholder="Enter username"
                placeholderTextColor={colors.neutral[500]}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {usernameError && <Text style={styles.errorText}>{usernameError}</Text>}
          </View>

          {/* Member Since */}
          <Text style={styles.memberSince}>Member since {formattedDate}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.primaryMedium,
    color: colors.neutral[500],
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  profileImageSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 50,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.neutral[1000],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editIcon: {
    width: 20,
    height: 20,
    tintColor: colors.text.primary,
  },
  formSection: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 32,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: fonts.primaryMedium,
    color: colors.neutral[500],
    letterSpacing: 1,
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  inputError: {
    borderColor: colors.red.black,
  },
  input: {
    fontSize: 18,
    fontFamily: fonts.primary,
    color: colors.text.primary,
  },
  errorText: {
    fontSize: 14,
    fontFamily: fonts.secondary,
    color: colors.red.black,
    marginTop: 8,
    marginLeft: 4,
  },
  memberSince: {
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 40,
  },
});
