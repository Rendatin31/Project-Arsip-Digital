# 🎯 NEXT 3 STEPS - OneSignal Implementation

## ✅ Everything is Ready!

All code has been updated by Kiro. You just need to complete **3 manual steps** to make notifications work when app is CLOSED!

---

## 📋 3 Steps (Total: ~20 minutes)

### 🔑 STEP 1: Get REST API Key (2 minutes)

**What:** Copy OneSignal REST API Key dan paste ke code

**How:**

1. **Open:** https://onesignal.com/
2. **Login** with your account
3. **Click:** "arsip digital App" from dashboard
4. **Click:** Settings ⚙️ icon (left sidebar)
5. **Click:** "Keys & IDs" tab
6. **Find:** "REST API Key" section
7. **Click:** Eye icon 👁️ to reveal the key
8. **Copy:** The long key (looks like: `MWYxNjdmYWMtNDZiZC0xMWVmLWFkY2QtMDI0MmFjMTIwMDA0`)

**Then:**

9. **Open file:** `src/utils/notifications.js` (in this project)
10. **Go to:** Line 8
11. **Find:** `const ONESIGNAL_REST_API_KEY = 'YOUR_REST_API_KEY_HERE';`
12. **Replace:** `YOUR_REST_API_KEY_HERE` dengan key yang di-copy (keep the quotes!)
13. **Save** the file

**Example:**
```javascript
// BEFORE
const ONESIGNAL_REST_API_KEY = 'YOUR_REST_API_KEY_HERE';

// AFTER
const ONESIGNAL_REST_API_KEY = 'MWYxNjdmYWMtNDZiZC0xMWVmLWFkY2QtMDI0MmFjMTIwMDA0';
```

**Verify:**
- ✅ Key tidak ada tulisan "YOUR_REST_API_KEY_HERE"
- ✅ Key panjangnya 40+ characters
- ✅ Key ada dalam quotes: `'...'`

---

### 📦 STEP 2: Build APK (10 minutes)

**What:** Compile project jadi APK file dan install ke device

**How:**

**Open PowerShell di folder project** (right-click folder → "Open in Terminal")

```powershell
# 2.1: Build web assets (1-2 min)
npm run build

# 2.2: Sync to Android (30 sec)
npx cap sync android

# 2.3: Open Android Studio (30 sec)
npx cap open android
```

**Wait:** Android Studio akan open dan Gradle sync akan jalan (~2-3 min)

**When Gradle done:**

1. **Menu:** Build → Build Bundle(s) / APK(s) → Build APK(s)
2. **Wait:** Build process (~3-5 min)
3. **When done:** Popup muncul "APK(s) generated successfully"
4. **Click:** "locate" untuk cari file APK

**APK Location:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Install to Device:**

**Option A: Via USB Cable**
- Connect phone to PC
- Copy `app-debug.apk` to phone
- On phone: Open file → Install

**Option B: Via Google Drive / Dropbox**
- Upload APK to cloud
- Download on phone
- Install

**Option C: Via ADB**
```powershell
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Then on device:**
- **Open** app
- **Login** dengan user account
- **Check** console logs (if using USB debugging)

**Verify:**
- ✅ APK installed successfully
- ✅ App opens without crash
- ✅ Can login successfully
- ✅ No error messages

---

### 🧪 STEP 3: Test Notification (5 minutes)

**What:** Send test notification dari OneSignal Dashboard dan verify device receives it EVEN WHEN APP IS CLOSED!

**How:**

**Part A: Test from OneSignal Dashboard (EASIEST)**

1. **Open:** https://onesignal.com/
2. **Login** with your account
3. **Click:** "arsip digital App"
4. **Click:** "Messages" (left sidebar)
5. **Click:** "New Push" button (blue button)
6. **Step 1 - Audience:**
   - Select: "Subscribed Users" (atau "Send to Everyone")
   - Click: Next
7. **Step 2 - Content:**
   - **Title:** `Test dari OneSignal`
   - **Message:** `Ini test notification dari dashboard`
   - Click: Next
8. **Step 3 - Delivery:**
   - Leave as "Send immediately"
   - Click: **Send Message**

**Then on device:**
9. **CLOSE APP** (swipe close, kill app completely)
10. **WAIT** 5-10 seconds
11. **CHECK** notification tray
12. **Notification should appear!** 🎉

**Verify:**
- ✅ Notification muncul di notification tray
- ✅ Notification muncul EVEN WHEN APP WAS CLOSED
- ✅ Tap notification opens app

**Part B: Test from Code (Upload Document)**

1. **On desktop:** Open https://rendatinarsip.vercel.app
2. **Login** dengan user berbeda (NOT the same user as device)
3. **Upload** dokumen baru
4. **On device:** Notification should appear!

**Verify:**
- ✅ Notification muncul when other user uploads
- ✅ Notification shows correct title and message
- ✅ Works even if app is CLOSED

---

## ✅ Success Checklist

### After STEP 1:
- [ ] REST API Key copied from OneSignal Dashboard
- [ ] Key pasted to `src/utils/notifications.js` line 8
- [ ] No "YOUR_REST_API_KEY_HERE" in file
- [ ] File saved

### After STEP 2:
- [ ] `npm run build` completed successfully
- [ ] `npx cap sync android` completed
- [ ] Android Studio opened
- [ ] Gradle sync completed
- [ ] APK built successfully
- [ ] APK transferred to device
- [ ] APK installed on device
- [ ] App opened successfully
- [ ] User logged in

### After STEP 3:
- [ ] OneSignal Dashboard shows "1+ Subscribed Users"
- [ ] Test notification sent from dashboard
- [ ] App CLOSED on device (swipe close)
- [ ] **Notification appeared in tray** ✨
- [ ] Tap notification opens app
- [ ] Upload test from desktop works

---

## 📊 Expected Console Logs

When app starts on device, you should see:

```
🔔 Initializing push notifications...
✅ Local push notifications initialized successfully
🔔 Initializing OneSignal...
✅ OneSignal initialized successfully!
👤 User logged in, setting OneSignal External User ID...
✅ OneSignal External User ID set: <user-id>
✅ OneSignal tags sent: {role: 'admin', email: '...', name: '...'}
```

When notification is sent:

```
📤 Sending OneSignal notification to user: <user-id>
✅ OneSignal notification sent: <notification-id>
```

---

## 🆘 Troubleshooting

### Problem: "No subscribed users" in OneSignal Dashboard

**Possible causes:**
- App not installed with latest code
- User not logged in
- OneSignal not initialized

**Solution:**
1. Rebuild APK with latest code
2. Reinstall app on device
3. Login with user account
4. Check console logs for: `✅ OneSignal initialized successfully!`
5. Wait 1-2 minutes, refresh OneSignal Dashboard

---

### Problem: Notification not arriving

**Possible causes:**
- REST API Key incorrect
- Device notification settings disabled
- OneSignal not initialized properly

**Solution:**
1. **Check REST API Key:**
   - Open `src/utils/notifications.js`
   - Line 8 should NOT be `YOUR_REST_API_KEY_HERE`
   - Key should be 40+ characters
   - If wrong, fix and rebuild APK
   
2. **Check Device Settings:**
   - Android: Settings → Apps → Arsip Digital → Notifications
   - Make sure notifications are ENABLED
   
3. **Check OneSignal Dashboard:**
   - Delivery → Delivery Log
   - Look for your notification
   - Check for errors
   
4. **Check Console Logs:**
   - Look for: `✅ OneSignal notification sent`
   - Look for errors: `❌`

---

### Problem: Build error

**Possible causes:**
- Dependencies not installed
- Cache issues
- Gradle error

**Solution:**
```powershell
# Clean and reinstall
npm install
npm run build

# If still error, clean gradle cache
cd android
.\gradlew clean
cd ..

# Then rebuild
npx cap sync android
npx cap open android
```

---

## 📚 Need Help?

Read these files:

| Issue | Read This |
|-------|-----------|
| Need detailed guide | `ONESIGNAL-FINAL-STEPS.md` |
| How to get REST API Key | `ONESIGNAL-GET-API-KEY.md` |
| What code changed | `ONESIGNAL-CHANGES-SUMMARY.md` |
| Full documentation | `ONESIGNAL-SETUP-GUIDE.md` |
| Quick overview | `README-ONESIGNAL.md` |

---

## ⏰ Time Estimate

| Step | Task | Time |
|------|------|------|
| 1 | Get REST API Key | 2 min |
| 2 | Build APK | 10 min |
| 3 | Test Notification | 5 min |
| **TOTAL** | **All steps** | **17 min** |

---

## 🎯 Final Goal

**After completing all 3 steps:**

You should be able to:
✅ Send notification to device
✅ Notification appears even when app is CLOSED
✅ This is the KEY improvement!

---

## 🚀 Ready?

**START NOW:**
1. Go to https://onesignal.com/
2. Follow STEP 1 above
3. Then STEP 2
4. Then STEP 3
5. Done! 🎉

**Good luck!** 🚀

**Questions? Check the documentation files above!**
