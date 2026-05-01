import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Shield, Check, Loader2, MoreHorizontal, Settings2 } from 'lucide-react';
import { useFirebase } from '@/components/FirebaseProvider';
import { UserProfile, Role } from '@/types';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ROLES: { key: Role; name: string; description: string }[] = [
  { key: 'owner', name: 'مالك المؤسسة', description: 'صلاحيات كاملة على النظام والبيانات' },
  { key: 'admin', name: 'مدير نظام', description: 'صلاحيات إدارية واسعة مع إمكانية التخصيص' },
  { key: 'accountant', name: 'محاسب', description: 'دخول كامل للوحدات المالية والمحاسبية' },
  { key: 'cashier', name: 'كاشير', description: 'دخول لنظام نقطة البيع فقط' },
  { key: 'viewer', name: 'مراقب', description: 'صلاحية العرض فقط بدون تعديل' },
];

const PERMISSIONS = [
  { key: 'dashboard.view', name: 'عرض لوحة التحكم', group: 'عام' },
  { key: 'settings.view', name: 'عرض الإعدادات', group: 'عام' },
  { key: 'users.manage', name: 'إدارة المستخدمين', group: 'عام' },
  
  { key: 'pos.view', name: 'دخول الكاشير', group: 'المبيعات' },
  { key: 'pos.sell', name: 'إتمام عمليات البيع', group: 'المبيعات' },
  { key: 'pos.refund', name: 'إجراء مرتجعات', group: 'المبيعات' },
  { key: 'sales.view', name: 'عرض المبيعات', group: 'المبيعات' },
  { key: 'sales.create', name: 'إنشاء فواتير', group: 'المبيعات' },

  { key: 'inventory.view', name: 'عرض المخزون', group: 'المخزون' },
  { key: 'inventory.edit', name: 'تعديل المخزون', group: 'المخزون' },
  
  { key: 'finance.view', name: 'عرض المالية', group: 'المالية' },
  { key: 'accounting.view', name: 'عرض المحاسبة', group: 'المحاسبة' },
  { key: 'accounting.edit', name: 'إجراء قيود', group: 'المحاسبة' },
];

export default function UsersSettings() {
  const { profile } = useFirebase();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editRole, setEditRole] = useState<Role>('viewer');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.companyId) {
      fetchUsers();
    }
  }, [profile?.companyId]);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), where('companyId', '==', profile?.companyId));
      const snapshot = await getDocs(q);
      const userList = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('حدث خطأ أثناء تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditPermissions(user.permissions || []);
    setIsEditDialogOpen(true);
  };

  const togglePermission = (perm: string) => {
    setEditPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);

    try {
      await updateDoc(doc(db, 'users', selectedUser.uid), {
        role: editRole,
        permissions: editPermissions,
        updatedAt: serverTimestamp()
      });
      
      toast.success('تم تحديث صلاحيات المستخدم بنجاح');
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('حدث خطأ أثناء حفظ الصلاحيات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8 max-w-6xl mx-auto" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">المستخدمين والصلاحيات</h1>
            <p className="text-slate-500 font-bold text-lg">أضف فريق عملك وحدد أدوارهم بدقة</p>
          </div>
          <Button size="lg" className="rounded-2xl px-8 h-14 font-black text-lg gap-2 shadow-xl shadow-primary/20">
            <UserPlus className="w-5 h-5" /> إضافة مستخدم جديد
          </Button>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="w-[300px] font-black text-slate-900 py-6 pr-8 text-right">المستخدم</TableHead>
                  <TableHead className="font-black text-slate-900 text-right">الدور</TableHead>
                  <TableHead className="font-black text-slate-900 text-right">الحالة</TableHead>
                  <TableHead className="w-[100px] font-black text-slate-900 pl-8 text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uid} className="hover:bg-slate-50/50 border-slate-50 transition-colors group">
                    <TableCell className="py-6 pr-8 text-right">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg shrink-0">
                          {user.fullName[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{user.fullName}</p>
                          <p className="text-[11px] font-bold text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-600 text-sm">
                        <Shield className="w-4 h-4" />
                        {ROLES.find(r => r.key === user.role)?.name || user.role}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        user.active ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", user.active ? "bg-emerald-500" : "bg-rose-500")} />
                        {user.active ? 'نشط' : 'معطل'}
                      </div>
                    </TableCell>
                    <TableCell className="pl-8 text-left">
                      <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEdit(user)}>
                        <Settings2 className="w-5 h-5 text-slate-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Permissions Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-[3rem]" dir="rtl">
            <DialogHeader className="p-8 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[2rem] bg-white shadow-sm flex items-center justify-center text-primary font-black text-2xl">
                  {selectedUser?.fullName[0]}
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black">تعديل الصلاحيات</DialogTitle>
                  <DialogDescription className="text-slate-500 font-bold text-lg">{selectedUser?.fullName}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                <Label className="text-lg font-black block">الدور الوظيفي</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {ROLES.map((role) => (
                    <button
                      key={role.key}
                      onClick={() => setEditRole(role.key)}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-2xl border-2 transition-all",
                        editRole === role.key 
                          ? "border-primary bg-primary/5" 
                          : "border-slate-50 bg-white hover:border-slate-200"
                      )}
                    >
                      <Shield className={cn("w-6 h-6 mb-2", editRole === role.key ? "text-primary" : "text-slate-300")} />
                      <span className={cn("text-xs font-black", editRole === role.key ? "text-primary" : "text-slate-600")}>{role.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-black block">الصلاحيات التفصيلية</Label>
                <div className="grid md:grid-cols-3 gap-6">
                  {['عام', 'المبيعات', 'المخزون', 'المحاسبة'].map(group => (
                    <div key={group} className="space-y-3">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 p-2 px-3 rounded-lg">{group}</h4>
                      {PERMISSIONS.filter(p => p.group === group).map(perm => (
                        <button
                          key={perm.key}
                          onClick={() => togglePermission(perm.key)}
                          className="flex items-center gap-3 w-full text-right group"
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                            editPermissions.includes(perm.key) 
                              ? "bg-primary border-primary text-white" 
                              : "bg-white border-slate-200 group-hover:border-primary/50"
                          )}>
                            {editPermissions.includes(perm.key) && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className={cn(
                            "text-sm font-bold transition-colors",
                            editPermissions.includes(perm.key) ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
                          )}>{perm.name}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="p-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <Button variant="ghost" className="rounded-xl px-8" onClick={() => setIsEditDialogOpen(false)}>إلغاء</Button>
              <Button size="lg" className="rounded-2xl px-12 h-14 font-black text-lg gap-2 shadow-xl shadow-primary/20" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ التعديلات'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
