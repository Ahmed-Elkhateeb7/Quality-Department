
import React, { useState, useRef } from 'react';
import { CompanySettings, UserRole } from '../types';
import { 
  Building2, MapPin, Phone, Mail, Globe, Upload, Save, 
  BadgeCheck, FileText, Camera, Award, ShieldCheck, 
  Briefcase, Fingerprint, ExternalLink
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
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-royal-800 rounded-2xl text-white shadow-lg shadow-royal-800/20">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">هوية المنشأة</h2>
            <p className="text-gray-500 text-sm">إدارة المعلومات الأساسية والرموز الرسمية للمنظمة</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <AnimatePresence>
            {isSaved && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold border border-emerald-100"
              >
                <BadgeCheck className="w-5 h-5" />
                تم التحديث
              </motion.div>
            )}
          </AnimatePresence>

          {!isReadOnly && (
            <button 
                onClick={handleSubmit}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-royal-800 text-white rounded-2xl font-black hover:bg-royal-900 transition-all shadow-xl shadow-royal-800/20 active:scale-95"
            >
                <Save className="w-5 h-5" />
                حفظ التغييرات
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Corporate Identity Preview */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-royal-900/5 border border-royal-100 sticky top-6">
             {/* Header Decorative Pattern */}
             <div className="h-32 bg-royal-800 relative">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute -bottom-12 right-1/2 translate-x-1/2">
                    <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl border-4 border-white flex items-center justify-center overflow-hidden">
                        {formData.logo ? (
                            <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                            <Building2 className="w-12 h-12 text-gray-200" />
                        )}
                        {!isReadOnly && (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                                <Camera className="w-8 h-8" />
                            </button>
                        )}
                    </div>
                </div>
             </div>

             <div className="pt-16 pb-8 px-8 text-center">
                <h3 className="text-2xl font-black text-gray-900 mb-1">{formData.name || 'اسم المنشأة'}</h3>
                <p className="text-royal-600 font-bold mb-8">{formData.slogan || 'شعار الجودة الرسمي'}</p>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-right group hover:bg-royal-50 transition-colors">
                        <div className="p-2 bg-white rounded-lg text-royal-600 shadow-sm group-hover:bg-royal-600 group-hover:text-white transition-all">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-bold text-gray-400">المقر الرئيسي</p>
                            <p className="text-xs font-bold text-gray-700 truncate">{formData.address || 'لم يحدد بعد'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-right group hover:bg-royal-50 transition-colors">
                            <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm mb-2 w-fit group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <Phone className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-400">الهاتف</p>
                            <p className="text-xs font-bold text-gray-700 dir-ltr truncate">{formData.phone || '-'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-right group hover:bg-royal-50 transition-colors">
                            <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm mb-2 w-fit group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <Mail className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-400">البريد</p>
                            <p className="text-xs font-bold text-gray-700 truncate">{formData.email || '-'}</p>
                        </div>
                    </div>

                    {formData.website && (
                        <div className="flex items-center justify-between bg-royal-50 p-4 rounded-2xl border border-royal-100">
                             <div className="flex items-center gap-3">
                                <Globe className="w-4 h-4 text-royal-600" />
                                <span className="text-xs font-bold text-royal-800 truncate">{formData.website}</span>
                             </div>
                             <ExternalLink className="w-3 h-3 text-royal-400" />
                        </div>
                    )}
                </div>

                {formData.certificates && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2 mb-4 bg-amber-50 py-1.5 rounded-full border border-amber-100">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span className="text-[10px] font-black text-amber-800">شهادات الجودة المعتمدة</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                        {formData.certificates.split(',').map((cert, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white border border-gray-200 text-[10px] font-bold text-gray-600 rounded-lg shadow-sm">
                                {cert.trim()}
                            </span>
                        ))}
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Configuration Form */}
        <div className="lg:col-span-8 space-y-8">
           <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
              <div className="space-y-10">
                  {/* Identity Section */}
                  <section>
                      <div className="flex items-center gap-3 mb-8">
                          <Fingerprint className="w-6 h-6 text-royal-800" />
                          <h4 className="text-lg font-black text-gray-800">بيانات التعريف القانونية</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <label className="text-sm font-bold text-gray-600 mr-2">اسم المنشأة الرسمي</label>
                              <div className="relative">
                                  <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                  <input 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full pr-12 pl-4 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-royal-500/10 focus:border-royal-500 outline-none font-bold text-gray-800 bg-gray-50/30 transition-all disabled:opacity-60"
                                    placeholder="أدخل الاسم الرسمي للشركة"
                                    disabled={isReadOnly}
                                  />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-bold text-gray-600 mr-2">السجل التجاري / الترخيص</label>
                              <div className="relative">
                                  <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                  <input 
                                    value={formData.registrationNumber}
                                    onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                                    className="w-full pr-12 pl-4 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-royal-500/10 focus:border-royal-500 outline-none font-mono text-center font-bold text-royal-800 bg-gray-50/30 disabled:opacity-60"
                                    placeholder="CR-00000000"
                                    disabled={isReadOnly}
                                  />
                              </div>
                          </div>
                          <div className="md:col-span-2 space-y-2">
                              <label className="text-sm font-bold text-gray-600 mr-2">الشعار اللفظي (Slogan)</label>
                              <input 
                                value={formData.slogan}
                                onChange={(e) => setFormData({...formData, slogan: e.target.value})}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-royal-500/10 focus:border-royal-500 outline-none font-bold text-gray-800 bg-gray-50/30 disabled:opacity-60"
                                placeholder="مثال: الجودة أساس تميزنا"
                                disabled={isReadOnly}
                              />
                          </div>
                      </div>
                  </section>
                  
                  <div className="w-full h-px bg-gray-100" />

                  {/* Contact Section */}
                  <section>
                      <div className="flex items-center gap-3 mb-8">
                          <Briefcase className="w-6 h-6 text-royal-800" />
                          <h4 className="text-lg font-black text-gray-800">معلومات الاتصال والمقر</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2 space-y-2">
                              <label className="text-sm font-bold text-gray-600 mr-2">العنوان الوطني</label>
                              <div className="relative">
                                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    className="w-full pr-12 pl-4 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-royal-500/10 focus:border-royal-500 outline-none bg-gray-50/30 disabled:opacity-60"
                                    placeholder="أدخل العنوان التفصيلي"
                                    disabled={isReadOnly}
                                />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-bold text-gray-600 mr-2">البريد الإلكتروني الرسمي</label>
                              <input 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-royal-500/10 focus:border-royal-500 outline-none text-left font-bold text-gray-700 bg-gray-50/30 disabled:opacity-60"
                                placeholder="office@company.com"
                                dir="ltr"
                                disabled={isReadOnly}
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-bold text-gray-600 mr-2">رقم التواصل</label>
                              <input 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-royal-500/10 focus:border-royal-500 outline-none text-left font-bold text-gray-700 bg-gray-50/30 disabled:opacity-60"
                                placeholder="+966"
                                dir="ltr"
                                disabled={isReadOnly}
                              />
                          </div>
                      </div>
                  </section>

                  <div className="w-full h-px bg-gray-100" />

                  {/* Certifications Section */}
                  <section>
                      <div className="flex items-center gap-3 mb-8">
                          <Award className="w-6 h-6 text-royal-800" />
                          <h4 className="text-lg font-black text-gray-800">التوثيق وشهادات الاعتماد</h4>
                      </div>
                      <div className="space-y-4">
                          <label className="text-sm font-bold text-gray-600 mr-2">الشهادات والاعتمادات (افصل بينهم بفاصلة)</label>
                          <div className="relative">
                            <FileText className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
                            <textarea 
                                value={formData.certificates || ''}
                                onChange={(e) => setFormData({...formData, certificates: e.target.value})}
                                className="w-full pr-12 pl-4 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-royal-500/10 focus:border-royal-500 outline-none min-h-[120px] bg-gray-50/30 font-bold text-royal-900 disabled:opacity-60"
                                placeholder="مثال: ISO 9001, ISO 14001, OHSAS 18001"
                                disabled={isReadOnly}
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 mr-2">تستخدم هذه البيانات في تذييل التقارير الرسمية.</p>
                      </div>
                  </section>
              </div>

              {/* Invisible hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isReadOnly}
              />
           </form>
        </div>
      </div>
    </div>
  );
};
