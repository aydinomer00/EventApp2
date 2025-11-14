import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function PrivacyPolicyScreen({ navigation }) {
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
        <Text style={styles.headerTitle}>Gizlilik Politikası</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Son Güncelleme: 12 Kasım 2025</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Giriş</Text>
            <Text style={styles.paragraph}>
              Event App olarak gizliliğinize önem veriyoruz. Bu politika, 
              kişisel bilgilerinizi nasıl topladığımızı, kullandığımızı ve 
              koruduğumuzu açıklamaktadır.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Topladığımız Bilgiler</Text>
            <Text style={styles.paragraph}>
              Uygulamamızı kullanırken şu bilgileri topluyoruz:
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>• Hesap Bilgileri:</Text> İsim, e-posta, 
              doğum yılı, cinsiyet, şehir
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>• Profil Bilgileri:</Text> Biyografi, 
              sosyal medya hesapları
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>• Etkinlik Verileri:</Text> Oluşturduğunuz 
              ve katıldığınız etkinlikler
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>• Cihaz Bilgileri:</Text> IP adresi, 
              cihaz türü, işletim sistemi
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>• Konum Bilgileri:</Text> Etkinlik konumları 
              (opsiyonel)
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Bilgilerin Kullanımı</Text>
            <Text style={styles.paragraph}>
              Topladığımız bilgileri şu amaçlarla kullanıyoruz:
            </Text>
            <Text style={styles.bulletPoint}>• Hesabınızı oluşturmak ve yönetmek</Text>
            <Text style={styles.bulletPoint}>• Etkinlik önerileri sunmak</Text>
            <Text style={styles.bulletPoint}>• Uygulama deneyimini iyileştirmek</Text>
            <Text style={styles.bulletPoint}>• Güvenlik ve dolandırıcılığı önleme</Text>
            <Text style={styles.bulletPoint}>• Müşteri desteği sağlamak</Text>
            <Text style={styles.bulletPoint}>• Yasal yükümlülükleri yerine getirmek</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Bilgi Paylaşımı</Text>
            <Text style={styles.paragraph}>
              Kişisel bilgilerinizi şu durumlarda paylaşabiliriz:
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>• Diğer Kullanıcılar:</Text> Profil bilgileri 
              ve oluşturduğunuz etkinlikler diğer kullanıcılar tarafından görülebilir
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>• Hizmet Sağlayıcılar:</Text> Uygulama 
              altyapısı için güvenilir üçüncü taraf hizmetler
            </Text>
            <Text style={styles.bulletPoint}>
              <Text style={styles.bold}>• Yasal Zorunluluklar:</Text> Yasal talepler 
              ve mahkeme kararları
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Veri Güvenliği</Text>
            <Text style={styles.paragraph}>
              Bilgilerinizi korumak için:
            </Text>
            <Text style={styles.bulletPoint}>• Şifreli veri iletimi (SSL/TLS)</Text>
            <Text style={styles.bulletPoint}>• Güvenli veri depolama (Firebase)</Text>
            <Text style={styles.bulletPoint}>• Düzenli güvenlik güncellemeleri</Text>
            <Text style={styles.bulletPoint}>• Yetkisiz erişim koruması</Text>
            <Text style={styles.paragraph} style={{marginTop: 12}}>
              Ancak, internet üzerinden veri iletiminin %100 güvenli olmadığını 
              lütfen unutmayın.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Çerezler ve İzleme</Text>
            <Text style={styles.paragraph}>
              Uygulamamız, deneyiminizi iyileştirmek için çerezler ve benzer 
              teknolojiler kullanır. Bu teknolojiler:
            </Text>
            <Text style={styles.bulletPoint}>• Oturum bilgilerini saklar</Text>
            <Text style={styles.bulletPoint}>• Tercihlerinizi hatırlar</Text>
            <Text style={styles.bulletPoint}>• Uygulama performansını analiz eder</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Haklarınız</Text>
            <Text style={styles.paragraph}>
              Kişisel verileriniz konusunda şu haklara sahipsiniz:
            </Text>
            <Text style={styles.bulletPoint}>• Verilerinize erişim hakkı</Text>
            <Text style={styles.bulletPoint}>• Verilerin düzeltilmesini isteme hakkı</Text>
            <Text style={styles.bulletPoint}>• Verilerin silinmesini isteme hakkı</Text>
            <Text style={styles.bulletPoint}>• Veri işlemeye itiraz etme hakkı</Text>
            <Text style={styles.bulletPoint}>• Verilerin taşınabilirliği hakkı</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Çocukların Gizliliği</Text>
            <Text style={styles.paragraph}>
              Uygulamamız 13 yaşın altındaki çocuklara yönelik değildir. 
              13 yaşından küçük çocuklardan bilerek kişisel bilgi toplamıyoruz. 
              Eğer bir ebeveyn veya vasi iseniz ve çocuğunuzun bize kişisel bilgi 
              verdiğini düşünüyorsanız, lütfen bizimle iletişime geçin.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Değişiklikler</Text>
            <Text style={styles.paragraph}>
              Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli 
              değişiklikler olduğunda sizi bilgilendireceğiz. Güncellenmiş 
              politika, uygulama üzerinden yayınlandığı tarihte yürürlüğe girer.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. İletişim</Text>
            <Text style={styles.paragraph}>
              Gizlilik politikamız hakkında sorularınız için:
            </Text>
            <Text style={styles.contactInfo}>
              E-posta: privacy@eventapp.com{'\n'}
              Adres: Event App Inc., İstanbul, Türkiye{'\n'}
              Web: www.eventapp.com/privacy
            </Text>
          </View>

          <View style={styles.privacyBox}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <View style={styles.privacyTextContainer}>
              <Text style={styles.privacyTitle}>Gizliliğiniz Bizim İçin Önemli</Text>
              <Text style={styles.privacyText}>
                Verilerinizi korumak için en yüksek güvenlik standartlarını 
                uyguluyoruz ve asla üçüncü taraflara satmıyoruz.
              </Text>
            </View>
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
  bold: {
    fontWeight: '700',
  },
  contactInfo: {
    fontSize: 15,
    color: '#007bff',
    lineHeight: 24,
    marginTop: 8,
  },
  privacyBox: {
    backgroundColor: '#d4edda',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#28a745',
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  privacyIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 6,
  },
  privacyText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});

