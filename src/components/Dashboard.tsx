import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import Layout from './Layout';
import { 
  User, 
  Shield, 
  Calendar, 
  Clock, 
  ArrowUpRight, 
  Activity, 
  Zap, 
  Star,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Globe,
  Search,
  X,
  Filter,
  TrendingUp,
  PieChart as PieChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ActivityLog, OperationType } from '../types';
import { handleFirestoreError } from '../utils/firestoreErrorHandler';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard() {
  const { profile } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [fullHistory, setFullHistory] = useState<ActivityLog[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for charts
  const trendData = [
    { name: 'Mon', logins: 4 },
    { name: 'Tue', logins: 7 },
    { name: 'Wed', logins: 5 },
    { name: 'Thu', logins: 12 },
    { name: 'Fri', logins: 8 },
    { name: 'Sat', logins: 15 },
    { name: 'Sun', logins: 10 },
  ];

  const deviceData = [
    { name: 'Desktop', value: 65, color: '#6366f1' },
    { name: 'Mobile', value: 25, color: '#f59e0b' },
    { name: 'Tablet', value: 10, color: '#10b981' },
  ];

  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'activity_logs'),
      where('userId', '==', profile.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ActivityLog)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'activity_logs'));

    return () => unsubscribe();
  }, [profile?.uid]);

  const fetchFullHistory = async () => {
    if (!profile?.uid) return;
    try {
      const q = query(
        collection(db, 'activity_logs'),
        where('userId', '==', profile.uid),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      setFullHistory(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ActivityLog)));
      setShowHistoryModal(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'activity_logs');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const stats = [
    { label: 'Account Status', value: profile?.status || 'Active', icon: Shield, color: 'emerald' },
    { label: 'Security Level', value: 'High', icon: Zap, color: 'amber' },
    { label: 'Profile Strength', value: '85%', icon: Star, color: 'indigo' },
  ];

  const filteredHistory = fullHistory.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-10">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">
              Welcome back, <span className="text-indigo-600">{profile?.displayName?.split(' ')[0]}</span>! 👋
            </h1>
            <p className="text-slate-500 font-medium mt-3 text-lg">Here's a snapshot of your account activity and security status.</p>
          </motion.div>
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm group"
            >
              View Profile
              <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Visual Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Login Trends</h3>
              </div>
              <select className="bg-slate-50 border-none rounded-xl text-xs font-bold px-4 py-2 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid #f1f5f9', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: '#ffffff',
                      color: '#0f172a'
                    }}
                    itemStyle={{ color: '#6366f1', fontWeight: 700 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="logins" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorLogins)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <PieChartIcon size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Device Usage</h3>
            </div>
            <div className="h-[250px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid #f1f5f9', 
                      backgroundColor: '#ffffff', 
                      color: '#0f172a',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-6">
              {deviceData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Overview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Account Overview</h3>
              <Link to="/settings" className="px-5 py-2.5 bg-indigo-50 text-indigo-600 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-indigo-100 transition-all">Edit Details</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-lg font-bold text-slate-900">{profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-lg font-bold text-slate-900">{profile?.phoneNumber || 'Not linked'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                    <p className="text-lg font-bold text-slate-900">{profile?.location || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Since</p>
                    <p className="text-lg font-bold text-slate-900">{formatDate(profile?.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-slate-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                    <Zap size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">Security Checkup</p>
                    <p className="text-sm text-slate-500">Your account security is optimal. No actions required.</p>
                  </div>
                </div>
                <button className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">
                  Review Security
                </button>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col"
          >
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-10">Recent Activity</h3>
            <div className="flex-1 space-y-8">
              {activities.length > 0 ? activities.map((activity, i) => (
                <div key={activity.id} className="flex gap-5 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Activity size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 leading-tight truncate">{activity.action}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                      {activity.timestamp ? new Date(activity.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Clock className="text-slate-200 mb-6" size={64} />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No recent activity found</p>
                </div>
              )}
            </div>
            <button 
              onClick={fetchFullHistory}
              className="mt-10 w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3"
            >
              View Full History
              <ChevronRight size={16} />
            </button>
          </motion.div>
        </div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-3xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Activity History</h2>
                  <p className="text-slate-500 font-medium mt-1">A detailed log of all your account events.</p>
                </div>
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center gap-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search history..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  />
                </div>
                <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm">
                  <Filter size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                {filteredHistory.length > 0 ? filteredHistory.map((log, i) => (
                  <div key={log.id} className="flex gap-6 group">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      log.type === 'login' ? 'bg-emerald-50 text-emerald-600' :
                      log.type === 'security' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-50 text-slate-400'
                    }`}>
                      <Activity size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <p className="text-base font-bold text-slate-900 truncate">{log.action}</p>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                          {log.timestamp ? new Date(log.timestamp.toDate()).toLocaleString() : 'Just now'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Globe size={12} /> {log.location || 'Unknown'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {log.device || 'Unknown Device'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          IP: {log.ip || 'Hidden'}
                        </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20">
                    <Clock className="text-slate-100 mx-auto mb-6" size={80} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No records found matching your search</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}




