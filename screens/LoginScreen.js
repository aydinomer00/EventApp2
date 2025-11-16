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
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { createAdminAccount } from '../utils/createAdminHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../locales/translations';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t(language, 'error'), t(language, 'fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state değiştiğinde otomatik olarak ana ekrana yönlendirilecek
    } catch (error) {
      console.error('Giriş hatası:', error.message);
      let errorMessage = t(language, 'loginError');
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = t(language, 'invalidEmail');
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = t(language, 'userNotFound');
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = t(language, 'wrongPassword');
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = t(language, 'invalidCredentials');
      }
      
      Alert.alert(t(language, 'error'), errorMessage);
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
        t(language, 'createAdminAccount'),
        `${t(language, 'newAdminInfo')}\n\n${t(language, 'username')}: ${adminUsername}\n${t(language, 'email')}: ${adminEmail}\n${t(language, 'password')}: 123456`,
        [
          {
            text: t(language, 'cancel'),
            style: 'cancel',
          },
          {
            text: t(language, 'create'),
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
                  t(language, 'adminCreated'),
                  `${t(language, 'adminCreatedMessage')}\n\n${t(language, 'username')}: ${adminUsername}\n${t(language, 'email')}: ${adminEmail}\n${t(language, 'password')}: ${adminPassword}\n\n${t(language, 'saveCredentials')}`,
                  [
                    {
                      text: t(language, 'ok'),
                      onPress: () => {
                        setEmail(adminEmail);
                        setPassword(adminPassword);
                      }
                    }
                  ]
                );
              } else {
                setLoading(false);
                Alert.alert(t(language, 'error'), result.message);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Admin oluşturma hatası:', error);
      Alert.alert(t(language, 'error'), t(language, 'loginError'));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />
          
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar" size={48} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.headerTitle}>Event App</Text>
          <Text style={styles.headerSubtitle}>{t(language, 'loginSubtitle')}</Text>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[
              styles.formCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.formTitle}>{t(language, 'welcomeBack')}</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabelContainer}>
                <Ionicons name="mail-outline" size={18} color="#667eea" />
                <Text style={styles.inputLabel}>{t(language, 'email')}</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail" size={20} color="#999" style={styles.inputIconLeft} />
                <TextInput
                  style={styles.input}
                  placeholder={t(language, 'emailPlaceholder')}
                  placeholderTextColor="#adb5bd"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabelContainer}>
                <Ionicons name="lock-closed-outline" size={18} color="#667eea" />
                <Text style={styles.inputLabel}>{t(language, 'password')}</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={20} color="#999" style={styles.inputIconLeft} />
                <TextInput
                  style={styles.input}
                  placeholder={t(language, 'passwordPlaceholder')}
                  placeholderTextColor="#adb5bd"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ['#adb5bd', '#adb5bd'] : ['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>{t(language, 'loginButton')}</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register Link */}
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Ionicons name="person-add-outline" size={20} color="#667eea" />
              <Text style={styles.registerButtonText}>{t(language, 'signUp')}</Text>
            </TouchableOpacity>

            {/* Admin Button */}
            <TouchableOpacity 
              style={styles.adminButton} 
              onPress={handleCreateAdmin}
              activeOpacity={0.7}
            >
              <Ionicons name="shield-checkmark-outline" size={16} color="#856404" />
              <Text style={styles.adminButtonText}>{t(language, 'createFirstAdmin')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  gradientHeader: {
    height: height * 0.35,
    paddingTop: 50,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    bottom: 20,
    left: -30,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: 100,
    left: width * 0.7,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    marginTop: -30,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginLeft: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#e9ecef',
  },
  inputIconLeft: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212529',
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonDisabled: {
    shadowOpacity: 0.1,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#adb5bd',
    fontSize: 14,
    fontWeight: '500',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: '#667eea',
    gap: 8,
  },
  registerButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#ffc107',
    gap: 6,
  },
  adminButtonText: {
    color: '#856404',
    fontSize: 13,
    fontWeight: '600',
  },
});

