import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  sendEventCancellationNotification,
  sendEventUpdateNotification,
  cancelEventNotifications,
  scheduleEventReminders,
} from '../services/notificationService';

export default function EditEventScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [capacity, setCapacity] = useState('');
  const [participantFilter, setParticipantFilter] = useState('Herkes');
  const [ageRange, setAgeRange] = useState('Tüm Yaşlar');

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        const data = eventDoc.data();
        setEventName(data.eventName);
        setDescription(data.description);
        const date = new Date(data.date);
        setEventDate(date);
        setEventTime(date);
        setLocation(data.location);
        setAddress(data.address);
        setCategory(data.category);
        setCapacity(data.capacity.toString());
        setParticipantFilter(data.participantFilter || 'Herkes');
        setAgeRange(data.ageRange || 'Tüm Yaşlar');
      } else {
        Alert.alert('Hata', 'Etkinlik bulunamadı');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Etkinlik yükleme hatası:', error);
      Alert.alert('Hata', 'Etkinlik yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!eventName || !description || !location || !address || !category || !capacity) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    setSaving(true);
    try {
      // Tarih ve saati birleştir
      const combinedDateTime = new Date(eventDate);
      combinedDateTime.setHours(eventTime.getHours());
      combinedDateTime.setMinutes(eventTime.getMinutes());

      // Eski tarih bilgisini al
      const oldEventDoc = await getDoc(doc(db, 'events', eventId));
      const oldDate = oldEventDoc.data().date;
      const oldLocation = oldEventDoc.data().location;
      
      await updateDoc(doc(db, 'events', eventId), {
        eventName: eventName,
        description: description,
        date: combinedDateTime.toISOString(),
        location: location,
        address: address,
        category: category,
        capacity: parseInt(capacity) || 0,
        participantFilter: participantFilter,
        ageRange: ageRange,
      });

      // Tarih değiştiyse
      if (oldDate !== combinedDateTime.toISOString()) {
        // Eski bildirimleri iptal et
        await cancelEventNotifications(eventId);
        // Yeni tarih için bildirimleri planla
        await scheduleEventReminders(eventId, eventName, combinedDateTime.toISOString());
        // Katılımcılara bildirim gönder
        await sendEventUpdateNotification(eventName, 'date_changed');
      } 
      // Konum değiştiyse
      else if (oldLocation !== location) {
        await sendEventUpdateNotification(eventName, 'location_changed');
      } 
      // Diğer değişiklikler
      else {
        await sendEventUpdateNotification(eventName, 'updated');
      }

      setSaving(false);
      Alert.alert(
        'Başarılı! 🎉',
        'Etkinlik güncellendi ve katılımcılara bildirim gönderildi.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      setSaving(false);
      Alert.alert('Hata', 'Etkinlik güncellenirken bir hata oluştu');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Etkinliği Sil',
      'Bu etkinliği silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              // İptal bildirimi gönder
              await sendEventCancellationNotification(eventName);
              
              // Planlanmış bildirimleri iptal et
              await cancelEventNotifications(eventId);
              
              // Etkinliği sil
              await deleteDoc(doc(db, 'events', eventId));
              
              Alert.alert('Başarılı', 'Etkinlik silindi ve katılımcılara bildirim gönderildi.');
              navigation.navigate('HomeScreen');
            } catch (error) {
              console.error('Silme hatası:', error);
              Alert.alert('Hata', 'Etkinlik silinirken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setEventTime(selectedTime);
    }
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (time) => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Etkinliği Düzenle</Text>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Etkinlik Adı */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Etkinlik Adı</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Yaz Konseri"
            placeholderTextColor="#666666"
            value={eventName}
            onChangeText={setEventName}
            autoCapitalize="words"
          />
        </View>

        {/* Açıklama */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Etkinlik hakkında bilgi verin..."
            placeholderTextColor="#666666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Tarih */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tarih</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerText}>📅  {formatDate(eventDate)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Saat */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Saat</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.datePickerText}>🕐  {formatTime(eventTime)}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={eventTime}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}
        </View>

        {/* Mekan */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mekan</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Açıkhava Tiyatrosu"
            placeholderTextColor="#666666"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Adres */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Adres</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tam adres bilgisi..."
            placeholderTextColor="#666666"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Kategori */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Kategori</Text>
          <View style={styles.categoryContainer}>
            {['Kahve & Sohbet', 'Yemek', 'Spor', 'Gezi', 'Sanat & Kültür', 'Oyun', 'Parti'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Katılımcı Filtresi */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Kimler Katılabilir?</Text>
          <View style={styles.categoryContainer}>
            {['Herkes', 'Sadece Kadınlar', 'Sadece Erkekler'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.categoryChip,
                  participantFilter === filter && styles.categoryChipActive,
                ]}
                onPress={() => setParticipantFilter(filter)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    participantFilter === filter && styles.categoryChipTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Yaş Aralığı */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Yaş Aralığı</Text>
          <View style={styles.categoryContainer}>
            {['Tüm Yaşlar', '18-25', '26-35', '36-45', '46+'].map((age) => (
              <TouchableOpacity
                key={age}
                style={[
                  styles.categoryChip,
                  ageRange === age && styles.categoryChipActive,
                ]}
                onPress={() => setAgeRange(age)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    ageRange === age && styles.categoryChipTextActive,
                  ]}
                >
                  {age}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Kapasite */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Kapasite</Text>
          <TextInput
            style={styles.input}
            placeholder="Maksimum katılımcı sayısı"
            placeholderTextColor="#666666"
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="numeric"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  datePickerButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  datePickerText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  categoryChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 40,
  },
});

