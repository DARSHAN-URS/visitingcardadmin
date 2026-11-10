export type WorkerStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED' | 'DRAFT';

export interface WorkerDocument {
  id: string;
  document_type: string; // 'AADHAR_FRONT' | 'AADHAR_BACK' | 'TRADE_CERTIFICATE' | 'POLICE_VERIFICATION'
  document_number?: string;
  file_url: string;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejection_reason?: string;
  verified_at?: string;
}

export interface Worker {
  id: string;
  user_id: string;
  professional_name: string;
  trade_category: string;
  primary_phone: string;
  operating_city: string;
  operating_locality?: string;
  years_experience: number;
  verification_status: WorkerStatus;
  admin_notes?: string;
  rejection_reason?: string;
  average_rating: number;
  total_reviews: number;
  total_jobs_completed: number;
  hourly_rate?: number;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  documents: WorkerDocument[];
}

export type VideoStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REMOVED';

export interface VideoReel {
  id: string;
  worker_id: string;
  worker_name: string;
  worker_avatar?: string;
  worker_trade: string;
  title: string;
  caption: string;
  hashtags: string[];
  category: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  price_from: number;
  views_count: number;
  likes_count: number;
  reports_count: number;
  moderation_status: VideoStatus;
  moderation_reason?: string;
  created_at: string;
}

export type BookingStatus =
  | 'PENDING_WORKER_RESPONSE'
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'WORKER_ON_THE_WAY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CUSTOMER_CANCELLED'
  | 'WORKER_CANCELLED'
  | 'DISPUTED';

export interface Booking {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  city: string;
  locality?: string;
  worker_name: string;
  worker_trade: string;
  worker_phone: string;
  service_name: string;
  scheduled_date: string;
  scheduled_start_time: string;
  estimated_price: number;
  final_price: number;
  payment_method: string;
  payment_status: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  status: BookingStatus;
  notes?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  payment_number: string;
  booking_number: string;
  customer_name: string;
  worker_name: string;
  service_name: string;
  amount: number;
  currency: string;
  payment_method: string;
  gateway: string;
  gateway_payment_id: string;
  status: 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED';
  invoice_number?: string;
  created_at: string;
  paid_at?: string;
}

export interface ServiceItem {
  id: string;
  subcategory_id: string;
  name: string;
  slug: string;
  short_description: string;
  base_price: number;
  price_type: 'FIXED' | 'HOURLY' | 'INSPECTION';
  estimated_duration_minutes: number;
  is_active: boolean;
}

export interface SubcategoryItem {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  services_count: number;
  is_active: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image_url: string;
  subcategories_count: number;
  services_count: number;
  is_active: boolean;
}

export interface AdminMetrics {
  total_revenue: number;
  total_bookings: number;
  completed_bookings: number;
  total_workers: number;
  verified_workers: number;
  pending_kyc: number;
  total_customers: number;
  active_videos: number;
}
