
import React, { useMemo } from 'react';
import { db } from '../db';
import { User, MapPin } from 'lucide-react';

const ResidentList: React.FC = () => {
  const residents = useMemo(() => db.getResidents(), []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Daftar Warga</h2>
        <p className="text-slate-500">Master data penduduk dan unit rumah</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {residents.map((resident) => (
          <div 
            key={resident.id}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <User size={24} />
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-slate-800 truncate">{resident.name}</h4>
                <div className="flex items-center text-sm text-slate-500 space-x-1">
                  <MapPin size={14} className="text-slate-400" />
                  <span>Blok Rumah: <span className="text-indigo-600 font-semibold">{resident.houseNumber}</span></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResidentList;
