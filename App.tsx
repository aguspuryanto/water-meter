
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, ClipboardList, LogOut, Droplets } from 'lucide-react';
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
    setAuthState({ isAuthenticated: false, username: null });
  };

  if (!authState.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 text-white flex flex-col shadow-xl">
        <div className="p-6 flex items-center space-x-3">
          <Droplets className="w-8 h-8 text-blue-300" />
          <h1 className="text-xl font-bold tracking-tight">WaterMeter</h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-600/50 text-indigo-100'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('input')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'input' ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-600/50 text-indigo-100'
            }`}
          >
            <ClipboardList size={20} />
            <span className="font-medium">Catat Meteran</span>
          </button>
          
          <button
            onClick={() => setActiveTab('residents')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'residents' ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-600/50 text-indigo-100'
            }`}
          >
            <Users size={20} />
            <span className="font-medium">Data Warga</span>
          </button>
        </nav>

        <div className="p-4 border-t border-indigo-600">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-indigo-300">Admin</span>
              <span className="text-sm font-semibold truncate max-w-[120px]">{authState.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-500 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'residents' && <ResidentList />}
          {activeTab === 'input' && <MeterInput />}
        </div>
      </main>
    </div>
  );
};

export default App;
