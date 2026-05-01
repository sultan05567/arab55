import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Layout, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { BUSINESS_SECTORS, ALL_MODULES } from '@/constants/sectors';
import { useFirebase } from '@/components/FirebaseProvider';
import { ModuleKey } from '@/types';
import { cn } from '@/lib/utils';
import { collection, query, getDocs, doc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { toast } from 'sonner';

export default function ModulesSettings() {
  const { profile, enabledModules: currentEnabledModules } = useFirebase();
  const [selectedModules, setSelectedModules] = useState<ModuleKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companySector, setCompanySector] = useState<string>('');

  useEffect(() => {
    if (profile?.companyId) {
      setSelectedModules(currentEnabledModules);
      
      const fetchCompany = async () => {
        const companyDoc = await getDoc(doc(db, 'companies', profile.companyId));
        if (companyDoc.exists()) {
          setCompanySector(companyDoc.data().sectorKey);
        }
        setLoading(false);
      };
      fetchCompany();
    }
  }, [profile?.companyId, currentEnabledModules]);

  const toggleModule = (moduleKey: ModuleKey) => {
    setSelectedModules(prev => 
      prev.includes(moduleKey) 
        ? prev.filter(m => m !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const handleSave = async () => {
    if (!profile?.companyId) return;
    setSaving(true);

    try {
      // We need to delete old module records and add new ones
      // Or update them. A batch is best.
      const batch = writeBatch(db);
      
      // Get all current module docs to delete/update
      const modulesSnapshot = await getDocs(collection(db, 'companies', profile.companyId, 'modules'));
      modulesSnapshot.docs.forEach(d => batch.delete(d.ref));

      // Add new ones
      selectedModules.forEach(moduleKey => {
        const moduleRef = doc(collection(db, 'companies', profile.companyId, 'modules'));
        batch.set(moduleRef, {
          moduleKey,
          isEnabled: true,
          enabledBy: profile.uid,
          createdAt: serverTimestamp()
        });
      });

      await batch.commit();
      toast.success('تم تحديث إعدادات الوحدات بنجاح');
      window.location.reload(); // To refresh Sidebar
    } catch (error) {
      console.error('Error saving modules:', error);
      toast.error('حدث خطأ أثناء حفظ الإعدادات');
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
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">إدارة الوحدات والقطاع</h1>
            <p className="text-slate-500 font-bold text-lg">تحكم في المميزات المفعلة في حسابك</p>
          </div>
          <Button 
            size="lg" 
            className="rounded-2xl px-12 h-14 font-black text-lg shadow-xl shadow-primary/20"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ التغييرات'}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="text-2xl font-black">المميزات المتاحة</CardTitle>
                <CardDescription className="text-slate-500 font-bold">تفعيل أو إيقاف الوحدات يؤثر على القائمة الجانبية والصفحات المتاحة</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-4">
                  {ALL_MODULES.map((module) => (
                    <button
                      key={module.key}
                      onClick={() => toggleModule(module.key)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border-2 text-right transition-all",
                        selectedModules.includes(module.key)
                          ? "border-primary bg-primary/5"
                          : "border-slate-100 bg-white hover:border-slate-200"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        selectedModules.includes(module.key) ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        {selectedModules.includes(module.key) ? <Check className="w-5 h-5" /> : <Layout className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-sm text-slate-900">{module.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{module.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
              <div>
                <p className="font-black text-amber-900 mb-1">ملاحظة هامة</p>
                <p className="text-sm font-bold text-amber-700">إيقاف أي وحدة سيخفيها من النظام فقط، ولن يتم حذف أي بيانات مرتبطة بها. يمكنك إعادة تفعيلها في أي وقت للوصول لبياناتك السابقة.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
                <CardTitle className="text-xl font-black">القطاع الحالي</CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                  <Layout className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  {BUSINESS_SECTORS.find(s => s.key === companySector)?.name || 'غير محدد'}
                </h3>
                <p className="text-slate-500 font-bold mb-6">تم تخصيص النظام بناءً على هذا القطاع</p>
                <Button variant="outline" className="rounded-xl font-black w-full" disabled>تغيير القطاع</Button>
                <p className="text-[10px] text-slate-400 font-bold mt-2">تغيير القطاع متاح عبر الدعم الفني فقط حالياً</p>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="text-xl font-black">إحصائيات النظام</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">الوحدات المفعلة</span>
                  <span className="font-black text-primary">{selectedModules.length} من {ALL_MODULES.length}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-1000" 
                    style={{ width: `${(selectedModules.length / ALL_MODULES.length) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
