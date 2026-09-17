import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApartment } from '../context/ApartmentContext';

export default function Sidebar({ activeView, setActiveView, onOpenTenancyModal }) {
  const { currentUser, isManager, isOwner, isTenant, openAuthGateway } = useAuth();
  const { tenancyRequests, serviceRequests } = useApartment();

  const pendingRequestsCount = isManager
    ? tenancyRequests.filter(r => r.status === 'Pending').length
    : 0;

  const activeTicketsCount = isManager
    ? serviceRequests.filter(r => r.status !== 'Resolved').length
    : 0;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏢' },
    {
      id: 'flats',
      label: isManager ? 'Flats & Directory' : 'Building Flats',
      icon: '🏘️',
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} Pending` : null,
      badgeColor: 'warning'
    },
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'maintenance', label: 'Maintenance Dues', icon: '💳' },
    {
      id: 'service',
      label: 'Service Desk',
      icon: '🛠️',
      badge: activeTicketsCount > 0 && isManager ? `${activeTicketsCount}` : null,
      badgeColor: 'info'
    },
    { id: 'notices', label: 'Community Notices', icon: '📢' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo-glow">SF</div>
        <div className="brand-text">
          <span className="brand-name">Sreeja Fantasy</span>
          <span className="brand-sub">Apartments Society</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">MAIN NAVIGATION</div>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-link ${activeView === item.id ? 'active' : ''}`}
            onClick={() => setActiveView(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && (
              <span className={`nav-badge badge-${item.badgeColor}`}>{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Quick Action Box for Owner */}
      {isOwner && (
        <div className="sidebar-promo-card">
          <div className="promo-title">Lease Out Flat</div>
          <p className="promo-desc">
            Submit a tenancy conversion request with your tenant's Google email.
          </p>
          <button
            className="btn btn-primary btn-sm btn-block"
            onClick={onOpenTenancyModal}
          >
            + Register Tenant
          </button>
        </div>
      )}

      {/* User Switcher / Identity at bottom */}
      <div className="sidebar-footer">
        {currentUser ? (
          <div className="current-user-card">
            <div className="avatar-circle">{currentUser.avatar || 'U'}</div>
            <div className="current-user-details">
              <div className="user-name">{currentUser.displayName}</div>
              <div className="user-role-label">
                {isManager ? 'Manager' : `Flat ${currentUser.flatNumber} (${currentUser.role})`}
              </div>
            </div>
            <button
              className="btn-icon-subtle"
              onClick={() => openAuthGateway(isManager ? 'manager' : 'resident')}
              title="Switch Account"
            >
              🔄
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary btn-block"
            onClick={() => openAuthGateway('resident')}
          >
            Sign In with Google
          </button>
        )}
      </div>
    </aside>
  );
}
