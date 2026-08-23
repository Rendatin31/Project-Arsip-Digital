# Deploy FCM Edge Function to Supabase

## 🎯 Goal
Deploy Supabase Edge Function yang akan mengirim FCM notifications ke device users.

---

## 📋 Prerequisites

### 1. Install Supabase CLI
```bash
# Install via npm
npm install -g supabase

# Verify installation
supabase --version
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link to Your Project
```bash
# Get your project reference from Supabase Dashboard
# URL format: https://app.supabase.com/project/YOUR_PROJECT_REF

supabase link --project-ref axpanhequppcviaimwte

```

---

## 🔑 Step 1: Get Firebase Server Key

### 1.1 Go to Firebase Console
```
URL: https://console.firebase.google.com
Select your project: Arsip Digital
```

### 1.2 Get Server Key
```
1. Click ⚙️ (Settings) > Project settings
2. Click "Cloud Messaging" tab
3. Under "Cloud Messaging API (Legacy)"
4. Copy "Server key"

Example format:
AAAAxxxxxx:APA91bFxxxxxxxxxxxxxxxxxxxxxx
```

### 1.3 Save Server Key
```
Keep this key safe! Will be used in next step.
```

---

## 🚀 Step 2: Deploy Edge Function

### 2.1 Set Environment Secret
```bash
# Set Firebase Server Key as secret
supabase secrets set FIREBASE_SERVER_KEY=YOUR_FIREBASE_SERVER_KEY

# Replace YOUR_FIREBASE_SERVER_KEY with actual key from Step 1.2
```

### 2.2 Deploy Function
```bash
# Deploy send-fcm-notification function
supabase functions deploy send-fcm-notification

# Wait for deployment to complete
```

### 2.3 Verify Deployment
```bash
# List deployed functions
supabase functions list

# Should show:
# - send-fcm-notification (deployed)
```

---

## ✅ Step 3: Test Edge Function

### 3.1 Test via Supabase Dashboard
```
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "Edge Functions"
4. Click "send-fcm-notification"
5. Click "Invoke function"
6. Test payload:

{
  "userId": "YOUR_USER_ID",
  "title": "Test Notification",
  "message": "This is a test FCM notification",
  "type": "test"
}

7. Click "Send"
8. Check response (should see success: true)
```

### 3.2 Test via Code
```javascript
// In your app code (already implemented)
const { data, error } = await supabase.functions.invoke('send-fcm-notification', {
  body: {
    userId: 'user-id',
    title: 'Test',
    message: 'Test message',
    type: 'test'
  }
});

console.log('FCM result:', data);
```

---

## 🔧 Step 4: Verify Integration

### 4.1 Upload Document Test
```
1. User A: Upload document on desktop browser
2. Check console logs:
   ✅ "Notification created in database"
   ✅ "📤 Sending FCM notification via Edge Function..."
   ✅ "✅ FCM notification sent via Edge Function"

3. User B device: Should receive push notification
   (EVEN IF APP IS CLOSED!)
```

### 4.2 Check Edge Function Logs
```bash
# View function logs
supabase functions logs send-fcm-notification

# Or in Supabase Dashboard:
# Edge Functions > send-fcm-notification > Logs
```

---

## 📊 How It Works

### Complete Flow:

```
User A uploads document (Desktop/Mobile)
    ↓
System creates notification in database
    ↓
System calls Edge Function:
  supabase.functions.invoke('send-fcm-notification', {...})
    ↓
Edge Function:
  1. Gets User B's FCM token from database
  2. Sends FCM message via Firebase API
  3. Returns success/error
    ↓
Firebase Cloud Messaging:
  Delivers push notification to User B's device
    ↓
User B receives notification:
  ✅ Status bar shows notification
  ✅ Sound plays
  ✅ Device vibrates
  ✅ Works EVEN IF app is closed!
```

---

## 🐛 Troubleshooting

### Issue 1: "FIREBASE_SERVER_KEY not configured"
```
Solution:
1. Verify secret is set:
   supabase secrets list

2. Should show: FIREBASE_SERVER_KEY

3. If not, set again:
   supabase secrets set FIREBASE_SERVER_KEY=YOUR_KEY
```

### Issue 2: "No FCM token found for user"
```
Reason: User hasn't logged in on mobile device yet

Solution:
1. Install latest APK on device
2. Login with that user
3. Check database: profiles table should have fcm_token
4. Try sending notification again
```

### Issue 3: "FCM API error: InvalidRegistration"
```
Reason: FCM token is invalid or expired

Solution:
1. User logs out and logs in again on mobile
2. New FCM token will be generated
3. Edge Function automatically removes invalid tokens
```

### Issue 4: "Function deployment failed"
```
Solution:
1. Check Supabase CLI is latest version:
   npm update -g supabase

2. Check you're logged in:
   supabase login

3. Check project is linked:
   supabase projects list

4. Try deploy again:
   supabase functions deploy send-fcm-notification
```

---

## 🔒 Security Notes

### Environment Secrets:
```
✅ FIREBASE_SERVER_KEY stored as Supabase secret (encrypted)
✅ Not exposed in client code
✅ Only accessible by Edge Function
✅ Rotatable via Supabase Dashboard
```

### Edge Function Security:
```
✅ CORS configured for your domain
✅ Validates user ID exists in database
✅ Checks FCM token validity
✅ Automatically removes invalid tokens
✅ Rate limited by Supabase (prevent abuse)
```

---

## 💰 Cost & Limits

### Firebase FCM:
```
Messages: Unlimited ♾️
Cost: $0 (Free forever)
Rate limit: No hard limit
```

### Supabase Edge Functions:
```
Free tier: 500,000 invocations/month
Paid tier: $10/month for 2M invocations
Edge Function timeout: 150 seconds
```

### Expected Usage:
```
Notifications per day: ~100-1000
Invocations per month: ~3,000-30,000
Cost: $0 (well within free tier)
```

---

## 📝 Configuration Checklist

Before going to production:

### Firebase:
- [ ] Firebase project created ✅
- [ ] Android app registered ✅
- [ ] google-services.json in place ✅
- [ ] FCM Server Key obtained ✅

### Supabase:
- [ ] Supabase CLI installed ⏳
- [ ] Logged in to Supabase ⏳
- [ ] Project linked ⏳
- [ ] FIREBASE_SERVER_KEY secret set ⏳
- [ ] Edge Function deployed ⏳

### Database:
- [ ] fcm_token column added ⏳
- [ ] Migration executed ⏳

### Testing:
- [ ] Edge Function tested via Dashboard ⏳
- [ ] FCM notification received on device ⏳
- [ ] Closed-app notification works ⏳

---

## 🎉 Success Criteria

### You'll know it's working when:

1. **Console Logs (Desktop):**
   ```
   ✅ Notification created in database
   ✅ FCM notification sent via Edge Function
   ```

2. **Edge Function Logs:**
   ```
   🔥 FCM Edge Function called
   🔍 Getting FCM token for user: xxx
   ✅ FCM token found: dK3hZ2X8Qw2...
   📤 Sending FCM message to Firebase...
   ✅ FCM notification sent successfully!
   ```

3. **User Device:**
   ```
   📱 Push notification appears in status bar
   🔊 Sound plays
   📳 Device vibrates
   ✅ Even when app is CLOSED!
   ```

---

## 🚀 Alternative: Manual Deployment

If Supabase CLI doesn't work, use Dashboard:

### Via Supabase Dashboard:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "Edge Functions"
4. Click "Create a new function"
5. Name: send-fcm-notification
6. Copy code from: supabase/functions/send-fcm-notification/index.ts
7. Paste into editor
8. Click "Deploy"
9. Go to "Secrets" tab
10. Add secret: FIREBASE_SERVER_KEY = YOUR_KEY
11. Save

---

## 📞 Need Help?

### Resources:
- Supabase CLI Docs: https://supabase.com/docs/guides/cli
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Firebase FCM Docs: https://firebase.google.com/docs/cloud-messaging

### Common Commands:
```bash
# Check CLI version
supabase --version

# Login
supabase login

# Link project
supabase link --project-ref YOUR_REF

# Set secret
supabase secrets set KEY=value

# Deploy function
supabase functions deploy FUNCTION_NAME

# View logs
supabase functions logs FUNCTION_NAME

# List functions
supabase functions list

# List secrets
supabase secrets list
```

---

**Ready to Deploy?** Follow the steps above in order! 🚀

Once deployed, come back and say: **"Edge Function deployed successfully"**
