import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useUser } from '../contexts/UserContext';

interface UseEditProfileReturn {
  localUserName: string;
  localEmail: string;
  localProfileImage: string | null;
  isCheckingUsername: boolean;
  isCheckingEmail: boolean;
  isUploadingImage: boolean;
  usernameError: string | null;
  emailError: string | null;
  setLocalUserName: (username: string) => void;
  setLocalEmail: (email: string) => void;
  setLocalProfileImage: (imageUri: string | null) => void;
  handleUsernameBlur: () => Promise<void>;
  handleEmailBlur: () => Promise<void>;
  handleImageChange: (imageUri: string) => Promise<void>;
  saveChanges: () => Promise<boolean>;
  hasChanges: boolean;
}

const checkUsernameExists = async (username: string): Promise<boolean> => {
  // TODO: implement username check
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For demo: return true if username is 'taken'
  return username.toLowerCase() === 'taken';
};

const checkEmailExists = async (email: string): Promise<boolean> => {
  // TODO: implement email check
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For demo: return true if email is 'taken@example.com'
  return email.toLowerCase() === 'taken@example.com';
};

const uploadProfileImage = async (imageUri: string): Promise<string | null> => {
  // TODO: implement image upload
  // Simulate API upload
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In real implementation, this would return the uploaded image URL
  console.log('Uploading image:', imageUri);
  return imageUri; // Return the same URI for now
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function useEditProfile(): UseEditProfileReturn {
  const { 
    username, 
    email, 
    image,
    setUsername, 
    setEmail,
    setImage 
  } = useUser();

  const [localUserName, setLocalUserName] = useState(username);
  const [localEmail, setLocalEmail] = useState(email);
  const [localProfileImage, setLocalProfileImage] = useState(image);
  
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Track original values to prevent unnecessary checks
  const originalUsername = useRef(username);
  const originalEmail = useRef(email);

  const hasChanges = 
    localUserName !== username ||
    localEmail !== email ||
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
      const exists = await checkUsernameExists(localUserName);
      if (exists) {
        setUsernameError('Username is already taken');
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameError('Error checking username availability');
    } finally {
      setIsCheckingUsername(false);
    }
  }, [localUserName]);

  const handleEmailBlur = useCallback(async () => {
    // Clear previous error
    setEmailError(null);

    // Skip if email hasn't changed or is empty
    if (!localEmail || localEmail === originalEmail.current) {
      return;
    }

    // Validate email format
    if (!validateEmail(localEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Check if email exists
    setIsCheckingEmail(true);
    try {
      const exists = await checkEmailExists(localEmail);
      if (exists) {
        setEmailError('Email is already in use');
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailError('Error checking email availability');
    } finally {
      setIsCheckingEmail(false);
    }
  }, [localEmail]);

  const handleImageChange = useCallback(async (imageUri: string) => {
    setIsUploadingImage(true);
    try {
      // Upload image to backend
      const uploadedUrl = await uploadProfileImage(imageUri);
      
      if (uploadedUrl) {
        setLocalProfileImage(uploadedUrl);
        Alert.alert('Success', 'Profile picture updated successfully');
      } else {
        Alert.alert('Error', 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

  const saveChanges = useCallback(async (): Promise<boolean> => {
    // Validate before saving
    if (usernameError || emailError) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return false;
    }

    // Final validation
    if (!localUserName || localUserName.length < 3) {
      setUsernameError('Username is required');
      return false;
    }

    if (!localEmail || !validateEmail(localEmail)) {
      setEmailError('Valid email is required');
      return false;
    }

    try {

      // TODO: call save user data api here
      // Save changes to context
      setUsername(localUserName);
      setEmail(localEmail);
      
      if (localProfileImage !== image) {
        setImage(localProfileImage);
      }

      // Update original values
      originalUsername.current = localUserName;
      originalEmail.current = localEmail;

      return true;
    } catch (error) {
      console.error('Error saving changes:', error);
      Alert.alert('Error', 'Failed to save changes');
      return false;
    }
  }, [
    localUserName, 
    localEmail, 
    localProfileImage, 
    image,
    usernameError, 
    emailError,
    setUsername, 
    setEmail, 
    setImage
  ]);

  return {
    localUserName,
    localEmail,
    localProfileImage,
    isCheckingUsername,
    isCheckingEmail,
    isUploadingImage,
    usernameError,
    emailError,
    setLocalUserName,
    setLocalEmail,
    setLocalProfileImage,
    handleUsernameBlur,
    handleEmailBlur,
    handleImageChange,
    saveChanges,
    hasChanges,
  };
} 