// types/farm.ts
export interface Farm {
  id: string;
  farmer_id: string;
  name: string;
  description?: string;
  location: string;
  coordinates?: string;
  total_area: number;
  cultivated_area?: number;
  soil_type?: string;
  certification?: string;
  images?: string[];
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  farmer_name?: string;
  farmer_email?: string;
  farmer_phone?: string;
  farmer_image?: string;
}

export interface CreateFarmData {
  name: string;
  description?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  total_area: number;
  cultivated_area?: number;
  soil_type?: string;
  certification?: string;
  images?: File[];
}

export interface UpdateFarmData extends Partial<CreateFarmData> {}

export interface FarmVerification {
  id: string;
  name: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_at?: string;
  rejection_reason?: string;
}

export interface FarmsResponse {
  success: boolean;
  farms: Farm[];
  count: number;
}

export interface FarmResponse {
  success: boolean;
  farm: Farm;
}

export interface VerificationResponse {
  success: boolean;
  verification: FarmVerification;
}

export interface PublicFarmsResponse {
  success: boolean;
  farms: Farm[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalFarms: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}