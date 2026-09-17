import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApartment } from '../context/ApartmentContext';

export default function TenancyRequestModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const { getUserFlat, submitTenancyRequest } = useApartment();

  const userFlat = getUserFlat(currentUser);

  const [formData, setFormData] = useState({
    name: 'Carlos Mendez',
    email: 'carlos.mendez@sreejafantasy.com',
    phone: '+91 98450 99887',
    leaseStart: '2026-10-01',
    leaseDurationMonths: '12',
    agreementRef: `LEASE-SREEJA-${userFlat?.flatNumber || '402'}-2026`,
    notes: 'Tenant employed in Hitec City IT corridor. Verifications completed.'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMessage('Please fill in all mandatory tenant contact fields.');
      return;
    }

    if (!formData.email.includes('@')) {
      setErrorMessage('Please enter a valid Google email address for the tenant.');
      return;
    }

    setIsSubmitting(true);

    try {
      submitTenancyRequest({
        flatNumber: userFlat?.flatNumber || currentUser?.flatNumber || '402',
        ownerName: currentUser?.displayName || 'Alex Rivera',
        ownerEmail: currentUser?.email || 'alex.rivera@sreejafantasy.com',
        tenantDetails: formData,
        notes: formData.notes
      });

      setIsSubmitting(false);
      setSuccessMessage(
        `✓ Request Submitted! Management has received the tenancy conversion request for Flat ${
          userFlat?.flatNumber || '402'
        }. Upon approval, ${formData.name} (${formData.email}) will be authorized to sign in.`
      );

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 3000);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(`Failed to submit request: ${err.message}`);
    }
  };

  return (
    <div className="modal-backdrop fade-in" style={{ zIndex: 120 }}>
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-box">
            <span className="modal-icon">📋</span>
            <div>
              <h3>Tenancy Profile Change Request</h3>
              <p className="modal-sub">
                Convert Flat {userFlat?.flatNumber || '402'} to Tenanted &amp; Authorize Tenant
              </p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {successMessage ? (
          <div className="modal-body">
            <div className="alert-banner success">
              <div className="alert-icon">✓</div>
              <div className="alert-content">
                <h4>Submission Received</h4>
                <p>{successMessage}</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="modal-body">
              {errorMessage && (
                <div className="alert-banner danger">
                  <div className="alert-icon">⚠️</div>
                  <div className="alert-content">
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Flat Context Banner */}
              <div className="info-callout">
                <strong>Unit Information:</strong> Flat {userFlat?.flatNumber || '402'} •{' '}
                {userFlat?.block || 'Block B'} • {userFlat?.layout || '2 BHK'} (Homeowner:{' '}
                {currentUser?.displayName})
              </div>

              {/* Form Grid */}
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">
                    Tenant Full Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Carlos Mendez"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    Tenant Google Email Address <span className="req">*</span>
                    <span className="field-hint">
                      (Crucial: Used for pre-approved Google Sign-In)
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. carlos.mendez@gmail.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Tenant Contact Phone <span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98450 00000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Lease Agreement Reference</label>
                  <input
                    type="text"
                    name="agreementRef"
                    className="form-input"
                    value={formData.agreementRef}
                    onChange={handleChange}
                    placeholder="e.g. LEASE-SREEJA-402-2026"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Lease Start Date</label>
                  <input
                    type="date"
                    name="leaseStart"
                    className="form-input"
                    value={formData.leaseStart}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Lease Duration</label>
                  <select
                    name="leaseDurationMonths"
                    className="form-select"
                    value={formData.leaseDurationMonths}
                    onChange={handleChange}
                  >
                    <option value="6">6 Months</option>
                    <option value="11">11 Months (Standard)</option>
                    <option value="12">12 Months (1 Year)</option>
                    <option value="24">24 Months (2 Years)</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Notes for Management Verification</label>
                  <textarea
                    name="notes"
                    className="form-textarea"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Provide any additional tenant context or ID verification notes..."
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting Request...' : 'Submit Profile Change Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
