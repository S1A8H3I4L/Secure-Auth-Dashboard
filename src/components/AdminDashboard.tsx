import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  limit,
  where,
  getDocs
} from 'firebase/firestore';
import Layout from './Layout';
import { 
  Users, 
  UserPlus, 
  Download, 
  RefreshCw, 
  Search, 
  Shield, 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Activity,
  AlertTriangle,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Mail,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { UserProfile, ActivityLog, OperationType } from '../types';
import { handleFirestoreError } from '../utils/firestoreErrorHandler';
import { createNotification, logActivity } from '../utils/activityLogger';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Mock data for charts
  const trafficData = [
    { name: '00:00', value: 400 },
    { name: '04:00', value: 300 },
    { name: '08:00', value: 900 },
    { name: '12:00', value: 1200 },
    { name: '16:00', value: 1500 },
    { name: '20:00', value: 800 },
    { name: '23:59', value: 500 },
  ];

  const deviceData = [
    { name: 'Desktop', value: 65 },
    { name: 'Mobile', value: 25 },
    { name: 'Tablet', value: 10 },
  ];

  useEffect(() => {
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const logsQuery = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(10));

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));

    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      setActivityLogs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ActivityLog)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'activity_logs'));

    return () => {
      unsubscribeUsers();
      unsubscribeLogs();
    };
  }, []);

  const toggleUserRole = async (userId: string, currentRole: string) => {
    if (userId === profile?.uid) {
      alert("You cannot change your own role.");
      return;
    }
    setActionLoading(userId);
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      
      await createNotification(
        userId, 
        'Role Updated', 
        `An administrator has updated your role to ${newRole}.`, 
        'info'
      );
      
      await logActivity(
        profile?.uid || 'system', 
        profile?.displayName || 'Admin', 
        `Changed role of user ${userId} to ${newRole}`, 
        'security'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    if (userId === profile?.uid) {
      alert("You cannot ban yourself.");
      return;
    }
    setActionLoading(userId);
    try {
      const newStatus = currentStatus === 'active' ? 'banned' : 'active';
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { status: newStatus });
      
      await createNotification(
        userId, 
        newStatus === 'banned' ? 'Account Banned' : 'Account Restored', 
        newStatus === 'banned' 
          ? 'Your account has been suspended by an administrator.' 
          : 'Your account has been restored by an administrator.', 
        newStatus === 'banned' ? 'error' : 'success'
      );

      await logActivity(
        profile?.uid || 'system', 
        profile?.displayName || 'Admin', 
        `${newStatus === 'banned' ? 'Banned' : 'Restored'} user ${userId}`, 
        'security'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === profile?.uid) {
      alert("You cannot delete your own account from here.");
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setActionLoading(userId);
    try {
      await deleteDoc(doc(db, 'users', userId));
      await logActivity(
        profile?.uid || 'system', 
        profile?.displayName || 'Admin', 
        `Deleted user ${userId}`, 
        'security'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'indigo', trend: '+12%', up: true },
    { label: 'Active Sessions', value: Math.floor(users.length * 0.4), icon: Activity, color: 'emerald', trend: '+5%', up: true },
    { label: 'Failed Logins', value: 24, icon: AlertTriangle, color: 'amber', trend: '-8%', up: false },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200 shrink-0">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="w-full h-full object-cover rounded-[2rem]" referrerPolicy="no-referrer" />
              ) : (
                <Shield size={32} />
              )}
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Command Center</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-500 font-medium">Welcome back,</span>
                <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">{profile?.displayName}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-indigo-100">
                  {profile?.role === 'admin' ? 'Super Admin' : profile?.role}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-3 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
              <Download size={20} />
              Export Logs
            </button>
            <button className="flex items-center gap-3 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              <UserPlus size={20} />
              Add New User
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all"
            >
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={28} />
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-black ${stat.up ? 'text-emerald-600' : 'text-amber-600'} bg-${stat.up ? 'emerald' : 'amber'}-50 px-3 py-1.5 rounded-xl`}>
                  {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.trend}
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-4xl font-black text-slate-900 mt-2">{stat.value}</h3>
              </div>
              <div className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${stat.color}-50/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500`} />
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Traffic Trends */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Traffic Trends</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-2">Sign-ins over the last 24 hours</p>
              </div>
              <select className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option>Today</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} 
                    dy={15} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} 
                  />
                  <Tooltip 
                    contentStyle={{
                      borderRadius: '20px', 
                      border: '1px solid #f1f5f9', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                      padding: '16px',
                      backgroundColor: '#ffffff',
                      color: '#0f172a'
                    }}
                    itemStyle={{fontWeight: 800, color: '#6366f1'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6366f1" 
                    strokeWidth={5} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Device Breakdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col"
          >
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-10">Device Breakdown</h3>
            <div className="flex-1 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    innerRadius={75}
                    outerRadius={100}
                    paddingAngle={10}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid #f1f5f9', 
                      backgroundColor: '#ffffff', 
                      color: '#0f172a',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-slate-900">100%</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Traffic</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-10">
              {deviceData.map((item, i) => (
                <div key={item.name} className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-lg font-black text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Management Table */}
          <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-2">Manage permissions and account status</p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all w-full md:w-72"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Role</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Seen</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-base border border-indigo-100 overflow-hidden shrink-0">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              user.displayName?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-slate-900 truncate">{user.displayName}</span>
                            <span className="text-xs text-slate-400 font-medium truncate">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${user.status === 'banned' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                          <span className={`text-xs font-black uppercase tracking-widest ${user.status === 'banned' ? 'text-red-600' : 'text-emerald-600'}`}>
                            {user.status === 'banned' ? 'Banned' : 'Active'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs text-slate-500 font-bold">
                          {user.lastLogin ? new Date(user.lastLogin.toDate()).toLocaleDateString() : 'Never'}
                        </span>
                      </td>
                      <td className="px-10 py-5 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleUserRole(user.uid, user.role)}
                            disabled={actionLoading === user.uid}
                            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Toggle Role"
                          >
                            {actionLoading === user.uid ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />}
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.uid, user.status || 'active')}
                            disabled={actionLoading === user.uid}
                            className={`p-2.5 transition-all rounded-xl ${
                              user.status === 'banned' 
                                ? 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50' 
                                : 'text-amber-400 hover:text-amber-600 hover:bg-amber-50'
                            }`}
                            title={user.status === 'banned' ? 'Unban' : 'Ban'}
                          >
                            {actionLoading === user.uid ? <Loader2 className="animate-spin" size={20} /> : (user.status === 'banned' ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />)}
                          </button>
                          <button
                            onClick={() => deleteUser(user.uid)}
                            disabled={actionLoading === user.uid || user.email === 'sahilpanchal1818@gmail.com'}
                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30"
                            title="Delete User"
                          >
                            {actionLoading === user.uid ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
            <div className="p-10 border-b border-slate-50">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Activity Feed</h3>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-2">Live system events</p>
            </div>
            <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar max-h-[650px]">
              {activityLogs.length > 0 ? activityLogs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-5 relative"
                >
                  {i !== activityLogs.length - 1 && (
                    <div className="absolute left-[23px] top-12 bottom-[-32px] w-0.5 bg-slate-100" />
                  )}
                  <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center border-4 border-white shadow-sm z-10 ${
                    log.type === 'login' ? 'bg-emerald-50 text-emerald-600' :
                    log.type === 'failed_login' ? 'bg-red-50 text-red-600' :
                    log.type === 'security' ? 'bg-amber-50 text-amber-600' :
                    'bg-indigo-50 text-indigo-600'
                  }`}>
                    {log.type === 'login' ? <Activity size={20} /> :
                     log.type === 'failed_login' ? <ShieldAlert size={20} /> :
                     log.type === 'security' ? <Shield size={20} /> :
                     <RefreshCw size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      <span className="text-indigo-600">{log.userName}</span> {log.action}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {log.timestamp ? new Date(log.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Globe size={12} /> {log.location || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Activity className="text-slate-200 mb-6" size={64} />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No recent activity detected</p>
                </div>
              )}
            </div>
            <div className="p-8 border-t border-slate-50">
              <button className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                View All System Logs
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions & System Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-slate-900 mb-3">System Quick Actions</h3>
              <p className="text-slate-500 font-medium mb-10">Critical administrative controls and maintenance</p>
              <div className="grid grid-cols-2 gap-6">
                <button className="flex flex-col items-center justify-center gap-4 p-8 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-[2rem] transition-all group">
                  <RefreshCw className="text-indigo-600 group-hover:rotate-180 transition-transform duration-700" size={28} />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Reset System Keys</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-4 p-8 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-[2rem] transition-all group">
                  <Download className="text-emerald-600 group-hover:-translate-y-2 transition-transform" size={28} />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Backup Database</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-4 p-8 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-[2rem] transition-all group">
                  <ShieldAlert className="text-amber-600 group-hover:scale-110 transition-transform" size={28} />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Security Audit</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-4 p-8 bg-red-50 hover:bg-red-100 border border-red-100 rounded-[2rem] transition-all group">
                  <XCircle className="text-red-600 group-hover:scale-110 transition-transform" size={28} />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Flush Cache</span>
                </button>
              </div>
            </div>
            <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
          </div>

          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Login Activity Map</h3>
            <div className="aspect-video bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-center relative overflow-hidden group">
              <Globe className="text-slate-200 group-hover:scale-110 transition-transform duration-1000" size={150} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-indigo-500 rounded-full animate-ping" />
                  <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50" />
                  
                  <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
                  <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />
                  
                  <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-amber-500 rounded-full animate-ping" />
                  <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50" />
                </div>
              </div>
              <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                Live Global Traffic
              </div>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                <span className="text-slate-400">United States</span>
                <span className="text-slate-900">42%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50" style={{width: '42%'}} />
              </div>
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                <span className="text-slate-400">Europe</span>
                <span className="text-slate-900">28%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" style={{width: '28%'}} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}} />
    </Layout>
  );
}


