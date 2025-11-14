import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

// İzin iste
export const requestPermissions = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Fotoğraf yüklemek için galeri erişim izni gerekiyor!');
    return false;
  }
  return true;
};

// Fotoğraf seç
export const pickImage = async () => {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Fotoğraf seçme hatası:', error);
    return null;
  }
};

// Fotoğraf çek
export const takePhoto = async () => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Fotoğraf çekmek için kamera erişim izni gerekiyor!');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Fotoğraf çekme hatası:', error);
    return null;
  }
};

// Firebase Storage'a yükle
export const uploadImageToFirebase = async (uri, path) => {
  try {
    // URI'den blob oluştur
    const response = await fetch(uri);
    const blob = await response.blob();

    // Firebase Storage'a yükle
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);

    // Download URL'i al
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Firebase yükleme hatası:', error);
    throw error;
  }
};

// Profil fotoğrafı yükle
export const uploadProfileImage = async (userId, uri) => {
  const path = `profiles/${userId}/profile.jpg`;
  return await uploadImageToFirebase(uri, path);
};

// Etkinlik fotoğrafı yükle
export const uploadEventImage = async (eventId, uri) => {
  const timestamp = Date.now();
  const path = `events/${eventId}/${timestamp}.jpg`;
  return await uploadImageToFirebase(uri, path);
};

