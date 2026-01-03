
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../db';
import { User, MapPin, UserPlus, CheckCircle2, Search, X, History, TrendingUp, DollarSign, Calendar, ArrowLeft } from 'lucide-react';
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
    setSuccessMessage(`Warga baru ditambahkan!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.houseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getResidentHistory = (residentId: string) => {
    return readings
      .filter(r => r.residentId === residentId)
      .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))
      .map((reading) => {
        const prevMonth = reading.month === 0 ? 11 : reading.month - 1;
        const prevYear = reading.month === 0 ? reading.year - 1 : reading.year;
        const prevReading = readings.find(r => r.residentId === residentId && r.month === prevMonth && r.year === prevYear);
        const usage = prevReading ? Math.max(0, reading.value - prevReading.value) : 0;
        return { ...reading, usage, bill: usage * PRICE_PER_M3, hasPrev: !!prevReading };
      }).filter(r => r.year >= 2024).reverse();
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">Data Warga</h2>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Total {residents.length} Kepala Keluarga</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white p-3 md:px-6 md:py-3 rounded-2xl md:rounded-2xl shadow-lg shadow-indigo-100 flex items-center space-x-2"
        >
          <UserPlus size={20} />
          <span className="hidden md:inline font-bold">Tambah Warga</span>
        </button>
      </header>

      {/* Filter Mobile Style */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Cari warga (Blok B1 / Nama)..."
          className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid List - Improved for Mobile Touch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResidents.map((resident) => (
          <div 
            key={resident.id}
            onClick={() => setSelectedResidentForHistory(resident)}
            className="bg-white p-5 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <User size={28} />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-slate-800 text-lg leading-tight truncate">{resident.houseNumber}</h4>
                <p className="text-sm font-medium text-slate-400 truncate">{resident.name}</p>
              </div>
            </div>
            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-400 group-hover:text-indigo-600">
               <History size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredResidents.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <p className="text-slate-400 font-bold">Warga tidak ditemukan.</p>
        </div>
      )}

      {/* Add Form Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 animate-slideUp">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-black text-slate-800">Warga Baru</h3>
               <button onClick={() => setShowAddForm(false)} className="bg-slate-100 p-2 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddResident} className="space-y-6">
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor Rumah / Blok</label>
                    <input type="text" className="w-full h-14 px-5 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600" placeholder="Contoh: B15" value={newHouseNumber} onChange={(e) => setNewHouseNumber(e.target.value)} required />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Pemilik</label>
                    <input type="text" className="w-full h-14 px-5 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600" placeholder="P. Nama" value={newResidentName} onChange={(e) => setNewResidentName(e.target.value)} required />
                 </div>
              </div>
              <button type="submit" className="w-full h-14 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100">SIMPAN WARGA</button>
            </form>
          </div>
        </div>
      )}

      {/* History Modal - Adaptive Full Screen */}
      {selectedResidentForHistory && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white md:bg-slate-900/40 md:backdrop-blur-sm md:items-center md:justify-center md:p-10 animate-fadeIn">
          <div className="bg-white w-full h-full md:h-auto md:max-w-4xl md:max-h-[85vh] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
            {/* Header Mobile Style */}
            <div className="sticky top-0 z-10 px-6 py-6 border-b border-slate-50 bg-white md:px-10 md:py-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                 <button onClick={() => setSelectedResidentForHistory(null)} className="md:hidden p-2 text-slate-400"><ArrowLeft /></button>
                 <div>
                    <h3 className="text-xl md:text-3xl font-black text-slate-800 leading-none">{selectedResidentForHistory.houseNumber}</h3>
                    <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{selectedResidentForHistory.name}</p>
                 </div>
              </div>
              <button onClick={() => setSelectedResidentForHistory(null)} className="hidden md:flex p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 md:px-10 md:py-8 space-y-4">
              {getResidentHistory(selectedResidentForHistory.id).map((record) => (
                <div key={record.id} className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800">{MONTHS[record.month]} {record.year}</p>
                      <p className="text-[10px] font-bold text-slate-400">Indicator: {record.value} m³</p>
                   </div>
                   <div className="text-right">
                      {record.hasPrev ? (
                        <>
                          <p className="font-black text-indigo-600">{record.usage.toFixed(1)} <span className="text-[10px] uppercase">m³</span></p>
                          <p className="text-[10px] font-bold text-slate-400">Rp {record.bill.toLocaleString()}</p>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase">Initial</span>
                      )}
                   </div>
                </div>
              ))}
              
              {getResidentHistory(selectedResidentForHistory.id).length === 0 && (
                <div className="text-center py-20">
                  <p className="text-slate-300 font-bold uppercase tracking-widest">Tidak ada riwayat</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-6 md:p-10 border-t border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
               <div className="flex items-center space-x-4 w-full md:w-auto">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex-1 md:flex-none">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Meter Terakhir</p>
                     <p className="text-lg font-black text-indigo-600">{getResidentHistory(selectedResidentForHistory.id)[0]?.value || '0.0'} m³</p>
                  </div>
               </div>
               <button onClick={() => setSelectedResidentForHistory(null)} className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-100 uppercase tracking-widest text-xs">Kembali</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentList;
