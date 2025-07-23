import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { getApiClient } from '../services/ApiClient';
import { ApiError } from '../services/ApiClient';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

interface UseEditProfileReturn {
  localUserName: string;
  localProfileImage: string | null;
  isCheckingUsername: boolean;
  isUploadingImage: boolean;
  usernameError: string | null;
  setLocalUserName: (username: string) => void;
  setLocalProfileImage: (imageUri: string | null) => void;
  handleUsernameBlur: () => Promise<void>;
  handleImageChange: (imageUri: string) => Promise<void>;
  saveChanges: () => Promise<boolean>;
  hasChanges: boolean;
}

const resizeImage = async (imageUri: string): Promise<string> => {
  try { 
    // Resize image to max 800x800 while maintaining aspect ratio
    // This will only resize if the image is larger than 800x800
    const manipulatorResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800, height: 800 } }],
      { 
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG // JPEG is more efficient for photos
      }
    );
    
    return manipulatorResult.uri;
  } catch (error) {
    console.error('Error resizing image:', error);
    // If resize fails, return original image
    return imageUri;
  }
};

const uploadProfileImage = async (imageUri: string, wallet: string): Promise<string | null> => {
  try {
    // Resize image first to reduce file size
    const resizedImageUri = await resizeImage(imageUri);
    
    // Read the resized image file and convert to base64
    const base64 = await FileSystem.readAsStringAsync(resizedImageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Get API client and upload image
    const apiClient = getApiClient();
    const response = await apiClient.uploadUserImage(wallet, base64);
    
    if (response.ok && response.image) {
      return response.image;
    }
    
    return null;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

export function useEditProfile(): UseEditProfileReturn {
  const { 
    username, 
    image,
    walletAddress,
    setUsername, 
    setImage 
  } = useUser();

  const [localUserName, setLocalUserName] = useState(username);
  const [localProfileImage, setLocalProfileImage] = useState(image);
  
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Track original values to prevent unnecessary checks
  const originalUsername = useRef(username);

  const hasChanges = 
    localUserName !== username ||
    localProfileImage !== image;

  const handleUsernameBlur = useCallback(async () => {
    // Clear previous error
    setUsernameError(null);

    // Skip if username hasn't changed or is empty
    if (!localUserName || localUserName === originalUsername.current) {
      return;
    }

    // Validate username format
    if (localUserName.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(localUserName)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return;
    }

    // Check if username exists
    setIsCheckingUsername(true);
    try {
      const apiClient = getApiClient();
      const response = await apiClient.checkUsernameExists(localUserName);
      if (!response.available) {
        setUsernameError('Username is already taken');
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameError('Error checking username availability');
    } finally {
      setIsCheckingUsername(false);
    }
  }, [localUserName]);

  const handleImageChange = useCallback(async (imageUri: string) => {
    if (!walletAddress) {
      Alert.alert('Error', 'Wallet address not found');
      return;
    }
    
    setIsUploadingImage(true);
    try {
      // Upload image to backend
      const image = await uploadProfileImage(imageUri, walletAddress);
      
      if (image) {
        setLocalProfileImage(image);

      } else {
        Alert.alert('Error', 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setIsUploadingImage(false);
    }
  }, [walletAddress]);

  const saveChanges = useCallback(async (): Promise<boolean> => {
    // Validate before saving
    if (usernameError) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return false;
    }

    // Final validation
    if (!localUserName || localUserName.length < 3) {
      setUsernameError('Username is required');
      return false;
    }

    if (!walletAddress) {
      Alert.alert('Error', 'Wallet address not found');
      return false;
    }

    try {
      const apiClient = getApiClient();
      await apiClient.updateUser(walletAddress, localUserName);

      // Save changes to context
      setUsername(localUserName);
      
      if (localProfileImage !== image) {
        setImage(localProfileImage);
      }

      // Update original values
      originalUsername.current = localUserName;

      return true;
    } catch (error) {
      console.error('Error saving changes:', error);
      
      // Check if it's a 409 error for username already taken
      if (error instanceof ApiError && error.status === 409) {
        if (error.data?.error === 'Username is already taken' || 
            error.message === 'Username is already taken') {
          setUsernameError('Username is already taken');
          return false;
        }
      }
      
      // For other errors, show generic alert
      Alert.alert('Error', 'Failed to save changes');
      return false;
    }
  }, [
    localUserName, 
    localProfileImage, 
    image,
    walletAddress,
    usernameError, 
    setUsername, 
    setImage
  ]);

  return {
    localUserName,
    localProfileImage,
    isCheckingUsername,
    isUploadingImage,
    usernameError,
    setLocalUserName,
    setLocalProfileImage,
    handleUsernameBlur,
    handleImageChange,
    saveChanges,
    hasChanges,
  };
} 