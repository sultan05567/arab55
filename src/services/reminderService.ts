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

    let sentCount = 0;
    for (const invoice of overdueInvoices) {
      // In a real app, this would call an API to send a real email
      // e.g., await fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ to: invoice.customerEmail, ... }) });
      
      console.log(`Sending reminder to ${invoice.customerName} for invoice ${invoice.number}`);
      
      // Update the invoice to mark that a reminder was sent
      const invoiceDocRef = doc(db, `companies/${companyId}/invoices`, invoice.id);
      await updateDoc(invoiceDocRef, {
        reminderSentAt: new Date().toISOString()
      });
      
      sentCount++;
    }

    return { success: true, count: sentCount };
  } catch (error) {
    console.error('Error sending reminders:', error);
    throw error;
  }
}
