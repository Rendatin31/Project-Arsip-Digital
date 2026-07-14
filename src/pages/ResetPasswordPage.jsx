import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ResetPasswordPage({ supabase: supabaseClient, onNavigate }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    const handlePasswordReset = async () => {
      try {
        console.log('=== RESET PASSWORD DEBUG ===');
        console.log('Full URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search:', window.location.search);
        console.log('Pathname:', window.location.pathname);
        
        let accessToken = null;
        let refreshToken = null;
        let type = null;

        // Check hash first (format: #access_token=xxx&refresh_token=yyy&type=recovery)
        const hash = window.location.hash;
        if (hash.includes('access_token')) {
          const params = new URLSearchParams(hash.substring(1));
          accessToken = params.get('access_token');
          refreshToken = params.get('refresh_token');
          type = params.get('type');
          
          console.log('Tokens found in HASH:');
          console.log('- Access token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NULL');
          console.log('- Refresh token:', refreshToken ? 'EXISTS' : 'NULL');
          console.log('- Type:', type);
        }

        // If not in hash, check query params
        if (!accessToken) {
          const searchParams = new URLSearchParams(window.location.search);
          accessToken = searchParams.get('access_token');
          refreshToken = searchParams.get('refresh_token');
          type = searchParams.get('type');
          
          if (accessToken) {
            console.log('Tokens found in QUERY PARAMS:');
            console.log('- Access token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NULL');
            console.log('- Refresh token:', refreshToken ? 'EXISTS' : 'NULL');
            console.log('- Type:', type);
          }
        }

        if (accessToken && refreshToken) {
          console.log('Setting session with tokens...');
          const { data, error: sessionError } = await supabaseClient.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          console.log('Set session result:');
          console.log('- Data:', data?.session ? 'Session created' : 'No session');
          console.log('- Error:', sessionError?.message || 'None');

          if (sessionError) {
            console.error('Session error details:', sessionError);
            if (isActive) {
              setError(`Tautan reset kata sandi tidak valid atau sudah kadaluarsa. (${sessionError.message})`);
            }
            return;
          }

          if (!isActive) return;
          console.log('✅ Session set successfully!');
          setSessionReady(true);

          // Clean URL
          try {
            const cleanUrl = window.location.pathname;
            window.history.replaceState(null, '', cleanUrl);
            console.log('URL cleaned:', cleanUrl);
          } catch (e) {
            console.warn('Could not clean URL:', e);
          }
          return;
        }

        console.log('No tokens found, checking existing session...');
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        console.log('Existing session check:');
        console.log('- Session:', sessionData?.session ? 'EXISTS' : 'NULL');
        console.log('- Error:', sessionError?.message || 'None');
        
        if (!isActive) return;

        if (sessionError) {
          console.error('Session check error:', sessionError);
          setError('Tautan reset kata sandi tidak valid atau sudah kadaluarsa.');
          return;
        }

        if (sessionData?.session) {
          console.log('✅ Valid existing session found!');
          setSessionReady(true);
          return;
        }

        console.log('❌ No valid session or tokens found');
        if (isActive) {
          setError('Tautan reset kata sandi tidak valid atau sudah kadaluarsa. Silakan request link reset baru.');
        }
      } catch (err) {
        console.error('❌ Exception in handlePasswordReset:', err);
        if (isActive) {
          setError('Terjadi kesalahan saat memverifikasi tautan. Silakan coba lagi atau minta tautan reset baru.');
        }
      }
    };

    handlePasswordReset();

    return () => {
      isActive = false;
    };
  }, [supabaseClient]);

  const validatePassword = (value) => {
    if (value.length < 8) return 'Kata sandi minimal 8 karakter.';
    if (!/[a-zA-Z]/.test(value)) return 'Kata sandi harus mengandung huruf.';
    if (!/[0-9]/.test(value)) return 'Kata sandi harus mengandung angka.';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value)) return 'Kata sandi harus mengandung simbol.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Kata sandi dan konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabaseClient.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError('Gagal memperbarui kata sandi: ' + updateError.message);
        setLoading(false);
        return;
      }

      await supabaseClient.auth.signOut();
      setSuccess('Kata sandi berhasil disetel. Anda akan dialihkan ke halaman login...');
      setPassword('');
      setConfirmPassword('');
      window.location.hash = '';

      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err) {
      console.error('Gagal memperbarui kata sandi:', err);
      setError('Terjadi kesalahan saat memperbarui kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  if (error && !sessionReady) {
    return (
      <div className="bg-surface min-h-screen flex flex-col justify-center items-center p-md">
        <div className="w-full max-w-[440px] flex flex-col gap-lg">
          <header className="flex flex-col items-center text-center gap-xs">
            <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance
            </span>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">Arsip Digital</h1>
            <p className="font-title-sm text-title-sm text-on-surface-variant">Rendatin - KPU Halmahera Utara</p>
          </header>
          <main className="login-card bg-surface-container-lowest rounded-xl p-xl flex flex-col gap-md">
            <div className="bg-error-container/30 border border-error/20 text-error px-md py-sm rounded-lg text-body-sm text-center">
              {error}
            </div>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('login');
                else window.location.href = '/';
              }}
              className="w-full bg-secondary text-on-secondary py-sm px-lg rounded-lg font-title-sm hover:brightness-110 active:scale-[0.98] transition-all flex justify-center items-center gap-sm shadow-sm"
            >
              Kembali ke Login
            </button>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen flex flex-col justify-center items-center p-md">
      <div className="w-full max-w-[440px] flex flex-col gap-lg">
        <header className="flex flex-col items-center text-center gap-xs">
          <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            lock_reset
          </span>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Setel Kata Sandi</h1>
          <p className="font-title-sm text-title-sm text-on-surface-variant">Buat kata sandi baru untuk akun Anda</p>
        </header>
        <main className="login-card bg-surface-container-lowest rounded-xl p-xl flex flex-col gap-lg">
          {error && (
            <div className="bg-error-container/30 border border-error/20 text-error px-md py-sm rounded-lg text-body-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-secondary-container/30 border border-secondary/20 text-on-secondary px-md py-sm rounded-lg text-body-sm">
              {success}
            </div>
          )}
          <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Kata Sandi Baru</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                  lock
                </span>
                <input
                  className="w-full pl-[48px] pr-[48px] py-sm bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter, huruf, angka, dan simbol"
                  required
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors flex items-center"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined" id="passwordToggleIcon">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Konfirmasi Kata Sandi</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                  lock
                </span>
                <input
                  className="w-full pl-[48px] pr-[48px] py-sm bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                />
                <button
                  className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors flex items-center"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="material-symbols-outlined" id="confirmPasswordToggleIcon">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <button
              className="w-full bg-secondary text-on-secondary py-sm px-lg rounded-lg font-title-sm text-title-sm hover:brightness-110 active:scale-[0.98] transition-all flex justify-center items-center gap-sm shadow-sm"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Simpan Kata Sandi'}
            </button>
          </form>
          <div className="flex justify-center items-center pt-md border-t border-outline-variant/30">
            <p className="text-body-sm text-on-surface-variant">
              Ingat kata sandi?{' '}
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('login');
                  else window.location.href = '/';
                }}
                className="text-secondary font-medium hover:underline"
              >
                Masuk
              </button>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
