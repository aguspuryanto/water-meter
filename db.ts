
import { Resident, MeterReading } from './types';

const RESIDENTS_KEY = 'watermeter_residents';
const READINGS_KEY = 'watermeter_readings';

const DEFAULT_RESIDENTS: Resident[] = [
  { id: 'r1', houseNumber: 'B1', name: 'P. Pras/Katim' },
  { id: 'r2', houseNumber: 'B2', name: 'P. Richard' },
  { id: 'r3', houseNumber: 'B3', name: 'P. Farid' },
  { id: 'r4', houseNumber: 'B5', name: 'P. Yoyok' },
  { id: 'r5', houseNumber: 'B7', name: 'P. Hendra' },
  { id: 'r6', houseNumber: 'B8', name: 'P. Agus' },
  { id: 'r7', houseNumber: 'B9', name: 'P. Rizky' },
  { id: 'r8', houseNumber: 'B10', name: 'P. Junaidi' },
  { id: 'r9', houseNumber: 'B11', name: 'P. Hendrawan' },
  { id: 'r10', houseNumber: 'B12', name: 'P. Daud' },
  { id: 'r11', houseNumber: 'B14', name: 'P. Joko' },
  { id: 'r12', houseNumber: 'B15', name: 'P. Dedi' },
  { id: 'r13', houseNumber: 'B16', name: 'P. Bendra' },
  { id: 'r14', houseNumber: 'B17', name: 'P. Andik' },
  { id: 'r15', houseNumber: 'B20', name: 'P. Wito' },
  { id: 'r16', houseNumber: 'B21', name: 'P. Endro' },
  { id: 'r17', houseNumber: 'B22', name: 'P. Andre' },
  { id: 'r18', houseNumber: 'B23', name: 'P. Robby' },
  { id: 'r19', houseNumber: 'B24', name: 'P. Gita' },
  { id: 'r20', houseNumber: 'B25', name: 'P. Andri' },
  { id: 'r21', houseNumber: 'B26', name: 'P. Sunari' },
  { id: 'r22', houseNumber: 'B28', name: 'P. Eko' },
];

// Helper to generate seed data from the spreadsheet image
const generateInitialReadings = (): MeterReading[] => {
  const year = 2025;
  const prevYear = 2024;
  const readings: MeterReading[] = [];

  const rawData: Record<string, { base: number, values: (number|null)[] }> = {
    'r1':  { base: 10, values: [204, 213, 223, 232, 243, 253, 263, 273, 284, 294, 304, 314] },
    'r2':  { base: 13, values: [596, 602, 615, 627, 636, 644, 652, 656, 668, 675, 683, 696] },
    'r3':  { base: 31, values: [123, 131, 183, 219, 254, 282, 313, 344, 375, 406, 442, 473] },
    'r4':  { base: 14, values: [269, 286, 304, 318, 334, 350, 363, 376, 384, 395, 408, 422] },
    'r5':  { base: 2,  values: [332, 336, 340, 343, 348, 352, 357, 360, 364, 367, 370, 372] },
    'r6':  { base: 5,  values: [null, null, 103, 110, 112, 114, 117, 120, 127, 131, 135, 140] },
    'r7':  { base: 14, values: [322, 337, 350, 361, 376, 393, 406, 423, 437, 452, 467, 481] },
    'r8':  { base: 13, values: [613, 626, 640, 653, 666, 678, 687, 695, 705, 717, 729, 742] },
    'r9':  { base: 20, values: [662, 679, 698, 717, 734, 751, 770, 787, 806, 825, 842, 862] },
    'r10': { base: 28, values: [654, 670, 690, 708, 728, 744, 760, 777, 793, 817, 839, 867] },
    'r11': { base: 0,  values: [25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25] },
    'r12': { base: 0,  values: [347, 356, null, null, null, 373, 377, 384, 390, 390, 390, 390] },
    'r13': { base: 0,  values: [189, 189, 189, 189, 189, 189, 189, 189, 189, 189, 189, 189] },
    'r14': { base: 16, values: [827, 839, 854, 869, 886, 899, 917, 932, 947, 965, 981, 997] },
    'r15': { base: 0,  values: [451, 479, 501, 544, 561, 601, 612, 632, 664, 668, 683, 683] },
    'r16': { base: 0,  values: [39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39] },
    'r17': { base: 24, values: [881, 904, 927, 953, 977, 998, 1019, 1038, 1059, 1080, 1101, 1125] },
    'r18': { base: 3,  values: [null, null, null, null, 403, 419, 430, 435, 442, 446, 451, 454] },
    'r19': { base: 0,  values: [46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46] },
    'r20': { base: 1,  values: [null, null, 145, 147, 149, 152, 152, 153, 154, 158, 160, 161] },
    'r21': { base: 29, values: [747, 764, 788, 808, 830, 851, 876, 892, 910, 929, 947, 976] },
    'r22': { base: 2,  values: [667, 682, 698, 717, 734, 760, 778, 796, 813, 827, 848, 850] },
  };

  Object.entries(rawData).forEach(([resId, data]) => {
    // Seed Desember 2023 (Base)
    readings.push({
      id: `seed-${resId}-base`,
      residentId: resId,
      month: 11, // Desember
      year: prevYear,
      value: data.base
    });

    // Seed 2024 months
    data.values.forEach((val, monthIdx) => {
      if (val !== null) {
        readings.push({
          id: `seed-${resId}-${monthIdx}`,
          residentId: resId,
          month: monthIdx,
          year: year,
          value: val
        });
      }
    });
  });

  return readings;
};

export const db = {
  getResidents: (): Resident[] => {
    const data = localStorage.getItem(RESIDENTS_KEY);
    if (!data) {
      localStorage.setItem(RESIDENTS_KEY, JSON.stringify(DEFAULT_RESIDENTS));
      return DEFAULT_RESIDENTS;
    }
    return JSON.parse(data);
  },

  saveResident: (resident: Omit<Resident, 'id'>) => {
    const residents = db.getResidents();
    const newResident: Resident = {
      ...resident,
      id: crypto.randomUUID()
    };
    residents.push(newResident);
    localStorage.setItem(RESIDENTS_KEY, JSON.stringify(residents));
    return newResident;
  },

  getReadings: (): MeterReading[] => {
    const data = localStorage.getItem(READINGS_KEY);
    if (!data) {
      const initial = generateInitialReadings();
      localStorage.setItem(READINGS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
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
