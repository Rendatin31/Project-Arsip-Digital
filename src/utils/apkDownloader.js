import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';

// Register custom APK Installer plugin
const ApkInstaller = registerPlugin('ApkInstaller');

/**
 * Download APK file and trigger installation
 * @param {string} apkUrl - URL to the APK file
 * @param {Function} onProgress - Callback for progress updates (0-100)
 * @returns {Promise<boolean>} - Success status
 */
export async function downloadAndInstallAPK(apkUrl, onProgress = null) {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
    console.warn('APK installation is only available on Android');
    throw new Error('APK installation is only available on Android devices');
  }

  try {
    // Show initial progress
    if (onProgress) onProgress(0);

    // Download APK using XMLHttpRequest for progress tracking
    const blob = await downloadWithProgress(apkUrl, onProgress);
    
    // Convert blob to base64
    const base64Data = await blobToBase64(blob);
    
    if (onProgress) onProgress(90);

    // Generate unique filename
    const fileName = `arsip-digital-${Date.now()}.apk`;
    
    // Save to Cache directory
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
      recursive: true
    });

    if (onProgress) onProgress(95);
    
    console.log('APK saved to:', result.uri);

    // Get native file path
    const nativePath = await getNativeFilePath(fileName);
    
    // Open the APK file for installation using custom plugin
    await ApkInstaller.installApk({ filePath: nativePath });
    
    if (onProgress) onProgress(100);

    return true;
  } catch (error) {
    console.error('Error downloading/installing APK:', error);
    throw error;
  }
}

/**
 * Get native file path from Capacitor URI
 */
async function getNativeFilePath(fileName) {
  const result = await Filesystem.getUri({
    path: fileName,
    directory: Directory.Cache
  });
  
  // Convert content:// URI to file path
  let nativePath = result.uri;
  
  // If it's a content URI, convert to file path
  if (nativePath.startsWith('content://')) {
    // Extract the actual file path for Cache directory
    nativePath = `/data/data/com.rendatin.arsip/cache/${fileName}`;
  } else if (nativePath.startsWith('file://')) {
    // Remove file:// prefix
    nativePath = nativePath.replace('file://', '');
  }
  
  console.log('Native file path:', nativePath);
  return nativePath;
}

/**
 * Download file with progress tracking
 */
function downloadWithProgress(url, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    
    // Track download progress
    xhr.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 85); // 0-85%
        onProgress(percentComplete);
      }
    };
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject(new Error(`Download failed with status: ${xhr.status}`));
      }
    };
    
    xhr.onerror = () => {
      reject(new Error('Network error during download'));
    };
    
    xhr.send();
  });
}

/**
 * Convert Blob to Base64
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Remove data URL prefix to get pure base64
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
