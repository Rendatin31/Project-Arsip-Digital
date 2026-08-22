/**
 * Firebase Cloud Messaging (FCM) Utility Functions
 * Handles remote push notifications that work even when app is closed
 */

import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Capacitor } from '@capacitor/core';

/**
 * Initialize Firebase Cloud Messaging
 * Request permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if failed
 */
export async function initializeFCM() {
  // Only run on native platforms
  if (!Capacitor.isNativePlatform()) {
    console.log('🔥 FCM is only available on native platforms');
    return null;
  }

  try {
    console.log('🔥 Initializing Firebase Cloud Messaging...');

    // Check permission
    const permissionStatus = await FirebaseMessaging.checkPermissions();
    console.log('🔥 Current FCM permission status:', permissionStatus);

    let granted = permissionStatus.receive === 'granted';

    // Request permission if not granted
    if (!granted) {
      console.log('🔥 Requesting FCM permission...');
      const result = await FirebaseMessaging.requestPermissions();
      granted = result.receive === 'granted';
      console.log('🔥 FCM permission result:', result);
    }

    if (!granted) {
      console.log('❌ FCM permission denied');
      return null;
    }

    // Get FCM token
    console.log('🔥 Getting FCM token...');
    const { token } = await FirebaseMessaging.getToken();
    console.log('✅ FCM token obtained:', token.substring(0, 20) + '...');

    return token;
  } catch (error) {
    console.error('❌ Error initializing FCM:', error);
    return null;
  }
}

/**
 * Setup FCM message listeners
 * Listen for incoming FCM messages (foreground and background)
 * @param {Function} onMessageReceived - Callback when message received
 */
export async function setupFCMListeners(onMessageReceived) {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    console.log('🔥 Setting up FCM listeners...');

    // Listen for messages received (foreground)
    await FirebaseMessaging.addListener('notificationReceived', (notification) => {
      console.log('🔥 FCM notification received (foreground):', notification);
      if (onMessageReceived) {
        onMessageReceived(notification);
      }
    });

    // Listen for notification tapped (background/killed state)
    await FirebaseMessaging.addListener('notificationActionPerformed', (action) => {
      console.log('🔥 FCM notification action performed:', action);
      if (onMessageReceived) {
        onMessageReceived(action.notification);
      }
    });

    // Listen for token refresh
    await FirebaseMessaging.addListener('tokenReceived', (event) => {
      console.log('🔥 FCM token refreshed:', event.token.substring(0, 20) + '...');
      // TODO: Update token in database
    });

    console.log('✅ FCM listeners setup complete');
  } catch (error) {
    console.error('❌ Error setting up FCM listeners:', error);
  }
}

/**
 * Save FCM token to database
 * @param {object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {string} fcmToken - FCM token
 * @returns {Promise<boolean>} Success status
 */
export async function saveFCMToken(supabase, userId, fcmToken) {
  if (!fcmToken || !userId) {
    console.log('❌ Cannot save FCM token: missing userId or token');
    return false;
  }

  try {
    console.log('💾 Saving FCM token to database for user:', userId);

    const { error } = await supabase
      .from('profiles')
      .update({
        fcm_token: fcmToken,
        fcm_token_updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Error saving FCM token:', error);
      return false;
    }

    console.log('✅ FCM token saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving FCM token:', error);
    return false;
  }
}

/**
 * Remove FCM token from database (on logout)
 * @param {object} supabase - Supabase client
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function removeFCMToken(supabase, userId) {
  if (!userId) {
    return false;
  }

  try {
    console.log('🗑️ Removing FCM token from database for user:', userId);

    const { error } = await supabase
      .from('profiles')
      .update({
        fcm_token: null,
        fcm_token_updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Error removing FCM token:', error);
      return false;
    }

    console.log('✅ FCM token removed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error removing FCM token:', error);
    return false;
  }
}

/**
 * Subscribe to a topic (for broadcast messages)
 * @param {string} topic - Topic name
 * @returns {Promise<boolean>} Success status
 */
export async function subscribeToTopic(topic) {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    console.log('📢 Subscribing to FCM topic:', topic);
    await FirebaseMessaging.subscribeToTopic({ topic });
    console.log('✅ Subscribed to topic:', topic);
    return true;
  } catch (error) {
    console.error('❌ Error subscribing to topic:', error);
    return false;
  }
}

/**
 * Unsubscribe from a topic
 * @param {string} topic - Topic name
 * @returns {Promise<boolean>} Success status
 */
export async function unsubscribeFromTopic(topic) {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    console.log('📢 Unsubscribing from FCM topic:', topic);
    await FirebaseMessaging.unsubscribeFromTopic({ topic });
    console.log('✅ Unsubscribed from topic:', topic);
    return true;
  } catch (error) {
    console.error('❌ Error unsubscribing from topic:', error);
    return false;
  }
}

/**
 * Delete FCM token (complete cleanup)
 * @returns {Promise<boolean>} Success status
 */
export async function deleteFCMToken() {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    console.log('🗑️ Deleting FCM token...');
    await FirebaseMessaging.deleteToken();
    console.log('✅ FCM token deleted');
    return true;
  } catch (error) {
    console.error('❌ Error deleting FCM token:', error);
    return false;
  }
}

/**
 * Get delivery metrics (Android only)
 * @returns {Promise<object|null>} Delivery metrics or null
 */
export async function getDeliveryMetrics() {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
    return null;
  }

  try {
    const metrics = await FirebaseMessaging.getDeliveredNotifications();
    console.log('📊 FCM delivery metrics:', metrics);
    return metrics;
  } catch (error) {
    console.error('❌ Error getting delivery metrics:', error);
    return null;
  }
}
