import { useState, useEffect } from 'react';
import ForgotPasswordModal from './ForgotPasswordModal';
import { handleError } from '../utils/errorHandler';

export default function LoginPage({ onLogin, supabase }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [savedEmail, setSavedEmail] = useState('');
  const [savedPassword, setSavedPassword] = useState('');

  // Check for error from localStorage (set by App.jsx when status is Non-aktif)
  // Also load saved credentials if "Remember Me" was checked
  useEffect(() => {
    const loginError = localStorage.getItem('loginError');
    if (loginError) {
      setError(loginError);
      localStorage.removeItem('loginError'); // Clear after showing
    }

    // Load saved credentials
    const remembered = localStorage.getItem('rememberMe') === 'true';
    if (remembered) {
      const email = localStorage.getItem('savedEmail') || '';
      const password = localStorage.getItem('savedPassword') || '';
      setSavedEmail(email);
      setSavedPassword(password);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const form = e.target;
    const email = form.username.value.trim();
    const password = form.password.value;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin" style="font-size: 18px; vertical-align: middle;">progress_activity</span> <span style="vertical-align: middle;">Memproses...</span>';
    btn.classList.add('opacity-80');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(handleError(authError, 'login'));
        btn.textContent = 'Sign in';
        btn.classList.remove('opacity-80');
        btn.disabled = false;
        return;
      }

      // Save credentials if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('savedPassword', password);
      } else {
        // Clear saved credentials if "Remember Me" is unchecked
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
      }

      // Login berhasil - tunggu sebentar untuk App.jsx check status
      // Jangan panggil onLogin() karena akan di-handle oleh auth state change
      setTimeout(() => {
        // Reset button state setelah 2 detik
        // Jika status Non-aktif, error sudah ditampilkan via localStorage
        btn.textContent = 'Sign in';
        btn.classList.remove('opacity-80');
        btn.disabled = false;
      }, 2000);
    } catch (err) {
      setError(handleError(err, 'login'));
      btn.textContent = 'Sign in';
      btn.classList.remove('opacity-80');
      btn.disabled = false;
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4 font-sans">
      {/* Main Login Card */}
      <main className="bg-white w-full max-w-md h-auto flex overflow-hidden shadow-2xl rounded-2xl">
        {/* Right Panel - Login Form */}
        <section className="flex-1 p-8 md:p-14 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto">
            {/* Brand Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <img 
                  src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjcSV7IWFroU8CkdVfLkDBLM5_-Cgs55QMT7652YgsGrL5n4L5aYExynIBv-WToLfFRJYMXhizKhYe-laxPNqCpW1LCNJx41Z76gFI0ja7V_AB3SwNJYnDHPCikDT4ap08BSJmX3a74gfabJvf0z2ADbX7GaalNkV3zzzjkQTPqhnpeiClC7sJP0Go2orBS/s320/Gemini_Generated_Image_t83gf8t83gf8t83g.jpg"
                  alt="Logo KPU"
                  className="h-24 w-auto object-contain"
                />
              </div>
              <h1 className="text-2xl !text-[25px] md:!text-2xl uppercase mb-0" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, letterSpacing: '0.08em' }}>
                <span style={{ color: '#3b82f6' }}>ARSIP</span>
                <span style={{ color: '#1f2937' }}> DIGITAL</span>
              </h1>
              <p className="text-xs font-medium text-gray-600 mb-10 !text-[13px] md:!text-xs">Divisi Rendatin - KPU Halmahera Utara</p>
            </div>

            {/* Header */}
            <div className="mb-2">
              <h2 className="text-[16px] !text-[16px] md:text-sm font-bold md:font-bold text-gray-500 mb-2">Sign in</h2>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-3 border-none bg-gray-100 rounded-lg focus:ring-2 focus:ring-[#1976d2] text-[16px] md:text-sm !text-[16px] md:!text-sm placeholder-gray-400 transition-all outline-none"
                  id="username"
                  name="username"
                  placeholder="User Name"
                  type="text"
                  defaultValue={savedEmail}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <input
                  className="block w-full pl-10 pr-16 py-3 border-none bg-gray-100 rounded-lg focus:ring-2 focus:ring-[#1976d2] text-[16px] md:text-sm !text-[16px] md:!text-sm placeholder-gray-400 transition-all outline-none"
                  id="password"
                  name="password"
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  defaultValue={savedPassword}
                  required
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[12px] !text-[12px] md:!text-[11px] font-bold text-gray-600 hover:text-blue-600"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>

              {/* Options: Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    className="h-4 w-4 text-[#1976d2] focus:ring-[#1976d2] border-gray-300 rounded" 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="text-[13px] !text-[13px] text-gray-600 font-medium">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-[13px] !text-[13px] md:text-xs text-gray-400 hover:text-[#1976d2] font-bold"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Main Sign In Button */}
              <button
                className="w-full bg-[#1976d2] text-white font-bold py-2.5 rounded-lg hover:bg-[#1565c0] transition-colors shadow-lg active:scale-[0.98] transform"
                type="submit"
              >
                Sign in
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400 !text-[13px] md:!text-xs">
                Don't have an account?{' '}
                <a className="text-gray-600 font-bold hover:underline" href="#">
                  Contact Admin
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <ForgotPasswordModal 
          supabase={supabase} 
          onClose={() => setShowForgotPasswordModal(false)} 
        />
      )}
    </div>
  );
}
