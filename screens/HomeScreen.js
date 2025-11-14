import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function HomeScreen({ navigation }) {
  const user = auth.currentUser;
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Arama ve filtreleme state'leri
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedCity, setSelectedCity] = useState('Tümü');
  const [selectedDistrict, setSelectedDistrict] = useState('Tümü');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Kullanıcı verilerini yükle
    const loadUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Kullanıcı verisi yükleme hatası:', error);
        }
      }
    };

    // Ekran focus olduğunda kullanıcı verilerini yeniden yükle
    const unsubscribeNavigation = navigation.addListener('focus', loadUserData);
    loadUserData();

    // Etkinlikleri gerçek zamanlı dinle
    const q = query(
      collection(db, 'events'),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData = [];
      querySnapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() });
      });
      setEvents(eventsData);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubscribeNavigation();
    };
  }, []);

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month} - ${hours}:${minutes}`;
  };

  const myEvents = events.filter(e => e.creatorId === user?.uid);
  const joinedEvents = events.filter(e => e.participants?.includes(user?.uid));

  // Kategoriler ve şehirler
  const categories = ['Tümü', 'Spor', 'Müzik', 'Sanat', 'Yemek', 'Gezi', 'Eğitim', 'Teknoloji', 'Diğer'];
  const cities = ['Tümü', 'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Adana', 'Gaziantep', 'Konya', 'Mersin', 'Diyarbakır', 'Kayseri', 'Eskişehir', 'Samsun', 'Denizli', 'Trabzon', 'Kocaeli', 'Muğla', 'Balıkesir', 'Manisa', 'Aydın'];

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

  const getAvailableDistricts = () => {
    if (selectedCity === 'Tümü') return [];
    return ['Tümü', ...(districtsByCity[selectedCity] || [])];
  };

  const handleCityChange = (newCity) => {
    setSelectedCity(newCity);
    setSelectedDistrict('Tümü'); // İl değiştiğinde ilçeyi sıfırla
  };

  // Filtrelenmiş etkinlikler
  const filteredEvents = events.filter(event => {
    // Arama filtresi
    if (searchQuery !== '') {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        event.eventName?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }
    
    // Kategori filtresi
    if (selectedCategory !== 'Tümü') {
      if (event.category !== selectedCategory) return false;
    }
    
    // İl filtresi
    if (selectedCity !== 'Tümü') {
      if (!event.city || event.city !== selectedCity) return false;
    }
    
    // İlçe filtresi - sadece bir il seçiliyse kontrol et
    if (selectedCity !== 'Tümü' && selectedDistrict !== 'Tümü') {
      if (!event.district || event.district !== selectedDistrict) return false;
    }
    
    return true;
  });

  // Debug: Filtreleri ve etkinlikleri konsola yazdır
  useEffect(() => {
    console.log('🔍 Filtreler:', {
      kategori: selectedCategory,
      il: selectedCity,
      ilce: selectedDistrict,
      arama: searchQuery,
      toplamEtkinlik: events.length,
      filtrelenmisEtkinlik: filteredEvents.length
    });
    
    // İlk etkinliği örnek olarak göster
    if (events.length > 0) {
      console.log('📋 Örnek etkinlik:', {
        ad: events[0].eventName,
        kategori: events[0].category,
        il: events[0].city,
        ilce: events[0].district,
        konum: events[0].location
      });
    }
  }, [selectedCategory, selectedCity, selectedDistrict, searchQuery, events.length, filteredEvents.length]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const name = user?.displayName || 'User';
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi Günler';
    return 'İyi Akşamlar';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Header with Avatar */}
        <View style={styles.headerContainer}>
          <View style={styles.headerGradient}>
            <TouchableOpacity 
              style={styles.profileSection}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.8}
            >
              {userData?.photoURL || user?.photoURL ? (
                <Image
                  source={{ uri: userData?.photoURL || user?.photoURL }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: getAvatarColor() }]}>
                  <Text style={styles.avatarText}>
                    {getInitials(user?.displayName || 'Kullanıcı')}
                  </Text>
                </View>
              )}
              <View style={styles.greetingSection}>
                <View style={styles.greetingRow}>
                  <Text style={styles.greeting}>{getGreeting()}</Text>
                  <Ionicons name="sunny" size={16} color="#FFA726" />
                </View>
                <Text style={styles.userName}>
                  {user?.displayName || 'Kullanıcı'}
                </Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerIconButton}
                onPress={() => navigation.navigate('Profile', { screen: 'Settings' })}
                activeOpacity={0.7}
              >
                <Ionicons name="settings-outline" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={18} color="#666666" />
              <Text style={styles.statNumber}>{myEvents.length}</Text>
              <Text style={styles.statLabel}>Etkinliğim</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="people" size={18} color="#666666" />
              <Text style={styles.statNumber}>{joinedEvents.length}</Text>
              <Text style={styles.statLabel}>Katılımım</Text>
            </View>
          </View>
        </View>

        {/* Compact Create Button */}
        <View style={styles.createButtonContainer}>
          <TouchableOpacity 
            style={styles.createEventButton}
            onPress={() => navigation.navigate('CreateEvent')}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.createEventTitle}>Yeni Etkinlik</Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filter Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#999999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Etkinlik ara..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="options-outline" size={20} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        {(selectedCategory !== 'Tümü' || selectedCity !== 'Tümü' || selectedDistrict !== 'Tümü') && (
          <View style={styles.activeFiltersContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeFiltersContent}
            >
              {selectedCategory !== 'Tümü' && (
                <View style={styles.activeFilterChip}>
                  <Ionicons name="pricetag" size={14} color="#000000" />
                  <Text style={styles.activeFilterText}>{selectedCategory}</Text>
                  <TouchableOpacity onPress={() => setSelectedCategory('Tümü')}>
                    <Ionicons name="close" size={14} color="#000000" />
                  </TouchableOpacity>
                </View>
              )}
              {selectedCity !== 'Tümü' && (
                <View style={styles.activeFilterChip}>
                  <Ionicons name="business" size={14} color="#000000" />
                  <Text style={styles.activeFilterText}>{selectedCity}</Text>
                  <TouchableOpacity onPress={() => handleCityChange('Tümü')}>
                    <Ionicons name="close" size={14} color="#000000" />
                  </TouchableOpacity>
                </View>
              )}
              {selectedDistrict !== 'Tümü' && (
                <View style={styles.activeFilterChip}>
                  <Ionicons name="location" size={14} color="#000000" />
                  <Text style={styles.activeFilterText}>{selectedDistrict}</Text>
                  <TouchableOpacity onPress={() => setSelectedDistrict('Tümü')}>
                    <Ionicons name="close" size={14} color="#000000" />
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {filteredEvents.length > 0 ? `${filteredEvents.length} Etkinlik Bulundu` : 'Yaklaşan Etkinlikler'}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000000" />
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>
                {searchQuery || selectedCategory !== 'Tümü' || selectedCity !== 'Tümü' || selectedDistrict !== 'Tümü'
                  ? 'Sonuç bulunamadı' 
                  : 'Henüz etkinlik yok'}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery || selectedCategory !== 'Tümü' || selectedCity !== 'Tümü' || selectedDistrict !== 'Tümü'
                  ? 'Arama kriterlerinizi değiştirip tekrar deneyin'
                  : 'İlk etkinliğini oluştur veya mevcut etkinliklere katıl'}
              </Text>
            </View>
          ) : (
            <View>
              {filteredEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
                  activeOpacity={0.7}
                >
                  {/* Event Image - if available */}
                  {event.images && event.images.length > 0 && (
                    <Image
                      source={{ uri: event.images[0] }}
                      style={styles.eventCardImage}
                      resizeMode="cover"
                    />
                  )}
                  
                  <View style={styles.eventCardLeft}>
                    <View style={styles.eventDateBox}>
                      <Text style={styles.eventDateDay}>
                        {new Date(event.date).getDate()}
                      </Text>
                      <Text style={styles.eventDateMonth}>
                        {new Date(event.date).toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.eventCardContent}>
                      <View style={styles.eventCardTop}>
                        <Text style={styles.eventTitle} numberOfLines={1}>{event.eventName}</Text>
                        <View style={styles.eventCategoryBadge}>
                          <Text style={styles.eventCategoryText}>{event.category}</Text>
                        </View>
                      </View>
                      <View style={styles.eventCardBottom}>
                        <View style={styles.eventInfoItem}>
                          <Ionicons name="time-outline" size={14} color="#666666" />
                          <Text style={styles.eventTime}>
                            {new Date(event.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                        <View style={styles.eventInfoItem}>
                          <Ionicons name="people-outline" size={14} color="#666666" />
                          <Text style={styles.eventParticipants}>
                            {event.participants?.length || 0}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.eventInfoItem}>
                        <Ionicons name="location-outline" size={14} color="#999999" />
                        <Text style={styles.eventLocation} numberOfLines={1}>
                          {event.location}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>


        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filtreler</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={28} color="#000000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterModalContent} showsVerticalScrollIndicator={false}>
              {/* Category Filter */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Ionicons name="pricetag-outline" size={20} color="#000000" />
                  <Text style={styles.filterSectionTitle}>Kategori</Text>
                </View>
                <View style={styles.filterChipsContainer}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.filterChip,
                        selectedCategory === cat && styles.filterChipActive
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedCategory === cat && styles.filterChipTextActive
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* City Filter */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Ionicons name="business-outline" size={20} color="#000000" />
                  <Text style={styles.filterSectionTitle}>İl</Text>
                </View>
                <View style={styles.filterChipsContainer}>
                  {cities.map((cityItem) => (
                    <TouchableOpacity
                      key={cityItem}
                      style={[
                        styles.filterChip,
                        selectedCity === cityItem && styles.filterChipActive
                      ]}
                      onPress={() => handleCityChange(cityItem)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedCity === cityItem && styles.filterChipTextActive
                      ]}>
                        {cityItem}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* District Filter */}
              {selectedCity !== 'Tümü' && getAvailableDistricts().length > 0 && (
                <View style={styles.filterSection}>
                  <View style={styles.filterSectionHeader}>
                    <Ionicons name="location-outline" size={20} color="#000000" />
                    <Text style={styles.filterSectionTitle}>İlçe</Text>
                  </View>
                  <View style={styles.filterChipsContainer}>
                    {getAvailableDistricts().map((districtItem) => (
                      <TouchableOpacity
                        key={districtItem}
                        style={[
                          styles.filterChip,
                          selectedDistrict === districtItem && styles.filterChipActive
                        ]}
                        onPress={() => setSelectedDistrict(districtItem)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.filterChipText,
                          selectedDistrict === districtItem && styles.filterChipTextActive
                        ]}>
                          {districtItem}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.filterModalFooter}>
              <TouchableOpacity
                style={styles.resetFiltersButton}
                onPress={() => {
                  setSelectedCategory('Tümü');
                  setSelectedCity('Tümü');
                  setSelectedDistrict('Tümü');
                  setSearchQuery('');
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh-outline" size={20} color="#666666" />
                <Text style={styles.resetFiltersText}>Filtreleri Temizle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={() => setShowFilters(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.applyFiltersText}>Uygula</Text>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    backgroundColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  greetingSection: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  statLabel: {
    fontSize: 11,
    color: '#999999',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  createButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  createEventButton: {
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  createEventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#000000',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  eventCardImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: '#E0E0E0',
  },
  eventCardLeft: {
    flexDirection: 'row',
    gap: 14,
  },
  eventDateBox: {
    width: 58,
    height: 58,
    backgroundColor: '#000000',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  eventDateMonth: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  eventCardContent: {
    flex: 1,
  },
  eventCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  eventCategoryBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventCategoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#666666',
    textTransform: 'uppercase',
  },
  eventCardBottom: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 6,
  },
  eventInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventTime: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  eventParticipants: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
  },
  eventLocation: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '500',
    flex: 1,
  },
  bottomPadding: {
    height: 80,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFiltersContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  activeFiltersContent: {
    flexDirection: 'row',
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  activeFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: 400,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  filterModalContent: {
    maxHeight: 450,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterModalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  resetFiltersButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 14,
  },
  resetFiltersText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
  },
  applyFiltersButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 14,
  },
  applyFiltersText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

