import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup' | 'reset';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        if (!name.trim()) throw new Error("Name is required");
        await signUpWithEmail(email, password, name);
        onClose();
      } else if (mode === 'reset') {
        await resetPassword(email);
        setSuccess("Password reset email sent!");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="bg-red-500/20 p-2 rounded-lg text-red-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Join Veritas' : 'Reset Password'}
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-400 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Peter Parker"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="spidey@veritas.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-medium text-slate-400">Password</label>
                    {mode === 'signin' && (
                      <button 
                        type="button"
                        onClick={() => setMode('reset')}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl font-semibold transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>

            <div className="mt-8 text-center text-sm text-slate-500">
              {mode === 'signin' ? (
                <>
                  New to Veritas?{' '}
                  <button onClick={() => setMode('signup')} className="text-red-400 hover:text-red-300 font-medium">
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setMode('signin')} className="text-red-400 hover:text-red-300 font-medium">
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
