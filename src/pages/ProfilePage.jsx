import { useState, useEffect } from 'react';
import Header from '../components/Header';

export default function ProfilePage({ supabase, userId, user, profile, onNavigate, onProfileUpdate, renderHeader = true }) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatar, setAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Update form when profile prop changes
  useEffect(() => {
    setFullName(profile?.full_name || '');
    setBio(profile?.bio || '');
    setAvatarUrl(profile?.avatar_url || null);
    setEmail(user?.email || '');
  }, [profile, user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB!');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar!');
      return;
    }

    setAvatar(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Hapus foto profil?')) return;

    try {
      // Delete from storage
      if (avatarUrl) {
        const oldPath = avatarUrl.replace('avatars/', '');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Update database
      await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      setAvatarUrl(null);
      setAvatar(null);
      setAvatarPreview(null);
      alert('Foto profil berhasil dihapus!');

      // Refresh profile in parent
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (err) {
      console.error('Error removing avatar:', err);
      alert('Gagal menghapus foto profil');
    }
  };

  const handleSave = async () => {
    try {
      setSavingProfile(true);
      console.log('Updating profile for user:', userId);
      
      // Validasi
      if (!fullName || fullName.trim() === '') {
        setSavingProfile(false);
        alert('Nama lengkap tidak boleh kosong!');
        return;
      }

      let newAvatarUrl = avatarUrl;

      // Upload avatar if new file selected
      if (avatar) {
        console.log('Uploading avatar...');
        setUploadingAvatar(true);

        // Delete old avatar if exists
        if (avatarUrl) {
          const oldPath = avatarUrl.replace('avatars/', '');
          await supabase.storage.from('avatars').remove([oldPath]);
          console.log('Old avatar deleted');
        }

        // Upload new avatar
        const fileExt = avatar.name.split('.').pop();
        const fileName = `${userId}/avatar.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatar, { upsert: true });

        if (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          setSavingProfile(false);
          setUploadingAvatar(false);
          alert('Gagal mengupload avatar: ' + uploadError.message);
          return;
        }

        newAvatarUrl = `avatars/${filePath}`;
        console.log('Avatar uploaded:', newAvatarUrl);
        setUploadingAvatar(false);
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          bio: bio?.trim() || null,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        setSavingProfile(false);
        alert('Gagal memperbarui profil: ' + updateError.message);
        return;
      }

      console.log('Profile updated successfully');
      
      // Refresh profile data in parent component (App.jsx)
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      
      // Refresh profile data locally
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (updatedProfile) {
        setFullName(updatedProfile.full_name || '');
        setBio(updatedProfile.bio || '');
        setAvatarUrl(updatedProfile.avatar_url || null);
        setAvatar(null);
        setAvatarPreview(null);
      }
      
      setSavingProfile(false);
      alert('Profil berhasil diperbarui!');
      
    } catch (err) {
      console.error('Error saving profile:', err);
      setSavingProfile(false);
      alert('Gagal menyimpan profil');
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
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-600" style={{ fontSize: '60px' }}>
                          person
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
                  <label className="text-sm text-on-surface block mb-xs font-semibold uppercase">Nama Lengkap</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                  />
                </div>

                <div className="mb-md">
                  <label className="text-sm text-on-surface block mb-xs font-semibold uppercase">Alamat Email</label>
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
                  <label className="text-sm text-on-surface block mb-xs font-semibold uppercase">Bio Singkat</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Contoh: Administrator sistem pengarsipan digital."
                    rows={4}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-sm px-lg py-md bg-surface-container border-t border-outline-variant">
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="px-lg py-sm bg-surface-container-high text-on-surface rounded-lg font-semibold hover:bg-surface-container-highest transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={savingProfile}
              className="px-lg py-sm bg-secondary text-on-secondary rounded-lg font-semibold hover:brightness-110 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-xs"
            >
              {savingProfile ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  <span>Menyimpan...</span>
                </>
              ) : (
                'Simpan'
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
