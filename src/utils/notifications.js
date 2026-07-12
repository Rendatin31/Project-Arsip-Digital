/**
 * Notification Utility Functions
 * Fungsi helper untuk membuat notifikasi sistem
 */

/**
 * Check if user has notification preference enabled
 * @param {object} supabase - Supabase client instance
 * @param {string} userId - User ID to check
 * @param {string} notificationType - Type of notification (upload, edit, delete, security, system)
 * @returns {Promise<boolean>} True if notification is enabled, false otherwise
 */
async function checkNotificationPreference(supabase, userId, notificationType) {
  try {
    console.log(`Checking notification preference for user ${userId}, type: ${notificationType}`);
    
    // Use RPC function to bypass RLS
    const { data, error } = await supabase.rpc('get_notification_preference', {
      target_user_id: userId,
      preference_type: notificationType,
    });

    if (error) {
      console.error(`Error checking preference for user ${userId}:`, error);
      // On error, default to enabled to avoid blocking notifications
      return true;
    }

    const isEnabled = data === true; // data is boolean from function
    console.log(`User ${userId} preference for ${notificationType}: ${isEnabled}`);
    
    return isEnabled;
  } catch (err) {
    console.error('Error checking notification preference:', err);
    // On error, default to enabled to avoid blocking notifications
    return true;
  }
}

/**
 * Create a notification for a user
 * @param {object} supabase - Supabase client instance
 * @param {string} userId - Target user ID
 * @param {string} type - Notification type (upload, security, share, system, approval, delete, edit, access)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {Promise<object>} Created notification or error
 */
export async function createNotification(supabase, userId, type, title, message) {
  try {
    // Check if user has this notification type enabled
    const isEnabled = await checkNotificationPreference(supabase, userId, type);
    
    if (!isEnabled) {
      console.log(`Notification skipped for user ${userId}: ${type} notification is disabled`);
      return { data: null, skipped: true };
    }

    // Use database function to create notification (bypasses RLS)
    const { data, error } = await supabase.rpc('create_notification', {
      target_user_id: userId,
      notif_type: type,
      notif_title: title,
      notif_message: message,
    });

    if (error) {
      console.error('Error creating notification:', error);
      return { error };
    }

    console.log('Notification created:', data);
    return { data };
  } catch (err) {
    console.error('Failed to create notification:', err);
    return { error: err };
  }
}

/**
 * Notify user when a document is uploaded
 */
export async function notifyDocumentUpload(supabase, userId, uploaderName, fileName) {
  return createNotification(
    supabase,
    userId,
    'upload',
    'Dokumen Baru Diunggah',
    `${uploaderName} mengunggah "${fileName}"`
  );
}

/**
 * Notify user about security alert
 */
export async function notifySecurityAlert(supabase, userId, alertMessage) {
  return createNotification(
    supabase,
    userId,
    'security',
    'Peringatan Keamanan',
    alertMessage
  );
}

/**
 * Notify user when a document is shared
 */
export async function notifyDocumentShare(supabase, userId, sharerName, itemName) {
  return createNotification(
    supabase,
    userId,
    'share',
    'Dokumen Dibagikan',
    `${sharerName} membagikan "${itemName}" dengan Anda`
  );
}

/**
 * Notify user about system update
 */
export async function notifySystemUpdate(supabase, userId, updateMessage) {
  return createNotification(
    supabase,
    userId,
    'system',
    'Update Sistem',
    updateMessage
  );
}

/**
 * Notify user when document is approved
 */
export async function notifyDocumentApproval(supabase, userId, documentName) {
  return createNotification(
    supabase,
    userId,
    'approval',
    'Dokumen Disetujui',
    `Permohonan akses untuk "${documentName}" telah disetujui`
  );
}

/**
 * Notify user when document is deleted
 */
export async function notifyDocumentDelete(supabase, userId, deleterName, fileName) {
  return createNotification(
    supabase,
    userId,
    'delete',
    'Dokumen Dihapus',
    `${deleterName} menghapus dokumen "${fileName}"`
  );
}

/**
 * Notify user when document is edited
 */
export async function notifyDocumentEdit(supabase, userId, editorName, fileName) {
  return createNotification(
    supabase,
    userId,
    'edit',
    'Dokumen Diperbarui',
    `${editorName} memperbarui dokumen "${fileName}"`
  );
}

/**
 * Notify user about access changes
 */
export async function notifyAccessChange(supabase, userId, message) {
  return createNotification(
    supabase,
    userId,
    'access',
    'Perubahan Hak Akses',
    message
  );
}

/**
 * Notify all users except the current user (excludes user who performed the action)
 * @param {object} supabase - Supabase client instance
 * @param {string} currentUserId - User ID who performed the action (will be excluded)
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {array} roles - Array of roles to notify (e.g., ['admin', 'editor', 'viewer'])
 * @returns {Promise<object>} Created notifications or error
 */
export async function notifyAllUsersExcept(supabase, currentUserId, type, title, message, roles = ['admin', 'editor', 'viewer']) {
  try {
    // Get all users with specified roles and status Aktif, except current user
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .in('role', roles)
      .eq('status', 'Aktif')
      .neq('id', currentUserId);

    if (profileError) {
      console.error('Error fetching user profiles:', profileError);
      return { error: profileError };
    }

    if (!profiles || profiles.length === 0) {
      console.log('No users to notify');
      return { data: [] };
    }

    // Use database function to create notifications (bypasses RLS)
    // Check preferences before sending
    const results = [];
    let skippedCount = 0;
    
    for (const profile of profiles) {
      // Check if user has this notification type enabled
      const isEnabled = await checkNotificationPreference(supabase, profile.id, type);
      
      if (!isEnabled) {
        console.log(`Notification skipped for user ${profile.id}: ${type} notification is disabled`);
        skippedCount++;
        continue;
      }

      const { data, error } = await supabase.rpc('create_notification', {
        target_user_id: profile.id,
        notif_type: type,
        notif_title: title,
        notif_message: message,
      });

      if (error) {
        console.error('Error creating notification for user:', profile.id, error);
      } else {
        results.push(data);
      }
    }

    console.log(`Notifications created for ${results.length} users (roles: ${roles.join(', ')}), skipped: ${skippedCount}`);
    return { data: results };
  } catch (err) {
    console.error('Failed to notify users:', err);
    return { error: err };
  }
}

/**
 * Notify all users (admin, editor, viewer) about an event
 */
export async function notifyAllUsers(supabase, type, title, message) {
  try {
    // Get all users with status Aktif
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('status', 'Aktif');

    if (profileError) {
      console.error('Error fetching user profiles:', profileError);
      return { error: profileError };
    }

    // Create notifications for all active users
    const notifications = profiles.map((profile) => ({
      user_id: profile.id,
      type,
      title,
      message,
      is_read: false,
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      console.error('Error creating user notifications:', error);
      return { error };
    }

    console.log('User notifications created:', data?.length);
    return { data };
  } catch (err) {
    console.error('Failed to notify users:', err);
    return { error: err };
  }
}

/**
 * Notify all admins about an event
 */
export async function notifyAllAdmins(supabase, type, title, message) {
  try {
    // Get all admin users
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (profileError) {
      console.error('Error fetching admin profiles:', profileError);
      return { error: profileError };
    }

    // Use database function to create notifications (bypasses RLS)
    // Check preferences before sending
    const results = [];
    let skippedCount = 0;
    
    for (const profile of profiles) {
      // Check if user has this notification type enabled
      const isEnabled = await checkNotificationPreference(supabase, profile.id, type);
      
      if (!isEnabled) {
        console.log(`Notification skipped for admin ${profile.id}: ${type} notification is disabled`);
        skippedCount++;
        continue;
      }

      const { data, error } = await supabase.rpc('create_notification', {
        target_user_id: profile.id,
        notif_type: type,
        notif_title: title,
        notif_message: message,
      });

      if (error) {
        console.error('Error creating notification for admin:', profile.id, error);
      } else {
        results.push(data);
      }
    }

    console.log(`Admin notifications created: ${results.length}, skipped: ${skippedCount}`);
    return { data: results };
  } catch (err) {
    console.error('Failed to notify admins:', err);
    return { error: err };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(supabase, notificationId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      console.error('Error marking notification as read:', error);
      return { error };
    }

    return { data };
  } catch (err) {
    console.error('Failed to mark notification as read:', err);
    return { error: err };
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return { error };
    }

    console.log('Marked all notifications as read:', data?.length);
    return { data };
  } catch (err) {
    console.error('Failed to mark all notifications as read:', err);
    return { error: err };
  }
}

/**
 * Delete old notifications (older than specified days)
 */
export async function deleteOldNotifications(supabase, daysOld = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select();

    if (error) {
      console.error('Error deleting old notifications:', error);
      return { error };
    }

    console.log('Deleted old notifications:', data?.length);
    return { data };
  } catch (err) {
    console.error('Failed to delete old notifications:', err);
    return { error: err };
  }
}
