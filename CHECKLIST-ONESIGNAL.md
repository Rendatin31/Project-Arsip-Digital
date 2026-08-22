# ✅ OneSignal Implementation Checklist

## 🤖 Completed by Kiro:

- [x] OneSignal account created
- [x] App "arsip digital App" created
- [x] Service Account JSON uploaded
- [x] OneSignal App ID: `663c3ef2-4bf4-4073-ab3b-47fb918faec5`
- [x] Plugin installed: `onesignal-cordova-plugin`
- [x] `capacitor.config.ts` updated
- [x] `src/utils/oneSignalNotifications.js` created
- [x] `src/App.jsx` updated:
  - [x] FCM imports removed
  - [x] OneSignal imports added
  - [x] OneSignal initialization added
  - [x] External User ID logic added
  - [x] Cleanup on logout added
- [x] `src/utils/notifications.js` updated:
  - [x] OneSignal REST API function added
  - [x] Edge Function call removed
  - [x] `createNotification()` updated

---

## 👤 TODO by User (3 steps, ~20 min):

### Step 1: Get REST API Key ⏰ 2 min
- [ ] Login to https://onesignal.com/
- [ ] Go to Settings > Keys & IDs
- [ ] Copy "REST API Key"
- [ ] Edit `src/utils/notifications.js` line 8
- [ ] Replace `YOUR_REST_API_KEY_HERE` with actual key
- [ ] Save file

**Verify:**
- [ ] No "YOUR_REST_API_KEY_HERE" in file
- [ ] Key is 40+ characters long

---

### Step 2: Build APK ⏰ 10 min
- [ ] Run: `npm run build`
- [ ] Run: `npx cap sync android`
- [ ] Run: `npx cap open android`
- [ ] Wait for Gradle sync
- [ ] Build > Build APK
- [ ] Wait for build (~5 min)
- [ ] Locate APK file
- [ ] Transfer to device
- [ ] Install APK
- [ ] Open app
- [ ] Login dengan user account

**Verify:**
- [ ] APK installed successfully
- [ ] App opens without crash
- [ ] Can login successfully

---

### Step 3: Test Notification ⏰ 5 min
- [ ] Login to https://onesignal.com/
- [ ] Go to Messages > New Push
- [ ] Select "Subscribed Users"
- [ ] Title: "Test dari OneSignal"
- [ ] Message: "Ini test notification"
- [ ] Send Message
- [ ] **CLOSE APP on device** (swipe close)
- [ ] **CHECK DEVICE** for notification

**Verify:**
- [ ] Notification appears in tray
- [ ] Notification works even when app CLOSED
- [ ] Tap notification opens app

---

## 🎯 Success Criteria:

### Console Logs (in app):
- [ ] `✅ OneSignal initialized successfully!`
- [ ] `✅ OneSignal External User ID set: <user-id>`
- [ ] `✅ OneSignal notification sent: <notification-id>`

### OneSignal Dashboard:
- [ ] "1+ Subscribed Users" shown
- [ ] Delivery Log shows successful send
- [ ] No errors in logs

### Device:
- [ ] Notification appears when app is OPEN
- [ ] Notification appears when app is BACKGROUND
- [ ] **Notification appears when app is CLOSED** ✨

---

## 🆘 Troubleshooting:

### Issue: "No subscribed users"
**Check:**
- [ ] App installed with latest code?
- [ ] User logged in?
- [ ] Console shows OneSignal initialized?

**Fix:**
- Rebuild APK
- Reinstall app
- Login again

---

### Issue: Notification not arriving
**Check:**
- [ ] REST API Key correct? (NOT `YOUR_REST_API_KEY_HERE`)
- [ ] Device notification settings enabled?
- [ ] OneSignal Dashboard shows delivery success?

**Fix:**
- Verify REST API Key
- Check device settings
- Try sending from dashboard again

---

### Issue: Build error
**Check:**
- [ ] `npm install` completed?
- [ ] Node modules installed?
- [ ] No syntax errors in modified files?

**Fix:**
```powershell
npm install
npm run build
npx cap sync android
```

---

## 📚 Documentation:

| File | When to Read |
|------|--------------|
| `MULAI-DARI-SINI-ONESIGNAL.md` | **START HERE** first |
| `ONESIGNAL-GET-API-KEY.md` | When doing Step 1 |
| `ONESIGNAL-FINAL-STEPS.md` | Full guide for all steps |
| `ONESIGNAL-CHANGES-SUMMARY.md` | What code changed |
| `CHECKLIST-ONESIGNAL.md` | This checklist |

---

## ⏰ Timeline:

| Step | Time | Task |
|------|------|------|
| 1 | 2 min | Get REST API Key |
| 2 | 10 min | Build APK |
| 3 | 5 min | Test notification |
| **TOTAL** | **17 min** | All done! |

---

## 🎉 Final Goal:

**Send notification to device even when app is CLOSED!**

This is the KEY improvement over FCM custom implementation!

---

**Ready? Start with Step 1 above! 🚀**

**Follow:** `MULAI-DARI-SINI-ONESIGNAL.md` for detailed instructions!
