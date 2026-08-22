# Debug: FCM Notifications Tidak Masuk

## 🔍 Checklist Debugging

### ✅ Yang Sudah Benar:
- Edge Function deployed ✅
- Service Account secret set ✅
- Database columns (fcm_token) created ✅
- Satu user punya FCM token ✅

### ❓ Yang Perlu Di-Check:

---

## Step 1: Check Desktop Console Logs

Ketika upload document dari desktop browser:

### Open Console:
```
1. Buka Chrome DevTools (F12)
2. Tab "Console"
3. Upload document
4. Lihat logs
```

### Expected Logs (SUCCESS):
```
Uploading document...
✅ Document uploaded successfully
Notifying other users...
✅ Notification created in database
📤 Sending FCM notification via Edge Function...
✅ FCM notification sent via Edge Function
```

### Or Error Logs:
```
❌ FCM Edge Function error: [error message]
❌ Error calling FCM Edge Function: [error message]
```

**Screenshot atau copy error message jika ada!**

---

## Step 2: Check Edge Function Logs

### Via Supabase Dashboard:

1. **Go to:**
   ```
   https://app.supabase.com/project/axpanhequppcviaimwte/functions
   ```

2. **Click:** `send-fcm-notification`

3. **Click:** "Logs" or "Invocations" tab

4. **Look for recent invocations**

### Expected Logs (SUCCESS):
```
🔥 FCM Edge Function called
📦 Payload: { userId, title, message, type }
🔍 Getting FCM token for user: xxx
✅ FCM token found: eNF70Hk6TZ...
🔐 Getting OAuth2 access token...
✅ Access token obtained
📤 Sending FCM v1 message to Firebase...
📥 FCM Response: { name: "projects/..." }
✅ FCM notification sent successfully!
```

### Or Error Logs:
```
❌ Error getting profile: [error]
❌ No FCM token found for user
❌ FCM API error: [error]
❌ Error in FCM Edge Function: [error]
```

---

## Step 3: Check Which User Has Token

### In Supabase Dashboard:

1. Go to: Table Editor > profiles
2. Find the user yang punya `fcm_token` (tidak NULL)
3. Copy user ID tersebut

### Questions:
- Apakah user yang login di device adalah user yang punya token?
- Apakah user lain (yang upload) men-trigger notifikasi ke user yang benar?

---

## Step 4: Test Specific Scenario

### Scenario A: Same User Test
```
1. Device: Login dengan user yang PUNYA fcm_token
   (User dengan token: eNF70Hk6TZWzYtVHhAmMH_...)
2. Desktop: Login dengan user BERBEDA
3. Desktop: Upload document
4. Check: Apakah device menerima notifikasi?
```

### Scenario B: Check APK Version
```
1. Apakah APK yang di-install sudah yang TERBARU?
2. Build date APK harus setelah FCM code integration
3. Coba uninstall dan install ulang APK terbaru
```

---

## Step 5: Manual Test Edge Function

### Test via Supabase Dashboard:

1. **Go to:**
   ```
   https://app.supabase.com/project/axpanhequppcviaimwte/functions
   ```

2. **Click:** `send-fcm-notification`

3. **Click:** "Invoke function" atau "Test"

4. **Payload (use actual user ID yang punya token):**
   ```json
   {
     "userId": "PASTE_USER_ID_YANG_PUNYA_TOKEN",
     "title": "Test Manual",
     "message": "Test notification from dashboard",
     "type": "test"
   }
   ```

5. **Click:** "Send" atau "Invoke"

6. **Check:**
   - Response: Should be `{ "success": true, ... }`
   - Device: Should receive notification!

---

## 🐛 Common Issues

### Issue 1: "No FCM token found for user"

**Cause:** User belum login di device atau FCM token tidak tersimpan

**Solution:**
```
1. Uninstall app completely from device
2. Install APK terbaru
3. Login
4. Check Chrome DevTools (chrome://inspect):
   - Should see: "✅ FCM token obtained, saving to database..."
   - Should see: "✅ FCM token saved successfully"
5. Check database: fcm_token should be filled
```

### Issue 2: "FCM API error: 404 Not Found"

**Cause:** Project ID tidak match atau Firebase project issue

**Solution:**
```
1. Check Service Account JSON:
   - "project_id": "arsip-digital-26222"
2. Check Firebase Console:
   - Project name harus match
3. Re-download Service Account dan set secret lagi
```

### Issue 3: "Error calling FCM Edge Function"

**Cause:** Edge Function belum di-invoke atau error di code

**Solution:**
```
1. Check Edge Function logs di Dashboard
2. Look for error message
3. Check Service Account secret is set correctly
4. Try manual test from Dashboard
```

### Issue 4: Notification Tidak Muncul (No Error)

**Cause:** Device notification permission atau FCM delivery issue

**Check:**
```
1. Device Settings > Apps > Arsip Digital > Notifications
   - Should be ON
2. Device not in Do Not Disturb mode
3. Device has internet connection
4. FCM token is valid (not expired)
```

---

## 📱 Device-Specific Checks

### Android Device Settings:

1. **Notification Permission:**
   ```
   Settings > Apps > Arsip Digital > Permissions > Notifications
   Should be: Allowed
   ```

2. **Notification Channels:**
   ```
   Settings > Apps > Arsip Digital > Notifications
   Should see: "Arsip Digital" channel
   Status: Enabled
   ```

3. **Battery Optimization:**
   ```
   Settings > Apps > Arsip Digital > Battery
   Set to: Unrestricted
   (Or disable battery optimization for this app)
   ```

4. **Background Data:**
   ```
   Settings > Apps > Arsip Digital > Mobile data & Wi-Fi
   Background data: Enabled
   ```

---

## 🔧 Quick Fixes to Try

### Fix 1: Reinstall App with Fresh Token
```bash
1. Uninstall app dari device
2. Rebuild APK terbaru:
   npm run build
   npx cap sync android
   npx cap open android
   # Build APK
3. Install fresh APK
4. Login
5. Check database untuk fcm_token baru
```

### Fix 2: Test with Real-Time Notification First
```
1. Device: Keep app OPEN (not closed)
2. Desktop: Upload document
3. Check: Real-time notification should work
   (Bell icon in app should update)
4. If real-time works, FCM should work too
```

### Fix 3: Enable All Logs
```javascript
// In console, run this to see all logs:
localStorage.setItem('debug', 'true');
// Then refresh page and try again
```

---

## 📊 Debugging Checklist

Work through this in order:

- [ ] Desktop console shows: "FCM notification sent via Edge Function" ✅
- [ ] Edge Function logs show: "FCM notification sent successfully!" ✅
- [ ] User yang login di device PUNYA fcm_token di database ✅
- [ ] fcm_token di database tidak NULL ✅
- [ ] Manual test dari Dashboard berhasil ✅
- [ ] Device notification permission enabled ✅
- [ ] Device not in DND mode ✅
- [ ] APK versi terbaru (build setelah FCM code) ✅

---

## 💡 Quick Test

**Fastest way to verify FCM works:**

```
1. Supabase Dashboard > Edge Functions > send-fcm-notification
2. Click "Invoke"
3. Payload:
   {
     "userId": "[USER_ID_YANG_PUNYA_TOKEN]",
     "title": "Quick Test",
     "message": "Testing FCM",
     "type": "test"
   }
4. Click Send
5. Check device immediately

If notification appears: FCM works! ✅
If not: Check device settings & token validity
```

---

## 📞 What to Report Back

Please check and report:

1. **Desktop Console Logs:**
   - Copy paste any error messages
   - Or confirm: "✅ FCM notification sent via Edge Function"

2. **Edge Function Logs:**
   - Go to Dashboard and check recent invocations
   - Screenshot or copy error messages

3. **Database:**
   - Which user ID has fcm_token?
   - Is that the user logged in on device?

4. **Device:**
   - Notification permission status?
   - App version (when was APK built)?

5. **Manual Test Result:**
   - Did manual invoke from Dashboard work?

---

**Let me know what you find!** 🔍
