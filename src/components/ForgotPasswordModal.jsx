import { useState } from 'react';

export default function ForgotPasswordModal({ supabase, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        // Handle specific error messages
        if (resetError.message.toLowerCase().includes('rate limit')) {
          setError('Terlalu banyak permintaan reset password dari jaringan Anda. Silakan tunggu 60 menit atau hubungi administrator untuk reset manual.');
        } else if (resetError.message.toLowerCase().includes('not found')) {
          setError('Email tidak terdaftar dalam sistem.');
        } else {
          setError(resetError.message || 'Gagal mengirim email reset password');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-md">
      <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant overflow-hidden">
        <div className="p-lg border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-headline-md text-headline-md text-primary">
            {success ? 'Email Terkirim' : 'Lupa Kata Sandi'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-lg">
          {success ? (
            <div className="text-center space-y-md">
              <div className="w-16 h-16 mx-auto bg-secondary-container rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-secondary">mark_email_read</span>
              </div>
              <div>
                <p className="text-body-md text-on-surface mb-sm">
                  Link reset password telah dikirim ke:
                </p>
                <p className="text-body-md font-semibold text-primary">{email}</p>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                Silakan cek inbox email Anda dan klik link untuk mereset password. Link akan kadaluarsa dalam 1 jam.
              </p>
              <button
                onClick={onClose}
                className="w-full py-sm bg-secondary text-on-secondary rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Tutup
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-md">
              <div className="space-y-sm">
                <p className="text-body-sm text-on-surface-variant">
                  Masukkan alamat email Anda. Kami akan mengirimkan link untuk mereset kata sandi Anda.
                </p>
                <div className="bg-tertiary-container/30 border border-tertiary/20 px-md py-sm rounded-lg">
                  <p className="text-body-xs text-on-surface-variant flex items-start gap-xs">
                    <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                    <span>Untuk keamanan, maksimal 3 permintaan per jam dari jaringan yang sama.</span>
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-error-container/30 border border-error/20 text-error px-md py-sm rounded-lg text-body-sm flex items-start gap-sm">
                  <span className="material-symbols-outlined text-lg mt-0.5">error</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="reset-email">
                  Alamat Email
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                    email
                  </span>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-[48px] pr-md py-sm bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                    placeholder="contoh@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-md pt-md">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-sm border border-outline-variant rounded-lg font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-sm bg-secondary text-on-secondary rounded-lg font-semibold hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      Kirim Link Reset
                      <span className="material-symbols-outlined">send</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
