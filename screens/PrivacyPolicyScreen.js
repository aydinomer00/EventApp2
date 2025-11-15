import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../locales/translations';

export default function PrivacyPolicyScreen({ navigation }) {
  const { language } = useLanguage();
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t(language, 'privacyTitle')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>{t(language, 'privacyLastUpdated')}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'privacyIntroduction')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'privacyIntroductionText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'dataCollection')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'dataCollectionIntro')}
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>{t(language, 'accountInfoLabel')}</Text> {t(language, 'accountInfoDetails')}
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>{t(language, 'profileInfoLabel')}</Text> {t(language, 'profileInfoDetails')}
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>{t(language, 'eventDataLabel')}</Text> {t(language, 'eventDataDetails')}
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>{t(language, 'deviceInfoLabel')}</Text> {t(language, 'deviceInfoDetails')}
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>{t(language, 'locationInfoLabel')}</Text> {t(language, 'locationInfoDetails')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'dataUsage')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'dataUsageIntro')}
            </Text>
            <Text style={styles.bulletPoint}>{t(language, 'dataUsage1')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'dataUsage2')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'dataUsage3')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'dataUsage4')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'dataUsage5')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'dataUsage6')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'dataSharing')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'dataSharingIntro')}
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>{t(language, 'otherUsers')}</Text> {t(language, 'otherUsersDetails')}
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>{t(language, 'serviceProviders')}</Text> {t(language, 'serviceProvidersDetails')}
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>{t(language, 'legalRequirements')}</Text> {t(language, 'legalRequirementsDetails')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'dataSecurity')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'dataSecurityIntro')}
            </Text>
            <Text style={styles.bulletPoint}>{t(language, 'dataSecurity1')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'dataSecurity2')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'dataSecurity3')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'dataSecurity4')}</Text>
            <Text style={styles.paragraph} style={{marginTop: 12}}>
              {t(language, 'dataSecurityNote')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'cookiesTracking')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'cookiesTrackingIntro')}
            </Text>
            <Text style={styles.bulletPoint}>{t(language, 'cookiesTracking1')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'cookiesTracking2')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'cookiesTracking3')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'yourRights')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'yourRightsIntro')}
            </Text>
            <Text style={styles.bulletPoint}>{t(language, 'yourRights1')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'yourRights2')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'yourRights3')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'yourRights4')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'yourRights5')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'childrenPrivacy')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'childrenPrivacyText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'privacyChanges')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'privacyChangesText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'privacyContact')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'privacyContactIntro')}
            </Text>
            <Text style={styles.contactInfo}>
              {t(language, 'privacyContactEmail')}{'\n'}
              {t(language, 'privacyContactAddress')}{'\n'}
              {t(language, 'privacyContactWeb')}
            </Text>
          </View>

          <View style={styles.privacyBox}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <View style={styles.privacyTextContainer}>
              <Text style={styles.privacyTitle}>{t(language, 'privacyImportant')}</Text>
              <Text style={styles.privacyText}>
                {t(language, 'privacyImportantText')}
              </Text>
            </View>
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
    paddingTop: 24,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 24,
    marginLeft: 8,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
  },
  contactInfo: {
    fontSize: 15,
    color: '#007bff',
    lineHeight: 24,
    marginTop: 8,
  },
  privacyBox: {
    backgroundColor: '#d4edda',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#28a745',
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  privacyIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 6,
  },
  privacyText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});

