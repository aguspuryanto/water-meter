
import React, { useState } from 'react';
import { Droplets, Lock, User, ChevronRight } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length > 2 && password === 'admin') {
      onLogin(username);
    } else {
      setError('Password salah! Coba "admin"');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 md:p-0">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-12 animate-fadeIn">
          <div className="bg-indigo-600 p-4 rounded-[2rem] text-white shadow-2xl shadow-indigo-100 mb-6">
            <Droplets size={48} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">WaterMeter <span className="text-indigo-600">Pro</span></h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">V 2.0 Community Edition</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn" style={{animationDelay: '0.1s'}}>
          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
              placeholder="Username Admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="password"
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
              placeholder="Password (admin)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl flex items-center justify-center animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-[1.5rem] shadow-xl shadow-indigo-100 transition-all transform active:scale-[0.97] flex items-center justify-center space-x-2"
          >
            <span>MASUK KE SISTEM</span>
            <ChevronRight size={18} />
          </button>
        </form>

        <div className="mt-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
           Sistem Manajemen Air Warga 2024
        </div>
      </div>
    </div>
  );
};

export default Login;
