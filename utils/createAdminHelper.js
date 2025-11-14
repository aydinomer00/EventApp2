/**
 * Admin Hesabı Oluşturma Yardımcı Fonksiyonu
 * 
 * Bu dosyayı kullanarak ilk admin hesabınızı oluşturabilirsiniz.
 */

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * İlk admin hesabını oluşturur
 * @param {string} email - Admin e-posta adresi
 * @param {string} password - Admin şifresi
 * @param {string} name - Admin adı
 */
export async function createAdminAccount(email, password, name) {
  try {
    console.log('Admin hesabı oluşturuluyor...');
    
    // 1. Firebase Authentication ile admin kullanıcı oluştur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Admin kullanıcısı oluşturuldu:', userCredential.user.uid);
    
    // 2. Kullanıcı adını güncelle
    await updateProfile(userCredential.user, {
      displayName: name
    });
    console.log('✅ Admin adı güncellendi');
    
    // 3. Firestore'da admin bilgilerini kaydet
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name: name,
      email: email,
      role: 'admin',
      isActive: true,
      isPending: false,
      createdAt: new Date().toISOString(),
    });
    console.log('✅ Admin bilgileri Firestore\'a kaydedildi');
    
    console.log('🎉 Admin hesabı başarıyla oluşturuldu!');
    console.log('E-posta:', email);
    console.log('Şifre:', password);
    
    return {
      success: true,
      message: 'Admin hesabı başarıyla oluşturuldu!',
      uid: userCredential.user.uid
    };
    
  } catch (error) {
    console.error('❌ Admin hesabı oluşturma hatası:', error);
    
    let errorMessage = 'Admin hesabı oluşturulurken bir hata oluştu';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Bu e-posta adresi zaten kullanılıyor. Lütfen farklı bir e-posta deneyin.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Geçersiz e-posta adresi';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Şifre en az 6 karakter olmalıdır';
    }
    
    return {
      success: false,
      message: errorMessage,
      error: error.message
    };
  }
}

// Kullanım örneği:
// import { createAdminAccount } from './utils/createAdminHelper';
// 
// createAdminAccount('admin@test.com', '123456', 'Admin')
//   .then(result => {
//     if (result.success) {
//       Alert.alert('Başarılı', result.message);
//     } else {
//       Alert.alert('Hata', result.message);
//     }
//   });

