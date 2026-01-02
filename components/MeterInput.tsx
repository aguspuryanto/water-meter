
import React, { useState, useEffect, useMemo } from 'react';
import { Save, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Search, User, Calendar, Hash } from 'lucide-react';
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId || !meterValue) return;

    const numValue = parseFloat(meterValue);
    if (isNaN(numValue)) return;

    db.saveReading({
      residentId: selectedResidentId,
      month: selectedMonth,
      year: selectedYear,
      value: numValue
    });

    setReadings(db.getReadings());
    setMeterValue('');
    setSuccessMessage(`Data meteran berhasil disimpan!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const filteredResidentsForTable = residents.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.houseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const years = Array.from({ length: 7 }, (_, i) => 2024 + i);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Input Form Card - Based on Screenshot */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">Input Data Meteran Air</h2>
          <p className="text-slate-500 text-sm">Masukkan data penggunaan air untuk setiap warga</p>
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

            {/* Bulan */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Bulan</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {MONTHS.map((name, index) => (
                  <option key={index} value={index}>{name}</option>
                ))}
              </select>
            </div>

            {/* Tahun */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Tahun</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Nilai Meteran */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Nilai Meteran (m³)</label>
              <input 
                type="number"
                step="0.01"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700"
                placeholder="Masukkan nilai meteran"
                value={meterValue}
                onChange={(e) => setMeterValue(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95"
            >
              <Save size={18} />
              <span>Simpan Data</span>
            </button>

            {successMessage && (
              <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 animate-fadeIn">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* List / History Table */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-800">Data Terinput: {MONTHS[selectedMonth]} {selectedYear}</h3>
          
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
                  <th className="px-6 py-4">Rumah</th>
                  <th className="px-6 py-4">Nama Warga</th>
                  <th className="px-6 py-4">Kumulatif Ini</th>
                  <th className="px-6 py-4">Pemakaian</th>
                  <th className="px-6 py-4">Tagihan</th>
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

                  const usage = currentReading && prevReading ? Math.max(0, currentReading.value - prevReading.value) : 0;
                  const bill = usage * PRICE_PER_M3;

                  return (
                    <tr key={resident.id} className={`hover:bg-slate-50/50 transition-colors ${currentReading ? 'bg-indigo-50/20' : ''}`}>
                      <td className="px-6 py-4 font-bold text-slate-700">{resident.houseNumber}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{resident.name}</td>
                      <td className="px-6 py-4">
                        {currentReading ? (
                          <span className="font-mono text-slate-700 font-semibold">{currentReading.value} m³</span>
                        ) : (
                          <span className="text-slate-300 italic text-sm">Belum input</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {currentReading ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${usage > 0 ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-500'}`}>
                            {usage} m³
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {currentReading ? (
                          <span className="font-bold text-slate-700">Rp {bill.toLocaleString()}</span>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredResidentsForTable.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              Tidak ada data ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeterInput;
