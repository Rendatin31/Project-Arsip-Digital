import { useState, useEffect } from 'react';
import Header from '../components/Header';
import CategoryModal from '../components/CategoryModal';
import { setSessionTimeout as saveSessionTimeout, getSessionTimeout } from '../utils/sessionTimeout';

export default function PengaturanSistemPage({ supabase, userId, user, profile, onNavigate, onCategoryChange, onProfileUpdate, renderHeader = true }) {
  // Access control: Only super_admin role can access Konfigurasi Sistem
  const isSuperAdmin = profile?.role === 'super_admin';
  
  // Set default tab based on user role
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'konfigurasi' : 'keamanan');
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [savingPassword, setSavingPassword] = useState(false);
  
  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [documentUploadNotif, setDocumentUploadNotif] = useState(true);
  const [documentUpdateNotif, setDocumentUpdateNotif] = useState(true);
  const [securityAlertNotif, setSecurityAlertNotif] = useState(true);
  const [systemUpdateNotif, setSystemUpdateNotif] = useState(false);
  const [weeklyReportNotif, setWeeklyReportNotif] = useState(true);

  // Load notification preferences from database
  useEffect(() => {
    if (!userId || !supabase || activeTab !== 'notifikasi') return;

    const fetchNotificationPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.log('No notification preferences found, using defaults');
        } else if (data) {
          setEmailNotifications(data.email_notifications ?? true);
          setDocumentUploadNotif(data.document_upload ?? true);
          setDocumentUpdateNotif(data.document_update ?? true);
          setSecurityAlertNotif(data.security_alert ?? true);
          setSystemUpdateNotif(data.system_update ?? false);
          setWeeklyReportNotif(data.weekly_report ?? true);
        }
      } catch (err) {
        console.error('Error fetching notification preferences:', err);
      }
    };

    fetchNotificationPreferences();
  }, [userId, supabase, activeTab]);

  // Load session timeout setting
  useEffect(() => {
    if (activeTab === 'keamanan') {
      const savedTimeout = getSessionTimeout();
      setSessionTimeout(savedTimeout.toString());
      console.log('Loaded session timeout:', savedTimeout, 'minutes');
    }
  }, [activeTab]);

  const tabs = [
    { id: 'konfigurasi', icon: 'tune', label: 'Konfigurasi Sistem' },
    { id: 'keamanan', icon: 'security', label: 'Keamanan' },
    { id: 'notifikasi', icon: 'notifications', label: 'Notifikasi' },
  ];

  // Don't filter tabs - show all tabs to all users
  const visibleTabs = tabs;

  // Redirect if trying to access restricted tab
  useEffect(() => {
    if (activeTab === 'konfigurasi' && !isSuperAdmin) {
      setActiveTab('keamanan');
    }
  }, [activeTab, isSuperAdmin]);

  // Fetch categories
  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (data) {
      setCategories(data);
    }
    setLoadingCategories(false);
  };

  useEffect(() => {
    if (activeTab === 'konfigurasi') {
      fetchCategories();
    }
  }, [activeTab, supabase, userId]);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Hapus kategori ini?')) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
    if (onCategoryChange) {
      onCategoryChange();
    }
  };

  const handleSaveCategory = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    fetchCategories();
    if (onCategoryChange) {
      onCategoryChange();
    }
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'keamanan') {
        // Validasi password
        if (newPassword && newPassword !== confirmPassword) {
          alert('Password baru tidak cocok!');
          return;
        }
        if (newPassword && newPassword.length < 6) {
          alert('Password minimal 6 karakter!');
          return;
        }
        
        // Update password using Supabase Auth
        if (newPassword && currentPassword) {
          setSavingPassword(true);
          console.log('Updating password...');
          
          // Verify current password by attempting to sign in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
          });

          if (signInError) {
            setSavingPassword(false);
            alert('Password saat ini salah!');
            return;
          }

          // Update password
          const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
          });

          if (updateError) {
            console.error('Error updating password:', updateError);
            setSavingPassword(false);
            alert('Gagal mengubah password: ' + updateError.message);
            return;
          }

          // Send security notification
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', userId)
            .single();

          const userName = userProfile?.full_name || 'User';

          // Create security notification
          await supabase.rpc('create_notification', {
            target_user_id: userId,
            notif_type: 'security',
            notif_title: 'Password Berhasil Diubah',
            notif_message: `Password akun Anda telah berhasil diubah pada ${new Date().toLocaleString('id-ID')}`
          });

          console.log('Password updated successfully');
          
          // Clear password fields
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setSavingPassword(false);
          
          alert('Password berhasil diubah! Notifikasi keamanan telah dikirim.');
        } else if (newPassword && !currentPassword) {
          alert('Masukkan password saat ini untuk mengubah password!');
          return;
        } else {
          // Save other security settings (2FA, session timeout)
          // Save session timeout to localStorage
          saveSessionTimeout(parseInt(sessionTimeout));
          console.log('Session timeout saved:', sessionTimeout, 'minutes');
          
          alert('Pengaturan keamanan berhasil disimpan!');
        }
      } else if (activeTab === 'notifikasi') {
        // Save notification preferences to database
        console.log('Saving notification preferences for user:', userId);
        
        const { data: existing } = await supabase
          .from('notification_preferences')
          .select('id')
          .eq('user_id', userId)
          .single();

        const preferences = {
          user_id: userId,
          email_notifications: emailNotifications,
          document_upload: documentUploadNotif,
          document_update: documentUpdateNotif,
          security_alert: securityAlertNotif,
          system_update: systemUpdateNotif,
          weekly_report: weeklyReportNotif,
          updated_at: new Date().toISOString(),
        };

        console.log('Preferences to save:', preferences);

        if (existing) {
          // Update existing preferences
          console.log('Updating existing preferences');
          const { error } = await supabase
            .from('notification_preferences')
            .update(preferences)
            .eq('user_id', userId);

          if (error) throw error;
        } else {
          // Insert new preferences
          console.log('Inserting new preferences');
          const { error } = await supabase
            .from('notification_preferences')
            .insert(preferences);

          if (error) throw error;
        }

        // Verify saved data
        const { data: saved } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        console.log('Saved preferences verified:', saved);

        alert('Pengaturan notifikasi berhasil disimpan!');
      } else {
        // Update profile logic here
        alert('Perubahan berhasil disimpan!');
      }
    } catch (err) {
      console.error('Error saving changes:', err);
      alert('Gagal menyimpan perubahan: ' + (err.message || 'Unknown error'));
    }
  };

  const handleCancel = () => {
    if (activeTab === 'keamanan') {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else if (activeTab === 'notifikasi') {
      // Reset notification settings
      setEmailNotifications(true);
      setDocumentUploadNotif(true);
      setDocumentUpdateNotif(true);
      setSecurityAlertNotif(true);
      setSystemUpdateNotif(false);
      setWeeklyReportNotif(true);
    } else {
      // Reset profile form
      setFullName(profile?.full_name || '');
      setEmail(user?.email || '');
      setBio(profile?.bio || '');
      setAvatar(null);
    }
  };

  return (
    <div className="min-h-screen w-full min-w-0 bg-background">
      <div className={renderHeader ? "ml-0 lg:ml-[230px] flex flex-col min-h-screen" : "flex flex-col min-h-screen"} style={renderHeader ? { width: '100%', maxWidth: 'calc(100% - 0px)', minWidth: 0 } : { width: '100%', minWidth: 0 }} className={renderHeader ? "ml-0 lg:ml-[230px] flex flex-col min-h-screen lg:w-[calc(100%-230px)]" : "flex flex-col min-h-screen"}>
        {renderHeader && <Header user={user} profile={profile} onLogout={() => {}} breadcrumbs={[{ id: null, name: 'home' }, { id: 'arsip-digital', name: 'Arsip Digital' }, { id: 'settings', name: 'Pengaturan Sistem' }]} onNavigate={onNavigate} supabase={supabase} />}

        <main className="flex-1 px-lg py-lg">
          <div className="max-w-5xl">
            {/* Tabs */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant mb-lg overflow-hidden">
              <div className="border-b border-outline-variant">
                <nav className="flex">
                  {visibleTabs.map((tab) => {
                    const isDisabled = tab.id === 'konfigurasi' && !isSuperAdmin;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => !isDisabled && setActiveTab(tab.id)}
                        disabled={isDisabled}
                        className={`flex items-center gap-xs px-lg py-md text-body-md font-semibold transition-colors border-b-2 ${
                          activeTab === tab.id
                            ? 'border-secondary text-secondary'
                            : isDisabled
                            ? 'border-transparent text-on-surface-variant/40 cursor-not-allowed opacity-50'
                            : 'border-transparent text-on-surface-variant hover:text-on-surface cursor-pointer'
                        }`}
                        title={isDisabled ? 'Hanya dapat diakses oleh Super Admin' : ''}
                      >
                        <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content - Konfigurasi Sistem (Categories) */}
              {activeTab === 'konfigurasi' && isSuperAdmin && (
                <div className="p-lg">
                  <div className="flex justify-between items-center mb-lg">
                    <div>
                      <h3 className="text-title-lg font-title-lg font-bold text-on-surface">Kelola Kategori Dokumen</h3>
                      <p className="text-body-sm text-on-surface-variant">Atur kategori untuk mengorganisir dokumen Anda.</p>
                    </div>
                    <button
                      onClick={handleAddCategory}
                      className="flex items-center gap-sm px-lg py-sm bg-secondary text-on-secondary rounded-lg font-title-sm text-title-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined">add</span>
                      Tambah Kategori
                    </button>
                  </div>
                  
                  {loadingCategories ? (
                    <div className="text-center py-xl text-on-surface-variant">Memuat kategori...</div>
                  ) : (
                    <div className="border border-outline-variant rounded-lg overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-surface-container border-b border-outline-variant">
                          <tr>
                            <th className="p-md text-label-caps text-on-surface-variant font-semibold w-12 text-center">No</th>
                            <th className="p-md text-label-caps text-on-surface-variant font-semibold">Nama Kategori</th>
                            <th className="p-md text-label-caps text-on-surface-variant font-semibold">Keterangan</th>
                            <th className="p-md text-label-caps text-on-surface-variant font-semibold w-32 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                          {categories.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="px-md py-xl text-center text-body-sm text-on-surface-variant">
                                Belum ada kategori. Klik "Tambah Kategori" untuk membuat kategori baru.
                              </td>
                            </tr>
                          ) : (
                            categories.map((category, index) => (
                              <tr key={category.id} className="hover:bg-surface-container transition-colors">
                                <td className="px-md py-sm text-center text-table-data text-on-surface-variant">{index + 1}</td>
                                <td className="px-md py-sm text-table-data font-semibold text-on-surface">{category.name}</td>
                                <td className="px-md py-sm text-table-data text-on-surface-variant">{category.description || '-'}</td>
                                <td className="px-md py-sm">
                                  <div className="flex gap-sm justify-center">
                                    <button 
                                      onClick={() => handleEditCategory(category)} 
                                      title="Edit" 
                                      className="p-sm hover:bg-secondary-container hover:text-secondary rounded transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteCategory(category.id)} 
                                      title="Hapus" 
                                      className="p-sm hover:bg-error-container hover:text-error rounded transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content - Keamanan */}
              {activeTab === 'keamanan' && (
                <div className="p-xl space-y-xl">
                  {/* Change Password Section */}
                  <div>
                    <div className="space-y-md max-w-2xl">
                      <div className="mb-md">
                        <label className="text-label-lg text-on-surface block mb-xs font-semibold">PASSWORD SAAT INI</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Masukkan password saat ini"
                            className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm pr-[40px] text-body-md text-on-surface outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface transition-colors"
                            title={showCurrentPassword ? "Sembunyikan password" : "Lihat password"}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {showCurrentPassword ? "visibility_off" : "visibility"}
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="mb-md">
                        <label className="text-label-lg text-on-surface block mb-xs font-semibold">PASSWORD BARU</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimal 6 karakter"
                            className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm pr-[40px] text-body-md text-on-surface outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface transition-colors"
                            title={showNewPassword ? "Sembunyikan password" : "Lihat password"}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {showNewPassword ? "visibility_off" : "visibility"}
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="mb-md">
                        <label className="text-label-lg text-on-surface block mb-xs font-semibold">KONFIRMASI PASSWORD BARU</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ketik ulang password baru"
                            className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm pr-[40px] text-body-md text-on-surface outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface transition-colors"
                            title={showConfirmPassword ? "Sembunyikan password" : "Lihat password"}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {showConfirmPassword ? "visibility_off" : "visibility"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-outline-variant"></div>

                  {/* Two-Factor Authentication */}
                  <div className="mt-md mb-md">
                    <div className="max-w-2xl">
                      <div className="flex items-center justify-between bg-surface-container rounded-lg p-lg border border-outline-variant">
                        <div className="flex-1">
                          <p className="text-body-md font-semibold text-on-surface mb-xs">Aktifkan 2FA</p>
                          <p className="text-body-sm text-on-surface-variant">Tambahkan lapisan keamanan ekstra dengan verifikasi dua langkah</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-lg">
                          <input
                            type="checkbox"
                            checked={twoFactorEnabled}
                            onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-outline-variant"></div>

                  {/* Session Timeout */}
                  <div className="mt-md mb-md">
                    <div className="max-w-2xl">
                      <label className="text-label-lg text-on-surface block mb-xs font-semibold">TIMEOUT OTOMATIS</label>
                      <select
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                      >
                        <option value="15">15 menit</option>
                        <option value="30">30 menit</option>
                        <option value="60">1 jam</option>
                        <option value="120">2 jam</option>
                        <option value="0">Tidak pernah</option>
                      </select>
                      <p className="text-body-sm text-on-surface-variant mt-xs">Sistem akan otomatis logout setelah tidak ada aktivitas</p>
                    </div>
                  </div>

                  <div className="border-t border-outline-variant"></div>

                  {/* Security Log */}
                  <div className="mt-md">
                    <div className="max-w-2xl space-y-sm">
                      <div className="flex items-start gap-md bg-surface-container rounded-lg p-md border border-outline-variant">
                        <span className="material-symbols-outlined text-secondary text-[20px] mt-xs">verified_user</span>
                        <div className="flex-1">
                          <p className="text-body-md font-semibold text-on-surface">Login Terakhir</p>
                          <p className="text-body-sm text-on-surface-variant">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-md bg-surface-container rounded-lg p-md border border-outline-variant">
                        <span className="material-symbols-outlined text-tertiary text-[20px] mt-xs">devices</span>
                        <div className="flex-1">
                          <p className="text-body-md font-semibold text-on-surface">Perangkat Aktif</p>
                          <p className="text-body-sm text-on-surface-variant">Windows 10 - Chrome Browser</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content - Notifikasi */}
              {activeTab === 'notifikasi' && (
                <div className="p-xl space-y-xl">
                  {/* Email Notifications */}
                  <div className="mb-md">
                    <h3 className="text-title-lg font-title-lg text-on-surface mb-md">Notifikasi Email</h3>
                    <div className="max-w-2xl space-y-md">
                      <div className="flex items-center justify-between bg-surface-container rounded-lg p-lg border border-outline-variant">
                        <div className="flex-1">
                          <p className="text-body-md font-semibold text-on-surface mb-xs">Aktifkan Notifikasi Email</p>
                          <p className="text-body-sm text-on-surface-variant">Terima pemberitahuan melalui email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-lg">
                          <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-outline-variant"></div>

                  {/* Activity Notifications */}
                  <div className="mt-md">
                    <h3 className="text-title-lg font-title-lg text-on-surface mb-md">Notifikasi Aktivitas</h3>
                    <div className="max-w-2xl space-y-md">
                      <div className="flex items-center justify-between bg-surface-container rounded-lg p-md border border-outline-variant mb-md">
                        <div className="flex items-center gap-md flex-1">
                          <span className="material-symbols-outlined text-secondary text-[20px]">upload_file</span>
                          <div>
                            <p className="text-body-md font-semibold text-on-surface">Upload Dokumen</p>
                            <p className="text-body-sm text-on-surface-variant">Notifikasi saat dokumen baru diunggah</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-lg">
                          <input
                            type="checkbox"
                            checked={documentUploadNotif}
                            onChange={(e) => setDocumentUploadNotif(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>

                      {/* Update Dokumen - Hanya untuk Admin & Editor */}
                      {(profile?.role === 'admin' || profile?.role === 'editor') && (
                        <div className="flex items-center justify-between bg-surface-container rounded-lg p-md border border-outline-variant mb-md">
                          <div className="flex items-center gap-md flex-1">
                            <span className="material-symbols-outlined text-tertiary text-[20px]">edit</span>
                            <div>
                              <p className="text-body-md font-semibold text-on-surface">Update Dokumen</p>
                              <p className="text-body-sm text-on-surface-variant">Notifikasi saat dokumen diperbarui</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer ml-lg">
                            <input
                              type="checkbox"
                              checked={documentUpdateNotif}
                              onChange={(e) => setDocumentUpdateNotif(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                          </label>
                        </div>
                      )}

                      <div className="flex items-center justify-between bg-surface-container rounded-lg p-md border border-outline-variant mb-md">
                        <div className="flex items-center gap-md flex-1">
                          <span className="material-symbols-outlined text-error text-[20px]">warning</span>
                          <div>
                            <p className="text-body-md font-semibold text-on-surface">Peringatan Keamanan</p>
                            <p className="text-body-sm text-on-surface-variant">Alert untuk aktivitas mencurigakan</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-lg">
                          <input
                            type="checkbox"
                            checked={securityAlertNotif}
                            onChange={(e) => setSecurityAlertNotif(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between bg-surface-container rounded-lg p-md border border-outline-variant mb-md">
                        <div className="flex items-center gap-md flex-1">
                          <span className="material-symbols-outlined text-tertiary text-[20px]">update</span>
                          <div>
                            <p className="text-body-md font-semibold text-on-surface">Update Sistem</p>
                            <p className="text-body-sm text-on-surface-variant">Informasi pembaruan aplikasi</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-lg">
                          <input
                            type="checkbox"
                            checked={systemUpdateNotif}
                            onChange={(e) => setSystemUpdateNotif(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-outline-variant"></div>

                  {/* Report Notifications */}
                  <div className="mt-md">
                    <h3 className="text-title-lg font-title-lg text-on-surface mb-md">Laporan Berkala</h3>
                    <div className="max-w-2xl space-y-md">
                      <div className="flex items-center justify-between bg-surface-container rounded-lg p-md border border-outline-variant mb-md">
                        <div className="flex items-center gap-md flex-1">
                          <span className="material-symbols-outlined text-primary text-[20px]">summarize</span>
                          <div>
                            <p className="text-body-md font-semibold text-on-surface">Laporan Mingguan</p>
                            <p className="text-body-sm text-on-surface-variant">Ringkasan aktivitas setiap minggu</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-lg">
                          <input
                            type="checkbox"
                            checked={weeklyReportNotif}
                            onChange={(e) => setWeeklyReportNotif(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-outline-variant"></div>

                  {/* Notification Preferences */}
                  <div className="mt-md">
                    <h3 className="text-title-lg font-title-lg text-on-surface mb-md">Preferensi Notifikasi</h3>
                    <div className="max-w-2xl">
                      <div className="bg-secondary-container/20 border border-secondary/30 rounded-lg p-lg">
                        <div className="flex items-start gap-md">
                          <span className="material-symbols-outlined text-secondary text-[24px]">info</span>
                          <div>
                            <p className="text-body-md font-semibold text-on-surface mb-xs">Kelola Preferensi Email</p>
                            <p className="text-body-sm text-on-surface-variant mb-md">
                              Notifikasi akan dikirim ke alamat email: <span className="font-semibold text-on-surface">{user?.email}</span>
                            </p>
                            <p className="text-body-sm text-on-surface-variant">
                              Email tidak dapat diubah. Hubungi administrator jika perlu mengubah email.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Placeholder for other tabs */}
              {(activeTab !== 'profil' && activeTab !== 'konfigurasi' && activeTab !== 'keamanan' && activeTab !== 'notifikasi') && (
                <div className="p-xl">
                  <p className="text-body-md text-on-surface-variant text-center py-3xl">
                    Konten untuk tab "{tabs.find(t => t.id === activeTab)?.label}" akan segera tersedia.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-surface-container-low border-t border-outline-variant px-xl py-lg flex justify-end gap-md rounded-xl">
              <button
                onClick={handleCancel}
                disabled={savingPassword}
                className="px-lg py-sm border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batalkan
              </button>
              <button
                onClick={handleSave}
                disabled={savingPassword}
                className="px-lg py-sm bg-secondary text-on-secondary rounded-lg hover:bg-secondary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-xs"
              >
                {savingPassword && (
                  <span className="animate-spin">⏳</span>
                )}
                {savingPassword ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </main>
      </div>
      
      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          userId={userId}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          onSave={handleSaveCategory}
        />
      )}
    </div>
  );
}
