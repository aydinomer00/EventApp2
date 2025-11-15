import React, { useState } from 'react';
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
  Modal,
  Image,
  ActivityIndicator as RNActivityIndicator,
  ActionSheetIOS,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { pickImage, takePhoto, processEventImage } from '../utils/imageUpload';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../locales/translations';
import { getCityNames, getDistrictsByCity } from '../data/turkeyCities';

// Kategoriler ve varsayılan emoji iconları
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

// Kategori için varsayılan placeholder oluştur (SVG yerine renk + emoji)
const getCategoryPlaceholder = (categoryName, language) => {
  const CATEGORIES = language === 'tr' ? CATEGORIES_TR : CATEGORIES_EN;
  const category = CATEGORIES.find(cat => cat.name === categoryName);
  if (!category) return null;
  return {
    isPlaceholder: true,
    icon: category.icon,
    color: category.color,
  };
};

export default function CreateEventScreen({ navigation }) {
  const { language } = useLanguage();
  const CATEGORIES = language === 'tr' ? CATEGORIES_TR : CATEGORIES_EN;
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Step 0: Etkinlik Detayları
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [eventImages, setEventImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Step 1: Tarih & Saat
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [selectedMinute, setSelectedMinute] = useState(0);
  
  // Step 2: Konum
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  
  // Step 3: Detaylar
  const [category, setCategory] = useState('');
  const [capacity, setCapacity] = useState('');
  const [participantFilter, setParticipantFilter] = useState('Herkes');
  const [ageRange, setAgeRange] = useState('Tüm Yaşlar');

  const totalSteps = 4;

  const validateStep0 = () => {
    if (!eventName || !description) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return false;
    }
    return true;
  };

  const validateStep1 = () => {
    // Tarih ve saat zaten state'de var, validasyon gerekmiyor
    return true;
  };

  const validateStep2 = () => {
    if (!city) {
      Alert.alert('Hata', 'Lütfen il seçin');
      return false;
    }
    if (!district) {
      Alert.alert('Hata', 'Lütfen ilçe seçin');
      return false;
    }
    if (!location || !address) {
      Alert.alert('Hata', 'Lütfen mekan ve adres bilgilerini girin');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!category || !capacity) {
      Alert.alert('Hata', 'Lütfen kategori ve kapasite bilgilerini girin');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 0:
        isValid = validateStep0();
        break;
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        if (isValid) {
          handleCreateEvent();
          return;
        }
        break;
    }
    
    if (isValid && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleImagePicker = () => {
    if (eventImages.length >= 3) {
      Alert.alert('Limit', 'Maksimum 3 fotoğraf ekleyebilirsiniz');
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t(language, 'cancel'), t(language, 'takePhoto'), t(language, 'chooseFromGallery')],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handleTakePhoto();
          } else if (buttonIndex === 2) {
            await handlePickImage();
          }
        }
      );
    } else {
      Alert.alert(
        t(language, 'choosePhoto'),
        language === 'tr' ? 'Nereden fotoğraf eklemek istersiniz?' : 'Where would you like to add a photo from?',
        [
          { text: t(language, 'cancel'), style: 'cancel' },
          { text: t(language, 'takePhoto'), onPress: handleTakePhoto },
          { text: t(language, 'chooseFromGallery'), onPress: handlePickImage },
        ]
      );
    }
  };

  const handlePickImage = async () => {
    try {
      setUploadingImage(true);
      const uri = await pickImage();
      if (uri) {
        console.log('📸 Galeriden fotoğraf seçildi, işleniyor...');
        const base64String = await processEventImage(uri);
        if (base64String) {
          setEventImages([...eventImages, base64String]);
          Alert.alert('Başarılı!', 'Fotoğraf eklendi ✓');
        }
      }
    } catch (error) {
      console.error('Fotoğraf seçme hatası:', error);
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setUploadingImage(true);
      const uri = await takePhoto();
      if (uri) {
        console.log('📸 Fotoğraf çekildi, işleniyor...');
        const base64String = await processEventImage(uri);
        if (base64String) {
          setEventImages([...eventImages, base64String]);
          Alert.alert('Başarılı!', 'Fotoğraf eklendi ✓');
        }
      }
    } catch (error) {
      console.error('Fotoğraf çekme hatası:', error);
      Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setEventImages(eventImages.filter((_, i) => i !== index));
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleCreateEvent = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Hata', 'Oturum bulunamadı');
        setLoading(false);
        return;
      }

      // Tarih ve saati birleştir
      const combinedDateTime = new Date(eventDate);
      combinedDateTime.setHours(eventTime.getHours());
      combinedDateTime.setMinutes(eventTime.getMinutes());

      // Fotoğraf yoksa kategori placeholder'ını ekle
      let finalImages = eventImages;
            if (finalImages.length === 0) {
              const placeholder = getCategoryPlaceholder(category, language);
              if (placeholder) {
                finalImages = [placeholder]; // Placeholder objesini array olarak ekle
              }
            }

      // Etkinliği oluştur (Base64 fotoğraflarla veya placeholder ile birlikte)
      const docRef = await addDoc(collection(db, 'events'), {
        eventName: eventName,
        description: description,
        date: combinedDateTime.toISOString(),
        city: city,
        district: district,
        location: location,
        address: address,
        category: category,
        capacity: parseInt(capacity) || 0,
        participantFilter: participantFilter,
        ageRange: ageRange,
        creatorId: user.uid,
        creatorName: user.displayName || 'Kullanıcı',
        createdAt: new Date().toISOString(),
        participants: [],
        images: finalImages, // Base64 fotoğrafları veya placeholder
      });

      console.log('✅ Etkinlik oluşturuldu!', docRef.id);

      setLoading(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Etkinlik oluşturma hatası:', error);
      setLoading(false);
      Alert.alert('Hata', 'Etkinlik oluşturulurken bir hata oluştu');
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[0, 1, 2, 3].map((step) => (
        <View
          key={step}
          style={[
            styles.progressStep,
            step <= currentStep && styles.progressStepActive,
          ]}
        />
      ))}
    </View>
  );

  const renderStep0 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepTitleContainer}>
        <Ionicons name="sparkles" size={24} color="#000000" />
        <Text style={styles.stepTitle}>{t(language, 'newSocialEvent')}</Text>
      </View>
      <Text style={styles.stepSubtitle}>{t(language, 'meetPeopleSubtitle')}</Text>

      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="text-outline" size={18} color="#000000" />
          <Text style={styles.label}>{t(language, 'eventName')}</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder={t(language, 'eventNamePlaceholder')}
          placeholderTextColor="#666666"
          value={eventName}
          onChangeText={setEventName}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="document-text-outline" size={18} color="#000000" />
          <Text style={styles.label}>{t(language, 'description')}</Text>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t(language, 'descriptionPlaceholder')}
          placeholderTextColor="#666666"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        <Text style={styles.helperText}>
          {t(language, 'descriptionHelper')}
        </Text>
      </View>

      {/* Event Photos */}
      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="images-outline" size={18} color="#000000" />
          <Text style={styles.label}>{t(language, 'eventPhotos')}</Text>
          <Text style={styles.optionalBadge}>({language === 'tr' ? 'Opsiyonel' : 'Optional'})</Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photosScrollContent}
        >
          {eventImages.map((imageUri, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: imageUri }} style={styles.eventPhoto} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removeImage(index)}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
          
          {eventImages.length < 3 && (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={handleImagePicker}
              disabled={uploadingImage}
              activeOpacity={0.7}
            >
              {uploadingImage ? (
                <RNActivityIndicator size="small" color="#666666" />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={32} color="#666666" />
                  <Text style={styles.addPhotoText}>{t(language, 'addPhoto')}</Text>
                  <Text style={styles.addPhotoCount}>
                    {eventImages.length}/3
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
        
        <Text style={styles.helperText}>
          {t(language, 'photoUploadOptional')}
        </Text>
      </View>

      {/* Welcome Info Box */}
      <View style={styles.welcomeInfoBox}>
        <Ionicons name="hand-right-outline" size={24} color="#4CAF50" />
        <View style={styles.welcomeInfoTextContainer}>
          <Text style={styles.welcomeInfoTitle}>{t(language, 'welcomeTitle')}</Text>
          <Text style={styles.welcomeInfoText}>
            {t(language, 'welcomeMessage')}
          </Text>
        </View>
      </View>
    </View>
  );

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

  const getQuickDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const afterTomorrow = new Date(today);
    afterTomorrow.setDate(afterTomorrow.getDate() + 2);
    
    // Hafta sonu
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const thisSaturday = new Date(today);
    thisSaturday.setDate(today.getDate() + daysUntilSaturday);
    
    const thisSunday = new Date(thisSaturday);
    thisSunday.setDate(thisSaturday.getDate() + 1);

    return language === 'tr' 
      ? [
          { label: 'Bugün', date: today, icon: 'today-outline' },
          { label: 'Yarın', date: tomorrow, icon: 'sunny-outline' },
          { label: 'Cumartesi', date: thisSaturday, icon: 'calendar-outline' },
          { label: 'Pazar', date: thisSunday, icon: 'calendar-outline' },
        ]
      : [
          { label: 'Today', date: today, icon: 'today-outline' },
          { label: 'Tomorrow', date: tomorrow, icon: 'sunny-outline' },
          { label: 'Saturday', date: thisSaturday, icon: 'calendar-outline' },
          { label: 'Sunday', date: thisSunday, icon: 'calendar-outline' },
        ];
  };

  const getQuickTimes = () => {
    return [
      '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '21:00', '22:00'
    ];
  };

  const isDateSelected = (date) => {
    return eventDate.toDateString() === date.toDateString();
  };

  const isTimeSelected = (time) => {
    const [hours, minutes] = time.split(':');
    return eventTime.getHours() === parseInt(hours) && eventTime.getMinutes() === parseInt(minutes);
  };

  const handleQuickDateSelect = (date) => {
    const newDate = new Date(date);
    newDate.setHours(eventTime.getHours());
    newDate.setMinutes(eventTime.getMinutes());
    setEventDate(newDate);
    setShowDatePicker(false);
  };

  const handleQuickTimeSelect = (time) => {
    const [hours, minutes] = time.split(':');
    const newTime = new Date(eventDate);
    newTime.setHours(parseInt(hours));
    newTime.setMinutes(parseInt(minutes));
    setEventTime(newTime);
    setShowTimePicker(false);
  };

  const handleCustomTimeSelect = () => {
    const newTime = new Date(eventDate);
    newTime.setHours(selectedHour);
    newTime.setMinutes(selectedMinute);
    setEventTime(newTime);
    setShowCustomTimePicker(false);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepTitleContainer}>
        <Ionicons name="calendar" size={24} color="#000000" />
        <Text style={styles.stepTitle}>{t(language, 'whenTitle')}</Text>
      </View>
      <Text style={styles.stepSubtitle}>{t(language, 'whenSubtitle')}</Text>

      {/* Selected Date & Time Display */}
      <View style={styles.selectedDateTimeCard}>
        <View style={styles.selectedDateSection}>
          <Ionicons name="calendar" size={32} color="#000000" />
          <View style={styles.selectedDateInfo}>
            <Text style={styles.selectedDateLabel}>{language === 'tr' ? 'Tarih' : 'Date'}</Text>
            <Text style={styles.selectedDateValue}>
              {formatDate(eventDate)}
            </Text>
          </View>
        </View>
        <View style={styles.selectedTimeSeparator} />
        <View style={styles.selectedTimeSection}>
          <Ionicons name="time" size={32} color="#000000" />
          <View style={styles.selectedTimeInfo}>
            <Text style={styles.selectedTimeLabel}>{language === 'tr' ? 'Saat' : 'Time'}</Text>
            <Text style={styles.selectedTimeValue}>
              {formatTime(eventTime)}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Date Selection */}
      <View style={styles.quickSelectionSection}>
        <Text style={styles.quickSelectionTitle}>{language === 'tr' ? 'Hızlı Tarih Seçimi' : 'Quick Date Selection'}</Text>
        <View style={styles.quickDateGrid}>
          {getQuickDates().map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickDateCard,
                isDateSelected(item.date) && styles.quickDateCardActive
              ]}
              onPress={() => handleQuickDateSelect(item.date)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={item.icon} 
                size={24} 
                color={isDateSelected(item.date) ? '#FFFFFF' : '#666666'} 
              />
              <Text style={[
                styles.quickDateLabel,
                isDateSelected(item.date) && styles.quickDateLabelActive
              ]}>
                {item.label}
              </Text>
              <Text style={[
                styles.quickDateDay,
                isDateSelected(item.date) && styles.quickDateDayActive
              ]}>
                {item.date.getDate()}/{item.date.getMonth() + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity
          style={styles.customDateButton}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={18} color="#000000" />
          <Text style={styles.customDateButtonText}>{language === 'tr' ? 'Özel Tarih Seç' : 'Custom Date'}</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={eventDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Quick Time Selection */}
      <View style={styles.quickSelectionSection}>
        <Text style={styles.quickSelectionTitle}>{language === 'tr' ? 'Saat Seçimi' : 'Time Selection'}</Text>
        <View style={styles.quickTimeGrid}>
          {getQuickTimes().map((time, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickTimeChip,
                isTimeSelected(time) && styles.quickTimeChipActive
              ]}
              onPress={() => handleQuickTimeSelect(time)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.quickTimeText,
                isTimeSelected(time) && styles.quickTimeTextActive
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity
          style={styles.customDateButton}
          onPress={() => setShowCustomTimePicker(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="time-outline" size={18} color="#000000" />
          <Text style={styles.customDateButtonText}>{t(language, 'customTime')}</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Time Picker Modal */}
      <Modal
        visible={showCustomTimePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerModal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCustomTimePicker(false)}>
                <Text style={styles.modalCancelText}>{t(language, 'cancel')}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t(language, 'selectHour')}</Text>
              <TouchableOpacity onPress={handleCustomTimeSelect}>
                <Text style={styles.modalDoneText}>{t(language, 'ok')}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickersContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>{t(language, 'hour')}</Text>
                <Picker
                  selectedValue={selectedHour}
                  onValueChange={(value) => setSelectedHour(value)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {hours.map((hour) => (
                    <Picker.Item
                      key={hour}
                      label={hour.toString().padStart(2, '0')}
                      value={hour}
                    />
                  ))}
                </Picker>
              </View>
              
              <Text style={styles.pickerSeparator}>:</Text>
              
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>{t(language, 'minute')}</Text>
                <Picker
                  selectedValue={selectedMinute}
                  onValueChange={(value) => setSelectedMinute(value)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {minutes.map((minute) => (
                    <Picker.Item
                      key={minute}
                      label={minute.toString().padStart(2, '0')}
                      value={minute}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Info Box */}
      <View style={styles.dateTimeInfoBox}>
        <Ionicons name="bulb-outline" size={20} color="#FFA726" />
        <Text style={styles.dateTimeInfoText}>
          {language === 'tr' 
            ? 'İnsanların planlarını yapabilmesi için etkinliğini en az 24 saat önceden oluşturmanı öneriyoruz.'
            : 'We recommend creating your event at least 24 hours in advance so people can plan accordingly.'}
        </Text>
      </View>
    </View>
  );

  const cities = getCityNames();

  const getDistricts = () => {
    return city ? getDistrictsByCity(city) : [];
  };

  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity);
    setDistrict(''); // İl değiştiğinde ilçeyi sıfırla
  };

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepTitleContainer}>
        <Ionicons name="location" size={24} color="#000000" />
        <Text style={styles.stepTitle}>{t(language, 'whereTitle')}</Text>
      </View>
      <Text style={styles.stepSubtitle}>{t(language, 'whereSubtitle')}</Text>

      {/* City Selection */}
      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="business" size={18} color="#000000" />
          <Text style={styles.label}>{language === 'tr' ? 'İl' : 'City'}</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cityScrollContent}
        >
          {cities.map((cityItem) => (
            <TouchableOpacity
              key={cityItem}
              style={[
                styles.cityChip,
                city === cityItem && styles.cityChipActive
              ]}
              onPress={() => handleCitySelect(cityItem)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.cityChipText,
                city === cityItem && styles.cityChipTextActive
              ]}>
                {cityItem}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* District Selection - Only show if city is selected */}
      {city && getDistricts().length > 0 && (
        <View style={styles.inputContainer}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="location" size={18} color="#000000" />
            <Text style={styles.label}>{language === 'tr' ? 'İlçe' : 'District'}</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cityScrollContent}
          >
            {getDistricts().map((districtItem) => (
              <TouchableOpacity
                key={districtItem}
                style={[
                  styles.cityChip,
                  district === districtItem && styles.cityChipActive
                ]}
                onPress={() => setDistrict(districtItem)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.cityChipText,
                  district === districtItem && styles.cityChipTextActive
                ]}>
                  {districtItem}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="business-outline" size={18} color="#000000" />
          <Text style={styles.label}>{language === 'tr' ? 'Mekan' : 'Venue'}</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder={t(language, 'locationPlaceholder')}
          placeholderTextColor="#666666"
          value={location}
          onChangeText={setLocation}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="map-outline" size={18} color="#000000" />
          <Text style={styles.label}>{language === 'tr' ? 'Adres Detayı' : 'Address Details'}</Text>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t(language, 'addressPlaceholder')}
          placeholderTextColor="#666666"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <Text style={styles.helperText}>
          {t(language, 'locationTip')}
        </Text>
      </View>

      {/* Location Tips */}
      <View style={styles.locationTipsBox}>
        <View style={styles.locationTipsHeader}>
          <Ionicons name="compass-outline" size={20} color="#2196F3" />
          <Text style={styles.locationTipsTitle}>{language === 'tr' ? 'Konum İpuçları' : 'Location Tips'}</Text>
        </View>
        <Text style={styles.locationTip}>
          {language === 'tr' ? '• Popüler kafeler ideal başlangıç noktaları' : '• Popular cafes are ideal starting points'}
        </Text>
        <Text style={styles.locationTip}>
          {language === 'tr' ? '• Parklar açık hava aktiviteleri için harika' : '• Parks are great for outdoor activities'}
        </Text>
        <Text style={styles.locationTip}>
          {language === 'tr' ? '• Herkesin kolayca bulabileceği yerler tercih edin' : '• Prefer places that everyone can easily find'}
        </Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepTitleContainer}>
        <Ionicons name="options" size={24} color="#000000" />
        <Text style={styles.stepTitle}>{t(language, 'detailsTitle')}</Text>
      </View>
      <Text style={styles.stepSubtitle}>{t(language, 'detailsSubtitle')}</Text>

      {/* Category */}
      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="pricetag-outline" size={18} color="#000000" />
          <Text style={styles.label}>{language === 'tr' ? 'Kategori' : 'Category'}</Text>
        </View>
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

      {/* Participant Filter */}
      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="people-outline" size={18} color="#000000" />
          <Text style={styles.label}>{language === 'tr' ? 'Kimler Katılabilir?' : 'Who Can Join?'}</Text>
        </View>
        <View style={styles.filterContainer}>
          {(language === 'tr' 
            ? ['Herkes', 'Sadece Kadınlar', 'Sadece Erkekler']
            : ['Everyone', 'Women Only', 'Men Only']
          ).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                participantFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setParticipantFilter(filter)}
            >
              <View style={styles.filterButtonContent}>
                {(filter === 'Herkes' || filter === 'Everyone') && <Ionicons name="globe-outline" size={16} color={participantFilter === filter ? '#FFFFFF' : '#666666'} />}
                {(filter === 'Sadece Kadınlar' || filter === 'Women Only') && <Ionicons name="woman-outline" size={16} color={participantFilter === filter ? '#FFFFFF' : '#666666'} />}
                {(filter === 'Sadece Erkekler' || filter === 'Men Only') && <Ionicons name="man-outline" size={16} color={participantFilter === filter ? '#FFFFFF' : '#666666'} />}
                <Text
                  style={[
                    styles.filterChipText,
                    participantFilter === filter && styles.filterChipTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Age Range */}
      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="calendar-number-outline" size={18} color="#000000" />
          <Text style={styles.label}>{language === 'tr' ? 'Yaş Aralığı' : 'Age Range'}</Text>
        </View>
        <View style={styles.filterContainer}>
          {(language === 'tr' 
            ? ['Tüm Yaşlar', '18-25', '26-35', '36-45', '46+']
            : ['All Ages', '18-25', '26-35', '36-45', '46+']
          ).map((age) => (
            <TouchableOpacity
              key={age}
              style={[
                styles.ageChip,
                ageRange === age && styles.ageChipActive,
              ]}
              onPress={() => setAgeRange(age)}
            >
              <Text
                style={[
                  styles.ageChipText,
                  ageRange === age && styles.ageChipTextActive,
                ]}
              >
                {age}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Capacity */}
      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="person-add-outline" size={18} color="#000000" />
          <Text style={styles.label}>{language === 'tr' ? 'Maksimum Katılımcı' : 'Maximum Participants'}</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder={t(language, 'maxParticipantsPlaceholder')}
          placeholderTextColor="#666666"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="numeric"
        />
        <Text style={styles.helperText}>
          {language === 'tr' 
            ? 'Küçük gruplar daha samimi sosyalleşme sağlar (5-15 kişi önerilir)'
            : 'Small groups provide more intimate socialization (5-15 people recommended)'}
        </Text>
      </View>

      {/* Social Info Box */}
      <View style={styles.socialInfoBox}>
        <Ionicons name="bulb-outline" size={24} color="#FFA726" />
        <View style={styles.socialInfoTextContainer}>
          <Text style={styles.socialInfoTitle}>{language === 'tr' ? 'Sosyalleşme İpucu' : 'Socialization Tip'}</Text>
          <Text style={styles.socialInfoText}>
            {language === 'tr' 
              ? 'Filtreleri kullanarak benzer ilgi alanlarına sahip kişilerle bir araya gelebilirsin!'
              : 'You can come together with people who have similar interests by using filters!'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderStep0();
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep0();
    }
  };

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
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t(language, 'createEvent')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderProgressBar()}
        
        {renderCurrentStep()}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === totalSteps - 1 ? t(language, 'create') : t(language, 'next')}
            </Text>
            <Text style={styles.nextButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            {/* Success Icon with Animation */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <View style={styles.successIconInnerCircle}>
                  <Ionicons name="checkmark-circle" size={90} color="#4CAF50" />
                </View>
                <View style={styles.successPulse} />
                <View style={[styles.successPulse, { animationDelay: '0.3s' }]} />
              </View>
            </View>
            
            {/* Success Content */}
            <View style={styles.successContent}>
              <Text style={styles.successTitle}>{t(language, 'eventCreatedSuccess')}</Text>
              <Text style={styles.successMessage}>
                {t(language, 'eventCreatedMessage')}
              </Text>
              
              {/* Decorative Divider */}
              <View style={styles.successDividerContainer}>
                <View style={styles.successDividerLine} />
                <Ionicons name="sparkles" size={20} color="#FFD700" />
                <View style={styles.successDividerLine} />
              </View>
              
              <Text style={styles.successSubtext}>
                {t(language, 'eventCreatedSubtext')}
              </Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.goBack();
              }}
              activeOpacity={0.8}
            >
              <View style={styles.successButtonContent}>
                <Ionicons name="calendar" size={22} color="#FFFFFF" />
                <Text style={styles.successButtonText}>{t(language, 'viewEvents')}</Text>
                <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
    paddingTop: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#000000',
  },
  stepContainer: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 24,
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
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cityScrollContent: {
    paddingRight: 20,
    gap: 8,
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityChip: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cityChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  cityChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  cityChipTextActive: {
    color: '#ffffff',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  nextButton: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  nextButtonArrow: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 6,
    lineHeight: 16,
  },
  optionalBadge: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 6,
    fontWeight: '400',
  },
  photosScrollContent: {
    paddingRight: 20,
    gap: 12,
    marginTop: 12,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  eventPhoto: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addPhotoText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
    marginTop: 4,
  },
  addPhotoCount: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2,
  },
  selectedDateTimeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  selectedDateSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedDateInfo: {
    flex: 1,
  },
  selectedDateLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedDateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  selectedTimeSeparator: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  selectedTimeSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedTimeInfo: {
    flex: 1,
  },
  selectedTimeLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedTimeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  quickSelectionSection: {
    marginBottom: 24,
  },
  quickSelectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  quickDateGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quickDateCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickDateCardActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  quickDateLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
  },
  quickDateLabelActive: {
    color: '#FFFFFF',
  },
  quickDateDay: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999999',
  },
  quickDateDayActive: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  quickTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  quickTimeChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  quickTimeChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  quickTimeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666666',
  },
  quickTimeTextActive: {
    color: '#FFFFFF',
  },
  customDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  customDateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  dateTimeInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    gap: 12,
  },
  dateTimeInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
    fontWeight: '500',
  },
  welcomeInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    gap: 12,
  },
  welcomeInfoTextContainer: {
    flex: 1,
  },
  welcomeInfoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  welcomeInfoText: {
    fontSize: 13,
    color: '#388E3C',
    lineHeight: 18,
    fontWeight: '500',
  },
  locationTipsBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  locationTipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  locationTipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1565C0',
  },
  locationTip: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 20,
    marginBottom: 4,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  ageChip: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 70,
    alignItems: 'center',
  },
  ageChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  ageChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
  },
  ageChipTextActive: {
    color: '#ffffff',
  },
  socialInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    gap: 12,
  },
  socialInfoTextContainer: {
    flex: 1,
  },
  socialInfoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 4,
  },
  socialInfoText: {
    fontSize: 13,
    color: '#F57C00',
    lineHeight: 18,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '600',
  },
  modalDoneText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '700',
  },
  pickersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  picker: {
    width: 120,
    height: 200,
  },
  pickerItem: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  pickerSeparator: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    marginHorizontal: 10,
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  successIconInnerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 2,
  },
  successPulse: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#4CAF50',
    opacity: 0.15,
    zIndex: 1,
  },
  successContent: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  successDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
    gap: 12,
  },
  successDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  successMessage: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 28,
  },
  successSubtext: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  successButton: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 18,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  successButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  successButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

