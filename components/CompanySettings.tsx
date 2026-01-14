
import React, { useState, useRef } from 'react';
import { CompanySettings, UserRole } from '../types';
import { 
  Building2, MapPin, Phone, Mail, Globe, Upload, Save, 
  BadgeCheck, FileText, Camera, Award, ShieldCheck, 
  ExternalLink, Edit3, X, Info, Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompanySettingsProps {
  settings: CompanySettings;
  onSave: (settings: CompanySettings) => void;
  requestAuth: (action: () => void) => void;
  role: UserRole | null;
}

export const CompanySettingsPanel: React.FC<CompanySettingsProps> = ({ settings, onSave, requestAuth, role }) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenEdit = () => {
    requestAuth(() => {
      setFormData(settings); // مزامنة البيانات قبل الفتح
      setIsEditModalOpen(true);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setIsEditModalOpen(false);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const isAdmin = role === 'admin';

  const InfoCard = ({ icon: Icon, label, value, colorClass }: any) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <div className="overflow-hidden">
        <p className="text-xs font-bold text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-black text-gray-800 leading-tight truncate">{value || 'غير محدد'}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-royal-800 rounded-2xl text-white shadow-lg">
            <Landmark className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">الملف التعريفي للمنشأة</h2>
            <p className="text-gray-500 text-sm">إدارة الهوية الرسمية وبيانات التواصل</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <AnimatePresence>
            {isSaved && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold border border-emerald-100 text-sm"
              >
                <BadgeCheck className="w-4 h-4" />
                تم حفظ التغييرات
              </motion.div>
            )}
          </AnimatePresence>

          {isAdmin && (
            <button 
                onClick={handleOpenEdit}
                title="تحديث بيانات المنشأة"
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-royal-800 text-white rounded-2xl font-black hover:bg-royal-950 transition-all shadow-xl shadow-royal-800/20 active:scale-95"
            >
                <Edit3 className="w-5 h-5" />
                تعديل الهوية
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card (Sidebar-like) */}
        <div className="md:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col items-center p-8 text-center sticky top-6"
          >
            <div className="relative group">
                <div className="w-44 h-44 bg-gray-50 rounded-[2rem] border-2 border-gray-100 shadow-inner flex items-center justify-center mb-6 overflow-hidden">
                {settings.logo ? (
                    <img src={settings.logo} alt="Company Logo" className="w-full h-full object-contain p-4 transition-transform group-hover:scale-110" />
                ) : (
                    <Building2 className="w-20 h-20 text-gray-200" />
                )}
                </div>
                {isAdmin && (
                    <button 
                        onClick={handleOpenEdit}
                        className="absolute bottom-4 right-4 p-3 bg-white text-royal-800 rounded-2xl shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-all hover:bg-royal-50"
                        title="تحديث الشعار"
                    >
                        <Camera className="w-5 h-5" />
                    </button>
                )}
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-2">{settings.name || 'اسم المنشأة'}</h3>
            <p className="text-royal-600 font-bold text-sm italic mb-6">"{settings.slogan || 'شعار الجودة الرسمي'}"</p>

            <div className="w-full space-y-4 pt-6 border-t border-gray-50">
               <div className="flex flex-col items-center gap-1 p-4 bg-gray-50 rounded-2xl">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">السجل التجاري</span>
                  <span className="text-royal-800 font-black font-mono text-lg">{settings.registrationNumber || '---'}</span>
               </div>
               
               {settings.website && (
                 <a href={settings.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-royal-50 text-royal-700 rounded-xl hover:bg-royal-100 transition-all font-bold text-sm">
                    <Globe className="w-4 h-4" />
                    زيارة الموقع الرسمي
                    <ExternalLink className="w-3 h-3" />
                 </a>
               )}
            </div>
          </motion.div>
        </div>

        {/* Details and Certificates */}
        <div className="md:col-span-2 space-y-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard icon={Mail} label="البريد الإلكتروني" value={settings.email} colorClass="bg-blue-600" />
              <InfoCard icon={Phone} label="أرقام التواصل" value={settings.phone} colorClass="bg-emerald-600" />
              <InfoCard icon={MapPin} label="العنوان الجغرافي" value={settings.address} colorClass="bg-rose-600" />
              <InfoCard icon={ShieldCheck} label="التراخيص المعتمدة" value={settings.registrationNumber ? 'سجل تجاري نشط' : 'غير محدد'} colorClass="bg-amber-600" />
           </div>

           {/* Certificates Card */}
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden"
           >
              <div className="absolute top-0 left-0 w-2 h-full bg-amber-400" />
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <Award className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                    <h4 className="text-xl font-black text-gray-800">الاعتمادات الدولية والمحلية</h4>
                    <p className="text-gray-400 text-xs font-bold">قائمة شهادات الجودة الموثقة للمنشأة</p>
                </div>
              </div>
              
              {settings.certificates ? (
                <div className="flex flex-wrap gap-4">
                  {settings.certificates.split(',').map((cert, idx) => (
                    <div 
                      key={idx}
                      className="px-6 py-4 bg-gradient-to-tr from-gray-50 to-white border border-gray-200 rounded-[1.5rem] shadow-sm flex items-center gap-4 hover:border-amber-400 transition-colors group"
                    >
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:rotate-12 transition-transform">
                        <BadgeCheck className="w-5 h-5" />
                      </div>
                      <span className="font-black text-gray-700">{cert.trim()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold">لم يتم إضافة شهادات اعتماد رسمية بعد</p>
                </div>
              )}
           </motion.div>

           {/* Informational Banner */}
           <div className="bg-royal-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl shadow-royal-900/20">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                 <div className="p-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                    <ShieldCheck className="w-16 h-16 text-royal-200" />
                 </div>
                 <div className="text-center md:text-right">
                    <h4 className="text-2xl font-black mb-3">بيانات نظام الجودة (TQM)</h4>
                    <p className="text-royal-100 text-sm leading-relaxed max-w-lg font-medium">
                      هذه البيانات تُستخدم كمرجع رسمي لتوليد الترويسات (Headers) في التقارير المطبوعة والمستندات الرقمية المعتمدة داخل النظام.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-royal-950/60 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            >
              <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-royal-100 text-royal-800 rounded-2xl">
                    <Edit3 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-800">تعديل بيانات المنشأة</h3>
                    <p className="text-gray-500 text-sm">أدخل البيانات الرسمية بدقة لتحديث الهوية الرقمية</p>
                  </div>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-3 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all border border-transparent hover:border-red-100">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-