/**
 * Session Timeout Utility
 * Auto logout user after period of inactivity
 */

const SESSION_TIMEOUT_KEY = 'session_timeout_minutes';
const LAST_ACTIVITY_KEY = 'last_activity_time';

/**
 * Get session timeout setting (in minutes)
 */
export function getSessionTimeout() {
  const timeout = localStorage.getItem(SESSION_TIMEOUT_KEY);
  return timeout ? parseInt(timeout) : 30; // Default 30 minutes
}

/**
 * Set session timeout setting (in minutes)
 */
export function setSessionTimeout(minutes) {
  localStorage.setItem(SESSION_TIMEOUT_KEY, minutes.toString());
}

/**
 * Update last activity timestamp
 */
export function updateLastActivity() {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

/**
 * Get last activity timestamp
 */
export function getLastActivity() {
  const timestamp = localStorage.getItem(LAST_ACTIVITY_KEY);
  return timestamp ? parseInt(timestamp) : Date.now();
}

/**
 * Check if session has timed out
 * @returns {boolean} true if session has expired
 */
export function isSessionExpired() {
  const timeoutMinutes = getSessionTimeout();
  const lastActivity = getLastActivity();
  const now = Date.now();
  const timeSinceLastActivity = now - lastActivity;
  const timeoutMilliseconds = timeoutMinutes * 60 * 1000;
  
  return timeSinceLastActivity > timeoutMilliseconds;
}

/**
 * Get remaining time before session expires (in seconds)
 */
export function getRemainingTime() {
  const timeoutMinutes = getSessionTimeout();
  const lastActivity = getLastActivity();
  const now = Date.now();
  const timeSinceLastActivity = now - lastActivity;
  const timeoutMilliseconds = timeoutMinutes * 60 * 1000;
  const remainingMilliseconds = timeoutMilliseconds - timeSinceLastActivity;
  
  return Math.max(0, Math.floor(remainingMilliseconds / 1000));
}

/**
 * Clear session timeout data
 */
export function clearSessionData() {
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}

/**
 * Initialize session timeout monitoring
 * @param {Function} onTimeout - Callback when session expires
 * @returns {Function} Cleanup function
 */
export function initSessionTimeout(onTimeout) {
  // Update activity on page load
  updateLastActivity();
  
  // Events to track user activity
  const activityEvents = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click'
  ];
  
  // Throttle activity updates (max once per minute)
  let lastUpdate = Date.now();
  const updateThrottle = 60 * 1000; // 1 minute
  
  const handleActivity = () => {
    const now = Date.now();
    if (now - lastUpdate > updateThrottle) {
      updateLastActivity();
      lastUpdate = now;
    }
  };
  
  // Add activity listeners
  activityEvents.forEach(event => {
    document.addEventListener(event, handleActivity, { passive: true });
  });
  
  // Check for timeout every 10 seconds
  const checkInterval = setInterval(() => {
    if (isSessionExpired()) {
      console.log('Session expired due to inactivity');
      clearInterval(checkInterval); // Clear interval immediately after timeout
      onTimeout();
    }
  }, 10 * 1000); // Check every 10 seconds
  
  // Cleanup function
  return () => {
    activityEvents.forEach(event => {
      document.removeEventListener(event, handleActivity);
    });
    clearInterval(checkInterval);
  };
}
