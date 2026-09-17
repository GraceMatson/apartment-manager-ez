/**
 * ApexLiving Apartment Management Suite - Frontend Application Logic
 * Strict adherence to secure DOM manipulation (no raw innerHTML for untrusted data)
 */

import { INITIAL_DATA } from './seed-data.js';
import { 
  firebaseConfig, 
  isFirebaseOnline, 
  auth, 
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from './firebase-config.js';

// ================= State Management =================
const STORAGE_KEY = 'apexliving_state_v1';

class AppState {
  constructor() {
    this.currentUser = null;
    this.activeView = 'dashboard'; // dashboard, maintenance, services, announcements, rules, minutes, expenses, reminders
    this.data = this.loadState();
    this.subscribers = [];
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load from localStorage, using initial seed data');
    }
    this.saveState(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveState(newData) {
    if (newData) this.data = newData;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
    this.notify();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notify() {
    this.subscribers.forEach(cb => cb(this));
  }

  setCurrentUser(user) {
    this.currentUser = user;
    this.notify();
  }

  // Helper getters
  isManager() {
    return this.currentUser && this.currentUser.role === 'manager';
  }

  isTenant() {
    return this.currentUser && this.currentUser.role === 'tenant';
  }

  getTenantUnit() {
    return this.currentUser ? this.currentUser.unitNumber : null;
  }
}

export const state = new AppState();

// Initialize default user as Sarah Vance (Manager) for first load preview
const defaultUser = state.data.users.find(u => u.role === 'manager') || state.data.users[0];
state.setCurrentUser(defaultUser);

// ================= DOM Helper Functions (Secure - XSS Safe) =================
function createElement(tag, className = '', textContent = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (textContent) el.textContent = textContent;
  return el;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = createElement('div', `toast toast-${type}`);
  const icon = createElement('span', '', type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ');
  const text = createElement('span', '', message);
  
  toast.appendChild(icon);
  toast.appendChild(text);
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ================= Modal Handlers =================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
  }
}

// Global modal close handlers
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('show');
  }
  if (e.target.classList.contains('modal-close-btn') || e.target.closest('.modal-close-btn')) {
    const backdrop = e.target.closest('.modal-backdrop');
    if (backdrop) backdrop.classList.remove('show');
  }
});

// ================= Navigation & View Routing =================
function setActiveView(viewName) {
  state.activeView = viewName;
  
  // Update sidebar active classes
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.dataset.view === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update page title
  const titleEl = document.getElementById('page-heading');
  const subtitleEl = document.getElementById('page-subheading');
  const viewTitles = {
    dashboard: { title: 'Resident & Property Dashboard', sub: 'Overview of maintenance, tickets, and community alerts' },
    maintenance: { title: state.isManager() ? 'Maintenance Collections Ledger' : 'My Unit Maintenance & Dues', sub: state.isManager() ? 'Track dues, record payments, and send tenant reminders' : 'Review monthly fee breakdown, pay online, and view receipts' },
    services: { title: state.isManager() ? 'Service Requests Desk (Electric, Plumbing)' : 'Submit & Track Service Requests', sub: state.isManager() ? 'Dispatch electricians, plumbers, and manage ticket lifecycle' : 'Report issues in your unit with priority status updates' },
    announcements: { title: 'Community Announcements', sub: 'Important building updates, notices, and scheduled maintenance' },
    rules: { title: 'Association Rules & Bylaws', sub: 'Official community regulations, guidelines, and living policies' },
    minutes: { title: 'Meeting Minutes & Resolutions', sub: 'Archive of Executive Committee proceedings and AGM records' },
    expenses: { title: 'Expense Statements & Financials', sub: 'Transparent accounting breakdown of association income and expenses' },
    reminders: { title: 'Notifications & Reminders', sub: 'Dues alerts, scheduled inspections, and utility updates' }
  };

  if (viewTitles[viewName]) {
    if (titleEl) titleEl.textContent = viewTitles[viewName].title;
    if (subtitleEl) subtitleEl.textContent = viewTitles[viewName].sub;
  }

  renderActiveView();
}

// ================= View Renderers =================
function renderActiveView() {
  const container = document.getElementById('view-content-root');
  if (!container) return;
  container.replaceChildren();

  // Update Reminders counter badge
  updateRemindersCounter();

  switch (state.activeView) {
    case 'dashboard':
      renderDashboard(container);
      break;
    case 'maintenance':
      state.isManager() ? renderManagerMaintenance(container) : renderTenantMaintenance(container);
      break;
    case 'services':
      state.isManager() ? renderManagerServices(container) : renderTenantServices(container);
      break;
    case 'announcements':
      renderAnnouncementsView(container);
      break;
    case 'rules':
      renderRulesView(container);
      break;
    case 'minutes':
      renderMinutesView(container);
      break;
    case 'expenses':
      renderExpensesView(container);
      break;
    case 'reminders':
      renderRemindersView(container);
      break;
    default:
      renderDashboard(container);
  }
}

// -------------------------------------------------------------
// 1. DASHBOARD VIEW
// -------------------------------------------------------------
function renderDashboard(container) {
  const isManager = state.isManager();
  const user = state.currentUser;

  // Hero Card
  const heroCard = createElement('div', 'hero-card');
  const heroImg = createElement('img', 'hero-bg-img');
  heroImg.src = 'images/hero.jpg';
  heroImg.alt = 'Aurora Residences Highrise Condominium';
  const overlay = createElement('div', 'hero-overlay');
  
  const heroContent = createElement('div', 'hero-content');
  const tag = createElement('div', 'hero-tag');
  tag.textContent = isManager ? '🏢 Management Executive Suite' : `🏠 Resident Home • Unit ${user.unitNumber || '402'}`;
  
  const title = createElement('h2', 'hero-title');
  title.textContent = isManager ? `Welcome back, ${user.displayName}` : `Good day, ${user.displayName}`;
  
  const desc = createElement('p', 'hero-desc');
  desc.textContent = isManager
    ? 'Aurora Residences management portal. Oversee collections, dispatch technicians for electric and plumbing tickets, and publish association records.'
    : `Welcome to your resident suite at Aurora Residences (${user.tower || 'Tower A'}, ${user.bedrooms || '2 BHK'}). Track maintenance dues, request maintenance, and stay informed with community notices.`;
  
  const actions = createElement('div', 'hero-actions');
  if (isManager) {
    const btnDues = createElement('button', 'btn btn-primary', '+ Issue Assessment');
    btnDues.addEventListener('click', () => openModal('modal-issue-dues'));
    const btnAnnounce = createElement('button', 'btn btn-secondary', '📢 Post Announcement');
    btnAnnounce.addEventListener('click', () => openModal('modal-create-announcement'));
    actions.appendChild(btnDues);
    actions.appendChild(btnAnnounce);
  } else {
    const btnPay = createElement('button', 'btn btn-success', '💳 Pay Maintenance');
    btnPay.addEventListener('click', () => handleOpenPaymentModal());
    const btnReq = createElement('button', 'btn btn-primary', '⚡ Request Service');
    btnReq.addEventListener('click', () => openModal('modal-new-service'));
    actions.appendChild(btnPay);
    actions.appendChild(btnReq);
  }

  heroContent.appendChild(tag);
  heroContent.appendChild(title);
  heroContent.appendChild(desc);
  heroContent.appendChild(actions);

  heroCard.appendChild(heroImg);
  heroCard.appendChild(overlay);
  heroCard.appendChild(heroContent);
  container.appendChild(heroCard);

  // Stats Grid
  const statsGrid = createElement('div', 'stats-grid');
  if (isManager) {
    // Manager Stats
    const totalDues = state.data.maintenance.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalCollected = state.data.maintenance.filter(m => m.status === 'Paid').reduce((acc, curr) => acc + curr.totalAmount, 0);
    const collectionRate = Math.round((totalCollected / (totalDues || 1)) * 100);
    const activeTickets = state.data.serviceRequests.filter(s => s.status !== 'Resolved' && s.status !== 'Closed').length;

    statsGrid.appendChild(createStatCard('Total Collections', `$${totalCollected.toLocaleString()}`, `${collectionRate}% rate of $${totalDues.toLocaleString()}`, 'stat-icon-success', '💰'));
    statsGrid.appendChild(createStatCard('Active Tickets', `${activeTickets} Open`, 'Electrical, Plumbing & HVAC', 'stat-icon-warning', '⚡'));
    statsGrid.appendChild(createStatCard('Reserve Fund', `$142,500`, 'Capital sinking fund healthy', 'stat-icon-primary', '🏦'));
    statsGrid.appendChild(createStatCard('Announcements', `${state.data.announcements.length} Published`, 'Latest: Overhead tank sanitization', 'stat-icon-cyan', '📢'));
  } else {
    // Tenant Stats
    const myDues = state.data.maintenance.filter(m => m.unitNumber === user.unitNumber || m.tenantId === user.id);
    const currentDue = myDues.find(m => m.status === 'Pending' || m.status === 'Overdue');
    const myTickets = state.data.serviceRequests.filter(s => s.unitNumber === user.unitNumber || s.tenantId === user.id);
    const unreadReminders = state.data.reminders.filter(r => (r.targetUnit === user.unitNumber || r.targetUnit === 'All') && !r.read).length;

    statsGrid.appendChild(createStatCard('Current Dues', currentDue ? `$${currentDue.totalAmount}` : '$0.00', currentDue ? `Due by ${currentDue.dueDate}` : 'All dues settled ✓', currentDue ? 'stat-icon-danger' : 'stat-icon-success', '💳'));
    statsGrid.appendChild(createStatCard('My Service Tickets', `${myTickets.length} Total`, `${myTickets.filter(t => t.status !== 'Resolved').length} currently open`, 'stat-icon-primary', '🔧'));
    statsGrid.appendChild(createStatCard('Unread Reminders', `${unreadReminders} New`, 'Dues & utility updates', 'stat-icon-warning', '🔔'));
    statsGrid.appendChild(createStatCard('Building Bylaws', `${state.data.associationRules.length} Sections`, 'Quiet hours, Parking, Pets', 'stat-icon-cyan', '📜'));
  }
  container.appendChild(statsGrid);

  // Quick Overview Split Section
  const splitGrid = createElement('div', 'stats-grid');
  splitGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(400px, 1fr))';

  // Section 1: Recent Announcements Widget
  const annPanel = createElement('div', 'section-panel');
  const annHeader = createElement('div', 'panel-header');
  const annTitleGroup = createElement('div', 'panel-title-group');
  annTitleGroup.appendChild(createElement('h3', '', '📢 Community Notice Board'));
  annTitleGroup.appendChild(createElement('p', '', 'Important updates published by management'));
  const btnViewAllAnn = createElement('button', 'btn btn-secondary btn-sm', 'View All');
  btnViewAllAnn.addEventListener('click', () => setActiveView('announcements'));
  annHeader.appendChild(annTitleGroup);
  annHeader.appendChild(btnViewAllAnn);
  annPanel.appendChild(annHeader);

  const annBody = createElement('div', 'panel-body');
  const annList = createElement('div', 'announcements-list');
  state.data.announcements.slice(0, 2).forEach(ann => {
    annList.appendChild(createAnnouncementCardElement(ann, false));
  });
  annBody.appendChild(annList);
  annPanel.appendChild(annBody);
  splitGrid.appendChild(annPanel);

  // Section 2: Recent Service Requests Widget
  const reqPanel = createElement('div', 'section-panel');
  const reqHeader = createElement('div', 'panel-header');
  const reqTitleGroup = createElement('div', 'panel-title-group');
  reqTitleGroup.appendChild(createElement('h3', '', '🔧 Service Desk Summary'));
  reqTitleGroup.appendChild(createElement('p', '', isManager ? 'Active electrical & plumbing maintenance' : 'Recent tickets submitted for your unit'));
  const btnViewAllReq = createElement('button', 'btn btn-secondary btn-sm', 'View All');
  btnViewAllReq.addEventListener('click', () => setActiveView('services'));
  reqHeader.appendChild(reqTitleGroup);
  reqHeader.appendChild(btnViewAllReq);
  reqPanel.appendChild(reqHeader);

  const reqBody = createElement('div', 'panel-body');
  const reqList = createElement('div', 'tickets-grid');
  const ticketsToDisplay = isManager 
    ? state.data.serviceRequests.slice(0, 2)
    : state.data.serviceRequests.filter(s => s.unitNumber === user.unitNumber || s.tenantId === user.id).slice(0, 2);

  if (ticketsToDisplay.length === 0) {
    const emptyNotice = createElement('p', 'meta-label', 'No active service requests at this time.');
    emptyNotice.style.padding = '20px 0';
    reqBody.appendChild(emptyNotice);
  } else {
    ticketsToDisplay.forEach(t => reqList.appendChild(createTicketCardElement(t)));
    reqBody.appendChild(reqList);
  }
  reqPanel.appendChild(reqBody);
  splitGrid.appendChild(reqPanel);

  container.appendChild(splitGrid);
}

function createStatCard(title, value, subtext, iconClass, iconSymbol) {
  const card = createElement('div', 'stat-card');
  const header = createElement('div', 'stat-header');
  header.appendChild(createElement('span', 'stat-title', title));
  const iconWrap = createElement('div', `stat-icon-wrapper ${iconClass}`);
  iconWrap.textContent = iconSymbol;
  header.appendChild(iconWrap);

  const valEl = createElement('div', 'stat-value', value);
  const footer = createElement('div', 'stat-footer', subtext);

  card.appendChild(header);
  card.appendChild(valEl);
  card.appendChild(footer);
  return card;
}

// -------------------------------------------------------------
// 2. MAINTENANCE COLLECTIONS VIEW
// -------------------------------------------------------------
function renderManagerMaintenance(container) {
  // Stats Row
  const totalDues = state.data.maintenance.reduce((a, b) => a + b.totalAmount, 0);
  const collected = state.data.maintenance.filter(m => m.status === 'Paid').reduce((a, b) => a + b.totalAmount, 0);
  const pending = state.data.maintenance.filter(m => m.status === 'Pending').reduce((a, b) => a + b.totalAmount, 0);
  const overdue = state.data.maintenance.filter(m => m.status === 'Overdue').reduce((a, b) => a + b.totalAmount, 0);

  const stats = createElement('div', 'stats-grid');
  stats.appendChild(createStatCard('Total Assessed', `$${totalDues.toLocaleString()}`, 'Current period dues', 'stat-icon-primary', '📋'));
  stats.appendChild(createStatCard('Collected', `$${collected.toLocaleString()}`, `${Math.round((collected/totalDues)*100)}% realization rate`, 'stat-icon-success', '✓'));
  stats.appendChild(createStatCard('Pending', `$${pending.toLocaleString()}`, 'Awaiting settlement', 'stat-icon-warning', '⏳'));
  stats.appendChild(createStatCard('Overdue', `$${overdue.toLocaleString()}`, 'Follow-up required', 'stat-icon-danger', '⚠️'));
  container.appendChild(stats);

  // Table Panel
  const panel = createElement('div', 'section-panel');
  const header = createElement('div', 'panel-header');
  
  const titleGroup = createElement('div', 'panel-title-group');
  titleGroup.appendChild(createElement('h3', '', 'Unit Maintenance Ledger'));
  titleGroup.appendChild(createElement('p', '', 'Review monthly assessments, record offline payments, and send tenant reminders'));

  const controls = createElement('div', 'panel-controls');
  
  // Search
  const searchBox = createElement('div', 'search-input-box');
  const searchIcon = createElement('span', 'search-icon', '🔍');
  const searchInput = createElement('input', 'search-input');
  searchInput.placeholder = 'Search resident or unit...';
  searchBox.appendChild(searchIcon);
  searchBox.appendChild(searchInput);

  // Filter tabs
  const filterTabs = createElement('div', 'filter-tabs');
  ['All', 'Paid', 'Pending', 'Overdue'].forEach((filter, idx) => {
    const btn = createElement('button', `filter-tab-btn ${idx === 0 ? 'active' : ''}`, filter);
    btn.addEventListener('click', () => {
      filterTabs.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterTable(filter, searchInput.value);
    });
    filterTabs.appendChild(btn);
  });

  searchInput.addEventListener('input', () => {
    const activeTab = filterTabs.querySelector('.filter-tab-btn.active').textContent;
    filterTable(activeTab, searchInput.value);
  });

  // Action Buttons
  const btnIssue = createElement('button', 'btn btn-primary btn-sm', '+ Issue Assessment');
  btnIssue.addEventListener('click', () => openModal('modal-issue-dues'));
  
  const btnNudgeAll = createElement('button', 'btn btn-secondary btn-sm', '🔔 Remind All Unpaid');
  btnNudgeAll.addEventListener('click', () => {
    const unpaid = state.data.maintenance.filter(m => m.status === 'Pending' || m.status === 'Overdue');
    unpaid.forEach(u => {
      state.data.reminders.unshift({
        id: `rem-auto-${Date.now()}-${u.unitNumber}`,
        targetUnit: u.unitNumber,
        tenantId: u.tenantId,
        title: `Maintenance Assessment Reminder - ${u.period}`,
        message: `This is an automated reminder that your dues of $${u.totalAmount} are currently ${u.status.toLowerCase()}. Please settle promptly.`,
        category: 'Dues',
        severity: u.status === 'Overdue' ? 'High' : 'Normal',
        createdAt: new Date().toISOString(),
        read: false
      });
    });
    state.saveState();
    showToast(`Reminders successfully sent to ${unpaid.length} units!`, 'success');
  });

  controls.appendChild(searchBox);
  controls.appendChild(filterTabs);
  controls.appendChild(btnIssue);
  controls.appendChild(btnNudgeAll);

  header.appendChild(titleGroup);
  header.appendChild(controls);
  panel.appendChild(header);

  // Table
  const tableContainer = createElement('div', 'table-responsive');
  const table = createElement('table', 'data-table');
  
  const thead = createElement('thead');
  const thr = createElement('tr');
  ['Unit', 'Resident', 'Period', 'Base', 'Sinking', 'Water', 'Parking', 'Total', 'Due Date', 'Status', 'Actions'].forEach(h => {
    thr.appendChild(createElement('th', '', h));
  });
  thead.appendChild(thr);
  table.appendChild(thead);

  const tbody = createElement('tbody');
  tbody.id = 'maintenance-tbody';

  function populateRows(items) {
    tbody.replaceChildren();
    if (items.length === 0) {
      const tr = createElement('tr');
      const td = createElement('td', '', 'No maintenance records found matching criteria.');
      td.colSpan = 11;
      td.style.textAlign = 'center';
      td.style.padding = '30px';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    items.forEach(inv => {
      const tr = createElement('tr');
      tr.appendChild(createElement('td', 'meta-val', `Unit ${inv.unitNumber}`));
      tr.appendChild(createElement('td', '', inv.residentName));
      tr.appendChild(createElement('td', '', inv.period));
      tr.appendChild(createElement('td', '', `$${inv.baseAmount}`));
      tr.appendChild(createElement('td', '', `$${inv.sinkingFund}`));
      tr.appendChild(createElement('td', '', `$${inv.waterUtility}`));
      tr.appendChild(createElement('td', '', `$${inv.parkingFee}`));
      tr.appendChild(createElement('td', 'meta-val', `$${inv.totalAmount}`));
      tr.appendChild(createElement('td', '', inv.dueDate));

      // Status badge
      const tdStatus = createElement('td');
      const badgeClass = inv.status === 'Paid' ? 'badge-paid' : inv.status === 'Overdue' ? 'badge-overdue' : 'badge-pending';
      const badge = createElement('span', `badge ${badgeClass}`, inv.status);
      tdStatus.appendChild(badge);
      tr.appendChild(tdStatus);

      // Actions
      const tdAction = createElement('td');
      const actionRow = createElement('div');
      actionRow.style.display = 'flex';
      actionRow.style.gap = '6px';

      if (inv.status !== 'Paid') {
        const btnMarkPaid = createElement('button', 'btn btn-success btn-sm', 'Mark Paid');
        btnMarkPaid.addEventListener('click', () => {
          inv.status = 'Paid';
          inv.paidAt = new Date().toISOString();
          inv.paymentMethod = 'Offline (Cash / Bank Transfer verified by Manager)';
          inv.transactionId = `OFFLINE-${Date.now().toString().slice(-6)}`;
          state.saveState();
          showToast(`Marked Unit ${inv.unitNumber} payment as settled!`, 'success');
        });
        actionRow.appendChild(btnMarkPaid);

        const btnRemind = createElement('button', 'btn btn-secondary btn-sm', '🔔 Nudge');
        btnRemind.addEventListener('click', () => {
          openSendReminderModal(inv);
        });
        actionRow.appendChild(btnRemind);
      } else {
        const btnReceipt = createElement('button', 'btn btn-secondary btn-sm', 'Receipt');
        btnReceipt.addEventListener('click', () => showReceiptModal(inv));
        actionRow.appendChild(btnReceipt);
      }

      tdAction.appendChild(actionRow);
      tr.appendChild(tdAction);

      tbody.appendChild(tr);
    });
  }

  function filterTable(statusFilter, searchText) {
    let filtered = [...state.data.maintenance];
    if (statusFilter !== 'All') {
      filtered = filtered.filter(i => i.status.toLowerCase() === statusFilter.toLowerCase());
    }
    if (searchText && searchText.trim() !== '') {
      const q = searchText.toLowerCase().trim();
      filtered = filtered.filter(i => i.residentName.toLowerCase().includes(q) || i.unitNumber.toLowerCase().includes(q));
    }
    populateRows(filtered);
  }

  populateRows(state.data.maintenance);
  table.appendChild(tbody);
  tableContainer.appendChild(table);
  panel.appendChild(tableContainer);
  container.appendChild(panel);
}

function renderTenantMaintenance(container) {
  const user = state.currentUser;
  const myDues = state.data.maintenance.filter(m => m.unitNumber === user.unitNumber || m.tenantId === user.id);
  const currentInvoice = myDues.find(m => m.status === 'Pending' || m.status === 'Overdue');

  // Resident Current Dues Hero Banner
  const heroDues = createElement('div', 'resident-dues-hero');
  const duesInfo = createElement('div');
  
  const tag = createElement('div', 'hero-tag');
  tag.textContent = currentInvoice ? (currentInvoice.status === 'Overdue' ? '⚠️ OVERDUE DUES' : '📅 CURRENT ASSESSMENT') : '✓ ALL SETTLED';
  if (currentInvoice && currentInvoice.status === 'Overdue') {
    tag.style.background = 'rgba(239, 68, 68, 0.2)';
    tag.style.borderColor = 'rgba(239, 68, 68, 0.5)';
    tag.style.color = '#FCA5A5';
  }
  duesInfo.appendChild(tag);

  const duesTitle = createElement('h3', '', currentInvoice ? `${currentInvoice.period} Maintenance Dues` : 'No Outstanding Maintenance Fees');
  duesInfo.appendChild(duesTitle);

  const amountBig = createElement('div', 'dues-amount-big', currentInvoice ? `$${currentInvoice.totalAmount}.00` : '$0.00');
  duesInfo.appendChild(amountBig);

  if (currentInvoice) {
    const dueDesc = createElement('p', 'meta-label', `Payment due by ${currentInvoice.dueDate} • Avoid late fee penalties`);
    duesInfo.appendChild(dueDesc);

    const chips = createElement('div', 'dues-breakdown-chips');
    chips.appendChild(createBreakdownChip('Base Maintenance', `$${currentInvoice.baseAmount}`));
    chips.appendChild(createBreakdownChip('Sinking Reserve Fund', `$${currentInvoice.sinkingFund}`));
    chips.appendChild(createBreakdownChip('Water & Pumping', `$${currentInvoice.waterUtility}`));
    chips.appendChild(createBreakdownChip('Allocated Parking', `$${currentInvoice.parkingFee}`));
    duesInfo.appendChild(chips);
  } else {
    const settledDesc = createElement('p', 'meta-label', 'Thank you! Your apartment maintenance dues for this period are settled in full.');
    duesInfo.appendChild(settledDesc);
  }

  heroDues.appendChild(duesInfo);

  if (currentInvoice) {
    const payActionWrap = createElement('div');
    const btnPay = createElement('button', 'btn btn-success', '💳 Proceed to Secure Payment');
    btnPay.style.padding = '14px 28px';
    btnPay.style.fontSize = '15px';
    btnPay.addEventListener('click', () => handleOpenPaymentModal(currentInvoice));
    payActionWrap.appendChild(btnPay);
    heroDues.appendChild(payActionWrap);
  }

  container.appendChild(heroDues);

  // Maintenance History Panel
  const panel = createElement('div', 'section-panel');
  const header = createElement('div', 'panel-header');
  const titleGroup = createElement('div', 'panel-title-group');
  titleGroup.appendChild(createElement('h3', '', 'My Maintenance Payment History'));
  titleGroup.appendChild(createElement('p', '', 'Review past invoices and download verified digital receipts'));
  header.appendChild(titleGroup);
  panel.appendChild(header);

  const tableContainer = createElement('div', 'table-responsive');
  const table = createElement('table', 'data-table');
  const thead = createElement('thead');
  const thr = createElement('tr');
  ['Invoice ID', 'Period', 'Amount', 'Due Date', 'Status', 'Payment Details', 'Receipt'].forEach(h => {
    thr.appendChild(createElement('th', '', h));
  });
  thead.appendChild(thr);
  table.appendChild(thead);

  const tbody = createElement('tbody');
  if (myDues.length === 0) {
    const tr = createElement('tr');
    const td = createElement('td', '', 'No payment records on file.');
    td.colSpan = 7;
    td.style.textAlign = 'center';
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    myDues.forEach(inv => {
      const tr = createElement('tr');
      tr.appendChild(createElement('td', 'meta-val', inv.id));
      tr.appendChild(createElement('td', '', inv.period));
      tr.appendChild(createElement('td', 'meta-val', `$${inv.totalAmount}`));
      tr.appendChild(createElement('td', '', inv.dueDate));

      const tdStatus = createElement('td');
      const badgeClass = inv.status === 'Paid' ? 'badge-paid' : inv.status === 'Overdue' ? 'badge-overdue' : 'badge-pending';
      tdStatus.appendChild(createElement('span', `badge ${badgeClass}`, inv.status));
      tr.appendChild(tdStatus);

      tr.appendChild(createElement('td', '', inv.paidAt ? `${new Date(inv.paidAt).toLocaleDateString()} (${inv.paymentMethod || 'Card'})` : 'Unpaid'));

      const tdAction = createElement('td');
      if (inv.status === 'Paid') {
        const btnReceipt = createElement('button', 'btn btn-secondary btn-sm', '📄 View Receipt');
        btnReceipt.addEventListener('click', () => showReceiptModal(inv));
        tdAction.appendChild(btnReceipt);
      } else {
        const btnPayRow = createElement('button', 'btn btn-primary btn-sm', 'Pay Now');
        btnPayRow.addEventListener('click', () => handleOpenPaymentModal(inv));
        tdAction.appendChild(btnPayRow);
      }
      tr.appendChild(tdAction);

      tbody.appendChild(tr);
    });
  }

  table.appendChild(tbody);
  tableContainer.appendChild(table);
  panel.appendChild(tableContainer);
  container.appendChild(panel);
}

function createBreakdownChip(label, val) {
  const chip = createElement('div', 'breakdown-chip');
  chip.textContent = `${label}: `;
  chip.appendChild(createElement('strong', '', val));
  return chip;
}

// -------------------------------------------------------------
// 3. SERVICE REQUESTS VIEW (ELECTRIC, PLUMBING, HVAC)
// -------------------------------------------------------------
function renderManagerServices(container) {
  // Category Stats
  const electricCount = state.data.serviceRequests.filter(s => s.category === 'Electric').length;
  const plumbingCount = state.data.serviceRequests.filter(s => s.category === 'Plumbing').length;
  const hvacCount = state.data.serviceRequests.filter(s => s.category === 'HVAC').length;
  const openCount = state.data.serviceRequests.filter(s => s.status !== 'Resolved' && s.status !== 'Closed').length;

  const stats = createElement('div', 'stats-grid');
  stats.appendChild(createStatCard('Pending Work', `${openCount} Open`, 'Requires technician dispatch', 'stat-icon-warning', '🔧'));
  stats.appendChild(createStatCard('⚡ Electrical Desk', `${electricCount} Tickets`, 'Breakers, lighting & fixtures', 'stat-icon-primary', '⚡'));
  stats.appendChild(createStatCard('🚰 Plumbing Desk', `${plumbingCount} Tickets`, 'Leaks, water pressure & drains', 'stat-icon-cyan', '🚰'));
  stats.appendChild(createStatCard('❄️ HVAC & Climate', `${hvacCount} Tickets`, 'Filters, thermostats & cooling', 'stat-icon-purple', '❄️'));
  container.appendChild(stats);

  // Tickets Management Panel
  const panel = createElement('div', 'section-panel');
  const header = createElement('div', 'panel-header');
  
  const titleGroup = createElement('div', 'panel-title-group');
  titleGroup.appendChild(createElement('h3', '', 'All Property Service Tickets'));
  titleGroup.appendChild(createElement('p', '', 'Assign electricians, plumbers, update status, and add resolution notes'));

  const controls = createElement('div', 'panel-controls');
  
  // Filter tabs for categories
  const filterTabs = createElement('div', 'filter-tabs');
  ['All', 'Electric', 'Plumbing', 'HVAC'].forEach((cat, idx) => {
    const btn = createElement('button', `filter-tab-btn ${idx === 0 ? 'active' : ''}`, cat);
    btn.addEventListener('click', () => {
      filterTabs.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTicketGrid(cat, statusFilterSelect.value);
    });
    filterTabs.appendChild(btn);
  });

  const statusFilterSelect = createElement('select', 'form-control');
  statusFilterSelect.style.width = '140px';
  ['All Statuses', 'Pending', 'Assigned', 'In Progress', 'Resolved'].forEach(s => {
    const opt = createElement('option', '', s);
    opt.value = s;
    statusFilterSelect.appendChild(opt);
  });
  statusFilterSelect.addEventListener('change', () => {
    const activeCat = filterTabs.querySelector('.filter-tab-btn.active').textContent;
    renderTicketGrid(activeCat, statusFilterSelect.value);
  });

  controls.appendChild(filterTabs);
  controls.appendChild(statusFilterSelect);
  header.appendChild(titleGroup);
  header.appendChild(controls);
  panel.appendChild(header);

  const panelBody = createElement('div', 'panel-body');
  const grid = createElement('div', 'tickets-grid');
  grid.id = 'tickets-grid-root';

  function renderTicketGrid(catFilter, statFilter) {
    grid.replaceChildren();
    let tickets = [...state.data.serviceRequests];
    if (catFilter !== 'All') {
      tickets = tickets.filter(t => t.category.toLowerCase() === catFilter.toLowerCase());
    }
    if (statFilter !== 'All Statuses') {
      tickets = tickets.filter(t => t.status.toLowerCase() === statFilter.toLowerCase());
    }

    if (tickets.length === 0) {
      grid.appendChild(createElement('p', 'meta-label', 'No service tickets match your selected filters.'));
      return;
    }

    tickets.forEach(ticket => {
      const card = createTicketCardElement(ticket, true);
      grid.appendChild(card);
    });
  }

  renderTicketGrid('All', 'All Statuses');
  panelBody.appendChild(grid);
  panel.appendChild(panelBody);
  container.appendChild(panel);
}

function renderTenantServices(container) {
  const user = state.currentUser;
  const myTickets = state.data.serviceRequests.filter(s => s.unitNumber === user.unitNumber || s.tenantId === user.id);

  // Header Banner with Action
  const panel = createElement('div', 'section-panel');
  const header = createElement('div', 'panel-header');
  
  const titleGroup = createElement('div', 'panel-title-group');
  titleGroup.appendChild(createElement('h3', '', 'Maintenance & Service Requests'));
  titleGroup.appendChild(createElement('p', '', 'Submit electrical, plumbing, or facility repair tickets for Unit ' + (user.unitNumber || '402')));

  const btnNew = createElement('button', 'btn btn-primary', '⚡ + New Service Request');
  btnNew.addEventListener('click', () => openModal('modal-new-service'));

  header.appendChild(titleGroup);
  header.appendChild(btnNew);
  panel.appendChild(header);

  const panelBody = createElement('div', 'panel-body');
  const grid = createElement('div', 'tickets-grid');

  if (myTickets.length === 0) {
    const emptyNotice = createElement('div');
    emptyNotice.style.textAlign = 'center';
    emptyNotice.style.padding = '40px 20px';
    emptyNotice.appendChild(createElement('h4', '', 'No Active Service Requests'));
    emptyNotice.appendChild(createElement('p', 'meta-label', 'Everything in your apartment is in working order. Need a plumber or electrician? Click "+ New Service Request" above.'));
    panelBody.appendChild(emptyNotice);
  } else {
    myTickets.forEach(ticket => {
      const card = createTicketCardElement(ticket, false);
      grid.appendChild(card);
    });
    panelBody.appendChild(grid);
  }

  panel.appendChild(panelBody);
  container.appendChild(panel);
}

function createTicketCardElement(ticket, isManager = false) {
  const card = createElement('div', 'ticket-card');

  const header = createElement('div', 'ticket-header');
  const catWrap = createElement('div', 'ticket-header');
  catWrap.style.gap = '10px';
  catWrap.style.marginBottom = '0';

  const catClass = ticket.category === 'Electric' ? 'cat-electric' : ticket.category === 'Plumbing' ? 'cat-plumbing' : ticket.category === 'HVAC' ? 'cat-hvac' : 'cat-general';
  const catIcon = createElement('div', `ticket-cat-icon ${catClass}`, ticket.category === 'Electric' ? '⚡' : ticket.category === 'Plumbing' ? '🚰' : ticket.category === 'HVAC' ? '❄️' : '🔨');
  
  const catTitles = createElement('div');
  catTitles.appendChild(createElement('div', 'meta-label', ticket.category.toUpperCase()));
  catTitles.appendChild(createElement('span', 'meta-val', ticket.id));

  catWrap.appendChild(catIcon);
  catWrap.appendChild(catTitles);
  header.appendChild(catWrap);

  // Urgency badge
  const urgencyClass = ticket.urgency === 'Emergency' ? 'badge-emergency' : ticket.urgency === 'High' ? 'badge-urgent' : 'badge-normal';
  header.appendChild(createElement('span', `badge ${urgencyClass}`, `${ticket.urgency} Priority`));
  card.appendChild(header);

  // Title & description
  card.appendChild(createElement('h4', 'ticket-title', ticket.title));
  card.appendChild(createElement('p', 'ticket-desc', ticket.description));

  // Step Tracker for status
  const tracker = createElement('div', 'step-tracker');
  const steps = ['Pending', 'Assigned', 'In Progress', 'Resolved'];
  const currentIndex = steps.indexOf(ticket.status);

  steps.forEach((step, idx) => {
    const node = createElement('div', `step-node ${idx < currentIndex ? 'completed' : idx === currentIndex ? 'active' : ''}`);
    const circle = createElement('div', 'step-circle', idx < currentIndex ? '✓' : (idx + 1).toString());
    const label = createElement('span', 'step-label', step);
    node.appendChild(circle);
    node.appendChild(label);
    tracker.appendChild(node);
  });
  card.appendChild(tracker);

  // Metadata Grid
  const metaGrid = createElement('div', 'ticket-meta-grid');
  
  const col1 = createElement('div');
  col1.appendChild(createElement('div', 'meta-label', 'Unit & Resident'));
  col1.appendChild(createElement('div', 'meta-val', `Unit ${ticket.unitNumber} (${ticket.residentName})`));
  
  const col2 = createElement('div');
  col2.appendChild(createElement('div', 'meta-label', 'Assigned Contractor'));
  col2.appendChild(createElement('div', 'meta-val', ticket.assignedTo || 'Unassigned'));

  const col3 = createElement('div');
  col3.appendChild(createElement('div', 'meta-label', 'Preferred Time'));
  col3.appendChild(createElement('div', 'meta-val', ticket.preferredSlot || 'Anytime'));

  const col4 = createElement('div');
  col4.appendChild(createElement('div', 'meta-label', 'Reported On'));
  col4.appendChild(createElement('div', 'meta-val', new Date(ticket.createdAt).toLocaleDateString()));

  metaGrid.appendChild(col1);
  metaGrid.appendChild(col2);
  metaGrid.appendChild(col3);
  metaGrid.appendChild(col4);
  card.appendChild(metaGrid);

  if (ticket.resolutionNotes) {
    const noteBox = createElement('div', 'clause-item');
    noteBox.style.marginBottom = '14px';
    noteBox.style.fontSize = '12px';
    noteBox.textContent = `📝 Resolution Notes: ${ticket.resolutionNotes}`;
    card.appendChild(noteBox);
  }

  // Footer Actions
  const footer = createElement('div', 'ticket-footer');
  const statusBadgeClass = ticket.status === 'Resolved' ? 'badge-resolved' : ticket.status === 'In Progress' ? 'badge-inprogress' : ticket.status === 'Assigned' ? 'badge-assigned' : 'badge-pending';
  footer.appendChild(createElement('span', `badge ${statusBadgeClass}`, `Status: ${ticket.status}`));

  if (isManager) {
    const btnManage = createElement('button', 'btn btn-primary btn-sm', '⚙️ Update & Assign');
    btnManage.addEventListener('click', () => openUpdateTicketModal(ticket));
    footer.appendChild(btnManage);
  }

  card.appendChild(footer);
  return card;
}

// -------------------------------------------------------------
// 4. COMMUNITY ANNOUNCEMENTS VIEW
// -------------------------------------------------------------
function renderAnnouncementsView(container) {
  const isManager = state.isManager();

  const panel = createElement('div', 'section-panel');
  const header = createElement('div', 'panel-header');
  
  const titleGroup = createElement('div', 'panel-title-group');
  titleGroup.appendChild(createElement('h3', '', 'Community Notice Board'));
  titleGroup.appendChild(createElement('p', '', 'Official broadcasts, scheduled maintenance alerts, and association announcements'));

  const controls = createElement('div', 'panel-controls');

  if (isManager) {
    const btnNew = createElement('button', 'btn btn-primary', '📢 + Publish Announcement');
    btnNew.addEventListener('click', () => openModal('modal-create-announcement'));
    controls.appendChild(btnNew);
  }

  header.appendChild(titleGroup);
  header.appendChild(controls);
  panel.appendChild(header);

  const panelBody = createElement('div', 'panel-body');
  const list = createElement('div', 'announcements-list');

  // Pinned announcements first
  const sorted = [...state.data.announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  sorted.forEach(ann => {
    list.appendChild(createAnnouncementCardElement(ann, isManager));
  });

  panelBody.appendChild(list);
  panel.appendChild(panelBody);
  container.appendChild(panel);
}

function createAnnouncementCardElement(ann, isManager = false) {
  const card = createElement('div', `announcement-card ${ann.pinned ? 'pinned' : ''}`);

  const header = createElement('div', 'announcement-header');
  const titleRow = createElement('div', 'announcement-title-row');
  
  if (ann.pinned) {
    const pinBadge = createElement('span', 'badge badge-important', '📌 Pinned Notice');
    titleRow.appendChild(pinBadge);
  }
  
  const catBadgeClass = ann.category === 'Maintenance' ? 'badge-urgent' : ann.category === 'Event' ? 'badge-assigned' : 'badge-normal';
  titleRow.appendChild(createElement('span', `badge ${catBadgeClass}`, ann.category));
  titleRow.appendChild(createElement('h4', 'announcement-title', ann.title));
  header.appendChild(titleRow);

  const dateEl = createElement('span', 'meta-label', `Published: ${ann.publishedDate}`);
  header.appendChild(dateEl);
  card.appendChild(header);

  const body = createElement('p', 'announcement-body', ann.content);
  card.appendChild(body);

  const meta = createElement('div', 'announcement-meta');
  meta.appendChild(createElement('span', '', `✍️ ${ann.author}`));
  meta.appendChild(createElement('span', '', `🎯 Target: ${ann.targetAudience}`));

  if (isManager) {
    const actionWrap = createElement('div');
    actionWrap.style.marginLeft = 'auto';
    actionWrap.style.display = 'flex';
    actionWrap.style.gap = '8px';

    const btnPin = createElement('button', 'btn btn-secondary btn-sm', ann.pinned ? 'Unpin' : '📌 Pin');
    btnPin.addEventListener('click', () => {
      ann.pinned = !ann.pinned;
      state.saveState();
      showToast(ann.pinned ? 'Announcement pinned to top' : 'Announcement unpinned');
    });

    const btnDelete = createElement('button', 'btn btn-danger btn-sm', '🗑 Delete');
    btnDelete.addEventListener('click', () => {
      if (confirm(`Are you sure you want to remove announcement: "${ann.title}"?`)) {
        state.data.announcements = state.data.announcements.filter(a => a.id !== ann.id);
        state.saveState();
        showToast('Announcement removed');
      }
    });

    actionWrap.appendChild(btnPin);
    actionWrap.appendChild(btnDelete);
    meta.appendChild(actionWrap);
  }

  card.appendChild(meta);
  return card;
}

// -------------------------------------------------------------
// 5. ASSOCIATION RULES & BYLAWS PUBLISHING
// -------------------------------------------------------------
function renderRulesView(container) {
  const isManager = state.isManager();

  const panel = createElement('div', 'section-panel');
  const header = createElement('div', 'panel-header');
  
  const titleGroup = createElement('div', 'panel-title-group');
  titleGroup.appendChild(createElement('h3', '', 'Association Rules & Bylaws Handbook'));
  titleGroup.appendChild(createElement('p', '', 'Community guidelines governing peaceful coexistence, facilities, and maintenance'));

  const controls = createElement('div', 'panel-controls');
  const btnPrint = createElement('button', 'btn btn-secondary btn-sm', '🖨 Print Handbook');
  btnPrint.addEventListener('click', () => window.print());
  controls.appendChild(btnPrint);

  if (isManager) {
    const btnNewRule = createElement('button', 'btn btn-primary btn-sm', '📜 + Add Rule Clause');
    btnNewRule.addEventListener('click', () => openModal('modal-add-rule'));
    controls.appendChild(btnNewRule);
  }

  header.appendChild(titleGroup);
  header.appendChild(controls);
  panel.appendChild(header);

  const panelBody = createElement('div', 'panel-body');
  const rulesGrid = createElement('div', 'rules-grid');

  state.data.associationRules.forEach((rule, idx) => {
    const card = createElement('div', `rule-card ${idx === 0 ? 'expanded' : ''}`);

    const cardHeader = createElement('div', 'rule-header');
    const titleRow = createElement('div', 'rule-title-group');
    titleRow.appendChild(createElement('span', 'rule-section-num', `Sec ${rule.section}`));
    titleRow.appendChild(createElement('h4', 'rule-name', rule.title));
    cardHeader.appendChild(titleRow);

    const toggleIcon = createElement('span', 'meta-label', idx === 0 ? '▲' : '▼');
    cardHeader.appendChild(toggleIcon);

    const clausesList = createElement('div', 'rule-clauses-list');
    clausesList.style.display = idx === 0 ? 'flex' : 'none';

    rule.clauses.forEach(clause => {
      clausesList.appendChild(createElement('div', 'clause-item', clause));
    });

    cardHeader.addEventListener('click', () => {
      const isExpanded = clausesList.style.display === 'flex';
      clausesList.style.display = isExpanded ? 'none' : 'flex';
      toggleIcon.textContent = isExpanded ? '▼' : '▲';
      card.classList.toggle('expanded', !isExpanded);
    });

    card.appendChild(cardHeader);
    card.appendChild(clausesList);
    rulesGrid.appendChild(card);
  });

  panelBody.appendChild(rulesGrid);
  panel.appendChild(panelBody);
  container.appendChild(panel);
}

// -------------------------------------------------------------
// 6. MEETING MINUTES PUBLISHING
// -------------------------------------------------------------
function renderMinutesView(container) {
  const isManager = state.isManager();

  const panel = createElement('div', 'section-panel');
  const header = createElement('div', 'panel-header');
  
  const titleGroup = createElement('div', 'panel-title-group');
  titleGroup.appendChild(createElement('h3', '', 'Association Meeting Minutes & Resolutions'));
  titleGroup.appendChild(createElement('p', '', 'Official records of Executive Committee and General Body (AGM) meetings'));

  const controls = createElement('div', 'panel-controls');
  if (isManager) {
    const btnNew = createElement('button', 'btn btn-primary', '📝 + Publish Meeting Minutes');
    btnNew.addEventListener('click', () => openModal('modal-publish-minutes'));
    controls.appendChild(btnNew);
  }

  header.appendChild(titleGroup);
  header.appendChild(controls);
  panel.appendChild(header);

  const panelBody = createElement('div', 'panel-body');
  const minutesGrid = createElement('div', 'minutes-grid');

  state.data.meetingMinutes.forEach(min => {
    const card = createElement('div', 'minute-card');

    const minHeader = createElement('div', 'minute-header');
    const headerDetails = createElement('div');
    headerDetails.appendChild(createElement('h4', 'minute-title', min.title));
    
    const metaBar = createElement('div', 'minute-meta-bar');
    metaBar.appendChild(createElement('span', '', `📅 Date: ${min.meetingDate}`));
    metaBar.appendChild(createElement('span', '', `⏰ Time: ${min.time}`));
    metaBar.appendChild(createElement('span', '', `📍 Venue: ${min.venue}`));
    metaBar.appendChild(createElement('span', '', `👥 Attendees: ${min.attendeesCount}`));
    headerDetails.appendChild(metaBar);
    minHeader.appendChild(headerDetails);

    const badge = createElement('span', 'badge badge-published', 'Official Record ✓');
    minHeader.appendChild(badge);
    card.appendChild(minHeader);

    // Agenda Section
    card.appendChild(createElement('h5', 'stat-title', '📋 Meeting Agenda Topics'));
    const agendaList = createElement('ul');
    agendaList.style.paddingLeft = '20px';
    agendaList.style.margin = '8px 0 16px 0';
    min.agenda.forEach(item => {
      const li = createElement('li', 'meta-label', item);
      li.style.marginBottom = '4px';
      agendaList.appendChild(li);
    });
    card.appendChild(agendaList);

    // Resolutions Section
    card.appendChild(createElement('h5', 'stat-title', '⚖️ Resolutions Adopted'));
    min.resolutions.forEach(res => {
      const resBox = createElement('div', 'resolution-box');
      const resHeader = createElement('div');
      resHeader.style.display = 'flex';
      resHeader.style.justifyContent = 'space-between';
      resHeader.style.marginBottom = '4px';
      resHeader.appendChild(createElement('strong', 'meta-val', res.code));
      resHeader.appendChild(createElement('span', 'badge badge-paid', res.vote));
      resBox.appendChild(resHeader);
      resBox.appendChild(createElement('p', 'meta-label', res.text));
      card.appendChild(resBox);
    });

    // Action Items Section
    if (min.actionItems && min.actionItems.length > 0) {
      card.appendChild(createElement('h5', 'stat-title', '🎯 Action Items & Implementation'));
      const table = createElement('table', 'action-items-table');
      const thr = createElement('tr');
      ['Task Description', 'Assigned Owner', 'Target Deadline', 'Status'].forEach(h => thr.appendChild(createElement('th', '', h)));
      table.appendChild(thr);

      min.actionItems.forEach(ai => {
        const tr = createElement('tr');
        tr.appendChild(createElement('td', 'meta-val', ai.task));
        tr.appendChild(createElement('td', '', ai.owner));
        tr.appendChild(createElement('td', '', ai.deadline));
        const tdStatus = createElement('td');
        tdStatus.appendChild(createElement('span', `badge ${ai.status === 'Completed' ? 'badge-paid' : 'badge-pending'}`, ai.status));
        tr.appendChild(tdStatus);
        table.appendChild(tr);
      });
      card.appendChild(table);
    }

    minutesGrid.appendChild(card);
  });

  panelBody.appendChild(minutesGrid);
  panel.appendChild(panelBody);
  container.appendChild(panel);
}

// -------------------------------------------------------------
// 7. EXPENSE ACCOUNT STATEMENT PUBLISHING
// -------------------------------------------------------------
function renderExpensesView(container) {
  const isManager = state.isManager();

  const panel = createElement('div', 'section-panel');
  const header = createElement('div', 'panel-header');
  
  const titleGroup = createElement('div', 'panel-title-group');
  titleGroup.appendChild(createElement('h3', '', 'Association Expense Account & Financial Transparency'));
  titleGroup.appendChild(createElement('p', '', 'Itemized operating expenditures, common utility charges, and reserve fund audits'));

  const controls = createElement('div', 'panel-controls');
  if (isManager) {
    const btnNew = createElement('button', 'btn btn-primary', '📊 + Publish Expense Statement');
    btnNew.addEventListener('click', () => openModal('modal-publish-expense'));
    controls.appendChild(btnNew);
  }

  header.appendChild(titleGroup);
  header.appendChild(controls);
  panel.appendChild(header);

  const panelBody = createElement('div', 'panel-body');

  state.data.expenseStatements.forEach(stmt => {
    // Summary Banner
    const banner = createElement('div', 'expense-summary-banner');
    
    const col1 = createElement('div', 'expense-metric-col');
    col1.appendChild(createElement('h4', '', `Statement Period: ${stmt.period}`));
    col1.appendChild(createElement('p', '', `$${stmt.totalExpenses.toLocaleString()}`));
    col1.appendChild(createElement('span', 'meta-label', 'Total Operating Expenditures'));
    banner.appendChild(col1);

    const col2 = createElement('div', 'expense-metric-col');
    col2.appendChild(createElement('h4', '', 'Maintenance Inflow'));
    col2.appendChild(createElement('p', '', `$${stmt.totalIncome.toLocaleString()}`));
    col2.appendChild(createElement('span', 'meta-label', 'Collected from Residents'));
    banner.appendChild(col2);

    const col3 = createElement('div', 'expense-metric-col');
    col3.appendChild(createElement('h4', '', 'Monthly Net Balance'));
    col3.appendChild(createElement('p', '', `+$${stmt.netSurplus.toLocaleString()}`));
    col3.appendChild(createElement('span', 'badge badge-paid', 'Surplus Allocated to Reserves'));
    banner.appendChild(col3);

    const col4 = createElement('div', 'expense-metric-col');
    col4.appendChild(createElement('h4', '', 'Capital Reserve Fund'));
    col4.appendChild(createElement('p', '', `$${stmt.reserveFundBalance.toLocaleString()}`));
    col4.appendChild(createElement('span', 'meta-label', 'Audited Sinking Balance'));
    banner.appendChild(col4);

    panelBody.appendChild(banner);

    if (stmt.notes) {
      const noteEl = createElement('p', 'meta-label', `💡 Treasurer Note: ${stmt.notes}`);
      noteEl.style.marginBottom = '16px';
      panelBody.appendChild(noteEl);
    }

    // Breakdown List
    panelBody.appendChild(createElement('h4', 'ticket-title', 'Itemized Category Breakdown'));
    const breakdownList = createElement('div', 'expense-breakdown-list');

    stmt.categories.forEach(cat => {
      const row = createElement('div', 'expense-row');

      const info = createElement('div', 'expense-cat-info');
      info.appendChild(createElement('div', 'expense-cat-name', cat.name));
      info.appendChild(createElement('div', 'expense-cat-notes', cat.notes));
      row.appendChild(info);

      const track = createElement('div', 'expense-progress-track');
      const fill = createElement('div', 'expense-progress-fill');
      fill.style.width = `${cat.percent}%`;
      track.appendChild(fill);
      row.appendChild(track);

      row.appendChild(createElement('span', 'meta-label', `${cat.percent}%`));
      row.appendChild(createElement('div', 'expense-amount-val', `$${cat.amount.toLocaleString()}`));

      breakdownList.appendChild(row);
    });

    panelBody.appendChild(breakdownList);

    const divider = createElement('hr');
    divider.style.borderColor = 'var(--border-subtle)';
    divider.style.margin = '30px 0';
    panelBody.appendChild(divider);
  });

  panel.appendChild(panelBody);
  container.appendChild(panel);
}

// -------------------------------------------------------------
// 8. NOTIFICATIONS & REMINDERS VIEW
// -------------------------------------------------------------
function renderRemindersView(container) {
  const user = state.currentUser;
  const isManager = state.isManager();

  const myReminders = isManager
    ? state.data.reminders
    : state.data.reminders.filter(r => r.targetUnit === user.unitNumber || r.targetUnit === 'All');

  const panel = createElement('div', 'section-panel');
  const header = createElement('div', 'panel-header');
  
  const titleGroup = createElement('div', 'panel-title-group');
  titleGroup.appendChild(createElement('h3', '', 'Notifications & Dues Reminders'));
  titleGroup.appendChild(createElement('p', '', isManager ? 'Log of automated and manager-dispatched reminders' : 'Important upcoming notices, payment reminders, and service alerts'));

  const controls = createElement('div', 'panel-controls');
  const btnMarkAll = createElement('button', 'btn btn-secondary btn-sm', 'Mark All Read');
  btnMarkAll.addEventListener('click', () => {
    myReminders.forEach(r => r.read = true);
    state.saveState();
    showToast('All notifications marked as read');
  });
  controls.appendChild(btnMarkAll);

  header.appendChild(titleGroup);
  header.appendChild(controls);
  panel.appendChild(header);

  const panelBody = createElement('div', 'panel-body');
  const list = createElement('div', 'announcements-list');

  if (myReminders.length === 0) {
    panelBody.appendChild(createElement('p', 'meta-label', 'No reminders or notices in your inbox.'));
  } else {
    myReminders.forEach(rem => {
      const card = createElement('div', `announcement-card ${rem.read ? '' : 'pinned'}`);
      
      const head = createElement('div', 'announcement-header');
      const row = createElement('div', 'announcement-title-row');
      const badgeClass = rem.severity === 'Urgent' ? 'badge-emergency' : rem.severity === 'High' ? 'badge-urgent' : 'badge-normal';
      row.appendChild(createElement('span', `badge ${badgeClass}`, rem.category));
      row.appendChild(createElement('h4', 'announcement-title', rem.title));
      head.appendChild(row);

      head.appendChild(createElement('span', 'meta-label', new Date(rem.createdAt).toLocaleDateString()));
      card.appendChild(head);

      card.appendChild(createElement('p', 'announcement-body', rem.message));

      const footer = createElement('div', 'announcement-meta');
      footer.appendChild(createElement('span', '', `🎯 Target Unit: ${rem.targetUnit}`));
      
      const btnToggle = createElement('button', 'btn btn-secondary btn-sm', rem.read ? 'Mark Unread' : 'Mark Read');
      btnToggle.style.marginLeft = 'auto';
      btnToggle.addEventListener('click', () => {
        rem.read = !rem.read;
        state.saveState();
      });
      footer.appendChild(btnToggle);

      card.appendChild(footer);
      list.appendChild(card);
    });
    panelBody.appendChild(list);
  }

  panel.appendChild(panelBody);
  container.appendChild(panel);
}

// ================= Reminders Counter & Dropdown Tray =================
function updateRemindersCounter() {
  const user = state.currentUser;
  if (!user) return;
  const count = state.data.reminders.filter(r => (r.targetUnit === user.unitNumber || r.targetUnit === 'All' || state.isManager()) && !r.read).length;
  const badge = document.getElementById('reminders-counter');
  if (badge) {
    badge.textContent = count.toString();
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function toggleRemindersTray() {
  const tray = document.getElementById('notification-tray');
  if (!tray) return;
  const isOpen = tray.classList.contains('open');
  if (isOpen) {
    tray.classList.remove('open');
  } else {
    populateNotificationTray();
    tray.classList.add('open');
  }
}

function populateNotificationTray() {
  const trayList = document.getElementById('tray-list-root');
  if (!trayList) return;
  trayList.replaceChildren();

  const user = state.currentUser;
  const myReminders = state.data.reminders.filter(r => r.targetUnit === user.unitNumber || r.targetUnit === 'All' || state.isManager());

  if (myReminders.length === 0) {
    trayList.appendChild(createElement('p', 'meta-label', 'No active notifications'));
    return;
  }

  myReminders.slice(0, 5).forEach(r => {
    const item = createElement('div', `tray-item ${r.read ? '' : 'unread'}`);
    item.appendChild(createElement('div', 'tray-item-title', r.title));
    item.appendChild(createElement('div', 'tray-item-msg', r.message));
    item.appendChild(createElement('div', 'tray-item-time', new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })));
    item.addEventListener('click', () => {
      r.read = true;
      state.saveState();
      setActiveView('reminders');
      document.getElementById('notification-tray').classList.remove('open');
    });
    trayList.appendChild(item);
  });
}

// ================= Modal Specific Logic =================

// 1. Payment Simulator Modal
function handleOpenPaymentModal(inv = null) {
  const user = state.currentUser;
  const invoice = inv || state.data.maintenance.find(m => (m.unitNumber === user.unitNumber || m.tenantId === user.id) && (m.status === 'Pending' || m.status === 'Overdue'));

  if (!invoice) {
    showToast('No outstanding maintenance fees to pay! ✓', 'info');
    return;
  }

  const amountEl = document.getElementById('pay-modal-amount');
  const unitEl = document.getElementById('pay-modal-unit');
  const periodEl = document.getElementById('pay-modal-period');
  const hiddenInvId = document.getElementById('pay-modal-inv-id');

  if (amountEl) amountEl.textContent = `$${invoice.totalAmount}.00`;
  if (unitEl) unitEl.textContent = `Unit ${invoice.unitNumber}`;
  if (periodEl) periodEl.textContent = invoice.period;
  if (hiddenInvId) hiddenInvId.value = invoice.id;

  openModal('modal-payment-gateway');
}

function processSimulatedPayment() {
  const invId = document.getElementById('pay-modal-inv-id').value;
  const paymentMethod = document.getElementById('pay-method-select').value;
  const invoice = state.data.maintenance.find(m => m.id === invId);

  if (!invoice) {
    showToast('Invoice not found', 'error');
    return;
  }

  // Simulate processing
  invoice.status = 'Paid';
  invoice.paidAt = new Date().toISOString();
  invoice.paymentMethod = paymentMethod;
  invoice.transactionId = `APX-${Date.now().toString().slice(-8)}`;

  state.saveState();
  closeModal('modal-payment-gateway');
  showToast('Payment successfully processed! Receipt generated ✓', 'success');

  // Open receipt
  showReceiptModal(invoice);
}

// 2. Receipt Modal
function showReceiptModal(invoice) {
  const receiptContainer = document.getElementById('receipt-view-root');
  if (!receiptContainer) return;
  receiptContainer.replaceChildren();

  const paper = createElement('div', 'receipt-paper');
  
  const h2 = createElement('h2', '', 'Aurora Residences HOA');
  const sub = createElement('p', 'meta-label', 'Official Maintenance Payment Receipt');
  paper.appendChild(h2);
  paper.appendChild(sub);

  const divider = createElement('hr');
  divider.style.margin = '16px 0';
  paper.appendChild(divider);

  const createLine = (lbl, val) => {
    const l = createElement('div', 'receipt-line');
    l.appendChild(createElement('span', '', lbl));
    l.appendChild(createElement('strong', '', val));
    return l;
  };

  paper.appendChild(createLine('Receipt / Transaction ID:', invoice.transactionId || 'TXN-GEN-2026'));
  paper.appendChild(createLine('Date of Payment:', invoice.paidAt ? new Date(invoice.paidAt).toLocaleString() : new Date().toLocaleString()));
  paper.appendChild(createLine('Apartment Unit:', `Unit ${invoice.unitNumber}`));
  paper.appendChild(createLine('Resident Name:', invoice.residentName));
  paper.appendChild(createLine('Assessment Period:', invoice.period));
  paper.appendChild(createLine('Payment Method:', invoice.paymentMethod || 'Online Payment Gateway'));

  paper.appendChild(createElement('hr', '', ''));
  paper.appendChild(createLine('Base Maintenance Fee:', `$${invoice.baseAmount}.00`));
  paper.appendChild(createLine('Capital Sinking Reserve Fund:', `$${invoice.sinkingFund}.00`));
  paper.appendChild(createLine('Water Supply & Pumping:', `$${invoice.waterUtility}.00`));
  paper.appendChild(createLine('Allocated Parking Bay:', `$${invoice.parkingFee}.00`));

  const total = createElement('div', 'receipt-total');
  total.style.display = 'flex';
  total.style.justifyContent = 'space-between';
  total.appendChild(createElement('span', '', 'TOTAL PAID:'));
  total.appendChild(createElement('span', '', `$${invoice.totalAmount}.00`));
  paper.appendChild(total);

  receiptContainer.appendChild(paper);
  openModal('modal-receipt-viewer');
}

// 3. New Service Request Form Submission
function handleNewServiceRequestSubmit(e) {
  e.preventDefault();
  const user = state.currentUser;
  const category = document.getElementById('srv-cat-select').value;
  const urgency = document.getElementById('srv-urgency-select').value;
  const title = document.getElementById('srv-title-input').value.trim();
  const description = document.getElementById('srv-desc-input').value.trim();
  const preferredSlot = document.getElementById('srv-slot-select').value;

  if (!title || !description) {
    showToast('Please provide a title and detailed description', 'error');
    return;
  }

  const newTicket = {
    id: `SR-${user.unitNumber || '402'}${Math.floor(10 + Math.random() * 90)}`,
    unitNumber: user.unitNumber || '402',
    residentName: user.displayName,
    tenantId: user.id,
    category: category,
    subcategory: category === 'Electric' ? 'Circuit / Lighting' : category === 'Plumbing' ? 'Water / Drain' : 'General Maintenance',
    title: title,
    description: description,
    urgency: urgency,
    status: 'Pending',
    assignedTo: 'Unassigned',
    assignedPhone: '',
    preferredSlot: preferredSlot,
    residentPhone: user.phone || '+1 (555) 234-5678',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolutionNotes: ''
  };

  state.data.serviceRequests.unshift(newTicket);
  
  // Also create a confirmation reminder for resident
  state.data.reminders.unshift({
    id: `rem-ticket-${Date.now()}`,
    targetUnit: newTicket.unitNumber,
    tenantId: user.id,
    title: `Service Request Received: ${title}`,
    message: `Your request #${newTicket.id} has been logged. Management will dispatch a certified technician.`,
    category: 'Service',
    severity: 'Normal',
    createdAt: new Date().toISOString(),
    read: false
  });

  state.saveState();
  closeModal('modal-new-service');
  document.getElementById('form-new-service').reset();
  showToast('Service ticket submitted successfully! Dispatching staff ✓', 'success');
}

// 4. Manager Ticket Update Modal
function openUpdateTicketModal(ticket) {
  const ticketIdEl = document.getElementById('update-ticket-id');
  const ticketTitleEl = document.getElementById('update-ticket-title');
  const statusSelect = document.getElementById('update-ticket-status');
  const assignInput = document.getElementById('update-ticket-assign');
  const phoneInput = document.getElementById('update-ticket-phone');
  const notesInput = document.getElementById('update-ticket-notes');

  if (ticketIdEl) ticketIdEl.value = ticket.id;
  if (ticketTitleEl) ticketTitleEl.textContent = `${ticket.id} - ${ticket.title} (Unit ${ticket.unitNumber})`;
  if (statusSelect) statusSelect.value = ticket.status;
  if (assignInput) assignInput.value = ticket.assignedTo || '';
  if (phoneInput) phoneInput.value = ticket.assignedPhone || '';
  if (notesInput) notesInput.value = ticket.resolutionNotes || '';

  openModal('modal-update-ticket');
}

function handleUpdateTicketSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('update-ticket-id').value;
  const ticket = state.data.serviceRequests.find(t => t.id === id);

  if (!ticket) return;

  ticket.status = document.getElementById('update-ticket-status').value;
  ticket.assignedTo = document.getElementById('update-ticket-assign').value.trim() || 'Unassigned';
  ticket.assignedPhone = document.getElementById('update-ticket-phone').value.trim();
  ticket.resolutionNotes = document.getElementById('update-ticket-notes').value.trim();
  ticket.updatedAt = new Date().toISOString();

  // Notify resident via reminder
  state.data.reminders.unshift({
    id: `rem-update-${Date.now()}`,
    targetUnit: ticket.unitNumber,
    tenantId: ticket.tenantId,
    title: `Service Ticket ${ticket.id} Updated: ${ticket.status}`,
    message: `Technician: ${ticket.assignedTo}. Notes: ${ticket.resolutionNotes || 'In progress.'}`,
    category: 'Service',
    severity: ticket.status === 'Resolved' ? 'Normal' : 'High',
    createdAt: new Date().toISOString(),
    read: false
  });

  state.saveState();
  closeModal('modal-update-ticket');
  showToast(`Updated ticket ${ticket.id} status to ${ticket.status}!`, 'success');
}

// 5. Manager Publish Announcement
function handlePublishAnnouncementSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('ann-title-input').value.trim();
  const category = document.getElementById('ann-category-select').value;
  const audience = document.getElementById('ann-audience-input').value.trim() || 'All Residents';
  const pinned = document.getElementById('ann-pinned-check').checked;
  const content = document.getElementById('ann-content-input').value.trim();

  if (!title || !content) {
    showToast('Please fill out announcement title and message content', 'error');
    return;
  }

  const newAnn = {
    id: `ann-${Date.now().toString().slice(-4)}`,
    title: title,
    category: category,
    priority: pinned ? 'Urgent' : 'Normal',
    pinned: pinned,
    author: state.currentUser.displayName,
    publishedDate: new Date().toISOString().split('T')[0],
    targetAudience: audience,
    content: content
  };

  state.data.announcements.unshift(newAnn);

  // Send community reminder
  state.data.reminders.unshift({
    id: `rem-ann-${Date.now()}`,
    targetUnit: 'All',
    tenantId: null,
    title: `📢 New Announcement: ${title}`,
    message: content.length > 120 ? content.slice(0, 120) + '...' : content,
    category: 'Notice',
    severity: pinned ? 'Urgent' : 'Normal',
    createdAt: new Date().toISOString(),
    read: false
  });

  state.saveState();
  closeModal('modal-create-announcement');
  document.getElementById('form-create-announcement').reset();
  showToast('Community announcement broadcasted live! 📢', 'success');
}

// 6. Manager Add Association Rule Clause
function handleAddRuleSubmit(e) {
  e.preventDefault();
  const section = document.getElementById('rule-section-select').value;
  const clauseText = document.getElementById('rule-clause-input').value.trim();

  if (!clauseText) {
    showToast('Please enter clause text', 'error');
    return;
  }

  const rule = state.data.associationRules.find(r => r.section === section);
  if (rule) {
    rule.clauses.push(clauseText);
    rule.lastUpdated = new Date().toISOString().split('T')[0];
    state.saveState();
    closeModal('modal-add-rule');
    document.getElementById('form-add-rule').reset();
    showToast(`Added clause to Section ${section}!`, 'success');
  }
}

// 7. Manager Publish Meeting Minutes
function handlePublishMinutesSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('min-title-input').value.trim();
  const date = document.getElementById('min-date-input').value;
  const time = document.getElementById('min-time-input').value.trim();
  const venue = document.getElementById('min-venue-input').value.trim();
  const attendeesCount = parseInt(document.getElementById('min-attendees-input').value) || 12;
  const agendaStr = document.getElementById('min-agenda-input').value.trim();
  const resolutionStr = document.getElementById('min-res-input').value.trim();

  if (!title || !date || !agendaStr || !resolutionStr) {
    showToast('Please complete required meeting minute fields', 'error');
    return;
  }

  const newMin = {
    id: `min-${Date.now().toString().slice(-4)}`,
    title: title,
    meetingDate: date,
    time: time || '7:00 PM - 8:30 PM',
    venue: venue || 'Community Boardroom',
    chairedBy: state.currentUser.displayName,
    attendeesCount: attendeesCount,
    attendees: `${state.currentUser.displayName}, Executive Officers, and Homeowners`,
    agenda: agendaStr.split('\n').filter(s => s.trim().length > 0),
    resolutions: [
      {
        code: `RES-${Date.now().toString().slice(-4)}`,
        text: resolutionStr,
        vote: 'Passed Unanimously'
      }
    ],
    actionItems: [
      {
        task: 'Publish ratified resolutions to tenant portal',
        owner: state.currentUser.displayName,
        deadline: date,
        status: 'Completed'
      }
    ]
  };

  state.data.meetingMinutes.unshift(newMin);
  state.saveState();
  closeModal('modal-publish-minutes');
  document.getElementById('form-publish-minutes').reset();
  showToast('Meeting minutes officially published to the community archive! 📜', 'success');
}

// 8. Manager Publish Expense Statement
function handlePublishExpenseSubmit(e) {
  e.preventDefault();
  const period = document.getElementById('exp-period-input').value.trim();
  const income = parseFloat(document.getElementById('exp-income-input').value) || 35000;
  const expenses = parseFloat(document.getElementById('exp-expenses-input').value) || 29000;
  const reserve = parseFloat(document.getElementById('exp-reserve-input').value) || 148000;
  const notes = document.getElementById('exp-notes-input').value.trim();

  if (!period) {
    showToast('Please provide statement period', 'error');
    return;
  }

  const netSurplus = income - expenses;

  const newStmt = {
    id: `stmt-${Date.now().toString().slice(-4)}`,
    period: period,
    publishedDate: new Date().toISOString().split('T')[0],
    status: 'Published',
    publishedBy: state.currentUser.displayName,
    totalIncome: income,
    totalExpenses: expenses,
    netSurplus: netSurplus,
    reserveFundBalance: reserve,
    notes: notes || `Monthly financial statement verified by Association Treasurer. Net surplus of $${netSurplus.toLocaleString()} credited to reserve fund.`,
    categories: [
      { name: 'Common Area Electricity & Pumping', amount: Math.round(expenses * 0.26), percent: 26.0, notes: 'Elevators, corridor lights, and basement booster pumps' },
      { name: '24/7 Security & Patrol Staff', amount: Math.round(expenses * 0.30), percent: 30.0, notes: 'Security personnel, CCTV maintenance & gate systems' },
      { name: 'Housekeeping, Sanitation & Waste Hauling', amount: Math.round(expenses * 0.17), percent: 17.0, notes: 'Daily custodial operations and city disposal' },
      { name: 'Elevator Comprehensive AMC & Service', amount: Math.round(expenses * 0.10), percent: 10.0, notes: 'Lift inspection and safety certification' },
      { name: 'Landscaping & Courtyard Grounds', amount: Math.round(expenses * 0.05), percent: 5.0, notes: 'Garden maintenance and arborist care' },
      { name: 'Diesel Generator Backup Fuel & AMC', amount: Math.round(expenses * 0.05), percent: 5.0, notes: 'Emergency power readiness' },
      { name: 'Administrative, Auditing & Portal Software', amount: Math.round(expenses * 0.07), percent: 7.0, notes: 'HOA management software and accounting fees' }
    ]
  };

  state.data.expenseStatements.unshift(newStmt);
  state.saveState();
  closeModal('modal-publish-expense');
  document.getElementById('form-publish-expense').reset();
  showToast('Monthly financial statement published for resident review! 📊', 'success');
}

// 9. Manager Issue Assessment Modal
function handleIssueDuesSubmit(e) {
  e.preventDefault();
  const period = document.getElementById('issue-period-input').value.trim();
  const dueDate = document.getElementById('issue-duedate-input').value;
  const base = parseFloat(document.getElementById('issue-base-input').value) || 180;
  const sinking = parseFloat(document.getElementById('issue-sinking-input').value) || 40;
  const water = parseFloat(document.getElementById('issue-water-input').value) || 45;
  const parking = parseFloat(document.getElementById('issue-parking-input').value) || 20;

  if (!period || !dueDate) {
    showToast('Please provide assessment period and due date', 'error');
    return;
  }

  const total = base + sinking + water + parking;
  const units = ['101', '204', '305', '402', '508', '715'];

  units.forEach(unit => {
    const tenantUser = state.data.users.find(u => u.unitNumber === unit);
    state.data.maintenance.unshift({
      id: `inv-${period.replace(/\s+/g, '')}-${unit}`,
      unitNumber: unit,
      residentName: tenantUser ? tenantUser.displayName : `Resident Unit ${unit}`,
      tenantId: tenantUser ? tenantUser.id : null,
      period: period,
      dueDate: dueDate,
      baseAmount: base,
      sinkingFund: sinking,
      waterUtility: water,
      parkingFee: parking,
      totalAmount: total,
      status: 'Pending',
      paidAt: null,
      paymentMethod: null,
      transactionId: null,
      notes: `Standard monthly assessment for ${period}`
    });

    // Send in-app reminder
    state.data.reminders.unshift({
      id: `rem-dues-${Date.now()}-${unit}`,
      targetUnit: unit,
      tenantId: tenantUser ? tenantUser.id : null,
      title: `New Assessment Issued: ${period}`,
      message: `Monthly maintenance assessment of $${total} is due on ${dueDate}. Pay online in portal.`,
      category: 'Dues',
      severity: 'Normal',
      createdAt: new Date().toISOString(),
      read: false
    });
  });

  state.saveState();
  closeModal('modal-issue-dues');
  document.getElementById('form-issue-dues').reset();
  showToast(`Monthly assessment issued for ${units.length} units! 📋`, 'success');
}

// 10. Manager Send Custom Reminder Modal
let reminderTargetInvoice = null;
function openSendReminderModal(inv) {
  reminderTargetInvoice = inv;
  const targetEl = document.getElementById('send-rem-target');
  const msgEl = document.getElementById('send-rem-msg');

  if (targetEl) targetEl.textContent = `Unit ${inv.unitNumber} (${inv.residentName}) - Assessment: $${inv.totalAmount}`;
  if (msgEl) msgEl.value = `Dear ${inv.residentName}, this is a reminder from management that your maintenance dues of $${inv.totalAmount} for ${inv.period} are ${inv.status.toLowerCase()}. Please settle online at your earliest convenience.`;

  openModal('modal-send-reminder');
}

function handleSendCustomReminderSubmit(e) {
  e.preventDefault();
  if (!reminderTargetInvoice) return;

  const msg = document.getElementById('send-rem-msg').value.trim();
  if (!msg) return;

  state.data.reminders.unshift({
    id: `rem-custom-${Date.now()}`,
    targetUnit: reminderTargetInvoice.unitNumber,
    tenantId: reminderTargetInvoice.tenantId,
    title: `Maintenance Notice for Unit ${reminderTargetInvoice.unitNumber}`,
    message: msg,
    category: reminderTargetInvoice.status === 'Overdue' ? 'Overdue' : 'Dues',
    severity: reminderTargetInvoice.status === 'Overdue' ? 'High' : 'Normal',
    createdAt: new Date().toISOString(),
    read: false
  });

  state.saveState();
  closeModal('modal-send-reminder');
  showToast(`Reminder sent to Unit ${reminderTargetInvoice.unitNumber}! 🔔`, 'success');
}

// ================= Role & Profile Switching =================
function switchProfile(userId) {
  const target = state.data.users.find(u => u.id === userId);
  if (!target) return;
  state.setCurrentUser(target);
  updateProfilePillUI();
  setActiveView('dashboard');
  showToast(`Switched view to ${target.displayName} (${target.role.toUpperCase()})`);
}

function updateProfilePillUI() {
  const user = state.currentUser;
  if (!user) return;

  // Sidebar profile card
  const nameEl = document.getElementById('sidebar-user-name');
  const roleEl = document.getElementById('sidebar-user-role');
  const avatarEl = document.getElementById('sidebar-user-avatar');
  const rolePill = document.getElementById('role-indicator-pill');

  if (nameEl) nameEl.textContent = user.displayName;
  if (roleEl) roleEl.textContent = user.role === 'manager' ? 'Property Manager' : `Tenant • Unit ${user.unitNumber || '402'}`;
  if (avatarEl) avatarEl.textContent = user.avatar || user.displayName.slice(0, 2).toUpperCase();

  if (rolePill) {
    rolePill.className = `active-role-pill ${user.role === 'manager' ? 'role-pill-manager' : 'role-pill-tenant'}`;
    rolePill.textContent = user.role === 'manager' ? '👔 Manager View' : '🏠 Tenant View';
  }

  // Sidebar navigation visibility based on role
  const managerOnlyNav = document.querySelectorAll('.nav-manager-only');
  managerOnlyNav.forEach(el => {
    el.style.display = user.role === 'manager' ? 'flex' : 'none';
  });
}

// Clean Logout
function handleLogout() {
  // Clear sensitive memory state
  state.setCurrentUser(null);
  // Re-initialize default tenant or manager
  state.setCurrentUser(defaultUser);
  updateProfilePillUI();
  setActiveView('dashboard');
  showToast('Logged out successfully. Switched to guest preview.');
}

// ================= Application Bootstrap =================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 ApexLiving Web App initializing...');

  // Set up Firebase status in topbar
  const fbStatusEl = document.getElementById('firebase-status-indicator');
  if (fbStatusEl) {
    fbStatusEl.replaceChildren();
    const dot = createElement('div', 'status-dot');
    const txt = createElement('span', '', isFirebaseOnline ? 'Firebase Connected 🟢' : 'Demo State Ready 🟢');
    fbStatusEl.appendChild(dot);
    fbStatusEl.appendChild(txt);
  }

  // Bind Sidebar Nav clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.dataset.view;
      if (view) setActiveView(view);
    });
  });

  // Role quick-switch button
  const switchBtn = document.getElementById('role-quick-switch-btn');
  if (switchBtn) {
    switchBtn.addEventListener('click', () => openModal('modal-switch-user'));
  }

  // Notification Bell
  const bellBtn = document.getElementById('reminder-bell-btn');
  if (bellBtn) {
    bellBtn.addEventListener('click', toggleRemindersTray);
  }

  // Logout button
  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Bind Forms
  const formNewService = document.getElementById('form-new-service');
  if (formNewService) formNewService.addEventListener('submit', handleNewServiceRequestSubmit);

  const formUpdateTicket = document.getElementById('form-update-ticket');
  if (formUpdateTicket) formUpdateTicket.addEventListener('submit', handleUpdateTicketSubmit);

  const formCreateAnn = document.getElementById('form-create-announcement');
  if (formCreateAnn) formCreateAnn.addEventListener('submit', handlePublishAnnouncementSubmit);

  const formAddRule = document.getElementById('form-add-rule');
  if (formAddRule) formAddRule.addEventListener('submit', handleAddRuleSubmit);

  const formPublishMin = document.getElementById('form-publish-minutes');
  if (formPublishMin) formPublishMin.addEventListener('submit', handlePublishMinutesSubmit);

  const formPublishExp = document.getElementById('form-publish-expense');
  if (formPublishExp) formPublishExp.addEventListener('submit', handlePublishExpenseSubmit);

  const formIssueDues = document.getElementById('form-issue-dues');
  if (formIssueDues) formIssueDues.addEventListener('submit', handleIssueDuesSubmit);

  const formSendRem = document.getElementById('form-send-reminder');
  if (formSendRem) formSendRem.addEventListener('submit', handleSendCustomReminderSubmit);

  const btnProcessPay = document.getElementById('btn-process-payment');
  if (btnProcessPay) btnProcessPay.addEventListener('click', processSimulatedPayment);

  // Bind Switch Profile Buttons in Modal
  document.querySelectorAll('.btn-select-profile').forEach(btn => {
    btn.addEventListener('click', () => {
      const uid = btn.dataset.userid;
      switchProfile(uid);
      closeModal('modal-switch-user');
    });
  });

  // State Subscription for Re-render
  state.subscribe(() => {
    renderActiveView();
  });

  // Initial UI Render
  updateProfilePillUI();
  setActiveView('dashboard');
});
