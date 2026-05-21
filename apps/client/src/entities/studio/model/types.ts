export interface StudioDto {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  photoUrl?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

export interface StudioCardModel {
  id: string;
  title: string;
  address: string;
  phone: string;
  openLabel: string;
  cityChip: string;
  photoUrl?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}
