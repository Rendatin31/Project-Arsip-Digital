import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function CategoryModal({ category, userId, onClose, onSave }) {
  const [form, setForm] = useState({
    name: category?.name || '',
    description: category?.description || '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Nama kategori harus diisi');
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        user_id: userId,
      };

      if (category) {
        await supabase.from('categories').update(payload).eq('id', category.id);
      } else {
        await supabase.from('categories').insert(payload);
      }
      onSave?.();
    } catch {
      setError('Gagal menyimpan kategori');
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
          {error && (
            <div className="bg-error-container/30 border border-error/20 text-error px-md py-sm rounded-lg text-body-sm">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="name">Kategori</label>
            <input
              className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md outline-none focus:border-secondary"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
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
            />
          </div>
          <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
            <button type="button" onClick={onClose} className="px-lg py-sm rounded-lg border border-outline-variant text-body-sm hover:bg-surface-container-low transition-colors">
              Batal
            </button>
            <button type="submit" className="px-lg py-sm rounded-lg bg-secondary text-on-secondary font-title-sm text-title-sm hover:brightness-110 active:scale-[0.98] transition-all">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
