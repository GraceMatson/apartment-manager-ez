import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApartment } from '../context/ApartmentContext';

export default function ProfileView({ onOpenTenancyModal }) {
  const { currentUser, isManager, isOwner, isTenant, logout, openAuthGateway } = useAuth();
  const { getUserFlat, tenancyRequests } = useApartment();

  const userFlat = getUserFlat(currentUser);
  const userRequests = userFlat
    ? tenancyRequests.filter(r => r.flatNumber === userFlat.flatNumber)
    : [];

  return (
    <div className="view-content fade-in">
      <div className="view-header">
        <div>
          <h2>User Profile &amp; Residence Dossier</h2>
          <p className="view-subtitle">
            Authenticated Google Identity &amp; Apartment Registry Details
          </p>
        </div>
        <button className="btn btn-secondary" onClick={logout}>
          Sign Out of Portal
        </button>
      </div>

      <div className="profile-layout-grid">
        {/* Identity Dossier Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar-large">
              {currentUser?.avatar || 'U'}
            </div>
            <div className="profile-primary-meta">
              <span className="profile-display-name">
                {currentUser?.displayName || 'User Profile'}
              </span>
              <span className="profile-email-badge">
                <span className="google-g">G</span> {currentUser?.email}
              </span>
              <div className="profile-roles-row">
                <span
                  className={`badge ${
                    isManager
                      ? 'badge-manager'
                      : isOwner
                      ? 'badge-owner'
                      : 'badge-tenant'
                  }`}
                >
                  {isManager
                    ? 'Property Manager'
                    : isOwner
                    ? `Flat ${currentUser?.flatNumber} Owner`
                    : `Flat ${currentUser?.flatNumber} Tenant`}
                </span>
                <span className="badge badge-success">
                  ● Allowlist Approved
                </span>
              </div>
            </div>
          </div>

          <div className="profile-details-table">
            <div className="table-row">
              <span className="row-lbl">Contact Phone:</span>
              <span className="row-val">{currentUser?.phone || '+91 98765 00000'}</span>
            </div>
            <div className="table-row">
              <span className="row-lbl">Account Status:</span>
              <span className="row-val text-success">Active &amp; Verified</span>
            </div>
            <div className="table-row">
              <span className="row-lbl">Authentication Method:</span>
              <span className="row-val">Google OAuth (Firebase Auth)</span>
            </div>
            <div className="table-row">
              <span className="row-lbl">Community Membership:</span>
              <span className="row-val">Sreeja Fantasy Apartments Society</span>
            </div>
          </div>

          <div className="profile-card-footer">
            <button
              className="btn btn-outline-primary btn-sm btn-block"
              onClick={() => openAuthGateway(isManager ? 'manager' : 'resident')}
            >
              🔄 Switch Account / Re-authenticate
            </button>
          </div>
        </div>

        {/* Flat Dossier Card (if Resident) */}
        {userFlat ? (
          <div className="profile-card">
            <div className="profile-card-header-compact">
              <div className="flat-dossier-pill">
                <span className="pill-lbl">RESIDENCE</span>
                <span className="pill-val">FLAT {userFlat.flatNumber}</span>
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

            <div className="profile-details-table">
              <div className="table-row">
                <span className="row-lbl">Block &amp; Floor:</span>
                <span className="row-val">
                  {userFlat.block}, {userFlat.floor}
                </span>
              </div>
              <div className="table-row">
                <span className="row-lbl">Layout Specifications:</span>
                <span className="row-val">{userFlat.layout}</span>
              </div>
              <div className="table-row">
                <span className="row-lbl">Designated Parking:</span>
                <span className="row-val">{userFlat.parkingSlot}</span>
              </div>
              <div className="table-row">
                <span className="row-lbl">Registered Owner:</span>
                <span className="row-val">
                  {userFlat.owner.name} ({userFlat.owner.phone})
                </span>
              </div>
              <div className="table-row">
                <span className="row-lbl">Monthly Maintenance:</span>
                <span className="row-val">
                  ${userFlat.monthlyDues} / month ({userFlat.maintenanceStatus})
                </span>
              </div>

              {/* If Tenanted, Show Tenant Details */}
              {userFlat.occupancyStatus === 'Tenanted' && userFlat.tenant && (
                <>
                  <div className="table-row highlight-tenant-row">
                    <span className="row-lbl">Active Tenant:</span>
                    <span className="row-val font-weight-bold">
                      {userFlat.tenant.name}
                    </span>
                  </div>
                  <div className="table-row">
                    <span className="row-lbl">Tenant Google Email:</span>
                    <span className="row-val">
                      <code className="email-code">{userFlat.tenant.email}</code>
                    </span>
                  </div>
                  <div className="table-row">
                    <span className="row-lbl">Tenant Contact:</span>
                    <span className="row-val">{userFlat.tenant.phone}</span>
                  </div>
                  <div className="table-row">
                    <span className="row-lbl">Lease Validity:</span>
                    <span className="row-val">
                      {userFlat.tenant.leaseStart} to {userFlat.tenant.leaseEnd}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flat-tenancy-action-box">
                <h4>Tenancy Status &amp; Leasing Controls</h4>
                <p>
                  {userFlat.occupancyStatus === 'Owner-Occupied'
                    ? 'This flat is currently self-occupied. If you are leasing this flat to a tenant, submit a profile change request so management can whitelist their Google account.'
                    : 'This flat is currently tenanted. You can update the tenant information or submit a renewal request.'}
                </p>
                <button
                  className="btn btn-primary btn-block"
                  onClick={onOpenTenancyModal}
                >
                  {userFlat.occupancyStatus === 'Owner-Occupied'
                    ? '📋 Lease Out Flat / Register Tenant'
                    : '🔄 Update Tenancy Profile'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="profile-card">
            <div className="profile-card-header-compact">
              <h3>Management Administration Scope</h3>
            </div>
            <p className="admin-scope-desc">
              As Property Manager (Sarah Vance), you hold administrative oversight over all 10
              apartments across Block A and Block B in Sreeja Fantasy Apartments.
            </p>
            <ul className="admin-scope-list">
              <li>✓ Review and approve owner tenancy conversion applications</li>
              <li>✓ Manage Google OAuth pre-approved whitelist</li>
              <li>✓ Oversee monthly maintenance compliance and dues collection</li>
              <li>✓ Dispatch master plumbers and electricians for service desk tickets</li>
            </ul>
          </div>
        )}
      </div>

      {/* Tenancy Requests History for Owner */}
      {isOwner && userRequests.length > 0 && (
        <div className="section-block">
          <div className="section-header">
            <h3>Tenancy Change Request History</h3>
          </div>
          <div className="history-requests-list">
            {userRequests.map(req => (
              <div key={req.id} className="history-request-item">
                <div className="history-meta">
                  <span
                    className={`badge badge-${
                      req.status === 'Approved'
                        ? 'success'
                        : req.status === 'Pending'
                        ? 'warning'
                        : 'danger'
                    }`}
                  >
                    ● {req.status}
                  </span>
                  <span className="history-date">
                    Requested on {new Date(req.requestedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="history-content">
                  <strong>Tenant Candidate:</strong> {req.tenantDetails.name} (
                  {req.tenantDetails.email}) • Phone: {req.tenantDetails.phone} • Lease: {req.tenantDetails.leaseStart} ({req.tenantDetails.leaseDurationMonths} months)
                </div>
                {req.reviewedBy && (
                  <div className="history-review-note">
                    Reviewed by {req.reviewedBy} on{' '}
                    {new Date(req.reviewedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
