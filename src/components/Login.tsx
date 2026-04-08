import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock as LockIcon, AlertCircle, Loader2, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logActivity, createNotification } from '../utils/activityLogger';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user) {
        await logActivity(result.user.uid, result.user.displayName || email, 'Logged in via Email', 'login');
        await createNotification(result.user.uid, 'New Login', 'You have successfully logged in via Email.', 'success');
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked') {
        setError('The sign-in popup was blocked by your browser. Please allow popups for this site or try opening the app in a new tab.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        setError(`This domain (${currentDomain}) is not authorized in your Firebase Console. Please go to Authentication > Settings > Authorized domains and add "${currentDomain}" to the list.`);
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full mx-auto"
        >
          <div className="mb-12">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200">
              <LogIn size={24} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-500 font-medium">Enter your details to access your account.</p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 px-4 border border-slate-200 rounded-2xl bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-slate-400 font-black uppercase tracking-widest">Or continue with email</span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start space-x-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </motion.div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-slate-900 font-bold placeholder:text-slate-300"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2 ml-1">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                    <button type="button" className="text-xs font-bold text-indigo-600 hover:underline">Forgot password?</button>
                  </div>
                  <div className="relative group">
                    <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-slate-900 font-bold placeholder:text-slate-300"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-indigo-600 hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Visual */}
      <div className="hidden lg:flex flex-1 bg-slate-50 items-center justify-center p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-lg w-full aspect-square bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-white"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-indigo-600 mb-8">
              <Shield size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Secure Authentication</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Experience the next generation of identity management with our robust and secure authentication system.
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-12 left-12 w-12 h-12 bg-indigo-100 rounded-full blur-2xl" />
          <div className="absolute bottom-12 right-12 w-24 h-24 bg-purple-100 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </div>
  );
}

