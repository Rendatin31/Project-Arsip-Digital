# 🐛 FCM Debug Summary

## Status Implementasi

### ✅ Yang Sudah Selesai:
1. Firebase project created: `arsip-digital-26222`
2. `google-services.json` placed in `android/app/`
3. Firebase dependencies added to `android/app/build.gradle`
4. FCM initialization code in `src/App.jsx`
5. FCM utilities in `src/utils/fcmNotifications.js`
6. Edge Function deployed: `send-fcm-notification`
7. Service Account JSON minified and set as secret: `FIREBASE_SERVICE_ACCOUNT`
8. Database migration executed: `fcm_token` column added to profiles table
9. Notification integration in `src/utils/notifications.js`
10. One user has FCM token saved in database

### ❌ Issue Saat Ini:
**Notifikasi tidak muncul di device Android ketika user lain upload document**

---

## 🔍 Debugging Steps

### Quick Test (RECOMMENDED - Paling Cepat!)

**Test manual invoke Edge Function:**

1. Get user ID yang punya token:
   ```sql
   SELECT id, email FROM profiles WHERE fcm_token IS NOT NULL;
   ```

2. Manual invoke:
   - https://app.supabase.com/project/axpanhequppcviaimwte/functions
   - Click: send-fcm-notification > Invoke
   - Payload:
     ```json
     {
       "userId": "USER_ID_DI_SINI",
       "title": "Test",
       "message": "Testing",
       "type": "test"
     }
     ```
   - Check device!

**Result:**
- ✅ Notification muncul → FCM works! Issue di trigger (notifications.js)
- ❌ Notification tidak muncul → FCM/device issue (check below)

---

## 🎯 Common Issues & Solutions

### Issue 1: User Mismatch
**Symptom:** Token tersimpan untuk User A, tapi device login User B

**Check:**
```sql
SELECT email, full_name, LEFT(fcm_token, 30) as token 
FROM profiles 
WHERE fcm_token IS NOT NULL;
```

**Fix:** Login di device dengan user yang SAMA dengan yang punya token

---

### Issue 2: Token Tidak Tersimpan
**Symptom:** Semua users punya `fcm_token = NULL`

**Reason:** 
- APK belum punya FCM code
- User belum login ulang setelah APK update
- FCM initialization failed

**Fix:**
```bash
# Rebuild APK
npm run build
npx cap sync android
npx cap open android
# Build APK

# Install di device, login, check database
```

---

### Issue 3: Edge Function Tidak Ter-invoke
**Symptom:** Upload document tidak trigger Edge Function

**Check Desktop Console (F12):**
```
Expected: "✅ FCM notification sent via Edge Function"
Or: "❌ FCM Edge Function error: ..."
```

**Fix:** Check `src/utils/notifications.js` line ~60-80

---

### Issue 4: Device Permission
**Symptom:** Manual test berhasil (Edge Function OK) tapi notifikasi tidak muncul

**Check:**
```
Settings > Apps > Arsip Digital > Notifications
Should be: ENABLED
```

**Fix:**
- Enable notification permission
- Disable battery optimization
- Disable Do Not Disturb mode

---

### Issue 5: Token Invalid/Expired
**Symptom:** Edge Function returns: "Invalid token" or "NOT_FOUND"

**Fix:**
```bash
1. Uninstall app dari device
2. Install APK fresh
3. Login
4. Check database - token should update
```

---

## 📊 Debug Checklist

Work through in order:

- [ ] **Manual test berhasil?** (Yes = FCM OK, No = FCM/device issue)
- [ ] **User di device = user dengan token?** (No = login dengan user benar)
- [ ] **Upload trigger Edge Function?** (Check console log)
- [ ] **Edge Function logs OK?** (Check Supabase dashboard)
- [ ] **Device permission enabled?** (Check settings)
- [ ] **APK terbaru?** (Build after FCM code integration)

---

## 🔗 Related Files

### Implementation Files:
- `src/App.jsx` - FCM initialization
- `src/utils/fcmNotifications.js` - FCM utilities
- `src/utils/notifications.js` - Edge Function integration
- `supabase/functions/send-fcm-notification/index.ts` - Edge Function
- `android/app/google-services.json` - Firebase config
- `android/app/build.gradle` - Firebase dependencies

### Documentation:
- `FCM-IMPLEMENTATION-COMPLETE.md` - Complete implementation guide
- `QUICK-FCM-DEBUG.md` - Step-by-step debugging
- `FCM-TROUBLESHOOT-SIMPLE.md` - Simple troubleshooting guide
- `DEBUG-FCM-NOTIFICATIONS.md` - Detailed debugging checklist
- `check-fcm-tokens.sql` - SQL queries to check tokens
- `GET-FIREBASE-SERVICE-ACCOUNT.md` - Service Account setup

---

## 🎯 Next Steps

**Untuk user, tolong lakukan:**

1. **Run manual test** (paling penting!):
   - Supabase Dashboard > Functions > send-fcm-notification > Invoke
   - Paste user ID yang punya token
   - Check device untuk notification

2. **Report hasil:**
   - Manual test: Berhasil/Gagal? (screenshot)
   - User di device: email?
   - User dengan token: email? (from database)
   - Desktop console log: Ada "FCM notification sent"? (screenshot)

3. **Check device:**
   - Notification permission: Enabled?
   - APK install date: Kapan?
   - User login: Email?

---

## 💡 Key Points

1. **FCM setup complete** - All code in place
2. **Manual test is fastest** - Bypasses upload trigger, tests FCM directly
3. **User match critical** - Device user must match token user
4. **Edge Function invoked** - Check if createNotification() calls Edge Function
5. **Device permission** - Must be enabled for notifications

---

## 📞 How to Get Help

Report these 4 things:

1. **Manual test result**: Success/Error + screenshot
2. **User info**: Device user vs token user (match?)
3. **Console logs**: Desktop browser console (F12) saat upload
4. **Edge Function logs**: Supabase dashboard function logs

With these 4 info, we can pinpoint exact issue! 🎯

---

**Start with manual test! 2 minutes to verify FCM works! 🚀**
