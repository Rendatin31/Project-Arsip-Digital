import { useEffect } from 'react';

/**
 * Custom hook untuk mengubah title halaman secara dinamis
 * @param {string} page - Nama halaman saat ini
 */
export const usePageTitle = (page) => {
  useEffect(() => {
    const titles = {
      dashboard: 'Arsip Digital - Dashboard',
      documents: 'Arsip Digital - File Saya',
      'data-arsip': 'Arsip Digital - Direktori Arsip',
      categories: 'Arsip Digital - Kategori',
      search: 'Arsip Digital - Pencarian Pintar',
      history: 'Arsip Digital - Riwayat Aktivitas',
      access: 'Arsip Digital - Hak Akses',
      settings: 'Arsip Digital - Pengaturan Sistem',
      profile: 'Arsip Digital - Profil',
    };

    const newTitle = titles[page] || 'Arsip Digital';
    document.title = newTitle;
  }, [page]);
};
