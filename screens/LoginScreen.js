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
  ActivityIndicator,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { createAdminAccount } from '../utils/createAdminHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state değiştiğinde otomatik olarak ana ekrana yönlendirilecek
    } catch (error) {
      console.error('Giriş hatası:', error.message);
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Hatalı şifre';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'E-posta veya şifre hatalı';
      }
      
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      // Mevcut admin sayısını al
      const currentCountStr = await AsyncStorage.getItem('adminCount');
      const currentCount = currentCountStr ? parseInt(currentCountStr) : 0;
      const nextCount = currentCount + 1;
      
      // admin1, admin2, admin3 şeklinde oluştur
      const adminUsername = `admin${nextCount}`;
      const adminEmail = `${adminUsername}@test.com`;
      const adminPassword = '123456';
      
      Alert.alert(
        'Admin Hesabı Oluştur',
        `Yeni admin hesabı oluşturulacak:\n\nKullanıcı: ${adminUsername}\nE-posta: ${adminEmail}\nŞifre: 123456`,
        [
          {
            text: 'İptal',
            style: 'cancel',
          },
          {
            text: 'Oluştur',
            onPress: async () => {
              setLoading(true);
              const result = await createAdminAccount(
                adminEmail,
                adminPassword,
                adminUsername
              );
              
              if (result.success) {
                // Admin sayısını artır
                await AsyncStorage.setItem('adminCount', nextCount.toString());
                
                setLoading(false);
                Alert.alert(
                  'Başarılı! 🎉',
                  `Admin hesabı oluşturuldu!\n\nKullanıcı: ${adminUsername}\nE-posta: ${adminEmail}\nŞifre: ${adminPassword}\n\n⚠️ Bu bilgileri kaydedin!`,
                  [
                    {
                      text: 'Tamam',
                      onPress: () => {
                        setEmail(adminEmail);
                        setPassword(adminPassword);
                      }
                    }
                  ]
                );
              } else {
                setLoading(false);
                Alert.alert('Hata', result.message);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Admin oluşturma hatası:', error);
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/Login.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Hoş Geldiniz</Text>
        <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput
              style={styles.input}
              placeholder="E-posta adresiniz"
              placeholderTextColor="#adb5bd"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Şifreniz"
              placeholderTextColor="#adb5bd"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Hesabınız yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>

        {/* Admin Hesabı Oluşturma Butonu (Sadece Geliştirme İçin) */}
        <TouchableOpacity 
          style={styles.adminButton} 
          onPress={handleCreateAdmin}
        >
          <Text style={styles.adminButtonText}>👑 İlk Admin Hesabını Oluştur</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#212529',
  },
  loginButton: {
    backgroundColor: '#007bff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#007bff',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: '#adb5bd',
    shadowOpacity: 0.2,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  registerText: {
    color: '#6c757d',
    fontSize: 15,
  },
  registerLink: {
    color: '#007bff',
    fontSize: 15,
    fontWeight: '700',
  },
  adminButton: {
    marginTop: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  adminButtonText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '700',
  },
});

