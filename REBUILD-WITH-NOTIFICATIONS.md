# 🔔 Rebuild App dengan Push Notifications

## 🚀 Quick Steps

Jalankan command ini untuk rebuild app dengan fitur push notifications:

```bash
# 1. Build web assets
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Open Android Studio
npx cap open android
```

Kemudian di Android Studio:
- Klik Run ▶️
- Tunggu build selesai
- App akan install dengan fitur notifications baru

---

## ✅ Yang Ditambahkan

1. **📦 Package:** `@capacitor/local-notifications`
2. **🔧 Utility:** `src/utils/pushNotifications.js`
3. **🔄 Integration:** Push notifications di `Header.jsx`
4. **📱 Permissions:** Notification permissions di `AndroidManifest.xml`

---

## 🧪 Cara Test

### **Test 1: Permission Request**
1. Install app
2. Buka app
3. Popup permission muncul: **"Allow notifications?"**
4. Klik **Allow**

### **Test 2: Push Notification** (via user lain)
1. Login dengan user A di web
2. Upload dokumen (status: Published)
3. Di device user B yang online:
   - 🔔 Push notification muncul di notification bar
   - 📱 Vibration
   - 🔊 Sound
   - 🔴 Badge di bell icon

### **Test 3: Tap Notification**
1. Tap push notification di device bar
2. App opens (atau focus jika sudah open)
3. Notification panel terbuka
4. Notification di-mark as read

### **Test 4: Manual Test** (via Supabase)
1. Buka Supabase Dashboard
2. Table Editor → `notifications`
3. Insert Row:
   ```
   user_id: your-user-id
   type: upload
   title: Test Push
   message: Ini test notifikasi
   is_read: false
   ```
4. Klik Save
5. Push notification langsung muncul di device!

---

## 🎯 Expected Behavior

### **Di Device Notification Bar:**
```
┌────────────────────────────────┐
│ 🔵 Arsip Digital              │
│ ───────────────────────────── │
│ Dokumen Baru Dipublikasikan   │
│ John mempublikasikan "Surat"  │
│                               │
│ Baru saja                     │
└────────────────────────────────┘
```

### **Saat Tap:**
- App terbuka/focus
- Notification panel di app terbuka
- Notification marked as read
- Badge count berkurang

---

## 🐛 Troubleshooting

### **Popup permission tidak muncul?**
```bash
# Uninstall app dulu
adb uninstall com.rendatin.arsip

# Install & run lagi dari Android Studio
# Permission popup akan muncul di first launch
```

### **Push notification tidak muncul?**

**Check 1: Permission granted?**
- Android Settings → Apps → Arsip Digital → Notifications
- Pastikan **ON** (enabled)

**Check 2: Console logs**
```bash
# Di Chrome DevTools (chrome://inspect)
# Cari log:
✅ Push notifications initialized
✅ Notification channel created
✅ Push notification sent: [title]
```

**Check 3: Logcat (Android Studio)**
- Buka tab Logcat
- Filter: pilih app name
- Cari error messages

### **Sound tidak bunyi?**
- Check device tidak silent mode
- Check volume notifications di settings
- Check Do Not Disturb mode OFF

---

## 💡 Pro Tips

1. **First Time Build:** Bisa lama (3-5 menit), normal
2. **Permission:** User bisa revoke di Android settings kapan saja
3. **Battery Saver:** Might delay/block notifications
4. **Emulator:** Push notifications work di emulator juga
5. **Multiple Notifications:** Akan stack di notification bar

---

## 📋 Quick Command Reference

```bash
# Rebuild semua
npm run build && npx cap sync android

# Open Android Studio
npx cap open android

# Check ADB devices
adb devices

# Uninstall app (for clean test)
adb uninstall com.rendatin.arsip

# View logs
adb logcat | findstr "Capacitor"
```

---

## 🎉 Success Indicators

Jika semua berhasil:
- ✅ Permission popup muncul saat first launch
- ✅ User allow notifications
- ✅ Push notification muncul di device bar
- ✅ Sound & vibration works
- ✅ Tap notification opens app
- ✅ Badge count updates
- ✅ Mark as read works

---

**Ready to test? Let's go! 🚀**

Run commands di atas, lalu beri tahu hasilnya!
