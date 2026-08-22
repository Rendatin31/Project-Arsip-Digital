# Firebase Cloud Messaging (FCM) Setup Guide

## 🎯 Goal
Implement FCM untuk push notifications yang bekerja BAHKAN saat app di-close completely.

---

## 📋 Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
```
URL: https://console.firebase.google.com
```

### 1.2 Create New Project
1. Click **"Add project"** atau **"Create a project"**
2. Project name: **Arsip Digital** (atau nama bebas)
3. Click **"Continue"**

### 1.3 Google Analytics (Optional)
```
- Enable Google Analytics? → Your choice (recommended: OFF untuk simplicity)
- If OFF: Click "Create project"
- If ON: Select or create Analytics account → Click "Create project"
```

### 1.4 Wait for Project Creation
```
⏳ Wait ~30-60 seconds
✅ "Your new project is ready"
→ Click "Continue"
```

---

## 📱 Step 2: Add Android App to Firebase

### 2.1 Add App
```
1. On Firebase Console dashboard
2. Click Android icon (robot icon) 
   OR
   Click ⚙️ (Settings) > Project settings > Scroll down > Click "Add app" > Android
```

### 2.2 Register App
```
Android package name: com.rendatin.arsip
  ⚠️ IMPORTANT: Harus sama dengan appId di capacitor.config.ts!
  
App nickname (optional): Arsip Digital App
  
Debug signing certificate SHA-1 (optional): 
  → Skip for now (Click "Register app")
```

### 2.3 Download google-services.json
```
1. Click "Download google-services.json"
2. Save file to your computer
3. Click "Next"
```

### 2.4 Add Firebase SDK
```
→ Skip this step (we already installed via npm)
→ Click "Next"
```

### 2.5 Complete Setup
```
→ Click "Continue to console"
```

---

## 📂 Step 3: Place google-services.json

### 3.1 Location
```
File: google-services.json (yang baru di-download)
Target: android/app/google-services.json

Full path:
c:\Users\Halut\Documents\GitHub\Project-Arsip-Digital\android\app\google-services.json
```

### 3.2 Verify File Content
File should look like this:
```json
{
  "project_info": {
    "project_number": "123456789",
    "project_id": "arsip-digital-xxxxx",
    "storage_bucket": "arsip-digital-xxxxx.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:123456789:android:xxxxx",
        "android_client_info": {
          "package_name": "com.rendatin.arsip"
        }
      }
    }
  ]
}
```

---

## ⚙️ Step 4: Configure Android Project

### 4.1 Check build.gradle Files
These should already be configured by Capacitor, but verify:

**File: android/build.gradle**
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

**File: android/app/build.gradle**
```gradle
plugins {
    id 'com.android.application'
    id 'com.google.gms.google-services'  // Add this line
}

dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-messaging'
}
```

---

## 🔧 Step 5: Enable FCM in Firebase Console

### 5.1 Enable Cloud Messaging API
```
1. Firebase Console → Project settings
2. Click "Cloud Messaging" tab
3. Under "Cloud Messaging API (Legacy)"
4. Note down "Server key" (will need later for Supabase)
```

### 5.2 (Optional) Enable Firebase Cloud Messaging API (V1)
```
1. Go to: https://console.cloud.google.com
2. Select your Firebase project
3. Search: "Firebase Cloud Messaging API"
4. Click "Enable"
```

---

## 📝 Step 6: Save Important Info

Save these for later configuration:

```
Project ID: ____________________
Project Number: ____________________
Server Key: ____________________
```

You can find these in:
```
Firebase Console → ⚙️ Settings → Project settings → General tab
```

---

## ✅ Verification Checklist

Before proceeding to code implementation:

- [ ] Firebase project created
- [ ] Android app registered in Firebase
- [ ] Package name: `com.rendatin.arsip` ✅
- [ ] `google-services.json` downloaded
- [ ] `google-services.json` placed in `android/app/`
- [ ] Firebase Cloud Messaging enabled
- [ ] Server key noted down

---

## 🚀 Next Steps

Once Firebase setup is complete:
1. ✅ Install dependencies (DONE)
2. ✅ Firebase project created (DONE)
3. ⏭️ Configure code implementation
4. ⏭️ Test FCM notifications
5. ⏭️ Integrate with Supabase

---

## 📞 Troubleshooting

### Issue: "Package name doesn't match"
```
Solution:
1. Check capacitor.config.ts → appId: 'com.rendatin.arsip'
2. Check Firebase Console → Android app → Package name
3. Must be EXACTLY the same
```

### Issue: "google-services.json not found"
```
Solution:
1. Verify file location: android/app/google-services.json
2. Not: android/google-services.json (wrong!)
3. Not: src/google-services.json (wrong!)
```

### Issue: "Firebase build error"
```
Solution:
1. Clean build: cd android && ./gradlew clean
2. Rebuild: npx cap sync android
3. Open Android Studio and rebuild
```

---

## 📚 References

- Firebase Console: https://console.firebase.google.com
- FCM Documentation: https://firebase.google.com/docs/cloud-messaging
- Capacitor Firebase: https://github.com/capawesome-team/capacitor-firebase

---

**Status**: Ready for Firebase Console setup! 🎉

**Action Required**: 
1. Go to https://console.firebase.google.com
2. Follow steps above to create project and add Android app
3. Download google-services.json
4. Come back to continue implementation!
