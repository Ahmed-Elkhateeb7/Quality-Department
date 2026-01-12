import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Product, KPIData } from '../types';
import { Package, AlertOctagon, CheckCircle, TrendingUp, Download, Eye, Activity, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps {
  products: Product[];
  kpiData: KPIData[];
  handleGenerateReport: () => void;
  navigate: (view: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ products, kpiData, handleGenerateReport, navigate }) => {
  const totalProducts = products.length;
  const approvedProducts = products.filter(p => p.status === 'approved').length;
  const rejectedProducts = products.filter(p => p.status === 'rejected').length;
  const pendingProducts = products.filter(p => p.status === 'pending').length;
  
  const complianceRate = totalProducts > 0 ? Math.round((approvedProducts / totalProducts) * 100) : 0;
  
  // Calculate trend (dummy logic for display)
  const lastMonthKPI = kpiData[kpiData.length - 1];
  const prevMonthKPI = kpiData[kpiData.length - 2];
  const trend = lastMonthKPI && prevMonthKPI ? lastMonthKPI.qualityRate - prevMonthKPI.qualityRate : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const handleExportCSV = () => {
    // Headers
    const statsHeaders = ['المقياس', 'القيمة'];
    const kpiHeaders = ['الشهر', 'معدل الجودة (%)', 'عدد العيوب'];
    
    // Data Rows
    const statsRows = [
        ['تقرير ملخص النظام', new Date().toLocaleDateString('ar-EG')],
        ['إجمالي المنتجات', totalProducts],
        ['معدل المطابقة', `${complianceRate}%`],
        ['المنتجات المعتمدة', approvedProducts],
        ['المنتجات المرفوضة', rejectedProducts],
        ['قيد الفحص', pendingProducts],
    ];

    const kpiRows = kpiData.map(d => [d.month, d.qualityRate, d.defects]);

    // Construct CSV
    const csvContent = [
        '\uFEFF' + statsHeaders.join(','),
        ...statsRows.map(r => r.join(',')),
        '',
        'تحليل مؤشرات الأداء',
        kpiHeaders.join(','),
        ...kpiRows.map(r => r.join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TQM_Dashboard_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, gradient, subtext }: any) => (
    <motion.div 
      variants={itemVariants}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
    >
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`} />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-gray-500 text-sm font-bold mb-2">{title}</p>
          <h3 className="text-4xl font-black text-gray-800 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span className="flex items-center gap-1 text-emerald-500 font-medium bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
           <TrendingUp className="w-3 h-3" />
           {subtext}
        </span>
        <span className="text-xs">مقارنة بالشهر الماضي</span>
      </div>
      
      {/* Decorative background circle */}
      <div className={`absolute -bottom-6 -left-6 w-24 h-24 rounded-full ${colorClass} opacity-5 z-0`} />
    </motion.div>
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header for Print only */}
      <div className="print-header hidden">
        <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="w-8 h-8 text-royal-800" />
            <h1 className="text-3xl font-black text-royal-800">تقرير الجودة الشامل</h1>
        </div>
        <p className="text-gray-500">تاريخ التقرير: {new Date().toLocaleDateString('ar-EG')}</p>
      </div>

      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">نظرة عامة</h2>
          <p className="text-gray-500">ملخص الأداء اليومي وحالة الجودة</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => navigate('products')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium"
            >
                <Eye className="w-4 h-4" />
                عرض الكل
            </button>
            <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-5 py-2.5 bg-royal-800 text-white rounded-xl hover:bg-royal-900 transition-all shadow-lg shadow-royal-800/20 font-medium active:scale-95"
            >
                <Download className="w-4 h-4" />
                تصدير تقرير
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="إجمالي المنتجات" 
          value={totalProducts} 
          icon={Package} 
          colorClass="text-royal-600 bg-royal-600"
          gradient="from-royal-400 to-royal-600"
          subtext="+12%"
        />
        <StatCard 
          title="معدل المطابقة" 
          value={`${complianceRate}%`} 
          icon={CheckCircle} 
          colorClass="text-emerald-600 bg-emerald-600" 
          gradient="from-emerald-400 to-emerald-600"
          subtext={`+${trend}%`}
        />
        <StatCard 
          title="بلاغات العيوب" 
          value={rejectedProducts} 
          icon={AlertOctagon} 
          colorClass="text-red-600 bg-red-600" 
          gradient="from-red-400 to-red-600"
          subtext="-2%"
        />
        <StatCard 
          title="قيد الفحص" 
          value={pendingProducts} 
          icon={Activity} 
          colorClass="text-amber-600 bg-amber-600" 
          gradient="from-amber-400 to-amber-600"
          subtext="نشط"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend - Takes 2 cols */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border print:border-gray-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">مؤشر الجودة العام</h3>
            <select className="bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-lg px-3 py-1 outline-none">
                <option>آخر 6 أشهر</option>
                <option>هذا العام</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpiData}>
                <defs>
                  <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e40af" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="qualityRate" 
                    name="معدل الجودة %" 
                    stroke="#1e40af" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorQuality)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Defects Analysis - Takes 1 col */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-lg font-bold text-gray-800 mb-6">تحليل العيوب</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="defects" name="عدد العيوب" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                أحدث المنتجات المضافة
            </h3>
            <button 
                onClick={() => navigate('products')}
                className="text-royal-600 text-sm font-bold hover:text-royal-800 flex items-center gap-1"
            >
                عرض الكل <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
         </div>
         <div className="overflow-x-auto">
             <table className="w-full text-right">
                 <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                     <tr>
                         <th className="px-6 py-4">المنتج</th>
                         <th className="px-6 py-4">المواصفات</th>
                         <th className="px-6 py-4">الحالة</th>
                         <th className="px-6 py-4">الإجراء</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                     {products.slice(0, 5).map((product) => (
                         <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                             <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                     <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                     <div>
                                         <p className="font-bold text-gray-800 text-sm">{product.name}</p>
                                         <p className="text-xs text-gray-400">ID: #{product.id}</p>
                                     </div>
                                 </div>
                             </td>
                             <td className="px-6 py-4">
                                 <p className="text-sm text-gray-600 truncate max-w-[200px]">{product.specs}</p>
                             </td>
                             <td className="px-6 py-4">
                                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                     product.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                     product.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                     'bg-amber-100 text-amber-700'
                                 }`}>
                                     {product.status === 'approved' ? 'معتمد' : product.status === 'rejected' ? 'مرفوض' : 'قيد الفحص'}
                                 </span>
                             </td>
                             <td className="px-6 py-4">
                                 <button 
                                    onClick={() => navigate('products')}
                                    className="text-gray-400 hover:text-royal-600 transition-colors"
                                 >
                                     <Eye className="w-5 h-5" />
                                 </button>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>
      </motion.div>
    </motion.div>
  );
};