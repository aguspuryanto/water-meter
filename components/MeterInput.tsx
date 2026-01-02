
import React, { useState, useEffect, useMemo } from 'react';
import { Save, AlertCircle, CheckCircle2, Search, History, TrendingUp, Info } from 'lucide-react';
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

  // Mencari meteran bulan sebelumnya untuk warga yang dipilih di form
  const lastMonthData = useMemo(() => {
    if (!selectedResidentId) return null;
    
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    
    return readings.find(r => 
      r.residentId === selectedResidentId && 
      r.month === prevMonth && 
      r.year === prevYear
    );
  }, [selectedResidentId, selectedMonth, selectedYear, readings]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId || !meterValue) return;

    const numValue = parseFloat(meterValue);
    if (isNaN(numValue)) return;

    // Validasi sederhana: meteran sekarang tidak boleh lebih kecil dari bulan lalu
    if (lastMonthData && numValue < lastMonthData.value) {
      alert(`Peringatan: Nilai meteran (${numValue}) lebih kecil dari bulan lalu (${lastMonthData.value}). Silakan periksa kembali.`);
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
    setSuccessMessage(`Data ${residents.find(r => r.id === selectedResidentId)?.name} berhasil disimpan!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const filteredResidentsForTable = residents.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.houseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const years = Array.from({ length: 7 }, (_, i) => 2024 + i);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Form Input Meteran */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">Input Data Meteran Air</h2>
          <p className="text-slate-500 text-sm">Hitung pemakaian otomatis berdasarkan selisih angka meteran</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Warga */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Warga</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700"
                value={selectedResidentId}
                onChange={(e) => setSelectedResidentId(e.target.value)}
                required
              >
                <option value="">Pilih warga</option>
                {residents.map(r => (
                  <option key={r.id} value={r.id}>{r.houseNumber} - {r.name}</option>
                ))}
              </select>
            </div>

            {/* Info Meteran Bulan Lalu (Auto-load) */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Referensi Bulan Lalu</label>
              <div className="flex items-center px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
                <History size={18} className="mr-2 text-slate-400" />
                {selectedResidentId ? (
                  lastMonthData ? (
                    <span className="font-mono font-bold text-indigo-600">{lastMonthData.value} m³</span>
                  ) : (
                    <span className="text-slate-400 italic text-sm">Data bulan lalu tidak ditemukan</span>
                  )
                ) : (
                  <span className="text-slate-400 text-sm">Pilih warga terlebih dahulu</span>
                )}
              </div>
            </div>

            {/* Bulan & Tahun */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Periode</label>
              <div className="flex space-x-2">
                <select 
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {MONTHS.map((name, index) => (
                    <option key={index} value={index}>{name}</option>
                  ))}
                </select>
                <select 
                  className="w-32 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nilai Meteran Sekarang */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Angka Meteran Sekarang (m³)</label>
              <div className="relative">
                <input 
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700 font-mono text-lg"
                  placeholder="0.00"
                  value={meterValue}
                  onChange={(e) => setMeterValue(e.target.value)}
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">m³</div>
              </div>
              {selectedResidentId && meterValue && lastMonthData && (
                <p className="text-xs text-indigo-600 font-medium mt-1">
                  Estimasi Pemakaian: {(parseFloat(meterValue) - lastMonthData.value).toFixed(2)} m³
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex items-center text-slate-400 text-xs italic">
              <Info size={14} className="mr-1" />
              Gunakan titik (.) untuk angka desimal
            </div>
            
            <div className="flex items-center space-x-3">
              {successMessage && (
                <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 animate-fadeIn">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-medium">{successMessage}</span>
                </div>
              )}
              <button
                type="submit"
                className="flex items-center space-x-2 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
              >
                <Save size={18} />
                <span>Simpan Data</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tabel Rincian Pemakaian */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Rincian Pemakaian Air</h3>
            <p className="text-xs text-slate-500">Periode: {MONTHS[selectedMonth]} {selectedYear}</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari warga..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Rumah & Nama</th>
                  <th className="px-6 py-4">Meter Lalu</th>
                  <th className="px-6 py-4">Meter Kini</th>
                  <th className="px-6 py-4">Pemakaian</th>
                  <th className="px-6 py-4">Tagihan (x3.000)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResidentsForTable.map(resident => {
                  const currentReading = readings.find(r => 
                    r.residentId === resident.id && 
                    r.month === selectedMonth && 
                    r.year === selectedYear
                  );

                  const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
                  const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
                  const prevReading = readings.find(r => 
                    r.residentId === resident.id && 
                    r.month === prevMonth && 
                    r.year === prevYear
                  );

                  // Rumus: Sekarang - Lalu
                  const usage = (currentReading && prevReading) ? Math.max(0, currentReading.value - prevReading.value) : 0;
                  const bill = usage * PRICE_PER_M3;

                  return (
                    <tr key={resident.id} className={`hover:bg-slate-50/50 transition-colors ${currentReading ? 'bg-indigo-50/10' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{resident.houseNumber}</span>
                          <span className="text-xs text-slate-500">{resident.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-400 text-sm">
                          {prevReading ? `${prevReading.value} m³` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {currentReading ? (
                          <span className="font-mono text-indigo-600 font-bold">{currentReading.value} m³</span>
                        ) : (
                          <span className="text-slate-300 italic text-xs">Belum diinput</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {currentReading && prevReading ? (
                          <div className="flex items-center space-x-1">
                            <TrendingUp size={14} className="text-blue-500" />
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                              {usage.toFixed(2)} m³
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {currentReading && prevReading ? (
                          <span className="font-bold text-slate-800">Rp {bill.toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-300 italic text-xs">Data tidak lengkap</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeterInput;
