import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc,
  query,
  where,
  getDocs,
  increment,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export default function RateEventScreen({ route, navigation }) {
  const { eventId, organizerId } = route.params;
  const [event, setEvent] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    loadEventData();
  }, []);

  const loadEventData = async () => {
    try {
      // Etkinlik bilgilerini al
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        setEvent({ id: eventDoc.id, ...eventDoc.data() });
      }

      // Organizatör bilgilerini al
      const organizerDoc = await getDoc(doc(db, 'users', organizerId));
      if (organizerDoc.exists()) {
        setOrganizer({ id: organizerDoc.id, ...organizerDoc.data() });
      }

      setLoading(false);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Uyarı', 'Lütfen bir değerlendirme puanı verin');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir yorum yazın');
      return;
    }

    setSubmitting(true);
    try {
      // Daha önce değerlendirme yapılmış mı kontrol et
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef,
        where('eventId', '==', eventId),
        where('reviewerId', '==', user.uid)
      );
      const existingReviews = await getDocs(q);

      if (!existingReviews.empty) {
        Alert.alert('Uyarı', 'Bu etkinliği zaten değerlendirdiniz');
        setSubmitting(false);
        return;
      }

      // Değerlendirmeyi kaydet
      await addDoc(collection(db, 'reviews'), {
        eventId: eventId,
        eventName: event.eventName,
        organizerId: organizerId,
        reviewerId: user.uid,
        reviewerName: user.displayName || 'Kullanıcı',
        rating: rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      });

      // Organizatörün toplam rating'ini güncelle
      await updateOrganizerRating(organizerId, rating);

      setSubmitting(false);
      Alert.alert(
        'Teşekkürler! 🎉',
        'Değerlendirmeniz kaydedildi.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          }
        ]
      );
    } catch (error) {
      console.error('Değerlendirme kaydetme hatası:', error);
      setSubmitting(false);
      Alert.alert('Hata', 'Değerlendirme kaydedilirken bir hata oluştu');
    }
  };

  const updateOrganizerRating = async (organizerId, newRating) => {
    try {
      const organizerRef = doc(db, 'users', organizerId);
      
      // Organizatörün mevcut rating'lerini al
      const organizerDoc = await getDoc(organizerRef);
      const currentData = organizerDoc.data();
      const currentTotalRating = currentData.totalRating || 0;
      const currentReviewCount = currentData.reviewCount || 0;

      // Yeni ortalamayı hesapla
      const newTotalRating = currentTotalRating + newRating;
      const newReviewCount = currentReviewCount + 1;
      const newAverageRating = newTotalRating / newReviewCount;

      // Güncelle
      await updateDoc(organizerRef, {
        totalRating: newTotalRating,
        reviewCount: newReviewCount,
        averageRating: parseFloat(newAverageRating.toFixed(1)),
      });

      // Yüksek rating varsa rozet ver
      if (newAverageRating >= 4.5 && newReviewCount >= 5) {
        await updateDoc(organizerRef, {
          badges: {
            trustedOrganizer: true,
            trustedOrganizerEarnedAt: new Date().toISOString(),
          }
        });
      }
    } catch (error) {
      console.error('Rating güncelleme hatası:', error);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            activeOpacity={0.7}
            style={styles.starButton}
          >
            <Ionicons 
              name={rating >= star ? 'star' : 'star-outline'} 
              size={40} 
              color={rating >= star ? '#FFD700' : '#E0E0E0'} 
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingText = () => {
    const ratings = {
      1: 'Çok Kötü 😞',
      2: 'Kötü 😕',
      3: 'Orta 😐',
      4: 'İyi 😊',
      5: 'Mükemmel 🤩',
    };
    return rating > 0 ? ratings[rating] : 'Bir puan seçin';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Etkinliği Değerlendir</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Event Info Card */}
        <View style={styles.eventCard}>
          <Text style={styles.eventName}>{event?.eventName}</Text>
          <Text style={styles.eventCategory}>{event?.category}</Text>
        </View>

        {/* Organizer Card */}
        <View style={styles.organizerCard}>
          <View style={styles.organizerAvatar}>
            <Text style={styles.organizerInitials}>
              {organizer?.name?.substring(0, 2).toUpperCase() || '??'}
            </Text>
          </View>
          <View style={styles.organizerInfo}>
            <Text style={styles.organizerLabel}>Organizatör</Text>
            <Text style={styles.organizerName}>{organizer?.name}</Text>
            {organizer?.averageRating && (
              <View style={styles.organizerRating}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.organizerRatingText}>
                  {organizer.averageRating} ({organizer.reviewCount} değerlendirme)
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Organizatörü Değerlendir</Text>
          <Text style={styles.sectionSubtitle}>
            Etkinlik deneyiminiz nasıldı?
          </Text>

          {renderStars()}
          
          <Text style={styles.ratingText}>{getRatingText()}</Text>
        </View>

        {/* Comment Section */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Yorumunuz</Text>
          <Text style={styles.sectionSubtitle}>
            Deneyiminizi diğer kullanıcılarla paylaşın
          </Text>

          <TextInput
            style={styles.commentInput}
            placeholder="Etkinlik hakkında düşüncelerinizi yazın..."
            placeholderTextColor="#999999"
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          
          <Text style={styles.characterCount}>
            {comment.length}/500
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (rating === 0 || !comment.trim() || submitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || !comment.trim() || submitting}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Değerlendirmeyi Gönder</Text>
          )}
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Değerlendirmeleriniz organizatörlerin kalitesini artırmamıza ve diğer kullanıcıların 
            daha iyi kararlar almasına yardımcı olur.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  eventCategory: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  organizerCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  organizerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  organizerInitials: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  organizerInfo: {
    flex: 1,
  },
  organizerLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  organizerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  organizerRating: {
    fontSize: 13,
    color: '#666666',
  },
  ratingSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 48,
    color: '#CCCCCC',
  },
  starFilled: {
    color: '#FFD700',
  },
  ratingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  commentSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  commentInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#000000',
    minHeight: 120,
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E7F5FF',
    padding: 16,
    borderRadius: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#495057',
    lineHeight: 20,
  },
});

