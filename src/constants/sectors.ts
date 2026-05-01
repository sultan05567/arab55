import { SectorKey, ModuleKey } from '@/types';

export interface SectorDefinition {
  key: SectorKey;
  name: string;
  description: string;
  defaultModules: ModuleKey[];
}

export const BUSINESS_SECTORS: SectorDefinition[] = [
  {
    key: 'services',
    name: 'شركة خدمات',
    description: 'شركات الاستشارات، المحاماة، التصميم، والخدمات المهنية.',
    defaultModules: [
      'dashboard', 'customers', 'invoices', 'receipts', 'payments', 
      'expenses', 'reports', 'accounting'
    ]
  },
  {
    key: 'construction',
    name: 'مؤسسة مقاولات',
    description: 'شركات المقاولات، البناء، والتطوير العقاري.',
    defaultModules: [
      'dashboard', 'customers', 'suppliers', 'projects', 'contracts', 
      'invoices', 'receipts', 'payments', 'expenses', 'reports', 
      'accounting', 'hr'
    ]
  },
  {
    key: 'grocery',
    name: 'بقالة / سوبرماركت',
    description: 'محلات التجزئة الغذائية والتموينات.',
    defaultModules: [
      'dashboard', 'pos', 'products', 'inventory', 'barcode', 'warehouses',
      'invoices', 'suppliers', 'reports', 'expenses'
    ]
  },
  {
    key: 'laundry',
    name: 'مغسلة',
    description: 'مغاسل الملابس والمفروشات.',
    defaultModules: [
      'dashboard', 'pos', 'services', 'customers', 'orders', 'invoices', 
      'expenses', 'reports'
    ]
  },
  {
    key: 'cafe_restaurant',
    name: 'كوفي / مطعم',
    description: 'المطاعم، الكافيهات، وعربات الطعام.',
    defaultModules: [
      'dashboard', 'pos', 'products', 'tables', 'orders', 'kitchen', 
      'inventory', 'reports'
    ]
  },
  {
    key: 'retail',
    name: 'متجر تجزئة',
    description: 'محلات الملابس، العطور، والأجهزة الإلكترونية.',
    defaultModules: [
      'dashboard', 'pos', 'products', 'inventory', 'barcode', 'customers', 
      'suppliers', 'invoices', 'reports'
    ]
  },
  {
    key: 'recruitment',
    name: 'مكتب استقدام',
    description: 'مكاتب استقدام العمالة المنزلية والمهنية.',
    defaultModules: [
      'dashboard', 'customers', 'contracts', 'orders', 'recruitment', 
      'invoices', 'payments', 'expenses', 'reports', 'attachments'
    ]
  },
  {
    key: 'other',
    name: 'نشاط آخر',
    description: 'أي نشاط تجاري آخر لا يندرج تحت التصنيفات السابقة.',
    defaultModules: ['dashboard', 'invoices', 'expenses', 'reports']
  }
];

export const ALL_MODULES: { key: ModuleKey; name: string; description: string }[] = [
  { key: 'dashboard', name: 'لوحة التحكم', description: 'نظرة عامة على أداء الشركة' },
  { key: 'customers', name: 'العملاء', description: 'إدارة بيانات العملاء وعلاقاتهم' },
  { key: 'suppliers', name: 'الموردين', description: 'إدارة الموردين والمشتريات' },
  { key: 'invoices', name: 'الفواتير', description: 'إصدار وإدارة فواتير البيع والشراء' },
  { key: 'receipts', name: 'سندات القبض', description: 'توثيق المبالغ المستلمة' },
  { key: 'payments', name: 'سندات الصرف', description: 'توثيق المبالغ المدفوعة' },
  { key: 'expenses', name: 'المصروفات', description: 'تتبع المصاريف التشغيلية' },
  { key: 'accounting', name: 'المحاسبة', description: 'القيود المحاسبية والقوائم المالية' },
  { key: 'reports', name: 'التقارير', description: 'تقارير تفصيلية للأداء المالي والتجاري' },
  { key: 'pos', name: 'نقطة البيع (POS)', description: 'نظام كاشير سريع للبيع المباشر' },
  { key: 'inventory', name: 'المخزون', description: 'تتبع الكميات وحركات المخازن' },
  { key: 'barcode', name: 'الباركود', description: 'توليد وطباعة ملصقات الباركود' },
  { key: 'warehouses', name: 'المستودعات', description: 'إدارة مواقع التخزين المتعددة' },
  { key: 'products', name: 'المنتجات', description: 'قاعدة بيانات السلع والخدمات' },
  { key: 'projects', name: 'المشاريع', description: 'تتبع تكاليف وإيرادات المشاريع' },
  { key: 'contracts', name: 'العقود', description: 'إدارة العقود والاتفاقيات' },
  { key: 'hr', name: 'الموارد البشرية', description: 'إدارة الموظفين والرواتب' },
  { key: 'services', name: 'الخدمات', description: 'تعريف وتحجيم الخدمات المقدمة' },
  { key: 'orders', name: 'الطلبات', description: 'تتبع طلبات العملاء وحالاتها' },
  { key: 'tables', name: 'الطاولات', description: 'إدارة الجلسات والطاولات' },
  { key: 'kitchen', name: 'المطبخ', description: 'شاشة متابعة طلبات التحضير' },
  { key: 'recruitment', name: 'الاستقدام', description: 'إجراءات استقدام العمالة' },
  { key: 'attachments', name: 'المرفقات', description: 'أرشفة الوثائق والمستندات' },
];
