
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Legend 
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { db } from '../db';
import { PRICE_PER_M3, MONTHS } from '../constants';

const Dashboard: React.FC = () => {
  const residents = useMemo(() => db.getResidents(), []);
  const readings = db.getReadings();

  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // Usage by month for the chart
    const monthlyData = MONTHS.map((name, index) => {
      const monthReadings = readings.filter(r => r.month === index && r.year === currentYear);
      
      // Calculate usage for this month: sum(currentValue - prevValue)
      let totalUsage = 0;
      monthReadings.forEach(reading => {
        const prevMonth = index === 0 ? 11 : index - 1;
        const prevYear = index === 0 ? currentYear - 1 : currentYear;
        const prevReading = readings.find(r => 
          r.residentId === reading.residentId && 
          r.month === prevMonth && 
          r.year === prevYear
        );
        
        const usage = prevReading ? Math.max(0, reading.value - prevReading.value) : 0;
        totalUsage += usage;
      });

      return {
        name: name.substring(0, 3),
        penggunaan: totalUsage,
        pendapatan: totalUsage * PRICE_PER_M3
      };
    });

    const currentMonthData = monthlyData[currentMonth];
    const totalCurrentUsage = currentMonthData?.penggunaan || 0;
    const totalCurrentRevenue = totalCurrentUsage * PRICE_PER_M3;

    return {
      monthlyData,
      totalCurrentUsage,
      totalCurrentRevenue,
      activeWarga: residents.length
    };
  }, [readings, residents]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Statistik</h2>
        <p className="text-slate-500">Ringkasan penggunaan air warga tahun {new Date().getFullYear()}</p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start space-x-4">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Penggunaan</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalCurrentUsage} m³</h3>
            <p className="text-xs text-blue-600 font-medium mt-1">Bulan ini</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start space-x-4">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Estimasi Pendapatan</p>
            <h3 className="text-2xl font-bold text-slate-800">Rp {stats.totalCurrentRevenue.toLocaleString()}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">Berdasarkan Rp 3.000/m³</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start space-x-4">
          <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Warga Terdaftar</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.activeWarga}</h3>
            <p className="text-xs text-indigo-600 font-medium mt-1">Total Unit</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start space-x-4">
          <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Rata-rata/Warga</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {stats.activeWarga > 0 ? (stats.totalCurrentUsage / stats.activeWarga).toFixed(1) : 0} m³
            </h3>
            <p className="text-xs text-orange-600 font-medium mt-1">Bulan ini</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-semibold text-slate-800 mb-6">Tren Penggunaan Air (m³)</h4>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="penggunaan" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-semibold text-slate-800 mb-6">Estimasi Pendapatan (IDR)</h4>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                   formatter={(value: number) => `Rp ${value.toLocaleString()}`}
                   contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="pendapatan" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
