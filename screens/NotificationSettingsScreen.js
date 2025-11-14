import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function NotificationSettingsScreen({ navigation }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [newEvents, setNewEvents] = useState(true);
  const [eventUpdates, setEventUpdates] = useState(true);
  const [messages, setMessages] = useState(false);
  const [marketing, setMarketing] = useState(false);

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
        <Text style={styles.headerTitle}>Bildirim Ayarları</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* General Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GENEL BİLDİRİMLER</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Push Bildirimleri</Text>
                <Text style={styles.settingDescription}>
                  Uygulama içi anlık bildirimler
                </Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: '#e0e0e0', true: '#34c759' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>E-posta Bildirimleri</Text>
                <Text style={styles.settingDescription}>
                  E-posta ile bildirimler al
                </Text>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ false: '#e0e0e0', true: '#34c759' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Event Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ETKİNLİK BİLDİRİMLERİ</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Etkinlik Hatırlatıcıları</Text>
                <Text style={styles.settingDescription}>
                  Katıldığınız etkinlikler için hatırlatma
                </Text>
              </View>
              <Switch
                value={eventReminders}
                onValueChange={setEventReminders}
                trackColor={{ false: '#e0e0e0', true: '#34c759' }}
                thumbColor="#ffffff"
                disabled={!pushEnabled}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Yeni Etkinlikler</Text>
                <Text style={styles.settingDescription}>
                  İlgi alanlarınıza uygun yeni etkinlikler
                </Text>
              </View>
              <Switch
                value={newEvents}
                onValueChange={setNewEvents}
                trackColor={{ false: '#e0e0e0', true: '#34c759' }}
                thumbColor="#ffffff"
                disabled={!pushEnabled}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Etkinlik Güncellemeleri</Text>
                <Text style={styles.settingDescription}>
                  Katıldığınız etkinliklerdeki değişiklikler
                </Text>
              </View>
              <Switch
                value={eventUpdates}
                onValueChange={setEventUpdates}
                trackColor={{ false: '#e0e0e0', true: '#34c759' }}
                thumbColor="#ffffff"
                disabled={!pushEnabled}
              />
            </View>
          </View>
        </View>

        {/* Other Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DİĞER</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Mesajlar</Text>
                <Text style={styles.settingDescription}>
                  Diğer kullanıcılardan mesajlar
                </Text>
              </View>
              <Switch
                value={messages}
                onValueChange={setMessages}
                trackColor={{ false: '#e0e0e0', true: '#34c759' }}
                thumbColor="#ffffff"
                disabled={!pushEnabled}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Pazarlama Bildirimleri</Text>
                <Text style={styles.settingDescription}>
                  Özel teklifler ve kampanyalar
                </Text>
              </View>
              <Switch
                value={marketing}
                onValueChange={setMarketing}
                trackColor={{ false: '#e0e0e0', true: '#34c759' }}
                thumbColor="#ffffff"
                disabled={!pushEnabled}
              />
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxIcon}>ℹ️</Text>
          <Text style={styles.infoBoxText}>
            Bildirim ayarlarınız cihazınızda kaydedilir. 
            Push bildirimleri kapalıysa diğer bildirim türleri de devre dışı kalacaktır.
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
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999999',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  settingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    marginHorizontal: 24,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2196f3',
    alignItems: 'flex-start',
  },
  infoBoxIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#0d47a1',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});

