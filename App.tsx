
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Products } from './components/Products';
import { Team } from './components/Team';
import { KPIs } from './components/KPIs';
import { Documents } from './components/Documents';
import { About } from './components/About';
import { Database } from './components/Database';
import { CompanySettingsPanel } from './components/CompanySettings';
import { PasswordModal } from './components/PasswordModal';
import { Login } from './components/Login';
import { PageView, Product, Employee, DocumentFile, KPIData, CompanySettings, UserRole } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Menu, LogOut } from 'lucide-react';

// Mock Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'محرك كهربائي X500', manufacturer: 'سيمنز الألمانية', specs: '5000 RPM, 220V, عزل حراري', defects: '', status: 'approved', image: 'https://images.unsplash.com/photo-1562259920-47afc305f369?w=800&auto=format&fit=crop' },
  { id: '2', name: 'لوحة تحكم صناعية', manufacturer: 'شنايدر إلكتريك', specs: 'IP65, شاشة لمس 7 بوصة', defects: 'خدش في الإطار الخارجي', status: 'rejected', image: 'https://images.unsplash.com/photo-1555664424-778a69032054?w=800&auto=format&fit=crop' },
  { id: '3', name: 'مستشعر حرارة دقيق', manufacturer: 'بوش الصناعية', specs: 'نطاق -50 إلى 500 درجة', defects: '', status: 'pending', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&auto=format&fit=crop' },
  { id: '4', name: 'صمام هيدروليكي', manufacturer: 'ريكسروث', specs: 'ضغط عالي 300 بار', defects: '', status: 'approved', image: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=800&auto=format&fit=crop' },
];

const INITIAL_TEAM: Employee[] = [
  { id: '1', name: 'محمد علي', employeeCode: '1001', role: 'مدير الجودة', department: 'management', joinedDate: '2023-01-15', email: 'm.ali@tqm-sys.com', phone: '+966 50 123 4567' },
  { id: '2', name: 'سارة خالد', employeeCode: '2050', role: 'مراقب جودة أول', department: 'qc', joinedDate: '2023-03-10', email: 's.khaled@tqm-sys.com', phone: '+966 55 987 6543' },
  { id: '3', name: 'أحمد حسن', employeeCode: '3012', role: 'أخصائي توكيد جودة', department: 'qa', joinedDate: '2023-06-20', email: 'a.hassan@tqm-sys.com', phone: '+966 54 111 2222' },
];

const INITIAL_DOCS: DocumentFile[] = [
  { id: '1', name: 'دليل معايير ISO 9001', type: 'pdf', size: '2.5 MB', date: '2024-01-10', url: '#' },
  { id: '2', name: 'تقرير التدقيق الداخلي Q1', type: 'excel', size: '1.1 MB', date: '2024-04-05', url: '#' },
];

const INITIAL_KPI_DATA: KPIData[] = [];

const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  name: 'الشركة المتطورة للصناعة',
  slogan: 'الجودة أولاً',
  address: 'الرياض، المملكة العربية السعودية',
  logo: '',
  email: 'info@factory.com',
  phone: '',
  website: '',
  registrationNumber: '',
  certificates: ''
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState<PageView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('tqm_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [team, setTeam] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('tqm_team');
    return saved ? JSON.parse(saved) : INITIAL_TEAM;
  });
  const [documents, setDocuments] = useState<DocumentFile[]>(() => {
    const saved = localStorage.getItem('tqm_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCS;
  });
  const [kpiData, setKpiData] = useState<KPIData[]>(() => {
    const saved = localStorage.getItem('tqm_kpiData');
    return saved ? JSON.parse(saved) : INITIAL_KPI_DATA;
  });
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('tqm_company');
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_SETTINGS;
  });

  // Sync with LocalStorage
  useEffect(() => localStorage.setItem('tqm_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('tqm_team', JSON.stringify(team)), [team]);
  useEffect(() => localStorage.setItem('tqm_documents', JSON.stringify(documents)), [documents]);
  useEffect(() => localStorage.setItem('tqm_kpiData', JSON.stringify(kpiData)), [kpiData]);
  useEffect(() => localStorage.setItem('tqm_company', JSON.stringify(companySettings)), [companySettings]);

  // Security State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requestAuth = (action: () => void) => {
    if (userRole === 'admin') {
        // Admin is already logged in, execute immediately
        action();
    } else {
        // Open password modal for others
        setPendingAction(() => action);
        setIsAuthModalOpen(true);
    }
  };

  const handleConfirmAuth = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentView('dashboard');
  };

  const handleImportData = (fullData: any) => {
    if (fullData.products) setProducts(fullData.products);
    if (fullData.team) setTeam(fullData.team);
    if (fullData.documents) setDocuments(fullData.documents);
    if (fullData.kpiData) setKpiData(fullData.kpiData);
    if (fullData.companySettings) setCompanySettings(fullData.companySettings);
  };

  const handleResetData = () => {
    setProducts(INITIAL_PRODUCTS);
    setTeam(INITIAL_TEAM);
    setDocuments(INITIAL_DOCS);
    setKpiData(INITIAL_KPI_DATA);
    setCompanySettings(INITIAL_COMPANY_SETTINGS);
    setCurrentView('dashboard');
  };

  const handlePrintReport = () => {
    const originalTitle = document.title;
    const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    document.title = `TQM-Report-${dateStr}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 1000);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard products={products} kpiData={kpiData} handleGenerateReport={handlePrintReport} navigate={setCurrentView} />;
      case 'products':
        return <Products products={products} setProducts={setProducts} requestAuth={requestAuth} role={userRole} />;
      case 'team':
        return <Team team={team} setTeam={setTeam} requestAuth={requestAuth} role={userRole} />;
      case 'kpi':
        return <KPIs data={kpiData} setData={setKpiData} requestAuth={requestAuth} role={userRole} />;
      case 'documents':
        return <Documents documents={documents} setDocuments={setDocuments} requestAuth={requestAuth} role={userRole} />;
      case 'settings':
        return <CompanySettingsPanel settings={companySettings} onSave={setCompanySettings} requestAuth={requestAuth} role={userRole} />;
      case 'database':
        return <Database 
          data={{ products, team, documents, kpiData, companySettings }} 
          onImport={handleImportData} 
          onReset={handleResetData}
          requestAuth={requestAuth}
          role={userRole}
        />;
      case 'about':
        return <About />;
      default:
        return <Dashboard products={products} kpiData={kpiData} handleGenerateReport={handlePrintReport} navigate={setCurrentView} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-right">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        companySettings={companySettings}
      />
      
      <main className="flex-1 p-6 lg:p-10 w-full transition-all duration-300">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-royal-800 transition-all shadow-sm active:scale-95"
                title="القائمة الرئيسية"
            >
                <Menu className="w-6 h-6" />
            </button>
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                {currentView === 'dashboard' && 'لوحة القيادة المركزية'}
                {currentView === 'products' && 'سجل المنتجات'}
                {currentView === 'team' && 'فريق العمل'}
                {currentView === 'kpi' && 'تحليلات الأداء'}
                {currentView === 'documents' && 'الأرشيف الرقمي'}
                {currentView === 'database' && 'إدارة البيانات'}
                {currentView === 'settings' && 'إعدادات المنشأة'}
                {currentView === 'about' && 'معلومات النظام'}
                </h1>
                <p className="text-gray-500 mt-1 text-sm hidden md:block">تاريخ اليوم: {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end mr-2 hidden md:flex">
                 <span className="font-bold text-gray-800 text-sm">{userRole === 'admin' ? 'المدير العام' : 'مستخدم زائر'}</span>
                 <span className={`text-xs ${userRole === 'admin' ? 'text-emerald-600' : 'text-gray-500'}`}>{userRole === 'admin' ? 'كامل الصلاحيات' : 'عرض فقط'}</span>
             </div>
             <div className="w-12 h-12 rounded-full bg-royal-800 text-white flex items-center justify-center font-bold text-xl border-4 border-white shadow-lg relative group cursor-pointer" onClick={handleLogout} title="تسجيل الخروج">
                <User className="w-6 h-6 group-hover:hidden" />
                <LogOut className="w-6 h-6 hidden group-hover:block" />
             </div>
          </div>
        </header>

        <AnimatePresence mode='wait'>
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <PasswordModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onConfirm={handleConfirmAuth} 
      />
    </div>
  );
}

export default App;
