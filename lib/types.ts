export interface Gear {
  id: string;
  name: string;
  bore_type: 'hex' | 'keyed' | 'bearing';
  bore_size: string; // e.g., "1/2", "3/8", "1.125", ".875"
  diametral_pitch: number;
  teeth: number;
  material: string;
  quantity: number;
  owner: string;
  created: string;
  updated: string;
}

export type GearStatus = 'in_stock' | 'few_remaining' | 'out_of_stock';

export function getGearStatus(quantity: number): GearStatus {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= 3) return 'few_remaining';
  return 'in_stock';
}

export interface GearFormData {
  name: string;
  bore_type: Gear['bore_type'];
  bore_size: string;
  diametral_pitch: number;
  teeth: number;
  material: string;
  quantity: number;
}

export const BORE_TYPES = [
  { value: 'hex', label: 'Hex' },
  { value: 'keyed', label: 'Keyed' },
  { value: 'bearing', label: 'Bearing' },
] as const;

export type BoreCategory = {
  bore_type: Gear['bore_type'];
  bore_size: string;
  label: string;
};
