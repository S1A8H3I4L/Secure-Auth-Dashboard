import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import Layout from './Layout';
import { 
  Bell, 
  Check, 
  Trash2, 
  Shield, 
  User, 
  Settings, 
  AlertCircle,
  Clock,
  MoreVertical,
  Search,
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification, OperationType } from '../types';
import { handleFirestoreError } from '../utils/firestoreErrorHandler';

export default function Notifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', profile.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Notification)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'notifications'));

    return () => unsubscribe();
  }, [profile?.uid]);

  const markAllAsRead = async () => {
    if (!profile?.uid) return;
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length === 0) return;

      const batch = writeBatch(db);
      unreadNotifications.forEach(n => {
        const ref = doc(db, 'notifications', n.id);
        batch.update(ref, { read: true });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notifications');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const ref = doc(db, 'notifications', id);
      await updateDoc(ref, { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notifications/${id}`);
    }
  };

  const clearAll = async () => {
    if (!profile?.uid || !window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        const ref = doc(db, 'notifications', n.id);
        batch.delete(ref);
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'notifications');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="text-red-500" size={20} />;
      case 'success': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={20} />;
      case 'info': return <Info className="text-indigo-500" size={20} />;
      default: return <Bell className="text-slate-500" size={20} />;
    }
  };

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Notifications</h1>
            <p className="text-slate-500 font-medium mt-2">Stay updated with your account activity.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Check size={18} />
              Mark all as read
            </button>
            <button 
              onClick={clearAll}
              className="p-3 bg-white text-slate-400 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                {notifications.filter(n => !n.read).length} Unread
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {notifications.length} Total
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all w-64"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            <AnimatePresence initial={false}>
              {loading ? (
                <div className="py-24 flex justify-center">
                  <Loader2 className="animate-spin text-indigo-600" size={40} />
                </div>
              ) : filteredNotifications.length > 0 ? filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`p-6 flex gap-6 hover:bg-slate-50/50 transition-colors group ${!notification.read ? 'bg-indigo-50/30' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    notification.type === 'error' ? 'bg-red-50' :
                    notification.type === 'success' ? 'bg-emerald-50' :
                    notification.type === 'warning' ? 'bg-amber-50' : 'bg-indigo-50'
                  }`}>
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-black tracking-tight ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Clock size={12} />
                          {getTimeAgo(notification.timestamp)}
                        </span>
                        <button className="p-1 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${!notification.read ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                      {notification.message}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                    <Bell size={40} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">All caught up!</h3>
                  <p className="text-slate-500 font-medium mt-2">You have no new notifications at the moment.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
          
          {filteredNotifications.length > 0 && (
            <div className="p-6 bg-slate-50/50 border-t border-slate-50 text-center">
              <button className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                Load older notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

