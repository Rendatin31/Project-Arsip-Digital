# FCM Implementation Status & Tracking

## 📊 Current Status: DEBUGGING

**Issue:** Notifications not appearing on Android device when other users upload documents

**Last Updated:** August 22, 2026

---

## ✅ Implementation Complete (100%)

### Phase 1: Firebase Setup ✅
- [x] Firebase project created: `arsip-digital-26222`
- [x] `google-services.json` downloaded
- [x] `google-services.json` placed in `android/app/`
- [x] Firebase config verified

### Phase 2: Android Dependencies ✅
- [x] Firebase BOM dependency added
- [x] Firebase Messaging dependency added
- [x] Google Services plugin added
- [x] `android/app/build.gradle` configured

### Phase 3: Code Integration ✅
- [x] `capacitor.config.ts` configured with FirebaseMessaging plugin
- [x] `src/utils/fcmNotifications.js` created
- [x] `src/App.jsx` updated with FCM initialization
- [x] FCM token saving/removing logic implemented
- [x] FCM listeners setup

### Phase 4: Edge Function ✅
- [x] Edge Function created: `supabase/functions/send-fcm-notification/index.ts`
- [x] Uses FCM v1 API (not Legacy)
- [x] OAuth2 access token implementation
- [x] Error handling and token invalidation
- [x] Edge Function deployed to Supabase

### Phase 5: Service Account ✅
- [x] Service Account JSON downloaded from Firebase
- [x] JSON minified (single line, no spaces)
- [x] Secret set in Supabase: `FIREBASE_SERVICE_ACCOUNT`
- [x] Secret verified (shows in `supabase secrets list`)

### Phase 6: Database Migration ✅
- [x] SQL migration created: `add-fcm-token-column.sql`
- [x] Columns added: `fcm_token`, `fcm_token_updated_at`
- [x] Migration executed successfully
- [x] One user has FCM token saved

### Phase 7: Notification Integration ✅
- [x] `src/utils/notifications.js` updated
- [x] Edge Function invoked in `createNotification()`
- [x] Error handling for Edge Function failures
- [x] Console logging for debugging

### Phase 8: APK Build ✅
- [x] Build commands executed
- [x] APK generated
- [x] APK installed on device
- [x] User logged in

---

## 🐛 Current Issue: Notifications Not Appearing

### Known Facts:
1. ✅ Edge Function deployed
2. ✅ Service Account configured
3. ✅ Database columns exist
4. ✅ One user has FCM token in database
5. ❌ Notifications not appearing on device

### Possible Causes:

#### 1. User Mismatch (Most Likely)
```
Problem: Device logged in as User A, but token saved for User B
Check: Compare logged-in user with user that has token in database
Fix: Login on device with correct user
```

#### 2. Edge Function Not Triggered
```
Problem: Upload document doesn't invoke Edge Function
Check: Desktop console logs during upload
Expected: "✅ FCM notification sent via Edge Function"
Fix: Verify notifications.js integration
```

#### 3. Device Permission Issue
```
Problem: Notification permission not enabled
Check: Device Settings > Apps > Arsip Digital > Notifications
Fix: Enable notification permission
```

#### 4. Invalid/Expired Token
```
Problem: FCM token in database is invalid
Check: Manual test Edge Function (see below)
Fix: Reinstall app to generate fresh token
```

#### 5. APK Version Mismatch
```
Problem: Installed APK doesn't have FCM code
Check: APK build date vs FCM code integration date
Fix: Rebuild and reinstall APK
```

---

## 🧪 Debugging Strategy

### Priority 1: Manual Test (Fastest!)

**Purpose:** Verify FCM works end-to-end, bypass upload trigger

**Steps:**
1. Get user ID with token from database
2. Manual invoke Edge Function from Supabase Dashboard
3. Check device for notification

**Expected Result:**
- ✅ Notification appears → FCM works! Issue is trigger
- ❌ Notification doesn't appear → FCM/device issue

**Files Created for This:**
- `MULAI-DI-SINI.md` - Quick start guide
- `CARA-DEBUG-NOTIFIKASI.md` - Indonesian debugging guide
- `FCM-TROUBLESHOOT-SIMPLE.md` - Simple troubleshooting
- `QUICK-FCM-DEBUG.md` - Detailed step-by-step

### Priority 2: Check Upload Trigger

**Purpose:** Verify Edge Function is invoked during upload

**Steps:**
1. Open desktop browser console (F12)
2. Upload document
3. Check console logs

**Expected Log:**
```
✅ FCM notification sent via Edge Function
```

**If Missing:** Check `src/utils/notifications.js` integration

### Priority 3: Check Edge Function Logs

**Purpose:** See if Edge Function received request and processed it

**Steps:**
1. Supabase Dashboard > Functions > send-fcm-notification > Logs
2. Check recent invocations
3. Look for errors

**Expected Logs:**
```
🔥 FCM Edge Function called
✅ FCM notification sent successfully!
```

---

## 📋 Information Needed from User

To debug effectively, need:

1. **Manual Test Result:**
   - Success or failure?
   - Screenshot of response JSON

2. **User Info:**
   - Email of user logged in on device
   - Email of user with token in database
   - Do they match?

3. **Console Logs (if manual test succeeds):**
   - Desktop browser console during upload
   - Screenshot of logs mentioning "FCM"

4. **Edge Function Logs:**
   - Screenshot from Supabase Dashboard
   - Recent invocations after upload attempt

5. **Device Info:**
   - Android version
   - Notification permission status
   - APK install date
   - Battery optimization setting

---

## 🎯 Next Actions

### For User:
1. Run manual test (MULAI-DI-SINI.md)
2. Report result
3. Provide info from checklist above

### For Me (Based on Results):

#### If Manual Test Succeeds:
```
→ FCM works!
→ Focus on upload trigger
→ Check notifications.js
→ Check desktop console logs
→ Verify Edge Function is called during upload
```

#### If Manual Test Fails:
```
→ FCM/device issue
→ Check user match
→ Check device settings
→ Check token validity
→ Rebuild APK if needed
```

---

## 📁 Documentation Files Created

### User-Facing Guides:
1. `MULAI-DI-SINI.md` - Quick start, manual test guide
2. `CARA-DEBUG-NOTIFIKASI.md` - Complete debugging guide (Indonesian)
3. `FCM-TROUBLESHOOT-SIMPLE.md` - Simple troubleshooting flowchart
4. `QUICK-FCM-DEBUG.md` - Detailed step-by-step debugging
5. `DEBUG-FCM-NOTIFICATIONS.md` - Comprehensive debugging checklist

### Technical References:
1. `FCM-IMPLEMENTATION-COMPLETE.md` - Full implementation docs
2. `FCM-SETUP-GUIDE.md` - Setup guide
3. `GET-FIREBASE-SERVICE-ACCOUNT.md` - Service Account guide
4. `DEPLOY-FCM-EDGE-FUNCTION.md` - Edge Function deployment

### SQL Scripts:
1. `check-fcm-tokens.sql` - Query to check tokens in database
2. `add-fcm-token-column.sql` - Database migration (already executed)

### Summary:
1. `FCM-DEBUG-SUMMARY.md` - Debug summary
2. `FCM-STATUS-TRACKING.md` - This file

---

## 🔍 Key Files to Monitor

### Code Files:
- `src/App.jsx` (lines 140-200) - FCM initialization
- `src/utils/fcmNotifications.js` - FCM utilities
- `src/utils/notifications.js` (lines 60-80) - Edge Function invocation
- `supabase/functions/send-fcm-notification/index.ts` - Edge Function

### Config Files:
- `android/app/google-services.json` - Firebase config
- `android/app/build.gradle` - Dependencies
- `capacitor.config.ts` - Capacitor plugins

---

## 📊 Success Criteria

### FCM is Working When:
1. ✅ Manual test sends notification to device
2. ✅ Upload document triggers Edge Function (console log visible)
3. ✅ Edge Function logs show successful FCM send
4. ✅ Device receives notification within 1-2 seconds
5. ✅ Notification appears even when app is closed

### Currently:
- Manual test: ⏳ Not tested yet
- Upload trigger: ⏳ Unknown
- Edge Function: ✅ Deployed, not tested
- Device notification: ❌ Not appearing
- Closed app: ❌ Not working

---

## 💡 Learnings

### What Worked:
1. FCM v1 API with OAuth2 (Legacy API disabled for new projects)
2. Service Account JSON minified as single-line secret
3. Edge Function approach for server-side FCM send
4. Token management in database
5. Comprehensive error handling and logging

### What to Watch:
1. User mismatch (device vs database token)
2. Edge Function trigger (must be called from createNotification)
3. Device permissions (Android 12+)
4. Token expiration (refresh needed)
5. APK version (must have FCM code)

### Best Practices:
1. Manual test first (fastest verification)
2. Check console logs (immediate feedback)
3. Monitor Edge Function logs (server-side visibility)
4. User match validation (prevent confusion)
5. Clear documentation (multiple guides for different needs)

---

## 🚀 Current Phase: **DEBUGGING & VERIFICATION**

**Goal:** Identify why notifications not appearing and fix

**Method:** Manual test + systematic debugging

**Expected Duration:** 10-30 minutes (depending on issue)

**Success Indicator:** Device receives notification from manual test

---

**Status:** Waiting for user to run manual test and report results

**Next Update:** After receiving test results from user
