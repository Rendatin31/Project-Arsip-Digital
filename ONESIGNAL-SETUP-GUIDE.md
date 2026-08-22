# 🔔 OneSignal Setup Guide - Push Notifications (Fastest Solution!)

## ✅ Kenapa OneSignal?

- ✅ **Free tier**: 10,000 subscribers, unlimited notifications
- ✅ **Setup cepat**: ~30 menit dari nol sampai working
- ✅ **Proven reliable**: Used by millions of apps
- ✅ **No OAuth2 complexity**: Simple REST API
- ✅ **Support semua platform**: Android, iOS, Web
- ✅ **Rich dashboard**: Analytics, segmentation, scheduling

---

## 📋 Setup Steps (30 Minutes Total)

### Phase 1: OneSignal Account & App Setup (5 min)

### Phase 2: Android Configuration (10 min)

### Phase 3: Code Integration (10 min)

### Phase 4: Testing (5 min)

---

## 🚀 Phase 1: OneSignal Account & App Setup

### Step 1.1: Create Account

1. **Buka:** https://onesignal.com/
2. **Klik:** "Get Started Free"
3. **Sign up** dengan email atau Google
4. **Verify email** (check inbox)

### Step 1.2: Create New App

1. **Dashboard:** Click "New App/Website"
2. **App Name:** `Rendatin Arsip`
3. **Platform:** Select **"Google Android (FCM)"**
4. **Click:** "Next: Configure Your Platform"

### Step 1.3: Configure Android

**OneSignal needs Firebase Server Key:**

1. **Buka Firebase Console:**
   https://console.firebase.google.com/project/arsip-digital-26222/settings/cloudmessaging

2. **Di bagian "Cloud Messaging API (Legacy)":**
   - Klik "⋮" (three dots)
   - Click **"Manage API in Google Cloud Console"**
   - **ENABLE** the API (if not already enabled)

3. **Copy "Server key"** dari Firebase Console

4. **Paste** di OneSignal:
   - **Firebase Server Key:** `[paste key]`
   - **Firebase Sender ID:** `[paste sender ID]`

5. **Click:** "Save & Continue"

### Step 1.4: Get OneSignal App ID & REST API Key

Setelah setup selesai:

1. **Settings** > **Keys & IDs**
2. **Copy:**
   - **OneSignal App ID:** `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **REST API Key:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Save these! Kita akan pakai di code.**

---

## 🔧 Phase 2: Android Configuration

### Step 2.1: Install OneSignal Plugin

Di PowerShell:

```bash
cd C:\Users\Halut\Documents\GitHub\Project-Arsip-Digital

npm install onesignal-cordova-plugin --save
npm install @awesome-cordova-plugins/onesignal --save

npx cap sync
```

### Step 2.2: Update capacitor.config.ts

Add OneSignal config (ganti dengan OneSignal App ID Anda):

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rendatin.arsip',
  appName: 'Arsip Digital',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    OneSignal: {
      appId: 'YOUR_ONESIGNAL_APP_ID_HERE',  // ← Ganti ini!
      googleProjectNumber: 'YOUR_FIREBASE_SENDER_ID_HERE'  // ← Dan ini!
    }
  }
};

export default config;
```

---

## 💻 Phase 3: Code Integration

### Step 3.1: Create OneSignal Utility

Create file: `src/utils/oneSignalNotifications.js`

```javascript
// OneSignal Push Notifications
// Works even when app is CLOSED! 🎉

import OneSignal from 'onesignal-cordova-plugin';
import { Capacitor } from '@capacitor/core';

/**
 * Initialize OneSignal
 */
export async function initializeOneSignal() {
  if (!Capacitor.isNativePlatform()) {
    console.log('OneSignal: Not on native platform, skipping');
    return false;
  }

  try {
    console.log('🔔 Initializing OneSignal...');

    // OneSignal App ID from config
    const appId = 'YOUR_ONESIGNAL_APP_ID_HERE';  // ← Ganti ini!

    // Initialize
    OneSignal.setAppId(appId);

    // Request permission (iOS will show prompt, Android auto-granted)
    OneSignal.promptForPushNotificationsWithUserResponse((accepted) => {
      console.log('OneSignal permission:', accepted ? 'Granted' : 'Denied');
    });

    // Setup notification handlers
    setupOneSignalHandlers();

    console.log('✅ OneSignal initialized');
    return true;
  } catch (error) {
    console.error('❌ OneSignal initialization error:', error);
    return false;
  }
}

/**
 * Setup OneSignal event handlers
 */
function setupOneSignalHandlers() {
  // Handle notification opened (when user taps notification)
  OneSignal.setNotificationOpenedHandler((jsonData) => {
    console.log('📱 Notification opened:', jsonData);
    
    // You can navigate to specific page based on notification data
    const data = jsonData.notification.additionalData;
    if (data?.type === 'document') {
      // Navigate to document page
      console.log('Navigate to document:', data.documentId);
    }
  });

  // Handle notification received (when app is open/background)
  OneSignal.setNotificationWillShowInForegroundHandler((notificationReceivedEvent) => {
    console.log('📬 Notification received:', notificationReceivedEvent);
    
    // Display notification even when app is open
    notificationReceivedEvent.complete(notificationReceivedEvent.getNotification());
  });
}

/**
 * Get OneSignal Player ID (unique device identifier)
 * @returns {Promise<string|null>} Player ID
 */
export async function getOneSignalPlayerId() {
  try {
    const deviceState = await OneSignal.getDeviceState();
    return deviceState?.userId || null;
  } catch (error) {
    console.error('Error getting OneSignal Player ID:', error);
    return null;
  }
}

/**
 * Set External User ID (map to your database user ID)
 * @param {string} userId - Your database user ID
 */
export async function setOneSignalExternalUserId(userId) {
  try {
    OneSignal.setExternalUserId(userId);
    console.log('✅ OneSignal External User ID set:', userId);
  } catch (error) {
    console.error('Error setting External User ID:', error);
  }
}

/**
 * Remove External User ID (on logout)
 */
export async function removeOneSignalExternalUserId() {
  try {
    OneSignal.removeExternalUserId();
    console.log('✅ OneSignal External User ID removed');
  } catch (error) {
    console.error('Error removing External User ID:', error);
  }
}

/**
 * Send tags (for user segmentation)
 * @param {object} tags - Key-value pairs
 */
export async function sendOneSignalTags(tags) {
  try {
    OneSignal.sendTags(tags);
    console.log('✅ OneSignal tags sent:', tags);
  } catch (error) {
    console.error('Error sending tags:', error);
  }
}
```

### Step 3.2: Update App.jsx

Replace FCM code dengan OneSignal:

```javascript
import { initializeOneSignal, setOneSignalExternalUserId, removeOneSignalExternalUserId, sendOneSignalTags } from './utils/oneSignalNotifications';

// Di useEffect untuk initialization
useEffect(() => {
  if (Capacitor.isNativePlatform()) {
    console.log('🔔 Initializing OneSignal...');
    initializeOneSignal();
  }
}, []);

// Di useEffect setelah user login
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

### Step 3.3: Update notifications.js (Send via OneSignal API)

Replace Edge Function call dengan OneSignal REST API:

```javascript
/**
 * Send notification via OneSignal
 * @param {string} userId - Target user ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 */
export async function sendOneSignalNotification(userId, title, message, type) {
  try {
    const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID';  // ← Ganti!
    const ONESIGNAL_REST_API_KEY = 'YOUR_ONESIGNAL_REST_API_KEY';  // ← Ganti!

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

---

## 🧪 Phase 4: Testing

### Step 4.1: Rebuild & Install APK

```bash
npm run build
npx cap sync android
npx cap open android

# In Android Studio:
# Build > Build APK
# Install on device
```

### Step 4.2: Test from OneSignal Dashboard

1. **OneSignal Dashboard** > **Messages** > **New Push**
2. **Audience:** "Subscribed Users" (or test with specific External User ID)
3. **Content:**
   - Title: "Test dari OneSignal"
   - Message: "Ini test notification"
4. **Click:** "Send Message"
5. **Check device!**

### Step 4.3: Test from Code

Call `sendOneSignalNotification()` saat upload document:

```javascript
// In your upload document function
await sendOneSignalNotification(
  targetUserId,
  'Dokumen Baru',
  `${uploaderName} mengunggah dokumen baru`,
  'document'
);
```

---

## ✅ Benefits OneSignal vs Custom FCM

| Feature | Custom FCM (Failed) | OneSignal (Working) |
|---------|---------------------|---------------------|
| Setup Time | 5+ hours (still failing) | 30 minutes |
| Complexity | Very High (OAuth2, JWT) | Very Low (REST API) |
| Reliability | Failed multiple times | Proven, used by millions |
| Features | Basic notifications only | Rich: Analytics, Scheduling, A/B Testing |
| Cost | Free (if we could make it work) | Free tier: 10k users |
| Dashboard | None | Beautiful analytics dashboard |
| Support | DIY debug | Official support + docs |

---

## 📊 Next Steps

1. **Create OneSignal account** (5 min)
2. **Get App ID & REST API Key** (2 min)
3. **Install plugin** (`npm install`) (2 min)
4. **Update code** (copy paste dari guide) (15 min)
5. **Build & test** (10 min)

**Total: ~30 minutes sampai working notifications!** 🚀

---

## 💡 Pro Tips

- **External User ID** = Your database user ID (for targeting specific users)
- **Tags** = For segmentation (role, department, etc.)
- **Segments** = Group users (e.g., "All Admins", "Active Users")
- **Test mode** = Send to yourself first before broadcasting
- **Analytics** = Track open rates, delivery rates

---

## 🆘 Troubleshooting

### Issue: "No subscribed users"
**Solution:** Make sure app is installed and OneSignal initialized

### Issue: Notification not arriving
**Solution:** 
1. Check OneSignal dashboard > Delivery Status
2. Verify External User ID matches your database user ID
3. Check device notification settings

### Issue: "Invalid REST API Key"
**Solution:** Copy key from Settings > Keys & IDs (not from anywhere else)

---

**Ready to start? Let's do Phase 1 first!** 🎯
