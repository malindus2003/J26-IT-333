import React, { useState } from 'react';
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
  Cpu
} from 'lucide-react';

export const DEMO_CREDENTIALS = [
  {
    role: 'admin',
    name: 'System Administrator',
    email: 'admin@gmail.com',
    password: 'admin@123',
    title: 'Executive Admin & Operations Lead',
    description: 'Full access to all 7 modules, executive metrics, ML retraining, IoT gas telemetry, and inventory.',
    icon: <Crown className="h-5 w-5 text-amber-500" />,
    badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    defaultModule: 'executive'
  },
  {
    role: 'staff',
    name: 'Kitchen Head Chef',
    email: 'kitchen@gmail.com',
    password: 'kitchen@123',
    title: 'Kitchen Operations & KDS Specialist',
    description: 'Live KDS cooking tickets, prep sheets, line station loads, perishable inventory, and spoilage warnings.',
    icon: <ChefHat className="h-5 w-5 text-blue-500" />,
    badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    defaultModule: 'kds'
  },
  {
    role: 'cashier',
    name: 'Front Counter Cashier',
    email: 'cashier@gmail.com',
    password: 'cashier@123',
    title: 'POS Menu & Table Orders Specialist',
    description: 'Front-of-house POS menu ordering, live table floor plan, and customer sales ledger.',
    icon: <CreditCard className="h-5 w-5 text-emerald-500" />,
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    defaultModule: 'pos_menu'
  }
];

export default function LoginScreen({ onLoginSuccess, isDarkMode, onToggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedEmail || !trimmedPass) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      // Try backend authentication endpoint
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email: trimmedEmail,
        password: trimmedPass
      });

      if (response.data && response.data.email) {
        onLoginSuccess(response.data);
        return;
      }
    } catch (err) {
      // If backend call fails or backend is offline, verify locally with exact credentials
      const localMatch = DEMO_CREDENTIALS.find(
        c => c.email.toLowerCase() === trimmedEmail && c.password === trimmedPass
      );

      if (localMatch) {
        onLoginSuccess({
          email: localMatch.email,
          name: localMatch.name,
          title: localMatch.title,
          role: localMatch.role,
          defaultModule: localMatch.defaultModule,
          authenticated_at: new Date().toISOString()
        });
        return;
      }

      setError(
        err.response?.data?.detail || 
        'Invalid email or password. Please verify your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col justify-center items-center px-4 py-8 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden transition-colors duration-200`}>
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      {/* Top Navbar with Theme Toggle */}
      <header className="absolute top-4 right-4 z-20">
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:scale-105 transition-all"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-emerald-800" />}
        </button>
      </header>

      <div className="w-full max-w-xl z-10 space-y-6">
        
        {/* Main Login Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6">
          
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-300 text-xs font-black tracking-wide shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              SLIIT IT4010 Research Project • J26-IT-333
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Smart Restaurant Management System
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
              Component 3: Multi-Modal Food Spoilage & Quality Assessment with Integrated POS, KDS & Waste Tracking
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-start gap-2.5 animate-shake">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-slate-400 lowercase font-medium">e.g. admin@gmail.com</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter authorized email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Password</span>
                <span className="text-[10px] text-slate-400 lowercase font-medium">e.g. admin@123</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-extrabold text-sm transition-all shadow-md shadow-emerald-700/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Sign In to System</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer Research Context */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <div>SLIIT Faculty of Computing • IT4010 Research Project 2026</div>
          <div className="text-[11px] text-slate-400">
            Supervisor: Dr. Kaushalya Dissanayake • Component 3: Maddumage M. S (IT23348820)
          </div>
        </div>

      </div>

    </div>
  );
}
