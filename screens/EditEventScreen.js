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
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../locales/translations';
import {
  sendEventCancellationNotification,
  sendEventUpdateNotification,
  cancelEventNotifications,
  scheduleEventReminders,
} from '../services/notificationService';

// Kategoriler
const CATEGORIES_TR = [
  { name: 'Kahve & Sohbet', icon: '☕', color: '#6F4E37' },
  { name: 'Yemek', icon: '🍽️', color: '#FF6B6B' },
  { name: 'Spor', icon: '⚽', color: '#4ECDC4' },
  { name: 'Gezi', icon: '🗺️', color: '#45B7D1' },
  { name: 'Sanat & Kültür', icon: '🎨', color: '#A569BD' },
  { name: 'Oyun', icon: '🎮', color: '#5DADE2' },
  { name: 'Parti', icon: '🎉', color: '#F39C12' },
  { name: 'Okey101', icon: '🎲', color: '#E74C3C' },
  { name: 'Masa Oyunları', icon: '♟️', color: '#34495E' },
  { name: 'Konser & Müzik', icon: '🎵', color: '#E91E63' },
  { name: 'Sinema', icon: '🎬', color: '#9C27B0' },
  { name: 'Kitap Kulübü', icon: '📚', color: '#3F51B5' },
  { name: 'Doğa & Kamp', icon: '🏕️', color: '#4CAF50' },
  { name: 'Yoga & Meditasyon', icon: '🧘', color: '#00BCD4' },
];

const CATEGORIES_EN = [
  { name: 'Coffee & Chat', icon: '☕', color: '#6F4E37' },
  { name: 'Food', icon: '🍽️', color: '#FF6B6B' },
  { name: 'Sports', icon: '⚽', color: '#4ECDC4' },
  { name: 'Travel', icon: '🗺️', color: '#45B7D1' },
  { name: 'Art & Culture', icon: '🎨', color: '#A569BD' },
  { name: 'Gaming', icon: '🎮', color: '#5DADE2' },
  { name: 'Party', icon: '🎉', color: '#F39C12' },
  { name: 'Okey101', icon: '🎲', color: '#E74C3C' },
  { name: 'Board Games', icon: '♟️', color: '#34495E' },
  { name: 'Concert & Music', icon: '🎵', color: '#E91E63' },
  { name: 'Cinema', icon: '🎬', color: '#9C27B0' },
  { name: 'Book Club', icon: '📚', color: '#3F51B5' },
  { name: 'Nature & Camping', icon: '🏕️', color: '#4CAF50' },
  { name: 'Yoga & Meditation', icon: '🧘', color: '#00BCD4' },
];

export default function EditEventScreen({ route, navigation }) {
  const { language } = useLanguage();
  const CATEGORIES = language === 'tr' ? CATEGORIES_TR : CATEGORIES_EN;
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
  const [participantFilter, setParticipantFilter] = useState(language === 'tr' ? 'Herkes' : 'Everyone');
  const [ageRange, setAgeRange] = useState(language === 'tr' ? 'Tüm Yaşlar' : 'All Ages');

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  // Dil değiştiğinde filtre seçeneklerini güncelle
  useEffect(() => {
    if (participantFilter === 'Herkes' || participantFilter === 'Everyone') {
      setParticipantFilter(language === 'tr' ? 'Herkes' : 'Everyone');
    } else if (participantFilter === 'Sadece Kadınlar' || participantFilter === 'Women Only') {
      setParticipantFilter(language === 'tr' ? 'Sadece Kadınlar' : 'Women Only');
    } else if (participantFilter === 'Sadece Erkekler' || participantFilter === 'Men Only') {
      setParticipantFilter(language === 'tr' ? 'Sadece Erkekler' : 'Men Only');
    }
    
    if (ageRange === 'Tüm Yaşlar' || ageRange === 'All Ages') {
      setAgeRange(language === 'tr' ? 'Tüm Yaşlar' : 'All Ages');
    }
  }, [language]);

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
        
        // Kategori çevirisi: Eğer kategori mevcut dildeki listede yoksa, çevir
        let loadedCategory = data.category;
        const categoryInCurrentLang = CATEGORIES.find(cat => cat.name === loadedCategory);
        if (!categoryInCurrentLang) {
          // Kategori farklı dilde kaydedilmiş, çeviri yap
          const allCategories = [...CATEGORIES_TR, ...CATEGORIES_EN];
          const categoryIndex = allCategories.findIndex(cat => cat.name === loadedCategory);
          if (categoryIndex !== -1) {
            // Aynı index'teki kategoriyi mevcut dilde bul
            const targetIndex = categoryIndex < CATEGORIES_TR.length 
              ? categoryIndex 
              : categoryIndex - CATEGORIES_TR.length;
            loadedCategory = CATEGORIES[targetIndex]?.name || loadedCategory;
          }
        }
        setCategory(loadedCategory);
        
        setCapacity(data.capacity.toString());
        
        // Participant filter çevirisi
        let loadedFilter = data.participantFilter;
        if (loadedFilter) {
          if (language === 'tr' && (loadedFilter === 'Everyone' || loadedFilter === 'Women Only' || loadedFilter === 'Men Only')) {
            loadedFilter = loadedFilter === 'Everyone' ? 'Herkes' : loadedFilter === 'Women Only' ? 'Sadece Kadınlar' : 'Sadece Erkekler';
          } else if (language === 'en' && (loadedFilter === 'Herkes' || loadedFilter === 'Sadece Kadınlar' || loadedFilter === 'Sadece Erkekler')) {
            loadedFilter = loadedFilter === 'Herkes' ? 'Everyone' : loadedFilter === 'Sadece Kadınlar' ? 'Women Only' : 'Men Only';
          }
        } else {
          loadedFilter = language === 'tr' ? 'Herkes' : 'Everyone';
        }
        setParticipantFilter(loadedFilter);
        
        // Age range çevirisi
        let loadedAgeRange = data.ageRange;
        if (loadedAgeRange) {
          if (language === 'tr' && loadedAgeRange === 'All Ages') {
            loadedAgeRange = 'Tüm Yaşlar';
          } else if (language === 'en' && loadedAgeRange === 'Tüm Yaşlar') {
            loadedAgeRange = 'All Ages';
          }
        } else {
          loadedAgeRange = language === 'tr' ? 'Tüm Yaşlar' : 'All Ages';
        }
        setAgeRange(loadedAgeRange);
      } else {
        Alert.alert(t(language, 'error'), t(language, 'eventNotFound'));
        navigation.goBack();
      }
    } catch (error) {
      console.error('Etkinlik yükleme hatası:', error);
      Alert.alert(t(language, 'error'), t(language, 'eventLoadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!eventName || !description || !location || !address || !category || !capacity) {
      Alert.alert(t(language, 'error'), t(language, 'fillAllFields'));
      return;
    }

    setSaving(true);
    try {
      // Tarih ve saati birleştir
      const combinedDateTime = new Date(eventDate);
      combinedDateTime.setHours(eventTime.getHours());
      combinedDateTime.setMinutes(eventTime.getMinutes());

      // Eski etkinlik bilgilerini al
      const oldEventDoc = await getDoc(doc(db, 'events', eventId));
      const oldEventData = oldEventDoc.data();
      const oldDate = oldEventData.date;
      const oldLocation = oldEventData.location;
      const participants = oldEventData.participants || [];
      
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
        await sendEventUpdateNotification(eventId, eventName, participants, 'date_changed', language);
      } 
      // Konum değiştiyse
      else if (oldLocation !== location) {
        await sendEventUpdateNotification(eventId, eventName, participants, 'location_changed', language);
      } 
      // Diğer değişiklikler
      else {
        await sendEventUpdateNotification(eventId, eventName, participants, 'updated', language);
      }

      setSaving(false);
      Alert.alert(
        t(language, 'updateSuccess'),
        t(language, 'updateSuccessMessage'),
        [
          {
            text: t(language, 'ok'),
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      setSaving(false);
      Alert.alert(t(language, 'error'), t(language, 'updateError'));
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t(language, 'deleteEvent'),
      t(language, 'deleteEventConfirm'),
      [
        {
          text: t(language, 'cancel'),
          style: 'cancel',
        },
        {
          text: t(language, 'delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Etkinlik bilgilerini al (bildirim için)
              const eventDoc = await getDoc(doc(db, 'events', eventId));
              const eventData = eventDoc.data();
              const participants = eventData?.participants || [];
              
              // Planlanmış bildirimleri iptal et
              await cancelEventNotifications(eventId);
              
              // İptal bildirimi gönder (tüm katılımcılara)
              await sendEventCancellationNotification(eventId, eventName, participants, language);
              
              // Etkinliği sil
              await deleteDoc(doc(db, 'events', eventId));
              
              Alert.alert(t(language, 'success'), t(language, 'deleteEventSuccess'));
              navigation.navigate('HomeScreen');
            } catch (error) {
              console.error('Silme hatası:', error);
              Alert.alert(t(language, 'error'), t(language, 'deleteEventError'));
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
        <Text style={styles.headerTitle}>{t(language, 'editEvent')}</Text>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={22} color="#FF3B30" />
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
          <Text style={styles.label}>{t(language, 'eventNameLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t(language, 'eventNamePlaceholder')}
            placeholderTextColor="#666666"
            value={eventName}
            onChangeText={setEventName}
            autoCapitalize="words"
          />
        </View>

        {/* Açıklama */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t(language, 'descriptionLabel')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t(language, 'descriptionPlaceholder')}
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
          <Text style={styles.label}>{t(language, 'dateLabel')}</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.datePickerContent}>
              <Ionicons name="calendar-outline" size={20} color="#000000" />
              <Text style={styles.datePickerText}>{formatDate(eventDate)}</Text>
            </View>
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
          <Text style={styles.label}>{t(language, 'timeLabel')}</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <View style={styles.datePickerContent}>
              <Ionicons name="time-outline" size={20} color="#000000" />
              <Text style={styles.datePickerText}>{formatTime(eventTime)}</Text>
            </View>
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
          <Text style={styles.label}>{t(language, 'venueLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t(language, 'venuePlaceholder')}
            placeholderTextColor="#666666"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Adres */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t(language, 'addressLabel')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t(language, 'addressPlaceholderEdit')}
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
          <Text style={styles.label}>{t(language, 'categoryLabel')}</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryChip,
                  category === cat.name && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat.name)}
              >
                <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat.name && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Katılımcı Filtresi */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t(language, 'whoCanJoinLabel')}</Text>
          <View style={styles.categoryContainer}>
            {(language === 'tr' 
              ? ['Herkes', 'Sadece Kadınlar', 'Sadece Erkekler']
              : ['Everyone', 'Women Only', 'Men Only']
            ).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.categoryChip,
                  participantFilter === filter && styles.categoryChipActive,
                ]}
                onPress={() => setParticipantFilter(filter)}
              >
                <View style={styles.filterButtonContent}>
                  {(filter === 'Herkes' || filter === 'Everyone') && (
                    <Ionicons 
                      name="globe-outline" 
                      size={16} 
                      color={participantFilter === filter ? '#FFFFFF' : '#666666'} 
                    />
                  )}
                  {(filter === 'Sadece Kadınlar' || filter === 'Women Only') && (
                    <Ionicons 
                      name="woman-outline" 
                      size={16} 
                      color={participantFilter === filter ? '#FFFFFF' : '#666666'} 
                    />
                  )}
                  {(filter === 'Sadece Erkekler' || filter === 'Men Only') && (
                    <Ionicons 
                      name="man-outline" 
                      size={16} 
                      color={participantFilter === filter ? '#FFFFFF' : '#666666'} 
                    />
                  )}
                  <Text
                    style={[
                      styles.categoryChipText,
                      participantFilter === filter && styles.categoryChipTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Yaş Aralığı */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t(language, 'ageRangeLabel')}</Text>
          <View style={styles.categoryContainer}>
            {(language === 'tr' 
              ? ['Tüm Yaşlar', '18-25', '26-35', '36-45', '46+']
              : ['All Ages', '18-25', '26-35', '36-45', '46+']
            ).map((age) => (
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
          <Text style={styles.label}>{t(language, 'capacityLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t(language, 'capacityPlaceholder')}
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
            <Text style={styles.saveButtonText}>{t(language, 'saveChanges')}</Text>
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
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
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
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  categoryEmoji: {
    fontSize: 16,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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

