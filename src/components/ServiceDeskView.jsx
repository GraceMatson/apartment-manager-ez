import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApartment } from '../context/ApartmentContext';

export default function ServiceDeskView() {
  const { currentUser, isManager, isOwner, isTenant } = useAuth();
  const { serviceRequests, createServiceTicket, updateTicketStatus } = useApartment();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    category: 'Plumbing',
    subcategory: 'Pipe & Drain Leak',
    title: '',
    description: '',
    urgency: 'Normal',
    preferredSlot: 'Morning (9:00 AM - 12:00 PM)',
    phone: currentUser?.phone || '+91 98450 12345'
  });

  const visibleTickets = isManager
    ? serviceRequests
    : serviceRequests.filter(t => t.unitNumber === currentUser?.flatNumber);

  const filteredTickets = visibleTickets.filter(t => {
    if (categoryFilter === 'all') return true;
    return t.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  const handleFormChange = e => {
    const { name, value } = e.target;
    setTicketForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateTicket = e => {
    e.preventDefault();
    if (!ticketForm.title.trim() || !ticketForm.description.trim()) return;

    createServiceTicket({
      unitNumber: currentUser?.flatNumber || '402',
      residentName: currentUser?.displayName || 'Alex Rivera',
      residentEmail: currentUser?.email || 'alex.rivera@sreejafantasy.com',
      ...ticketForm
    });

    setIsModalOpen(false);
    setTicketForm({
      category: 'Plumbing',
      subcategory: 'Pipe & Drain Leak',
      title: '',
      description: '',
      urgency: 'Normal',
      preferredSlot: 'Morning (9:00 AM - 12:00 PM)',
      phone: currentUser?.phone || '+91 98450 12345'
    });
  };

  return (
    <div className="view-content fade-in">
      <div className="view-header">
        <div>
          <h2>Service Desk &amp; Facilities Maintenance</h2>
          <p className="view-subtitle">
            Plumbing, Electrical, and HVAC requests for Sreeja Fantasy Apartments
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          🛠️ Raise Service Ticket
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="filter-tabs-row">
        <button
          className={`filter-tab ${categoryFilter === 'all' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          All Requests ({visibleTickets.length})
        </button>
        <button
          className={`filter-tab ${categoryFilter === 'plumbing' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('plumbing')}
        >
          🚰 Plumbing ({visibleTickets.filter(t => t.category === 'Plumbing').length})
        </button>
        <button
          className={`filter-tab ${categoryFilter === 'electric' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('electric')}
        >
          ⚡ Electrical ({visibleTickets.filter(t => t.category === 'Electric').length})
        </button>
      </div>

      {/* Tickets List */}
      <div className="tickets-grid">
        {filteredTickets.map(ticket => (
          <div key={ticket.id} className="ticket-card">
            <div className="ticket-card-header">
              <div className="ticket-id-tag">
                <span className="ticket-id">{ticket.id}</span>
                <span className="ticket-unit">FLAT {ticket.unitNumber}</span>
              </div>
              <div className="ticket-badges">
                <span className={`badge badge-${ticket.urgency.toLowerCase()}`}>
                  {ticket.urgency} Urgency
                </span>
                <span
                  className={`badge status-${ticket.status
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                >
                  ● {ticket.status}
                </span>
              </div>
            </div>

            <h3 className="ticket-title">{ticket.title}</h3>
            <p className="ticket-desc">{ticket.description}</p>

            <div className="ticket-meta-grid">
              <div>
                <span className="meta-lbl">Category:</span>
                <span>{ticket.category} • {ticket.subcategory}</span>
              </div>
              <div>
                <span className="meta-lbl">Assigned Technician:</span>
                <strong>{ticket.assignedTo}</strong> ({ticket.assignedPhone})
              </div>
              <div>
                <span className="meta-lbl">Preferred Slot:</span>
                <span>{ticket.preferredSlot}</span>
              </div>
              <div>
                <span className="meta-lbl">Logged:</span>
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {ticket.resolutionNotes && (
              <div className="ticket-resolution-box">
                <strong>Technician Log:</strong> {ticket.resolutionNotes}
              </div>
            )}

            {/* Manager Ticket Controls */}
            {isManager && ticket.status !== 'Resolved' && (
              <div className="ticket-manager-actions">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() =>
                    updateTicketStatus(
                      ticket.id,
                      'In Progress',
                      'Technician on site diagnosing system.'
                    )
                  }
                >
                  Set In Progress
                </button>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() =>
                    updateTicketStatus(
                      ticket.id,
                      'Resolved',
                      'Parts replaced and validated with homeowner.'
                    )
                  }
                >
                  ✓ Mark Resolved
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Raise Ticket Modal */}
      {isModalOpen && (
        <div className="modal-backdrop fade-in" style={{ zIndex: 110 }}>
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-box">
                <span className="modal-icon">🛠️</span>
                <div>
                  <h3>Raise Service Request</h3>
                  <p className="modal-sub">
                    Dispatched to Sreeja Fantasy facilities maintenance crew
                  </p>
                </div>
              </div>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="modal-form">
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      className="form-select"
                      value={ticketForm.category}
                      onChange={handleFormChange}
                    >
                      <option value="Plumbing">🚰 Plumbing</option>
                      <option value="Electric">⚡ Electrical</option>
                      <option value="HVAC">❄️ HVAC / Air Conditioning</option>
                      <option value="Carpentry">🚪 Carpentry &amp; Fixtures</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Urgency Level</label>
                    <select
                      name="urgency"
                      className="form-select"
                      value={ticketForm.urgency}
                      onChange={handleFormChange}
                    >
                      <option value="Normal">Normal (Within 24-48 hrs)</option>
                      <option value="High">High (Same Day Attention)</option>
                      <option value="Urgent">Urgent / Emergency Leak</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Issue Headline</label>
                    <input
                      type="text"
                      name="title"
                      className="form-input"
                      value={ticketForm.title}
                      onChange={handleFormChange}
                      placeholder="e.g. Master bathroom faucet dripping"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Detailed Description</label>
                    <textarea
                      name="description"
                      className="form-textarea"
                      rows="3"
                      value={ticketForm.description}
                      onChange={handleFormChange}
                      placeholder="Describe the problem, exact room location, and when it started..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Technician Slot</label>
                    <select
                      name="preferredSlot"
                      className="form-select"
                      value={ticketForm.preferredSlot}
                      onChange={handleFormChange}
                    >
                      <option value="Morning (9:00 AM - 12:00 PM)">
                        Morning (9:00 AM - 12:00 PM)
                      </option>
                      <option value="Afternoon (1:00 PM - 4:00 PM)">
                        Afternoon (1:00 PM - 4:00 PM)
                      </option>
                      <option value="Evening (4:00 PM - 7:00 PM)">
                        Evening (4:00 PM - 7:00 PM)
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Resident Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={ticketForm.phone}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
