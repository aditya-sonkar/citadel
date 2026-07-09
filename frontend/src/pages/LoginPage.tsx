import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/axios';
import { useTheme } from '../components/ThemeProvider';
import Background from '../components/landing/Background';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data.data || response.data || {};

      if (accessToken) localStorage.setItem('citadel_token', accessToken);
      if (refreshToken) localStorage.setItem('citadel_refresh_token', refreshToken);
      if (user) localStorage.setItem('citadel_user', JSON.stringify(user));

      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Authentication failed. Please check your credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-sans text-black dark:text-white bg-[#fafafa] dark:bg-[#0A0E17] selection:bg-white/10 antialiased transition-colors duration-1000 relative overflow-hidden">

      {/* ── Global Animated Background ── */}
      <Background />

      {/* Header */}
      <header className="w-full z-10 px-6 py-6 md:px-[30px] md:pt-[30px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 select-none text-black dark:text-white">
          <svg className="w-4 h-4 text-black dark:text-white shrink-0" viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50,10 65,25 50,40 35,25" />
            <polygon points="50,60 65,75 50,90 35,75" />
            <polygon points="25,35 40,50 25,65 10,50" />
            <polygon points="75,35 90,50 75,65 60,50" />
          </svg>
          <span className="text-[12px] font-extrabold tracking-[0.2em] uppercase pt-0.5">CITADEL</span>
        </Link>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center w-[34px] h-[34px] border border-black/10 dark:border-white/10 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 transition-all cursor-pointer select-none"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </button>
          <Link 
            to="/"
            className="text-[9px] font-mono tracking-[0.18em] uppercase text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10 px-4 py-2 hover:border-black/30 dark:hover:border-white/30 transition-colors h-[34px] flex items-center justify-center"
          >
            BACK TO SITE
          </Link>
        </div>
      </header>

      {/* Main card */}
      <main className="z-10 flex-grow flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.98 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white/80 dark:bg-[#1a1a1a]/40 backdrop-blur-md border border-black/10 dark:border-white/[0.05] rounded-sm p-8 md:p-10 w-full max-w-[400px] shadow-2xl transition-colors duration-1000"
        >

          {/* Title */}
          <div className="flex flex-col items-center mb-8 text-center">
            <span className="text-[9px] font-mono tracking-[0.2em] text-black/40 dark:text-white/30 uppercase mb-2">SECURE PORTAL</span>
            <h2 className="font-extrabold uppercase tracking-tight text-2xl md:text-3xl text-black dark:text-white">
              Sign In
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-3 text-[11px] font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-sm leading-relaxed text-left flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[9px] font-mono tracking-widest text-black/50 dark:text-white/40 uppercase">Email Address</label>
              <input
                id="email"
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2.5 text-xs bg-transparent border border-black/10 dark:border-white/[0.08] focus:border-black dark:focus:border-white rounded-sm text-black dark:text-white placeholder-black/35 dark:placeholder-white/20 focus:outline-none focus:ring-0 transition-all font-mono"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[9px] font-mono tracking-widest text-black/50 dark:text-white/40 uppercase">Password</label>
                <a href="#forgot" className="text-[9px] font-mono tracking-widest text-black/40 dark:text-white/30 uppercase hover:text-black dark:hover:text-white transition-colors">FORGOT PASSWORD?</a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 pr-10 py-2.5 text-xs bg-transparent border border-black/10 dark:border-white/[0.08] focus:border-black dark:focus:border-white rounded-sm text-black dark:text-white placeholder-black/35 dark:placeholder-white/20 focus:outline-none focus:ring-0 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/45 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full flex items-center justify-center py-3 border border-black dark:border-white text-[10px] font-mono tracking-widest text-white dark:text-black bg-black dark:bg-white rounded-sm hover:bg-transparent dark:hover:bg-transparent hover:text-black dark:hover:text-white transition-colors cursor-pointer uppercase"
            >
              {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-8 text-center text-[10px] font-mono tracking-widest uppercase text-black/40 dark:text-white/30">
            Don't have an account?{' '}
            <Link to="/signup" className="text-black dark:text-white font-bold hover:underline transition-colors">
              CREATE ACCOUNT
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full z-10 px-6 pb-6 md:px-[30px] md:pb-[30px] flex items-center justify-between text-[9px] font-mono tracking-[0.18em] text-black/30 dark:text-white/20 uppercase">
        <span>© {new Date().getFullYear()} Citadel Platform.</span>
        <div className="flex gap-4">
          <a href="https://github.com" className="hover:text-black dark:hover:text-white transition-colors">GitHub</a>
          <a href="https://linkedin.com" className="hover:text-black dark:hover:text-white transition-colors">LinkedIn</a>
        </div>
      </footer>

    </div>
  );
};

export default LoginPage;
