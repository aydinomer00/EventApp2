import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActionSheetIOS,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { pickImage, takePhoto, processProfileImage } from '../utils/imageUpload';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../locales/translations';

export default function EditProfileScreen({ navigation }) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setName(data.name || user.displayName || '');
        setBio(data.bio || '');
        setPhotoURL(data.photoURL || user.photoURL || '');
      } else {
        setPhotoURL(user.photoURL || '');
      }
    } catch (error) {
      console.error('Profil yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t(language, 'cancel'), t(language, 'takePhoto'), t(language, 'chooseFromGallery')],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handleTakePhoto();
          } else if (buttonIndex === 2) {
            await handlePickImage();
          }
        }
      );
    } else {
      Alert.alert(
        t(language, 'choosePhoto'),
        language === 'tr' ? 'Nereden fotoğraf eklemek istersiniz?' : 'Where would you like to add a photo from?',
        [
          { text: t(language, 'cancel'), style: 'cancel' },
          { text: t(language, 'takePhoto'), onPress: handleTakePhoto },
          { text: t(language, 'chooseFromGallery'), onPress: handlePickImage },
        ]
      );
    }
  };

  const handlePickImage = async () => {
    try {
      const uri = await pickImage();
      if (uri) {
        await uploadPhoto(uri);
      }
    } catch (error) {
      console.error('Fotoğraf seçme hatası:', error);
      Alert.alert(t(language, 'error'), t(language, 'photoSelectError'));
    }
  };

  const handleTakePhoto = async () => {
    try {
      const uri = await takePhoto();
      if (uri) {
        await uploadPhoto(uri);
      }
    } catch (error) {
      console.error('Fotoğraf çekme hatası:', error);
      Alert.alert(t(language, 'error'), t(language, 'photoTakeError'));
    }
  };

  const uploadPhoto = async (uri) => {
    setUploadingPhoto(true);
    try {
      console.log('📸 Fotoğraf işleniyor...');
      
      // Fotoğrafı küçült ve Base64'e çevir
      const base64String = await processProfileImage(uri);
      
      if (base64String) {
        setPhotoURL(base64String);
        Alert.alert(t(language, 'success'), t(language, 'photoReady'));
      }
    } catch (error) {
      console.error('❌ Fotoğraf işleme hatası:', error);
      Alert.alert(t(language, 'error'), t(language, 'photoError'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t(language, 'error'), t(language, 'nameRequired'));
      return;
    }

    setSaving(true);
    try {
      // Firebase Auth'da sadece ismi güncelle (photoURL Base64 olduğu için burada hata veriyor)
      await updateProfile(user, {
        displayName: name,
      });

      // Firestore'da profili güncelle (Base64 photoURL burada saklanıyor)
      await updateDoc(doc(db, 'users', user.uid), {
        name: name,
        bio: bio,
        photoURL: photoURL, // Base64 string Firestore'da saklanabilir
      });

      Alert.alert(t(language, 'success'), t(language, 'profileUpdated'), [
        {
          text: t(language, 'ok'),
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      Alert.alert(t(language, 'error'), language === 'tr' ? 'Profil güncellenirken bir hata oluştu' : 'An error occurred while updating the profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t(language, 'editProfile')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Photo Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            style={styles.photoContainer}
            onPress={handleImagePicker}
            activeOpacity={0.8}
          >
            {photoURL ? (
              <Image
                source={{ uri: photoURL }}
                style={styles.profilePhoto}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(name)}
                </Text>
              </View>
            )}
            
            <View style={styles.cameraIconContainer}>
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
          
          <Text style={styles.avatarLabel}>{t(language, 'profilePhoto')}</Text>
          <Text style={styles.avatarHelperText}>
            {t(language, 'clickToChangePhoto')}
          </Text>
        </View>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t(language, 'name')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t(language, 'namePlaceholder')}
            placeholderTextColor="#666666"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Bio Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t(language, 'biography')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t(language, 'bioPlaceholder')}
            placeholderTextColor="#666666"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={150}
          />
          <Text style={styles.characterCount}>{bio.length}/150</Text>
        </View>

        {/* Email Display (Read-only) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t(language, 'email')}</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>{user.email}</Text>
          </View>
          <Text style={styles.helperText}>{t(language, 'emailCannotChange')}</Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>{t(language, 'saveChanges')}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 32,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  avatarHelperText: {
    fontSize: 13,
    color: '#666666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  characterCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 6,
  },
  readOnlyInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    padding: 16,
  },
  readOnlyText: {
    fontSize: 16,
    color: '#666666',
  },
  helperText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 40,
  },
});

