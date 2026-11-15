// Domain model for Sistem Manajemen Kebun (MVP).
//
// Conventions:
// - Date-only fields are stored as `YYYY-MM-DD` strings (dayjs) so they index
//   and sort correctly in IndexedDB.
// - `createdAt` / `updatedAt` are epoch milliseconds.
// - `id` is an auto-increment primary key. It is required on stored records;
//   Dexie's `InsertType` makes it optional for `add()`/`put()` inserts.

export type ISODate = string;
export type Timestamp = number;

export interface Garden {
  id: number;
  name: string; // required
  location?: string; // keterangan (optional)
  area?: number; // luas (optional)
  areaUnit?: string; // satuan luas (optional)
  startDate?: ISODate; // tanggal mulai (optional)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Plant {
  id: number;
  gardenId: number;
  name: string; // required
  category?: string; // e.g. sayuran daun, buah, umbi; free text
  plantDate?: ISODate; // tanggal tanam
  quantity?: number; // jumlah / populasi
  notes?: string;
  photo?: Blob | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Harvest {
  id: number;
  plantId: number;
  date: ISODate;
  amount: number; // jumlah
  unit: string; // default 'kg' (PRD §15)
  grade?: string; // kualitas (optional)
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ProblemType = 'hama' | 'penyakit' | 'cuaca' | 'air' | 'nutrisi' | 'lainnya';
export type ProblemSeverity = 'ringan' | 'sedang' | 'berat';
export type ProblemStatus = 'aktif' | 'teratasi';

export interface Problem {
  id: number;
  plantId: number;
  date: ISODate;
  type: ProblemType;
  severity: ProblemSeverity;
  description: string;
  action?: string; // tindakan yang dilakukan (optional)
  status: ProblemStatus;
  photo?: Blob | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --- Input / update payloads -------------------------------------------------

export type GardenInput = Omit<Garden, 'id' | 'createdAt' | 'updatedAt'>;
export type GardenUpdate = Partial<GardenInput>;

export type PlantInput = Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>;
export type PlantUpdate = Partial<Omit<PlantInput, 'gardenId'>>;

export type HarvestInput = Omit<Harvest, 'id' | 'createdAt' | 'updatedAt'>;
export type HarvestUpdate = Partial<Omit<HarvestInput, 'plantId'>>;

export type ProblemInput = Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>;
export type ProblemUpdate = Partial<Omit<ProblemInput, 'plantId'>>;

export interface ProblemFilter {
  type?: ProblemType;
  severity?: ProblemSeverity;
  status?: ProblemStatus;
}
