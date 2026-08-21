# 🔔 Push Notifications untuk Mobile Device

## ✨ Fitur yang Ditambahkan

Aplikasi mobile sekarang mendukung **push notifications** yang akan muncul di notification bar device Android saat ada:
- 📤 Dokumen baru dipublikasikan
- 🔐 Perubahan akses/permission
- ✏️ Dokumen diedit
- 🗑️ Dokumen dihapus
- ⚠️ Peringatan keamanan
- 📢 Notifikasi sistem lainnya

---

## 📦 Package yang Diinstall

```bash
npm install @capacitor/local-notifications
```

**Capacitor Local Notifications** - Plugin untuk menampilkan notifikasi di device native.

---

## 🚀 Cara Kerja

### 1. **Initialization (Saat App Dibuka)**
```javascript
// Otomatis request permission
// Membuat notification channel (Android)
// Setup listeners untuk tap notifications
```

### 2. **Real-time Subscription (Supabase)**
```javascript
// Subscribe ke table 'notifications'
// Saat ada INSERT notification baru → Kirim push notification
```

### 3. **Push Notification Display**
- Muncul di notification bar device
- Dengan title, message, icon
- Sound & vibration
- Tap notification → buka app & mark as read

---

## 🔧 File yang Diubah/Dibuat

### **Baru:**
- ✅ `src/utils/pushNotifications.js` - Utility functions untuk push notifications

### **Diubah:**
- ✅ `src/components/Header.jsx` - Integrasi push notifications
- ✅ `android/app/src/main/AndroidManifest.xml` - Tambah permissions
- ✅ `package.json` - Install @capacitor/local-notifications

---

## 📱 Permissions yang Ditambahkan

Di `AndroidManifest.xml`:

```xml
<!-- Notification Permissions -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
```

**Penjelasan:**
- `POST_NOTIFICATIONS`: Kirim notifikasi (Android 13+)
- `VIBRATE`: Vibrate saat notifikasi
- `RECEIVE_BOOT_COMPLETED`: Restore notifications setelah reboot
- `SCHEDULE_EXACT_ALARM`: Schedule notifications di waktu spesifik

---

## 🧪 Testing Push Notifications

### **Step 1: Rebuild & Sync**
```bash
npm run build
npx cap sync android
```

### **Step 2: Open Android Studio**
```bash
npx cap open android
```

### **Step 3: Run di Emulator/Device**
- Klik Run ▶️
- App akan install & open

### **Step 4: Grant Notification Permission**
Saat pertama kali buka app:
1. Popup permission muncul: **"Allow Arsip Digital to send you notifications?"**
2. Klik **Allow** atau **Don't Allow**

**Note:** Jika klik "Don't Allow", notifications tidak akan muncul di device bar (tapi tetap muncul di app).

### **Step 5: Test Notification**

#### **Test A: Upload Dokumen** (via user lain)
1. Login dengan user A di web/mobile
2. Upload dokumen dengan status **Published**
3. Di device user B (yang sedang online), akan:
   - ✅ Muncul push notification di notification bar
   - ✅ Badge unread count di bell icon
   - ✅ Sound & vibration

#### **Test B: Manual Test** (via Supabase)
1. Buka Supabase Dashboard
2. Table: `notifications`
3. Insert manual:
   ```sql
   INSERT INTO notifications (user_id, type, title, message, is_read)
   VALUES (
     'your-user-id',
     'upload',
     'Test Push Notification',
     'Ini adalah test notifikasi push',
     false
   );
   ```
4. Push notification akan muncul instant di device

---

## 🎨 Notification Appearance

### **Di Notification Bar:**
```
┌────────────────────────────────────┐
│ 🔵 Arsip Digital                   │
│ ─────────────────────────────────  │
│ Dokumen Baru Dipublikasikan        │ ← Title
│ John Doe mempublikasikan "Surat    │ ← Message
│ Keputusan 2024"                    │
│                                    │
│ Baru saja                          │ ← Time
└────────────────────────────────────┘
```

### **Saat di-tap:**
- App terbuka (atau focus jika sudah open)
- Notification panel dibuka
- Notification di-mark as read

---

## ⚙️ Kustomisasi Notification

### **A. Channel Settings (Android)**

Di `src/utils/pushNotifications.js`:

```javascript
await LocalNotifications.createChannel({
  id: 'arsip_digital',
  name: 'Arsip Digital Notifications',
  description: 'Notifikasi untuk dokumen dan aktivitas',
  importance: 4, // 1-5 (5 = highest)
  visibility: 1, // 0=secret, 1=public
  sound: 'default', // or custom sound file
  vibration: true,
});
```

### **B. Notification Icon**

Untuk custom icon (opsional):

1. Buat icon white transparent PNG (24x24dp)
2. Simpan di `android/app/src/main/res/drawable/ic_notification.png`
3. Icon akan otomatis digunakan

**Default:** Menggunakan app icon

### **C. Sound & Vibration**

Di `sendPushNotification()`:

```javascript
sound: 'default', // or 'custom_sound.mp3'
```

Untuk custom sound:
- Simpan file audio di `android/app/src/main/res/raw/`
- Set `sound: 'custom_sound'` (tanpa extension)

---

## 🔕 Disable Notifications

User bisa disable di 2 cara:

### **1. Via App Permission**
```
Android Settings → Apps → Arsip Digital → Notifications → OFF
```

### **2. Via Channel Settings**
```
Android Settings → Apps → Arsip Digital → Notifications → 
Arsip Digital Notifications → OFF
```

---

## 🐛 Troubleshooting

### **Push Notification Tidak Muncul**

#### **1. Check Permission**
```javascript
// Di DevTools Console (Chrome inspect):
const result = await LocalNotifications.checkPermissions();
console.log(result.display); // Should be 'granted'
```

#### **2. Check Channel (Android)**
```javascript
const channels = await LocalNotifications.listChannels();
console.log(channels); // Should have 'arsip_digital'
```

#### **3. Manual Request Permission**
```javascript
await LocalNotifications.requestPermissions();
```

#### **4. Check Android Settings**
- Settings → Apps → Arsip Digital → Notifications
- Pastikan **ON** (enabled)

### **Notification Muncul di App, Tapi Tidak di Device Bar**

**Possible causes:**
- Permission denied
- Channel disabled
- Android battery saver blocking
- Do Not Disturb mode active

**Solutions:**
1. Re-request permission
2. Check Android notification settings
3. Disable battery optimization for app
4. Turn off Do Not Disturb

### **Sound Tidak Bunyi**

1. Check device not in silent mode
2. Check notification channel sound enabled
3. Check app notification sound settings

---

## 📊 Notification Types & Icons

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `upload` | 📤 upload_file | Blue | Dokumen baru uploaded |
| `security` | ⚠️ warning | Red | Security alerts |
| `share` | 📢 share | Purple | Dokumen di-share |
| `system` | 🔄 update | Primary | System updates |
| `approval` | ✅ task_alt | Green | Approval/acceptance |
| `delete` | 🗑️ delete | Red | Dokumen dihapus |
| `edit` | ✏️ edit | Purple | Dokumen diedit |
| `access` | 🔐 admin_panel_settings | Primary | Permission changes |

---

## 🎯 Best Practices

### **1. Don't Spam**
- Jangan kirim notifikasi terlalu sering
- Batch similar notifications

### **2. Clear & Concise**
- Title: max 40 characters
- Message: max 100 characters for preview

### **3. Actionable**
- Tap notification should lead to relevant page
- Clear call-to-action

### **4. Timing**
- Respect quiet hours (malam hari)
- Consider timezone user

### **5. User Control**
- Allow users to customize notification types
- Respect notification preferences

---

## 🔐 Privacy & Security

- ✅ Notifications stored in local database
- ✅ No data sent to external push services
- ✅ User can revoke permissions anytime
- ✅ Notifications cleared when user logs out

---

## 📚 API Reference

### **Functions:**

```javascript
// Initialize (run once on app start)
await initializePushNotifications();

// Check permission status
const hasPermission = await checkNotificationPermission();

// Send push notification
await sendPushNotification(notification);

// Setup tap listeners
await setupNotificationListeners(callback);

// Cancel all notifications
await cancelAllNotifications();

// Get pending notifications
const pending = await getPendingNotifications();
```

---

## 🚀 Next Steps (Future Enhancements)

### **1. Firebase Cloud Messaging (FCM)**
- Untuk push notifications saat app closed
- Server-side notifications
- Background sync

### **2. Notification Preferences**
- User dapat pilih notification types
- Quiet hours setting
- Notification frequency control

### **3. Rich Notifications**
- Image thumbnails
- Action buttons (Mark as Read, Open, Dismiss)
- Grouped notifications

### **4. Analytics**
- Track notification open rates
- User engagement metrics
- A/B testing notification messages

---

## ✅ Testing Checklist

Setelah rebuild, test:

- [ ] App install berhasil
- [ ] Permission popup muncul saat first launch
- [ ] User allow notification permission
- [ ] Upload dokumen dari user lain
- [ ] Push notification muncul di device bar
- [ ] Sound & vibration works
- [ ] Tap notification → app opens
- [ ] Notification marked as read after tap
- [ ] Badge count updates correctly
- [ ] Multiple notifications can stack
- [ ] Swipe to dismiss works

---

## 📝 Notes

- **Android 13+**: Requires explicit notification permission request
- **Android 12-**: Notifications enabled by default
- **Emulator**: Push notifications work in emulator
- **Web**: Push notifications disabled (native only)

---

## 🎉 Result

Sekarang aplikasi mobile Anda memiliki:
- ✅ Real-time push notifications di device
- ✅ Sound & vibration alerts
- ✅ Badge count di app icon (Android 8+)
- ✅ Tap to open & mark as read
- ✅ Customizable notification channel
- ✅ Respect user preferences

**Enjoy your new push notifications! 🔔**

---

## 📞 Support

Jika ada masalah atau pertanyaan:
1. Check Logcat di Android Studio
2. Check DevTools Console (chrome://inspect)
3. Verify permissions granted
4. Test dengan manual INSERT di Supabase

