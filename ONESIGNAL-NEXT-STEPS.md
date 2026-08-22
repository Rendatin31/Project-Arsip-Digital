# 🎯 OneSignal - Next Steps

## ✅ Yang Sudah Selesai:

1. ✅ **OneSignal account created**
2. ✅ **App created**: "arsip digital App"
3. ✅ **Service Account JSON uploaded**
4. ✅ **OneSignal App ID**: `663c3ef2-4bf4-4073-ab3b-47fb918faec5`
5. ✅ **Plugin installed**: `onesignal-cordova-plugin`
6. ✅ **Config updated**: `capacitor.config.ts`
7. ✅ **Utility file created**: `src/utils/oneSignalNotifications.js`

---

## 📋 Yang Masih Perlu Dilakukan:

### Step 1: Update App.jsx (Initialize OneSignal)

Replace FCM initialization dengan OneSignal.

**File:** `src/App.jsx`

**Find ini:**
```javascript
import { initializeFCM, setupFCMListeners, saveFCMToken, removeFCMToken } from './utils/fcmNotifications';
```

**Replace dengan:**
```javascript
import { initializeOneSignal, setOneSignalExternalUserId, removeOneSignalExternalUserId, sendOneSignalTags } from './utils/oneSignalNotifications';
```

**Find useEffect untuk FCM initialization:**
```javascript
// Initialize Firebase Cloud Messaging (for remote push)
initializeFCM().then(async (fcmToken) => {
  // ... FCM code
});
```

**Replace dengan:**
```javascript
// Initialize OneSignal (for remote push notifications)
initializeOneSignal();
```

**Find useEffect untuk save FCM token:**
```javascript
useEffect(() => {
  if (!user || !Capacitor.isNativePlatform()) return;
  
  // FCM token code...
  initializeFCM().then(async (fcmToken) => {
    // ...
  });
}, [user, supabase]);
```

**Replace dengan:**
```javascript
useEffect(() => {
  if (!user || !Capacitor.isNativePlatform()) return;

  console.log('👤 User logged in, setting OneSignal External User ID...');
  
  // Set External User ID = database user ID
  setOneSignalExternalUserId(user.id);
  
  // Optional: Send tags for segmentation
  if (profile) {
    sendOneSignalTags({
      role: profile.role,
      email: user.email,
      name: profile.full_name,
    });
  }

  // Cleanup on logout
  return () => {
    console.log('👋 User logging out, removing External User ID');
    removeOneSignalExternalUserId();
  };
}, [user, profile]);
```

---

### Step 2: Update notifications.js (Send via OneSignal)

Add fungsi untuk send notification via OneSignal API.

**File:** `src/utils/notifications.js`

**Add di bagian atas (after imports):**
```javascript
const ONESIGNAL_APP_ID = '663c3ef2-4bf4-4073-ab3b-47fb918faec5';
const ONESIGNAL_REST_API_KEY = 'YOUR_REST_API_KEY_HERE';  // Get from OneSignal Dashboard
```

**Add new function:**
```javascript
/**
 * Send notification via OneSignal REST API
 */
async function sendOneSignalNotification(userId, title, message, type) {
  try {
    console.log('📤 Sending OneSignal notification to user:', userId);
    
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        // Target specific user by External User ID
        include_external_user_ids: [userId],
        // Notification content
        headings: { en: title },
        contents: { en: message },
        // Additional data
        data: {
          type: type,
          userId: userId,
        },
        // Android specific
        android_channel_id: 'arsip_digital',
        priority: 10,
      }),
    });

    const result = await response.json();
    
    if (result.id) {
      console.log('✅ OneSignal notification sent:', result.id);
      return { success: true, id: result.id };
    } else {
      console.error('❌ OneSignal error:', result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('❌ Error sending OneSignal notification:', error);
    return { success: false, error: error.message };
  }
}
```

**Update createNotification function:**

Replace FCM Edge Function call dengan OneSignal:

```javascript
// OLD: FCM Edge Function
await supabase.functions.invoke('send-fcm-notification', { ... });

// NEW: OneSignal API
await sendOneSignalNotification(userId, title, message, type);
```

---

### Step 3: Get OneSignal REST API Key

1. **OneSignal Dashboard** > **Settings** > **Keys & IDs**
2. **Copy:** "REST API Key"
3. **Paste** di `notifications.js` (replace `YOUR_REST_API_KEY_HERE`)

---

### Step 4: Build & Test

```bash
npm run build
npx cap sync android
npx cap open android

# In Android Studio:
# Build > Build APK
# Install on device
```

---

### Step 5: Test Notification

#### Test 1: From OneSignal Dashboard

1. **Dashboard** > **Messages** > **New Push**
2. **Audience:** "Subscribed Users"
3. **Content:**
   - Title: "Test dari OneSignal"
   - Message: "Ini test notification"
4. **Send Message**
5. **Check device!**

#### Test 2: From Code

Upload document dari desktop, check jika notification muncul di device Android.

---

## 📊 Benefits Recap

| Feature | Custom FCM (Failed) | OneSignal (✅) |
|---------|---------------------|----------------|
| Setup Time | 5+ hours, still failing | ~1 hour total |
| Working Status | ❌ Error 500 | ✅ Will work |
| Dashboard | None | Beautiful analytics |
| API Complexity | Very High | Simple REST |
| Cost | Free | Free (10k users) |

---

## 🆘 Troubleshooting

### Issue: "No subscribed users"
- Make sure app installed with OneSignal code
- Check if OneSignal initialized (console logs)

### Issue: Notification not arriving
- Verify External User ID matches database user ID
- Check OneSignal Dashboard > Delivery Status
- Check device notification settings

### Issue: "Invalid REST API Key"
- Copy from Settings > Keys & IDs
- Not from anywhere else!

---

## 📝 Important Notes

1. **External User ID** = Your database user ID (untuk targeting specific users)
2. **REST API Key** harus di-set di `notifications.js`
3. **Rebuild APK** after code changes
4. **Test dari OneSignal Dashboard** first (paling mudah)
5. **Check console logs** untuk debugging

---

## ✅ Final Checklist

Before testing:
- [ ] App.jsx updated (OneSignal initialization)
- [ ] notifications.js updated (OneSignal API)
- [ ] REST API Key added
- [ ] APK rebuilt & installed
- [ ] User logged in (External User ID set)
- [ ] Test from OneSignal Dashboard first

---

**Next session: Complete Step 1-5 dan test! Should work! 🚀**

**Estimasi waktu: 30-45 menit untuk complete semua steps!**
