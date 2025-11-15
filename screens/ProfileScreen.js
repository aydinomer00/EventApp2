import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../locales/translations';

export default function ProfileScreen({ navigation }) {
  const user = auth.currentUser;
  const { language } = useLanguage();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });
    loadUserData();
    return unsubscribe;
  }, [navigation]);

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
              console.log('Çıkış yapıldı');
            } catch (error) {
              console.error('Çıkış hatası:', error);
              Alert.alert(t(language, 'error'), language === 'tr' ? 'Çıkış yapılırken bir hata oluştu' : 'An error occurred during logout');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {userData?.photoURL || user?.photoURL ? (
                <Image
                  source={{ uri: userData?.photoURL || user?.photoURL }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.userName}>{user?.displayName || 'Kullanıcı'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            
            {/* Rating Section */}
            {userData?.averageRating && userData.reviewCount > 0 && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingStars}>
                  {'⭐'.repeat(Math.round(userData.averageRating))}
                </Text>
                <Text style={styles.ratingText}>
                  {userData.averageRating} ({userData.reviewCount} değerlendirme)
                </Text>
              </View>
            )}

            {/* Badges Section */}
            {userData?.badges?.trustedOrganizer && (
              <View style={styles.badgesContainer}>
                <View style={styles.badge}>
                  <Text style={styles.badgeIcon}>✓</Text>
                  <Text style={styles.badgeText}>Güvenilir Organizatör</Text>
                </View>
              </View>
            )}
            
            {userData?.bio && (
              <Text style={styles.bio}>{userData.bio}</Text>
            )}
          </View>

          {/* Edit Profile Button */}
          <View style={styles.editButtonContainer}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={styles.editButtonText}>{t(language, 'editProfile')}</Text>
            </TouchableOpacity>
          </View>

        {/* Profile Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t(language, 'events')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t(language, 'participations')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t(language, 'followers')}</Text>
          </View>
        </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            <Text style={styles.menuTitle}>{t(language, 'general')}</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={styles.menuIcon}>
                <Ionicons name="settings-outline" size={22} color="#000000" />
              </View>
              <Text style={styles.menuText}>{t(language, 'settings')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <View style={styles.menuIcon}>
                <Ionicons name="help-circle-outline" size={22} color="#000000" />
              </View>
              <Text style={styles.menuText}>{t(language, 'helpSupport')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('About')}
            >
              <View style={styles.menuIcon}>
                <Ionicons name="information-circle-outline" size={22} color="#000000" />
              </View>
              <Text style={styles.menuText}>{t(language, 'about')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>{t(language, 'logout')}</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
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
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  ratingStars: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  badgeIcon: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '700',
  },
  bio: {
    fontSize: 15,
    color: '#333333',
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 32,
    lineHeight: 22,
  },
  editButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  editButton: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 24,
    marginTop: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999999',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 18,
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
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuEmoji: {
    fontSize: 24,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  menuArrow: {
    fontSize: 20,
    color: '#cccccc',
  },
  logoutButton: {
    marginHorizontal: 24,
    marginTop: 32,
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 100,
  },
});

