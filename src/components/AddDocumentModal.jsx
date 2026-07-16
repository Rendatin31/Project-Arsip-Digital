import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { notifyAllUsersExcept } from '../utils/notifications';

export default function AddDocumentModal({ categories, directories, userId, currentDirectoryId, onClose, onSave }) {
  const [form, setForm] = useState({
    category_id: '',
    directory_id: currentDirectoryId || '',
    subject: '',
    letter_number: '',
    letter_date: '',
    sender: '',
    recipient: '',
    status: 'DRAFT',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      let filePath = null;
      let fileSize = null;
      let mimeType = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const path = `${userId}/${fileName}`;
        
        console.log('Uploading file:', { fileName, path, fileSize: file.size, fileType: file.type });
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(path, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          setError('Gagal mengunggah file: ' + (uploadError.message || JSON.stringify(uploadError)));
          setUploading(false);
          return;
        }

        filePath = path;
        fileSize = file.size;
        mimeType = file.type;
      }

      const payload = {
        user_id: userId,
        category_id: form.category_id || null,
        directory_id: form.directory_id || null,
        subject: form.subject,
        perihal: form.perihal || null,
        letter_number: form.letter_number,
        letter_date: form.letter_date || null,
        sender: form.sender,
        recipient: form.recipient,
        file_name: file?.name || null,
        file_path: filePath,
        file_size: fileSize,
        mime_type: mimeType,
        status: form.status,
      };
      
      console.log('Inserting document:', payload);
      
      const { data: insertedDoc, error: insertError } = await supabase
        .from('documents')
        .insert(payload)
        .select('id, file_name, file_size')
        .single();

      if (insertError) {
        console.error('Insert documents error:', insertError);
        console.error('Insert documents payload:', payload);
        setError('Gagal menyimpan data arsip: ' + (insertError.message || JSON.stringify(insertError)));
        setUploading(false);
        return;
      }

      console.log('Document inserted successfully:', insertedDoc);

      const { error: auditError } = await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'CREATE',
        document_id: insertedDoc.id,
        metadata: { file_name: file?.name || form.subject, ip: '127.0.0.1' },
      });

      if (auditError) {
        console.error('Gagal mencatat aktivitas unggah:', auditError);
      }

      // Get user profile for notification
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      const uploaderName = userProfile?.full_name || 'User';

      // Send notification based on document status
      if (form.status === 'PUBLISHED') {
        console.log('=== SENDING UPLOAD NOTIFICATION ===');
        console.log('Uploader:', userId, uploaderName);
        console.log('Document:', form.subject);
        console.log('Target roles: admin, editor, viewer');
        
        // If PUBLISHED, notify all users EXCEPT the uploader (admin, editor, viewer)
        const result = await notifyAllUsersExcept(
          supabase,
          userId,
          'upload',
          'Dokumen Baru Dipublikasikan',
          `${uploaderName} mempublikasikan dokumen "${form.subject}"`,
          ['admin', 'editor', 'viewer']
        );
        
        console.log('Upload notification result:', result);
        console.log('=== END UPLOAD NOTIFICATION ===');
      }
      // If DRAFT or PRIVATE, no notification (internal document)

      onSave?.();
      onClose?.();
    } catch (err) {
      setError('Terjadi kesalahan');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-inverse-surface/50 flex items-center justify-center z-[100] p-md">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg w-full max-w-[640px] max-h-[90vh] overflow-y-auto">
        <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-title-sm text-on-surface">Tambah Arsip</h3>
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
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="directory_id">
                Folder
              </label>
              <select
                className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md outline-none focus:border-secondary bg-surface-bright"
                id="directory_id"
                name="directory_id"
                value={form.directory_id}
                onChange={handleChange}
              >
                <option value="">Pilih folder...</option>
                {directories.map((dir) => (
                  <option key={dir.id} value={dir.id}>
                    {dir.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="category_id">
                Kategori <span className="text-error">*</span>
              </label>
              <select
                className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md outline-none focus:border-secondary bg-surface-bright"
                id="category_id"
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
              >
                <option value="">Pilih kategori...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
           <div className="flex flex-col gap-xs">
             <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="subject">
               Subjek <span className="text-error">*</span>
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
               Perihal <span className="text-error">*</span>
             </label>
             <input
               className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md outline-none focus:border-secondary"
               id="perihal"
               name="perihal"
               value={form.perihal}
               onChange={handleChange}
               required
             />
           </div>
           <div className="flex flex-col gap-xs">
             <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="letter_number">
               Nomor <span className="text-error">*</span>
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
               Tanggal <span className="text-error">*</span>
             </label>
             <input
               className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md outline-none focus:border-secondary"
               id="letter_date"
               name="letter_date"
               type="date"
               value={form.letter_date}
               onChange={handleChange}
               required
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
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Unggah File <span className="text-error">*</span>
            </label>
            <label className="flex flex-col items-center justify-center gap-sm border-2 border-dashed border-outline-variant rounded-xl p-xl cursor-pointer hover:border-secondary hover:bg-surface-container-low transition-all">
              {preview ? (
                <img alt="Preview" className="max-h-40 rounded-lg object-contain" src={preview} />
              ) : (
                <>
                  <span className="material-symbols-outlined text-secondary text-4xl">upload_file</span>
                  <span className="text-body-sm text-on-surface-variant">Klik untuk memilih file atau tarik file ke sini</span>
                </>
              )}
              <input
                className="hidden"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </label>
            {file && <p className="text-body-sm text-on-surface-variant">File dipilih: {file.name}</p>}
          </div>
          <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
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
