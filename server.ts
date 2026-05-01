import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import cron from 'node-cron';
import { Resend } from 'resend';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn('RESEND_API_KEY is missing. Email reminders will be temporarily disabled.');
}

async function checkOverdueInvoices() {
  if (!resend) {
    console.log('Skipping overdue check: Resend API key not configured.');
    return;
  }
  console.log('Checking for overdue invoices...');
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Note: We are using individual company folders in firesore as per previous turns
    // Wait, let's check how invoices are stored.
    // Based on App.tsx and firestore.rules, it seems they are in /companies/{companyId}/invoices/{invoiceId}
    // But listed at the top level in some cases? 
    // Actually, looking at firestore.rules: match /companies/{companyId} { match /invoices/{invoiceId} ... }
    
    // Since we want to check ALL companies, we'll use a collectionGroup query if possible,
    // but the environment might not have indexes for that.
    // Alternatively, we can list all companies then list invoices.
    
    const companiesSnapshot = await getDocs(collection(db, 'companies'));
    
    for (const companyDoc of companiesSnapshot.docs) {
      const companyId = companyDoc.id;
      const invoicesRef = collection(db, 'companies', companyId, 'invoices');
      
      // Query for issued invoices that are past due date
      const q = query(
        invoicesRef, 
        where('status', 'in', ['issued', 'partially_paid']),
        where('dueDate', '<', today)
      );
      
      const invoicesSnapshot = await getDocs(q);
      
      for (const invoiceDoc of invoicesSnapshot.docs) {
        const invoiceData = invoiceDoc.data();
        
        // Skip if already marked overdue in some cases or if reminder was sent recently
        // But for this task, the goal is to "automatically send an email reminder"
        
        // Update status to overdue
        await updateDoc(invoiceDoc.ref, {
          status: 'overdue'
        });
        
        // Send email to customer
        if (invoiceData.customerId) {
          const customerDoc = await getDoc(doc(db, 'companies', companyId, 'customers', invoiceData.customerId));
          if (customerDoc.exists()) {
            const customerData = customerDoc.data();
            if (customerData.email) {
              console.log(`Sending reminder for invoice ${invoiceData.number} to ${customerData.email}`);
              
              await resend.emails.send({
                from: 'Qayd Reminders <reminders@qayd.app>',
                to: customerData.email,
                subject: `تذكير: فاتورة متأخرة رقم ${invoiceData.number}`,
                html: `
                  <div dir="rtl" style="font-family: sans-serif;">
                    <h2>تذكير بسداد فاتورة</h2>
                    <p>عزيزي ${customerData.name}،</p>
                    <p>نود تذكيركم بأن الفاتورة رقم <strong>${invoiceData.number}</strong> قد تجاوزت تاريخ الاستحقاق (${invoiceData.dueDate}).</p>
                    <p>المبلغ الإجمالي: <strong>${invoiceData.total}</strong></p>
                    <p>يرجى التكرم بالسداد في أقرب وقت ممكن.</p>
                    <p>شكراً لك،<br/>فريق عمل ${companyDoc.data().name || 'قيد'}</p>
                  </div>
                `
              });
              
              // Mark reminder as sent
              await updateDoc(invoiceDoc.ref, {
                reminderSentAt: new Date().toISOString()
              });
            }
          }
        }
      }
    }
    console.log('Overdue check completed.');
  } catch (error) {
    console.error('Error checking overdue invoices:', error);
  }
}

// Run every day at midnight
cron.schedule('0 0 * * *', checkOverdueInvoices);

async function startServer() {
  const expressApp = express();
  const PORT = 3000;

  expressApp.use(express.json());

  // API Routes
  expressApp.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Manual trigger for testing
  expressApp.post('/api/reminders/trigger', async (req, res) => {
    // In a real app, this should be protected by an admin key
    await checkOverdueInvoices();
    res.json({ message: 'Overdue check triggered manually' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    expressApp.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    expressApp.use(express.static(distPath));
    expressApp.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  expressApp.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Run once on startup for development if requested
    // checkOverdueInvoices(); 
  });
}

startServer();
