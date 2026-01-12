
import React, { useRef, useState } from 'react';
import { Database as DbIcon, Download, Upload, Trash2, AlertCircle, CheckCircle, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '../types';

interface DatabaseProps {
  data: {
    products: any[];
    team: any[];
    documents: any[];
    kpiData: any[];
  };
  onImport: (fullData: any) => void;
  onReset: () => void;
  requestAuth: (action: () => void) => void;
  role: UserRole | null;
}

export const Database: React.FC<DatabaseProps> = ({ data, onImport, onReset, requestAuth, role }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `tqm_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setStatus({ type: 'success', message: 'تم تصدير نسخة احتياطية بنجاح إلى جهازك' });
    setTimeout(() => setStatus({ type: null, message: '' }), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        // Basic validation
        if (importedData.products && importedData.team) {
          onImport(importedData);
          setStatus({ type: 'success', message: 'تم استيراد البيانات وتحديث النظام بنجاح' });
        } else {
          throw new Error('ملف غير صالح');
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'فشل استيراد الملف. تأكد من صحة صيغة JSON' });
      }
      setTimeout(() => setStatus({ type: null, message: '' }), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-royal-100 text-royal-800 rounded-xl">
            <DbIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">إدارة البيانات المحلية</h2>
            <p className="text-gray-500 text-sm">التطبيق يستخدم ذاكرة المتصفح (LocalStorage) لحفظ بياناتك على هذا الجهاز.</p>
          </div>
        </div>

        <AnimatePresence>
          {status.type && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
            >
              {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-bold">{status.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Section */}
          <div className="p-6 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              نسخ احتياطي (تصدير)
            </h3>
            <p className="text-sm text-gray-600">قم بتحميل نسخة كاملة من بياناتك (منتجات، فريق، تقارير) كملف JSON لحفظها على جهاز الكمبيوتر الخاص بك.</p>
            <button 
              onClick={handleExport}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Save className="w-5 h-5" />
              حفظ النسخة على الجهاز
            </button>
          </div>

          {/* Import Section */}
          <div className="p-6 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Upload className="w-5 h-5 text-royal-600" />
              استعادة البيانات (استيراد)
            </h3>
            <p className="text-sm text-gray-600">هل قمت بتغيير المتصفح أو تريد استعادة نسخة قديمة؟ ارفع ملف النسخة الاحتياطية هنا.</p>
            
            <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 bg-royal-800 text-white rounded-xl font-bold hover:bg-royal-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-royal-800/20"
            >
            <Upload className="w-5 h-5" />
            رفع واستعادة البيانات
            </button>
            <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".json"
            onChange={handleImport}
            />
          </div>
        </div>

        {role === 'admin' && (
            <div className="mt-10 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-3">
                    <Trash2 className="w-6 h-6 text-red-600" />
                    <div>
                    <p className="font-bold text-red-800">منطقة الخطر</p>
                    <p className="text-xs text-red-600">سيؤدي هذا الإجراء لمسح كافة البيانات المحلية وإعادتها لوضع المصنع.</p>
                    </div>
                </div>
                <button 
                    onClick={() => requestAuth(onReset)}
                    className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-600 hover:text-white transition-all"
                >
                    تصفير النظام
                </button>
            </div>
            </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex gap-4">
         <AlertCircle className="w-8 h-8 text-amber-600 shrink-0" />
         <div>
            <h4 className="font-bold text-amber-800 mb-1">تلميح للسيرفر المحلي:</h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              بما أن الموقع يعمل على متصفحك، فإن البيانات تُخزن داخل "LocalStorage". لضمان عدم ضياع البيانات عند تنظيف المتصفح، ننصحك دائماً بعمل "نسخة احتياطية" أسبوعياً وحفظها في مجلد خاص على قرصك الصلب.
            </p>
         </div>
      </div>
    </div>
  );
};
