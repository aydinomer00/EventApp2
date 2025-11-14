import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function HelpSupportScreen({ navigation }) {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'Nasıl etkinlik oluşturabilirim?',
      answer: 'Ana sayfadaki "Yeni Etkinlik" butonuna tıklayın. Adım adım form ile etkinlik detaylarını doldurun ve yayınlayın.',
    },
    {
      id: 2,
      question: 'Bir etkinliğe nasıl katılabilirim?',
      answer: 'Ana sayfadaki etkinliklere tıklayın, detayları inceleyin ve "Katıl" butonuna basın. Organizatör onayladıktan sonra etkinliğe katılmış olursunuz.',
    },
    {
      id: 3,
      question: 'Etkinliğime kimler katılabilir?',
      answer: 'Etkinlik oluştururken "Kimler Katılabilir?" bölümünde herkes, sadece kadınlar veya sadece erkekler seçeneklerinden birini seçebilirsiniz.',
    },
    {
      id: 4,
      question: 'Katılımcı sayısını nasıl belirlerim?',
      answer: 'Etkinlik oluşturma sırasında "Maksimum Katılımcı" alanından istediğiniz katılımcı sayısını belirleyebilirsiniz.',
    },
    {
      id: 5,
      question: 'Mesajlaşma nasıl çalışır?',
      answer: 'Bir etkinliğe katıldığınızda o etkinlik için özel grup sohbeti oluşturulur. Tüm katılımcılar bu grup üzerinden mesajlaşabilir.',
    },
    {
      id: 6,
      question: 'Etkinliğimi nasıl iptal edebilirim?',
      answer: 'Oluşturduğunuz etkinliğin detay sayfasına gidin, sağ üstteki menüden "Etkinliği Sil" seçeneğini kullanabilirsiniz.',
    },
    {
      id: 7,
      question: 'Katıldığım etkinlikten nasıl çıkabilirim?',
      answer: 'Etkinlik detay sayfasında "Katılımı İptal Et" butonuna tıklayarak etkinlikten ayrılabilirsiniz.',
    },
    {
      id: 8,
      question: 'Değerlendirme sistemi nasıl çalışır?',
      answer: 'Etkinlik tamamlandıktan sonra, organizatörü ve etkinliği değerlendirebilirsiniz. Bu değerlendirmeler güvenilir kullanıcı rozetine katkı sağlar.',
    },
  ];

  const contactOptions = [
    {
      id: 1,
      icon: 'mail-outline',
      title: 'E-posta',
      subtitle: 'destek@event2.com',
      action: () => Linking.openURL('mailto:destek@event2.com'),
    },
    {
      id: 2,
      icon: 'logo-instagram',
      title: 'Instagram',
      subtitle: '@event2app',
      action: () => Linking.openURL('https://instagram.com/event2app'),
    },
    {
      id: 3,
      icon: 'logo-twitter',
      title: 'Twitter',
      subtitle: '@event2app',
      action: () => Linking.openURL('https://twitter.com/event2app'),
    },
    {
      id: 4,
      icon: 'chatbubble-ellipses-outline',
      title: 'Canlı Destek',
      subtitle: 'Pazartesi-Cuma, 09:00-18:00',
      action: () => Alert.alert('Canlı Destek', 'Canlı destek özelliği yakında aktif olacak!'),
    },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
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
        <Text style={styles.headerTitle}>Yardım & Destek</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons name="help-circle" size={64} color="#000000" />
          </View>
          <Text style={styles.heroTitle}>Size nasıl yardımcı olabiliriz?</Text>
          <Text style={styles.heroSubtitle}>
            Sık sorulan sorulara göz atın veya bizimle iletişime geçin
          </Text>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color="#000000" />
            <Text style={styles.sectionTitle}>Sık Sorulan Sorular</Text>
          </View>

          <View style={styles.faqContainer}>
            {faqs.map((faq) => (
              <View key={faq.id}>
                <TouchableOpacity
                  style={styles.faqItem}
                  onPress={() => toggleFaq(faq.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqQuestion}>
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                    <Ionicons
                      name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#666666"
                    />
                  </View>
                  {expandedFaq === faq.id && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles-outline" size={24} color="#000000" />
            <Text style={styles.sectionTitle}>İletişim Kanalları</Text>
          </View>

          <View style={styles.contactContainer}>
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.contactItem}
                onPress={option.action}
                activeOpacity={0.7}
              >
                <View style={styles.contactIconContainer}>
                  <Ionicons name={option.icon} size={24} color="#000000" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>{option.title}</Text>
                  <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Help Section */}
        <View style={styles.section}>
          <View style={styles.quickHelpCard}>
            <Ionicons name="bulb-outline" size={32} color="#FFA726" />
            <Text style={styles.quickHelpTitle}>İpucu</Text>
            <Text style={styles.quickHelpText}>
              Daha iyi bir deneyim için profilinizi eksiksiz doldurun ve etkinlik oluştururken tüm detayları belirtin.
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
  heroIcon: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
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
  faqContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  contactContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 13,
    color: '#666666',
  },
  quickHelpCard: {
    backgroundColor: '#FFF8E1',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickHelpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginTop: 12,
    marginBottom: 8,
  },
  quickHelpText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});

