# Get Firebase Service Account Key (FCM v1 API)

## 🎯 Why We Need This

Firebase sekarang menggunakan FCM v1 API yang lebih secure. Kita butuh Service Account Key instead of Legacy Server Key.

---

## 📋 Steps to Get Service Account Key

### Step 1: Go to Firebase Console
```
URL: https://console.firebase.google.com
Select project: Arsip Digital
```

### Step 2: Project Settings
```
1. Click ⚙️ (Settings icon)
2. Click "Project settings"
3. Click "Service accounts" tab
```

### Step 3: Generate New Private Key
```
1. Scroll down to "Firebase Admin SDK"
2. Select language: Node.js (doesn't matter, just need the key)
3. Click "Generate new private key"
4. Click "Generate key" pada popup confirmation
5. File JSON akan ter-download (e.g., arsip-digital-xxxxx-firebase-adminsdk-xxxxx.json)
```

### Step 4: Open Downloaded File
```
1. Open downloaded JSON file dengan text editor
2. File will look like this:

{
  "type": "service_account",
  "project_id": "arsip-digital-xxxxx",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@arsip-digital-xxxxx.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Step 5: Minify JSON (Important!)
```
File harus di-minify (remove all line breaks and extra spaces)

Use online tool: https://www.webtoolkitonline.com/json-minifier.html

Or manually:
- Remove all newlines
- Remove extra spaces
- Keep it as single line

Result should look like:
{"type":"service_account","project_id":"arsip-digital-xxxxx",...}
```

---

## 🔐 Set as Supabase Secret

### Via Supabase CLI:
```bash
# Copy minified JSON content
# Then run:
supabase secrets set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"arsip-digital-26222","private_key_id":"532692cbafea0a350c0412db9d4570a3814abf9c","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDHaRNEz9R/Hl7f\nGVGOyZRnBMbrmLc9YmAK+g9L5ZUYz2eFD9WlFy/nKACOD/7J3ZKif2dVTjMQ1Fib\nX0qn3/f5pffrgbr1NR5FTIBFwdBvwfiq90DxWx0/2+pSahVv61GXKqcCThKHJcIX\nLkirrfPVkbgQMEBqYboUA0o5hTw+IRRBjzu4BK0HiAb6TmurzP6/eYBARv2LIoQs\nE2a+Kw8NPRh/oVfDs60YyvUMKYhMkpXUgm1so7YK7bJ4ORHIzZJo0c7NoxC/m6QL\nhzFoDPydajCBhU/ZiVjTMBrXjwPw5wJXdQL4HucWDUBuTL/fpZS6gddMtV3idOq/\nAQzjsfJpAgMBAAECggEACjYbQn7SBuBrQ0lsn7861jusZAwh9ga/nFBJ0D0lcWvN\nhUbWTenuDgxCWwP+rB+ojqGvjPLAMrBtCSfMDuStMh+Jnom6JSxfLHVKbEgMgGyS\na07WCIX97XM5gJbmGiEWwILyom+VC06nrcA1AHWb8ufPYSTXZ5sxiCzS9DcaaqP3\n2cffCLs2avC2pxQBXoncPo7k2c42z4zGwfO/5/SQFbOHOX8zkDDQscr1qyjyqdA7\nUtiiAZvei7KG3tZX81xywSQI6VehdLT1JgFtWQAlEXN6t9YkWOyNX5mb7n4wguQ7\ndMcaG1fgweBOLadoUjG9ZtEdCIAOYHcUItxrOq1vcQKBgQDqT6mw2xmdiPKHz+xs\nPxwWAkig4LbS1nPC1kMcgEfujlmWeqMisPBwHcuqhXTIZFw7peKEcyrmS0KF+Npx\nwvla4CwYRDFpTE1BUbj019mgd0ViGoZK8S+86MtR99MUf7hwPIMwReGX+BnykOT1\njgOOWqy9RN82VcxTBMq31kXjcwKBgQDZ3mPNVZON9Qnu23UvvtQXZCj8AG94ruqw\nWF5WKgSwCXHuQr+TZ0Dh2q4rPeL9VOvQpBnlJFn7aibb1ycvTTKk89auf6N7LngL\n2B8k4ipagGtG+pxzIQjhePb5r6rsnRAvKuvOPOuHIE9yorNPiVBIPSlT4Zzgal+f\nNSKlEGwzswKBgDtkXfr6To/j+rX6Ok9l39SkV4yP6UegHE+yx+gdjB4n7wV5qIhO\nmWOR6eIbWfLBna9w6O3x01n0kbQr1BMp/NLQJ90uy+eI87wu3tcRL5TBJtErMAcn\nA5a62263hsWXakTo0cgWrow60zjtCVxE1xnqWgbPwlSfgt84Q7o9khGJAoGBAMMZ\no8X9HGXDSWHcpNRczxEjYJBK04f/G6tPdysx9YCu9JeormYR0MhwTAftI5g4s/Pj\nAE1ygCHkrWexBCYXu4J72YPqSTvGITp6D2m4HrVsyqSFSBTRQGKpMIHoDehVvmh+\nxyuo4kHfbUX67RgMnxgRrTCwmQteNsMbkiq+yiaBAoGBANArnVpnxQmDb5KKm//2\nFCJPHd8FWFL8nrqPo7KXOR2ErqHqDxtOWDIc2ZEv9/ETtdFVNV9ieqgyCpVLaD9H\ntaGErkvS6BChCveMlMZi7DXtwNLWUitPUuWV1eL7gEb/7ttrgQLpF1GC6dYU5i3I\nbVTqgcUnfe8esY78+CuSiADg\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-fbsvc@arsip-digital-26222.iam.gserviceaccount.com","client_id":"111614676355531293554","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40arsip-digital-26222.iam.gserviceaccount.com","universe_domain":"googleapis.com"}'



# Note: Use single quotes around JSON!
```

### Via Supabase Dashboard (Easier):
```
1. Go to: https://app.supabase.com/project/axpanhequppcviaimwte/settings/vault
2. Click "Secrets" tab (or "Edge Function Secrets")
3. Click "New secret"
4. Name: FIREBASE_SERVICE_ACCOUNT
5. Value: (paste minified JSON)
6. Click "Save"
```

---

## ⚠️ Important Notes

### Security:
```
✅ This is a SERVICE ACCOUNT - very sensitive!
✅ Never commit to Git
✅ Never share publicly
✅ Store only in Supabase Secrets
✅ Can be rotated if compromised
```

### Format:
```
✅ Must be valid JSON
✅ Must be minified (single line)
✅ Must include ALL fields from downloaded file
✅ Quotes and escaping must be correct
```

### Common Errors:
```
❌ "JSON.parse error" → JSON not properly formatted/minified
❌ "Invalid private key" → private_key field corrupted
❌ "Project not found" → project_id doesn't match
```

---

## ✅ Verification

### Test Secret is Set:
```bash
# Via CLI
supabase secrets list

# Should show:
# FIREBASE_SERVICE_ACCOUNT
```

### Test in Edge Function:
```javascript
// Edge Function will log:
✅ "FIREBASE_SERVICE_ACCOUNT loaded"
✅ "Project ID: arsip-digital-xxxxx"
```

---

## 🔄 Alternative: Keep Using Legacy API

If you prefer to use Legacy API instead:

### Enable Legacy API:

1. **Firebase Console**
   ```
   Project Settings > Cloud Messaging > Cloud Messaging API (Legacy)
   ```

2. **Click "⋮" (3 dots) or "Manage"**
   ```
   Opens Google Cloud Console
   ```

3. **Enable API**
   ```
   Click "ENABLE" button
   Wait ~30 seconds
   ```

4. **Get Server Key**
   ```
   Back to Firebase Console
   Refresh page
   Copy "Server key" value
   ```

5. **Use Legacy Edge Function**
   ```
   Revert to old version (I can provide if needed)
   Set: FIREBASE_SERVER_KEY instead of FIREBASE_SERVICE_ACCOUNT
   ```

---

## 🎯 Which One to Choose?

### FCM v1 API (Service Account) - RECOMMENDED ✅
```
✅ Modern, supported long-term
✅ More secure (OAuth2)
✅ Better error handling
✅ Recommended by Firebase
⚠️ Slightly more complex setup
```

### Legacy API (Server Key) - DEPRECATED ⚠️
```
✅ Simpler setup
✅ One key instead of JSON file
⚠️ Being deprecated by Firebase
⚠️ Less secure
⚠️ May stop working in future
```

**Recommendation**: Use FCM v1 API (Service Account) for production!

---

## 📝 Quick Checklist

- [ ] Go to Firebase Console ✅
- [ ] Project Settings > Service accounts ✅
- [ ] Generate new private key ✅
- [ ] Download JSON file ✅
- [ ] Minify JSON (single line) ✅
- [ ] Set as Supabase secret: FIREBASE_SERVICE_ACCOUNT ✅
- [ ] Verify secret is set ✅
- [ ] Deploy Edge Function ✅
- [ ] Test notification ✅

---

## 💡 Pro Tip

Save the Service Account JSON file securely on your computer:
```
Location: ~/.firebase/arsip-digital-service-account.json
(Linux/Mac)

Or: C:\Users\YourName\.firebase\arsip-digital-service-account.json
(Windows)

✅ Keep backup
✅ Don't commit to Git
✅ Add to .gitignore
```

---

## 📞 Need Help?

### If JSON minify fails:
```javascript
// Use Node.js to minify:
const fs = require('fs');
const json = JSON.parse(fs.readFileSync('downloaded-file.json'));
console.log(JSON.stringify(json));
```

### If secret won't set:
```
- Check JSON is valid (use jsonlint.com)
- Remove any line breaks
- Escape quotes if needed
- Use single quotes around entire JSON in CLI
```

---

**Ready?** Download Service Account JSON and set as Supabase secret! 🚀
