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
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function PendingApprovalScreen({ navigation }) {
  const user = auth.currentUser;

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
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
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Hoş Geldiniz! 👋</Text>
          <Text style={styles.headerSubtitle}>{user?.displayName}</Text>
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
            <Text style={styles.successIcon}>✨</Text>
          </View>
          <Text style={styles.successTitle}>Kaydınız Başarıyla Alındı!</Text>
          <Text style={styles.successText}>
            Hesabınız şu anda inceleniyor. Onay sürecini takip edebilirsiniz.
          </Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsCardTitle}>İnceleme Durumu</Text>
          
          <View style={styles.stepItem}>
            <View style={[styles.stepDot, styles.stepDotCompleted]}>
              <Text style={styles.stepDotIcon}>✓</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepLabel}>Kayıt Tamamlandı</Text>
              <Text style={styles.stepDescription}>Bilgileriniz başarıyla alındı</Text>
            </View>
          </View>

          <View style={styles.stepConnector} />

          <View style={styles.stepItem}>
            <View style={[styles.stepDot, styles.stepDotActive]}>
              <View style={styles.stepDotPulse} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepLabel}>İnceleme Aşamasında</Text>
              <Text style={styles.stepDescription}>
                Instagram profiliniz kontrol ediliyor
              </Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>⏱️ Devam ediyor</Text>
              </View>
            </View>
          </View>

          <View style={styles.stepConnector} />

          <View style={styles.stepItem}>
            <View style={[styles.stepDot, styles.stepDotPending]}>
              <Text style={styles.stepDotIconPending}>○</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepLabel, styles.stepLabelPending]}>
                Onay Bekliyor
              </Text>
              <Text style={styles.stepDescription}>
                Hesabınız aktif hale gelecek
              </Text>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIconLarge}>⏰</Text>
            <View style={styles.infoHeaderText}>
              <Text style={styles.infoTitle}>Bekleme Süresi</Text>
              <Text style={styles.infoTime}>24-48 saat</Text>
            </View>
          </View>
          <Text style={styles.infoDescription}>
            İnceleme süreci genellikle 1-2 gün içinde tamamlanır. 
            Hesabınız onaylandığında e-posta ile bilgilendirileceksiniz.
          </Text>
        </View>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 İpucu</Text>
          <Text style={styles.tipsText}>
            Instagram profilinizin herkese açık olduğundan emin olun. 
            Bu, onay sürecinin daha hızlı ilerlemesini sağlar.
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={handleContactPress}
          activeOpacity={0.8}
        >
          <Text style={styles.contactButtonIcon}>📧</Text>
          <Text style={styles.contactButtonText}>Bize Ulaşın</Text>
          <Text style={styles.contactButtonArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Sorunuz mu var? Bizimle iletişime geçin
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007bff',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 24,
  },
  successCard: {
    backgroundColor: '#ffffff',
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
    backgroundColor: '#fff3e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 40,
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
    backgroundColor: '#28a745',
  },
  stepDotActive: {
    backgroundColor: '#007bff',
    position: 'relative',
  },
  stepDotPending: {
    backgroundColor: '#e9ecef',
  },
  stepDotIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  stepDotIconPending: {
    fontSize: 24,
    color: '#adb5bd',
  },
  stepDotPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    opacity: 0.3,
  },
  stepInfo: {
    flex: 1,
    paddingTop: 2,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
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
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusBadgeText: {
    fontSize: 13,
    color: '#0d47a1',
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
    backgroundColor: '#fff8e1',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffecb3',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIconLarge: {
    fontSize: 32,
    marginRight: 12,
  },
  infoHeaderText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f57c00',
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
    backgroundColor: '#e8f5e9',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#1b5e20',
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: '#007bff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#007bff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  contactButtonArrow: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#dc3545',
  },
  logoutText: {
    color: '#dc3545',
    fontSize: 17,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
});

