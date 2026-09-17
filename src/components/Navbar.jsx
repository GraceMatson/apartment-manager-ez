import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApartment } from '../context/ApartmentContext';

export default function Navbar({ activeView, setActiveView, onOpenTenancyModal }) {
  const { currentUser, isManager, isOwner, isTenant, logout, openAuthGateway } = useAuth();
  const { tenancyRequests, serviceRequests } = useApartment();

  const pendingRequestsCount = isManager
    ? tenancyRequests.filter(r => r.status === 'Pending').length
    : 0;

  const activeTicketsCount = isManager
    ? serviceRequests.filter(r => r.status !== 'Resolved').length
    : 0;

  const pageTitles = {
    dashboard: { title: 'Dashboard Overview', subtitle: 'Live community telemetry & management' },
    flats: { title: 'Flats & Tenancy Directory', subtitle: 'Complete directory of all 10 building units' },
    profile: { title: 'My Profile & Residence Dossier', subtitle: 'Google identity & apartment lease records' },
    maintenance: { title: 'Maintenance Assessments & Billing', subtitle: 'Monthly dues, online payment & receipts' },
    service: { title: 'Facilities Service Desk', subtitle: 'Plumbing, electrical & HVAC maintenance' },
    notices: { title: 'Community Circulars & Governance', subtitle: 'Announcements, bylaws & audited financials' }
  };

  const currentMeta = pageTitles[activeView] || pageTitles.dashboard;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="page-header-meta">
          <h2 className="topbar-view-title">{currentMeta.title}</h2>
          <span className="topbar-view-sub">{currentMeta.subtitle}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* User Role Badge */}
        {currentUser && (
          <div className="user-role-badge">
            <span
              className={`badge ${
                isManager ? 'badge-manager' : isOwner ? 'badge-owner' : 'badge-tenant'
              }`}
            >
              {isManager
                ? '★ Property Manager'
                : isOwner
                ? `Owner (Flat ${currentUser.flatNumber})`
                : `Tenant (Flat ${currentUser.flatNumber})`}
            </span>
          </div>
        )}

        {/* Action Button: If Owner, shortcut to Lease Flat */}
        {isOwner && (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={onOpenTenancyModal}
            title="Convert Flat to Tenant / Lease"
          >
            📋 Lease Out Flat
          </button>
        )}

        {/* Notifications */}
        <div className="notification-btn-wrapper" title="Pending Items">
          <button
            className="btn-icon"
            onClick={() => {
              if (isManager && pendingRequestsCount > 0) {
                setActiveView('flats');
              }
            }}
          >
            🔔
            {(pendingRequestsCount > 0 || activeTicketsCount > 0) && (
              <span className="notification-dot">
                {pendingRequestsCount + activeTicketsCount}
              </span>
            )}
          </button>
        </div>

        {/* User Profile Pill */}
        {currentUser ? (
          <div className="user-profile-header">
            <button
              className="user-profile-btn"
              onClick={() => setActiveView('profile')}
              title="View My Profile"
            >
              <div className="avatar-circle">{currentUser.avatar || 'U'}</div>
              <div className="user-info-text">
                <span className="user-name">{currentUser.displayName}</span>
                <span className="user-email-preview">{currentUser.email}</span>
              </div>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={logout}
              title="Sign Out"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => openAuthGateway('resident')}
          >
            Sign In with Google
          </button>
        )}
      </div>
    </header>
  );
}
