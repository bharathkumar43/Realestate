export type AreaUnit = 'sqyd' | 'sqft' | 'acre';
export type PlotStatus = 'available' | 'reserved' | 'sold';

export interface PlotImage {
  id: string;
  storage_path: string;
  sort_order: number;
  is_cover: boolean;
  url: string;
}

export interface PlotFields {
  title: string;
  location: string;
  city: string;
  area_value: number;
  area_unit: AreaUnit;
  price: number;
  price_negotiable: boolean;
  facing: string;
  approval: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  status: PlotStatus;
  featured: boolean;
}

export interface Plot extends PlotFields {
  id: string;
  created_at: string;
  images: PlotImage[];
}

export interface AgentProfile {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  email: string;
  bio: string;
  experience_years: number;
  plots_sold: number;
  photo_url: string;
  photo_path: string;
}

/** An image in the admin editor: either already saved, or a new file picked by the agent. */
export type DraftImage =
  | { kind: 'existing'; id: string; storage_path: string; url: string }
  | { kind: 'new'; key: string; file: File; url: string };
