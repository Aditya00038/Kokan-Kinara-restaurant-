import React, { useState } from 'react';
import { useAuth, detectRoleFromEmail } from '../../context/AuthContext';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ChefHat, 
  CreditCard, 
  Settings2, 
  UtensilsCrossed, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const { loginWithEmail, signupWithEmail, loginWithDemo, loginWithGoogle } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Real-time detection of which dashboard this email will navigate to
  const rolePreview = detectRoleFromEmail(email || 'customer.alex@gmail.com');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    let result;
    if (isRegister) {
      result = await signupWithEmail(email, password, fullName);
    } else {
      result = await loginWithEmail(email, password);
    }
    setIsLoading(false);

    if (result.success) {
      if (onAuthSuccess) onAuthSuccess(result.user);
      onClose();
    } else {
      setErrorMsg(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleDemoSelect = (demoType) => {
    const user = loginWithDemo(demoType);
    if (onAuthSuccess) onAuthSuccess(user);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const result = await loginWithGoogle();
    setIsLoading(false);
    if (result.success) {
      if (onAuthSuccess) onAuthSuccess(result.user);
      onClose();
    } else {
      // Fallback to customer demo
      handleDemoSelect('customer');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30">
            <UtensilsCrossed size={24} className="text-slate-950" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-white">
            {isRegister ? 'Create Your Account' : 'Welcome to Kokan Kinara'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Sign in with your Gmail to be routed directly to your department's dashboard.
          </p>
        </div>

        {/* 1-Click Role Direct Launchers */}
        <div className="mb-6 bg-slate-950/70 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles size={13} /> Quick Test: Choose a Staff Gmail
            </span>
            <span className="text-[10px] text-slate-500">Auto-routes to dashboard</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoSelect('kitchen')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/40 text-left transition-all group"
            >
              <div className="flex items-center gap-2 font-bold text-white group-hover:text-rose-400">
                <ChefHat size={16} className="text-rose-400" />
                <span>Kitchen Staff</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                chef.mario@gmail.com
              </div>
              <div className="text-[9px] text-rose-400 mt-1 font-semibold flex items-center gap-1">
                <ArrowRight size={10} />
                <span>Opens Kitchen KDS</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('cashier')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-blue-500/15 border border-white/10 hover:border-blue-500/40 text-left transition-all group"
            >
              <div className="flex items-center gap-2 font-bold text-white group-hover:text-blue-400">
                <CreditCard size={16} className="text-blue-400" />
                <span>Cashier Desk</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                cashier.lisa@gmail.com
              </div>
              <div className="text-[9px] text-blue-400 mt-1 font-semibold flex items-center gap-1">
                <ArrowRight size={10} />
                <span>Opens POS Billing</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('system')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-left transition-all group"
            >
              <div className="flex items-center gap-2 font-bold text-white group-hover:text-emerald-400">
                <Settings2 size={16} className="text-emerald-400" />
                <span>System Admin</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                admin.robert@gmail.com
              </div>
              <div className="text-[9px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                <ArrowRight size={10} />
                <span>Opens System Engine</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('customer')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 text-left transition-all group"
            >
              <div className="flex items-center gap-2 font-bold text-white group-hover:text-amber-400">
                <UtensilsCrossed size={16} className="text-amber-400" />
                <span>Dining Customer</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                customer.alex@gmail.com
              </div>
              <div className="text-[9px] text-amber-400 mt-1 font-semibold flex items-center gap-1">
                <ArrowRight size={10} />
                <span>Opens Online Menu</span>
              </div>
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-slate-900 px-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Or Sign In With Custom Email
          </span>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Chef Gordon Ramsay"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-300">
                Gmail / Email Address
              </label>
              {email && (
                <span className="text-[10px] text-amber-400 font-semibold">
                  Detected: <strong>{rolePreview.label}</strong>
                </span>
              )}
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="you@gmail.com (include 'chef', 'cashier', or 'admin')"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Smart Redirection Notice */}
            {email && (
              <div className="mt-2 p-2 rounded-lg bg-white/5 text-[11px] text-slate-300 flex items-center justify-between border border-white/5">
                <span>Destination Dashboard:</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  {rolePreview.label} ({rolePreview.defaultView.toUpperCase()})
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 text-xs font-extrabold shadow-lg shadow-amber-500/20 mt-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>{isRegister ? 'Sign Up & Enter Dashboard' : 'Sign In & Redirect'}</span>
                <ArrowRight size={15} />
              </span>
            )}
          </button>
        </form>

        {/* Google Sign In option */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google Account</span>
          </button>
        </div>

        {/* Switch Mode */}
        <div className="text-center mt-5 text-xs text-slate-400">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-amber-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-amber-400 font-bold hover:underline"
              >
                Register
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
