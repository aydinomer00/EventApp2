# Admin Hesabı Kurulumu

## Admin Hesabı Oluşturma

Uygulamanızda admin paneline erişmek için bir admin hesabı oluşturmanız gerekiyor.

### Yöntem 1: Firebase Console'dan (Önerilen)

1. **Firebase Console'a gidin**: https://console.firebase.google.com
2. Projenizi seçin: **eventapp-79aa3**
3. Sol menüden **Firestore Database** seçin
4. **users** koleksiyonunu bulun veya oluşturun
5. Yeni bir belge ekleyin:
   - **Document ID**: Kendi User ID'nizi kullanın (Authentication'dan alabilirsiniz)
   - Aşağıdaki alanları ekleyin:

```json
{
  "name": "Admin",
  "email": "admin@eventapp.com",
  "role": "admin",
  "isActive": true,
  "isPending": false,
  "createdAt": "2025-11-07T12:00:00.000Z"
}
```

### Yöntem 2: Kod ile (Geliştirme Ortamı)

Uygulamayı çalıştırın ve normal bir kullanıcı gibi kayıt olun. Ardından Firebase Console'dan bu kullanıcının role alanını "admin" olarak değiştirin.

## Admin Hesabı ile Giriş

1. Uygulamayı açın
2. Admin e-posta ve şifreniz ile giriş yapın
3. Otomatik olarak **Admin Panel** ekranına yönlendirileceksiniz

## Admin Panel Özellikleri

- ✅ Bekleyen kullanıcıları görüntüleme
- ✅ Kullanıcı detaylarını inceleme
- ✅ Instagram profillerini kontrol etme
- ✅ Kullanıcıları onaylama
- ✅ Kullanıcıları reddetme

## Kullanıcı Onay Süreci

1. Yeni kullanıcı kayıt olur
2. Kullanıcı "Onay Bekliyor" ekranını görür
3. Admin, Admin Panel'de kullanıcıyı görür
4. Admin Instagram profilini kontrol eder
5. Admin kullanıcıyı onaylar veya reddeder
6. Onaylanan kullanıcı uygulamaya erişebilir

## Test Senaryosu

### Normal Kullanıcı Testi:
1. Yeni bir hesap oluşturun
2. Tüm kayıt adımlarını tamamlayın
3. "Onay Bekliyor" ekranını görün
4. Admin hesabı ile giriş yapın
5. Kullanıcıyı onaylayın
6. Normal kullanıcı hesabı ile tekrar giriş yapın
7. Ana sayfayı görün

### Admin Testi:
1. Admin hesabı ile giriş yapın
2. Admin Panel'i görün
3. Bekleyen kullanıcıları listeleyin
4. Instagram linklerine tıklayın
5. Kullanıcıları onaylayın/reddedin

## Güvenlik Notları

- Admin hesabınızın şifresini güçlü tutun
- Admin e-postanızı kimseyle paylaşmayın
- Firebase Console erişiminizi güvenli tutun
- Düzenli olarak kullanıcı listesini kontrol edin

## Firestore Kuralları (Önerilen)

Firebase Console > Firestore Database > Rules bölümüne gidin ve aşağıdaki kuralları ekleyin:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Herkes kendi kullanıcı bilgilerini okuyabilir
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Kullanıcılar kendi bilgilerini oluşturabilir
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Sadece admin güncelleyebilir
      allow update: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Admin tüm kullanıcıları görebilir
      allow read: if request.auth != null && 
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Sorun Giderme

**Problem**: Admin Panel görünmüyor
- Çözüm: Firebase Console'dan kullanıcınızın `role` alanının "admin" olduğundan emin olun

**Problem**: Kullanıcılar listelenmIyor
- Çözüm: Firestore kurallarınızı kontrol edin

**Problem**: Onay işlemi çalışmıyor
- Çözüm: İnternet bağlantınızı ve Firebase bağlantınızı kontrol edin

