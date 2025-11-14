import React, { useState, useRef } from 'react';
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
  Dimensions,
  PanResponder,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Svg, { Path } from 'react-native-svg';
import { auth, db } from '../config/firebase';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Step 0: Etik Taahhüt (İmza)
  const [signaturePaths, setSignaturePaths] = useState([]);
  const [currentSignaturePath, setCurrentSignaturePath] = useState([]);
  
  // Step 1: Temel Bilgiler
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  
  // Step 2: Kişisel Bilgiler
  const [gender, setGender] = useState('');
  const [birthYear, setBirthYear] = useState('');
  
  // Step 3: Konum
  const [city, setCity] = useState('');
  
  // Step 4: Sosyal Medya
  const [instagram, setInstagram] = useState('');

  const totalSteps = 5;

  // İmza çizimi için PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentSignaturePath([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        // Sadece çizim alanı içindeyse çiz
        if (locationX >= 0 && locationX <= width - 80 && locationY >= 0 && locationY <= height * 0.25) {
          setCurrentSignaturePath((prev) => [...prev, { x: locationX, y: locationY }]);
        }
      },
      onPanResponderRelease: () => {
        if (currentSignaturePath.length > 0) {
          setSignaturePaths((prev) => [...prev, currentSignaturePath]);
          setCurrentSignaturePath([]);
        }
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
    })
  ).current;

  // E-posta formatını kontrol et
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // E-posta değiştiğinde kontrol et
  const handleEmailChange = (text) => {
    setEmail(text);
    
    if (text.length === 0) {
      setEmailError('');
      setIsEmailValid(false);
    } else if (!validateEmail(text)) {
      setEmailError('Geçerli bir e-posta adresi girin (örn: isim@email.com)');
      setIsEmailValid(false);
    } else {
      setEmailError('');
      setIsEmailValid(true);
    }
  };

  const validateStep1 = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return false;
    }
    
    if (!validateEmail(email)) {
      Alert.alert('Geçersiz E-posta', 'Lütfen geçerli bir e-posta adresi girin (örn: isim@email.com)');
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor!');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!gender || !birthYear) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return false;
    }
    const year = parseInt(birthYear);
    if (isNaN(year) || year < 1940 || year > 2010) {
      Alert.alert('Hata', 'Geçerli bir doğum yılı girin (1940-2010)');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!city) {
      Alert.alert('Hata', 'Lütfen şehir bilgisi girin');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!instagram) {
      Alert.alert('Hata', 'Lütfen Instagram kullanıcı adınızı girin');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 0:
        // İmza kontrolü
        isValid = signaturePaths.length > 0 || currentSignaturePath.length > 0;
        if (!isValid) {
          Alert.alert('Uyarı', 'Lütfen parmak izinizi veya imzanızı çizin');
        }
        break;
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        if (isValid) {
          handleRegister();
          return;
        }
        break;
    }
    
    if (isValid && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      // 1. Firebase Authentication ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Kullanıcı adını güncelle
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // 3. Firestore'da kullanıcı bilgilerini kaydet
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: name,
        email: email,
        gender: gender,
        birthYear: parseInt(birthYear),
        city: city,
        instagram: instagram.startsWith('@') ? instagram : `@${instagram}`,
        isActive: false, // Admin onayı bekliyor
        isPending: true,
        role: 'user',
        createdAt: new Date().toISOString(),
      });
      
      console.log('Kayıt başarılı, onay bekleniyor:', userCredential.user.email);
      
      // Kullanıcı otomatik olarak giriş yapmış olacak ama pending ekranı gösterilecek
      
    } catch (error) {
      console.error('Kayıt hatası:', error.message);
      let errorMessage = 'Kayıt olurken bir hata oluştu';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu e-posta adresi zaten kullanılıyor';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre çok zayıf. Daha güçlü bir şifre seçin';
      }
      
      Alert.alert('Hata', errorMessage);
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[0, 1, 2, 3, 4].map((step) => (
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

  const renderStep0 = () => {
    const hasSignature = signaturePaths.length > 0 || currentSignaturePath.length > 0;
    
    const renderPath = (path, index) => {
      if (path.length === 0) return null;
      let pathString = `M${path[0].x},${path[0].y}`;
      for (let i = 1; i < path.length; i++) {
        pathString += ` L${path[i].x},${path[i].y}`;
      }
      return (
        <Path
          key={index}
          d={pathString}
          stroke="#6f42c1"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    };

    const renderCurrentPath = () => {
      if (currentSignaturePath.length === 0) return null;
      let pathString = `M${currentSignaturePath[0].x},${currentSignaturePath[0].y}`;
      for (let i = 1; i < currentSignaturePath.length; i++) {
        pathString += ` L${currentSignaturePath[i].x},${currentSignaturePath[i].y}`;
      }
      return (
        <Path
          d={pathString}
          stroke="#6f42c1"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    };

    const handleClear = () => {
      setSignaturePaths([]);
      setCurrentSignaturePath([]);
    };

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Etik Taahhüt</Text>
        <Text style={styles.stepSubtitle}>
          Uygulamayı kullanırken etik değerlere uygun davranacağınızı taahhüt edin
        </Text>

        <View style={styles.signatureContainer}>
          <View 
            style={styles.signatureBox}
            {...panResponder.panHandlers}
          >
            <Svg
              height="100%"
              width="100%"
              style={styles.signatureSvg}
            >
              {signaturePaths.map((path, index) => renderPath(path, index))}
              {renderCurrentPath()}
            </Svg>
            
            {!hasSignature && (
              <View style={styles.placeholderContainer} pointerEvents="none">
                <Text style={styles.placeholderIcon}>👆</Text>
                <Text style={styles.placeholderText}>
                  Parmak izinizi veya imzanızı çizin
                </Text>
              </View>
            )}
            
            {hasSignature && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Bu taahhüt, uygulama içinde saygılı, dürüst ve etik davranışlar sergileyeceğinizi belirtir. 
            Topluluk kurallarına uygun hareket edeceğinizi onaylamış olursunuz.
          </Text>
        </View>
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Temel Bilgiler</Text>
      <Text style={styles.stepSubtitle}>Kayıt olmak için bilgilerinizi girin</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ad Soyad</Text>
        <TextInput
          style={styles.input}
          placeholder="Adınız ve Soyadınız"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>E-posta</Text>
        <View style={[
          styles.inputWrapper,
          emailError && styles.inputError,
          isEmailValid && styles.inputSuccess
        ]}>
          <TextInput
            style={styles.inputField}
            placeholder="ornek@email.com"
            placeholderTextColor="#adb5bd"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {email.length > 0 && (
            <Text style={[
              styles.validationIcon,
              isEmailValid ? styles.validIconSuccess : styles.validIconError
            ]}>
              {isEmailValid ? '✓' : '✗'}
            </Text>
          )}
        </View>
        {emailError ? (
          <Text style={styles.errorText}>{emailError}</Text>
        ) : null}
        {isEmailValid && (
          <Text style={styles.successText}>✓ Geçerli e-posta adresi</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Şifre</Text>
        <TextInput
          style={styles.input}
          placeholder="En az 6 karakter"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Şifre Tekrar</Text>
        <TextInput
          style={styles.input}
          placeholder="Şifrenizi tekrar girin"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Kişisel Bilgiler</Text>
      <Text style={styles.stepSubtitle}>Sizi daha iyi tanımak için</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Cinsiyet</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === 'Kadın' && styles.genderButtonActive,
            ]}
            onPress={() => setGender('Kadın')}
          >
            <Text
              style={[
                styles.genderText,
                gender === 'Kadın' && styles.genderTextActive,
              ]}
            >
              👩 Kadın
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === 'Erkek' && styles.genderButtonActive,
            ]}
            onPress={() => setGender('Erkek')}
          >
            <Text
              style={[
                styles.genderText,
                gender === 'Erkek' && styles.genderTextActive,
              ]}
            >
              👨 Erkek
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Doğum Yılı</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: 1995"
          value={birthYear}
          onChangeText={setBirthYear}
          keyboardType="number-pad"
          maxLength={4}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Konum Bilgisi</Text>
      <Text style={styles.stepSubtitle}>Nerede yaşıyorsunuz?</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Şehir</Text>
        <TextInput
          style={styles.input}
          placeholder="İstanbul, Ankara, İzmir..."
          value={city}
          onChangeText={setCity}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          Şehir bilginiz etkinlik önerilerimizde kullanılacaktır.
        </Text>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Sosyal Medya</Text>
      <Text style={styles.stepSubtitle}>Son bir adım kaldı!</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Instagram Kullanıcı Adı</Text>
        <TextInput
          style={styles.input}
          placeholder="@kullaniciadi"
          value={instagram}
          onChangeText={(text) => setInstagram(text.toLowerCase())}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>🔒</Text>
        <Text style={styles.infoText}>
          Instagram profiliniz kalite kontrol amacıyla incelenecektir. 
          Onaylandıktan sonra hesabınız aktif hale gelecektir.
        </Text>
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
      case 4:
        return renderStep4();
      default:
        return renderStep0();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={0}
    >
      <StatusBar style="dark" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Hesap Oluştur</Text>
          
          {renderProgressBar()}
          
          {renderCurrentStep()}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>← Geri</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.nextButton,
              currentStep === 0 && styles.nextButtonFull,
              loading && styles.nextButtonDisabled,
            ]} 
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.nextButtonText}>
                {currentStep === totalSteps - 1 ? 'Kayıt Ol' : 'İleri →'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  bottomContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 24,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#dee2e6',
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#28a745',
  },
  signatureContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  signatureBox: {
    width: width - 80,
    height: height * 0.25,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  signatureSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
  clearButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dc3545',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#212529',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  inputSuccess: {
    borderColor: '#28a745',
    backgroundColor: '#f0fff4',
  },
  inputField: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#212529',
  },
  validationIcon: {
    fontSize: 20,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  validIconSuccess: {
    color: '#28a745',
  },
  validIconError: {
    color: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  successText: {
    color: '#28a745',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '600',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  genderButtonActive: {
    borderColor: '#28a745',
    backgroundColor: '#e7f5ec',
  },
  genderText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '600',
  },
  genderTextActive: {
    color: '#28a745',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e7f5ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#28a745',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: '#6c757d',
    shadowOpacity: 0.1,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    color: '#6c757d',
    fontSize: 14,
  },
  loginLink: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '600',
  },
});
