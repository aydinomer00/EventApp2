import React, { useState, useEffect } from 'react';
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
import { useLanguage } from '../context/LanguageContext';
import { t } from '../locales/translations';

export default function LanguageSettingsScreen({ navigation }) {
  const { language, changeLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷', enabled: true },
    { code: 'en', name: 'English', flag: '🇬🇧', enabled: true },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', enabled: false },
    { code: 'fr', name: 'Français', flag: '🇫🇷', enabled: false },
    { code: 'es', name: 'Español', flag: '🇪🇸', enabled: false },
    { code: 'it', name: 'Italiano', flag: '🇮🇹', enabled: false },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', enabled: false },
  ];

  const handleLanguageChange = async (languageCode) => {
    if (languages.find(l => l.code === languageCode)?.enabled) {
      setSelectedLanguage(languageCode);
      await changeLanguage(languageCode);
      Alert.alert(
        t(languageCode, 'success'),
        languageCode === 'tr' 
          ? 'Dil başarıyla değiştirildi!' 
          : 'Language changed successfully!'
      );
    } else {
      Alert.alert(
        t(language, 'warning'),
        t(language, 'selectLanguage') === 'Select app language. Changes will take effect immediately.' 
          ? 'This language will be available soon.' 
          : 'Bu dil yakında eklenecektir.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t(language, 'languageTitle')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.description}>
            {t(language, 'selectLanguage')}
          </Text>

          <View style={styles.languageList}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageItem,
                  selectedLanguage === lang.code && styles.languageItemActive,
                  !lang.enabled && styles.languageItemDisabled,
                ]}
                onPress={() => handleLanguageChange(lang.code)}
                activeOpacity={0.7}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageName,
                  selectedLanguage === lang.code && styles.languageNameActive,
                  !lang.enabled && styles.languageNameDisabled,
                ]}>
                  {lang.name}
                </Text>
                {!lang.enabled && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>
                      {language === 'tr' ? 'Yakında' : 'Soon'}
                    </Text>
                  </View>
                )}
                {selectedLanguage === lang.code && lang.enabled && (
                  <Ionicons name="checkmark-circle" size={28} color="#34c759" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#007AFF" />
            <Text style={styles.infoBoxText}>
              {language === 'tr' 
                ? 'Şu anda Türkçe ve İngilizce dil desteği mevcuttur. Diğer diller yakında eklenecektir.' 
                : 'Currently Turkish and English are available. Other languages will be added soon.'}
            </Text>
          </View>
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
    backgroundColor: '#F5F5F5',
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
  content: {
    padding: 24,
    paddingTop: 32,
  },
  description: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 24,
  },
  languageList: {
    marginBottom: 24,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  languageItemActive: {
    backgroundColor: '#000000',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    elevation: 5,
  },
  languageItemDisabled: {
    opacity: 0.5,
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  languageNameActive: {
    color: '#ffffff',
  },
  languageNameDisabled: {
    color: '#999999',
  },
  comingSoonBadge: {
    backgroundColor: '#FFE5B4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF8C00',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});

