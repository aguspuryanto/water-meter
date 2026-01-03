
import React, { useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Droplets, 
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { db } from '../db';
import { PRICE_PER_M3, MONTHS } from '../constants';

const Dashboard: React.FC = () => {
  const residents = useMemo(() => db.getResidents(), []);
  const readings = db.getReadings();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const rollingPeriod = useMemo(() => {
    const periods = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periods.push({
        month: d.getMonth(),
        year: d.getFullYear(),
        label: MONTHS[d.getMonth()].substring(0, 3),
        fullName: MONTHS[d.getMonth()] + ' ' + d.getFullYear()
      });
    }
    return periods;
  }, []);

  const stats = useMemo(() => {
    const monthlyData = rollingPeriod.map((period) => {
      const monthReadings = readings.filter(r => r.month === period.month && r.year === period.year);
      
      let totalUsage = 0;
      monthReadings.forEach(reading => {
        const prevMonth = period.month === 0 ? 11 : period.month - 1;
        const prevYear = period.month === 0 ? period.year - 1 : period.year;
        const prevReading = readings.find(r => 
          r.residentId === reading.residentId && 
          r.month === prevMonth && 
          r.year === prevYear
        );
        
        const usage = prevReading ? Math.max(0, reading.value - prevReading.value) : 0;
        totalUsage += usage;
      });

      return {
        name: period.label,
        fullName: period.fullName,
        penggunaan: totalUsage,
        pendapatan: totalUsage * PRICE_PER_M3,
        recordedCount: monthReadings.length
      };
    });

    const latestData = monthlyData[11];
    const recordedResidentsCount = latestData.recordedCount;
    const coveragePercent = residents.length > 0 ? (recordedResidentsCount / residents.length) * 100 : 0;

    const currentMonthReadings = readings.filter(r => r.month === currentMonth && r.year === currentYear);
    const residentUsage = residents.map(res => {
      const reading = currentMonthReadings.find(r => r.residentId === res.id);
      if (!reading) return { ...res, usage: 0, recorded: false };

      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const prevReading = readings.find(r => 
        r.residentId === res.id && 
        r.month === prevMonth && 
        r.year === prevYear
      );

      const usage = prevReading ? Math.max(0, reading.value - prevReading.value) : 0;
      return { ...res, usage, recorded: true };
    }).sort((a, b) => b.usage - a.usage);

    return {
      monthlyData,
      totalCurrentUsage: latestData.penggunaan,
      totalCurrentRevenue: latestData.pendapatan,
      activeWarga: residents.length,
      recordedCount: recordedResidentsCount,
      coveragePercent,
      topConsumers: residentUsage.filter(r => r.recorded).slice(0, 4)
    };
  }, [readings, residents, rollingPeriod, currentMonth, currentYear]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2 text-indigo-600">
           <Calendar size={16} />
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">{MONTHS[currentMonth]} {currentYear}</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">Ringkasan Air</h2>
      </header>

      {/* Stat Cards - Horizontal Scroll on Mobile */}
      <div className="flex md:grid md:grid-cols-4 overflow-x-auto md:overflow-visible gap-4 pb-4 md:pb-0 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <StatCard 
          label="Volume Air" 
          value={stats.totalCurrentUsage.toFixed(1)} 
          unit="m³" 
          color="indigo" 
          icon={<Activity size={24} />} 
        />
        <StatCard 
          label="Pendapatan" 
          value={`Rp ${stats.totalCurrentRevenue.toLocaleString()}`} 
          unit="" 
          color="emerald" 
          icon={<DollarSign size={24} />} 
        />
        <StatCard 
          label="Total Warga" 
          value={stats.activeWarga.toString()} 
          unit="KK" 
          color="blue" 
          icon={<Users size={24} />} 
        />
        <StatCard 
          label="Pencatatan" 
          value={`${stats.coveragePercent.toFixed(0)}%`} 
          unit="Selesai" 
          color="amber" 
          icon={<ArrowUpRight size={24} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold text-slate-800 leading-tight">Tren Penggunaan</h4>
              <p className="text-xs text-slate-400 font-medium">Satuan m³ per bulan</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{stroke: '#e2e8f0', strokeWidth: 1}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', fontSize: '12px'}}
                />
                <Area type="monotone" dataKey="penggunaan" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Consumers Card */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-slate-800">Top Pengguna</h4>
            <ChevronRight size={18} className="text-slate-300" />
          </div>
          <div className="space-y-4">
            {stats.topConsumers.map((resident, idx) => (
              <div key={resident.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center space-x-3 truncate">
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {idx + 1}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-800 text-xs truncate">{resident.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Blok {resident.houseNumber}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-2">
                  <p className="font-black text-indigo-600 text-sm">{resident.usage.toFixed(1)} <span className="text-[10px]">m³</span></p>
                </div>
              </div>
            ))}
            {stats.topConsumers.length === 0 && (
              <div className="text-center py-10">
                <p className="text-xs text-slate-400 italic">Belum ada data input</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Projection - Dark Mode Look */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative z-10">
          <div>
            <h4 className="text-xl font-bold text-white">Pendapatan Tahunan</h4>
            <p className="text-indigo-300 text-xs font-medium">Estimasi total: Rp {stats.monthlyData.reduce((acc, curr) => acc + curr.pendapatan, 0).toLocaleString()}</p>
          </div>
          <div className="text-emerald-400 text-2xl font-black">
             {(stats.monthlyData.reduce((acc, curr) => acc + curr.penggunaan, 0)).toFixed(0)} <span className="text-xs">m³ Terjual</span>
          </div>
        </div>
        <div className="h-48 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthlyData}>
              <XAxis dataKey="name" hide />
              <Tooltip 
                 cursor={{fill: 'rgba(255,255,255,0.05)', radius: 10}}
                 contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: '#1e293b', color: '#fff', fontSize: '10px'}}
              />
              <Bar dataKey="pendapatan" radius={[6, 6, 0, 0]}>
                {stats.monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 11 ? '#10b981' : '#4f46e5'} fillOpacity={index === 11 ? 1 : 0.4} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  color: 'indigo' | 'emerald' | 'blue' | 'amber';
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, color, icon }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white min-w-[160px] md:min-w-0 flex-1 p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
      <div className={`${colorClasses[color]} w-10 h-10 rounded-2xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline space-x-1">
          <h3 className="text-lg font-black text-slate-800 truncate">{value}</h3>
          {unit && <span className="text-[10px] font-bold text-slate-400">{unit}</span>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
