# 🎯 OneSignal - Final Steps & Testing

## ✅ Code Changes COMPLETE!

Semua code sudah di-update:
- ✅ `App.jsx` - OneSignal initialization & External User ID
- ✅ `src/utils/notifications.js` - OneSignal REST API integration
- ✅ `capacitor.config.ts` - OneSignal config
- ✅ `src/utils/oneSignalNotifications.js` - Utility functions

---

## 📋 Remaining Steps (Manual)

### Step 1: Get OneSignal REST API Key ⏰ (2 minutes)

**Follow guide:** `ONESIGNAL-GET-API-KEY.md`

1. Go to: https://onesignal.com/
2. **Settings** > **Keys & IDs**
3. Copy **REST API Key**
4. **Edit:** `src/utils/notifications.js` line 8
5. Replace `YOUR_REST_API_KEY_HERE` with your actual key

---

### Step 2: Build APK ⏰ (5-10 minutes)

```powershell
# Step 2.1: Build web assets
npm run build

# Step 2.2: Sync to Android
npx cap sync android

# Step 2.3: Open Android Studio
npx cap open android
```

**In Android Studio:**
1. Wait for Gradle sync to complete
2. **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
3. Wait for build to complete (~3-5 minutes)
4. Click **locate** to find APK file

---

### Step 3: Install APK on Device ⏰ (2 minutes)

**Option A: Transfer via USB**
```powershell
# Copy APK to Downloads folder on phone
adb push app-debug.apk /sdcard/Download/
```

**Option B: Upload to Supabase Storage**
1. Go to: https://supabase.com/dashboard/project/axpanhequppcviaimwte/storage/buckets/apk-files
2. Upload new APK
3. Get public URL
4. Update download link in Header.jsx

**Then on device:**
- Install APK
- Open app
- Login dengan user account

---

### Step 4: Test Notification ⏰ (5 minutes)

#### Test 1: OneSignal Dashboard (EASIEST!)

1. Go to: https://onesignal.com/
2. **Messages** > **New Push**
3. **Audience:** Select "Subscribed Users"
4. **Content:**
   - **Title:** "Test dari OneSignal"
   - **Message:** "Ini test notification dari dashboard"
5. **Send to Test Device** or **Send Message**
6. **Check device!** Notification should appear even if app is CLOSED! 🎉

#### Test 2: From Code (Upload Document)

1. Open app on **desktop/web**: https://rendatinarsip.vercel.app
2. Login dengan user berbeda
3. Upload dokumen baru
4. **Check device!** Notification should appear for other logged-in users

---

## 🎯 Expected Behavior

### When App is OPEN:
- ✅ Notification appears in notification tray
- ✅ Notification appears in app's notification panel
- ✅ Real-time updates work

### When App is BACKGROUND:
- ✅ Notification appears in notification tray
- ✅ Tap notification opens app

### When App is CLOSED (KILLED):
- ✅ Notification appears in notification tray (THIS IS THE KEY IMPROVEMENT!)
- ✅ Tap notification opens app

---

## 🆘 Troubleshooting

### Issue: "No subscribed users" in OneSignal Dashboard
**Solution:**
- Make sure app is installed with latest code
- Login to app
- Check console logs for: `✅ OneSignal initialized successfully!`
- Check console logs for: `✅ OneSignal External User ID set: <user-id>`

### Issue: Notification not arriving
**Solutions:**
1. **Check REST API Key:**
   - `src/utils/notifications.js` line 8
   - Should NOT be `YOUR_REST_API_KEY_HERE`
   
2. **Check OneSignal Dashboard:**
   - **Delivery** > **Delivery Log**
   - Check for errors
   
3. **Check device notification settings:**
   - Settings > Apps > Arsip Digital > Notifications > ENABLED
   
4. **Check console logs:**
   - Look for: `✅ OneSignal notification sent: <notification-id>`
   - Look for: `❌` errors

### Issue: "Invalid REST API Key"
**Solution:**
- Copy from: https://onesignal.com/ > Settings > Keys & IDs
- Make sure you copied "REST API Key" (NOT App ID)
- Rebuild APK after fixing

---

## 📊 Verification Checklist

Before testing, verify:
- [ ] REST API Key set in `notifications.js` (NOT `YOUR_REST_API_KEY_HERE`)
- [ ] APK rebuilt after code changes
- [ ] APK installed on device
- [ ] App opened and user logged in
- [ ] Console shows: `✅ OneSignal initialized successfully!`
- [ ] Console shows: `✅ OneSignal External User ID set: <user-id>`

---

## ✅ Success Indicators

You'll know it's working when:
1. **OneSignal Dashboard** shows "1 Subscribed User" (or more)
2. **Test notification from dashboard** arrives on device
3. **Upload document from desktop** sends notification to device
4. **Notification works even when app is CLOSED!** 🎉

---

## 🎉 Next Steps After Success

1. **Update APK download link** di Header.jsx (jika upload ke Supabase Storage)
2. **Deploy web version** ke Vercel (jika ada perubahan web code)
3. **Test dengan multiple users** untuk verify segmentation
4. **Monitor OneSignal Dashboard** untuk analytics

---

## 📝 Important Reminders

1. **External User ID** = Database user ID (untuk target specific users)
2. **REST API Key** harus valid dan dari OneSignal Dashboard
3. **Rebuild APK** setiap kali ada perubahan code
4. **Test dari OneSignal Dashboard first** - paling mudah dan reliable
5. **Check console logs** untuk debugging

---

**Estimated time to complete all steps: 15-20 minutes**

**Good luck! Notification should work even when app is CLOSED now! 🚀**
