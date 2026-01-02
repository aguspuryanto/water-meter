
import { Resident, MeterReading } from './types';

const RESIDENTS_KEY = 'watermeter_residents';
const READINGS_KEY = 'watermeter_readings';

const DEFAULT_RESIDENTS: Resident[] = [
  { id: '1', houseNumber: 'B1', name: 'P. Pras' },
  { id: '2', houseNumber: 'B2', name: 'P. Richard' },
  { id: '3', houseNumber: 'B3', name: 'P. Farid' },
  { id: '4', houseNumber: 'B5', name: 'P. Yoyok' },
  { id: '5', houseNumber: 'B7', name: 'P. Hendra' },
  { id: '6', houseNumber: 'B8', name: 'P. Agus' },
  { id: '7', houseNumber: 'B9', name: 'P. Rizky' },
  { id: '8', houseNumber: 'B10', name: 'P. Junaidi' },
  { id: '9', houseNumber: 'B11', name: 'P. Hendrawan' },
  { id: '10', houseNumber: 'B12', name: 'P. Daud' },
  { id: '11', houseNumber: 'B14', name: 'P. Joko' },
  { id: '12', houseNumber: 'B15', name: 'P. Dedi' },
  { id: '13', houseNumber: 'B16', name: 'P. Bendra' },
  { id: '14', houseNumber: 'B17', name: 'P. Andik' },
  { id: '15', houseNumber: 'B20', name: 'P. Wito' },
  { id: '16', houseNumber: 'B21', name: 'P. Endro' },
  { id: '17', houseNumber: 'B22', name: 'P. Andre' },
  { id: '18', houseNumber: 'B23', name: 'P. Robby' },
  { id: '19', houseNumber: 'B24', name: 'P. Gita' },
  { id: '20', houseNumber: 'B25', name: 'P. Andri' },
  { id: '21', houseNumber: 'B26', name: 'P. Sunari' },
  { id: '22', houseNumber: 'B28', name: 'P. Eko' },
];

export const db = {
  getResidents: (): Resident[] => {
    const data = localStorage.getItem(RESIDENTS_KEY);
    if (!data) {
      localStorage.setItem(RESIDENTS_KEY, JSON.stringify(DEFAULT_RESIDENTS));
      return DEFAULT_RESIDENTS;
    }
    return JSON.parse(data);
  },

  getReadings: (): MeterReading[] => {
    const data = localStorage.getItem(READINGS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveReading: (reading: Omit<MeterReading, 'id'>) => {
    const readings = db.getReadings();
    const existingIndex = readings.findIndex(
      (r) => r.residentId === reading.residentId && r.month === reading.month && r.year === reading.year
    );

    if (existingIndex > -1) {
      readings[existingIndex] = { ...readings[existingIndex], value: reading.value };
    } else {
      readings.push({ ...reading, id: crypto.randomUUID() });
    }

    localStorage.setItem(READINGS_KEY, JSON.stringify(readings));
  },

  deleteReading: (id: string) => {
    const readings = db.getReadings();
    const filtered = readings.filter((r) => r.id !== id);
    localStorage.setItem(READINGS_KEY, JSON.stringify(filtered));
  }
};
