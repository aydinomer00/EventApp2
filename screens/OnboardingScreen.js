import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath((prev) => [...prev, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
        if (currentPath.length > 0) {
          setPaths((prev) => [...prev, currentPath]);
          setCurrentPath([]);
        }
      },
    })
  ).current;

  const handleSignatureComplete = async () => {
    if (paths.length === 0 && currentPath.length === 0) {
      Alert.alert('Uyarı', 'Lütfen parmak izinizi veya imzanızı çizin');
      return;
    }
    // Onboarding'i tamamlandı olarak işaretle
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    // App.js otomatik olarak Login ekranına yönlendirecek
    // Burada navigation yapmıyoruz, sadece state'i güncelliyoruz
  };

  const handleClear = () => {
    setPaths([]);
    setCurrentPath([]);
  };

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
    if (currentPath.length === 0) return null;
    let pathString = `M${currentPath[0].x},${currentPath[0].y}`;
    for (let i = 1; i < currentPath.length; i++) {
      pathString += ` L${currentPath[i].x},${currentPath[i].y}`;
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

  const hasSignature = paths.length > 0 || currentPath.length > 0;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>Etik Taahhüt</Text>
          <Text style={styles.subtitle}>
            Uygulamayı kullanırken etik değerlere uygun davranacağınızı taahhüt edin
          </Text>
        </View>

        {/* Parmak İzi/İmza Alanı */}
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
              {paths.map((path, index) => renderPath(path, index))}
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

        {/* Açıklama */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Bu taahhüt, uygulama içinde saygılı, dürüst ve etik davranışlar sergileyeceğinizi belirtir. 
            Topluluk kurallarına uygun hareket edeceğinizi onaylamış olursunuz.
          </Text>
        </View>

        {/* Butonlar */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !hasSignature && styles.continueButtonDisabled
            ]}
            onPress={handleSignatureComplete}
            disabled={!hasSignature}
          >
            <Text style={styles.continueButtonText}>
              Taahhüt Ediyorum
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  signatureContainer: {
    flex: 1,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureBox: {
    width: width - 80,
    height: height * 0.35,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#6f42c1',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#6f42c1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: '#adb5bd',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
