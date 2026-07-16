import { useState } from 'react';
import { supabase } from '../lib/supabase';
import ModernAlert from './ModernAlert';

export default function CategoryModal({ category, userId, onClose, onSave }) {
  const [form, setForm] = useState({
    name: category?.name || '',
    description: category?.description || '',
  });
  const [saving, setSaving] = useState(false);

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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      showAlert('warning', 'Validasi Gagal', 'Nama kategori harus diisi');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        user_id: userId,
      };

      if (category) {
        const { error } = await supabase.from('categories').update(payload).eq('id', category.id);
        if (error) throw error;
        
        // Call onSave first to refresh data
        if (onSave) onSave();
        
        // Show success alert
        showAlert('success', 'Berhasil', 'Kategori berhasil diperbarui', () => {
          // Close modal after alert is dismissed
          if (onClose) onClose();
        });
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
        
        // Call onSave first to refresh data
        if (onSave) onSave();
        
        // Show success alert
        showAlert('success', 'Berhasil', 'Kategori berhasil ditambahkan', () => {
          // Close modal after alert is dismissed
          if (onClose) onClose();
        });
      }
    } catch (err) {
      console.error('Error saving category:', err);
      showAlert('error', 'Gagal Menyimpan', 'Gagal menyimpan kategori: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-inverse-surface/50 flex items-center justify-center z-[100] p-md">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg w-full max-w-[480px]">
        <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-title-sm text-on-surface">{category ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
          <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form className="p-lg flex flex-col gap-md" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="name">
              Kategori <span className="text-error">*</span>
            </label>
            <input
              className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md outline-none focus:border-secondary"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Contoh: Surat Masuk"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="description">Keterangan</label>
            <textarea
              className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md outline-none focus:border-secondary min-h-[80px]"
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Deskripsi kategori (opsional)"
            />
          </div>
          <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={saving}
              className="px-lg py-sm rounded-lg border border-outline-variant text-body-sm hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="px-lg py-sm rounded-lg bg-secondary text-on-secondary font-title-sm text-title-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-xs"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  <span>Menyimpan...</span>
                </>
              ) : (
                'Simpan'
              )}
            </button>
          </div>
        </form>
      </div>
      
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
