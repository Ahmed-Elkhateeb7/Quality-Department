
import React, { useState, useRef } from 'react';
import { CompanySettings, UserRole } from '../types';
import { Building2, MapPin, Phone, Mail, Globe, Upload, Save, BadgeCheck, FileText, Camera, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompanySettingsProps {
  settings: CompanySettings;
  onSave: (settings: CompanySettings) => void;
  requestAuth: (action: () => void) => void;
  role: UserRole | null;
}

export const CompanySettingsPanel: React.FC<CompanySettingsProps> = ({ settings, onSave, requestAuth, role }) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'admin') {
        requestAuth(() => {
          onSave(formData);
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 3000);
        });
    }
  };

  const isReadOnly = role !== 'admin';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-royal-800" />
            بيانات المنشأة
          </h2>
          <p className="text-gray-500 mt-1">تخصيص هوية الشركة، الشعار، ومعلومات التواصل التي تظهر في التقارير.</p>
        </div>
        
        {isSaved && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm"
          >
            <BadgeCheck className="w-5 h-5" />
            تم حفظ التغييرات بنجاح
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-royal-900/5 border border-royal-100 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-royal-50 to-white -z-0" />
             <div className="relative z-10">
                <div className="w-32 h-32 mx-auto bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center mb-4 overflow-hidden">
                    {formData.logo ? (
                        <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                        <Building2 className="w-12 h-12 text-gray-300" />
                    )}
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-1">{formData.name || 'اسم الشركة'}</h3>
                <p className="text-sm text-royal-600 font-medium mb-6">{formData.slogan || 'شعار الشركة'}</p>
                
                <div className="space-y-3 text-right">
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                        <MapPin className="w-4 h-4 text-royal-500 shrink-0" />
                        <span className="truncate">{formData.address || 'العنوان غير محدد'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                        <Phone className="w-4 h-4 text-royal-500 shrink-0" />
                        <span className="truncate" dir="ltr">{formData.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                        <Mail className="w-4 h-4 text-royal-500 shrink-0" />
                        <span className="truncate">{formData.email || '-'}</span>
                    </div>
                </div>

                {formData.certificates && (
                  <div className="mt-4 pt-4 border-t border-royal-100 text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-bold text-gray-500">الشهادات المعتمدة</h4>
                    </div>
                    <p className="text-sm font-semibold text-royal-800 leading-relaxed whitespace-pre-wrap">{formData.certificates}</p>
                  </div>
                )}
             </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl">
              <h4 className="font-bold text-amber-800 text-sm mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  ملاحظة هامة
              </h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                  هذه البيانات ستظهر تلقائياً في ترويسة (Header) جميع التقارير المطبوعة والمصدرة من النظام، بالإضافة إلى القائمة الجانبية.
              </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
           <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="space-y-8">
                  {/* Logo Upload */}
                  <div>
                      <label className="block text-sm font-black text-gray-700 mb-4">شعار الشركة</label>
                      <div className="flex items-center gap-6">
                          <div 
                            onClick={() => !isReadOnly && fileInputRef.current?.click()}
                            className={`w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center transition-all group ${!isReadOnly ? 'hover:border-royal-500 hover:bg-royal-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                          >
                              <Upload className="w-6 h-6 text-gray-400 group-hover:text-royal-600 mb-1" />
                              <span className="text-[10px] text-gray-500 font-bold">رفع شعار</span>
                          </div>
                          <div className="flex-1">
                              <p className="text-sm font-bold text-gray-800 mb-1">تغيير الشعار الرسمي</p>
                              <p className="text-xs text-gray-500">يفضل استخدام صورة مربعة بخلفية شفافة (PNG) وبجودة عالية.</p>
                          </div>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isReadOnly}
                      />
                  </div>
                  
                  <div className="w-full h-px bg-gray-100" />

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className="text-sm font-black text-gray-700">اسم المنشأة</label>
                          <input 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none font-bold text-gray-700 disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="مثال: شركة الصناعات المتطورة"
                            disabled={isReadOnly}
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-black text-gray-700">الوصف المختصر / الشعار اللفظي</label>
                          <input 
                            value={formData.slogan}
                            onChange={(e) => setFormData({...formData, slogan: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="مثال: جودة لا تضاهى"
                            disabled={isReadOnly}
                          />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-black text-gray-700">العنوان الرسمي</label>
                          <div className="relative">
                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="المدينة، المنطقة، اسم الشارع، رقم المبنى"
                                disabled={isReadOnly}
                            />
                          </div>
                      </div>
                  </div>

                  <div className="w-full h-px bg-gray-100" />

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className="text-sm font-black text-gray-700">البريد الإلكتروني الرسمي</label>
                          <div className="relative">
                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none text-left disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="info@company.com"
                                dir="ltr"
                                disabled={isReadOnly}
                            />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-black text-gray-700">رقم الهاتف / الجوال</label>
                          <div className="relative">
                            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none text-left disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="+966 11 000 0000"
                                dir="ltr"
                                disabled={isReadOnly}
                            />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-black text-gray-700">الموقع الإلكتروني</label>
                          <div className="relative">
                            <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                value={formData.website}
                                onChange={(e) => setFormData({...formData, website: e.target.value})}
                                className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none text-left disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="www.company.com"
                                dir="ltr"
                                disabled={isReadOnly}
                            />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-black text-gray-700">رقم السجل التجاري / الترخيص</label>
                          <input 
                            value={formData.registrationNumber}
                            onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none font-mono text-center disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="1010xxxxxx"
                            disabled={isReadOnly}
                          />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-black text-gray-700">الشهادات المعتمدة</label>
                          <div className="relative">
                            <Award className="absolute right-4 top-3 w-5 h-5 text-gray-400" />
                            <textarea 
                                value={formData.certificates || ''}
                                onChange={(e) => setFormData({...formData, certificates: e.target.value})}
                                className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none min-h-[100px] disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="مثال: ISO 9001:2015, ISO 14001:2015..."
                                disabled={isReadOnly}
                            />
                          </div>
                      </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                      {role === 'admin' && (
                        <button 
                            type="submit"
                            className="px-8 py-4 bg-royal-800 text-white rounded-2xl font-black hover:bg-royal-900 transition-all shadow-xl shadow-royal-800/20 active:scale-95 flex items-center gap-3"
                        >
                            <Save className="w-5 h-5" />
                            حفظ وتحديث البيانات
                        </button>
                      )}
                  </div>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};
