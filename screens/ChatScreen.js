import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export default function ChatScreen({ route, navigation }) {
  const { eventId, eventTitle } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [eventData, setEventData] = useState(null);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const user = auth.currentUser;

  useEffect(() => {
    loadUserName();
    loadEventData();
    loadMessages();
    listenToTypingIndicators();
  }, [eventId]);

  const loadUserName = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setCurrentUserName(userDoc.data().name || 'Kullanıcı');
      }
    } catch (error) {
      console.error('Kullanıcı adı yükleme hatası:', error);
    }
  };

  const loadEventData = async () => {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        setEventData({ id: eventDoc.id, ...eventDoc.data() });
      }
    } catch (error) {
      console.error('Etkinlik verisi yükleme hatası:', error);
    }
  };

  const loadMessages = () => {
    const messagesRef = collection(db, 'events', eventId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
      setLoading(false);
      
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, (error) => {
      console.error('Mesajları yükleme hatası:', error);
      Alert.alert('Hata', 'Mesajlar yüklenirken bir hata oluştu');
      setLoading(false);
    });

    return unsubscribe;
  };

  const listenToTypingIndicators = () => {
    const typingRef = collection(db, 'events', eventId, 'typing');
    
    const unsubscribe = onSnapshot(typingRef, (snapshot) => {
      const typing = [];
      snapshot.forEach((doc) => {
        if (doc.id !== user.uid) { // Kendi yazma durumunu gösterme
          typing.push({
            userId: doc.id,
            userName: doc.data().userName,
          });
        }
      });
      setTypingUsers(typing);
    });

    return unsubscribe;
  };

  const setTypingStatus = async (isTyping) => {
    try {
      const typingDocRef = doc(db, 'events', eventId, 'typing', user.uid);
      
      if (isTyping) {
        await setDoc(typingDocRef, {
          userName: currentUserName,
          timestamp: serverTimestamp(),
        });
      } else {
        await deleteDoc(typingDocRef);
      }
    } catch (error) {
      console.error('Typing status hatası:', error);
    }
  };

  const handleTyping = (text) => {
    setNewMessage(text);
    
    // Typing indicator'ı başlat
    if (text.length > 0) {
      setTypingStatus(true);
      
      // Önceki timeout'u temizle
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // 2 saniye sonra typing'i kaldır
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(false);
      }, 2000);
    } else {
      setTypingStatus(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const messagesRef = collection(db, 'events', eventId, 'messages');
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        userId: user.uid,
        userName: currentUserName,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
      
      // Mesaj gönderildiğinde typing indicator'ı kaldır
      await setTypingStatus(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      Alert.alert('Hata', 'Mesaj gönderilemedi');
    } finally {
      setSending(false);
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

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (date - now) / (1000 * 60 * 60);

    if (diffInHours < 24 && diffInHours > 0) {
      return 'Bugün ' + date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48 && diffInHours > 24) {
      return 'Yarın ' + date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = timestamp.toDate();
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      // Bugün - sadece saat göster
      return messageDate.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      // Dün
      return 'Dün ' + messageDate.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      // Tarih göster
      return messageDate.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const renderMessage = ({ item, index }) => {
    const isMyMessage = item.userId === user.uid;
    const showAvatar = !isMyMessage && (index === 0 || messages[index - 1].userId !== item.userId);

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        {!isMyMessage && (
          <View style={styles.avatarContainer}>
            {showAvatar ? (
              <View style={[
                styles.avatar,
                { backgroundColor: getAvatarColor(item.userName) }
              ]}>
                <Text style={styles.avatarText}>
                  {getInitials(item.userName)}
                </Text>
              </View>
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          {!isMyMessage && showAvatar && (
            <Text style={styles.senderName}>{item.userName}</Text>
          )}
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime
          ]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubble-ellipses-outline" size={64} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>Henüz mesaj yok</Text>
      <Text style={styles.emptyText}>
        Grup sohbetine ilk mesajı sen yaz!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Sohbet yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Custom Header */}
      {eventData && (
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.headerContent}
            onPress={() => navigation.navigate('EventDetail', { eventId: eventData.id })}
            activeOpacity={0.7}
          >
            <View style={styles.eventIconContainer}>
              <Text style={styles.eventIcon}>
                {getCategoryEmoji(eventData.category)}
              </Text>
            </View>
            
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {eventData.eventName}
              </Text>
              <View style={styles.headerSubtitleContainer}>
                <Ionicons name="people-outline" size={12} color="#FFFFFF" />
                <Text style={styles.headerSubtitle}>
                  {eventData.participants?.length || 0} kişi • {formatEventDate(eventData.date)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => navigation.navigate('EventDetail', { eventId: eventData.id })}
            activeOpacity={0.7}
          >
            <Text style={styles.moreButtonText}>ⓘ</Text>
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={() => {
          if (typingUsers.length === 0) return null;
          return (
            <View style={styles.typingIndicatorContainer}>
              <View style={styles.typingBubble}>
                <Text style={styles.typingText}>
                  {typingUsers.length === 1
                    ? `${typingUsers[0].userName} yazıyor...`
                    : `${typingUsers.length} kişi yazıyor...`}
                </Text>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            </View>
          );
        }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mesajını yaz..."
          placeholderTextColor="#999999"
          value={newMessage}
          onChangeText={handleTyping}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
          activeOpacity={0.7}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendButtonText}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventIcon: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  moreButtonText: {
    fontSize: 22,
    color: '#000000',
  },
  chatContainer: {
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
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 36,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  myMessageBubble: {
    backgroundColor: '#000000',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#000000',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  typingIndicatorContainer: {
    paddingVertical: 8,
    paddingLeft: 44,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: 13,
    color: '#666666',
    fontStyle: 'italic',
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#999999',
  },
});

