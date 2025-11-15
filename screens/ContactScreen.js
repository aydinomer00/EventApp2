import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function ContactScreen({ navigation }) {
  const handleEmailPress = () => {
    Linking.openURL('mailto:info@eventapp.com');
  };

  const handleInstagramPress = () => {
    Linking.openURL('https://instagram.com/aydinomer00');
  };

  const handleWebsitePress = () => {
    Linking.openURL('https://www.eventapp.com');
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
        <Text style={styles.headerTitle}>İletişim</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="mail" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Bize Ulaşın</Text>
          <Text style={styles.heroSubtitle}>
            Size yardımcı olmak için buradayız!
          </Text>
        </View>

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Şirket Bilgileri</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="business" size={24} color="#000000" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Şirket Adı</Text>
                <Text style={styles.infoValue}>Event App Inc.</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.infoRow}
              onPress={handleEmailPress}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="mail-outline" size={24} color="#000000" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>E-posta</Text>
                <Text style={styles.infoValueLink}>info@eventapp.com</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.infoRow}
              onPress={handleWebsitePress}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="globe-outline" size={24} color="#000000" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Web Sitesi</Text>
                <Text style={styles.infoValueLink}>www.eventapp.com</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sosyal Medya</Text>
          
          <TouchableOpacity 
            style={styles.socialCard}
            onPress={handleInstagramPress}
            activeOpacity={0.7}
          >
            <View style={styles.socialContent}>
              <View style={styles.socialIconContainer}>
                <Ionicons name="logo-instagram" size={32} color="#E1306C" />
              </View>
              <View style={styles.socialInfo}>
                <Text style={styles.socialName}>Instagram</Text>
                <Text style={styles.socialHandle}>@aydinomer00</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        {/* Support Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destek Saatleri</Text>
          
          <View style={styles.hoursCard}>
            <View style={styles.hourRow}>
              <Text style={styles.dayText}>Pazartesi - Cuma</Text>
              <Text style={styles.timeText}>09:00 - 18:00</Text>
            </View>
            <View style={styles.hourDivider} />
            <View style={styles.hourRow}>
              <Text style={styles.dayText}>Cumartesi - Pazar</Text>
              <Text style={styles.timeText}>Kapalı</Text>
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.footerBox}>
          <Ionicons name="chatbubbles" size={28} color="#1976D2" style={styles.footerIcon} />
          <Text style={styles.footerText}>
            Sorularınız için bize e-posta gönderin, en kısa sürede size dönüş yapacağız!
          </Text>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
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
    fontSize: 20,
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
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
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
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  infoValueLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 16,
  },
  socialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  socialContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  socialIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#FFE0E6',
  },
  socialInfo: {
    flex: 1,
  },
  socialName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  socialHandle: {
    fontSize: 15,
    color: '#E1306C',
    fontWeight: '600',
  },
  hoursCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayText: {
    fontSize: 15,
    color: '#495057',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 15,
    color: '#28a745',
    fontWeight: '600',
  },
  hourDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 12,
  },
  footerBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 16,
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  footerIcon: {
    marginRight: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});

