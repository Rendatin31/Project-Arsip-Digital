import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rendatin.arsip',
  appName: 'Arsip Digital',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    FirebaseMessaging: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    OneSignal: {
      appId: '663c3ef2-4bf4-4073-ab3b-47fb918faec5',
      googleProjectNumber: '452692426520'
    },
    App: {
      // Tombol back akan minimize app, bukan close
      // User harus swipe close dari recent apps untuk benar-benar close
      loopback: true
    }
  },
  android: {
    // Allow clear text traffic untuk development
    allowMixedContent: true
  }
};

export default config;
