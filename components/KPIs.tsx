
import React, { useState } from 'react';
import { KPIData, UserRole } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, LineChart, Line, ComposedChart 
} from 'recharts';
import { 
  FileSpreadsheet, Plus, X, Boxes, Trash2, ShoppingCart, 
  TrendingUp, ShieldCheck, Activity, History, MessageSquareWarning, FileDown,
  ChevronRight, ChevronLeft, Target, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

interface KPIProps {
  data: KPIData[];
  setData: React.Dispatch<React.SetStateAction<KPIData[]>>;
  requestAuth: (action: () => void) => void;
  role: UserRole | null;
}

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

// Expanded years range from 2010 to 2060
const YEARS_RANGE = Array.from({ length: 51 }, (_, i) => (2010 + i).toString());

// Custom Tooltip Component for a polished look
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl text-white text-right font-sans">
        <p className="font-bold mb-2 border-b border-slate-700 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm py-0.5">
            <span style={{ color: entry.color }} className="font-bold">{entry.value.toLocaleString()}</span>
            <span className="text-slate-300">{entry.name}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const KPIs: React.FC<KPIProps> = ({ data, setData, requestAuth, role }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');
  const [newData, setNewData] = useState<Partial<KPIData>>({
    month: ARABIC_MONTHS[new Date().getMonth()],
    year: new Date().getFullYear().toString(),
    qualityRate: 95, defects: 0,
    reservedBlowPieces: 0, reservedBlowWeight: 0,
    reservedInjectionPieces: 0, reservedInjectionWeight: 0,
    scrappedPieces: 0, scrappedWeight: 0,
    scrappedBlow: 0, scrappedInjection: 0,
    internalScrapPpm: 0, externalScrapPpm: 0,
    ncrShift1: 0, ncrShift2: 0, ncrShift3: 0,
    totalSupplied: 0, totalReturned: 0, totalComplaints: 0
  });

  const handleAddData = () => {
    requestAuth(() => {
        setIsModalOpen(true);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newData.month && newData.year) {
        setData(prev => {
            // Remove any existing entry for the same month and year to avoid duplicates
            const filteredPrev = prev.filter(
                item => !(item.month === newData.month && item.year === newData.year)
            );
            // Append the new data
            return [...filteredPrev, newData as KPIData];
        });
        
        setIsModalOpen(false);
        setNewData({
            month: ARABIC_MONTHS[new Date().getMonth()],
            year: new Date().getFullYear().toString(),
            qualityRate: 95, defects: 0,
            reservedBlowPieces: 0, reservedBlowWeight: 0,
            reservedInjectionPieces: 0, reservedInjectionWeight: 0,
            scrappedPieces: 0, scrappedWeight: 0,
            scrappedBlow: 0, scrappedInjection: 0,
            internalScrapPpm: 0, externalScrapPpm: 0,
            ncrShift1: 0, ncrShift2: 0, ncrShift3: 0,
            totalSupplied: 0, totalReturned: 0, totalComplaints: 0
        });
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'الشهر', 'السنة', 'نسبة الجودة %', 'عدد العيوب', 
      'محجوز نفخ (قطعة)', 'محجوز نفخ (وزن)', 
      'محجوز حقن (قطعة)', 'محجوز حقن (وزن)', 
      'هالك نفخ (قطعة)', 'هالك نفخ (وزن)', 'هالك حقن (قطعة)', 'هالك حقن (وزن)',
      'هالك PPM داخلي', 'هالك PPM خارجي',
      'عدم مطابقة وردية أ', 'عدم مطابقة وردية ب', 'عدم مطابقة وردية ج', 
      'إجمالي المورد', 'إجمالي المرتجع', 'إجمالي الشكاوى'
    ];
    
    const csvRows = data.map(d => [
      d.month,
      d.year,
      d.qualityRate,
      d.defects,
      d.reservedBlowPieces,
      d.reservedBlowWeight,
      d.reservedInjectionPieces,
      d.reservedInjectionWeight,
      d.scrappedBlow,
      d.scrappedWeight,
      d.scrappedInjection,
      d.scrappedPieces,
      d.internalScrapPpm,
      d.externalScrapPpm,
      d.ncrShift1,
      d.ncrShift2,
      d.ncrShift3,
      d.totalSupplied,
      d.totalReturned,
      d.totalComplaints
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KPI_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ChartCard = ({ title, icon: Icon, color, children }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-royal-200/30 transition-all duration-500"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${color} bg-opacity-10 shadow-inner`}>
              <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          <h3 className="text-xl font-black text-slate-800">{title}</h3>
        </div>
      </div>
      {children}
    </motion.div>
  );

  // Filter and Format Data for Charts
  const chartData = data
    .filter(d => selectedYearFilter === 'all' || d.year === selectedYearFilter)
    .map(d => ({
      ...d,
      displayLabel: `${d.month} ${d.year}`
    }));

  const adjustYear = (direction: 'next' | 'prev') => {
    const currentIdx = YEARS_RANGE.indexOf(newData.year || '');
    if (direction === 'next' && currentIdx < YEARS_RANGE.length - 1) {
      setNewData({ ...newData, year: YEARS_RANGE[currentIdx + 1] });
    } else if (direction === 'prev' && currentIdx > 0) {
      setNewData({ ...newData, year: YEARS_RANGE[currentIdx - 1] });
    }
  };

  return (
    <div className="space-y-10 pb-20 px-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="bg-royal-800 p-2 rounded-xl text-white">
                <History className="w-7 h-7" />
            </div>
            لوحة قيادة الجودة السنوية
          </h2>
          <p className="text-slate-500 mt-1 font-medium mr-12">تحليل بصري متقدم لكافة معايير الجودة والإنتاج</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto items-center">
            {/* Year Filter Dropdown */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm">
                <Calendar className="w-5 h-5 text-royal-600" />
                <span className="text-sm font-bold text-slate-600">تصفية حسب السنة:</span>
                <select 
                    value={selectedYearFilter}
                    onChange={(e) => setSelectedYearFilter(e.target.value)}
                    className="bg-transparent outline-none font-black text-royal-800 cursor-pointer"
                >
                    <option value="all">الكل</option>
                    {YEARS_RANGE.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {role === 'admin' && (
                <button onClick={handleAddData} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all font-bold shadow-sm">
                    <Plus className="w-5 h-5" />
                    تحديث البيانات
                </button>
            )}
            <button 
                onClick={handleExportCSV}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-royal-800 text-white rounded-2xl hover:bg-royal-900 transition-all shadow-xl shadow-royal-800/30 font-bold"
            >
                <FileSpreadsheet className="w-5 h-5" />
                تصدير CSV
            </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
            <Activity className="w-20 h-20 text-slate-200 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-400">لا توجد بيانات متاحة للسنة المختارة</h3>
            <p className="text-slate-400 mt-2 font-medium">قم بإضافة تقارير جديدة لعرض التحليلات هنا</p>
        </div>
      ) : (
        <>
            {/* Primary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <ChartCard title="إحصائيات التوريد والمرتجعات" icon={ShoppingCart} color="bg-emerald-500">
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="displayLabel" fontSize={11} fontWeight={700} stroke="#64748b" axisLine={false} tickLine={false} />
                        <YAxis fontSize={12} fontWeight={700} stroke="#64748b" axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
                        <Bar dataKey="totalSupplied" name="الكمية الموردة" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={25} />
                        <Bar dataKey="totalReturned" name="المرتجعات" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={25} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                </ChartCard>

                <ChartCard title="مؤشر الهالك في المليون (PPM)" icon={Target} color="bg-rose-600">
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="displayLabel" fontSize={11} fontWeight={700} stroke="#64748b" axisLine={false} tickLine={false} />
                        <YAxis fontSize={12} fontWeight={700} stroke="#64748b" axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="plainline" />
                        <Line type="monotone" dataKey="internalScrapPpm" name="PPM داخلي" stroke="#e11d48" strokeWidth={4} dot={{ r: 6, fill: '#e11d48', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="externalScrapPpm" name="PPM خارجي" stroke="#1e40af" strokeWidth={4} dot={{ r: 6, fill: '#1e40af', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                    </LineChart>
                    </ResponsiveContainer>
                </div>
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <ChartCard title="تطور مخزون المحجوز (سنوياً)" icon={Boxes} color="bg-royal-500">
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                        <linearGradient id="gradBlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="gradInj" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="displayLabel" fontSize={11} fontWeight={600} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <YAxis fontSize={12} fontWeight={600} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="rect" />
                        <Area type="monotone" dataKey="reservedBlowPieces" name="محجوز نفخ" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#gradBlow)" />
                        <Area type="monotone" dataKey="reservedInjectionPieces" name="محجوز حقن" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#gradInj)" />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
                </ChartCard>

                <ChartCard title="تحليل فاقد الهالك (سنوياً)" icon={Trash2} color="bg-rose-500">
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="displayLabel" fontSize={11} fontWeight={600} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <YAxis fontSize={12} fontWeight={600} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="scrappedWeight" name="وزن النفخ الهالك" fill="#fecdd3" radius={[8, 8, 0, 0]} barSize={40} />
                        <Line type="monotone" dataKey="scrappedBlow" name="عدد النفخ الهالك" stroke="#e11d48" strokeWidth={3} dot={{ r: 6, fill: '#e11d48', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                    </ComposedChart>
                    </ResponsiveContainer>
                </div>
                </ChartCard>
            </div>

            <ChartCard title="تقارير عدم المطابقة حسب الورادي" icon={ShieldCheck} color="bg-royal-800">
                <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="displayLabel" fontSize={11} fontWeight={700} stroke="#64748b" axisLine={false} tickLine={false} />
                    <YAxis fontSize={12} fontWeight={700} stroke="#64748b" axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="ncrShift1" name="وردية أ" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="ncrShift2" name="وردية ب" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="ncrShift3" name="وردية ج" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </ChartCard>
        </>
      )}

      {/* Modal for adding data */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 md:p-10">
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.98 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl p-6 md:p-12 max-h-[92vh] overflow-y-auto border border-white/20 relative"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="bg-royal-800 p-3 rounded-2xl text-white shadow-lg shadow-royal-800/20">
                        <Plus className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900">إضافة تقرير أداء جديد</h3>
                        <p className="text-slate-500 font-medium mt-1">يرجى ملء كافة الحقول بدقة لضمان صحة التحليلات</p>
                    </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all border border-transparent hover:border-red-100">
                    <X className="w-8 h-8" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Section 1: Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-3">
                        <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                             السنة
                        </label>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => adjustYear('prev')} className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-royal-50 hover:text-royal-700 transition-all shadow-sm">
                              <ChevronRight className="w-5 h-5" />
                            </button>
                            <select 
                              required 
                              value={newData.year} 
                              onChange={(e) => setNewData({...newData, year: e.target.value})} 
                              className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-royal-500/10 focus:border-royal-500 outline-none font-bold text-slate-700 bg-slate-50/50 appearance-none text-center"
                            >
                              {YEARS_RANGE.map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                            <button type="button" onClick={() => adjustYear('next')} className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-royal-50 hover:text-royal-700 transition-all shadow-sm">
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-black text-slate-700 flex items-center gap-2">الشهر</label>
                        <select 
                          required 
                          value={newData.month} 
                          onChange={(e) => setNewData({...newData, month: e.target.value})} 
                          className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-royal-500/10 focus:border-royal-500 outline-none font-bold text-slate-700 bg-slate-50/50 appearance-none"
                        >
                          {ARABIC_MONTHS.map(month => <option key={month} value={month}>{month}</option>)}
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-black text-slate-700">معدل الجودة %</label>
                        <input type="number" required min="0" max="100" value={newData.qualityRate} onChange={(e) => setNewData({...newData, qualityRate: Number(e.target.value)})} className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-royal-500/10 focus:border-royal-500 outline-none font-bold text-slate-700 bg-slate-50/50" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-black text-slate-700">عدد العيوب</label>
                        <input type="number" required value={newData.defects} onChange={(e) => setNewData({...newData, defects: Number(e.target.value)})} className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-royal-500/10 focus:border-royal-500 outline-none font-bold text-slate-700 bg-slate-50/50" />
                    </div>
                </div>

                {/* Section 2: Production Storage */}
                <div className="bg-royal-50/40 p-10 rounded-[2.5rem] border border-royal-100">
                    <h4 className="font-black text-royal-900 mb-8 flex items-center gap-3 text-lg">
                        <Boxes className="w-6 h-6 text-royal-600" /> كميات الإنتاج المحجوز (Reserved)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 mr-1">عدد النفخ</label>
                            <input type="number" placeholder="0" onChange={(e) => setNewData({...newData, reservedBlowPieces: Number(e.target.value)})} className="w-full px-5 py-3.5 rounded-xl border border-white bg-white shadow-sm outline-none focus:ring-4 focus:ring-royal-500/10" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 mr-1">وزن النفخ</label>
                            <input type="number" step="0.01" placeholder="0.00" onChange={(e) => setNewData({...newData, reservedBlowWeight: Number(e.target.value)})} className="w-full px-5 py-3.5 rounded-xl border border-white bg-white shadow-sm outline-none focus:ring-4 focus:ring-royal-500/10" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 mr-1">عدد الحقن</label>
                            <input type="number" placeholder="0" onChange={(e) => setNewData({...newData, reservedInjectionPieces: Number(e.target.value)})} className="w-full px-5 py-3.5 rounded-xl border border-white bg-white shadow-sm outline-none focus:ring-4 focus:ring-royal-500/10" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 mr-1">وزن الحقن</label>
                            <input type="number" step="0.01" placeholder="0.00" onChange={(e) => setNewData({...newData, reservedInjectionWeight: Number(e.target.value)})} className="w-full px-5 py-3.5 rounded-xl border border-white bg-white shadow-sm outline-none focus:ring-4 focus:ring-royal-500/10" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Section 3: Scrap */}
                    <div className="bg-rose-50/40 p-10 rounded-[2.5rem] border border-rose-100">
                        <h4 className="font-black text-rose-900 mb-8 flex items-center gap-3 text-lg">
                            <Trash2 className="w-6 h-6 text-rose-600" /> بيانات الهالك (Scrap)
                        </h4>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 mr-1">عدد النفخ</label>
                                <input type="number" placeholder="0" onChange={(e) => setNewData({...newData, scrappedBlow: Number(e.target.value)})} className="w-full px-5 py-3.5 rounded-xl bg-white border-white outline-none shadow-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 mr-1">وزن النفخ</label>
                                <input type="number" step="0.01" placeholder="0.00" onChange={(e) => setNewData({...newData, scrappedWeight: Number(e.target.value)})} className="w-full px-5 py-3.5 rounded-xl bg-white border-white outline-none shadow-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 mr-1">عدد الحقن</label>
                                <input type="number" placeholder="0" onChange={(e) => setNewData({...newData, scrappedInjection: Number(e.target.value)})} className="w-full px-5 py-3.5 rounded-xl bg-white border-white outline-none shadow-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 mr-1">وزن الحقن</label>
                                <input type="number" step="0.01" placeholder="0.00" onChange={(e) => setNewData({...newData, scrappedPieces: Number(e.target.value)})} className="w-full px-5 py-3.5 rounded-xl bg-white border-white outline-none shadow-sm" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 4: PPM */}
                    <div className="bg-indigo-50/40 p-10 rounded-[2.5rem] border border-indigo-100">
                        <h4 className="font-black text-indigo-900 mb-8 flex items-center gap-3 text-lg">
                            <Target className="w-6 h-6 text-indigo-600" /> مؤشرات الهالك PPM
                        </h4>
                        <div className="grid grid-cols-1 gap-8 h-full justify-center">
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-600">PPM داخلي (Internal)</label>
                                <input type="number" placeholder="نسبة الهالك الداخلي لكل مليون" onChange={(e) => setNewData({...newData, internalScrapPpm: Number(e.target.value)})} className="w-full px-6 py-4 rounded-2xl bg-white border-white outline-none font-bold text-rose-600 shadow-md focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-600">PPM خارجي (External)</label>
                                <input type="number" placeholder="نسبة الهالك الخارجي لكل مليون" onChange={(e) => setNewData({...newData, externalScrapPpm: Number(e.target.value)})} className="w-full px-6 py-4 rounded-2xl bg-white border-white outline-none font-bold text-indigo-600 shadow-md focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Section 5: NCR */}
                    <div className="bg-amber-50/40 p-10 rounded-[2.5rem] border border-amber-100">
                        <h4 className="font-black text-amber-900 mb-8 flex items-center gap-3 text-lg">
                            <ShieldCheck className="w-6 h-6 text-amber-600" /> تقارير عدم المطابقة (NCR)
                        </h4>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 text-center block">وردية أ</label>
                                <input type="number" placeholder="0" onChange={(e) => setNewData({...newData, ncrShift1: Number(e.target.value)})} className="w-full px-4 py-4 rounded-xl bg-white border-white outline-none text-center font-bold text-amber-800 shadow-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 text-center block">وردية ب</label>
                                <input type="number" placeholder="0" onChange={(e) => setNewData({...newData, ncrShift2: Number(e.target.value)})} className="w-full px-4 py-4 rounded-xl bg-white border-white outline-none text-center font-bold text-amber-800 shadow-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 text-center block">وردية ج</label>
                                <input type="number" placeholder="0" onChange={(e) => setNewData({...newData, ncrShift3: Number(e.target.value)})} className="w-full px-4 py-4 rounded-xl bg-white border-white outline-none text-center font-bold text-amber-800 shadow-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Section 6: Logistics */}
                    <div className="bg-emerald-50/40 p-10 rounded-[2.5rem] border border-emerald-100">
                        <h4 className="font-black text-emerald-900 mb-8 flex items-center gap-3 text-lg">
                            <ShoppingCart className="w-6 h-6 text-emerald-600" /> بيانات التوريد والشكاوى
                        </h4>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 block">إجمالي المورد</label>
                                <input type="number" placeholder="0" onChange={(e) => setNewData({...newData, totalSupplied: Number(e.target.value)})} className="w-full px-4 py-4 rounded-xl bg-white border-white outline-none shadow-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 block">إجمالي المرتجع</label>
                                <input type="number" placeholder="0" onChange={(e) => setNewData({...newData, totalReturned: Number(e.target.value)})} className="w-full px-4 py-4 rounded-xl bg-white border-white outline-none shadow-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 block">عدد الشكاوى</label>
                                <input type="number" placeholder="0" onChange={(e) => setNewData({...newData, totalComplaints: Number(e.target.value)})} className="w-full px-4 py-4 rounded-xl bg-white border-white outline-none shadow-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <button type="submit" className="w-full py-6 bg-royal-800 text-white rounded-[2rem] font-black text-2xl hover:bg-royal-900 transition-all shadow-2xl shadow-royal-800/40 active:scale-[0.98] flex items-center justify-center gap-4">
                        <ShieldCheck className="w-8 h-8" />
                        اعتماد وإدراج التقرير النهائي
                    </button>
                </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
