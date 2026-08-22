import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * Initialize push notifications
 * Request permission and setup notification channel
 */
export async function initializePushNotifications() {
  // Only run on native platforms (not web)
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications are only available on native platforms');
    return false;
  }

  try {
    console.log('🔔 Checking current notification permission...');
    
    // First check current permission status
    const currentPermission = await LocalNotifications.checkPermissions();
    console.log('Current permission status:', currentPermission);
    
    let permissionStatus = currentPermission.display;
    
    // If permission is not granted, request it
    if (permissionStatus !== 'granted') {
      console.log('🔔 Requesting notification permission...');
      const permissionResult = await LocalNotifications.requestPermissions();
      console.log('Permission request result:', permissionResult);
      permissionStatus = permissionResult.display;
    }
    
    if (permissionStatus === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Create notification channel (Android only)
      if (Capacitor.getPlatform() === 'android') {
        console.log('📱 Creating notification channel for Android...');
        
        // Delete old channel if exists (to ensure fresh setup)
        try {
          await LocalNotifications.deleteChannel({ id: 'arsip_digital' });
        } catch (e) {
          // Ignore error if channel doesn't exist
        }
        
        // Create new channel
        await LocalNotifications.createChannel({
          id: 'arsip_digital',
          name: 'Arsip Digital',
          description: 'Notifikasi untuk dokumen dan aktivitas arsip',
          importance: 5, // Max importance for heads-up notifications
          visibility: 1, // Public
          sound: 'default',
          vibration: true,
          lights: true,
          lightColor: '#0ea5e9',
        });
        console.log('✅ Notification channel created: arsip_digital');
        
        // List all channels to verify
        const channels = await LocalNotifications.listChannels();
        console.log('📋 All notification channels:', channels);
      }
      
      return true;
    } else {
      console.log('❌ Notification permission denied or not determined');
      console.log('Permission status:', permissionStatus);
      return false;
    }
  } catch (error) {
    console.error('❌ Error initializing push notifications:', error);
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export async function checkNotificationPermission() {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
}

/**
 * Send a local push notification to device
 * @param {Object} notification - Notification object from database
 */
export async function sendPushNotification(notification) {
  if (!Capacitor.isNativePlatform()) {
    console.log('Skipping push notification on web platform');
    return;
  }

  try {
    // Check permission first
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      console.log('No notification permission, skipping push');
      return;
    }

    // Get icon based on notification type
    const iconName = getNotificationIcon(notification.type);
    
    // Schedule notification
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notification.id, // Use database notification ID
          title: notification.title,
          body: notification.message,
          largeBody: notification.message,
          summaryText: 'Arsip Digital',
          smallIcon: 'ic_notification', // Custom icon (optional)
          iconColor: '#0ea5e9', // Blue color
          channelId: 'arsip_digital',
          sound: 'default',
          extra: {
            notificationId: notification.id,
            type: notification.type,
          },
        },
      ],
    });

    console.log('✅ Push notification sent:', notification.title);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

/**
 * Get icon name based on notification type
 */
function getNotificationIcon(type) {
  const icons = {
    upload: 'upload_file',
    security: 'warning',
    share: 'share',
    system: 'update',
    approval: 'task_alt',
    delete: 'delete',
    edit: 'edit',
    access: 'admin_panel_settings',
  };
  return icons[type] || 'notifications';
}

/**
 * Handle notification tap/click
 * Setup listener for when user taps notification
 */
export async function setupNotificationListeners(onNotificationTap) {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Listen for notification action (tap)
    await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Notification tapped:', notification);
      
      const notificationId = notification.notification.extra?.notificationId;
      const notificationType = notification.notification.extra?.type;
      
      // Call callback with notification data
      if (onNotificationTap) {
        onNotificationTap({
          id: notificationId,
          type: notificationType,
        });
      }
    });

    console.log('✅ Notification listeners setup');
  } catch (error) {
    console.error('Error setting up notification listeners:', error);
  }
}

/**
 * Cancel all pending notifications
 */
export async function cancelAllNotifications() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await LocalNotifications.cancel({ notifications: [] });
    console.log('✅ All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
}

/**
 * Get pending notifications
 */
export async function getPendingNotifications() {
  if (!Capacitor.isNativePlatform()) {
    return [];
  }

  try {
    const result = await LocalNotifications.getPending();
    return result.notifications || [];
  } catch (error) {
    console.error('Error getting pending notifications:', error);
    return [];
  }
}
