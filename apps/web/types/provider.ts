export interface Provider {
  id: string;
  user_id?: string;
  name: string;
  about?: string | null;
  photo_url?: string | null;
  service_type?: 'purohit' | 'cook' | 'both';
  languages?: string[];
  experience_years?: number | null;
  location?: string | null;
  is_approved?: boolean;
  availability_status?: 'available' | 'busy' | 'unavailable' | null;
  rating?: number | null;
  review_count?: number | null;
  created_at?: string;
  updated_at?: string;
  // extra fields from taxonomy helper
  category_code?: string | null;
  category_name?: string | null;
}
