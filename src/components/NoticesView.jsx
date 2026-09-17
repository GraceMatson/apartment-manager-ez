import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApartment } from '../context/ApartmentContext';

export default function NoticesView() {
  const { isManager, currentUser } = useAuth();
  const {
    announcements,
    associationRules,
    meetingMinutes,
    expenseStatements,
    publishAnnouncement
  } = useApartment();

  const [activeTab, setActiveTab] = useState('announcements'); // 'announcements' | 'rules' | 'minutes' | 'finances'
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    category: 'General',
    priority: 'Normal',
    targetAudience: 'All Residents',
    content: ''
  });

  const handleFormChange = e => {
    const { name, value } = e.target;
    setNoticeForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePublish = e => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) return;

    publishAnnouncement({
      ...noticeForm,
      author: currentUser?.displayName || 'Sarah Vance (Property Manager)'
    });

    setIsPublishModalOpen(false);
    setNoticeForm({
      title: '',
      category: 'General',
      priority: 'Normal',
      targetAudience: 'All Residents',
      content: ''
    });
  };

  return (
    <div className="view-content fade-in">
      <div className="view-header">
        <div>
          <h2>Community Notices &amp; Association Governance</h2>
          <p className="view-subtitle">
            Official circulars, bylaws, meeting records &amp; financials for Sreeja Fantasy Apartments
          </p>
        </div>
        {isManager && (
          <button className="btn btn-primary" onClick={() => setIsPublishModalOpen(true)}>
            📢 Post Community Notice
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="filter-tabs-row">
        <button
          className={`filter-tab ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          📢 Announcements ({announcements.length})
        </button>
        <button
          className={`filter-tab ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          📜 Society Rules ({associationRules.length})
        </button>
        <button
          className={`filter-tab ${activeTab === 'minutes' ? 'active' : ''}`}
          onClick={() => setActiveTab('minutes')}
        >
          🏛️ AGM Minutes ({meetingMinutes.length})
        </button>
        <button
          className={`filter-tab ${activeTab === 'finances' ? 'active' : ''}`}
          onClick={() => setActiveTab('finances')}
        >
          📊 Financial Statements ({expenseStatements.length})
        </button>
      </div>

      {/* Tab 1: Announcements */}
      {activeTab === 'announcements' && (
        <div className="announcements-cards-grid">
          {announcements.map(ann => (
            <div key={ann.id} className="announcement-full-card">
              <div className="ann-card-header">
                <div className="ann-badges">
                  {ann.pinned && <span className="badge badge-pinned">📌 Pinned</span>}
                  <span className={`badge badge-${ann.priority.toLowerCase()}`}>
                    {ann.priority}
                  </span>
                  <span className="badge badge-category">{ann.category}</span>
                </div>
                <span className="ann-date">{ann.publishedDate}</span>
              </div>

              <h3 className="ann-title">{ann.title}</h3>
              <p className="ann-content">{ann.content}</p>

              <div className="ann-footer">
                <span className="ann-author">Published by: {ann.author}</span>
                <span className="ann-audience">Audience: {ann.targetAudience}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Rules & Bylaws */}
      {activeTab === 'rules' && (
        <div className="rules-list-grid">
          {associationRules.map(rule => (
            <div key={rule.id} className="rule-card">
              <div className="rule-header">
                <span className="rule-section-pill">Section {rule.section}</span>
                <h3>{rule.title}</h3>
              </div>
              <div className="rule-category">{rule.category}</div>
              <ul className="rule-clauses-list">
                {rule.clauses.map((clause, idx) => (
                  <li key={idx}>{clause}</li>
                ))}
              </ul>
              <div className="rule-footer">Last updated: {rule.lastUpdated}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: AGM Minutes */}
      {activeTab === 'minutes' && (
        <div className="minutes-container">
          {meetingMinutes.map(min => (
            <div key={min.id} className="minutes-card">
              <div className="minutes-header">
                <h3>{min.title}</h3>
                <span className="minutes-date">
                  {min.meetingDate} • {min.time}
                </span>
              </div>
              <div className="minutes-meta">
                <span>📍 Venue: {min.venue}</span>
                <span>👤 Chaired by: {min.chairedBy}</span>
                <span>👥 Attendees: {min.attendeesCount} Members</span>
              </div>

              <div className="minutes-section">
                <h4>Agenda Items Discussed:</h4>
                <ul>
                  {min.agenda.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="minutes-section">
                <h4>Resolutions Passed:</h4>
                {min.resolutions.map((res, idx) => (
                  <div key={idx} className="resolution-item">
                    <strong>{res.code}:</strong> {res.text} —{' '}
                    <span className="vote-tag">{res.vote}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Financial Statements */}
      {activeTab === 'finances' && (
        <div className="finances-container">
          {expenseStatements.map(stmt => (
            <div key={stmt.id} className="statement-card">
              <div className="statement-header">
                <div>
                  <h3>Monthly Expense &amp; Income Statement</h3>
                  <p className="statement-period">Period: {stmt.period}</p>
                </div>
                <span className="badge badge-success">● Audited &amp; Published</span>
              </div>

              <div className="financial-kpis-grid">
                <div className="fin-kpi">
                  <span className="fin-lbl">Total Association Revenue</span>
                  <div className="fin-val text-success">${stmt.totalIncome.toLocaleString()}</div>
                </div>
                <div className="fin-kpi">
                  <span className="fin-lbl">Total Operating Expenses</span>
                  <div className="fin-val text-danger">
                    ${stmt.totalExpenses.toLocaleString()}
                  </div>
                </div>
                <div className="fin-kpi">
                  <span className="fin-lbl">Net Surplus Transferred to Reserve</span>
                  <div className="fin-val text-primary">
                    +${stmt.netSurplus.toLocaleString()}
                  </div>
                </div>
                <div className="fin-kpi">
                  <span className="fin-lbl">Capital Reserve Fund Total</span>
                  <div className="fin-val font-weight-bold">
                    ${stmt.reserveFundBalance.toLocaleString()}
                  </div>
                </div>
              </div>

              <h4>Expenditure Categorization:</h4>
              <div className="fin-categories-table">
                {stmt.categories.map((cat, idx) => (
                  <div key={idx} className="fin-cat-row">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-percent">{cat.percent}%</span>
                    <span className="cat-amount">${cat.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Notice Modal */}
      {isPublishModalOpen && (
        <div className="modal-backdrop fade-in" style={{ zIndex: 110 }}>
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-box">
                <span className="modal-icon">📢</span>
                <div>
                  <h3>Publish Community Notice</h3>
                  <p className="modal-sub">Broadcast to Sreeja Fantasy Apartments residents</p>
                </div>
              </div>
              <button className="btn-close" onClick={() => setIsPublishModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handlePublish} className="modal-form">
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Notice Headline</label>
                    <input
                      type="text"
                      name="title"
                      className="form-input"
                      value={noticeForm.title}
                      onChange={handleFormChange}
                      placeholder="e.g. Scheduled Generator Maintenance This Friday"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      className="form-select"
                      value={noticeForm.category}
                      onChange={handleFormChange}
                    >
                      <option value="General">General</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Security">Security</option>
                      <option value="Amenities">Amenities</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority Level</label>
                    <select
                      name="priority"
                      className="form-select"
                      value={noticeForm.priority}
                      onChange={handleFormChange}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Important">Important</option>
                      <option value="Urgent">Urgent / Action Required</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Notice Body</label>
                    <textarea
                      name="content"
                      className="form-textarea"
                      rows="4"
                      value={noticeForm.content}
                      onChange={handleFormChange}
                      placeholder="Enter the complete text of the notice..."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsPublishModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish to Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
