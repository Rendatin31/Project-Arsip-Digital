import { useState } from 'react';
import { notifyAllUsersExcept } from '../utils/notifications';

export default function EditDocumentModal({ doc, categories, supabase, userId, onClose, onSaved }) {
  const [form, setForm] = useState({
    category_id: doc.category_id || '',
    subject: doc.subject || '',
    perihal: doc.perihal || '',
    letter_number: doc.letter_number || '',
    letter_date: doc.letter_date || '',
    sender: doc.sender || '',
    recipient: doc.recipient || '',
    status: doc.status || 'DRAFT',
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const FIELD_LABELS = {
    category_id: 'Kategori',
    subject: 'Subjek',
    perihal: 'Perihal',
    letter_number: 'Nomor',
    letter_date: 'Tanggal',
    sender: 'Pengirim',
    recipient: 'Penerima',
    status: 'Status',
  };

  const STATUS_LABELS = { DRAFT: 'Draft', PRIVATE: 'Private', PUBLISHED: 'Publish' };

  const getCategoryName = (id) => {
    if (!id || !Array.isArray(categories)) return id || '-';
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.name : id;
  };

  const buildDiff = () => {
    const changes = [];
    const fields = Object.keys(FIELD_LABELS);
    for (const field of fields) {
      const oldVal = doc[field] ?? '';
      const newVal = form[field] ?? '';
      const normalizedOld = String(oldVal);
      const normalizedNew = String(newVal);
      if (normalizedOld !== normalizedNew) {
        const label = FIELD_LABELS[field];
        let displayOld = oldVal || '-';
        let displayNew = newVal || '-';
        if (field === 'status') {
          displayOld = STATUS_LABELS[oldVal] || oldVal;
          displayNew = STATUS_LABELS[newVal] || newVal;
        } else if (field === 'category_id') {
          displayOld = getCategoryName(oldVal);
          displayNew = getCategoryName(newVal);
        }
        changes.push(`${label} dari "${displayOld}" ke "${displayNew}"`);
      }
    }
    return changes.length ? changes.join('; ') : null;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      const payload = {
        category_id: form.category_id || null,
        subject: form.subject,
        perihal: form.perihal || null,
        letter_number: form.letter_number,
        letter_date: form.letter_date || null,
        sender: form.sender,
        recipient: form.recipient,
        status: form.status,
      };

      const { error: updateError } = await supabase
        .from('documents')
        .update(payload)
        .eq('id', doc.id);

      if (updateError) {
        setError('Gagal memperbarui arsip: ' + (updateError.message || JSON.stringify(updateError)));
        setUploading(false);
        return;
      }

      const { error: auditError } = await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'UPDATE',
        document_id: doc.id,
        metadata: {
          file_name: doc.fileName || doc.subject,
          detail: buildDiff() || 'Tidak ada perubahan',
          ip: '127.0.0.1',
        },
      });

      if (auditError) {
        console.error('Gagal mencatat aktivitas ubah:', auditError);
      }

      // Get user profile for notification
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      const editorName = userProfile?.full_name || 'User';

      // Check if status changed to PUBLISHED or already PUBLISHED
      const isPublished = form.status === 'PUBLISHED';
      const wasPublished = doc.status === 'PUBLISHED';

      // Send notification based on document status
      if (isPublished) {
        if (!wasPublished) {
          // Status changed to PUBLISHED - notify all users except editor (admin, editor, viewer)
          await notifyAllUsersExcept(
            supabase,
            userId,
            'approval',
            'Dokumen Dipublikasikan',
            `${editorName} mempublikasikan dokumen "${form.subject}"`,
            ['admin', 'editor', 'viewer']
          );
          console.log('Publish notification sent to all users except editor');
        } else {
          // Already PUBLISHED, just an update - notify only admin & editor (NOT viewer)
          await notifyAllUsersExcept(
            supabase,
            userId,
            'edit',
            'Dokumen Publik Diperbarui',
            `${editorName} memperbarui dokumen "${form.subject}"`,
            ['admin', 'editor']
          );
          console.log('Edit notification sent to admin & editor only (PUBLISHED document)');
        }
      }
      // If DRAFT or PRIVATE, no notification (internal document)

      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error('Terjadi kesalahan', err);
      setError('Terjadi kesalahan');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-inverse-surface/50 flex items-center justify-center z-[100] p-md">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg w-full max-w-[640px] max-h-[90vh] overflow-y-auto">
        <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-title-sm text-on-surface">Edit Arsip</h3>
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
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="category_id">
              Kategori
            </label>
            <select
              className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md outline-none focus:border-secondary bg-surface-bright"
              id="category_id"
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
            >
              <option value="">Pilih kategori...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="subject">
              Subjek
            </label>
            <input
              className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md outline-none focus:border-secondary"
              id="subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="perihal">
              Perihal
            </label>
            <input
              className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md outline-none focus:border-secondary"
              id="perihal"
              name="perihal"
              value={form.perihal}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="letter_number">
              Nomor
            </label>
            <input
              className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md outline-none focus:border-secondary"
              id="letter_number"
              name="letter_number"
              value={form.letter_number}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="letter_date">
              Tanggal
            </label>
            <input
              className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md outline-none focus:border-secondary"
              id="letter_date"
              name="letter_date"
              type="date"
              value={form.letter_date}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="sender">
              Pengirim
            </label>
            <input
              className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md outline-none focus:border-secondary"
              id="sender"
              name="sender"
              value={form.sender}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="recipient">
              Penerima
            </label>
            <input
              className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md outline-none focus:border-secondary"
              id="recipient"
              name="recipient"
              value={form.recipient}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="status">
              Status
            </label>
            <select
              className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md outline-none focus:border-secondary bg-surface-bright"
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="DRAFT">Draft</option>
              <option value="PRIVATE">Private</option>
              <option value="PUBLISHED">Publish</option>
            </select>
          </div>
          <div className="pt-md border-t border-outline-variant flex justify-end gap-sm">
            <button
              type="button"
              onClick={onClose}
              className="px-lg py-sm rounded-lg border border-outline-variant text-body-sm hover:bg-surface-container-low transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-lg py-sm rounded-lg bg-secondary text-on-secondary font-title-sm text-title-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {uploading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
