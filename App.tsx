
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, ClipboardList, LogOut, Droplets, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ResidentList from './components/ResidentList';
import MeterInput from './components/MeterInput';
import Login from './components/Login';
import { AuthState } from './types';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('watermeter_auth');
    return saved ? JSON.parse(saved) : { isAuthenticated: false, username: null };
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'residents' | 'input'>('dashboard');

  useEffect(() => {
    localStorage.setItem('watermeter_auth', JSON.stringify(authState));
  }, [authState]);

  const handleLogin = (username: string) => {
    setAuthState({ isAuthenticated: true, username });
  };

  const handleLogout = () => {
    if(window.confirm('Keluar dari aplikasi?')) {
      setAuthState({ isAuthenticated: false, username: null });
    }
  };

  if (!authState.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'input', label: 'Catat', icon: ClipboardList },
    { id: 'residents', label: 'Warga', icon: Users },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shadow-sm">
        <div className="p-8 flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
            <Droplets size={24} />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-800">WaterMeter</h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'hover:bg-slate-100 text-slate-500 font-medium'
              }`}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className={activeTab === item.id ? "font-bold" : ""}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operator</span>
              <span className="text-sm font-bold text-slate-700 truncate uppercase">{authState.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-5 bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center space-x-2">
           <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Droplets size={18} />
          </div>
          <h1 className="text-lg font-black text-slate-800 tracking-tight">WaterMeter</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-500"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8 pt-4 md:pt-8 px-4 md:px-10">
        <div className="max-w-6xl mx-auto h-full">
          <div className="animate-fadeIn">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'residents' && <ResidentList />}
            {activeTab === 'input' && <MeterInput />}
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 pb-safe-area flex items-center justify-around z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center justify-center py-1 px-4 rounded-2xl transition-all duration-300 ${
              activeTab === item.id 
              ? 'text-indigo-600 scale-110' 
              : 'text-slate-400'
            }`}
          >
            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className={`text-[10px] mt-1 font-bold uppercase tracking-tight ${activeTab === item.id ? "opacity-100" : "opacity-0 h-0"}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
