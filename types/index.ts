export type UserRole = 'VIEWER' | 'BOOKER' | 'CUSTODIAN' | 'ADMIN';

export type FacilityCategory = 
  | 'SPORTS' 
  | 'AUDITORIUM' 
  | 'LECTURE_THEATRE' 
  | 'LAB';

export type BookingStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'DECLINED' 
  | 'CANCELLED' 
  | 'CHECKED_IN' 
  | 'NO_SHOW';

export type EquipmentType = 
  | 'PROJECTOR' 
  | 'PA_SYSTEM' 
  | 'STAGE_LIGHTING' 
  | 'GOALPOSTS';

export interface Department {
  id: string;
  name: string;
  is_academic: boolean;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department_id: string | null;
  penalty_points: number;
  created_at: string;
}

export interface Facility {
  id: string;
  name: string;
  category: FacilityCategory;
  capacity: number;
  location: string;
  requires_approval: boolean;
  setup_buffer_mins: number;
  strike_buffer_mins: number;
  is_under_maintenance: boolean;
}

export interface ResourceAddon {
  id?: string;
  booking_id?: string;
  equipment_type: EquipmentType;
  quantity: number;
}

export interface Booking {
  id: string;
  facility_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  effective_start: string;
  effective_end: string;
  title: string;
  purpose?: string;
  priority_tier: 1 | 2;
  status: BookingStatus;
  attendee_count: number;
  addons?: ResourceAddon[];
  created_at: string;
  facility_name?: string;
  booker_name?: string;
  department_name?: string;
}

export interface CreateBookingDTO {
  facility_id: string;
  start_time: string;
  end_time: string;
  title: string;
  purpose?: string;
  attendee_count: number;
  addons: Omit<ResourceAddon, 'id' | 'booking_id'>[];
}

export interface UpdateBookingStatusDTO {
  status: Extract<BookingStatus, 'APPROVED' | 'DECLINED' | 'CANCELLED'>;
  override_conflicts?: boolean;
}

export interface ApiErrorResponse {
  error: string;
  code: 
    | 'DOUBLE_BOOKING_CONFLICT'
    | 'QUOTA_EXCEEDED'
    | 'CAPACITY_EXCEEDED'
    | 'OUTSIDE_BOOKING_WINDOW'
    | 'PENALTY_LOCKOUT'
    | 'FORBIDDEN_IDOR'
    | 'UNAUTHORIZED'
    | 'RATE_LIMITED';
  details?: string;
}
