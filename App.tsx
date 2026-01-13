import React, { useState, useEffect, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { PasswordModal } from './components/PasswordModal';
import { Login } from './components/Login';
import { PageView, Product, Employee, DocumentFile, KPIData, CompanySettings, UserRole } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Menu, LogOut, Loader2 } from 'lucide-react';

// Lazy Load Components
const Dashboard = React.lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const Products = React.lazy(() => import('./components/Products').then(module => ({ default: module.Products })));
const Team = React.lazy(() => import('./components/Team').then(module => ({ default: module.Team })));
const KPIs = React.lazy(() => import('./components/KPIs').then(module => ({ default: module.KPIs })));
const Documents = React.lazy(() => import('./components/Documents').then(module => ({ default: module.Documents })));
const About = React.lazy(() => import('./components/About').then(module => ({ default: module.About })));
const Database = React.lazy(() => import('./components/Database').then(module => ({ default: module.Database })));
const CompanySettingsPanel = React.lazy(() => import('./components/CompanySettings').then(module => ({ default: module.CompanySettingsPanel })));

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'محرك كهربائي X500', manufacturer: 'سيمنز الألمانية', specs: '5000 RPM, 220V', defects: '', status: 'approved', image: 'https://images.unsplash.com/photo-1562259920-47afc305f369?w=400&auto=format&fit=crop' },
  { id: '2', name: 'لوحة تحكم صناعية', manufacturer: 'شنايدر إلكتريك', specs: 'IP65, 7 inch', defects: 'خدش خارجي', status: 'rejected', image: 'https://images.unsplash.com/photo-1555664424-778a69032054?w=400&auto=format&fit=crop' },
];

const INITIAL_TEAM: Employee[] = [
  { id: '1', name: 'محمد علي', employeeCode: '1001', role: 'مدير الجودة', department: 'management', joinedDate: '2023-01-15', email: 'm.ali@tqm-sys.com', phone: '+966 50 123 4567' },
  { id: '2', name: 'سارة خالد', employeeCode: '2050', role: 'مراقب جودة أول', department: 'qc', joinedDate: '2023-03-10', email: 's.khaled@tqm-sys.com', phone: '+966 55 987 6543' },
];

const INITIAL_DOCS: DocumentFile[] = [
  { id: '1', name: 'دليل ISO 9001', type: 'pdf', size: '2.5 MB', date: '2024-01-10', url: '#' },
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

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-royal-600">
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
      <Loader2 className="w-12 h-12" />
    </motion.div>
    <p className="mt-4 font-bold text-gray-500 animate-pulse">جاري تحميل البيانات...</p>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState<PageView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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

  // Independent save logic with QuotaExceeded checks
  useEffect(() => {
    try { localStorage.setItem('tqm_products', JSON.stringify(products)); } 
    catch (e) { console.error("Quota Exceeded for Products"); }
  }, [products]);

  useEffect(() => {
    try { localStorage.setItem('tqm_team', JSON.stringify(team)); } 
    catch (e) { console.error("Quota Exceeded for Team"); }
  }, [team]);

  useEffect(() => {
    try { localStorage.setItem('tqm_documents', JSON.stringify(documents)); } 
    catch (e) { console.error("Quota Exceeded for Documents"); }
  }, [documents]);

  useEffect(() => {
    try { localStorage.setItem('tqm_kpiData', JSON.stringify(kpiData)); } 
    catch (e) { console.error("Quota Exceeded for KPIs"); }
  }, [kpiData]);

  useEffect(() => {
    try { localStorage.setItem('tqm_company', JSON.stringify(companySettings)); } 
    catch (e) { console.error("Quota Exceeded for Settings"); }
  }, [companySettings]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requestAuth = (action: () => void) => {
    if (userRole === 'admin') {
        action();
    } else {
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
    window.print();
  };

  const renderContent = () => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        {currentView === 'dashboard' && <Dashboard products={products} kpiData={kpiData} handleGenerateReport={handlePrintReport} navigate={setCurrentView} />}
        {currentView === 'products' && <Products products={products} setProducts={setProducts} requestAuth={requestAuth} role={userRole} />}
        {currentView === 'team' && <Team team={team} setTeam={setTeam} requestAuth={requestAuth} role={userRole} />}
        {currentView === 'kpi' && <KPIs data={kpiData} setData={setKpiData} requestAuth={requestAuth} role={userRole} />}
        {currentView === 'documents' && <Documents documents={documents} setDocuments={setDocuments} requestAuth={requestAuth} role={userRole} />}
        {currentView === 'settings' && <CompanySettingsPanel settings={companySettings} onSave={setCompanySettings} requestAuth={requestAuth} role={userRole} />}
        {currentView === 'database' && <Database 
          data={{ products, team, documents, kpiData, companySettings }} 
          onImport={handleImportData} 
          onReset={handleResetData}
          requestAuth={requestAuth}
          role={userRole}
        />}
        {currentView === 'about' && <About />}
      </Suspense>
    );
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
      
      <main className="flex-1 p-4 lg:p-10 w-full transition-all duration-300">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 shadow-sm">
                <Menu className="w-6 h-6" />
            </button>
            <div>
                <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                {currentView === 'dashboard' && 'لوحة القيادة المركزية'}
                {currentView === 'products' && 'سجل المنتجات'}
                {currentView === 'team' && 'فريق العمل'}
                {currentView === 'kpi' && 'تحليلات الأداء'}
                {currentView === 'documents' && 'الأرشيف الرقمي'}
                {currentView === 'database' && 'إدارة البيانات'}
                {currentView === 'settings' && 'إعدادات المنشأة'}
                {currentView === 'about' && 'معلومات النظام'}
                </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end mr-2 hidden md:flex">
                 <span className="font-bold text-gray-800 text-sm">{userRole === 'admin' ? 'المدير العام' : 'مستخدم زائر'}</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-royal-800 text-white flex items-center justify-center font-bold border-2 border-white shadow-lg cursor-pointer" onClick={handleLogout} title="تسجيل الخروج">
                <LogOut className="w-5 h-5" />
             </div>
          </div>
        </header>

        <AnimatePresence mode='wait'>
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
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