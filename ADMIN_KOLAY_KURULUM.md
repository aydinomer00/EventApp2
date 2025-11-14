# Admin Hesabı - Kolay Kurulum Rehberi

## Adım Adım Admin Hesabı Oluşturma

### 1️⃣ ADIM: Uygulamadan Kayıt Olun

1. iOS Simulator'da uygulamanızı açın
2. **"Kayıt Ol"** butonuna tıklayın
3. Tüm kayıt adımlarını doldurun:
   - **Ad Soyad**: Admin
   - **E-posta**: admin@test.com (veya istediğiniz)
   - **Şifre**: 123456 (veya istediğiniz)
   - **Cinsiyet**: Kadın/Erkek (fark etmez)
   - **Doğum Yılı**: 1990 (veya istediğiniz)
   - **Şehir**: İstanbul (veya istediğiniz)
   - **Instagram**: @admin (veya istediğiniz)
4. **"Kayıt Ol"** butonuna basın
5. "Kaydınız Alındı - Onay Bekliyor" ekranını göreceksiniz
6. Bu ekranı kapatmayın, yan tarafta Firebase Console'a geçeceğiz

### 2️⃣ ADIM: Firebase Console'a Gidin

1. Tarayıcınızda bu linki açın: https://console.firebase.google.com
2. **eventapp-79aa3** projenizi seçin
3. Sol menüden **"Firestore Database"** seçin
4. Eğer Firestore henüz başlatılmamışsa:
   - **"Create database"** butonuna tıklayın
   - **"Start in test mode"** seçin
   - **"Next"** → **"Enable"** 

### 3️⃣ ADIM: Admin Rolü Verin

Şimdi az önce oluşturduğunuz kullanıcıyı admin yapacağız:

1. Firestore Database'de **"users"** koleksiyonunu göreceksiniz
2. İçinde az önce kayıt olduğunuz kullanıcıyı bulun
   - E-postanızı veya adınızı göreceksiniz
3. Bu kullanıcıya **tıklayın**
4. Aşağıdaki alanları **düzenleyin**:
   - **`role`** alanını bulun → değerini **`"admin"`** yapın
   - **`isActive`** alanını bulun → değerini **`true`** yapın
   - **`isPending`** alanını bulun → değerini **`false`** yapın

5. Değişiklikleri **kaydedin**

### 4️⃣ ADIM: Uygulamaya Geri Dönün

1. iOS Simulator'daki uygulamaya geri dönün
2. "Onay Bekliyor" ekranında **"Çıkış Yap"** butonuna basın
3. Login ekranına döneceksiniz
4. Az önce oluşturduğunuz admin hesabı ile **giriş yapın**:
   - E-posta: admin@test.com
   - Şifre: 123456
5. Giriş yapınca **Admin Panel** ekranını göreceksiniz! 🎉

---

## ❌ Firestore Database Yoksa?

Eğer Firestore Database menüsünü göremiyorsanız veya başlatılmamışsa:

1. Firebase Console'da projenize gidin
2. Sol menüden **"Build"** bölümünü genişletin
3. **"Firestore Database"** seçin
4. **"Create database"** butonuna tıklayın
5. **Location**: United States veya Europe seçin
6. **Start in test mode** seçin (geliştirme için)
7. **"Enable"** butonuna basın
8. 1-2 dakika bekleyin, database oluşturulacak

---

## 🎯 Test Etme

Admin panel şu özelliklere sahip olmalı:
- ✅ "Admin Panel" başlığını görürsünüz
- ✅ "Bekleyen Kullanıcılar (X)" yazısını görürsünüz
- ✅ Varsa bekleyen kullanıcıları listeler
- ✅ Her kullanıcı için "Onayla" ve "Reddet" butonları vardır

---

## 🆘 Sorun mu yaşıyorsunuz?

### Problem: "users" koleksiyonu görünmüyor
**Çözüm**: Uygulamadan en az bir kez kayıt yapmalısınız. Kayıt olunca otomatik oluşacak.

### Problem: Kullanıcı bilgileri görünmüyor
**Çözüm**: 
1. Uygulamada kayıt işlemini tamamladığınızdan emin olun
2. Firebase Console'da **"Refresh"** (yenile) butonuna basın
3. Birkaç saniye bekleyin ve tekrar kontrol edin

### Problem: Admin Panel görünmüyor
**Çözüm**:
1. Firestore'da `role` alanının tam olarak `"admin"` olduğundan emin olun (tırnak işaretleri olmadan)
2. Uygulamadan çıkış yapın ve tekrar giriş yapın
3. Hala çalışmıyorsa uygulamayı kapatıp yeniden açın

### Problem: "Firestore Database" menüsü yok
**Çözüm**: Yukarıdaki "Firestore Database Yoksa?" bölümünü takip edin

---

## 📸 Görsel Rehber

### Firestore'da role değiştirme:
```
users/
  └── [USER_ID]/
       ├── name: "Admin"
       ├── email: "admin@test.com"
       ├── role: "admin"      ← Bunu değiştirin
       ├── isActive: true     ← Bunu değiştirin
       ├── isPending: false   ← Bunu değiştirin
       └── ...
```

---

## ✅ Başarılı Olduğunuzda

Giriş yaptığınızda şu ekranı görmelisiniz:
- 🎯 "Admin Panel" başlığı
- 📊 Bekleyen kullanıcı sayısı
- 📋 Kullanıcı kartları (varsa)
- 🔄 Yenile butonu

İyi çalışmalar! 🚀

