// OneSignal Push Notifications - Works even when app is CLOSED! 🎉
import OneSignal from 'onesignal-cordova-plugin';
import { Capacitor } from '@capacitor/core';

const ONESIGNAL_APP_ID = '663c3ef2-4bf4-4073-ab3b-47fb918faec5';

/**
 * Initialize OneSignal
 */
export async function initializeOneSignal() {
  if (!Capacitor.isNativePlatform()) {
    console.log('OneSignal: Not on native platform, skipping');
    return false;
  }

  try {
    console.log('🔔 Initializing OneSignal...');

    // Set App ID
    OneSignal.setAppId(ONESIGNAL_APP_ID);

    // Request permission
    OneSignal.promptForPushNotificationsWithUserResponse((accepted) => {
      console.log('OneSignal permission:', accepted ? 'Granted ✅' : 'Denied ❌');
    });

    // Setup handlers
    setupOneSignalHandlers();

    console.log('✅ OneSignal initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ OneSignal initialization error:', error);
    return false;
  }
}

/**
 * Setup OneSignal event handlers
 */
function setupOneSignalHandlers() {
  // Handle notification opened (when user taps notification)
  OneSignal.setNotificationOpenedHandler((jsonData) => {
    console.log('📱 Notification opened:', jsonData);
    
    const data = jsonData.notification.additionalData;
    if (data) {
      console.log('Notification data:', data);
      // You can navigate based on data.type here
    }
  });

  // Handle notification received (when notification arrives)
  OneSignal.setNotificationWillShowInForegroundHandler((notificationReceivedEvent) => {
    console.log('📬 Notification received:', notificationReceivedEvent);
    
    // Display notification even when app is open
    notificationReceivedEvent.complete(notificationReceivedEvent.getNotification());
  });
}

/**
 * Set External User ID (map to your database user ID)
 * @param {string} userId - Your database user ID
 */
export async function setOneSignalExternalUserId(userId) {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    OneSignal.setExternalUserId(userId);
    console.log('✅ OneSignal External User ID set:', userId);
  } catch (error) {
    console.error('❌ Error setting External User ID:', error);
  }
}

/**
 * Remove External User ID (on logout)
 */
export async function removeOneSignalExternalUserId() {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    OneSignal.removeExternalUserId();
    console.log('✅ OneSignal External User ID removed');
  } catch (error) {
    console.error('❌ Error removing External User ID:', error);
  }
}

/**
 * Send tags (for user segmentation)
 * @param {object} tags - Key-value pairs
 */
export async function sendOneSignalTags(tags) {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    OneSignal.sendTags(tags);
    console.log('✅ OneSignal tags sent:', tags);
  } catch (error) {
    console.error('❌ Error sending tags:', error);
  }
}

/**
 * Get OneSignal Player ID (device identifier)
 * @returns {Promise<string|null>}
 */
export async function getOneSignalPlayerId() {
  if (!Capacitor.isNativePlatform()) return null;
  
  try {
    const deviceState = await OneSignal.getDeviceState();
    return deviceState?.userId || null;
  } catch (error) {
    console.error('❌ Error getting Player ID:', error);
    return null;
  }
}
