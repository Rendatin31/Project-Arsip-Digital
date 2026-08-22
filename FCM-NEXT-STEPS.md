# FCM Implementation - Next Steps 🚀

## ✅ Phase 3 Complete - Code Integration DONE!

### What Was Just Completed:

#### 1. **FCM Integration in App.jsx** ✅
```javascript
- Initialize FCM on app start
- Get FCM token when user logs in
- Save FCM token to database
- Setup FCM message listeners
- Remove FCM token on logout
```

#### 2. **Database Migration Ready** ✅
```sql
File: add-fcm-token-column.sql
- Add fcm_token column to profiles
- Add fcm_token_updated_at timestamp
- Create index for performance
```

#### 3. **Build & Sync Complete** ✅
```
✅ npm run build - SUCCESS
✅ npx cap sync android - SUCCESS
✅ FCM plugin detected: @capacitor-firebase/messaging@8.4.0
```

---

## 📋 Step 1: Run Database Migration

### Execute SQL in Supabase Dashboard:

```
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Click "New query"
5. Copy content from: add-fcm-token-column.sql
6. Click "Run"
7. Verify: Should see "Success. No rows returned"
```

### Expected Result:
```sql
-- Columns added:
- fcm_token (TEXT, nullable)
- fcm_token_updated_at (TIMESTAMPTZ, nullable)

-- Index created:
- idx_profiles_fcm_token
```

---

## 📋 Step 2: Test in Android Studio

### 2.1 Open Android Studio
```bash
npx cap open android
```

### 2.2 Wait for Gradle Sync
```
- Android Studio will sync automatically
- Wait for "Gradle sync finished" message
- Check for errors (should be none!)
```

### 2.3 Build APK
```
1. Build > Build Bundle(s) / APK(s) > Build APK(s)
2. Wait for build to finish (~2-3 minutes)
3. Click "locate" to find APK file
```

### 2.4 Install on Device
```
1. Transfer APK to your Android device
2. Install APK (uninstall old version first!)
3. Open app
```

---

## 🧪 Step 3: Test FCM

### Test 1: Check FCM Token
```
1. Open app on device
2. Login with your account
3. Open Chrome DevTools: chrome://inspect#devices
4. Find "Arsip Digital" and click "inspect"
5. Go to Console tab
6. Look for logs:

Expected logs:
✅ "🔔 Initializing push notifications..."
✅ "✅ Local push notifications initialized successfully"
✅ "🔥 FCM initialized successfully"
✅ "🔥 User logged in, getting FCM token..."
✅ "🔥 FCM token obtained, saving to database..."
✅ "✅ FCM token saved successfully"
```

### Test 2: Verify Token in Database
```
1. Go to Supabase Dashboard
2. Table Editor > profiles
3. Find your user row
4. Check fcm_token column
5. Should contain a long token string

Example:
fcm_token: "dK3hZ2X8Qw2:APA91bE..."
fcm_token_updated_at: "2026-08-22T06:30:00Z"
```

### Test 3: Test Notification (Coming Soon)
```
Will implement in Phase 4:
- Supabase Edge Function to send FCM
- Test notification from User A to User B
- Verify notification appears when app is closed
```

---

## 📊 Current Architecture

### How FCM Works Now:

```
User A (Any Device) uploads document
    ↓
Database: INSERT notification for User B
    ↓
Supabase Realtime: Broadcast to User B (if app open)
    ↓
User B Device: Display local notification

NEW WITH FCM:
User A uploads document
    ↓
Database: INSERT notification for User B
    ↓
Supabase Edge Function: Get User B's FCM token
    ↓
Firebase API: Send FCM message
    ↓
User B Device: Receive push notification (EVEN IF APP CLOSED!) ✅
```

---

## 🎯 Phase 4 Preview: Supabase Edge Function

### What We'll Build Next:

**File**: `supabase/functions/send-fcm-notification/index.ts`

```typescript
// Supabase Edge Function to send FCM notifications
import { serve } from 'https://deno.land/std/http/server.ts'

serve(async (req) => {
  // 1. Get notification details from request
  // 2. Get user's FCM token from database
  // 3. Send FCM message via Firebase API
  // 4. Return success/error
})
```

### Integration Points:
```javascript
// When notification is created
await supabase.rpc('create_notification', {...});

// NEW: Also trigger Edge Function
await supabase.functions.invoke('send-fcm-notification', {
  body: {
    userId: 'user-b-id',
    title: 'Dokumen Baru',
    message: 'User A mengunggah...',
    type: 'upload'
  }
});
```

---

## ✅ Verification Checklist

Before proceeding to Phase 4:

### Code:
- [x] FCM dependencies installed ✅
- [x] google-services.json in place ✅
- [x] Android build.gradle configured ✅
- [x] App.jsx FCM integration ✅
- [x] FCM utility functions created ✅
- [x] Build & sync successful ✅

### Database:
- [ ] fcm_token column added ⏳
- [ ] Migration executed ⏳
- [ ] Columns verified ⏳

### Testing:
- [ ] APK built in Android Studio ⏳
- [ ] App installed on device ⏳
- [ ] FCM token obtained ⏳
- [ ] Token saved in database ⏳
- [ ] Console logs verified ⏳

---

## 🚀 Timeline

### Completed:
- ✅ Phase 1: Setup (FCM dependencies)
- ✅ Phase 2: Firebase Console (google-services.json)
- ✅ Phase 3: Code Integration (App.jsx, utilities)

### Current:
- ⏳ Database migration
- ⏳ Android Studio build & test
- ⏳ Verify FCM token

### Next (Phase 4):
- ⏭️ Create Supabase Edge Function
- ⏭️ Integrate FCM sending
- ⏭️ Test closed-app notifications
- ⏭️ Multi-device testing
- ⏭️ Production deployment

---

## 📞 Troubleshooting

### Issue 1: "FCM initialization failed"
```
Check:
1. google-services.json in correct location
2. Package name matches: com.rendatin.arsip
3. Firebase project properly configured
4. Rebuild APK in Android Studio
```

### Issue 2: "Cannot save FCM token"
```
Check:
1. Database migration executed
2. fcm_token column exists in profiles table
3. User is logged in
4. Network connection
```

### Issue 3: "Gradle sync failed"
```
Solution:
1. Clean build: cd android && ./gradlew clean
2. Invalidate caches: File > Invalidate Caches / Restart
3. Sync again: npx cap sync android
4. Rebuild in Android Studio
```

---

## 💡 What to Do Now

### Step-by-Step:

1. **Run SQL Migration**
   ```
   - Copy content from add-fcm-token-column.sql
   - Execute in Supabase SQL Editor
   - Verify columns added
   ```

2. **Build APK**
   ```bash
   npx cap open android
   # Wait for Gradle sync
   # Build > Build APK
   ```

3. **Test on Device**
   ```
   - Install APK
   - Login
   - Check console logs
   - Verify FCM token in database
   ```

4. **Report Back**
   ```
   Tell me:
   - "Migration executed successfully" ✅
   - "FCM token saved in database" ✅
   - Screenshot of console logs (optional)
   ```

---

## 🎉 Progress Report

**Overall Progress: 75% Complete!**

```
[████████████████████▓▓▓▓▓▓▓] 75%

✅ Setup & Configuration
✅ Firebase Console
✅ Code Integration
⏳ Database Migration (YOU ARE HERE)
⏳ Testing
⏭️ Edge Function
⏭️ Production Ready
```

---

**Next Action**: Run database migration in Supabase Dashboard!

Once done, tell me: **"Migration executed successfully"**

Then we'll build APK and test! 🚀
