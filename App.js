import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { auth, db } from './config/firebase';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import TabNavigator from './navigation/TabNavigator';
import PendingApprovalScreen from './screens/PendingApprovalScreen';
import AdminPanelScreen from './screens/AdminPanelScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ContactScreen from './screens/ContactScreen';
import { 
  registerForPushNotificationsAsync, 
  savePushTokenToUser 
} from './services/notificationService';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Onboarding kontrolü
    const checkOnboarding = async () => {
      const completed = await AsyncStorage.getItem('onboardingCompleted');
      setOnboardingCompleted(completed === 'true');
    };
    checkOnboarding();

    // Onboarding tamamlandığında state'i güncellemek için listener
    const interval = setInterval(async () => {
      const completed = await AsyncStorage.getItem('onboardingCompleted');
      if (completed === 'true' && onboardingCompleted === false) {
        setOnboardingCompleted(true);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [onboardingCompleted]);

  useEffect(() => {
    let unsubscribeFirestore = null;

    // Firebase auth state dinleyicisi
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Push notification token'ı al ve kaydet
        registerForPushNotificationsAsync().then(token => {
          if (token) {
            savePushTokenToUser(currentUser.uid, token);
          }
        });

        // Kullanıcı giriş yapmışsa Firestore'u GERÇEK ZAMANLI dinle
        try {
          unsubscribeFirestore = onSnapshot(
            doc(db, 'users', currentUser.uid),
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                console.log('👤 Kullanıcı verisi güncellendi:', data);
                setUserData(data);
              }
              setLoading(false);
            },
            (error) => {
              console.error('Firestore dinleme hatası:', error);
              setLoading(false);
            }
          );
        } catch (error) {
          console.error('Kullanıcı bilgileri alınamadı:', error);
          setLoading(false);
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    // Cleanup function - her iki listener'ı da temizle
    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  // Push notification listener'ları
  useEffect(() => {
    // Notification geldiğinde
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
    });

    // Notification'a tıklandığında
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🔔 Notification tapped:', response);
      const data = response.notification.request.content.data;
      
      // TODO: Navigate to specific screen based on notification type
      // if (data.eventId) {
      //   navigation.navigate('EventDetail', { eventId: data.eventId });
      // }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Loading ekranı
  if (loading || onboardingCompleted === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Kullanıcı durumuna göre ekranları belirle
  const getScreens = () => {
    // Onboarding tamamlanmamışsa ve giriş yapılmamışsa
    if (!onboardingCompleted && !user) {
      return <Stack.Screen name="Onboarding" component={OnboardingScreen} />;
    }

    if (!user) {
      // Giriş yapılmamış
      return (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      );
    }

    // Admin kontrolü
    if (userData?.role === 'admin') {
      return <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />;
    }

    // Onay bekliyor
    if (userData?.isPending) {
      return (
        <>
          <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
          <Stack.Screen name="Contact" component={ContactScreen} />
        </>
      );
    }

    // Reddedilmiş
    if (userData?.isRejected) {
      return (
        <>
          <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
          <Stack.Screen name="Contact" component={ContactScreen} />
        </>
      );
    }

    // Aktif kullanıcı
    if (userData?.isActive) {
      return <Stack.Screen name="Main" component={TabNavigator} />;
    }

    // Varsayılan: Pending
    return (
      <>
        <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
      </>
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {getScreens()}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});
