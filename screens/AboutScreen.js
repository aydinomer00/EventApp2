import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen({ navigation }) {
  const features = [
    {
      id: 1,
      icon: 'calendar-outline',
      title: 'Kolay Etkinlik Oluşturma',
      description: 'Birkaç adımda etkinlik oluştur, insanları bir araya getir',
    },
    {
      id: 2,
      icon: 'people-outline',
      title: 'Sosyal Bağlantılar',
      description: 'Yeni insanlarla tanış, ortak ilgi alanlarına sahip kişilerle buluş',
    },
    {
      id: 3,
      icon: 'chatbubbles-outline',
      title: 'Grup Sohbetleri',
      description: 'Her etkinlik için özel mesajlaşma odaları',
    },
    {
      id: 4,
      icon: 'shield-checkmark-outline',
      title: 'Güvenli Ortam',
      description: 'Değerlendirme sistemi ile güvenilir kullanıcılar',
    },
    {
      id: 5,
      icon: 'notifications-outline',
      title: 'Akıllı Bildirimler',
      description: 'Etkinlik hatırlatıcıları ve güncellemeler',
    },
    {
      id: 6,
      icon: 'filter-outline',
      title: 'Özelleştirilebilir',
      description: 'Yaş, cinsiyet ve kategori filtrelemeleri',
    },
  ];

  const teamMembers = [
    {
      id: 1,
      name: 'Event2 Ekibi',
      role: 'Geliştirici & Tasarımcı',
      icon: 'people',
    },
  ];

  const stats = [
    { id: 1, value: '1000+', label: 'Kullanıcı' },
    { id: 2, value: '5000+', label: 'Etkinlik' },
    { id: 3, value: '10000+', label: 'Bağlantı' },
  ];

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
        <Text style={styles.headerTitle}>Uygulama Hakkında</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="calendar" size={64} color="#000000" />
          </View>
          <Text style={styles.appName}>Event2</Text>
          <Text style={styles.version}>Versiyon 1.0.0</Text>
          <Text style={styles.tagline}>
            İnsanları bir araya getiren, anlamlı bağlantılar kurmayı sağlayan sosyal etkinlik platformu
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          {stats.map((stat) => (
            <View key={stat.id} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="rocket-outline" size={24} color="#000000" />
            <Text style={styles.sectionTitle}>Misyonumuz</Text>
          </View>
          <View style={styles.missionCard}>
            <Text style={styles.missionText}>
              Event2, insanların ortak ilgi alanları etrafında bir araya gelip, yeni arkadaşlıklar kurmasını ve unutulmaz anılar biriktirmesini sağlayan bir platformdur. Sosyalleşmeyi kolaylaştırarak toplulukları güçlendirmeyi ve herkesin hayatına değer katmayı hedefliyoruz.
            </Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={24} color="#000000" />
            <Text style={styles.sectionTitle}>Özelliklerimiz</Text>
          </View>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <View key={feature.id} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon} size={28} color="#000000" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Team Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={24} color="#000000" />
            <Text style={styles.sectionTitle}>Ekibimiz</Text>
          </View>
          <View style={styles.teamContainer}>
            {teamMembers.map((member) => (
              <View key={member.id} style={styles.teamCard}>
                <View style={styles.teamAvatar}>
                  <Ionicons name={member.icon} size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.teamName}>{member.name}</Text>
                <Text style={styles.teamRole}>{member.role}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="share-social-outline" size={24} color="#000000" />
            <Text style={styles.sectionTitle}>Bizi Takip Edin</Text>
          </View>
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://instagram.com/event2app')}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-instagram" size={24} color="#E4405F" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://twitter.com/event2app')}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://facebook.com/event2app')}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-facebook" size={24} color="#4267B2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://linkedin.com/company/event2app')}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-linkedin" size={24} color="#0077B5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.section}>
          <View style={styles.legalContainer}>
            <TouchableOpacity
              style={styles.legalButton}
              onPress={() => navigation.navigate('Terms')}
              activeOpacity={0.7}
            >
              <Text style={styles.legalText}>Kullanım Koşulları</Text>
              <Ionicons name="chevron-forward" size={18} color="#999999" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.legalButton}
              onPress={() => navigation.navigate('PrivacyPolicy')}
              activeOpacity={0.7}
            >
              <Text style={styles.legalText}>Gizlilik Politikası</Text>
              <Ionicons name="chevron-forward" size={18} color="#999999" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Event2. Tüm hakları saklıdır.
          </Text>
          <Text style={styles.footerSubtext}>
            Sevgiyle İstanbul'dan yapıldı ❤️
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
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    fontWeight: '700',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
  },
  missionText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    width: '48%',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
  },
  teamContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  teamCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '100%',
  },
  teamAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  teamRole: {
    fontSize: 13,
    color: '#666666',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  legalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  legalButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  legalText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 13,
    color: '#999999',
  },
  bottomPadding: {
    height: 40,
  },
});

