import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function TermsScreen({ navigation }) {
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
        <Text style={styles.headerTitle}>Hizmet Şartları</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Son Güncelleme: 12 Kasım 2025</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Hizmet Tanımı</Text>
            <Text style={styles.paragraph}>
              Event App ("Uygulama"), kullanıcıların etkinlik oluşturmasına, 
              katılmasına ve yönetmesine olanak tanıyan bir mobil platformdur. 
              Uygulamayı kullanarak, bu şartları kabul etmiş sayılırsınız.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Kullanıcı Yükümlülükleri</Text>
            <Text style={styles.paragraph}>
              Uygulamayı kullanırken:
            </Text>
            <Text style={styles.bulletPoint}>• Doğru ve güncel bilgiler sağlamalısınız</Text>
            <Text style={styles.bulletPoint}>• Hesap güvenliğinizden sorumlu olmalısınız</Text>
            <Text style={styles.bulletPoint}>• Yasa dışı içerik paylaşmamalısınız</Text>
            <Text style={styles.bulletPoint}>• Diğer kullanıcılara saygılı davranmalısınız</Text>
            <Text style={styles.bulletPoint}>• Telif haklarına saygı göstermelisiniz</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Etkinlik Oluşturma ve Yönetimi</Text>
            <Text style={styles.paragraph}>
              Etkinlik oluştururken:
            </Text>
            <Text style={styles.bulletPoint}>• Doğru ve eksiksiz bilgi vermelisiniz</Text>
            <Text style={styles.bulletPoint}>• Yanıltıcı içerik oluşturmamalısınız</Text>
            <Text style={styles.bulletPoint}>• Etkinliğinizin yasal olduğundan emin olmalısınız</Text>
            <Text style={styles.bulletPoint}>• Katılımcıların güvenliğinden sorumlusunuz</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. İçerik ve Telif Hakları</Text>
            <Text style={styles.paragraph}>
              Uygulamaya yüklediğiniz içeriğin telif haklarına sahip olmalısınız. 
              Yüklediğiniz içerik için tüm sorumluluk size aittir. Uygulama, 
              uygunsuz içerikleri kaldırma hakkını saklı tutar.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Hesap Askıya Alma ve Kapatma</Text>
            <Text style={styles.paragraph}>
              Şu durumlarda hesabınız askıya alınabilir veya kapatılabilir:
            </Text>
            <Text style={styles.bulletPoint}>• Hizmet şartlarının ihlali</Text>
            <Text style={styles.bulletPoint}>• Yanıltıcı bilgi paylaşımı</Text>
            <Text style={styles.bulletPoint}>• Diğer kullanıcıları taciz etme</Text>
            <Text style={styles.bulletPoint}>• Spam veya kötü amaçlı aktiviteler</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Sorumluluk Sınırlaması</Text>
            <Text style={styles.paragraph}>
              Event App, kullanıcılar tarafından oluşturulan etkinliklerden sorumlu değildir. 
              Etkinliklere katılım tamamen kullanıcıların kendi sorumluluğundadır. 
              Uygulama, etkinliklerin güvenliği, kalitesi veya yasallığı konusunda 
              garanti vermez.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Değişiklikler</Text>
            <Text style={styles.paragraph}>
              Bu hizmet şartları zaman zaman güncellenebilir. Önemli değişiklikler 
              olduğunda kullanıcılar bilgilendirilecektir. Güncellemelerden sonra 
              uygulamayı kullanmaya devam etmeniz, yeni şartları kabul ettiğiniz 
              anlamına gelir.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. İletişim</Text>
            <Text style={styles.paragraph}>
              Hizmet şartları hakkında sorularınız için:
            </Text>
            <Text style={styles.contactInfo}>
              E-posta: info@eventapp.com{'\n'}
              Web: www.eventapp.com
            </Text>
          </View>

          <View style={styles.acceptanceBox}>
            <Text style={styles.acceptanceText}>
              Bu uygulamayı kullanarak yukarıdaki hizmet şartlarını okuduğunuzu 
              ve kabul ettiğinizi beyan edersiniz.
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

