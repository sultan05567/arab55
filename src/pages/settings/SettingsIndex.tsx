import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout, Users, Shield, Briefcase, Settings2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

export default function SettingsIndex() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'الوحدات والقطاع',
      description: 'تخصيص نظام قيد ليتناسب مع نشاطك التجاري',
      icon: Layout,
      path: '/settings/modules',
      color: 'text-primary'
    },
    {
      title: 'المستخدمين والصلاحيات',
      description: 'إدارة أدوار الموظفين وصلاحيات الوصول',
      icon: Users,
      path: '/settings/users',
      color: 'text-emerald-500'
    },
    {
      title: 'إعدادات الحساب',
      description: 'البيانات الأساسية للشركة والرقم الضريبي',
      icon: Briefcase,
      path: '/settings/account',
      color: 'text-amber-500'
    },
    {
      title: 'الأمان',
      description: 'تغيير كلمة المرور وتفعيل التحقق الثنائي',
      icon: Shield,
      path: '/settings/security',
      color: 'text-rose-500'
    }
  ];

  return (
    <MainLayout>
      <div className="p-8 max-w-6xl mx-auto" dir="rtl">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">إعدادات النظام</h1>
          <p className="text-slate-500 font-bold text-lg">تحكم في كل تفاصيل شركتك الرقمية</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <button
              key={section.path}
              onClick={() => navigate(section.path)}
              className="group flex items-start gap-6 p-8 bg-white rounded-[2.5rem] border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all text-right"
            >
              <div className={`w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors ${section.color}`}>
                <section.icon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-primary transition-colors">{section.title}</h3>
                <p className="text-slate-500 font-bold leading-relaxed">{section.description}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                <Settings2 className="w-5 h-5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
