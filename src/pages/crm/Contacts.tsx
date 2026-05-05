import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Edit,
  Trash2,
  ExternalLink,
  History,
  Loader2
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/services/firebase';
import { useFirebase } from '@/components/FirebaseProvider';
import { Customer, Invoice } from '@/types';

export default function Contacts() {
  const { profile } = useFirebase();
  const [contacts, setContacts] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!profile?.companyId) return;

    const customersPath = 'customers';
    const customersQuery = query(
      collection(db, customersPath),
      where('companyId', '==', profile.companyId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const invoicesPath = `companies/${profile.companyId}/invoices`;
    const invoicesQuery = query(
      collection(db, invoicesPath),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setContacts(docs);
      if (loading && invoices.length > 0) setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, customersPath);
    });

    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
      setInvoices(docs);
      if (loading && contacts.length > 0) setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, invoicesPath);
    });

    const checkLoading = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      unsubscribeCustomers();
      unsubscribeInvoices();
      clearTimeout(checkLoading);
    };
  }, [profile?.companyId]);

  const customerBalances = invoices.reduce((acc, inv) => {
    if (inv.status !== 'paid' && inv.status !== 'cancelled') {
        acc[inv.customerId] = (acc[inv.customerId] || 0) + inv.total;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalOutstanding = Object.values(customerBalances).reduce((sum, bal) => sum + bal, 0);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (contact.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeTab === 'supplier') return false;
    if (activeTab === 'customer') return matchesSearch;
    return matchesSearch;
  });

  if (loading && contacts.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">جهات الاتصال</h1>
          <p className="text-slate-500 font-medium">إدارة العملاء، الموردين، والشركاء التجاريين في مكان مركزي واحد.</p>
        </div>
        <Button size="lg" className="rounded-2xl gap-2 shadow-lg shadow-primary/20 h-12 font-bold px-8">
          <Plus className="w-5 h-5" />
          إضافة عميل جديد
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'إجمالي العملاء', value: contacts.length, icon: User, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'الموردين النشطين', value: 0, icon: Building2, color: 'text-slate-900', bg: 'bg-white' },
          { label: 'إجمالي المديونيات', value: totalOutstanding.toLocaleString() + ' ر.س', icon: History, color: 'text-rose-600', bg: 'bg-rose-50/30' },
        ].map((stat, i) => (
          <Card key={i} className={cn("border-none shadow-sm card-hover", stat.bg)}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-bold text-slate-500">{stat.label}</p>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div className={cn("text-2xl font-black tracking-tight", stat.color)}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-[2rem] bg-white">
        <CardHeader className="border-b border-slate-50 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
              <TabsList className="bg-slate-50 border-none p-1 rounded-xl h-11">
                <TabsTrigger value="all" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">الكل</TabsTrigger>
                <TabsTrigger value="customer" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">العملاء</TabsTrigger>
                <TabsTrigger value="supplier" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">الموردين</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="بحث بالاسم، البريد، أو الشركة..." 
                  className="pr-11 bg-slate-50 border-none rounded-2xl h-12 font-bold text-slate-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 border-slate-100">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="px-8 h-14 font-black text-slate-800">الاسم والشركة</TableHead>
                <TableHead className="font-black text-slate-800">معلومات التواصل</TableHead>
                <TableHead className="font-black text-slate-800 text-center">النوع</TableHead>
                <TableHead className="text-right font-black text-slate-800">الرصيد المستحق</TableHead>
                <TableHead className="text-center font-black text-slate-800">الحالة</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => {
                const balance = customerBalances[contact.id] || 0;
                return (
                <TableRow key={contact.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors group">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl group-hover:scale-110 transition-transform">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{contact.name}</p>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-0.5 uppercase tracking-tighter">
                          <Building2 className="w-3 h-3" />
                          {contact.address || 'عنوان غير مسجل'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-xs flex items-center gap-2 font-bold text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        {contact.email || 'N/A'}
                      </p>
                      <p className="text-xs flex items-center gap-2 font-bold text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-300" />
                        {contact.phone || 'N/A'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="rounded-xl px-4 py-1 bg-blue-50 text-blue-600 border-none font-bold text-[10px]">
                      عميل
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-black text-lg",
                    balance > 0 ? "text-rose-600" : "text-emerald-600"
                  )}>
                    {balance.toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-full px-3 font-bold text-[10px]">
                      نشط
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-xl opacity-0 group-hover:opacity-100 transition-opacity")}>
                        <MoreHorizontal className="w-5 h-5 text-slate-400" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 border-slate-100 shadow-xl shadow-slate-200/50">
                        <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold">
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                          الملف الشخصي
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold">
                          <History className="w-4 h-4 text-slate-400" />
                          كشف حساب
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold">
                          <Edit className="w-4 h-4 text-slate-400" />
                          تعديل البيانات
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold text-rose-600 hover:bg-rose-50">
                          <Trash2 className="w-4 h-4" />
                          حذف جهة الاتصال
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
