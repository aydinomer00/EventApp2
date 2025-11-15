import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../locales/translations';

export default function PendingApprovalScreen({ navigation }) {
  const user = auth.currentUser;
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
            }
          },
        },
      ]
    );
  };

  const handleContactPress = () => {
    navigation.navigate('Contact');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {language === 'tr' ? 'Hoş Geldiniz' : 'Welcome'}, {user?.displayName || t(language, 'User')}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Card */}
        <View style={styles.successCard}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>{t(language, 'registrationSuccess')}</Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsCardTitle}>{t(language, 'reviewStatus')}</Text>
          
          <View style={styles.stepItem}>
            <View style={[styles.stepDot, styles.stepDotCompleted]}>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepLabel}>{t(language, 'registrationComplete')}</Text>
              <Text style={styles.stepDescription}>{t(language, 'infoReceived')}</Text>
            </View>
          </View>

          <View style={styles.stepConnector} />

          <View style={styles.stepItem}>
            <View style={[styles.stepDot, styles.stepDotActive]}>
              <View style={styles.stepDotPulse} />
              <Ionicons name="time-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.stepInfo}>
              <View style={styles.stepLabelRow}>
                <Text style={styles.stepLabel}>{t(language, 'underReview')}</Text>
                <View style={styles.statusBadge}>
                  <Ionicons name="hourglass-outline" size={12} color="#000000" />
                  <Text style={styles.statusBadgeText}>{t(language, 'inProgress')}</Text>
                </View>
              </View>
              <Text style={styles.stepDescription}>
                {t(language, 'instaCheck')}
              </Text>
            </View>
          </View>

          <View style={styles.stepConnector} />

          <View style={styles.stepItem}>
            <View style={[styles.stepDot, styles.stepDotPending]}>
              <Ionicons name="ellipse-outline" size={20} color="#999999" />
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepLabel, styles.stepLabelPending]}>
                {t(language, 'waitingApproval')}
              </Text>
              <Text style={styles.stepDescription}>
                {t(language, 'accountWillActivate')}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="time-outline" size={32} color="#FFA726" />
            </View>
            <View style={styles.infoHeaderText}>
              <Text style={styles.infoTitle}>{t(language, 'waitTime')}</Text>
              <Text style={styles.infoTime}>{t(language, 'hours24to48')}</Text>
            </View>
          </View>
          <Text style={styles.infoDescription}>
            {t(language, 'reviewProcess')}
          </Text>
        </View>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color="#4CAF50" />
            <Text style={styles.tipsTitle}>{t(language, 'tip')}</Text>
          </View>
          <Text style={styles.tipsText}>
            {t(language, 'instaPublicTip')}
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={handleContactPress}
          activeOpacity={0.8}
        >
          <Ionicons name="mail-outline" size={22} color="#FFFFFF" style={styles.contactButtonIcon} />
          <Text style={styles.contactButtonText}>{t(language, 'contactUs')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>{t(language, 'logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 24,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
  },
  stepsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  stepsCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepDotActive: {
    backgroundColor: '#000000',
    position: 'relative',
  },
  stepDotPending: {
    backgroundColor: '#E9ECEF',
  },
  stepDotPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    opacity: 0.2,
  },
  stepInfo: {
    flex: 1,
    paddingTop: 2,
  },
  stepLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  stepLabelPending: {
    color: '#6c757d',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  statusBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
  },
  stepConnector: {
    width: 2,
    height: 20,
    backgroundColor: '#e9ecef',
    marginLeft: 19,
    marginVertical: 8,
  },
  infoCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFECB3',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoHeaderText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F57C00',
    marginBottom: 4,
  },
  infoTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  infoDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  tipsText: {
    fontSize: 14,
    color: '#1B5E20',
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButtonIcon: {
    marginRight: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: '#000000',
  },
  logoutText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

