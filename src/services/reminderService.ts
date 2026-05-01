import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { Invoice } from '../types';
import { toast } from 'sonner';

export async function sendOverdueReminders(companyId: string) {
  const invoicesRef = collection(db, `companies/${companyId}/invoices`);
  const q = query(
    invoicesRef,
    where('status', '==', 'overdue')
  );

  try {
    const snapshot = await getDocs(q);
    const overdueInvoices = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Invoice));

    if (overdueInvoices.length === 0) {
      return { success: true, count: 0 };
    }

    const response = await fetch('/api/reminders/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Failed to trigger reminders');
    
    // We still return a count of 1 as a placeholder if successful, 
    // real count would come from a better API response if needed.
    return { success: true, count: overdueInvoices.length };
  } catch (error) {
    console.error('Error sending reminders:', error);
    throw error;
  }
}
