// src/types.ts

export interface IWorker {
  _id: string;
  email: string;
  name?: string;
  role?: string;
  pictureUrl?: string; // İleride avatar URL’si de eklemek isterseniz
  // Diğer alanlar (availability, clinicId vs.) burada tanımlanabilir
}
