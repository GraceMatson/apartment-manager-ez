import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApartment } from '../context/ApartmentContext';

export default function FlatsDirectory({ onOpenTenancyModal }) {
  const { isManager, isOwner, currentUser } = useAuth();
  const {
    flats,
    tenancyRequests,
    approveTenancyRequest,
    rejectTenancyRequest
  } = useApartment();

  const [filter, setFilter] = useState('all'); // 'all' | 'owner' | 'tenant' | 'overdue'
  const [successNotice, setSuccessNotice] = useState(null);

  const pendingRequests = tenancyRequests.filter(r => r.status === 'Pending');

  const filteredFlats = flats.filter(flat => {
    if (filter === 'owner') return flat.occupancyStatus === 'Owner-Occupied';
    if (filter === 'tenant') return flat.occupancyStatus === 'Tenanted';
    if (filter === 'overdue') return flat.maintenanceStatus === 'Overdue';
    return true;
  });

  const handleApprove = (requestId, flatNumber, tenantName, tenantEmail) => {
    approveTenancyRequest(requestId);
    setSuccessNotice(
      `✓ Tenancy Approved for Flat ${flatNumber}! ${tenantName} (${tenantEmail}) is now registered and whitelisted for Google login.`
    );
    setTimeout(() => setSuccessNotice(null), 8000);
  };

  const handleReject = (requestId, flatNumber) => {
    rejectTenancyRequest(requestId, 'Incomplete documentation');
    setSuccessNotice(`Tenancy request for Flat ${flatNumber} has been rejected.`);
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  return (
    <div className="view-content fade-in">
      {/* Header */}
      <div className="view-header">
        <div>
          <h2>Building Flats &amp; Occupancy Directory</h2>
          <p className="view-subtitle">
            Directory of all {flats.length} flats in Sreeja Fantasy Apartments (Block A &amp; B)
          </p>
        </div>

        {isOwner && (
          <button className="btn btn-primary" onClick={onOpenTenancyModal}>
            📋 Submit Tenancy Request
          </button>
        )}
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="alert-banner success fade-in">
          <div className="alert-icon">✓</div>
          <div className="alert-content">
            <h4>Action Completed</h4>
            <p>{successNotice}</p>
          </div>
          <button className="btn-close" onClick={() => setSuccessNotice(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Pending Tenancy Requests Queue */}
      {pendingRequests.length > 0 && (
        <div className="tenancy-approval-section">
          <div className="section-header-compact">
            <span className="badge badge-warning">Action Required</span>
            <h3>Pending Tenancy Conversion Requests ({pendingRequests.length})</h3>
          </div>

          <div className="tenancy-requests-list">
            {pendingRequests.map(req => (
              <div key={req.id} className="tenancy-request-card">
                <div className="request-unit-badge">
                  <span className="unit-label">FLAT</span>
                  <span className="unit-number">{req.flatNumber}</span>
                </div>

                <div className="request-details">
                  <div className="request-title-row">
                    <h4>Request to Lease Flat {req.flatNumber}</h4>
                    <span className="request-date">
                      Submitted: {new Date(req.requestedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="request-meta-grid">
                    <div>
                      <span className="meta-lbl">Requesting Owner:</span>
                      <strong>
                        {req.ownerName} ({req.ownerEmail})
                      </strong>
                    </div>
                    <div>
                      <span className="meta-lbl">Proposed Tenant:</span>
                      <strong className="text-highlight">{req.tenantDetails.name}</strong>
                    </div>
                    <div>
                      <span className="meta-lbl">Tenant Google Email (Allowlist):</span>
                      <code className="email-code">{req.tenantDetails.email}</code>
                    </div>
                    <div>
                      <span className="meta-lbl">Tenant Phone:</span>
                      <span>{req.tenantDetails.phone}</span>
                    </div>
                    <div>
                      <span className="meta-lbl">Lease Start &amp; Duration:</span>
                      <span>
                        {req.tenantDetails.leaseStart} ({req.tenantDetails.leaseDurationMonths}{' '}
                        months)
                      </span>
                    </div>
                    <div>
                      <span className="meta-lbl">Agreement Ref:</span>
                      <span>{req.tenantDetails.agreementRef}</span>
                    </div>
                  </div>

                  {req.notes && (
                    <div className="request-notes">
                      <em>Note: {req.notes}</em>
                    </div>
                  )}
                </div>

                <div className="request-actions">
                  {isManager ? (
                    <>
                      <button
                        className="btn btn-success btn-sm btn-block"
                        onClick={() =>
                          handleApprove(
                            req.id,
                            req.flatNumber,
                            req.tenantDetails.name,
                            req.tenantDetails.email
                          )
                        }
                      >
                        ✓ Approve &amp; Whitelist
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm btn-block"
                        onClick={() => handleReject(req.id, req.flatNumber)}
                      >
                        ✕ Reject Request
                      </button>
                    </>
                  ) : (
                    <div className="review-pending-tag">Under Manager Review</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs-row">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Flats ({flats.length})
        </button>
        <button
          className={`filter-tab ${filter === 'owner' ? 'active' : ''}`}
          onClick={() => setFilter('owner')}
        >
          Owner-Occupied ({flats.filter(f => f.occupancyStatus === 'Owner-Occupied').length})
        </button>
        <button
          className={`filter-tab ${filter === 'tenant' ? 'active' : ''}`}
          onClick={() => setFilter('tenant')}
        >
          Tenanted ({flats.filter(f => f.occupancyStatus === 'Tenanted').length})
        </button>
        <button
          className={`filter-tab ${filter === 'overdue' ? 'active' : ''}`}
          onClick={() => setFilter('overdue')}
        >
          Overdue Dues ({flats.filter(f => f.maintenanceStatus === 'Overdue').length})
        </button>
      </div>

      {/* Flats Cards Grid */}
      <div className="flats-grid">
        {filteredFlats.map(flat => {
          const isUserFlat = currentUser && currentUser.flatNumber === flat.flatNumber;

          return (
            <div
              key={flat.id}
              className={`flat-card ${isUserFlat ? 'user-flat-highlight' : ''}`}
            >
              <div className="flat-card-header">
                <div className="flat-id-box">
                  <span className="flat-label">FLAT</span>
                  <span className="flat-num">{flat.flatNumber}</span>
                </div>
                <div className="flat-badges">
                  <span
                    className={`badge ${
                      flat.occupancyStatus === 'Owner-Occupied'
                        ? 'badge-owner'
                        : 'badge-tenant'
                    }`}
                  >
                    ● {flat.occupancyStatus}
                  </span>
                  <span
                    className={`badge status-${flat.maintenanceStatus.toLowerCase()}`}
                  >
                    {flat.maintenanceStatus}
                  </span>
                </div>
              </div>

              <div className="flat-location-sub">
                {flat.block} • {flat.floor} • {flat.layout}
              </div>

              <div className="flat-details-list">
                <div className="flat-detail-row">
                  <span className="detail-lbl">Parking Bay:</span>
                  <span className="detail-val">{flat.parkingSlot}</span>
                </div>

                <div className="flat-detail-row">
                  <span className="detail-lbl">Homeowner:</span>
                  <span className="detail-val">
                    <strong>{flat.owner.name}</strong>
                    <br />
                    <small>{flat.owner.phone}</small>
                  </span>
                </div>

                {flat.occupancyStatus === 'Tenanted' && flat.tenant && (
                  <div className="flat-detail-row tenant-row">
                    <span className="detail-lbl">Tenant:</span>
                    <span className="detail-val">
                      <strong className="text-cyan">{flat.tenant.name}</strong>
                      <br />
                      <small>{flat.tenant.email}</small>
                      <br />
                      <small>Lease to: {flat.tenant.leaseEnd || '2026-12-31'}</small>
                    </span>
                  </div>
                )}

                <div className="flat-detail-row">
                  <span className="detail-lbl">Monthly Dues:</span>
                  <span className="detail-val">${flat.monthlyDues} / month</span>
                </div>
              </div>

              {/* Action buttons on card */}
              <div className="flat-card-actions">
                {isOwner && flat.flatNumber === currentUser?.flatNumber && (
                  <button
                    className="btn btn-outline-primary btn-sm btn-block"
                    onClick={onOpenTenancyModal}
                  >
                    {flat.occupancyStatus === 'Owner-Occupied'
                      ? '📋 Lease Out Flat'
                      : '🔄 Update Tenancy Profile'}
                  </button>
                )}
                {isUserFlat && (
                  <span className="your-flat-indicator">★ Your Apartment Unit</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
