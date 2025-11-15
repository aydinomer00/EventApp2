import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

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
      quality: 0.7,
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
      quality: 0.7,
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

// Profil fotoğrafı için küçült (200x200)
export const resizeImage = async (uri) => {
  try {
    console.log('📐 Profil fotoğrafı küçültülüyor...');
    
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 200, height: 200 } }], // 200x200 pixel'e küçült
      { 
        compress: 0.7, // %70 kalite (boyut küçültmek için)
        format: ImageManipulator.SaveFormat.JPEG 
      }
    );

    console.log('✅ Profil fotoğrafı küçültüldü:', manipulatedImage.uri);
    return manipulatedImage.uri;
  } catch (error) {
    console.error('❌ Fotoğraf küçültme hatası:', error);
    throw error;
  }
};

// Etkinlik fotoğrafı için küçült (400x300 - daha büyük)
export const resizeEventImage = async (uri) => {
  try {
    console.log('📐 Etkinlik fotoğrafı küçültülüyor...');
    
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 400 } }], // Genişlik 400px, yükseklik orantılı
      { 
        compress: 0.6, // %60 kalite (daha fazla sıkıştırma)
        format: ImageManipulator.SaveFormat.JPEG 
      }
    );

    console.log('✅ Etkinlik fotoğrafı küçültüldü:', manipulatedImage.uri);
    return manipulatedImage.uri;
  } catch (error) {
    console.error('❌ Etkinlik fotoğrafı küçültme hatası:', error);
    throw error;
  }
};

// URI'den Base64 string'e çevir
export const convertToBase64 = async (uri) => {
  try {
    console.log('🔄 Base64\'e çeviriliyor...');
    
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const sizeInKB = Math.round(base64String.length / 1024);
        console.log(`✅ Base64 oluşturuldu! Boyut: ${sizeInKB} KB`);
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('❌ Base64 çevirme hatası:', error);
    throw error;
  }
};

// Profil fotoğrafı için: Küçült + Base64'e çevir
export const processProfileImage = async (uri) => {
  try {
    console.log('🎨 Profil fotoğrafı işleniyor...');
    
    // 1. Fotoğrafı küçült
    const resizedUri = await resizeImage(uri);
    
    // 2. Base64'e çevir
    const base64String = await convertToBase64(resizedUri);
    
    // 3. Boyut kontrolü (Firestore limiti: 1MB, bizim limit: 100KB)
    const sizeInKB = Math.round(base64String.length / 1024);
    if (sizeInKB > 100) {
      console.warn('⚠️ Profil fotoğrafı çok büyük:', sizeInKB, 'KB');
      alert('Fotoğraf çok büyük! Lütfen daha küçük bir fotoğraf seçin.');
      return null;
    }
    
    console.log('🎉 Profil fotoğrafı hazır! Base64 boyut:', sizeInKB, 'KB');
    return base64String;
  } catch (error) {
    console.error('❌ Profil fotoğrafı işleme hatası:', error);
    alert('Fotoğraf işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
    return null;
  }
};

// Etkinlik fotoğrafı için: Küçült + Base64'e çevir
export const processEventImage = async (uri) => {
  try {
    console.log('🎨 Etkinlik fotoğrafı işleniyor...');
    
    // 1. Fotoğrafı küçült
    const resizedUri = await resizeEventImage(uri);
    
    // 2. Base64'e çevir
    const base64String = await convertToBase64(resizedUri);
    
    // 3. Boyut kontrolü (Etkinlik fotoğrafı için: 150KB limit)
    const sizeInKB = Math.round(base64String.length / 1024);
    if (sizeInKB > 150) {
      console.warn('⚠️ Etkinlik fotoğrafı çok büyük:', sizeInKB, 'KB');
      alert('Fotoğraf çok büyük! Lütfen daha küçük bir fotoğraf seçin.');
      return null;
    }
    
    console.log('🎉 Etkinlik fotoğrafı hazır! Base64 boyut:', sizeInKB, 'KB');
    return base64String;
  } catch (error) {
    console.error('❌ Etkinlik fotoğrafı işleme hatası:', error);
    alert('Fotoğraf işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
    return null;
  }
};

