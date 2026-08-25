# Testing Checklist - Push Notifications & Back Button

## 📋 Pre-Testing Requirements

- [ ] Android Studio installed and configured
- [ ] Physical Android device (Android 8.0+)
- [ ] USB debugging enabled on device
- [ ] Device connected to computer

---

## 🔨 Build Steps

### 1. Build and Sync (DONE ✅)
```bash
npm run build          # ✅ COMPLETE
npx cap sync android   # ✅ COMPLETE
```

### 2. Open Android Studio
```bash
npx cap open android
```

### 3. Rebuild APK
- [ ] Open project in Android Studio
- [ ] Wait for Gradle sync to complete
- [ ] Build > Build Bundle(s) / APK(s) > Build APK(s)
- [ ] Wait for build to finish
- [ ] Click "locate" to find APK file

### 4. Install APK on Device
- [ ] Transfer APK to device (ADB or manual transfer)
- [ ] Install APK on device
- [ ] Open app

---

## 🧪 Test Cases

### Test 1: Push Notification Permission
**Steps:**
1. Open app for the first time (or after clearing data)
2. App should automatically request notification permission
3. Check console logs for: `🔔 Initializing push notifications...`

**Expected Result:**
- [ ] Permission dialog appears
- [ ] Can click "Allow" or "Deny"
- [ ] Console shows: `✅ Push notifications initialized successfully`

---

### Test 2: Notification Channel (Android Only)
**Steps:**
1. After allowing notifications
2. Go to device Settings > Apps > Arsip Digital > Notifications
3. Check notification channels

**Expected Result:**
- [ ] Channel named "Arsip Digital Notifications" exists
- [ ] Channel is enabled by default
- [ ] Sound and vibration are enabled

---

### Test 3: Back Button - Modal Behavior
**Steps:**
1. Open app and login
2. Navigate to any page (e.g., Documents)
3. Open "Add Document" modal (click + button)
4. Press device back button

**Expected Result:**
- [ ] Modal closes
- [ ] App stays on Documents page
- [ ] Console shows: `Modal open, closing modal`

---

### Test 4: Back Button - Navigation
**Steps:**
1. Navigate to Categories page
2. Press device back button
3. Repeat for other pages (Search, History, Profile, etc.)

**Expected Result:**
- [ ] Navigates back to Dashboard
- [ ] Console shows: `Not on dashboard, navigating to dashboard`
- [ ] Dashboard page is displayed

---

### Test 5: Back Button - Minimize App
**Steps:**
1. Make sure you're on Dashboard page
2. Press device back button
3. Check device recent apps

**Expected Result:**
- [ ] App minimizes (goes to background)
- [ ] Console shows: `On dashboard, minimizing app`
- [ ] App is visible in recent apps list
- [ ] App is NOT closed

---

### Test 6: Back Button - Close App
**Steps:**
1. Press device back button to minimize app
2. Open recent apps (swipe up gesture)
3. Swipe Arsip Digital app away

**Expected Result:**
- [ ] App closes completely
- [ ] App is removed from recent apps
- [ ] App must be re-launched to use again

---

### Test 7: Back Button - Login Page
**Steps:**
1. Logout from app
2. On login page, press device back button

**Expected Result:**
- [ ] App closes (normal back button behavior)
- [ ] Console shows: `On auth page, allowing default back`
- [ ] No minimize behavior

---

### Test 8: Notification Display (Manual Trigger)
**Steps:**
1. Trigger a notification from app (e.g., upload document, delete, etc.)
2. Check notification bar

**Expected Result:**
- [ ] Notification appears in status bar
- [ ] Notification shows title and message
- [ ] Notification has app icon
- [ ] Can tap to open app

---

### Test 9: Notification Tap
**Steps:**
1. Trigger a notification
2. Pull down notification drawer
3. Tap on notification

**Expected Result:**
- [ ] App opens (if closed)
- [ ] App comes to foreground (if minimized)
- [ ] Console shows: `📱 Notification tapped: [notification data]`

---

### Test 10: App Lifecycle
**Steps:**
1. Open app
2. Minimize app (home button)
3. Open another app
4. Return to Arsip Digital from recent apps

**Expected Result:**
- [ ] App resumes from where you left off
- [ ] No data loss
- [ ] Session is maintained
- [ ] Push notifications still work

---

## 🐛 Known Issues to Check

- [ ] Back button works correctly with nested modals
- [ ] Notifications work after app restart
- [ ] No memory leaks from listeners
- [ ] Console logs are helpful for debugging
- [ ] No crashes on back button spam

---

## 📝 Testing Notes

### Device Information:
- **Device Model**: _________________
- **Android Version**: _________________
- **Test Date**: _________________
- **Tester Name**: _________________

### Issues Found:
1. _________________________________
2. _________________________________
3. _________________________________

### Additional Notes:
_________________________________
_________________________________
_________________________________

---

## ✅ Sign-off

- [ ] All tests passed
- [ ] No critical issues found
- [ ] Ready for production deployment
- [ ] APK uploaded to Supabase Storage
- [ ] Download link verified

**Tested By**: _________________ **Date**: _________________
**Approved By**: _________________ **Date**: _________________

---

## 🚀 Next Steps After Testing

1. [ ] Upload signed APK to Supabase Storage
2. [ ] Update download link: `https://axpanhequppcviaimwte.supabase.co/storage/v1/object/public/apk-files/rendatin-arsip-v.1.0.1.apk`
3. [ ] Test download from mobile browser
4. [ ] Test installation from downloaded APK
5. [ ] Deploy web version to Vercel
6. [ ] Update documentation with test results
