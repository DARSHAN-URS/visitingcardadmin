import React, { useState, useEffect, useCallback } from 'react';
import './styles/main.css';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewPage } from './pages/OverviewPage';
import { WorkersPage } from './pages/WorkersPage';
import { VideosPage } from './pages/VideosPage';
import { CatalogPage } from './pages/CatalogPage';
import { BookingsPage } from './pages/BookingsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { apiService } from './services/api';
import {
  AdminMetrics,
  Worker,
  VideoReel,
  Booking,
  PaymentTransaction,
  CategoryItem,
} from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Core Data States
  const [metrics, setMetrics] = useState<AdminMetrics>({
    total_revenue: 0,
    total_bookings: 0,
    completed_bookings: 0,
    total_workers: 0,
    verified_workers: 0,
    pending_kyc: 0,
    total_customers: 0,
    active_videos: 0,
  });
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [videos, setVideos] = useState<VideoReel[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [m, w, v, c, b, p] = await Promise.all([
        apiService.getMetrics(),
        apiService.getWorkers(),
        apiService.getVideos(),
        apiService.getCategories(),
        apiService.getBookings(),
        apiService.getPayments(),
      ]);
      setMetrics(m);
      setWorkers(w);
      setVideos(v);
      setCategories(c);
      setBookings(b);
      setPayments(p);
      setApiError(apiService.lastError);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
      setApiError(err?.message || 'Error loading admin data');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleReviewWorker = async (
    workerId: string,
    action: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'ACTIVATE',
    notes: string
  ) => {
    try {
      await apiService.reviewWorker(workerId, action, notes);
      await loadData();
    } catch (err: any) {
      setApiError(err?.message || 'Worker review action failed');
    }
  };

  const handleReviewVideo = async (
    videoId: string,
    action: 'APPROVE' | 'REJECT' | 'REMOVE' | 'RESTORE',
    reason?: string
  ) => {
    try {
      await apiService.reviewVideo(videoId, action, reason);
      await loadData();
    } catch (err: any) {
      setApiError(err?.message || 'Video moderation action failed');
    }
  };

  const handleCancelBooking = async (bookingId: string, reason: string) => {
    try {
      await apiService.cancelBooking(bookingId, reason);
      await loadData();
    } catch (err: any) {
      setApiError(err?.message || 'Booking cancellation failed');
    }
  };

  const handleRefundPayment = async (paymentId: string, reason: string) => {
    try {
      await apiService.refundPayment(paymentId, reason);
      await loadData();
    } catch (err: any) {
      setApiError(err?.message || 'Refund processing failed');
    }
  };

  const handleCreateCategory = async (cat: Omit<CategoryItem, 'id' | 'subcategories_count' | 'services_count'>) => {
    try {
      await apiService.createCategory(cat);
      await loadData();
    } catch (err: any) {
      setApiError(err?.message || 'Failed to create category');
    }
  };

  const handleToggleCategory = async (catId: string) => {
    try {
      const target = categories.find((c) => c.id === catId);
      await apiService.toggleCategoryStatus(catId, target?.is_active);
      await loadData();
    } catch (err: any) {
      setApiError(err?.message || 'Failed to update category status');
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return { title: 'Executive Overview', subtitle: 'Marketplace platform activity & business metrics' };
      case 'workers':
        return { title: 'Worker Management & KYC', subtitle: 'Identity verification and onboarding review queue' };
      case 'videos':
        return { title: 'Showcase Video Moderation', subtitle: '30-second skill videos submitted by specialists' };
      case 'catalog':
        return { title: 'Service & Category Catalog', subtitle: 'Service definitions, hierarchy, and pricing models' };
      case 'bookings':
        return { title: 'Bookings & Dispatch Monitor', subtitle: 'On-demand appointments and dispute resolution' };
      case 'payments':
        return { title: 'Payments & Gateway Settlement', subtitle: 'Razorpay audit trail and administrative refund ledger' };
      case 'settings':
        return { title: 'Console Configuration', subtitle: 'Backend endpoints, credentials, and health monitoring' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingKycCount={metrics.pending_kyc}
      />

      {/* Main Screen Layout */}
      <div className="main-content">
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
        />

        <main className="page-viewport">
          {apiError && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                color: '#FCA5A5',
                fontSize: '0.86rem',
              }}
            >
              <span>{apiError}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {activeTab !== 'settings' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setActiveTab('settings')}
                  >
                    Sign In / Settings
                  </button>
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setApiError(null)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <OverviewPage
              metrics={metrics}
              recentBookings={bookings}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'workers' && (
            <WorkersPage
              workers={workers}
              onReviewWorker={handleReviewWorker}
            />
          )}

          {activeTab === 'videos' && (
            <VideosPage
              videos={videos}
              onReviewVideo={handleReviewVideo}
            />
          )}

          {activeTab === 'catalog' && (
            <CatalogPage
              categories={categories}
              onCreateCategory={handleCreateCategory}
              onToggleStatus={handleToggleCategory}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsPage
              bookings={bookings}
              onCancelBooking={handleCancelBooking}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsPage
              payments={payments}
              onRefundPayment={handleRefundPayment}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage onRefresh={loadData} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
