
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { User, MapPin, UserPlus, CheckCircle2, Search, X } from 'lucide-react';
import { Resident } from '../types';

const ResidentList: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResidentName, setNewResidentName] = useState('');
  const [newHouseNumber, setNewHouseNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setResidents(db.getResidents());
  }, []);

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

  return (
    <div className="space-y-6 animate-fadeIn">
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
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1"
          >
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
    </div>
  );
};

export default ResidentList;
