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
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { sendAdminApprovalNotification } from '../services/notificationService';

export default function AdminPanelScreen() {
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
      Alert.alert('Hata', 'Kullanıcılar yüklenirken bir hata oluştu');
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
      'Kullanıcıyı Onayla',
      `${userName} adlı kullanıcıyı onaylamak istediğinize emin misiniz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Onayla',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', userId), {
                isActive: true,
                isPending: false,
                approvedAt: new Date().toISOString(),
              });
              
              // Onay bildirimi gönder
              await sendAdminApprovalNotification(true);
              
              Alert.alert('Başarılı', 'Kullanıcı onaylandı! Bildirim gönderildi.');
              loadPendingUsers();
            } catch (error) {
              console.error('Onaylama hatası:', error);
              Alert.alert('Hata', 'Kullanıcı onaylanırken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const handleReject = async (userId, userName) => {
    Alert.alert(
      'Kullanıcıyı Reddet',
      `${userName} adlı kullanıcıyı reddetmek istediğinize emin misiniz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Reddet',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', userId), {
                isActive: false,
                isPending: false,
                isRejected: true,
                rejectedAt: new Date().toISOString(),
              });
              
              // Reddetme bildirimi gönder
              await sendAdminApprovalNotification(false);
              
              Alert.alert('Başarılı', 'Kullanıcı reddedildi. Bildirim gönderildi.');
              loadPendingUsers();
            } catch (error) {
              console.error('Reddetme hatası:', error);
              Alert.alert('Hata', 'Kullanıcı reddedilirken bir hata oluştu');
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
      'Çıkış Yap',
      'Admin panelinden çıkış yapmak istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              console.log('Admin çıkış yaptı');
            } catch (error) {
              console.error('Çıkış hatası:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
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
            <Text style={styles.pendingBadgeText}>Bekliyor</Text>
          </View>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userDate}>
            📅 {new Date(user.createdAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>
      </View>

      {/* Detaylar */}
      <View style={styles.userDetails}>
        <View style={styles.detailCard}>
          <Text style={styles.detailIcon}>👤</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Cinsiyet</Text>
            <Text style={styles.detailValue}>{user.gender}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailIcon}>🎂</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Doğum Yılı</Text>
            <Text style={styles.detailValue}>{user.birthYear}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailIcon}>📍</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Şehir</Text>
            <Text style={styles.detailValue}>{user.city}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.instagramCard}
          onPress={() => handleOpenInstagram(user.instagram)}
        >
          <Text style={styles.detailIcon}>📸</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Instagram</Text>
            <Text style={styles.instagramLink}>{user.instagram}</Text>
          </View>
          <Text style={styles.openIcon}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Onay/Red Butonları */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleReject(user.id, user.name)}
        >
          <Text style={styles.rejectButtonText}>❌ Reddet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => handleApprove(user.id, user.name)}
        >
          <Text style={styles.approveButtonText}>✅ Onayla</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.adminBadge}>
            <Text style={styles.adminIcon}>👑</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>
          {pendingUsers.length > 0 
            ? `${pendingUsers.length} kullanıcı onay bekliyor`
            : 'Tüm kullanıcılar onaylandı'
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
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyTitle}>Bekleyen Kullanıcı Yok</Text>
              <Text style={styles.emptyText}>
                Tüm kayıtlar incelendi
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
            <ActivityIndicator color="#007bff" />
          ) : (
            <Text style={styles.refreshButtonText}>🔄 Yenile</Text>
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
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
  },
  header: {
    backgroundColor: '#6f42c1',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  adminBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminIcon: {
    fontSize: 20,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
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
    shadowColor: '#6f42c1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
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
    backgroundColor: '#6f42c1',
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
    backgroundColor: '#ffc107',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
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
    color: '#6c757d',
    marginBottom: 6,
  },
  userDate: {
    fontSize: 13,
    color: '#adb5bd',
  },
  userDetails: {
    marginBottom: 20,
    gap: 10,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 12,
  },
  instagramCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  detailIcon: {
    fontSize: 24,
    marginRight: 12,
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
    color: '#007bff',
    fontWeight: '700',
  },
  openIcon: {
    fontSize: 28,
    color: '#adb5bd',
    fontWeight: '300',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#dc3545',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#28a745',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#28a745',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  approveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
  },
  refreshButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#007bff',
  },
  refreshButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 40,
  },
});

