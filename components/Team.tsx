
import React, { useState, useRef } from 'react';
import { Employee, UserRole } from '../types';
import { Search, UserPlus, Microscope, ShieldCheck, Briefcase, Trash2, Mail, Phone, Calendar, Edit2, X, Users, CheckCircle, Upload, Camera, Fingerprint, Info, Contact2, Settings2, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamProps {
  team: Employee[];
  setTeam: React.Dispatch<React.SetStateAction<Employee[]>>;
  requestAuth: (action: () => void) => void;
  role: UserRole | null;
}

export const Team: React.FC<TeamProps> = ({ team, setTeam, requestAuth, role }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    role: '',
    employeeCode: '',
    department: 'qc',
    email: '',
    phone: '',
    joinedDate: new Date().toISOString().split('T')[0],
    image: '',
    stampData: ''
  });

  const filteredTeam = team.filter(member => 
    member.name.includes(searchTerm) || 
    member.role.includes(searchTerm) ||
    member.id.includes(searchTerm) ||
    (member.employeeCode && member.employeeCode.includes(searchTerm))
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
        name: '',
        role: '',
        employeeCode: '',
        department: 'qc',
        email: '',
        phone: '',
        joinedDate: new Date().toISOString().split('T')[0],
        image: '',
        stampData: ''
    });
    setEditingMember(null);
  };

  const handleOpenAdd = () => {
    requestAuth(() => {
      resetForm();
      setIsModalOpen(true);
    });
  };

  const handleOpenEdit = (member: Employee) => {
    requestAuth(() => {
      setEditingMember(member);
      setFormData(member);
      setIsModalOpen(true);
    });
  };

  const handleDelete = (id: string) => {
    requestAuth(() => {
      setTeam(prev => prev.filter(m => m.id !== id));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      setTeam(prev => prev.map(m => m.id === editingMember.id ? { ...formData, id: m.id } as Employee : m));
    } else {
      const newMember: Employee = {
        id: Date.now().toString(),
        ...(formData as Omit<Employee, 'id'>),
        image: formData.image || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop'
      };
      setTeam(prev => [newMember, ...prev]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const getDepartmentIcon = (dept: string) => {
    switch (dept) {
        case 'management': return <Briefcase className="w-5 h-5 text-purple-600" />;
        case 'qa': return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
        default: return <Microscope className="w-5 h-5 text-blue-600" />;
    }
  };

  const getDepartmentLabel = (dept: string) => {
    switch (dept) {
        case 'management': return 'الإدارة العليا';
        case 'qa': return 'توكيد الجودة (QA)';
        default: return 'مراقبة الجودة (QC)';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">فريق الجودة</h2>
          <p className="text-gray-500">إدارة هيكل الموظفين وصلاحيات التفتيش</p>
        </div>
        
        {role === 'admin' && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-6 py-3 bg-royal-800 text-white rounded-xl hover:bg-royal-900 transition-all shadow-lg shadow-royal-800/20 active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            تسجيل موظف جديد
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
                type="text" 
                placeholder="بحث باسم الموظف، كود الموظف، أو المسمى الوظيفي..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-royal-500 outline-none transition-all"
            />
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
            <Users className="w-5 h-5" />
            <span>العدد الكلي: <span className="font-bold text-royal-800">{team.length}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
            {filteredTeam.map((member) => (
                <motion.div
                    key={member.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-royal-50 to-white -z-0" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full p-1 bg-white border-2 border-royal-100 shadow-lg mb-4 relative">
                            <img src={member.image} alt={member.name} className="w-full h-full rounded-full object-cover" />
                            <div className="absolute bottom-0 right-0 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white" title="Active"></div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                        <p className="text-royal-600 font-medium text-sm mb-4">{member.role}</p>

                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-200 mb-6">
                            {getDepartmentIcon(member.department)}
                            <span className="text-xs font-bold text-gray-600">{getDepartmentLabel(member.department)}</span>
                        </div>

                        <div className="w-full space-y-3 border-t border-gray-100 pt-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> البريد
                                </span>
                                <span className="font-medium text-gray-700 truncate max-w-[150px]">{member.email}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> الهاتف
                                </span>
                                <span className="font-medium text-gray-700 dir-ltr">{member.phone}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> الانضمام
                                </span>
                                <span className="font-medium text-gray-700">{member.joinedDate}</span>
                            </div>
                             <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 flex items-center gap-2">
                                    <Hash className="w-4 h-4" /> كود الموظف
                                </span>
                                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{member.employeeCode || member.id}</span>
                            </div>
                        </div>

                        {/* ID Card Badge Effect */}
                        {member.stampData && (
                            <div className="mt-4 w-full bg-royal-50 p-2 rounded-lg border border-dashed border-royal-200 flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4 text-royal-600" />
                                <span className="text-xs font-bold text-royal-700">ختم الجودة: {member.stampData}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions - Only visible to Admin */}
                    {role === 'admin' && (
                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleOpenEdit(member); }}
                                className="p-2 bg-white text-gray-600 hover:text-royal-600 rounded-lg shadow-md border border-gray-100 hover:bg-royal-50 transition-colors"
                                title="تعديل البيانات"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(member.id); }}
                                className="p-2 bg-white text-gray-600 hover:text-red-600 rounded-lg shadow-md border border-gray-100 hover:bg-red-50 transition-colors"
                                title="حذف الموظف"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        {editingMember ? <Settings2 className="w-6 h-6 text-royal-600" /> : <UserPlus className="w-6 h-6 text-royal-600" />}
                        {editingMember ? 'تعديل بيانات الموظف' : 'إضافة عضو جديد'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto">
                    <div className="flex flex-col items-center mb-8">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-32 h-32 rounded-full border-4 border-dashed border-gray-200 hover:border-royal-500 cursor-pointer relative overflow-hidden group transition-all"
                        >
                            {formData.image ? (
                                <img src={formData.image} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 group-hover:text-royal-500 group-hover:bg-royal-50">
                                    <Camera className="w-8 h-8 mb-1" />
                                    <span className="text-[10px] font-bold">رفع صورة</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <p className="text-xs text-gray-500 mt-2">اضغط على الدائرة لرفع صورة شخصية</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">الاسم الكامل</label>
                            <input 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none"
                                placeholder="محمد أحمد..."
                            />
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">المسمى الوظيفي</label>
                            <input 
                                required
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none"
                                placeholder="مراقب جودة..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">القسم</label>
                            <select 
                                value={formData.department}
                                onChange={(e) => setFormData({...formData, department: e.target.value as any})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none bg-white"
                            >
                                <option value="qc">مراقبة الجودة (QC)</option>
                                <option value="qa">توكيد الجودة (QA)</option>
                                <option value="management">الإدارة العليا</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">كود / ختم الجودة</label>
                            <div className="relative">
                                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    value={formData.stampData}
                                    onChange={(e) => setFormData({...formData, stampData: e.target.value})}
                                    className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none font-mono"
                                    placeholder="QC-01"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">كود الموظف</label>
                            <div className="relative">
                                <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    value={formData.employeeCode || ''}
                                    onChange={(e) => setFormData({...formData, employeeCode: e.target.value})}
                                    className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none font-mono"
                                    placeholder="EMP-01"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">البريد الإلكتروني</label>
                            <input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none text-left"
                                placeholder="name@company.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">رقم الهاتف</label>
                            <input 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none text-left"
                                placeholder="+966..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-8 mt-4 border-t border-gray-100">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 py-3 bg-royal-800 text-white rounded-xl font-bold hover:bg-royal-900 transition-all shadow-lg shadow-royal-800/20"
                        >
                            حفظ البيانات
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
      )}
    </div>
  );
};
