export interface StudioDto {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
}

export interface StudioCardModel {
  id: string;
  title: string;
  address: string;
  phone: string;
  openLabel: string;
  cityChip: string;
}
