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
import { pickImage, takePhoto, uploadEventImage } from '../utils/imageUpload';

export default function CreateEventScreen({ navigation }) {
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
          options: ['İptal', 'Fotoğraf Çek', 'Galeriden Seç'],
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
        'Fotoğraf Seç',
        'Nereden fotoğraf eklemek istersiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Fotoğraf Çek', onPress: handleTakePhoto },
          { text: 'Galeriden Seç', onPress: handlePickImage },
        ]
      );
    }
  };

  const handlePickImage = async () => {
    try {
      setUploadingImage(true);
      const uri = await pickImage();
      if (uri) {
        setEventImages([...eventImages, uri]);
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
        setEventImages([...eventImages, uri]);
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

      // Önce etkinliği oluştur ve ID'sini al
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
        images: [], // Başlangıçta boş
      });

      // Fotoğrafları yükle
      if (eventImages.length > 0) {
        const uploadedImageUrls = [];
        for (const imageUri of eventImages) {
          try {
            const downloadURL = await uploadEventImage(docRef.id, imageUri);
            uploadedImageUrls.push(downloadURL);
          } catch (uploadError) {
            console.error('Fotoğraf yükleme hatası:', uploadError);
            // Devam et, bazı fotoğraflar yüklenemese bile
          }
        }

        // Fotoğraf URL'lerini etkinliğe ekle
        if (uploadedImageUrls.length > 0) {
          await updateDoc(doc(db, 'events', docRef.id), {
            images: uploadedImageUrls,
          });
        }
      }

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
        <Text style={styles.stepTitle}>Yeni Sosyal Etkinlik</Text>
      </View>
      <Text style={styles.stepSubtitle}>İnsanlarla tanış, eğlen, sosyalleş!</Text>

      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="text-outline" size={18} color="#000000" />
          <Text style={styles.label}>Etkinlik Adı</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Örn: Sahilde Kahve & Sohbet"
          placeholderTextColor="#666666"
          value={eventName}
          onChangeText={setEventName}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="document-text-outline" size={18} color="#000000" />
          <Text style={styles.label}>Açıklama</Text>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ne yapacaksınız? Kimler katılmalı? Neden keyifli olacak?"
          placeholderTextColor="#666666"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        <Text style={styles.helperText}>
          Samimi ve açıklayıcı bir metin insanların katılmasını kolaylaştırır
        </Text>
      </View>

      {/* Event Photos */}
      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="images-outline" size={18} color="#000000" />
          <Text style={styles.label}>Etkinlik Fotoğrafları</Text>
          <Text style={styles.optionalBadge}>(Opsiyonel)</Text>
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
                  <Text style={styles.addPhotoText}>Fotoğraf Ekle</Text>
                  <Text style={styles.addPhotoCount}>
                    {eventImages.length}/3
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
        
        <Text style={styles.helperText}>
          Fotoğraf eklemek etkinliğinin daha çok ilgi görmesini sağlar
        </Text>
      </View>

      {/* Welcome Info Box */}
      <View style={styles.welcomeInfoBox}>
        <Ionicons name="hand-right-outline" size={24} color="#4CAF50" />
        <View style={styles.welcomeInfoTextContainer}>
          <Text style={styles.welcomeInfoTitle}>Hoş Geldin!</Text>
          <Text style={styles.welcomeInfoText}>
            Yeni arkadaşlar edinmek için harika bir adım atıyorsun. 
            Etkinliğini oluştururken samimi ve açık ol!
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

    return [
      { label: 'Bugün', date: today, icon: 'today-outline' },
      { label: 'Yarın', date: tomorrow, icon: 'sunny-outline' },
      { label: 'Cumartesi', date: thisSaturday, icon: 'calendar-outline' },
      { label: 'Pazar', date: thisSunday, icon: 'calendar-outline' },
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
        <Text style={styles.stepTitle}>Ne Zaman?</Text>
      </View>
      <Text style={styles.stepSubtitle}>Etkinliğin tarih ve saatini seç</Text>

      {/* Selected Date & Time Display */}
      <View style={styles.selectedDateTimeCard}>
        <View style={styles.selectedDateSection}>
          <Ionicons name="calendar" size={32} color="#000000" />
          <View style={styles.selectedDateInfo}>
            <Text style={styles.selectedDateLabel}>Tarih</Text>
            <Text style={styles.selectedDateValue}>
              {formatDate(eventDate)}
            </Text>
          </View>
        </View>
        <View style={styles.selectedTimeSeparator} />
        <View style={styles.selectedTimeSection}>
          <Ionicons name="time" size={32} color="#000000" />
          <View style={styles.selectedTimeInfo}>
            <Text style={styles.selectedTimeLabel}>Saat</Text>
            <Text style={styles.selectedTimeValue}>
              {formatTime(eventTime)}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Date Selection */}
      <View style={styles.quickSelectionSection}>
        <Text style={styles.quickSelectionTitle}>Hızlı Tarih Seçimi</Text>
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
          <Text style={styles.customDateButtonText}>Özel Tarih Seç</Text>
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
        <Text style={styles.quickSelectionTitle}>Saat Seçimi</Text>
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
          <Text style={styles.customDateButtonText}>Özel Saat Seç</Text>
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
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Saat Seç</Text>
              <TouchableOpacity onPress={handleCustomTimeSelect}>
                <Text style={styles.modalDoneText}>Tamam</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickersContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Saat</Text>
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
                <Text style={styles.pickerLabel}>Dakika</Text>
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
          İnsanların planlarını yapabilmesi için etkinliğini en az 24 saat önceden oluşturmanı öneriyoruz.
        </Text>
      </View>
    </View>
  );

  const cities = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Adana', 'Gaziantep', 'Konya', 'Mersin', 'Diyarbakır', 'Kayseri', 'Eskişehir', 'Samsun', 'Denizli', 'Trabzon', 'Kocaeli', 'Muğla', 'Balıkesir', 'Manisa', 'Aydın'];

  const districtsByCity = {
    'İstanbul': ['Kadıköy', 'Beşiktaş', 'Şişli', 'Beyoğlu', 'Üsküdar', 'Sarıyer', 'Bakırköy', 'Fatih', 'Kartal', 'Maltepe', 'Ataşehir', 'Pendik', 'Eyüpsultan', 'Sultanbeyli', 'Küçükçekmece'],
    'Ankara': ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan', 'Altındağ', 'Pursaklar', 'Gölbaşı', 'Polatlı'],
    'İzmir': ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Çiğli', 'Gaziemir', 'Balçova', 'Narlıdere', 'Bayraklı', 'Alsancak'],
    'Antalya': ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Alanya', 'Manavgat', 'Serik', 'Aksu', 'Döşemealtı'],
    'Bursa': ['Osmangazi', 'Nilüfer', 'Yıldırım', 'Mudanya', 'Gemlik', 'İnegöl', 'Mustafakemalpaşa', 'Karacabey'],
    'Adana': ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Karaisalı', 'Ceyhan', 'Kozan'],
    'Gaziantep': ['Şahinbey', 'Şehitkamil', 'Oğuzeli', 'Nizip', 'İslahiye', 'Nurdağı'],
    'Konya': ['Meram', 'Selçuklu', 'Karatay', 'Ereğli', 'Akşehir', 'Beyşehir', 'Seydişehir'],
    'Mersin': ['Akdeniz', 'Mezitli', 'Toroslar', 'Yenişehir', 'Tarsus', 'Erdemli', 'Silifke'],
    'Diyarbakır': ['Bağlar', 'Yenişehir', 'Kayapınar', 'Sur', 'Ergani', 'Bismil', 'Çınar'],
    'Kayseri': ['Melikgazi', 'Kocasinan', 'Talas', 'İncesu', 'Develi', 'Yahyalı'],
    'Eskişehir': ['Odunpazarı', 'Tepebaşı', 'Sivrihisar', 'Çifteler', 'Mahmudiye'],
    'Samsun': ['İlkadım', 'Atakum', 'Canik', 'Tekkeköy', 'Terme', 'Bafra', 'Çarşamba'],
    'Denizli': ['Merkezefendi', 'Pamukkale', 'Honaz', 'Çivril', 'Acıpayam', 'Tavas'],
    'Trabzon': ['Ortahisar', 'Akçaabat', 'Yomra', 'Arsin', 'Vakfıkebir', 'Araklı', 'Beşikdüzü'],
    'Kocaeli': ['İzmit', 'Gebze', 'Derince', 'Körfez', 'Darıca', 'Gölcük', 'Kandıra', 'Karamürsel'],
    'Muğla': ['Menteşe', 'Bodrum', 'Marmaris', 'Fethiye', 'Milas', 'Datça', 'Köyceğiz', 'Ula'],
    'Balıkesir': ['Altıeylül', 'Karesi', 'Bandırma', 'Edremit', 'Gönen', 'Ayvalık', 'Burhaniye'],
    'Manisa': ['Şehzadeler', 'Yunusemre', 'Akhisar', 'Turgutlu', 'Salihli', 'Alaşehir', 'Soma'],
    'Aydın': ['Efeler', 'Nazilli', 'Söke', 'Kuşadası', 'Didim', 'İncirliova', 'Germencik']
  };

  const getDistricts = () => {
    return city ? (districtsByCity[city] || []) : [];
  };

  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity);
    setDistrict(''); // İl değiştiğinde ilçeyi sıfırla
  };

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepTitleContainer}>
        <Ionicons name="location" size={24} color="#000000" />
        <Text style={styles.stepTitle}>Nerede Buluşalım?</Text>
      </View>
      <Text style={styles.stepSubtitle}>Buluşma noktanızı belirleyin</Text>

      {/* City Selection */}
      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="business" size={18} color="#000000" />
          <Text style={styles.label}>İl</Text>
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
            <Text style={styles.label}>İlçe</Text>
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
          <Text style={styles.label}>Mekan</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Örn: Starbucks Bağdat Caddesi"
          placeholderTextColor="#666666"
          value={location}
          onChangeText={setLocation}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="map-outline" size={18} color="#000000" />
          <Text style={styles.label}>Adres Detayı</Text>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tam adres veya detaylı tarif (hangi durak, landmark vb.)"
          placeholderTextColor="#666666"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <Text style={styles.helperText}>
          Kolay ulaşılabilir, güvenli ve sosyalleşmeye uygun bir yer seçin
        </Text>
      </View>

      {/* Location Tips */}
      <View style={styles.locationTipsBox}>
        <View style={styles.locationTipsHeader}>
          <Ionicons name="compass-outline" size={20} color="#2196F3" />
          <Text style={styles.locationTipsTitle}>Konum İpuçları</Text>
        </View>
        <Text style={styles.locationTip}>• Popüler kafeler ideal başlangıç noktaları</Text>
        <Text style={styles.locationTip}>• Parklar açık hava aktiviteleri için harika</Text>
        <Text style={styles.locationTip}>• Herkesin kolayca bulabileceği yerler tercih edin</Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepTitleContainer}>
        <Ionicons name="options" size={24} color="#000000" />
        <Text style={styles.stepTitle}>Detaylar</Text>
      </View>
      <Text style={styles.stepSubtitle}>Etkinliğini kişiselleştir</Text>

      {/* Category */}
      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="pricetag-outline" size={18} color="#000000" />
          <Text style={styles.label}>Kategori</Text>
        </View>
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

      {/* Participant Filter */}
      <View style={styles.inputContainer}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="people-outline" size={18} color="#000000" />
          <Text style={styles.label}>Kimler Katılabilir?</Text>
        </View>
        <View style={styles.filterContainer}>
          {['Herkes', 'Sadece Kadınlar', 'Sadece Erkekler'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                participantFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setParticipantFilter(filter)}
            >
              <View style={styles.filterButtonContent}>
                {filter === 'Herkes' && <Ionicons name="globe-outline" size={16} color={participantFilter === filter ? '#FFFFFF' : '#666666'} />}
                {filter === 'Sadece Kadınlar' && <Ionicons name="woman-outline" size={16} color={participantFilter === filter ? '#FFFFFF' : '#666666'} />}
                {filter === 'Sadece Erkekler' && <Ionicons name="man-outline" size={16} color={participantFilter === filter ? '#FFFFFF' : '#666666'} />}
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
          <Text style={styles.label}>Yaş Aralığı</Text>
        </View>
        <View style={styles.filterContainer}>
          {['Tüm Yaşlar', '18-25', '26-35', '36-45', '46+'].map((age) => (
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
          <Text style={styles.label}>Maksimum Katılımcı</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Örn: 10 kişi"
          placeholderTextColor="#666666"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="numeric"
        />
        <Text style={styles.helperText}>
          Küçük gruplar daha samimi sosyalleşme sağlar (5-15 kişi önerilir)
        </Text>
      </View>

      {/* Social Info Box */}
      <View style={styles.socialInfoBox}>
        <Ionicons name="bulb-outline" size={24} color="#FFA726" />
        <View style={styles.socialInfoTextContainer}>
          <Text style={styles.socialInfoTitle}>Sosyalleşme İpucu</Text>
          <Text style={styles.socialInfoText}>
            Filtreleri kullanarak benzer ilgi alanlarına sahip kişilerle bir araya gelebilirsin!
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
        <Text style={styles.headerTitle}>Yeni Etkinlik</Text>
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
              {currentStep === totalSteps - 1 ? 'Oluştur' : 'İleri'}
            </Text>
            <Text style={styles.nextButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark" size={60} color="#FFFFFF" />
              </View>
            </View>
            
            <Text style={styles.successTitle}>Harika! 🎉</Text>
            <Text style={styles.successMessage}>
              Etkinliğin başarıyla oluşturuldu
            </Text>
            <Text style={styles.successSubtext}>
              İnsanlar etkinliğini görebilir ve katılım isteği gönderebilir
            </Text>

            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.goBack();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.successButtonText}>Etkinlikleri Gör</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
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
  },
  categoryChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
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
    marginBottom: 24,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 20,
  },
  successButton: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

