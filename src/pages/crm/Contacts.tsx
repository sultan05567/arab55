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
import { Button } from '@/components/ui/button';
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
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
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
      orderBy('createdAt', 'desc')
    );

    const invoicesPath = `companies/${profile.companyId}/invoices`;
    const invoicesQuery = query(
      collection(db, invoicesPath),
      orderBy('createdAt', 'desc')
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

    // Handle initial loading finish if collections might be empty
    const checkLoading = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      unsubscribeCustomers();
      unsubscribeInvoices();
      clearTimeout(checkLoading);
    };
  }, [profile?.companyId]);

  // Calculate balances per customer
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
    
    // In our current schema, everything in the 'customers' collection is a customer.
    // If we had a type field, we would filter by it.
    // For now, since everything is a customer, 'supplier' tab will be empty.
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">العملاء والموردين</h1>
          <p className="text-muted-foreground">إدارة جميع جهات الاتصال والعلاقات التجارية في مكان واحد.</p>
        </div>
        <Button className="gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" />
          إضافة جهة اتصال
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length} عميل</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الموردين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 مورد</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المديونيات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{totalOutstanding.toLocaleString()} ر.س</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
              <TabsList className="bg-background border">
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="customer">العملاء</TabsTrigger>
                <TabsTrigger value="supplier">الموردين</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="بحث بالاسم أو الشركة..." 
                  className="pr-10 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>الاسم والشركة</TableHead>
                <TableHead>معلومات التواصل</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead className="text-right">الرصيد الحالي</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => {
                const balance = customerBalances[contact.id] || 0;
                return (
                <TableRow key={contact.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold">{contact.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {contact.address || 'لا يوجد عنوان'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-xs flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {contact.email || 'لا يوجد بريد'}
                      </p>
                      <p className="text-xs flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {contact.phone || 'لا يوجد هاتف'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "rounded-full",
                      "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    )}>
                      عميل
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-bold",
                    balance > 0 ? "text-red-500" : ""
                  )}>
                    {balance.toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn(
                      "rounded-full",
                      "bg-green-500/10 text-green-500 border-green-500/20"
                    )}>
                      نشط
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <div className="p-2 hover:bg-muted rounded-full cursor-pointer transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="gap-2">
                          <ExternalLink className="w-4 h-4" />
                          عرض الملف الكامل
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <History className="w-4 h-4" />
                          سجل المعاملات
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit className="w-4 h-4" />
                          تعديل البيانات
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive">
                          <Trash2 className="w-4 h-4" />
                          حذف
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
