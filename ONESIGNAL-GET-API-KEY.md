# 🔑 Get OneSignal REST API Key

## Step 1: Login to OneSignal

Go to: https://onesignal.com/

Login dengan account yang sudah dibuat.

---

## Step 2: Select Your App

1. **Click:** "arsip digital App" (from dashboard)

---

## Step 3: Get REST API Key

1. **Click:** **Settings** (icon ⚙️ di sidebar kiri)
2. **Click:** **Keys & IDs** tab
3. **Find:** "REST API Key"
4. **Click:** Eye icon (👁️) to reveal key
5. **Copy:** The long key (something like: `MWYxNjdmYWMtNDZiZC0xMWVmLWFkY2QtMDI0MmFjMTIwMDA0`)

---

## Step 4: Paste to Code

**File:** `src/utils/notifications.js`

**Line 8:**
```javascript
const ONESIGNAL_REST_API_KEY = 'YOUR_REST_API_KEY_HERE';  // TODO: Get from OneSignal Dashboard > Settings > Keys & IDs
```

**Replace dengan:**
```javascript
const ONESIGNAL_REST_API_KEY = 'MWYxNjdmYWMtNDZiZC0xMWVmLWFkY2QtMDI0MmFjMTIwMDA0';  // Your actual key
```

---

## ⚠️ Important Notes

1. **REST API Key** ≠ OneSignal App ID
2. Copy dari **Settings > Keys & IDs** ONLY
3. Jangan share key ini publicly
4. Key ini bisa di-regenerate jika bocor

---

## ✅ Verification

After pasting key, check:
- [ ] Key tidak ada "YOUR_REST_API_KEY_HERE"
- [ ] Key panjang (40+ characters)
- [ ] Code tidak error saat build

---

**Next: Build APK dan test notification!**
