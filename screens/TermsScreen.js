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

export default function TermsScreen({ navigation }) {
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
        <Text style={styles.headerTitle}>{t(language, 'termsTitle')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>{t(language, 'termsLastUpdated')}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'serviceDescription')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'serviceDescriptionText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'userObligations')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'userObligationsIntro')}
            </Text>
            <Text style={styles.bulletPoint}>{t(language, 'userObligation1')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'userObligation2')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'userObligation3')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'userObligation4')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'userObligation5')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'eventManagement')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'eventManagementIntro')}
            </Text>
            <Text style={styles.bulletPoint}>{t(language, 'eventManagement1')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'eventManagement2')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'eventManagement3')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'eventManagement4')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'contentCopyright')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'contentCopyrightText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'accountSuspension')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'accountSuspensionIntro')}
            </Text>
            <Text style={styles.bulletPoint}>{t(language, 'accountSuspension1')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'accountSuspension2')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'accountSuspension3')}</Text>
            <Text style={styles.bulletPoint}>{t(language, 'accountSuspension4')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'liabilityLimitation')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'liabilityLimitationText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'changes')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'changesText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'contact')}</Text>
            <Text style={styles.paragraph}>
              {t(language, 'contactIntro')}
            </Text>
            <Text style={styles.contactInfo}>
              {t(language, 'contactEmail')}{'\n'}
              {t(language, 'contactWeb')}
            </Text>
          </View>

          <View style={styles.acceptanceBox}>
            <Text style={styles.acceptanceText}>
              {t(language, 'termsAcceptance')}
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
  contactInfo: {
    fontSize: 15,
    color: '#007bff',
    lineHeight: 24,
    marginTop: 8,
  },
  acceptanceBox: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2196f3',
    marginTop: 8,
  },
  acceptanceText: {
    fontSize: 14,
    color: '#0d47a1',
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});

