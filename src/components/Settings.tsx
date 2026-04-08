import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  Smartphone,
  ChevronRight,
  Save,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Camera,
  Palette,
  Sun,
  Monitor
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const { profile, updateProfile, resetPassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setLocation(profile.location || '');
      setPhoneNumber(profile.phoneNumber || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError('');
    try {
      await updateProfile({
        displayName,
        location,
        phoneNumber
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!profile?.email) return;
    setIsSaving(true);
    setError('');
    try {
      await resetPassword(profile.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Manage your account preferences and security.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Tabs */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-[2.5rem] p-3 border border-slate-100 shadow-sm space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${
                    activeTab === tab.id 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm"
            >
              {activeTab === 'profile' && (
                <div className="space-y-10">
                  <div className="flex flex-col sm:flex-row items-center gap-8 pb-10 border-b border-slate-50">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 border-4 border-white shadow-2xl overflow-hidden transition-transform duration-500 group-hover:scale-105">
                        {profile?.photoURL ? (
                          <img src={profile.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User size={48} />
                        )}
                      </div>
                      <button className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-xl border border-slate-100 text-slate-600 hover:text-indigo-600 transition-all hover:scale-110">
                        <Camera size={20} />
                      </button>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-2xl font-black text-slate-900">Profile Photo</h3>
                      <p className="text-slate-500 mt-2 max-w-xs">Update your avatar and personal branding for the platform.</p>
                      <button className="mt-4 text-sm font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all">Upload New Image</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                      <input 
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-slate-900 text-lg"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          value={profile?.email || ''}
                          disabled
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.5rem] font-bold text-slate-400 cursor-not-allowed text-lg"
                        />
                        <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                      <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-slate-900 text-lg"
                        placeholder="New York, USA"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <input 
                        type="tel" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-slate-900 text-lg"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="pt-10 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      {saveSuccess && (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-emerald-600 font-bold"
                        >
                          <CheckCircle2 size={20} />
                          Changes saved successfully!
                        </motion.div>
                      )}
                      {error && (
                        <div className="flex items-center gap-2 text-red-500 font-bold">
                          <AlertCircle size={20} />
                          {error}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-10">
                  <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex items-center gap-5 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-200">
                          <Lock size={28} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Password Management</h3>
                      </div>
                      <p className="text-slate-500 font-medium mb-10 max-w-md text-lg leading-relaxed">
                        Secure your account by updating your password. We'll send a secure link to your email.
                      </p>
                      <button 
                        onClick={handlePasswordReset}
                        disabled={isSaving || resetSent}
                        className={`px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm ${resetSent ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : ''}`}
                      >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : resetSent ? <CheckCircle2 size={18} /> : <Mail size={18} />}
                        {resetSent ? 'Email Sent!' : 'Send Reset Link'}
                      </button>
                    </div>
                    <Shield className="absolute -right-12 -bottom-12 text-indigo-500/5 group-hover:scale-110 transition-transform duration-1000" size={280} />
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-900">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-indigo-100 transition-colors">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <Smartphone size={24} />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-900">Authenticator App</p>
                          <p className="text-sm text-slate-500">Use apps like Google Authenticator or Authy.</p>
                        </div>
                      </div>
                      <button className="px-6 py-3 bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-red-50">
                    <h3 className="text-2xl font-black text-red-600 mb-6">Danger Zone</h3>
                    <div className="p-10 bg-red-50 border border-red-100 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div>
                        <p className="text-xl font-bold text-red-900">Delete Account</p>
                        <p className="text-red-600/70 font-medium mt-2 max-w-md">Once you delete your account, all your data will be permanently removed. This action cannot be undone.</p>
                      </div>
                      <button className="px-8 py-4 bg-red-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-100">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-10">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-8">Notification Preferences</h3>
                    <div className="space-y-4">
                      {[
                        { id: 'email', label: 'Email Notifications', desc: 'Receive updates via email about account activity.' },
                        { id: 'security', label: 'Security Alerts', desc: 'Get notified about login attempts and security events.' },
                        { id: 'updates', label: 'Product Updates', desc: 'Stay informed about new features and improvements.' }
                      ].map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white transition-all">
                          <div>
                            <p className="text-lg font-bold text-slate-900">{item.label}</p>
                            <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                          </div>
                          <button 
                            className={`w-14 h-7 rounded-full transition-all relative ${index === 0 || index === 1 ? 'bg-indigo-600' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${index === 0 || index === 1 ? 'left-8' : 'left-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

