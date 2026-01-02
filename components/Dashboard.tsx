
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
  Calendar
} from 'lucide-react';
import { db } from '../db';
import { PRICE_PER_M3, MONTHS } from '../constants';

const Dashboard: React.FC = () => {
  const residents = useMemo(() => db.getResidents(), []);
  const readings = db.getReadings();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Generate Rolling 12 Months period
  const rollingPeriod = useMemo(() => {
    const periods = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periods.push({
        month: d.getMonth(),
        year: d.getFullYear(),
        label: MONTHS[d.getMonth()].substring(0, 3) + ' ' + (d.getFullYear() % 100),
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
        month: period.month,
        year: period.year,
        penggunaan: totalUsage,
        pendapatan: totalUsage * PRICE_PER_M3,
        recordedCount: monthReadings.length
      };
    });

    // Current Month Detailed Stats (Targeting the latest in rolling period)
    const latestData = monthlyData[11];
    const recordedResidentsCount = latestData.recordedCount;
    const coveragePercent = residents.length > 0 ? (recordedResidentsCount / residents.length) * 100 : 0;

    // Calculate Top 5 Consumers for Latest Month
    const currentMonthReadings = readings.filter(r => r.month === latestData.month && r.year === latestData.year);
    const residentUsage = residents.map(res => {
      const reading = currentMonthReadings.find(r => r.residentId === res.id);
      if (!reading) return { ...res, usage: 0, recorded: false };

      const prevMonth = latestData.month === 0 ? 11 : latestData.month - 1;
      const prevYear = latestData.month === 0 ? latestData.year - 1 : latestData.year;
      const prevReading = readings.find(r => 
        r.residentId === res.id && 
        r.month === prevMonth && 
        r.year === prevYear
      );

      const usage = prevReading ? Math.max(0, reading.value - prevReading.value) : 0;
      return { ...res, usage, recorded: true };
    }).sort((a, b) => b.usage - a.usage);

    const topConsumers = residentUsage.filter(r => r.recorded).slice(0, 5);

    return {
      monthlyData,
      totalCurrentUsage: latestData.penggunaan,
      totalCurrentRevenue: latestData.pendapatan,
      activeWarga: residents.length,
      recordedCount: recordedResidentsCount,
      coveragePercent,
      topConsumers
    };
  }, [readings, residents, rollingPeriod]);

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm uppercase tracking-widest mb-1">
            <Calendar size={14} />
            <span>Riwayat 12 Bulan Terakhir</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard Analitik</h2>
          <p className="text-slate-500 mt-1 font-medium">Tren penggunaan air dari {rollingPeriod[0].fullName} s/d {rollingPeriod[11].fullName}</p>
        </div>
        
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${stats.coveragePercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
          <span className="text-sm font-bold text-slate-700">
            {stats.recordedCount} / {stats.activeWarga} Meter Tercatat ({stats.coveragePercent.toFixed(0)}%)
          </span>
        </div>
      </header>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity size={80} />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Penggunaan Bulan Ini</p>
          <div className="flex items-end space-x-2">
            <h3 className="text-3xl font-black text-slate-800">{stats.totalCurrentUsage.toFixed(1)}</h3>
            <span className="text-slate-400 font-bold mb-1">m³</span>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg w-fit">
            <Droplets size={12} className="mr-1" />
            {MONTHS[currentMonth]} {currentYear}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign size={80} />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Estimasi Pendapatan</p>
          <h3 className="text-3xl font-black text-slate-800">Rp {stats.totalCurrentRevenue.toLocaleString()}</h3>
          <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
            <TrendingUp size={12} className="mr-1" />
            Rate: Rp 3.000/m³
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users size={80} />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Warga</p>
          <h3 className="text-3xl font-black text-slate-800">{stats.activeWarga}</h3>
          <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg w-fit">
            <Users size={12} className="mr-1" />
            Unit Rumah Aktif
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={80} />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Rata-rata Penggunaan</p>
          <div className="flex items-end space-x-2">
            <h3 className="text-3xl font-black text-slate-800">
              {stats.activeWarga > 0 ? (stats.totalCurrentUsage / stats.activeWarga).toFixed(1) : 0}
            </h3>
            <span className="text-slate-400 font-bold mb-1">m³</span>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg w-fit">
            <ArrowUpRight size={12} className="mr-1" />
            Per Kepala Keluarga
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-xl font-black text-slate-800">Tren Rolling 12 Bulan</h4>
              <p className="text-sm text-slate-400 font-medium">Statistik volume air per periode pencatatan</p>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} 
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  cursor={{stroke: '#e2e8f0', strokeWidth: 2}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                  itemStyle={{fontWeight: 'bold', color: '#4f46e5'}}
                />
                <Area type="monotone" dataKey="penggunaan" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorUsage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-6">
            <h4 className="text-xl font-black text-slate-800">Konsumen Tertinggi</h4>
            <p className="text-sm text-slate-400 font-medium">Bulan {MONTHS[currentMonth]}</p>
          </div>
          <div className="flex-1 space-y-4">
            {stats.topConsumers.map((resident, idx) => (
              <div key={resident.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{resident.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Blok {resident.houseNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-indigo-600">{resident.usage.toFixed(1)} m³</p>
                </div>
              </div>
            ))}
            {stats.topConsumers.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-10 opacity-40">
                <AlertTriangle size={40} className="mb-2" />
                <p className="text-sm font-bold text-center">Data belum tersedia</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h4 className="text-2xl font-black text-white">Proyeksi Pendapatan Tahunan</h4>
            <p className="text-indigo-300 font-medium">Total Akumulasi: Rp {stats.monthlyData.reduce((acc, curr) => acc + curr.pendapatan, 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700}} />
              <Tooltip 
                 cursor={{fill: 'rgba(255,255,255,0.05)', radius: 10}}
                 formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Pendapatan']}
                 contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: '#1e293b', color: '#fff'}}
              />
              <Bar dataKey="pendapatan" radius={[8, 8, 0, 0]} barSize={30}>
                {stats.monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 11 ? '#10b981' : '#4f46e5'} fillOpacity={index === 11 ? 1 : 0.6} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
