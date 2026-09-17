import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApartment } from '../context/ApartmentContext';

export default function AuthGateway() {
  const {
    isAuthGatewayOpen,
    closeAuthGateway,
    selectedRoleGate,
    setSelectedRoleGate,
    handleGoogleSignIn,
    loginAsUser,
    authError,
    isLoading
  } = useAuth();

  const { authorizedUsers } = useApartment();
  const [localDeniedError, setLocalDeniedError] = useState(null);

  if (!isAuthGatewayOpen) return null;

  // Filter demo profiles for quick testing
  const managerProfiles = authorizedUsers.filter(u => u.role === 'manager');
  const residentProfiles = authorizedUsers.filter(u => u.role === 'owner' || u.role === 'tenant');

  const onGoogleClick = async () => {
    setLocalDeniedError(null);
    await handleGoogleSignIn(authorizedUsers);
  };

  const simulateUnapprovedAccount = () => {
    setLocalDeniedError(
      'Access Denied: The Google account (stranger.user@gmail.com) is not registered in Sreeja Fantasy Apartments. Pre-approval by property management is strictly required.'
    );
  };

  return (
    <div className="modal-backdrop fade-in" style={{ zIndex: 100 }}>
      <div className="auth-gateway-card">
        {/* Header */}
        <div className="auth-gateway-header">
          <div className="auth-logo-badge">🏢</div>
          <h2>Welcome to Sreeja Fantasy Apartments</h2>
          <p className="auth-subtitle">
            Secure Resident &amp; Property Management Portal
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="auth-role-tabs">
          <button
            type="button"
            className={`auth-role-tab ${selectedRoleGate === 'resident' ? 'active' : ''}`}
            onClick={() => {
              setSelectedRoleGate('resident');
              setLocalDeniedError(null);
            }}
          >
            <span className="tab-icon">🏠</span>
            <div className="tab-info">
              <span className="tab-title">Resident Portal</span>
              <span className="tab-desc">For Flat Owners &amp; Verified Tenants</span>
            </div>
          </button>

          <button
            type="button"
            className={`auth-role-tab ${selectedRoleGate === 'manager' ? 'active' : ''}`}
            onClick={() => {
              setSelectedRoleGate('manager');
              setLocalDeniedError(null);
            }}
          >
            <span className="tab-icon">💼</span>
            <div className="tab-info">
              <span className="tab-title">Manager Portal</span>
              <span className="tab-desc">For Association &amp; Property Admins</span>
            </div>
          </button>
        </div>

        {/* Access Denied or Auth Error Box */}
        {(authError || localDeniedError) && (
          <div className="auth-error-card">
            <div className="error-icon">🚫</div>
            <div className="error-body">
              <h4>Access Denied / Not Whitelisted</h4>
              <p>{authError || localDeniedError}</p>
              <small>
                Only pre-approved Google accounts on the building directory can log in.
              </small>
            </div>
          </div>
        )}

        {/* Primary Action: Google Sign-In */}
        <div className="auth-action-box">
          <button
            type="button"
            className="btn btn-google btn-block"
            onClick={onGoogleClick}
            disabled={isLoading}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            {isLoading
              ? 'Connecting with Google...'
              : `Sign in with Google (${selectedRoleGate === 'manager' ? 'Manager' : 'Resident'})`}
          </button>
          <div className="auth-security-notice">
            🔒 Pre-approved allowlist validation is enabled. Unauthorized accounts are blocked.
          </div>
        </div>

        {/* 1-Click Allowlist Testing Accounts */}
        <div className="auth-demo-section">
          <div className="demo-divider">
            <span>OR TEST WITH PRE-APPROVED ACCOUNTS</span>
          </div>

          <div className="demo-accounts-grid">
            {selectedRoleGate === 'manager' ? (
              <>
                <button
                  type="button"
                  className="demo-account-btn"
                  onClick={() => loginAsUser(managerProfiles[0])}
                >
                  <span className="demo-avatar">SV</span>
                  <div className="demo-meta">
                    <strong>Sarah Vance</strong>
                    <small>Property Manager (sarah.vance@sreejafantasy.com)</small>
                  </div>
                  <span className="demo-tag">Manager</span>
                </button>
                {managerProfiles[1] && (
                  <button
                    type="button"
                    className="demo-account-btn"
                    onClick={() => loginAsUser(managerProfiles[1])}
                  >
                    <span className="demo-avatar">GM</span>
                    <div className="demo-meta">
                      <strong>Grace Matson</strong>
                      <small>{managerProfiles[1].email}</small>
                    </div>
                    <span className="demo-tag">Manager</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="demo-account-btn"
                  onClick={() =>
                    loginAsUser(residentProfiles.find(u => u.email.includes('alex.rivera')))
                  }
                >
                  <span className="demo-avatar">AR</span>
                  <div className="demo-meta">
                    <strong>Alex Rivera</strong>
                    <small>Owner • Flat 402 (alex.rivera@sreejafantasy.com)</small>
                  </div>
                  <span className="demo-tag owner">Owner</span>
                </button>

                <button
                  type="button"
                  className="demo-account-btn"
                  onClick={() =>
                    loginAsUser(residentProfiles.find(u => u.email.includes('carlos.mendez')))
                  }
                >
                  <span className="demo-avatar">CM</span>
                  <div className="demo-meta">
                    <strong>Carlos Mendez</strong>
                    <small>Tenant • Flat 402 (carlos.mendez@sreejafantasy.com)</small>
                  </div>
                  <span className="demo-tag tenant">Tenant</span>
                </button>

                <button
                  type="button"
                  className="demo-account-btn"
                  onClick={() =>
                    loginAsUser(residentProfiles.find(u => u.email.includes('rajesh.sharma')))
                  }
                >
                  <span className="demo-avatar">RS</span>
                  <div className="demo-meta">
                    <strong>Rajesh Sharma</strong>
                    <small>Owner • Flat 101 (rajesh.sharma@sreejafantasy.com)</small>
                  </div>
                  <span className="demo-tag owner">Owner</span>
                </button>
              </>
            )}

            {/* Test Access Denied Button */}
            <button
              type="button"
              className="demo-account-btn test-denied"
              onClick={simulateUnapprovedAccount}
              title="Test rejection for unknown Google account"
            >
              <span className="demo-avatar">🚫</span>
              <div className="demo-meta">
                <strong>Simulate Unlisted Account</strong>
                <small>stranger.user@gmail.com (Not on Whitelist)</small>
              </div>
              <span className="demo-tag danger">Deny Gate</span>
            </button>
          </div>
        </div>

        {/* Close Button if user is already logged in */}
        <div className="auth-gateway-footer">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={closeAuthGateway}
          >
            Cancel / Close
          </button>
        </div>
      </div>
    </div>
  );
}
