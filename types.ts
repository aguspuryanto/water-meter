
export interface Resident {
  id: string;
  name: string;
  houseNumber: string;
}

export interface MeterReading {
  id: string;
  residentId: string;
  month: number; // 0-11
  year: number;
  value: number; // Cumulative reading
}

export interface MonthlyStats {
  month: string;
  usage: number;
  revenue: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}
