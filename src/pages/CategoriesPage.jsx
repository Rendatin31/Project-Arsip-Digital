import { useState, useEffect } from 'react';
import Header from '../components/Header';
import CategoryModal from '../components/CategoryModal';
import ModernAlert from '../components/ModernAlert';

export default function CategoriesPage({ supabase, userId, user, profile, onBack, onNavigate, onCategoryChange, renderHeader = true }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

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

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      // Hapus filter user_id agar semua user dapat melihat semua kategori
      .order('created_at', { ascending: true });

    if (data) {
      setCategories(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, [supabase, userId]);

  const handleAdd = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    showAlert(
      'confirm',
      'Konfirmasi Hapus',
      'Hapus kategori ini?',
      async () => {
        await supabase.from('categories').delete().eq('id', id);
        fetchCategories();
        // Notify parent component about category change
        if (onCategoryChange) {
          onCategoryChange();
        }
        showAlert('success', 'Berhasil', 'Kategori berhasil dihapus');
      },
      true
    );
  };

  const handleSave = () => {
    setShowModal(false);
    setEditingCategory(null);
    fetchCategories();
    // Notify parent component about category change
    if (onCategoryChange) {
      onCategoryChange();
    }
  };

  if (loading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="text-body-sm text-on-surface-variant">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      <div className={renderHeader ? "ml-0 lg:ml-[230px] min-h-screen flex-1 flex flex-col" : "min-h-screen flex-1 flex flex-col"}>
        {renderHeader && <Header user={user} profile={profile} onLogout={() => {}} breadcrumbs={[{ id: null, name: 'home' }, { id: 'arsip-digital', name: 'Arsip Digital' }, { id: 'categories', name: 'Kategori' }]} onNavigate={onNavigate} supabase={supabase} />}
        
        {/* Access Guard - Only Admin */}
        {profile?.role !== 'admin' ? (
          <section className="p-lg flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <span className="material-symbols-outlined text-6xl text-outline mb-md block">lock</span>
              <h2 className="text-2xl font-bold text-primary mb-sm">Akses Terbatas</h2>
              <p className="text-on-surface-variant mb-lg">
                Halaman ini hanya dapat diakses oleh <span className="font-bold text-primary">Administrator</span>.
              </p>
              <button 
                onClick={() => onNavigate?.('dashboard')} 
                className="px-lg py-sm bg-secondary text-on-secondary rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </section>
        ) : (
        <section className="p-lg flex-1">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
              <h2 className="font-title-sm text-on-surface">
                Daftar Kategori <span className="text-on-surface-variant font-normal text-body-sm ml-sm">({categories.length} Data)</span>
              </h2>
              <button
                onClick={handleAdd}
                className="flex items-center gap-sm px-lg py-sm bg-secondary text-on-secondary rounded-lg font-title-sm text-title-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-sm"
              >
                <span className="material-symbols-outlined">add</span>
                Tambah
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    <th className="p-md text-label-caps text-on-surface-variant font-semibold w-12 text-center">No</th>
                    <th className="p-md text-label-caps text-on-surface-variant font-semibold">Kategori</th>
                    <th className="p-md text-label-caps text-on-surface-variant font-semibold">Keterangan</th>
                    <th className="p-md text-label-caps text-on-surface-variant font-semibold w-32 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-md py-sm text-center text-body-sm text-on-surface-variant">
                        Belum ada data kategori.
                      </td>
                    </tr>
                  ) : (
                    categories.map((category, index) => (
                      <tr key={category.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-md py-sm text-center text-table-data text-on-surface-variant">{index + 1}</td>
                        <td className="px-md py-sm text-table-data font-semibold text-on-surface">{category.name}</td>
                        <td className="px-md py-sm text-table-data text-on-surface-variant">{category.description || '-'}</td>
                        <td className="px-md py-sm">
                          <div className="flex gap-sm justify-center">
                            <button onClick={() => handleEdit(category)} title="Edit" className="hover:text-secondary transition-colors">
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button onClick={() => handleDelete(category.id)} title="Hapus" className="hover:text-error transition-colors">
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
          </div>
        </section>
        )}
      </div>
      {showModal && (
        <CategoryModal
          category={editingCategory}
          userId={userId}
          onClose={() => {
            setShowModal(false);
            setEditingCategory(null);
          }}
          onSave={handleSave}
        />
      )}
      
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
