/**
 * Error Handler Utility
 * Convert technical errors to user-friendly messages
 */

/**
 * Check if error is network-related
 */
export function isNetworkError(error) {
  if (!error) return false;
  
  const errorStr = error.toString().toLowerCase();
  const errorMsg = error.message?.toLowerCase() || '';
  
  // Common network error patterns
  const networkPatterns = [
    'fetch',
    'network',
    'failed to fetch',
    'networkerror',
    'timeout',
    'connection',
    'internet',
    'offline',
    'unreachable',
    'enotfound',
    'econnrefused',
    'econnreset',
    'etimedout',
  ];
  
  return networkPatterns.some(pattern => 
    errorStr.includes(pattern) || errorMsg.includes(pattern)
  );
}

/**
 * Get user-friendly error message
 * @param {Error|string} error - The error object or message
 * @param {string} action - The action being performed (login, upload, delete, etc.)
 * @returns {string} User-friendly error message
 */
export function getFriendlyErrorMessage(error, action = '') {
  // Check if user is online
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  
  if (!isOnline) {
    return '⚠️ Tidak ada koneksi internet. Silakan periksa jaringan Anda dan coba lagi.';
  }
  
  // Check if it's a network error
  if (isNetworkError(error)) {
    return '⚠️ Koneksi internet bermasalah. Silakan coba lagi dalam beberapa saat.';
  }
  
  const errorStr = error?.toString() || '';
  const errorMsg = error?.message || errorStr;
  
  // Check for HTML error page (JSON parse errors)
  if (errorMsg.includes('<!doctype') || errorMsg.includes('is not valid JSON') || errorMsg.includes('Unexpected token')) {
    return '⚠️ Tidak dapat mengakses dokumen. Periksa koneksi internet Anda dan coba lagi.';
  }
  
  // Supabase specific errors
  if (errorMsg.includes('Invalid login credentials')) {
    return 'Email atau password salah. Silakan coba lagi.';
  }
  
  if (errorMsg.includes('Email not confirmed')) {
    return 'Email belum dikonfirmasi. Silakan cek email Anda.';
  }
  
  if (errorMsg.includes('User already registered')) {
    return 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
  }
  
  if (errorMsg.includes('new row violates row-level security')) {
    return 'Anda tidak memiliki izin untuk melakukan operasi ini.';
  }
  
  if (errorMsg.includes('JWT')) {
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  }
  
  if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
    return 'Koneksi timeout. Jaringan Anda mungkin lambat. Silakan coba lagi.';
  }
  
  // File upload errors
  if (action === 'upload' || action === 'add') {
    if (errorMsg.includes('size') || errorMsg.includes('too large')) {
      return 'Ukuran file terlalu besar. Maksimal 10MB.';
    }
    if (errorMsg.includes('type') || errorMsg.includes('format')) {
      return 'Format file tidak didukung.';
    }
    return 'Gagal mengunggah dokumen. Periksa koneksi internet Anda.';
  }
  
  // Delete errors
  if (action === 'delete' || action === 'remove') {
    return 'Gagal menghapus dokumen. Periksa koneksi internet Anda.';
  }
  
  // Update errors
  if (action === 'update' || action === 'edit') {
    return 'Gagal memperbarui dokumen. Periksa koneksi internet Anda.';
  }
  
  // Login errors
  if (action === 'login') {
    return 'Gagal login. Periksa koneksi internet Anda atau coba lagi nanti.';
  }
  
  // Default generic messages based on action
  const actionMessages = {
    login: 'Gagal login. Silakan coba lagi.',
    register: 'Gagal mendaftar. Silakan coba lagi.',
    upload: 'Gagal mengunggah dokumen. Silakan coba lagi.',
    download: 'Gagal mengunduh dokumen. Silakan coba lagi.',
    delete: 'Gagal menghapus dokumen. Silakan coba lagi.',
    update: 'Gagal memperbarui dokumen. Silakan coba lagi.',
    save: 'Gagal menyimpan perubahan. Silakan coba lagi.',
  };
  
  if (action && actionMessages[action]) {
    return actionMessages[action];
  }
  
  // If error message is short and readable, use it
  if (errorMsg && errorMsg.length < 100 && !errorMsg.includes('{') && !errorMsg.includes('Error:')) {
    return errorMsg;
  }
  
  // Default fallback
  return 'Terjadi kesalahan. Silakan periksa koneksi internet Anda dan coba lagi.';
}

/**
 * Log error for debugging (only in development)
 */
export function logError(error, context = '') {
  if (import.meta.env.DEV) {
    console.error(`[Error ${context}]:`, error);
  }
}

/**
 * Handle error and return friendly message
 * Combines logging and message generation
 */
export function handleError(error, action = '', context = '') {
  logError(error, context || action);
  return getFriendlyErrorMessage(error, action);
}

/**
 * Check network connectivity
 */
export function checkNetworkConnectivity() {
  return new Promise((resolve) => {
    if (!navigator.onLine) {
      resolve(false);
      return;
    }
    
    // Try to fetch a small resource to verify connectivity
    const timeout = setTimeout(() => resolve(false), 3000);
    
    fetch('https://www.google.com/favicon.ico', { 
      mode: 'no-cors',
      cache: 'no-store'
    })
      .then(() => {
        clearTimeout(timeout);
        resolve(true);
      })
      .catch(() => {
        clearTimeout(timeout);
        resolve(false);
      });
  });
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (!isNetworkError(error)) {
        throw error;
      }
      
      // Don't retry if offline
      if (!navigator.onLine) {
        throw error;
      }
      
      // Last attempt failed
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = initialDelay * Math.pow(2, i);
      console.log(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
