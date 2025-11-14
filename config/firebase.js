import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase yapılandırması - Google Services dosyalarından alınan bilgiler
const firebaseConfig = {
  apiKey: "AIzaSyDBtS5tQp4RwYem325DrnK9YTUUD4KSmak",
  authDomain: "eventapp-79aa3.firebaseapp.com",
  projectId: "eventapp-79aa3",
  storageBucket: "eventapp-79aa3.firebasestorage.app",
  messagingSenderId: "221365246151",
  appId: "1:221365246151:android:5fbca64ce3fa507b8846e2"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Auth'u AsyncStorage ile başlat (oturum kalıcılığı için)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Firestore'u başlat
const db = getFirestore(app);

// Storage'ı başlat
const storage = getStorage(app);

export { auth, db, storage };
export default app;

