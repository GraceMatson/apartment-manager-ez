import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApartment } from '../context/ApartmentContext';

export default function Dashboard({ setActiveView, onOpenTenancyModal }) {
  const { currentUser, isManager, isOwner, isTenant } = useAuth();
  const {
    buildingInfo,
    flats,
    tenancyRequests,
    serviceRequests,
    announcements,
    getUserFlat
  } = useApartment();

  const userFlat = getUserFlat(currentUser);
  const pendingRequests = tenancyRequests.filter(r => r.status === 'Pending');
  const userPendingRequest = userFlat
    ? tenancyRequests.find(r => r.flatNumber === userFlat.flatNumber && r.status === 'Pending')
    : null;

  const totalFlats = flats.length;
  const ownerOccupiedCount = flats.filter(f => f.occupancyStatus === 'Owner-Occupied').length;
  const tenantedCount = flats.filter(f => f.occupancyStatus === 'Tenanted').length;
  const activeTickets = serviceRequests.filter(t => t.status !== 'Resolved').length;

  return (
    <div className="view-content fade-in">
      {/* Hero Banner */}
      <section className="dashboard-hero">
        <div
          className="hero-backdrop"
          style={{ backgroundImage: `url('/images/hero.jpg')` }}
        >
          <div className="hero-gradient-overlay" />
          <div className="hero-content">
            <span className="hero-badge">PREMIUM RESIDENTIAL COMMUNITY</span>
            <h1 className="hero-title">{buildingInfo.name}</h1>
            <p className="hero-subtitle">
              {buildingInfo.address} • {buildingInfo.totalFlats} Luxury Units across{' '}
              {buildingInfo.blocks.join(' & ')}
            </p>
            <div className="hero-actions">
              {isManager && (
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveView('flats')}
                >
                  🏘️ View All {totalFlats} Flats
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveView('maintenance')}
                  >
                    💳 Pay Maintenance Dues
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={onOpenTenancyModal}
                  >
                    📋 Lease Out / Register Tenant
                  </button>
                </>
              )}
              {isTenant && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveView('service')}
                  >
                    🛠️ Raise Service Request
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setActiveView('profile')}
                  >
                    👤 My Tenancy Dossier
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pending Tenancy Alert for Manager */}
      {isManager && pendingRequests.length > 0 && (
        <div className="alert-banner warning">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <h4>{pendingRequests.length} Pending Tenancy Conversion Request(s)</h4>
            <p>
              Owners have submitted tenancy requests awaiting your verification and Google
              whitelist approval.
            </p>
          </div>
          <button
            className="btn btn-warning btn-sm"
            onClick={() => setActiveView('flats')}
          >
            Review in Flats Directory →
          </button>
        </div>
      )}

      {/* Pending Tenancy Alert for Owner */}
      {isOwner && userPendingRequest && (
        <div className="alert-banner info">
          <div className="alert-icon">⏳</div>
          <div className="alert-content">
            <h4>Tenancy Conversion Under Review</h4>
            <p>
              Your request to lease Flat {userFlat.flatNumber} to{' '}
              <strong>{userPendingRequest.tenantDetails.name}</strong> (
              {userPendingRequest.tenantDetails.email}) is currently awaiting manager
              approval. Once approved, their Google account will be whitelisted automatically.
            </p>
          </div>
          <button
            className="btn btn-outline-info btn-sm"
            onClick={() => setActiveView('profile')}
          >
            View Request Status
          </button>
        </div>
      )}

      {/* Resident Flat Spotlight Card */}
      {(isOwner || isTenant) && userFlat && (
        <div className="flat-spotlight-card">
          <div className="spotlight-header">
            <div className="spotlight-title">
              <span className="unit-number-pill">FLAT {userFlat.flatNumber}</span>
              <h3>
                {userFlat.block}, {userFlat.floor}
              </h3>
            </div>
            <span
              className={`badge ${
                userFlat.occupancyStatus === 'Owner-Occupied'
                  ? 'badge-owner'
                  : 'badge-tenant'
              }`}
            >
              ● {userFlat.occupancyStatus}
            </span>
          </div>

          <div className="spotlight-grid">
            <div className="spotlight-item">
              <span className="item-label">Layout &amp; Size</span>
              <span className="item-value">{userFlat.layout}</span>
            </div>
            <div className="spotlight-item">
              <span className="item-label">Parking Bay</span>
              <span className="item-value">{userFlat.parkingSlot}</span>
            </div>
            <div className="spotlight-item">
              <span className="item-label">Owner</span>
              <span className="item-value">{userFlat.owner.name}</span>
            </div>
            <div className="spotlight-item">
              <span className="item-label">Occupancy Mode</span>
              <span className="item-value">
                {userFlat.occupancyStatus === 'Tenanted' && userFlat.tenant
                  ? `Leased to ${userFlat.tenant.name}`
                  : 'Self-Occupied by Owner'}
              </span>
            </div>
            <div className="spotlight-item">
              <span className="item-label">Maintenance Status</span>
              <span
                className={`item-value status-${userFlat.maintenanceStatus.toLowerCase()}`}
              >
                ${userFlat.monthlyDues}/mo ({userFlat.maintenanceStatus})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Building Units</span>
            <span className="kpi-icon">🏢</span>
          </div>
          <div className="kpi-value">{totalFlats} Units</div>
          <div className="kpi-meta">Block A (5) • Block B (5)</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Owner-Occupied</span>
            <span className="kpi-icon">🏠</span>
          </div>
          <div className="kpi-value">{ownerOccupiedCount}</div>
          <div className="kpi-meta">
            {Math.round((ownerOccupiedCount / totalFlats) * 100)}% of total residency
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Tenanted Units</span>
            <span className="kpi-icon">🔑</span>
          </div>
          <div className="kpi-value">{tenantedCount}</div>
          <div className="kpi-meta">
            {Math.round((tenantedCount / totalFlats) * 100)}% active leases
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Active Service Requests</span>
            <span className="kpi-icon">🛠️</span>
          </div>
          <div className="kpi-value">{activeTickets}</div>
          <div className="kpi-meta">Plumbing &amp; Electric maintenance</div>
        </div>
      </div>

      {/* Recent Community Notices */}
      <div className="section-block">
        <div className="section-header">
          <div>
            <h2>Community Announcements</h2>
            <p className="section-sub">Official notices for Sreeja Fantasy Apartments</p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveView('notices')}
          >
            View All Notices →
          </button>
        </div>

        <div className="announcements-cards-grid">
          {announcements.slice(0, 2).map(ann => (
            <div key={ann.id} className="announcement-preview-card">
              <div className="ann-card-header">
                <span className={`badge badge-${ann.priority.toLowerCase()}`}>
                  {ann.priority}
                </span>
                <span className="ann-date">{ann.publishedDate}</span>
              </div>
              <h3 className="ann-title">{ann.title}</h3>
              <p className="ann-snippet">{ann.content}</p>
              <div className="ann-author">By {ann.author}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
