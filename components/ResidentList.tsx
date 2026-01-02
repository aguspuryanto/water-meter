
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../db';
import { User, MapPin, UserPlus, CheckCircle2, Search, X, History, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Resident, MeterReading } from '../types';
import { MONTHS, PRICE_PER_M3 } from '../constants';

const ResidentList: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResidentName, setNewResidentName] = useState('');
  const [newHouseNumber, setNewHouseNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedResidentForHistory, setSelectedResidentForHistory] = useState<Resident | null>(null);

  useEffect(() => {
    setResidents(db.getResidents());
  }, []);

  const readings = useMemo(() => db.getReadings(), [selectedResidentForHistory]);

  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResidentName || !newHouseNumber) return;

    db.saveResident({
      name: newResidentName,
      houseNumber: newHouseNumber
    });

    setResidents(db.getResidents());
    setNewResidentName('');
    setNewHouseNumber('');
    setShowAddForm(false);
    setSuccessMessage(`Warga ${newResidentName} berhasil ditambahkan!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.houseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getResidentHistory = (residentId: string) => {
    const resReadings = readings
      .filter(r => r.residentId === residentId)
      .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));

    return resReadings.map((reading, index) => {
      // Logic for previous month: either previous in sorted array or lookup
      const prevMonth = reading.month === 0 ? 11 : reading.month - 1;
      const prevYear = reading.month === 0 ? reading.year - 1 : reading.year;
      
      const prevReading = readings.find(r => 
        r.residentId === residentId && 
        r.month === prevMonth && 
        r.year === prevYear
      );

      const usage = prevReading ? Math.max(0, reading.value - prevReading.value) : 0;
      const bill = usage * PRICE_PER_M3;

      return {
        ...reading,
        usage,
        bill,
        hasPrev: !!prevReading
      };
    }).filter(r => r.year >= 2024); // Focus on visible history
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daftar Warga</h2>
          <p className="text-slate-500 text-sm">Master data penduduk dan unit rumah</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {successMessage && (
            <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 animate-fadeIn">
              <CheckCircle2 size={18} />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${
              showAddForm 
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            {showAddForm ? <X size={18} /> : <UserPlus size={18} />}
            <span>{showAddForm ? 'Batal' : 'Tambah Warga'}</span>
          </button>
        </div>
      </header>

      {/* Add Resident Form Card */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 animate-slideDown">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Input Data Warga Baru</h3>
            <p className="text-slate-500 text-sm">Tambahkan identitas warga dan blok rumah ke sistem</p>
          </div>

          <form onSubmit={handleAddResident} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700"
                    placeholder="Contoh: P. Wahyu"
                    value={newResidentName}
                    onChange={(e) => setNewResidentName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Blok Rumah / No</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700"
                    placeholder="Contoh: B30"
                    value={newHouseNumber}
                    onChange={(e) => setNewHouseNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                <UserPlus size={18} />
                <span>Simpan Warga</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Cari warga berdasarkan nama atau nomor rumah..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredResidents.map((resident) => (
          <div 
            key={resident.id}
            onClick={() => setSelectedResidentForHistory(resident)}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <History size={16} className="text-indigo-400" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">
                <User size={24} />
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-slate-800 truncate leading-tight">{resident.name}</h4>
                <div className="flex items-center text-sm text-slate-500 mt-1 space-x-1">
                  <MapPin size={14} className="text-indigo-400" />
                  <span>Blok: <span className="text-indigo-600 font-bold">{resident.houseNumber}</span></span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Klik untuk Riwayat</span>
                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                  <History size={12} />
                </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResidents.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full text-slate-300 mb-4">
            <Search size={32} />
          </div>
          <p className="text-slate-400 font-medium">Tidak ada warga yang ditemukan.</p>
        </div>
      )}

      {/* History Modal */}
      {selectedResidentForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scaleIn">
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-start justify-between bg-indigo-50/30">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <User size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 leading-tight">{selectedResidentForHistory.name}</h3>
                  <div className="flex items-center space-x-3 mt-1 text-slate-500 font-medium">
                    <div className="flex items-center space-x-1">
                        <MapPin size={14} className="text-indigo-500" />
                        <span>Blok {selectedResidentForHistory.houseNumber}</span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <div className="flex items-center space-x-1">
                        <History size={14} className="text-indigo-500" />
                        <span>Riwayat Pemakaian</span>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedResidentForHistory(null)}
                className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content - History Table */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-100/50 text-slate-600 text-[10px] font-bold uppercase tracking-[0.1em]">
                      <th className="px-6 py-4">Periode</th>
                      <th className="px-6 py-4 text-right">Indikator (m³)</th>
                      <th className="px-6 py-4 text-right">Pemakaian</th>
                      <th className="px-6 py-4 text-right">Tagihan</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {getResidentHistory(selectedResidentForHistory.id).reverse().map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                             <Calendar size={14} className="text-slate-400" />
                             <span className="font-semibold text-slate-700">{MONTHS[record.month]} {record.year}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-medium text-slate-600">
                          {record.value.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center justify-end space-x-1">
                            {record.hasPrev ? (
                              <>
                                <TrendingUp size={12} className="text-blue-500" />
                                <span className="text-blue-700 font-bold">{record.usage.toFixed(2)} m³</span>
                              </>
                            ) : (
                              <span className="text-slate-300 italic text-xs">Awal record</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {record.hasPrev ? (
                            <span className="font-bold text-slate-800">Rp {record.bill.toLocaleString()}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                             TERCATAT
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getResidentHistory(selectedResidentForHistory.id).length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-slate-400">Belum ada riwayat data untuk warga ini.</p>
                  </div>
                )}
              </div>

              {/* Summary Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                 <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Total Record</span>
                       <Calendar size={14} className="text-blue-400" />
                    </div>
                    <div className="text-xl font-bold text-blue-700">
                       {getResidentHistory(selectedResidentForHistory.id).length} Bulan
                    </div>
                 </div>
                 <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Rata-rata Tagihan</span>
                       <DollarSign size={14} className="text-emerald-400" />
                    </div>
                    <div className="text-xl font-bold text-emerald-700">
                       Rp {Math.round(getResidentHistory(selectedResidentForHistory.id).reduce((acc, curr) => acc + (curr.bill || 0), 0) / (getResidentHistory(selectedResidentForHistory.id).length || 1)).toLocaleString()}
                    </div>
                 </div>
                 <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Meter Terakhir</span>
                       <TrendingUp size={14} className="text-indigo-400" />
                    </div>
                    <div className="text-xl font-bold text-indigo-700">
                       {getResidentHistory(selectedResidentForHistory.id).slice(-1)[0]?.value.toFixed(2) || 0} m³
                    </div>
                 </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedResidentForHistory(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
              >
                Tutup Riwayat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentList;
