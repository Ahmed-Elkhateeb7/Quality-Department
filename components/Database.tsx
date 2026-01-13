import React, { useRef, useState, useEffect } from 'react';
import { Database as DbIcon, Download, Upload, Trash2, AlertCircle, CheckCircle, Save, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '../types';

interface DatabaseProps {
  data: {
    products: any[];
    team: any[];
    documents: any[];
    kpiData: any[];
    companySettings: any;
  };
  onImport: (fullData: any) => void;
  onReset: () => void;
  requestAuth: (action: () => void) => void;
  role: UserRole | null;
}

export const Database: React.FC<DatabaseProps> = ({ data, onImport, onReset, requestAuth, role }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 5242880 }); // Standard 5MB limit

  useEffect(() => {
    const calculateUsage = () => {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += (localStorage[key].length + key.length) * 2; // approximation in bytes
        }
      }
      setStorageUsage(prev => ({ ...prev, used: total }));
    };
    calculateUsage();
    window.addEventListener('storage', calculateUsage);
    return () => window.removeEventListener('storage', calculateUsage);
  }, [data]);

  const usagePercent = Math.min(Math.round((storageUsage.used / storageUsage.total) * 100), 100);

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `tqm_backup_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    setStatus({ type: 'success', message: 'تم تصدير نسخة احتياطية بنجاح' });
    setTimeout(() => setStatus({ type: null, message: '' }), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData.products && importedData.team) {
          onImport(importedData);
          setStatus({ type: 'success', message: 'تم استيراد البيانات بنجاح' });
        } else {
          throw new Error('ملف غير صالح');
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'فشل استيراد الملف. تأكد من الصيغة.' });
      }
      setTimeout(() => setStatus({ type: null, message: '' }), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-royal-100 text-royal-800 rounded-xl">
            <DbIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">إدارة قاعدة البيانات</h2>
            <p className="text-gray-500 text-sm">إدارة التخزين المحلي والنسخ الاحتياطي.</p>
          </div>
        </div>

        <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-royal-600" />
                    <span className="font-bold text-gray-700">مساحة التخزين المستخدمة (LocalStorage)</span>
                </div>
                <span className={`text-sm font-black ${usagePercent > 85 ? 'text-red-600' : 'text-royal-600'}`}>{usagePercent}%</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercent}%` }}
                    className={`h-full transition-all duration-500 ${usagePercent > 85 ? 'bg-red-500' : 'bg-royal-600'}`}
                />
            </div>
            <p className="mt-3 text-xs text-gray-500 flex justify-between">
                <span>تم استخدام {(storageUsage.used / 1024 / 1024).toFixed(2)} MB من أصل 5 MB</span>
                {usagePercent > 85 && <span className="text-red-500 font-bold">تنبيه: اقتربت المساحة من النفاد. قم بضغط الصور أو حذف بيانات قديمة.</span>}
            </p>
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
          <div className="p-6 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              تصدير البيانات (Backup)
            </h3>
            <p className="text-xs text-gray-600">تحميل نسخة JSON من جميع بيانات النظام للعمل بها على جهاز آخر أو تأمينها.</p>
            <button 
              onClick={handleExport}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Save className="w-5 h-5" />
              حفظ النسخة الاحتياطية
            </button>
          </div>

          <div className="p-6 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Upload className="w-5 h-5 text-royal-600" />
              استيراد البيانات (Restore)
            </h3>
            <p className="text-xs text-gray-600">استعادة بياناتك من ملف تصدير سابق. سيؤدي هذا لاستبدال البيانات الحالية بالملف المرفوع.</p>
            <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 bg-royal-800 text-white rounded-xl font-bold hover:bg-royal-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-royal-800/20"
            >
            <Upload className="w-5 h-5" />
            استعادة من ملف
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
          </div>
        </div>

        {role === 'admin' && (
            <div className="mt-10 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-3">
                    <Trash2 className="w-6 h-6 text-red-600" />
                    <div>
                        <p className="font-bold text-red-800">منطقة الخطر</p>
                        <p className="text-xs text-red-600">سيتم مسح كافة البيانات المسجلة على هذا الجهاز.</p>
                    </div>
                </div>
                <button 
                    onClick={() => requestAuth(onReset)}
                    className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-600 hover:text-white transition-all"
                >
                    مسح النظام بالكامل
                </button>
            </div>
            </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex gap-4">
         <AlertCircle className="w-8 h-8 text-amber-600 shrink-0" />
         <div>
            <h4 className="font-bold text-amber-800 mb-1">لماذا نهتم بالمساحة؟</h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              يقوم المتصفح بتخصيص 5 ميجابايت فقط لهذا التطبيق. لدعم 100+ منتج، نقوم بضغط الصور التي ترفعها بشكل تلقائي وتصغير حجمها لضمان أن كل منتج لا يتخطى بضعة كيلوبايتات، مما يحافظ على سرعة النظام واستقراره.
            </p>
         </div>
      </div>
    </div>
  );
};