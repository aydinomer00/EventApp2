import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc,
  getDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../locales/translations';

export default function MessagesScreen({ navigation }) {
  const { language } = useLanguage();
  const [eventChats, setEventChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    loadUserEvents();
  }, []);

  const loadUserEvents = () => {
    // Kullanıcının katıldığı etkinlikleri dinle
    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const events = [];
      
      for (const eventDoc of snapshot.docs) {
        const eventData = eventDoc.data();
        
        // Her etkinlik için son mesajı al
        const lastMessage = await getLastMessage(eventDoc.id);
        
        events.push({
          id: eventDoc.id,
          eventName: eventData.eventName,
          category: eventData.category,
          creatorName: eventData.creatorName,
          participantsCount: eventData.participants?.length || 0,
          lastMessage: lastMessage,
        });
      }
      
      // Son mesaja göre sırala
      events.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp?.toMillis() || 0;
        const timeB = b.lastMessage?.timestamp?.toMillis() || 0;
        return timeB - timeA;
      });
      
      setEventChats(events);
      setLoading(false);
    });

    return unsubscribe;
  };

  const getLastMessage = async (eventId) => {
    try {
      const messagesRef = collection(db, 'events', eventId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
      
      return new Promise((resolve) => {
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const messageData = snapshot.docs[0].data();
            resolve({
              text: messageData.text,
              userName: messageData.userName,
              timestamp: messageData.createdAt,
              isFromCurrentUser: messageData.userId === user.uid,
            });
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Son mesaj yükleme hatası:', error);
      return null;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = timestamp.toDate();
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor((now - messageDate) / (1000 * 60));
      return minutes < 1 ? 'Şimdi' : `${minutes} dk`;
    } else if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'Dün';
    } else if (diffInHours < 168) { // 7 gün
      const days = Math.floor(diffInHours / 24);
      return `${days} gün önce`;
    } else {
      return messageDate.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'short' 
      });
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

  const getCategoryEmoji = (category) => {
    const emojis = {
      'Kahve & Sohbet': '☕',
      'Yemek': '🍽️',
      'Spor': '⚽',
      'Gezi': '🌍',
      'Sanat': '🎨',
      'Oyun': '🎮',
      'Parti': '🎉',
    };
    return emojis[category] || '📅';
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('Chat', {
        eventId: item.id,
        eventTitle: item.eventName,
      })}
      activeOpacity={0.7}
    >
      <View style={[
        styles.eventAvatar,
        { backgroundColor: getAvatarColor(item.eventName) }
      ]}>
        <Text style={styles.eventEmoji}>
          {getCategoryEmoji(item.category)}
        </Text>
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.eventName} numberOfLines={1}>
            {item.eventName}
          </Text>
          {item.lastMessage && (
            <Text style={styles.timeText}>
              {formatTime(item.lastMessage.timestamp)}
            </Text>
          )}
        </View>

        <View style={styles.messagePreview}>
          {item.lastMessage ? (
            <Text style={styles.lastMessageText} numberOfLines={1}>
              {item.lastMessage.isFromCurrentUser && 'Sen: '}
              {item.lastMessage.text}
            </Text>
          ) : (
            <Text style={styles.noMessageText}>
              {language === 'tr' ? 'Henüz mesaj yok' : 'No messages yet'}
            </Text>
          )}
        </View>

        <View style={styles.chatMeta}>
          <View style={styles.participantCount}>
            <Ionicons name="people-outline" size={14} color="#999999" />
            <Text style={styles.participantCountText}>
              {item.participantsCount} {language === 'tr' ? 'kişi' : (item.participantsCount === 1 ? 'person' : 'people')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.chevron}>
        <Text style={styles.chevronText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>{t(language, 'noConversations')}</Text>
      <Text style={styles.emptyText}>
        {language === 'tr' 
          ? 'Bir etkinliğe katıldığınızda grup sohbetleri burada görünecek'
          : 'Group chats will appear here when you join an event'}
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('HomePage')}
        activeOpacity={0.7}
      >
        <Text style={styles.exploreButtonText}>{t(language, 'discoverEvents')}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Mesajlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t(language, 'messages')}</Text>
        <Text style={styles.headerSubtitle}>
          {eventChats.length} {language === 'tr' ? 'sohbet' : 'chat'}{eventChats.length !== 1 ? (language === 'tr' ? 'ler' : 's') : ''}
        </Text>
      </View>

      <FlatList
        data={eventChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  listContent: {
    paddingTop: 8,
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  eventAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventEmoji: {
    fontSize: 28,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#999999',
  },
  messagePreview: {
    marginBottom: 4,
  },
  lastMessageText: {
    fontSize: 14,
    color: '#666666',
  },
  noMessageText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
  chatMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantCountText: {
    fontSize: 12,
    color: '#999999',
  },
  chevron: {
    marginLeft: 12,
  },
  chevronText: {
    fontSize: 24,
    color: '#CCCCCC',
    fontWeight: '300',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

