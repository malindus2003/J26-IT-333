import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Crown, 
  ChefHat, 
  CreditCard, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Sun, 
  Moon,
  Layers,
  Activity,
  Cpu,
  Check,
  ShoppingBag,
  Flame,
  Utensils,
  Package,
  Server,
  Zap,
  CheckCircle
} from 'lucide-react';

export const DEMO_CREDENTIALS = [
  {
    role: 'admin',
    name: 'System Administrator',
    email: 'admin@gmail.com',
    password: 'admin@123',
    title: 'Executive Admin & Operations Lead',
    shortRole: 'Executive Admin',
    description: 'Full access to all 7 modules, executive metrics, ML retraining, IoT gas telemetry, and inventory.',
    icon: Crown,
    iconColor: 'text-amber-500 dark:text-amber-400',
    accentColor: 'amber',
    badgeColor: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60',
    defaultModule: 'executive'
  },
  {
    role: 'staff',
    name: 'Kitchen Head Chef',
    email: 'kitchen@gmail.com',
    password: 'kitchen@123',
    title: 'Kitchen Operations & KDS Specialist',
    shortRole: 'Head Chef (KDS)',
    description: 'Live KDS cooking tickets, prep sheets, line station loads, perishable inventory, and spoilage warnings.',
    icon: ChefHat,
    iconColor: 'text-blue-500 dark:text-blue-400',
    accentColor: 'blue',
    badgeColor: 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700/60',
    defaultModule: 'kds'
  },
  {
    role: 'cashier',
    name: 'Front Counter Cashier',
    email: 'cashier@gmail.com',
    password: 'cashier@123',
    title: 'POS Menu & Table Orders Specialist',
    shortRole: 'Front Cashier (POS)',
    description: 'Front-of-house POS menu ordering, live table floor plan, and customer sales ledger.',
    icon: CreditCard,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    accentColor: 'emerald',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60',
    defaultModule: 'pos_menu'
  }
];

export default function LoginScreen({ onLoginSuccess, isDarkMode, onToggleTheme }) {
  // Check localStorage for remembered email
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('smart_restaurant_remember_email') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return Boolean(localStorage.getItem('smart_restaurant_remember_email'));
    } catch {
      return false;
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Input focus tracking for animated glows
  const [focusedField, setFocusedField] = useState(null);

  // Mouse coordinates for gentle parallax & spotlight effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check accessibility preference: prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const handler = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener?.('change', handler);
      return () => mediaQuery.removeEventListener?.('change', handler);
    }
  }, []);

  // Update mouse position with gentle throttling
  const handleMouseMove = useCallback((e) => {
    if (prefersReducedMotion) return;
    setMousePos({ x: e.clientX, y: e.clientY });
  }, [prefersReducedMotion]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedEmail || !trimmedPass) {
      setError('Please enter both your work email and password.');
      return;
    }

    setLoading(true);

    // Save or clear remember-me preference
    try {
      if (rememberMe) {
        localStorage.setItem('smart_restaurant_remember_email', trimmedEmail);
      } else {
        localStorage.removeItem('smart_restaurant_remember_email');
      }
    } catch {
      // ignore storage errors
    }

    try {
      // 1. Attempt backend authentication endpoint
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email: trimmedEmail,
        password: trimmedPass
      }, { timeout: 3500 });

      if (response.data && response.data.email) {
        setLoginSuccess(true);
        setTimeout(() => {
          onLoginSuccess({
            ...response.data,
            defaultModule: response.data.default_module || response.data.defaultModule || 'executive'
          });
        }, 500);
        return;
      }
    } catch (err) {
      // 2. Fallback to local verified credentials if backend is offline
      const localMatch = DEMO_CREDENTIALS.find(
        c => c.email.toLowerCase() === trimmedEmail && c.password === trimmedPass
      );

      if (localMatch) {
        setLoginSuccess(true);
        setTimeout(() => {
          onLoginSuccess({
            email: localMatch.email,
            name: localMatch.name,
            title: localMatch.title,
            role: localMatch.role,
            defaultModule: localMatch.defaultModule,
            authenticated_at: new Date().toISOString()
          });
        }, 500);
        return;
      }

      // Display actionable error message
      setError(
        err.response?.data?.detail || 
        'Invalid email or password. Please verify your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f4f7f5] text-slate-900'} relative flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden selection:bg-emerald-500 selection:text-white transition-colors duration-300`}
    >
      {/* Background Layer: Animated Gradient Orbs & Subtle Pattern */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Subtle Geometric Dot Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />

        {/* Dynamic Cursor Spotlight Effect */}
        {!prefersReducedMotion && (
          <div 
            className="absolute rounded-full transition-transform duration-300 ease-out pointer-events-none"
            style={{
              width: '560px',
              height: '560px',
              left: `${mousePos.x - 280}px`,
              top: `${mousePos.y - 280}px`,
              background: isDarkMode 
                ? 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.02) 50%, transparent 75%)'
                : 'radial-gradient(circle, rgba(16, 185, 129, 0.09) 0%, rgba(13, 148, 136, 0.03) 50%, transparent 75%)',
              filter: 'blur(35px)'
            }}
          />
        )}

        {/* Ambient Blurred Background Spheres */}
        <div className="absolute -top-36 -left-36 w-[36rem] h-[36rem] rounded-full bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent blur-[120px] animate-pulse-glow" />
        <div className="absolute -bottom-40 -right-36 w-[38rem] h-[38rem] rounded-full bg-gradient-to-tl from-emerald-600/12 via-blue-500/10 to-transparent blur-[130px] animate-pulse-glow" style={{ animationDelay: '2.5s' }} />
      </div>

      {/* Top Navigation Bar: Seamlessly Matches Header.jsx Brand */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 flex items-center justify-between">
        
        {/* Brand Logo with Live Telemetry Pulse */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 flex items-center justify-center shadow-md shadow-emerald-700/25 text-white font-black transition-transform hover:scale-105">
              <Activity className="h-5 w-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-950"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Smart Restaurant
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" /> AI & IoT Cloud Core
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:block">
              Intelligent Restaurant Operations & Freshness Platform
            </p>
          </div>
        </div>

        {/* Right Header Actions: Live Terminal Badge & Theme Toggle */}
        <div className="flex items-center gap-3">
          
          {/* Active Terminal Status Beacon */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-300">System Gateway: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">Online</strong></span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
            title={isDarkMode ? "Switch to Crisp Light Theme" : "Switch to Deep Dark Theme"}
            aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-90" />
            ) : (
              <Moon className="h-4 w-4 text-emerald-800 transition-transform duration-300 rotate-0 hover:-rotate-45" />
            )}
          </button>
        </div>

      </header>

      {/* Main Split-Screen Section */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 my-auto flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column (58% width on desktop): System Pillars & Capability Showcase */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 animate-fade-in">
            
            {/* Main Headline & Value Proposition */}
            <div className="space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-300 text-xs font-black tracking-wide shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Next-Generation Restaurant Operations OS</span>
              </div>

              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.16]">
                Intelligent Kitchen, POS & Quality Platform
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-medium">
                Unified restaurant intelligence combining high-speed POS table ordering, live Kitchen Display (KDS) tickets, automated food spoilage assessment, and smart waste diversion in one cohesive operating console.
              </p>
            </div>

            {/* 3 Real System Pillars (POS, KDS, Quality Intelligence) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              
              {/* Pillar 1: Front POS & Table Service */}
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-800 transition-all duration-200 group">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="h-4.5 w-4.5" />
                </div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-1">
                  POS & Orders
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Real-time menu ordering, dynamic table floor plans, and synchronized sales ledger.
                </p>
              </div>

              {/* Pillar 2: Kitchen Display System (KDS) */}
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-amber-300 dark:hover:border-amber-800 transition-all duration-200 group">
                <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Flame className="h-4.5 w-4.5" />
                </div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-1">
                  Kitchen KDS
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Live cooking tickets, prep sheets, station line balancing, and order speed tracking.
                </p>
              </div>

              {/* Pillar 3: Spoilage & Quality Assessment */}
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-200 group">
                <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Cpu className="h-4.5 w-4.5" />
                </div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-1">
                  AI Freshness
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Multi-modal food quality assessment, perishable inventory, and waste diversion.
                </p>
              </div>

            </div>

            {/* System Trust & Architecture Feature Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/70 backdrop-blur border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Sub-Second Terminal Response
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/70 backdrop-blur border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <Layers className="h-3.5 w-3.5 text-emerald-500" />
                Role-Based Console Access
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/70 backdrop-blur border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                Local & Cloud Synchronized
              </span>
            </div>

          </div>

          {/* Right Column (42% width on desktop): Modern Authentication Card */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
            
            <div className="relative rounded-3xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-2xl shadow-slate-300/40 dark:shadow-slate-950/80 space-y-6 transition-all duration-300 animate-slide-up">
              
              {/* Top Accent Gradient Line */}
              <div 
                className="absolute top-0 left-6 right-6 h-1 rounded-b-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-80" 
                aria-hidden="true" 
              />

              {/* Card Title & Intro */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Sign In to Terminal
                  </h2>
                  <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Enter your authorized credentials to access your operational console.
                </p>
              </div>

              {/* Error Banner with Animated Shake */}
              {error && (
                <div 
                  role="alert"
                  aria-live="assertive"
                  className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/70 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start gap-2.5 animate-shake shadow-xs"
                >
                  <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 leading-snug">{error}</div>
                </div>
              )}

              {/* Success Notification during transition */}
              {loginSuccess && (
                <div 
                  role="status"
                  aria-live="polite"
                  className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2.5 animate-fade-in shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div className="flex-1">Authentication verified. Launching operational console...</div>
                </div>
              )}

              {/* Main Login Form */}
              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                
                {/* Email Input Field with Animated Focus State */}
                <div className="space-y-1.5">
                  <label 
                    htmlFor="login-email"
                    className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 block"
                  >
                    Work Email Address
                  </label>

                  <div 
                    className={`relative rounded-2xl transition-all duration-200 border ${
                      focusedField === 'email'
                        ? 'border-emerald-500 ring-4 ring-emerald-500/15 bg-white dark:bg-slate-800/90 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className={`h-4 w-4 transition-colors duration-200 ${
                        focusedField === 'email' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                      }`} />
                    </div>
                    
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="name@restaurant.com"
                      required
                      aria-required="true"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-transparent text-slate-900 dark:text-white text-sm font-semibold focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password Input Field with Interactive Show/Hide Toggle */}
                <div className="space-y-1.5">
                  <label 
                    htmlFor="login-password"
                    className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 block"
                  >
                    Account Password
                  </label>

                  <div 
                    className={`relative rounded-2xl transition-all duration-200 border ${
                      focusedField === 'password'
                        ? 'border-emerald-500 ring-4 ring-emerald-500/15 bg-white dark:bg-slate-800/90 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className={`h-4 w-4 transition-colors duration-200 ${
                        focusedField === 'password' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                      }`} />
                    </div>
                    
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      required
                      aria-required="true"
                      className="w-full pl-10 pr-11 py-3 rounded-2xl bg-transparent text-slate-900 dark:text-white text-sm font-semibold focus:outline-none placeholder:text-slate-400 tracking-wider"
                    />

                    {/* Show/Hide Password Toggle with Animated Icon */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:text-emerald-600 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 transition-transform duration-200 scale-110" />
                      ) : (
                        <Eye className="h-4 w-4 transition-transform duration-200 scale-100" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 peer-checked:bg-emerald-600 peer-checked:border-emerald-600 flex items-center justify-center transition-all group-hover:border-emerald-400 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500">
                      <Check className={`h-3 w-3 text-white transition-opacity ${rememberMe ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                      Remember credentials on this workstation
                    </span>
                  </label>
                </div>

                {/* Submit Button with Loading State, Shimmer & Micro-Interactions */}
                <button
                  type="submit"
                  disabled={loading || loginSuccess}
                  className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:via-emerald-900 hover:to-teal-900 active:scale-[0.98] text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-700/25 dark:shadow-emerald-950/50 hover:shadow-emerald-700/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  {/* Subtle Shimmer Overlay on Hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating credentials...</span>
                    </>
                  ) : loginSuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                      <span>Access Granted</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 transition-transform group-hover:scale-110" />
                      <span>Sign In to Terminal</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Security & Access Notice */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <Server className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Enterprise Encrypted Terminal Session</span>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Clean Production Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60 mt-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-medium">
            Smart Restaurant Management System • Terminal Console
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            Real-Time POS, KDS & Food Quality Architecture
          </div>
        </div>
      </footer>

    </div>
  );
}
