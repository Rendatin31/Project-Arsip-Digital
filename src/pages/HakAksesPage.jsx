import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { notifyAccessChange } from '../utils/notifications';

export default function HakAksesPage({ supabase, userId, user, profile, onNavigate, renderHeader = true }) {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', role: '', status: '' });
  const [sendingPasswordLink, setSendingPasswordLink] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        console.log('Fetching users created by:', userId);
        const { data: usersData, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, status, created_at, created_by')
          .eq('created_by', userId) // Filter: hanya pengguna yang dibuat oleh admin ini
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Gagal memuat pengguna:', error);
        } else if (usersData) {
          console.log('Fetched users count:', usersData.length);
          setUsers(usersData);
          const profileMap = {};
          usersData.forEach((u) => {
            profileMap[u.id] = {
              name: u.full_name || u.email,
              email: u.email,
              role: u.role || 'user',
              status: u.status || 'Aktif',
            };
          });
          setProfiles(profileMap);
        }
      } catch (err) {
        console.error('Gagal memuat data hak akses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, userId]);

  const toggleMenu = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const refreshUserData = async () => {
    try {
      console.log('Refreshing users created by:', userId);
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, status, created_at, created_by')
        .eq('created_by', userId) // Filter: hanya pengguna yang dibuat oleh admin ini
        .order('created_at', { ascending: false });

      if (usersData) {
        console.log('Refreshed users count:', usersData.length);
        setUsers(usersData);
        const profileMap = {};
        usersData.forEach((u) => {
          profileMap[u.id] = {
            name: u.full_name || u.email,
            email: u.email,
            role: u.role || 'user',
            status: u.status || 'Aktif',
          };
        });
        setProfiles(profileMap);
      }
    } catch (err) {
      console.error('Gagal refresh data pengguna:', err);
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    // Map role dari database ke display value untuk form
    const roleDisplayMap = { 
      super_admin: 'super_admin',
      admin: 'admin', 
      editor: 'editor', 
      viewer: 'viewer' 
    };
    const displayRole = roleDisplayMap[u.role] || 'viewer';
    
    setForm({ 
      full_name: profiles[u.id]?.name || u.email || '', 
      email: u.email || '', 
      role: displayRole, 
      status: profiles[u.id]?.status || u.status || 'Aktif' 
    });
    setShowEditUserModal(true);
  };

  const confirmDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const roleMap = { 
        'super_admin': 'super_admin',
        'admin': 'admin', 
        'editor': 'editor', 
        'viewer': 'viewer' 
      };
      
      const mappedRole = roleMap[form.role];
      
      console.log('=== EDIT USER DEBUG ===');
      console.log('Editing user ID:', editingUser.id);
      console.log('Form data:', form);
      console.log('Form role:', form.role);
      console.log('Mapped role:', mappedRole);
      
      if (!mappedRole) {
        alert('Silakan pilih peran yang valid.');
        return;
      }
      
      if (!form.status) {
        alert('Silakan pilih status yang valid.');
        return;
      }
      
      const updateData = {
        full_name: form.full_name,
        email: form.email,
        role: mappedRole,
        status: form.status,
      };
      
      console.log('Update data:', updateData);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', editingUser.id)
        .select();

      console.log('Supabase response data:', data);
      console.log('Supabase response error:', error);

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      // Send notification to user about access change
      const roleNames = { 
        super_admin: 'Super Admin',
        admin: 'Admin', 
        editor: 'Editor', 
        viewer: 'Viewer' 
      };
      const statusNames = { Aktif: 'Aktif', 'Non-aktif': 'Non-aktif' };
      
      let changeMessage = `Hak akses Anda telah diperbarui. `;
      if (editingUser.role !== mappedRole) {
        changeMessage += `Role: ${roleNames[mappedRole] || mappedRole}. `;
      }
      if (editingUser.status !== form.status) {
        changeMessage += `Status: ${statusNames[form.status] || form.status}.`;
      }

      await notifyAccessChange(
        supabase,
        editingUser.id,
        changeMessage
      );

      console.log('Access change notification sent to user');

      alert('Data pengguna berhasil diperbarui.');
      setShowEditUserModal(false);
      setEditingUser(null);
      
      // Refresh data tanpa reload penuh
      await refreshUserData();
    } catch (err) {
      console.error('Gagal memperbarui pengguna:', err);
      alert('Gagal memperbarui pengguna: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmId) return;
    try {
      console.log('=== DELETE USER DEBUG ===');
      console.log('Deleting user ID:', deleteConfirmId);
      
      const { data, error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deleteConfirmId)
        .select();

      console.log('Supabase delete response data:', data);
      console.log('Supabase delete response error:', error);

      if (error) {
        console.error('Supabase delete error details:', error);
        throw error;
      }

      alert('Pengguna berhasil dihapus.');
      setDeleteConfirmId(null);
      
      // Refresh data tanpa reload penuh
      await refreshUserData();
    } catch (err) {
      console.error('Gagal menghapus pengguna:', err);
      alert('Gagal menghapus pengguna: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSendPasswordLink = async (userEmail) => {
    setSendingPasswordLink(userEmail);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message.toLowerCase().includes('rate limit')) {
          alert('⚠️ Rate Limit Email\n\nTerlalu banyak permintaan dari jaringan Anda.\n\n✅ Solusi Cepat:\n1. Buka Supabase Dashboard\n2. Authentication → Users\n3. Klik user → "Set Password"\n4. Input password sementara\n5. Beritahu user password tersebut\n\n⏰ Atau tunggu 60 menit untuk kirim email lagi.');
        } else {
          throw error;
        }
      } else {
        alert(`✅ Link set password berhasil dikirim ke ${userEmail}.\n\nSilakan cek inbox email (atau folder Spam).`);
      }
    } catch (err) {
      console.error('Gagal mengirim link password:', err);
      alert('❌ Gagal mengirim link password:\n' + (err.message || 'Unknown error'));
    } finally {
      setSendingPasswordLink(null);
    }
  };

  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.email === userId) {
        alert('Tidak dapat menambahkan pengguna dengan email yang sama dengan akun Anda saat ini.');
        return;
      }

      const roleMap = {
        'super_admin': 'super_admin',
        'admin': 'admin',
        'editor': 'editor',
        'viewer': 'viewer',
      };

      const mappedRole = roleMap[form.role];
      
      console.log('Add user - Form role:', form.role);
      console.log('Add user - Mapped role:', mappedRole);
      
      if (!mappedRole) {
        alert('Silakan pilih peran yang valid.');
        return;
      }
      
      if (!form.status) {
        alert('Silakan pilih status yang valid.');
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        alert('Sesi tidak valid. Silakan login kembali.');
        return;
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '')}/functions/v1/create-user`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: form.email,
          full_name: form.full_name,
          role: mappedRole,
          status: form.status,
          created_by: userId, // Tambahkan created_by untuk tracking
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Gagal menambahkan pengguna:', result.error);
        alert('Gagal menambahkan pengguna: ' + (result.error || 'Unknown error'));
        return;
      }

      const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (resetError) {
        console.error('Gagal mengirim tautan reset password:', resetError.message);
        alert('Pengguna berhasil dibuat, tetapi gagal mengirim tautan reset password: ' + resetError.message);
      } else {
        alert('Pengguna berhasil ditambahkan. Tautan verifikasi dan pengaturan kata sandi telah dikirim ke email.');
      }

      setShowAddUserModal(false);
      setForm({ full_name: '', email: '', role: '', status: '' });
      
      // Refresh data tanpa reload penuh
      await refreshUserData();
    } catch (err) {
      console.error('Gagal menambahkan pengguna:', err);
      alert('Terjadi kesalahan saat menambahkan pengguna.');
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const roleBadgeClass = (role) => {
    const map = {
      super_admin: 'bg-secondary-container text-on-secondary-container',
      admin: 'bg-surface-container-high text-on-surface-variant border border-outline-variant',
      editor: 'bg-surface-container-high text-on-surface-variant border border-outline-variant',
      viewer: 'bg-surface-container-high text-on-surface-variant border border-outline-variant',
    };
    return map[role] || map.viewer;
  };

  const statusClass = (status) => {
    return status === 'Aktif'
      ? 'text-secondary'
      : 'text-outline';
  };

  const statusDotClass = (status) => {
    return status === 'Aktif'
      ? 'bg-secondary'
      : 'bg-outline';
  };

  return (
    <div className={renderHeader ? "flex flex-col min-h-screen w-full min-w-0 ml-0 lg:ml-[230px]" : "flex flex-col min-h-screen w-full min-w-0"}>
      {renderHeader && <Header user={user} profile={profile} onLogout={() => {}} breadcrumbs={[{ id: null, name: 'home' }, { id: 'arsip-digital', name: 'Arsip Digital' }, { id: 'access', name: 'Hak Akses' }]} onNavigate={onNavigate} supabase={supabase} />}

      {/* Access Guard - Only Super Admin and Admin */}
      {profile?.role !== 'super_admin' && profile?.role !== 'admin' ? (
        <main className="px-lg pt-sm pb-lg space-y-lg w-full min-w-0 flex items-center justify-center flex-1">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-6xl text-outline mb-md block">lock</span>
            <h2 className="text-2xl font-bold text-primary mb-sm">Akses Terbatas</h2>
            <p className="text-on-surface-variant mb-lg">
              Halaman ini hanya dapat diakses oleh <span className="font-bold text-primary">Super Admin</span> dan <span className="font-bold text-primary">Admin</span>.
            </p>
            <button 
              onClick={() => onNavigate?.('dashboard')} 
              className="px-lg py-sm bg-secondary text-on-secondary rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </main>
      ) : (
      <main className="px-lg pt-sm pb-lg space-y-lg w-full min-w-0">
        <div className="flex justify-between items-end mb-md">
            <div>
              <h5 className="text-xl font-semibold text-primary">Manajemen Hak Akses</h5>
              <p className="text-xs text-on-surface-variant">Kelola izin pengguna dan tingkatan akses keamanan dokumen.</p>
            </div>
            <button className="flex items-center gap-xs bg-secondary text-on-secondary px-md py-xs rounded-lg text-xs font-semibold hover:opacity-90 transition-all shadow-md" onClick={() => { setForm({ full_name: '', email: '', role: '', status: 'Aktif' }); setShowAddUserModal(true); }}>
              <span className="material-symbols-outlined text-[18px]" data-icon="person_add">person_add</span>
              <span className="hidden sm:inline">Tambah Pengguna Baru</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-lg w-full min-w-0">
            <div className="col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden flex flex-col">
              <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low/30">
                <h3 className="font-title-sm text-primary flex items-center gap-sm">
                  <span className="material-symbols-outlined text-secondary" data-icon="group">group</span>
                  Daftar Pengguna Aktif
                </h3>
                <div className="flex gap-sm">
                  <button className="p-xs text-outline hover:text-secondary transition-colors">
                    <span className="material-symbols-outlined" data-icon="filter_list">filter_list</span>
                  </button>
                  <button className="p-xs text-outline hover:text-secondary transition-colors">
                    <span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/50 text-label-caps text-on-surface-variant">
                      <th className="px-md py-sm border-b border-outline-variant">Pengguna</th>
                      <th className="px-md py-sm border-b border-outline-variant">Peran</th>
                      <th className="px-md py-sm border-b border-outline-variant">Status</th>
                      <th className="px-md py-sm border-b border-outline-variant text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="px-lg py-sm text-center text-body-sm text-on-surface-variant">Memuat data pengguna...</td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-lg py-sm text-center text-body-sm text-on-surface-variant">Belum ada pengguna.</td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="px-md py-sm">
                            <div className="flex items-center gap-sm">
                              <div
                                className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-xs"
                              >
                                {getInitials(profiles[u.id]?.name || u.email)}
                              </div>
                              <div>
                                <p className="font-table-data font-semibold text-on-surface">{profiles[u.id]?.name || u.email}</p>
                                <p className="text-[12px] text-on-surface-variant">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-md py-sm">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${roleBadgeClass(u.role)}`}>
                              {u.role === 'super_admin' ? 'Super Admin' : u.role === 'admin' ? 'Admin' : u.role === 'editor' ? 'Editor' : 'Viewer'}
                            </span>
                          </td>
                          <td className="px-md py-sm">
                            <div className={`flex items-center gap-1 ${statusClass(profiles[u.id]?.status || 'Non-aktif')}`}>
                              <span className={`w-2 h-2 rounded-full ${statusDotClass(profiles[u.id]?.status || 'Non-aktif')}`}></span>
                              <span className="text-xs font-medium">{profiles[u.id]?.status || 'Non-aktif'}</span>
                            </div>
                          </td>
                           <td className="px-md py-sm text-right flex items-center justify-end gap-xs">
                             <button
                               onClick={() => handleSendPasswordLink(u.email)}
                               className="text-outline hover:text-tertiary p-xs transition-colors"
                               title="Kirim Link Set Password"
                               disabled={sendingPasswordLink === u.email}
                             >
                               {sendingPasswordLink === u.email ? (
                                 <span className="material-symbols-outlined text-sm animate-spin" data-icon="progress_activity">progress_activity</span>
                               ) : (
                                 <span className="material-symbols-outlined text-sm" data-icon="mail">mail</span>
                               )}
                             </button>
                             <button
                               onClick={() => openEditModal(u)}
                               className="text-outline hover:text-secondary p-xs transition-colors"
                               title="Edit"
                             >
                               <span className="material-symbols-outlined text-sm" data-icon="edit">edit</span>
                             </button>
                           </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-sm bg-surface-container-low/50 border-t border-outline-variant text-center">
                <button className="text-secondary font-semibold text-xs hover:underline">Lihat Semua Pengguna</button>
              </div>
            </div>
          </div>
        </main>
      )}

        {showAddUserModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-lg">
            <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setShowAddUserModal(false)} />
            <div className="relative w-full max-w-md bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant overflow-hidden">
              <div className="p-lg border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-headline-md text-headline-md text-primary">Tambah Pengguna Baru</h3>
                <button onClick={() => setShowAddUserModal(false)} className="text-on-surface-variant hover:text-error transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="px-lg pt-sm pb-xl space-y-lg">
                <div className="space-y-xs">
                  <label className="text-label-caps text-on-surface-variant text-xs">Nama Lengkap</label>
                  <input value={form.full_name} onChange={handleFormChange('full_name')} className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:ring-2 focus:ring-secondary text-sm" placeholder="Masukkan nama lengkap" type="text" required />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-caps text-on-surface-variant text-xs">Alamat Email</label>
                  <input value={form.email} onChange={handleFormChange('email')} className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:ring-2 focus:ring-secondary text-sm" placeholder="contoh@earsip.go.id" type="email" required />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-caps text-on-surface-variant text-xs">Role</label>
                  <select value={form.role} onChange={handleFormChange('role')} className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:ring-2 focus:ring-secondary text-sm">
                    <option value="">--- Pilih ---</option>
                    {profile?.role === 'super_admin' && (
                      <>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                      </>
                    )}
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-caps text-on-surface-variant text-xs">Status</label>
                  <select value={form.status} onChange={handleFormChange('status')} className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:ring-2 focus:ring-secondary text-sm">
                    <option value="Aktif">Aktif</option>
                    <option value="Non-aktif">Non-aktif</option>
                  </select>
                </div>
                <div className="p-sm bg-surface-container-high/50 border border-outline-variant/50 rounded-lg mt-md">
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-on-surface-variant text-[10px]" data-icon="info">info</span>
                    <p className="text-[11px] text-on-surface-variant leading-tight">
                      Link Create Password akan dikirimkan ke alamat Email terdaftar.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end pt-md mb-lg">
                   <button type="submit" className="px-lg py-sm bg-secondary text-on-secondary rounded-xl font-bold hover:opacity-90 transition-opacity text-xs uppercase tracking-widest shadow-md">Simpan</button>
                 </div>
               </form>
             </div>
           </div>
         )}

         {showEditUserModal && editingUser && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-lg">
             <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => { setShowEditUserModal(false); setEditingUser(null); }} />
             <div className="relative w-full max-w-md bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant overflow-hidden">
               <div className="p-lg border-b border-outline-variant flex justify-between items-center">
                 <h3 className="font-headline-md text-headline-md text-primary">Edit Pengguna</h3>
                 <button onClick={() => { setShowEditUserModal(false); setEditingUser(null); }} className="text-on-surface-variant hover:text-error transition-colors">
                   <span className="material-symbols-outlined">close</span>
                 </button>
               </div>
               <form onSubmit={handleEditUser} className="px-lg pt-sm pb-xl space-y-lg">
                 <div className="space-y-xs">
                   <label className="text-label-caps text-on-surface-variant text-xs">Nama Lengkap</label>
                   <input value={form.full_name} onChange={handleFormChange('full_name')} className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:ring-2 focus:ring-secondary text-sm" placeholder="Masukkan nama lengkap" type="text" required />
                 </div>
                 <div className="space-y-xs">
                   <label className="text-label-caps text-on-surface-variant text-xs">Alamat Email</label>
                   <input value={form.email} onChange={handleFormChange('email')} className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:ring-2 focus:ring-secondary text-sm" placeholder="contoh@earsip.go.id" type="email" required />
                 </div>
                 <div className="space-y-xs">
                   <label className="text-label-caps text-on-surface-variant text-xs">Role</label>
                   <select value={form.role} onChange={handleFormChange('role')} className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:ring-2 focus:ring-secondary text-sm">
                     <option value="">--- Pilih ---</option>
                     {profile?.role === 'super_admin' && (
                       <>
                         <option value="super_admin">Super Admin</option>
                         <option value="admin">Admin</option>
                       </>
                     )}
                     <option value="editor">Editor</option>
                     <option value="viewer">Viewer</option>
                   </select>
                 </div>
                 <div className="space-y-xs">
                   <label className="text-label-caps text-on-surface-variant text-xs">Status</label>
                   <select value={form.status} onChange={handleFormChange('status')} className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 focus:ring-2 focus:ring-secondary text-sm">
                     <option value="Aktif">Aktif</option>
                     <option value="Non-aktif">Non-aktif</option>
                   </select>
                 </div>
                 <div className="flex justify-end pt-md mb-lg">
                   <button type="submit" className="px-lg py-sm bg-secondary text-on-secondary rounded-xl font-bold hover:opacity-90 transition-opacity text-xs uppercase tracking-widest shadow-md">Simpan</button>
                 </div>
               </form>
             </div>
           </div>
         )}

         {deleteConfirmId && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-lg">
             <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
             <div className="relative w-full max-w-sm bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant overflow-hidden">
               <div className="p-lg flex flex-col gap-md">
                 <div className="flex items-center gap-sm">
                   <span className="material-symbols-outlined text-error text-3xl">warning</span>
                   <h3 className="font-headline-md text-headline-md text-primary">Hapus Pengguna</h3>
                 </div>
                 <p className="text-body-sm text-on-surface-variant">Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.</p>
                 <div className="flex gap-md pt-md">
                   <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-sm border border-outline-variant rounded-xl font-bold text-on-surface-variant hover:bg-surface-container transition-colors text-xs uppercase tracking-widest">Batal</button>
                   <button onClick={handleDeleteUser} className="flex-1 py-sm bg-error text-on-error rounded-xl font-bold hover:opacity-90 transition-opacity text-xs uppercase tracking-widest shadow-md">Hapus</button>
                 </div>
                </div>
              </div>
            </div>
           )}
      </div>
    );
}
