import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { sendAdminApprovalNotification } from '../services/notificationService';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../locales/translations';

export default function AdminPanelScreen() {
  const { language } = useLanguage();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('isPending', '==', true));
      const querySnapshot = await getDocs(q);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      setPendingUsers(users);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      Alert.alert(t(language, 'error'), t(language, 'loadingUsers'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPendingUsers();
  };

  const handleApprove = async (userId, userName) => {
    Alert.alert(
      t(language, 'approveUser'),
      `${userName} ${t(language, 'approveUserConfirm')}`,
      [
        {
          text: t(language, 'cancel'),
          style: 'cancel',
        },
        {
          text: t(language, 'approve'),
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', userId), {
                isActive: true,
                isPending: false,
                approvedAt: new Date().toISOString(),
              });
              
              // Onay bildirimi gönder (onaylanan kullanıcıya)
              await sendAdminApprovalNotification(userId, true, language);
              
              Alert.alert(t(language, 'success'), t(language, 'userApproved'));
              loadPendingUsers();
            } catch (error) {
              console.error('Onaylama hatası:', error);
              Alert.alert(t(language, 'error'), t(language, 'approvalError'));
            }
          },
        },
      ]
    );
  };

  const handleReject = async (userId, userName) => {
    Alert.alert(
      t(language, 'rejectUser'),
      `${userName} ${t(language, 'rejectUserConfirm')}`,
      [
        {
          text: t(language, 'cancel'),
          style: 'cancel',
        },
        {
          text: t(language, 'reject'),
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', userId), {
                isActive: false,
                isPending: false,
                isRejected: true,
                rejectedAt: new Date().toISOString(),
              });
              
              // Reddetme bildirimi gönder (reddedilen kullanıcıya)
              await sendAdminApprovalNotification(userId, false, language);
              
              Alert.alert(t(language, 'success'), t(language, 'userRejected'));
              loadPendingUsers();
            } catch (error) {
              console.error('Reddetme hatası:', error);
              Alert.alert(t(language, 'error'), t(language, 'rejectionError'));
            }
          },
        },
      ]
    );
  };

  const handleOpenInstagram = (instagram) => {
    const username = instagram.replace('@', '');
    Linking.openURL(`https://instagram.com/${username}`);
  };

  const handleLogout = () => {
    Alert.alert(
      t(language, 'logout'),
      t(language, 'logoutConfirm'),
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
              console.log('Admin çıkış yaptı');
            } catch (error) {
              console.error('Çıkış hatası:', error);
              Alert.alert(t(language, 'error'), t(language, 'logoutError'));
            }
          },
        },
      ]
    );
  };

  const renderUserCard = (user) => (
    <View key={user.id} style={styles.userCard}>
      {/* Üst Kısım - Avatar ve Temel Bilgi */}
      <View style={styles.userHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.pendingBadge}>
            <Ionicons name="time-outline" size={10} color="#856404" style={styles.badgeIcon} />
            <Text style={styles.pendingBadgeText}>{t(language, 'waitingApproval')}</Text>
          </View>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.userDateRow}>
            <Ionicons name="calendar-outline" size={14} color="#999999" />
            <Text style={styles.userDate}>
              {new Date(user.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
            </Text>
          </View>
        </View>
      </View>

      {/* Detaylar */}
      <View style={styles.userDetails}>
        <View style={styles.detailCard}>
          <Ionicons name={user.gender === 'Kadın' || user.gender === 'Woman' ? 'woman-outline' : 'man-outline'} size={24} color="#000000" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{t(language, 'gender')}</Text>
            <Text style={styles.detailValue}>{user.gender}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Ionicons name="gift-outline" size={24} color="#000000" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{t(language, 'birthYear')}</Text>
            <Text style={styles.detailValue}>{user.birthYear}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Ionicons name="location-outline" size={24} color="#000000" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{t(language, 'city')}</Text>
            <Text style={styles.detailValue}>{user.city}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.instagramCard}
          onPress={() => handleOpenInstagram(user.instagram)}
        >
          <Ionicons name="logo-instagram" size={24} color="#E1306C" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Instagram</Text>
            <Text style={styles.instagramLink}>{user.instagram}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>
      </View>

      {/* Onay/Red Butonları */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleReject(user.id, user.name)}
        >
          <Ionicons name="close-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.rejectButtonText}>{t(language, 'reject')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => handleApprove(user.id, user.name)}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.approveButtonText}>{t(language, 'approve')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>{t(language, 'loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.adminText}>Admin</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
        
          <Text style={styles.headerTitle}>{t(language, 'adminPanel')}</Text>
        <Text style={styles.headerSubtitle}>
          {pendingUsers.length > 0 
            ? `${pendingUsers.length} ${t(language, 'usersWaitingApproval')}`
            : t(language, 'allUsersApproved')
          }
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {pendingUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="checkmark-done-circle" size={72} color="#4CAF50" />
              </View>
              <Text style={styles.emptyTitle}>{t(language, 'noPendingUsers')}</Text>
              <Text style={styles.emptyText}>
                {t(language, 'allRegistrationsReviewed')}
              </Text>
            </View>
          ) : (
            pendingUsers.map(renderUserCard)
          )}
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <>
              <Ionicons name="refresh" size={20} color="#000000" style={styles.refreshIcon} />
              <Text style={styles.refreshButtonText}>{t(language, 'refresh')}</Text>
            </>
          )}
        </TouchableOpacity>

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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  adminBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    backgroundColor: '#F5F5F5',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pendingBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC107',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
    gap: 3,
  },
  badgeIcon: {
    marginRight: 0,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#856404',
  },
  userInfo: {
    flex: 1,
    paddingTop: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  userDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userDate: {
    fontSize: 13,
    color: '#999999',
  },
  userDetails: {
    marginBottom: 20,
    gap: 10,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  instagramCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F7',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0E6',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  instagramLink: {
    fontSize: 15,
    color: '#E1306C',
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F44336',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 0,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  approveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    padding: 48,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
  },
  refreshButton: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#000000',
    gap: 8,
  },
  refreshIcon: {
    marginRight: 0,
  },
  refreshButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 40,
  },
});

