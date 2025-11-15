import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../locales/translations';

export default function AccountSettingsScreen({ navigation }) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Kullanıcı verisi yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t(language, 'unknown');
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>{t(language, 'accountInfo')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t(language, 'profileInfo')}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t(language, 'name')}</Text>
            <Text style={styles.infoValue}>{userData?.name || t(language, 'notSpecified')}</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t(language, 'email')}</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t(language, 'biography')}</Text>
            <Text style={styles.infoValue}>
              {userData?.bio || t(language, 'notAdded')}
            </Text>
          </View>
        </View>

        {/* Account Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t(language, 'accountStatus')}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t(language, 'accountType')}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {userData?.role === 'admin' ? 'Admin' : t(language, 'user')}
              </Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t(language, 'registrationDate')}</Text>
            <Text style={styles.infoValue}>
              {formatDate(userData?.createdAt)}
            </Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t(language, 'accountStatusLabel')}</Text>
            <View style={[
              styles.statusBadge,
              userData?.isActive && styles.statusBadgeActive
            ]}>
              <Text style={[
                styles.statusBadgeText,
                userData?.isActive && styles.statusBadgeTextActive
              ]}>
                {userData?.isActive ? t(language, 'active') : t(language, 'pending')}
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t(language, 'additionalInfo')}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t(language, 'gender')}</Text>
            <Text style={styles.infoValue}>
              {userData?.gender 
                ? (userData.gender === 'Kadın' || userData.gender === 'Woman' 
                    ? (language === 'tr' ? 'Kadın' : 'Woman')
                    : userData.gender === 'Erkek' || userData.gender === 'Man'
                    ? (language === 'tr' ? 'Erkek' : 'Man')
                    : userData.gender)
                : t(language, 'notSpecified')}
            </Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t(language, 'birthYear')}</Text>
            <Text style={styles.infoValue}>{userData?.birthYear || t(language, 'notSpecified')}</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t(language, 'city')}</Text>
            <Text style={styles.infoValue}>{userData?.city || t(language, 'notSpecified')}</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t(language, 'instagram')}</Text>
            <Text style={styles.infoValue}>@{userData?.instagram || t(language, 'notSpecified')}</Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxIcon}>ℹ️</Text>
          <Text style={styles.infoBoxText}>
            {t(language, 'accountInfoNote')}
          </Text>
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
  card: {
    backgroundColor: '#ffffff',
    margin: 24,
    marginBottom: 16,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  badge: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: '#d4edda',
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
  },
  statusBadgeTextActive: {
    color: '#155724',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3cd',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffc107',
    alignItems: 'flex-start',
  },
  infoBoxIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});

