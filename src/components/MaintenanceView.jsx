import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApartment } from '../context/ApartmentContext';

export default function MaintenanceView() {
  const { currentUser, isManager, isOwner, isTenant } = useAuth();
  const { maintenance, payMaintenanceInvoice } = useApartment();

  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'paid' | 'overdue'
  const [activePaymentInvoice, setActivePaymentInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay)');
  const [receiptInvoice, setReceiptInvoice] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Invoices list based on role
  const visibleInvoices = isManager
    ? maintenance
    : maintenance.filter(i => i.unitNumber === currentUser?.flatNumber);

  const filteredInvoices = visibleInvoices.filter(inv => {
    if (filter === 'paid') return inv.status === 'Paid';
    if (filter === 'pending') return inv.status === 'Pending';
    if (filter === 'overdue') return inv.status === 'Overdue';
    return true;
  });

  const totalBilled = maintenance.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalCollected = maintenance
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const handlePayConfirm = () => {
    if (!activePaymentInvoice) return;
    setIsProcessing(true);

    setTimeout(() => {
      payMaintenanceInvoice(activePaymentInvoice.id, paymentMethod);
      setIsProcessing(false);
      const updatedInv = {
        ...activePaymentInvoice,
        status: 'Paid',
        paidAt: new Date().toISOString(),
        paymentMethod,
        transactionId: `TXN-SREEJA-${Math.floor(100000 + Math.random() * 900000)}`
      };
      setActivePaymentInvoice(null);
      setReceiptInvoice(updatedInv);
    }, 1200);
  };

  return (
    <div className="view-content fade-in">
      <div className="view-header">
        <div>
          <h2>Maintenance Dues &amp; Billing Ledger</h2>
          <p className="view-subtitle">
            {isManager
              ? 'Comprehensive collection telemetry for Sreeja Fantasy Apartments'
              : `Maintenance assessments for Flat ${currentUser?.flatNumber}`}
          </p>
        </div>
      </div>

      {/* Manager Summary KPIs */}
      {isManager && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-title">Total Monthly Invoiced</span>
            <div className="kpi-value">${totalBilled.toLocaleString()}</div>
            <div className="kpi-meta">Across 10 apartments</div>
          </div>
          <div className="kpi-card">
            <span className="kpi-title">Total Collected</span>
            <div className="kpi-value text-success">${totalCollected.toLocaleString()}</div>
            <div className="kpi-meta">
              {Math.round((totalCollected / totalBilled) * 100)}% compliance
            </div>
          </div>
          <div className="kpi-card">
            <span className="kpi-title">Outstanding / Overdue</span>
            <div className="kpi-value text-danger">
              ${(totalBilled - totalCollected).toLocaleString()}
            </div>
            <div className="kpi-meta">
              {maintenance.filter(i => i.status !== 'Paid').length} units unpaid
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs-row">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Invoices ({visibleInvoices.length})
        </button>
        <button
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({visibleInvoices.filter(i => i.status === 'Pending').length})
        </button>
        <button
          className={`filter-tab ${filter === 'overdue' ? 'active' : ''}`}
          onClick={() => setFilter('overdue')}
        >
          Overdue ({visibleInvoices.filter(i => i.status === 'Overdue').length})
        </button>
        <button
          className={`filter-tab ${filter === 'paid' ? 'active' : ''}`}
          onClick={() => setFilter('paid')}
        >
          Paid ({visibleInvoices.filter(i => i.status === 'Paid').length})
        </button>
      </div>

      {/* Invoices Grid */}
      <div className="invoices-grid">
        {filteredInvoices.map(inv => (
          <div key={inv.id} className="invoice-card">
            <div className="invoice-card-header">
              <div className="invoice-unit-tag">FLAT {inv.unitNumber}</div>
              <span className={`badge status-${inv.status.toLowerCase()}`}>
                ● {inv.status}
              </span>
            </div>

            <div className="invoice-period-title">{inv.period} Assessment</div>
            <div className="invoice-resident-name">Resident: {inv.residentName}</div>

            <div className="invoice-breakdown">
              <div className="breakdown-row">
                <span>Base Maintenance</span>
                <span>${inv.baseAmount}</span>
              </div>
              <div className="breakdown-row">
                <span>Capital Sinking Fund</span>
                <span>${inv.sinkingFund}</span>
              </div>
              <div className="breakdown-row">
                <span>Water &amp; Common Utilities</span>
                <span>${inv.waterUtility}</span>
              </div>
              <div className="breakdown-row">
                <span>Parking Bay Allocation</span>
                <span>${inv.parkingFee}</span>
              </div>
              <div className="breakdown-divider" />
              <div className="breakdown-row total-row">
                <strong>Total Amount</strong>
                <strong className="total-price">${inv.totalAmount}</strong>
              </div>
            </div>

            <div className="invoice-footer">
              <span className="due-date-text">
                {inv.status === 'Paid'
                  ? `Paid on ${new Date(inv.paidAt).toLocaleDateString()}`
                  : `Due by: ${inv.dueDate}`}
              </span>

              {inv.status !== 'Paid' ? (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setActivePaymentInvoice(inv)}
                >
                  💳 Pay Now
                </button>
              ) : (
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setReceiptInvoice(inv)}
                >
                  📄 View Receipt
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Simulator Modal */}
      {activePaymentInvoice && (
        <div className="modal-backdrop fade-in" style={{ zIndex: 110 }}>
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-box">
                <span className="modal-icon">💳</span>
                <div>
                  <h3>Sreeja Fantasy Payment Gateway</h3>
                  <p className="modal-sub">
                    Settle Flat {activePaymentInvoice.unitNumber} {activePaymentInvoice.period}{' '}
                    Assessment
                  </p>
                </div>
              </div>
              <button className="btn-close" onClick={() => setActivePaymentInvoice(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="payment-amount-box">
                <span className="amount-lbl">Total Assessment Due</span>
                <span className="amount-val">${activePaymentInvoice.totalAmount}.00</span>
              </div>

              <div className="payment-method-selector">
                <label className="form-label">Select Payment Method</label>
                <div className="method-options">
                  <label
                    className={`method-option ${
                      paymentMethod === 'UPI (Google Pay)' ? 'selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      checked={paymentMethod === 'UPI (Google Pay)'}
                      onChange={() => setPaymentMethod('UPI (Google Pay)')}
                    />
                    <span>UPI (Google Pay / PhonePe)</span>
                  </label>

                  <label
                    className={`method-option ${
                      paymentMethod === 'Credit Card (Visa / Mastercard)' ? 'selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      checked={paymentMethod === 'Credit Card (Visa / Mastercard)'}
                      onChange={() => setPaymentMethod('Credit Card (Visa / Mastercard)')}
                    />
                    <span>Credit / Debit Card</span>
                  </label>

                  <label
                    className={`method-option ${
                      paymentMethod === 'Net Banking' ? 'selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      checked={paymentMethod === 'Net Banking'}
                      onChange={() => setPaymentMethod('Net Banking')}
                    />
                    <span>Net Banking (HDFC / SBI / ICICI)</span>
                  </label>
                </div>
              </div>

              <div className="gateway-security-pill">
                🔒 256-Bit SSL Encrypted Society Payment Gateway
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActivePaymentInvoice(null)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePayConfirm}
                disabled={isProcessing}
              >
                {isProcessing
                  ? 'Authorizing Transaction...'
                  : `Pay $${activePaymentInvoice.totalAmount} via ${paymentMethod.split(' ')[0]}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {receiptInvoice && (
        <div className="modal-backdrop fade-in" style={{ zIndex: 110 }}>
          <div className="modal-card receipt-card">
            <div className="modal-header">
              <div className="modal-title-box">
                <span className="modal-icon">🧾</span>
                <div>
                  <h3>Official Payment Receipt</h3>
                  <p className="modal-sub">Sreeja Fantasy Apartments Owners Welfare Association</p>
                </div>
              </div>
              <button className="btn-close" onClick={() => setReceiptInvoice(null)}>
                ✕
              </button>
            </div>

            <div className="receipt-body">
              <div className="receipt-stamp">PAID</div>
              <div className="receipt-header-row">
                <div>
                  <strong>Receipt ID:</strong> {receiptInvoice.transactionId || 'TXN-SREEJA-89412A'}
                </div>
                <div>
                  <strong>Date:</strong> {new Date(receiptInvoice.paidAt || Date.now()).toLocaleDateString()}
                </div>
              </div>

              <div className="receipt-table">
                <div className="receipt-row">
                  <span>Unit Assessed:</span>
                  <strong>Flat {receiptInvoice.unitNumber}</strong>
                </div>
                <div className="receipt-row">
                  <span>Resident Name:</span>
                  <span>{receiptInvoice.residentName}</span>
                </div>
                <div className="receipt-row">
                  <span>Billing Period:</span>
                  <span>{receiptInvoice.period}</span>
                </div>
                <div className="receipt-row">
                  <span>Payment Channel:</span>
                  <span>{receiptInvoice.paymentMethod || 'UPI (Google Pay)'}</span>
                </div>
                <div className="receipt-divider" />
                <div className="receipt-row receipt-total">
                  <strong>Total Paid:</strong>
                  <strong>${receiptInvoice.totalAmount}.00</strong>
                </div>
              </div>

              <div className="receipt-notes">
                This is a digitally generated association receipt. For tax inquiries, refer to
                Sreeja Fantasy Association PAN: AABTS9841C.
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setReceiptInvoice(null)}
              >
                Close Receipt
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.print()}
              >
                🖨️ Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
