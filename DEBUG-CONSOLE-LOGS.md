# Debug Console Logs Guide

Panduan untuk membaca console logs saat testing push notifications dan back button.

---

## 📱 Cara Melihat Console Logs di Android

### Method 1: Chrome DevTools (Recommended)
1. Connect device ke computer via USB
2. Enable USB debugging di device
3. Buka Chrome di computer
4. Navigate ke: `chrome://inspect#devices`
5. Cari "Arsip Digital" di list
6. Click "inspect"
7. Buka tab "Console"

### Method 2: Android Studio Logcat
1. Open Android Studio
2. Bottom toolbar > Logcat
3. Filter by package: `com.rendatin.arsip`
4. Search for console logs

### Method 3: Command Line (ADB)
```bash
adb logcat | grep -i "chromium"
```

---

## 🔔 Push Notification Logs

### On App Start (Normal Flow):
```
🔔 Initializing push notifications...
✅ Notification permission granted
✅ Notification channel created
✅ Push notifications initialized successfully
✅ Notification listeners setup
```

### If Permission Denied:
```
🔔 Initializing push notifications...
❌ Notification permission denied
❌ Push notifications initialization failed
```

### If Not on Native Platform (Web):
```
Push notifications are only available on native platforms
```

### When Notification is Sent:
```
✅ Push notification sent: [Title]
```

### When Notification is Tapped:
```
Notification tapped: [notification data]
📱 Notification tapped: { id: 123, type: 'upload' }
```

---

## 🔙 Back Button Logs

### On Setup:
```
📱 Setting up Android back button handler...
```

### When Back Button Pressed - Modal Open:
```
🔙 Back button pressed, canGoBack: false
Modal open, closing modal
```

### When Back Button Pressed - Not on Dashboard:
```
🔙 Back button pressed, canGoBack: false
Not on dashboard, navigating to dashboard
```

### When Back Button Pressed - On Dashboard:
```
🔙 Back button pressed, canGoBack: false
On dashboard, minimizing app
```

### When Back Button Pressed - On Login:
```
🔙 Back button pressed, canGoBack: false
On auth page, allowing default back
```

### On Cleanup:
```
🧹 Cleaning up back button listener
```

---

## 🐛 Error Logs to Watch For

### Push Notification Errors:
```
Error initializing push notifications: [error message]
Error checking notification permission: [error message]
Error sending push notification: [error message]
Error setting up notification listeners: [error message]
```

### Back Button Errors:
No specific error messages implemented, but watch for:
- App crashes on back button press
- Multiple back button listeners active
- Memory leaks from listeners

---

## ✅ Good Log Examples

### Complete Successful Flow (App Start):
```
🔔 Initializing push notifications...
✅ Notification permission granted
✅ Notification channel created
✅ Push notifications initialized successfully
✅ Notification listeners setup
📱 Setting up Android back button handler...
```

### Back Button Navigation Flow:
```
=== CURRENT PAGE CHANGED ===
New page: documents
🔙 Back button pressed, canGoBack: false
Not on dashboard, navigating to dashboard
=== CURRENT PAGE CHANGED ===
New page: dashboard
```

### Modal Close Flow:
```
🔙 Back button pressed, canGoBack: false
Modal open, closing modal
```

### Minimize App Flow:
```
🔙 Back button pressed, canGoBack: false
On dashboard, minimizing app
```

---

## 🔍 Debugging Tips

### If Notifications Not Working:
1. Check logs for permission status
2. Verify platform: `Capacitor.isNativePlatform()` must be true
3. Check Android version >= 8.0 (API 26)
4. Verify channel was created (Android only)
5. Check device notification settings

### If Back Button Not Working:
1. Check logs for listener setup
2. Verify platform is Android
3. Check currentPage value
4. Verify modal states (showAddModal, editDoc, previewFile)
5. Check for multiple listeners (memory leak)

### Common Issues:

**"Listener not setup"**
- Platform might be web (not native)
- Check: `Capacitor.getPlatform() === 'android'`

**"Back button closes app immediately"**
- Listener not attached
- Check useEffect dependencies
- Verify cleanup function

**"Notifications don't show"**
- Permission denied
- Channel not created (Android)
- Device notification settings off

**"App crashes on back button"**
- Check for circular dependencies in useEffect
- Verify all state variables exist
- Check console for error stack trace

---

## 📊 Log Priority Levels

### 🟢 Success (Green)
- `✅` - Operation successful
- Normal flow, expected behavior

### 🔵 Info (Blue)  
- `📱` - Device/platform info
- `🔔` - Notification info
- `🔙` - Back button info

### 🟡 Warning (Yellow)
- `⚠️` - Non-critical issues
- Permission pending

### 🔴 Error (Red)
- `❌` - Operation failed
- Critical errors

### 🧹 Cleanup
- `🧹` - Listener cleanup
- Resource cleanup

---

## 🎯 Testing Scenarios & Expected Logs

### Scenario 1: First App Launch
```
🔔 Initializing push notifications...
[User sees permission dialog]
[User clicks "Allow"]
✅ Notification permission granted
✅ Notification channel created
✅ Push notifications initialized successfully
✅ Notification listeners setup
📱 Setting up Android back button handler...
```

### Scenario 2: Navigate and Go Back
```
=== CURRENT PAGE CHANGED ===
New page: categories
[User presses back button]
🔙 Back button pressed, canGoBack: false
Not on dashboard, navigating to dashboard
=== CURRENT PAGE CHANGED ===
New page: dashboard
```

### Scenario 3: Open Modal and Close
```
[User clicks + button]
[User presses back button]
🔙 Back button pressed, canGoBack: false
Modal open, closing modal
```

### Scenario 4: Minimize App
```
[User is on dashboard]
[User presses back button]
🔙 Back button pressed, canGoBack: false
On dashboard, minimizing app
[App goes to background]
```

---

## 📝 Debug Checklist

When debugging issues, check these logs in order:

- [ ] Platform check: `Capacitor.isNativePlatform()` = true
- [ ] Platform type: `Capacitor.getPlatform()` = 'android'
- [ ] Notification init: `🔔 Initializing push notifications...`
- [ ] Permission status: `✅ Notification permission granted`
- [ ] Channel created: `✅ Notification channel created`
- [ ] Listener setup: `✅ Notification listeners setup`
- [ ] Back button setup: `📱 Setting up Android back button handler...`
- [ ] No error logs: No `❌` or error messages

---

## 🚀 Production Ready Indicators

App is ready for production when you see:

```
✅ All logs show success messages
✅ No error logs (❌) in console
✅ Back button behaves as expected
✅ Notifications appear in notification bar
✅ Notification tap opens app
✅ App minimizes on dashboard back press
✅ Modals close with back button
✅ No memory leaks or crashes
```

---

## 💡 Pro Tips

1. **Always test on physical device** - Emulator might not show all logs
2. **Clear app data** between tests - Ensures fresh permission flow
3. **Check Logcat filter** - Make sure package name is correct
4. **Use Chrome inspect** - Best developer experience
5. **Screenshot logs** - Keep evidence of successful tests
6. **Test edge cases** - Spam back button, rapid taps, etc.
7. **Monitor memory** - Watch for listener leaks
8. **Test after restart** - Verify persistence

---

## 📞 Support

If you see unexpected logs or errors:
1. Copy complete console output
2. Note the steps to reproduce
3. Include device info (model, Android version)
4. Check GitHub issues for similar problems
5. Contact developer with logs

**Happy Testing! 🎉**
