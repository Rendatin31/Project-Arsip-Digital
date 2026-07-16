import { useState, useEffect } from 'react';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function LoginPage({ onLogin, supabase }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Check for error from localStorage (set by App.jsx when status is Non-aktif)
  useEffect(() => {
    const loginError = localStorage.getItem('loginError');
    if (loginError) {
      setError(loginError);
      localStorage.removeItem('loginError'); // Clear after showing
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
        setError(authError.message || 'Login gagal');
        btn.textContent = 'Sign in';
        btn.classList.remove('opacity-80');
        btn.disabled = false;
        return;
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
      setError('Terjadi kesalahan koneksi');
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
                  src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgu_EbB69kzEOFcCHDgvQZObh43Q6Q6kpt_aUOoHI_L5y9I8elULeWuKl89zDQKuJFTcY3M_SHWYevzonb06bnNBDIEYWbAZSS3mBNsUTwMxRW2HCpM7fryALmjZLSlJpFk9sQ1POTpYRBd3IE_T3Pd5QjwAhzSv-SZz1a_JK5IwZLpoPhHMa_vw6r939JY/s320/Untitled_design__2_-removebg-preview%20(1).png"
                  alt="Logo KPU"
                  className="h-18 w-auto object-contain"
                />
              </div>
              <h1 className="text-2xl uppercase text-gray-800 mb-0" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, letterSpacing: '0.08em' }}>ARSIP DIGITAL</h1>
              <p className="text-xs font-medium text-gray-600 mb-10">Divisi Rendatin - KPU Halmahera Utara</p>
            </div>

            {/* Header */}
            <div className="mb-2">
              <h2 className="text-sm font-medium text-gray-800 mb-2">Sign in</h2>
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
                  className="block w-full pl-10 pr-3 py-3 border-none bg-gray-100 rounded-lg focus:ring-2 focus:ring-[#006c49] text-sm placeholder-gray-400 transition-all outline-none"
                  id="username"
                  name="username"
                  placeholder="User Name"
                  type="text"
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
                  className="block w-full pl-10 pr-16 py-3 border-none bg-gray-100 rounded-lg focus:ring-2 focus:ring-[#006c49] text-sm placeholder-gray-400 transition-all outline-none"
                  id="password"
                  name="password"
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-bold text-gray-600 hover:text-blue-600"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>

              {/* Options: Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input className="h-4 w-4 text-[#006c49] focus:ring-[#006c49] border-gray-300 rounded" type="checkbox" />
                  <span className="text-gray-600 font-medium">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-gray-400 hover:text-[#006c49] font-bold"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Main Sign In Button */}
              <button
                className="w-full bg-[#006c49] text-white font-bold py-3.5 rounded-lg hover:bg-[#005236] transition-colors shadow-lg active:scale-[0.98] transform"
                type="submit"
              >
                Sign in
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400">
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
