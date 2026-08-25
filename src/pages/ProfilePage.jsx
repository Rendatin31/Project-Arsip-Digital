import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import ModernAlert from '../components/ModernAlert';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { initializePushNotifications, checkNotificationPermission } from '../utils/pushNotifications';

export default function ProfilePage({ supabase, userId, user, profile, onNavigate, onProfileUpdate, onLogout, renderHeader = true }) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatar, setAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  
  // Ref untuk debounce bio auto-save
  const bioTimeoutRef = useRef(null);

  // Modern Alert State
  const [alert, setAlert] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    showCancel: false
  });

  // Helper function to show alert
  const showAlert = (type, title, message, onConfirm = null, showCancel = false) => {
    setAlert({
      show: true,
      type,
      title,
      message,
      onConfirm,
      showCancel
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  // Update form when profile prop changes
  useEffect(() => {
    setFullName(profile?.full_name || '');
    setBio(profile?.bio || '');
    setAvatarUrl(profile?.avatar_url || null);
    setEmail(user?.email || '');
  }, [profile, user]);

  // Auto-save bio dengan debounce (tunggu 1.5 detik setelah user berhenti mengetik)
  useEffect(() => {
    // Clear timeout sebelumnya
    if (bioTimeoutRef.current) {
      clearTimeout(bioTimeoutRef.current);
    }

    // Jika bio berbeda dari profile asli, set timeout untuk auto-save
    if (bio !== (profile?.bio || '')) {
      bioTimeoutRef.current = setTimeout(() => {
        handleSaveBio();
      }, 1500); // Auto-save setelah 1.5 detik
    }

    // Cleanup
    return () => {
      if (bioTimeoutRef.current) {
        clearTimeout(bioTimeoutRef.current);
      }
    };
  }, [bio]);

  // Auto-save bio function
  const handleSaveBio = async () => {
    try {
      setSavingBio(true);
      console.log('Auto-saving bio...');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          bio: bio?.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error auto-saving bio:', updateError);
      } else {
        console.log('Bio auto-saved successfully');
        // Refresh profile in parent
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      }
    } catch (err) {
      console.error('Error auto-saving bio:', err);
    } finally {
      setSavingBio(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showAlert('warning', 'File Terlalu Besar', 'Ukuran file maksimal 2MB!');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showAlert('warning', 'Format Tidak Valid', 'File harus berupa gambar!');
      return;
    }

    // Auto-upload avatar immediately
    try {
      setUploadingAvatar(true);
      console.log('Uploading avatar...');

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.replace('avatars/', '');
        await supabase.storage.from('avatars').remove([oldPath]);
        console.log('Old avatar deleted');
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        showAlert('error', 'Gagal Upload', 'Gagal mengupload avatar: ' + uploadError.message);
        setUploadingAvatar(false);
        return;
      }

      const newAvatarUrl = `avatars/${filePath}`;
      console.log('Avatar uploaded:', newAvatarUrl);

      // Update database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating avatar in database:', updateError);
        showAlert('error', 'Gagal Memperbarui', 'Gagal memperbarui avatar');
        setUploadingAvatar(false);
        return;
      }

      // Update local state
      setAvatarUrl(newAvatarUrl);
      showAlert('success', 'Berhasil', 'Foto profil berhasil diperbarui!');

      // Refresh profile in parent
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      showAlert('error', 'Gagal Upload', 'Gagal mengupload foto profil');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    showAlert(
      'confirm',
      'Konfirmasi Hapus',
      'Hapus foto profil?',
      async () => {
        try {
          // Delete from storage
          if (avatarUrl) {
            const oldPath = avatarUrl.replace('avatars/', '');
            await supabase.storage.from('avatars').remove([oldPath]);
          }

          // Update database
          await supabase
            .from('profiles')
            .update({ 
              avatar_url: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          setAvatarUrl(null);
          setAvatar(null);
          setAvatarPreview(null);
          showAlert('success', 'Berhasil', 'Foto profil berhasil dihapus!');

          // Refresh profile in parent
          if (onProfileUpdate) {
            onProfileUpdate();
          }
        } catch (err) {
          console.error('Error removing avatar:', err);
          showAlert('error', 'Gagal Menghapus', 'Gagal menghapus foto profil');
        }
      },
      true
    );
  };

  const handleLogout = () => {
    showAlert(
      'confirm',
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar?',
      async () => {
        if (onLogout) {
          onLogout();
        }
      },
      true
    );
  };

  // Test notification function
  const handleTestNotification = async () => {
    if (!Capacitor.isNativePlatform()) {
      showAlert('warning', 'Platform Tidak Didukung', 'Notifikasi hanya tersedia di aplikasi mobile Android/iOS');
      return;
    }

    try {
      // Check permission first
      const hasPermission = await checkNotificationPermission();
      
      if (!hasPermission) {
        showAlert(
          'confirm',
          'Permission Diperlukan',
          'Aplikasi memerlukan izin notifikasi. Aktifkan sekarang?',
          async () => {
            const success = await initializePushNotifications();
            if (success) {
              // Try sending test notification after permission granted
              await sendTestNotification();
            } else {
              showAlert('error', 'Gagal', 'Gagal mengaktifkan notifikasi. Silakan aktifkan manual di pengaturan device.');
            }
          },
          true
        );
        return;
      }

      // Permission granted, send test notification
      await sendTestNotification();
    } catch (error) {
      console.error('Error testing notification:', error);
      showAlert('error', 'Error', 'Gagal mengirim notifikasi test: ' + error.message);
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 100000),
            title: '🔔 Test Notifikasi',
            body: 'Notifikasi Arsip Digital berhasil! Sistem notifikasi berfungsi dengan baik.',
            largeBody: 'Ini adalah notifikasi test untuk memastikan sistem push notification berfungsi dengan baik di device Anda.',
            summaryText: 'Arsip Digital',
            channelId: 'arsip_digital',
            sound: 'default',
            extra: {
              type: 'test',
            },
          },
        ],
      });

      showAlert('success', 'Berhasil!', 'Notifikasi test berhasil dikirim! Cek notification bar di device Anda.');
    } catch (error) {
      console.error('Error sending test notification:', error);
      showAlert('error', 'Gagal', 'Gagal mengirim notifikasi: ' + error.message);
    }
  };

  return (
    <div className={renderHeader ? "flex flex-col min-h-screen w-full min-w-0 ml-0 lg:ml-[230px]" : "flex flex-col min-h-screen w-full min-w-0"}>
      {renderHeader && (
        <Header 
          user={user} 
          profile={profile} 
          onLogout={() => {}} 
          breadcrumbs={[
            { id: null, name: 'home' }, 
            { id: 'arsip-digital', name: 'Arsip Digital' }, 
            { id: 'profile', name: 'Profil' }
          ]} 
          onNavigate={onNavigate} 
          supabase={supabase} 
        />
      )}

      <main className="px-lg pt-sm pb-lg space-y-lg w-full min-w-0">
        <div className="flex justify-between items-end mb-md">
          <div>
            <h5 className="text-xl font-semibold text-primary">Profil Pengguna</h5>
            <p className="text-xs text-on-surface-variant">Kelola informasi profil dan foto Anda</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <div className="p-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <div className="relative mb-md">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-outline-variant bg-surface-container">
                    {avatarPreview || avatarUrl ? (
                      <img
                        src={
                          avatarPreview || 
                          `${supabase.storage.from('avatars').getPublicUrl(avatarUrl.replace('avatars/', '')).data.publicUrl}`
                        }
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center" style={{ border: '4px solid #e5e7eb' }}>
                        <span 
                          className="material-symbols-outlined filled-icon profile-avatar-icon text-[90px] md:text-[80px]"
                          style={{ color: '#6b7280', lineHeight: '1' }}
                        >
                          account_circle
                        </span>
                      </div>
                    )}
                  </div>
                  <label 
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 w-10 h-10 bg-secondary text-on-secondary rounded-full flex items-center justify-center hover:bg-secondary/90 transition-colors shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                {(avatarUrl || avatarPreview) && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="text-error text-body-sm hover:underline mb-xs"
                  >
                    Hapus Foto
                  </button>
                )}
                <p className="text-label-caps text-on-surface-variant text-center">MAX FILE SIZE: 2MB</p>
                {uploadingAvatar && (
                  <p className="text-body-sm text-secondary mt-xs">Mengupload...</p>
                )}
              </div>

              {/* Form Section */}
              <div className="md:col-span-2 space-y-xs">
                <div className="mb-md">
                  <label className="text-xs text-on-surface block mb-xs font-semibold uppercase">Nama Lengkap</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    disabled
                    className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface-variant outline-none cursor-not-allowed opacity-60"
                    title="Nama tidak dapat diubah di halaman ini"
                  />
                </div>

                <div className="mb-md">
                  <label className="text-xs text-on-surface block mb-xs font-semibold uppercase">Alamat Email</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    placeholder="admin@earsip.go.id"
                    className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface-variant outline-none cursor-not-allowed opacity-60"
                    title="Email tidak dapat diubah"
                  />
                </div>

                <div>
                  <label className="text-xs text-on-surface block mb-xs font-semibold uppercase flex items-center gap-2">
                    Bio Singkat
                    {savingBio && (
                      <span className="text-[10px] text-secondary font-normal flex items-center gap-1">
                        <span className="material-symbols-outlined animate-spin text-[12px]">progress_activity</span>
                        Menyimpan...
                      </span>
                    )}
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Contoh: Administrator sistem pengarsipan digital."
                    rows={4}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all resize-none"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">Bio akan tersimpan otomatis setelah Anda berhenti mengetik</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Test Notification & Logout */}
          <div className="flex justify-between items-center gap-sm px-lg py-md bg-surface-container border-t border-outline-variant">
            {/* Test Notification Button (Only on Native & Desktop) */}
            {Capacitor.isNativePlatform() && (
              <button
                onClick={handleTestNotification}
                className="hidden lg:flex text-blue-600 hover:text-blue-700 font-medium text-sm items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">notifications</span>
                <span>Test Notifikasi</span>
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1 transition-colors ml-auto"
            >
              <span className="material-symbols-outlined !text-[14px] md:!text-[16px] hidden md:inline">logout</span>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </main>
      
      {/* Modern Alert Component */}
      <ModernAlert
        show={alert.show}
        onClose={closeAlert}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={alert.onConfirm}
        showCancel={alert.showCancel}
      />
    </div>
  );
}
