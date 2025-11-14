import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import {
  scheduleEventReminders,
  cancelEventNotifications,
  sendNewParticipantNotification,
} from '../services/notificationService';

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        const eventData = { id: eventDoc.id, ...eventDoc.data() };
        setEvent(eventData);
        // Katılımcıları yükle
        await loadParticipants(eventData.participants || [], eventData.creatorId);
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

  const loadParticipants = async (participantIds, creatorId) => {
    if (!participantIds || participantIds.length === 0) {
      setParticipants([]);
      return;
    }

    setLoadingParticipants(true);
    try {
      const participantData = [];
      
      // Her katılımcı için bilgileri al
      for (const userId of participantIds) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          participantData.push({
            id: userId,
            name: userData.name || 'Kullanıcı',
            gender: userData.gender || '',
            city: userData.city || '',
            isCreator: userId === creatorId,
          });
        }
      }
      
      // Organizatörü en başa al
      participantData.sort((a, b) => {
        if (a.isCreator) return -1;
        if (b.isCreator) return 1;
        return 0;
      });

      setParticipants(participantData);
    } catch (error) {
      console.error('Katılımcı yükleme hatası:', error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!event) return;

    try {
      const eventParticipants = event.participants || [];
      const isParticipant = eventParticipants.includes(user.uid);

      if (isParticipant) {
        // Etkinlikten ayrıl
        await updateDoc(doc(db, 'events', eventId), {
          participants: arrayRemove(user.uid),
        });
        
        // Bildirimlerini iptal et
        await cancelEventNotifications(eventId);
        
        Alert.alert('Başarılı', 'Etkinlikten ayrıldınız');
      } else {
        // Etkinliğe katıl
        if (eventParticipants.length >= event.capacity && event.capacity > 0) {
          Alert.alert('Uyarı', 'Etkinlik kapasitesi doldu');
          return;
        }
        
        // Get current user name
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const currentUserName = userDoc.exists() ? userDoc.data().name : 'Kullanıcı';
        
        await updateDoc(doc(db, 'events', eventId), {
          participants: arrayUnion(user.uid),
        });
        
        // Etkinlik hatırlatıcılarını planla (1 gün ve 1 saat önce)
        await scheduleEventReminders(eventId, event.eventName, event.date);
        
        // Organizatöre yeni katılımcı bildirimi gönder (eğer organizatör başka biriyse)
        if (event.creatorId !== user.uid) {
          await sendNewParticipantNotification(event.eventName, currentUserName);
        }
        
        Alert.alert('Başarılı', 'Etkinliğe katıldınız! 🎉\n\nEtkinlik yaklaştığında size hatırlatma bildirimi göndereceğiz.');
      }

      // Etkinliği yeniden yükle
      loadEventDetails();
    } catch (error) {
      console.error('Katılım hatası:', error);
      Alert.alert('Hata', 'İşlem yapılırken bir hata oluştu');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Etkinlik bulunamadı</Text>
      </View>
    );
  }

  const isCreator = event.creatorId === user?.uid;
  const eventParticipants = event.participants || [];
  const isParticipant = eventParticipants.includes(user?.uid);
  
  // Etkinlik bitti mi kontrol et
  const eventDate = new Date(event.date);
  const now = new Date();
  const isEventPast = eventDate < now;

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
        <Text style={styles.headerTitle}>Etkinlik Detayı</Text>
        {isCreator && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditEvent', { eventId: event.id })}
          >
            <Text style={styles.editButtonText}>Düzenle</Text>
          </TouchableOpacity>
        )}
        {!isCreator && <View style={styles.placeholder} />}
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Photos Gallery */}
        {event.images && event.images.length > 0 && (
          <View style={styles.photosContainer}>
            <ScrollView 
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosScrollContent}
            >
              {event.images.map((imageUrl, index) => (
                <Image
                  key={index}
                  source={{ uri: imageUrl }}
                  style={styles.eventImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            
            {event.images.length > 1 && (
              <View style={styles.photoIndicatorContainer}>
                <View style={styles.photoIndicatorBadge}>
                  <Ionicons name="images-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.photoIndicatorText}>
                    1/{event.images.length}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Event Info Card */}
        <View style={styles.eventCard}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
          
          <Text style={styles.eventName}>{event.eventName}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#666666" style={styles.infoIcon} />
            <Text style={styles.infoText}>{formatDate(event.date)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666666" style={styles.infoIcon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>
                {event.city && `${event.city}`}
                {event.district && ` / ${event.district}`}
                {(event.city || event.district) && ' - '}
                {event.location}
              </Text>
              <Text style={styles.infoSubtext}>{event.address}</Text>
            </View>
          </View>

          {/* Dual info row - Participants and Age */}
          <View style={styles.dualInfoRow}>
            <View style={styles.dualInfoItem}>
              <Ionicons name="people-outline" size={20} color="#666666" style={styles.infoIcon} />
              <Text style={styles.infoTextSmall}>
                {eventParticipants.length} / {event.capacity > 0 ? event.capacity : '∞'}
              </Text>
            </View>
            
            {event.ageRange && event.ageRange !== 'Tüm Yaşlar' && (
              <View style={styles.dualInfoItem}>
                <Ionicons name="calendar-outline" size={20} color="#666666" style={styles.infoIcon} />
                <Text style={styles.infoTextSmall}>{event.ageRange}</Text>
              </View>
            )}
          </View>

          {/* Dual info row - Gender and Organizer */}
          <View style={styles.dualInfoRow}>
            {event.participantFilter && event.participantFilter !== 'Herkes' && (
              <View style={styles.dualInfoItem}>
                <Ionicons 
                  name={event.participantFilter === 'Sadece Kadınlar' ? 'woman-outline' : 'man-outline'} 
                  size={20} 
                  color="#666666" 
                  style={styles.infoIcon} 
                />
                <Text style={styles.infoTextSmall}>{event.participantFilter}</Text>
              </View>
            )}
            
            <View style={[styles.dualInfoItem, { flex: 1 }]}>
              <Ionicons name="person-outline" size={20} color="#666666" style={styles.infoIcon} />
              <Text style={styles.infoTextSmall} numberOfLines={1}>
                {event.creatorName}
              </Text>
            </View>
          </View>
        </View>

        {/* Description Card */}
        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Açıklama</Text>
          <Text style={styles.descriptionText}>{event.description}</Text>
        </View>

        {/* Participants Card */}
        {eventParticipants.length > 0 && (
          <View style={styles.participantsCard}>
            <View style={styles.participantsHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="people" size={20} color="#000000" />
                <Text style={styles.sectionTitle}>
                  Katılımcılar ({eventParticipants.length})
                </Text>
              </View>
            </View>
            
            {loadingParticipants ? (
              <View style={styles.participantsLoading}>
                <ActivityIndicator size="small" color="#000000" />
              </View>
            ) : (
              <>
                <View style={styles.participantsList}>
                  {(showAllParticipants ? participants : participants.slice(0, 5)).map((participant) => (
                    <View key={participant.id} style={styles.participantItem}>
                      <View 
                        style={[
                          styles.participantAvatar,
                          { backgroundColor: getAvatarColor(participant.name) }
                        ]}
                      >
                        <Text style={styles.participantInitials}>
                          {getInitials(participant.name)}
                        </Text>
                      </View>
                      <View style={styles.participantInfo}>
                        <View style={styles.participantNameRow}>
                          <Text style={styles.participantName}>{participant.name}</Text>
                          {participant.isCreator && (
                            <View style={styles.creatorTag}>
                              <Text style={styles.creatorTagText}>Organizatör</Text>
                            </View>
                          )}
                        </View>
                        {(participant.city || participant.gender) && (
                          <View style={styles.participantDetailsRow}>
                            {participant.gender && (
                              <View style={styles.participantDetailItem}>
                                <Ionicons 
                                  name={participant.gender === 'Kadın' ? 'woman-outline' : 'man-outline'} 
                                  size={12} 
                                  color="#999999" 
                                />
                              </View>
                            )}
                            {participant.city && (
                              <View style={styles.participantDetailItem}>
                                <Ionicons name="location-outline" size={12} color="#999999" />
                                <Text style={styles.participantDetails}>{participant.city}</Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
                
                {/* Show More Button */}
                {participants.length > 5 && (
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => setShowAllParticipants(!showAllParticipants)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.showMoreText}>
                      {showAllParticipants 
                        ? '▲ Daha Az Göster' 
                        : `▼ ${participants.length - 5} Kişi Daha Göster`
                      }
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* Chat Button - For participants and creator */}
        {(isParticipant || isCreator) && (
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => navigation.navigate('Chat', { 
              eventId: event.id,
              eventTitle: event.eventName 
            })}
            activeOpacity={0.7}
          >
            <View style={styles.chatButtonContent}>
              <Text style={styles.chatButtonIcon}>💬</Text>
              <View style={styles.chatButtonTextContainer}>
                <Text style={styles.chatButtonTitle}>Grup Sohbeti</Text>
                <Text style={styles.chatButtonSubtitle}>Katılımcılarla mesajlaş</Text>
              </View>
              <Text style={styles.chatButtonArrow}>›</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Rate Event Button - Only for past events and participants */}
        {isEventPast && !isCreator && isParticipant && (
          <TouchableOpacity 
            style={styles.rateButton}
            onPress={() => navigation.navigate('RateEvent', { 
              eventId: event.id,
              organizerId: event.creatorId 
            })}
            activeOpacity={0.7}
          >
            <View style={styles.rateButtonContent}>
              <Text style={styles.rateButtonIcon}>⭐</Text>
              <View style={styles.rateButtonTextContainer}>
                <Text style={styles.rateButtonTitle}>Etkinliği Değerlendir</Text>
                <Text style={styles.rateButtonSubtitle}>Deneyimini paylaş</Text>
              </View>
              <Text style={styles.rateButtonArrow}>›</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Join/Leave Button */}
        {!isCreator && (
          <TouchableOpacity 
            style={[
              styles.joinButton,
              isParticipant && styles.leaveButton
            ]}
            onPress={handleJoinEvent}
          >
            <Text style={[
              styles.joinButtonText,
              isParticipant && styles.leaveButtonText
            ]}>
              {isParticipant ? 'Etkinlikten Ayrıl' : 'Etkinliğe Katıl'}
            </Text>
          </TouchableOpacity>
        )}

        {isCreator && (
          <View style={styles.creatorBadgeContainer}>
            <View style={styles.creatorBadge}>
              <Text style={styles.creatorBadgeText}>✨ Bu etkinlik senin tarafından oluşturuldu</Text>
            </View>
          </View>
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
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
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#000000',
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  photosContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  photosScrollContent: {
    paddingHorizontal: 0,
  },
  eventImage: {
    width: 400, // Fixed width for paging
    height: 300,
    backgroundColor: '#E0E0E0',
  },
  photoIndicatorContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  photoIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  photoIndicatorText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  eventCard: {
    backgroundColor: '#ffffff',
    margin: 24,
    marginBottom: 16,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  eventName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 10,
    width: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoText: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '600',
  },
  infoSubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  dualInfoRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  dualInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
  },
  infoTextSmall: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
    flex: 1,
  },
  descriptionCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 24,
  },
  joinButton: {
    marginHorizontal: 24,
    marginTop: 8,
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  leaveButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#000000',
  },
  joinButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  leaveButtonText: {
    color: '#000000',
  },
  creatorBadgeContainer: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  creatorBadge: {
    backgroundColor: '#fff8e1',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffd54f',
    alignItems: 'center',
  },
  creatorBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f57f17',
  },
  participantsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  participantsHeader: {
    marginBottom: 16,
  },
  participantsLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  participantsList: {
    gap: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 16,
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  participantInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  participantInfo: {
    flex: 1,
  },
  participantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginRight: 8,
  },
  creatorTag: {
    backgroundColor: '#ffd54f',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  creatorTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f57f17',
  },
  participantDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  participantDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  participantDetails: {
    fontSize: 11,
    color: '#999999',
  },
  showMoreButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  chatButton: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#000000',
  },
  chatButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatButtonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  chatButtonTextContainer: {
    flex: 1,
  },
  chatButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  chatButtonSubtitle: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  chatButtonArrow: {
    fontSize: 28,
    color: '#000000',
    fontWeight: '300',
  },
  rateButton: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FFD54F',
  },
  rateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateButtonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  rateButtonTextContainer: {
    flex: 1,
  },
  rateButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 4,
  },
  rateButtonSubtitle: {
    fontSize: 13,
    color: '#F9A825',
    fontWeight: '500',
  },
  rateButtonArrow: {
    fontSize: 28,
    color: '#F57F17',
    fontWeight: '300',
  },
  bottomPadding: {
    height: 40,
  },
});

