import {
  AdminMetrics,
  Worker,
  VideoReel,
  Booking,
  PaymentTransaction,
  CategoryItem,
} from '../types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://xfzkdmwuwrxckgukgsyz.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmemtkbXd1d3J4Y2tndWtnc3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMjI1NzYsImV4cCI6MjEwMTU5ODU3Nn0.pKFiF3TX6VBK-9qxfGEvbdijiH0q2ThbQ17WPdsY8H4';

class AdminApiService {
  private baseUrl: string =
    import.meta.env.VITE_API_BASE_URL || 'https://api.edigitalvisitingcard.com/api/v1';
  private authToken: string = '';
  public lastError: string | null = null;

  constructor() {
    const savedUrl = localStorage.getItem('altruist_backend_url');
    if (savedUrl) this.baseUrl = savedUrl;

    const savedToken = localStorage.getItem('altruist_admin_token');
    if (savedToken) this.authToken = savedToken;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
    localStorage.setItem('altruist_backend_url', this.baseUrl);
  }

  public getAuthToken(): string {
    return this.authToken;
  }

  public setAuthToken(token: string) {
    this.authToken = token.trim();
    localStorage.setItem('altruist_admin_token', this.authToken);
    if (this.authToken) this.lastError = null;
  }

  public clearAuthToken() {
    this.authToken = '';
    localStorage.removeItem('altruist_admin_token');
  }

  public async signInWithEmail(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { ok: false, error: json.error_description || json.msg || 'Invalid credentials' };
      }
      if (json.access_token) {
        this.setAuthToken(json.access_token);
        return { ok: true };
      }
      return { ok: false, error: 'No access token returned by Supabase Auth' };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Network error during sign-in' };
    }
  }

  private getHeaders(withContentType = false): Record<string, string> {
    const headers: Record<string, string> = {};
    if (withContentType) headers['Content-Type'] = 'application/json';
    if (this.authToken) headers['Authorization'] = `Bearer ${this.authToken}`;
    return headers;
  }

  private handleHttpFailure(status: number, context: string) {
    if (status === 401 || status === 403) {
      this.lastError =
        status === 401
          ? 'Admin authentication required (401). Please sign in with your Admin credentials in Console Settings.'
          : 'Access denied (403). Your account requires ADMIN or SUPER_ADMIN role.';
    } else {
      this.lastError = `${context} failed with HTTP ${status}`;
    }
  }

  // --- Metrics ---
  public async getMetrics(): Promise<AdminMetrics> {
    try {
      const res = await fetch(`${this.baseUrl}/admin/reports`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        this.lastError = null;
        const json = await res.json();
        const m = json.data?.metrics ?? {};
        return {
          total_revenue: Number(m.total_revenue ?? 0),
          total_bookings: Number(m.total_bookings ?? 0),
          completed_bookings: Number(m.completed_bookings ?? 0),
          total_workers: Number(m.total_workers ?? 0),
          verified_workers: Number(m.verified_workers ?? 0),
          pending_kyc: Number(m.pending_kyc ?? 0),
          total_customers: Number(m.total_customers ?? 0),
          active_videos: Number(m.active_videos ?? 0),
        };
      }
      this.handleHttpFailure(res.status, 'Loading analytics');
    } catch (err: any) {
      this.lastError = `Backend unreachable: ${err?.message || 'Network error'}`;
    }
    return {
      total_revenue: 0,
      total_bookings: 0,
      completed_bookings: 0,
      total_workers: 0,
      verified_workers: 0,
      pending_kyc: 0,
      total_customers: 0,
      active_videos: 0,
    };
  }

  // --- Workers & KYC ---
  public async getWorkers(statusFilter?: string): Promise<Worker[]> {
    try {
      const query = statusFilter && statusFilter !== 'ALL' ? `?status=${statusFilter}&page_size=100` : '?page_size=100';
      const res = await fetch(`${this.baseUrl}/admin/workers${query}`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const items = json.data?.items ?? [];
        return items.map((w: any): Worker => ({
          id: w.id ?? '',
          user_id: w.user_id ?? '',
          professional_name: w.professional_name ?? '',
          trade_category: w.trade_category ?? (Array.isArray(w.skills) && w.skills[0]) ?? '',
          primary_phone: w.primary_phone ?? w.phone ?? '',
          operating_city: w.operating_city ?? w.city ?? '',
          operating_locality: w.operating_locality ?? w.locality ?? '',
          years_experience: Number(w.years_experience ?? w.experience_years ?? 0),
          verification_status: w.verification_status ?? 'DRAFT',
          admin_notes: w.admin_notes ?? undefined,
          rejection_reason: w.rejection_reason ?? undefined,
          average_rating: Number(w.average_rating ?? 0),
          total_reviews: Number(w.total_reviews ?? w.review_count ?? 0),
          total_jobs_completed: Number(w.total_jobs_completed ?? w.total_completed_jobs ?? 0),
          hourly_rate: w.hourly_rate != null ? Number(w.hourly_rate) : (w.starting_price != null ? Number(w.starting_price) : undefined),
          avatar_url: w.avatar_url ?? w.profile_photo_url ?? undefined,
          bio: w.bio ?? undefined,
          created_at: w.created_at ?? '',
          documents: Array.isArray(w.documents)
            ? w.documents.map((d: any) => ({
                id: d.id ?? '',
                document_type: d.document_type ?? 'IDENTITY_PROOF',
                file_url: d.file_url ?? d.file_path ?? '',
                verification_status: d.verification_status ?? (d.status === 'APPROVED' ? 'VERIFIED' : d.status) ?? 'PENDING',
                rejection_reason: d.rejection_reason ?? undefined,
                verified_at: d.verified_at ?? d.reviewed_at ?? undefined,
              }))
            : [],
        }));
      }
      this.handleHttpFailure(res.status, 'Loading workers');
    } catch (err: any) {
      this.lastError = `Backend unreachable: ${err?.message || 'Network error'}`;
    }
    return [];
  }

  public async reviewWorker(
    workerId: string,
    action: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'ACTIVATE',
    adminNotes: string
  ): Promise<boolean> {
    const payload: Record<string, any> = {
      action,
      admin_notes: adminNotes || undefined,
    };
    if (action === 'REJECT') {
      payload.rejection_reason =
        adminNotes.trim() || 'Application did not meet verification requirements.';
    }
    const res = await fetch(`${this.baseUrl}/admin/workers/${workerId}/review`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || errJson.detail || `Review failed (${res.status})`);
    }
    return true;
  }

  // --- Video Showcase Moderation ---
  public async getVideos(statusFilter?: string): Promise<VideoReel[]> {
    try {
      const query =
        statusFilter && statusFilter !== 'ALL'
          ? `?moderation_status=${statusFilter}&page_size=100`
          : '?page_size=100';
      const res = await fetch(`${this.baseUrl}/admin/videos${query}`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const items = json.data?.items ?? [];
        return items.map((v: any): VideoReel => ({
          id: v.id ?? '',
          worker_id: v.worker_id ?? '',
          worker_name: v.worker_name ?? '',
          worker_avatar: v.worker_avatar ?? undefined,
          worker_trade: v.worker_trade ?? v.category_name ?? '',
          title: v.title ?? '',
          caption: v.caption ?? '',
          hashtags: Array.isArray(v.hashtags) ? v.hashtags : [],
          category: v.category ?? v.category_name ?? '',
          video_url: v.video_url ?? '',
          thumbnail_url: v.thumbnail_url ?? '',
          duration_seconds: Number(v.duration_seconds ?? 0),
          price_from: Number(v.price_from ?? 0),
          views_count: Number(v.views_count ?? v.view_count ?? 0),
          likes_count: Number(v.likes_count ?? v.save_count ?? 0),
          reports_count: Number(v.reports_count ?? v.report_count ?? 0),
          moderation_status: v.moderation_status ?? 'PENDING',
          moderation_reason: v.moderation_reason ?? v.rejection_reason ?? undefined,
          created_at: v.created_at ?? '',
        }));
      }
      this.handleHttpFailure(res.status, 'Loading videos');
    } catch (err: any) {
      this.lastError = `Backend unreachable: ${err?.message || 'Network error'}`;
    }
    return [];
  }

  public async reviewVideo(
    videoId: string,
    action: 'APPROVE' | 'REJECT' | 'REMOVE' | 'RESTORE',
    reason?: string
  ): Promise<boolean> {
    const payload: Record<string, any> = {
      action,
      admin_notes: reason || undefined,
    };
    if (action === 'REJECT') {
      payload.rejection_reason =
        reason?.trim() || 'Video does not meet marketplace quality guidelines.';
    }
    const res = await fetch(`${this.baseUrl}/admin/videos/${videoId}/review`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || errJson.detail || `Video review failed (${res.status})`);
    }
    return true;
  }

  // --- Bookings ---
  public async getBookings(statusFilter?: string): Promise<Booking[]> {
    try {
      const query =
        statusFilter && statusFilter !== 'ALL'
          ? `?status=${statusFilter}&page_size=100`
          : '?page_size=100';
      const res = await fetch(`${this.baseUrl}/admin/bookings${query}`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const items = json.data?.items ?? [];
        return items.map((b: any): Booking => ({
          id: b.id ?? '',
          booking_number: b.booking_number ?? '',
          customer_name: b.customer_name ?? b.customer?.name ?? '',
          customer_phone: b.customer_phone ?? b.customer?.phone ?? '',
          customer_address: b.customer_address ?? [b.locality, b.city].filter(Boolean).join(', '),
          city: b.city ?? '',
          locality: b.locality ?? '',
          worker_name: b.worker_name ?? b.worker?.name ?? '',
          worker_trade: b.worker_trade ?? b.worker?.trade ?? '',
          worker_phone: b.worker_phone ?? b.worker?.phone ?? '',
          service_name: b.service_name ?? b.service?.name ?? '',
          scheduled_date: b.scheduled_date ?? '',
          scheduled_start_time: b.scheduled_start_time ?? '',
          estimated_price: Number(b.estimated_price ?? 0),
          final_price: Number(b.final_price ?? b.estimated_price ?? 0),
          payment_method: b.payment_method ?? '',
          payment_status: b.payment_status ?? 'PENDING',
          status: b.status ?? 'PENDING_WORKER_RESPONSE',
          notes: b.notes ?? undefined,
          cancellation_reason: b.cancellation_reason ?? undefined,
          cancelled_by: b.cancelled_by ?? undefined,
          created_at: b.created_at ?? '',
        }));
      }
      this.handleHttpFailure(res.status, 'Loading bookings');
    } catch (err: any) {
      this.lastError = `Backend unreachable: ${err?.message || 'Network error'}`;
    }
    return [];
  }

  public async cancelBooking(bookingId: string, reason: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/admin/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || errJson.detail || `Cancellation failed (${res.status})`);
    }
    return true;
  }

  // --- Payments & Refunds ---
  public async getPayments(): Promise<PaymentTransaction[]> {
    try {
      const res = await fetch(`${this.baseUrl}/payments/admin/all`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : [];
        return list.map((p: any): PaymentTransaction => ({
          id: p.id ?? '',
          payment_number: p.payment_number ?? '',
          booking_number: p.booking_number ?? '',
          customer_name: p.customer_name ?? '',
          worker_name: p.worker_name ?? '',
          service_name: p.service_name ?? '',
          amount: Number(p.amount ?? 0),
          currency: p.currency ?? 'INR',
          payment_method: p.payment_method ?? '',
          gateway: p.gateway ?? '',
          gateway_payment_id: p.gateway_payment_id ?? '',
          status: p.status ?? 'PENDING',
          invoice_number: p.invoice_number ?? undefined,
          created_at: p.created_at ?? '',
          paid_at: p.paid_at ?? undefined,
        }));
      }
      this.handleHttpFailure(res.status, 'Loading payments');
    } catch (err: any) {
      this.lastError = `Backend unreachable: ${err?.message || 'Network error'}`;
    }
    return [];
  }

  public async refundPayment(paymentId: string, reason: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/payments/admin/${paymentId}/refund`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || errJson.detail || `Refund failed (${res.status})`);
    }
    return true;
  }

  // --- Catalog & Categories ---
  public async getCategories(): Promise<CategoryItem[]> {
    try {
      const res = await fetch(`${this.baseUrl}/admin/categories`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : [];
        return list.map((c: any): CategoryItem => ({
          id: c.id ?? '',
          name: c.name ?? '',
          slug: c.slug ?? '',
          description: c.description ?? '',
          icon: c.icon ?? 'Sparkles',
          image_url: c.image_url ?? '',
          is_active: Boolean(c.is_active ?? true),
          subcategories_count: Number(c.subcategories_count ?? c.subcategory_count ?? 0),
          services_count: Number(c.services_count ?? c.service_count ?? 0),
        }));
      }
      this.handleHttpFailure(res.status, 'Loading categories');
    } catch (err: any) {
      this.lastError = `Backend unreachable: ${err?.message || 'Network error'}`;
    }
    return [];
  }

  public async createCategory(
    category: Omit<CategoryItem, 'id' | 'subcategories_count' | 'services_count'>
  ): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/admin/categories`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        image_url: category.image_url,
        is_active: category.is_active,
      }),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || errJson.detail || `Category creation failed (${res.status})`);
    }
    return true;
  }

  public async toggleCategoryStatus(categoryId: string, currentStatus?: boolean): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/admin/categories/${categoryId}`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify({ is_active: !(currentStatus ?? true) }),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || errJson.detail || `Category update failed (${res.status})`);
    }
    return true;
  }
}

export const apiService = new AdminApiService();
