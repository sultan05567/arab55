import { ReactNode } from 'react';

interface PrintTemplateProps {
  children: ReactNode;
  companyName?: string;
  taxNumber?: string;
  address?: string;
  phone?: string;
  logo?: string;
  title: string;
  documentNumber: string;
  date: string;
}

export function PrintTemplate({
  children,
  companyName = "شركة مثال المحدودة",
  taxNumber = "300000000000003",
  address = "الرياض، المملكة العربية السعودية",
  phone = "0500000000",
  logo,
  title,
  documentNumber,
  date
}: PrintTemplateProps) {
  return (
    <div className="p-12 bg-white text-black font-sans max-w-[800px] mx-auto print:p-0" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-primary pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-black text-primary mb-2">{companyName}</h1>
          <p className="text-sm text-slate-600">{address}</p>
          <p className="text-sm text-slate-600">هاتف: {phone}</p>
          <p className="text-sm text-slate-600 font-bold mt-2">الرقم الضريبي: {taxNumber}</p>
        </div>
        <div className="text-left">
          {logo ? (
            <img src={logo} alt="Logo" className="h-20 w-auto mb-4" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-4xl mb-4">
              Q
            </div>
          )}
        </div>
      </div>

      {/* Document Info */}
      <div className="flex justify-between items-center mb-12 bg-muted/20 p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        </div>
        <div className="text-left space-y-1">
          <p className="text-sm font-bold">الرقم: <span className="text-primary">{documentNumber}</span></p>
          <p className="text-sm">التاريخ: {date}</p>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-500 mb-4">شكراً لتعاملكم معنا</p>
        <div className="flex justify-center gap-12 text-xs text-slate-400">
          <p>تم الإنشاء بواسطة نظام QAYD</p>
          <p>https://qayd.online</p>
        </div>
      </div>
    </div>
  );
}
