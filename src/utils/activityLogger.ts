import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { OperationType } from '../types';
import { handleFirestoreError } from './firestoreErrorHandler';

export async function logActivity(userId: string, userName: string, action: string, type: 'login' | 'logout' | 'update' | 'security' | 'failed_login') {
  try {
    await addDoc(collection(db, 'activity_logs'), {
      userId,
      userName,
      action,
      type,
      timestamp: serverTimestamp(),
      device: window.innerWidth < 768 ? 'mobile' : 'desktop',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'activity_logs');
  }
}

export async function createNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type,
      read: false,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'notifications');
  }
}
