
import React, { useState, useEffect, useMemo } from 'react';
import { Save, History, TrendingUp, Search, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../db';
import { Resident, MeterReading } from '../types';
import { MONTHS, PRICE_PER_M3 } from '../constants';

const MeterInput: React.FC = () => {
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [meterValue, setMeterValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const residents = useMemo(() => db.getResidents(), []);

  useEffect(() => {
    setReadings(db.getReadings());
  }, []);

  const lastMonthData = useMemo(() => {
    if (!selectedResidentId) return null;
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    return readings.find(r => r.residentId === selectedResidentId && r.month === prevMonth && r.year === prevYear);
  }, [selectedResidentId, selectedMonth, selectedYear, readings]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId || !meterValue) return;

    const numValue = parseFloat(meterValue);
    if (isNaN(numValue)) return;

    if (lastMonthData && numValue < lastMonthData.value) {
      alert(`Nilai meteran (${numValue}) lebih rendah dari periode lalu (${lastMonthData.value}). Cek kembali.`);
      return;
    }

    db.saveReading({
      residentId: selectedResidentId,
      month: selectedMonth,
      year: selectedYear,
      value: numValue
    });

    setReadings(db.getReadings());
    setMeterValue('');
    const res = residents.find(r => r.id === selectedResidentId);
    setSuccessMessage(`Data ${res?.houseNumber} tersimpan!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.houseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const years = [2024, 2025, 2026];

  return (
    <div className="space-y-6">
      <header className="flex flex-col space-y-2">
        <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">Catat Meteran</h2>
        <p className="text-slate-500 text-sm">Input angka meteran terbaru warga bulan ini.</p>
      </header>

      {/* Main Input Card */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
        
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Warga Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Warga</label>
              <select 
                className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
                value={selectedResidentId}
                onChange={(e) => setSelectedResidentId(e.target.value)}
                required
              >
                <option value="">Cari & Pilih Warga</option>
                {residents.map(r => (
                  <option key={r.id} value={r.id}>{r.houseNumber} - {r.name}</option>
                ))}
              </select>
            </div>

            {/* Referensi Bulan Lalu */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Meteran Lalu</label>
              <div className="flex items-center h-14 px-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                <History size={18} className="mr-3 text-indigo-400" />
                <span className="font-mono font-bold text-indigo-700 text-lg">
                  {selectedResidentId ? (lastMonthData ? `${lastMonthData.value} m³` : 'N/A') : '-- m³'}
                </span>
              </div>
            </div>

            {/* Periode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Periode Tagihan</label>
              <div className="flex space-x-2">
                <select 
                  className="flex-1 h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {MONTHS.map((name, idx) => <option key={idx} value={idx}>{name}</option>)}
                </select>
                <select 
                  className="w-28 h-14 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Input Sekarang */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Angka Sekarang</label>
              <div className="relative">
                <input 
                  type="number"
                  step="0.01"
                  className="w-full h-14 px-5 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition-all font-mono text-2xl font-black text-slate-800"
                  placeholder="0.00"
                  value={meterValue}
                  onChange={(e) => setMeterValue(e.target.value)}
                  required
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold">m³</div>
              </div>
            </div>
          </div>

          {/* Calc Helper */}
          {selectedResidentId && meterValue && lastMonthData && (
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center space-x-3 text-emerald-700">
                 <TrendingUp size={20} />
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Estimasi Pemakaian</p>
                    <p className="font-bold text-lg">{(parseFloat(meterValue) - lastMonthData.value).toFixed(2)} m³</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider opacity-70">Estimasi Biaya</p>
                 <p className="font-black text-xl text-emerald-700">Rp {((parseFloat(meterValue) - lastMonthData.value) * PRICE_PER_M3).toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
            <div className="flex items-center text-slate-400 text-xs italic">
              <Info size={14} className="mr-2" />
              Sistem akan otomatis menghitung selisih meteran.
            </div>
            
            <div className="flex items-center space-x-3 w-full md:w-auto">
              {successMessage && (
                <div className="hidden md:flex items-center space-x-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                  <CheckCircle2 size={16} />
                  <span>{successMessage}</span>
                </div>
              )}
              <button
                type="submit"
                className="w-full md:w-auto flex items-center justify-center space-x-3 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-95"
              >
                <Save size={20} />
                <span>SIMPAN DATA</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* List Recent Input - Responsive Card style for mobile */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-slate-800">Cek Input {MONTHS[selectedMonth]}</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari..." 
              className="pl-8 pr-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredResidents.slice(0, 12).map(resident => {
            const currentReading = readings.find(r => r.residentId === resident.id && r.month === selectedMonth && r.year === selectedYear);
            const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
            const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
            const prevReading = readings.find(r => r.residentId === resident.id && r.month === prevMonth && r.year === prevYear);
            const usage = (currentReading && prevReading) ? Math.max(0, currentReading.value - prevReading.value) : 0;

            return (
              <div key={resident.id} className={`p-4 rounded-2xl border transition-all ${currentReading ? 'bg-indigo-50/30 border-indigo-100 shadow-sm' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="truncate">
                    <p className="font-black text-slate-800 text-sm leading-none mb-1">{resident.houseNumber}</p>
                    <p className="text-[10px] text-slate-400 font-bold truncate uppercase">{resident.name}</p>
                  </div>
                  {currentReading ? (
                    <div className="bg-emerald-500 p-1 rounded-full text-white">
                      <CheckCircle2 size={12} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="bg-slate-100 p-1 rounded-full text-slate-300">
                      <AlertCircle size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <div className="text-slate-400 uppercase tracking-tighter">Usage</div>
                  <div className={currentReading ? 'text-indigo-600' : 'text-slate-300'}>
                    {currentReading ? `${usage.toFixed(1)} m³` : '--'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MeterInput;
