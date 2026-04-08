import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  MapPin, 
  Phone, 
  Globe, 
  FileText,
  Edit3
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { profile } = useAuth();

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const infoItems = [
    { label: 'Email Address', value: profile?.email, icon: Mail },
    { label: 'Phone Number', value: profile?.phoneNumber || 'Not provided', icon: Phone },
    { label: 'Location', value: profile?.location || 'Not provided', icon: MapPin },
    { label: 'Website', value: profile?.website || 'Not provided', icon: Globe, isLink: true },
  ];

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl shadow-indigo-100 border border-slate-100 -mb-2 relative z-10"
          >
            <div className="w-full h-full rounded-[1.25rem] bg-indigo-50 flex items-center justify-center text-indigo-600 text-4xl font-black border border-indigo-100 overflow-hidden">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                profile?.displayName?.charAt(0).toUpperCase()
              )}
            </div>
          </motion.div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profile?.displayName}</h1>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                profile?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {profile?.role}
              </span>
              <span className="text-slate-400 text-sm font-medium flex items-center gap-1">
                <Calendar size={14} />
                Joined {formatDate(profile?.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <Link
          to="/settings"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Edit3 size={18} />
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Bio Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="text-indigo-500" size={20} />
              About Me
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {profile?.bio || "No bio provided yet. Head over to settings to tell us about yourself!"}
            </p>
          </motion.div>

          {/* Contact Info Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {infoItems.map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <item.icon size={14} />
                    {item.label}
                  </p>
                  {item.isLink && item.value !== 'Not provided' ? (
                    <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:underline block truncate">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-slate-800 font-semibold truncate">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          {/* Account Security Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm"
          >
            <Shield className="text-indigo-600 mb-6" size={40} />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Account Security</h3>
            <p className="text-slate-500 text-sm mb-6">Your account is protected with industry-standard encryption and security protocols.</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Two-Factor Auth</span>
                <span className="text-emerald-600 font-bold">Enabled</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Last Password Change</span>
                <span className="text-slate-700 font-medium">3 months ago</span>
              </div>
            </div>
          </motion.div>

          {/* User ID Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm"
          >
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">System Identifier</h3>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-mono text-slate-500 break-all">{profile?.uid}</p>
            </div>
            <p className="text-xs text-slate-400 mt-4 italic text-center">This is your unique system ID.</p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

