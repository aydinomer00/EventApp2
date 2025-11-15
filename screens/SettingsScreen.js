import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../locales/translations';

export default function SettingsScreen({ navigation }) {
  const { language } = useLanguage();
  
  const handleLogout = () => {
    Alert.alert(
      t(language, 'logout'),
      language === 'tr' ? 'Çıkış yapmak istediğinize emin misiniz?' : 'Are you sure you want to log out?',
      [
        {
          text: t(language, 'cancel'),
          style: 'cancel',
        },
        {
          text: t(language, 'logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              console.error('Çıkış hatası:', error);
              Alert.alert(t(language, 'error'), language === 'tr' ? 'Çıkış yapılırken bir hata oluştu' : 'An error occurred during logout');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t(language, 'delete') + ' ' + t(language, 'account'),
      language === 'tr' 
        ? 'Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz silinecektir.'
        : 'Are you sure you want to delete your account? This action cannot be undone and all your data will be deleted.',
      [
        {
          text: t(language, 'cancel'),
          style: 'cancel',
        },
        {
          text: t(language, 'delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              // Firestore'dan kullanıcı verisini sil
              await deleteDoc(doc(db, 'users', user.uid));
              // Firebase Auth'dan kullanıcıyı sil
              await user.delete();
              Alert.alert(t(language, 'success'), t(language, 'accountDeleted'));
            } catch (error) {
              console.error('Hesap silme hatası:', error);
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  t(language, 'securityWarning'),
                  t(language, 'recentLoginRequired')
                );
              } else {
                Alert.alert(t(language, 'error'), t(language, 'accountDeleteError'));
              }
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t(language, 'settings')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t(language, 'account')}</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('AccountSettings')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="person-outline" size={24} color="#000000" />
            </View>
            <Text style={styles.menuText}>{t(language, 'accountInfo')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t(language, 'preferences')}</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('NotificationSettings')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="notifications-outline" size={24} color="#000000" />
            </View>
            <Text style={styles.menuText}>{t(language, 'notificationSettings')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('LanguageSettings')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="language-outline" size={24} color="#000000" />
            </View>
            <Text style={styles.menuText}>{t(language, 'languageSettings')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t(language, 'legal')}</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Terms')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="document-text-outline" size={24} color="#000000" />
            </View>
            <Text style={styles.menuText}>{t(language, 'serviceTerms')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#000000" />
            </View>
            <Text style={styles.menuText}>{t(language, 'privacyPolicy')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t(language, 'actions')}</Text>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>{t(language, 'logout')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>{t(language, 'deleteMyAccount')}</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>{t(language, 'version')} 1.0.0</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  section: {
    marginTop: 28,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    marginBottom: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF3B30',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '700',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  bottomPadding: {
    height: 100,
  },
});

