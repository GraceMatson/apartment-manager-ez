import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DATA } from '../data/seedData';

const ApartmentContext = createContext(null);

const STORAGE_KEY = 'sreeja_fantasy_data_store_v1';

export function ApartmentProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load local data store:', e);
    }
    return INITIAL_DATA;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data store to localStorage:', e);
    }
  }, [data]);

  // Helper to find flat for a user
  const getUserFlat = (user) => {
    if (!user || !user.flatNumber) return null;
    return data.flats.find(f => f.flatNumber === user.flatNumber) || null;
  };

  // Submit Tenancy Conversion Request (By Owner)
  const submitTenancyRequest = ({ flatNumber, ownerName, ownerEmail, tenantDetails, notes }) => {
    const newRequest = {
      id: `req-${flatNumber}-${Date.now().toString().slice(-4)}`,
      flatNumber,
      ownerName,
      ownerEmail,
      tenantDetails: {
        name: tenantDetails.name.trim(),
        email: tenantDetails.email.trim().toLowerCase(),
        phone: tenantDetails.phone.trim(),
        leaseStart: tenantDetails.leaseStart,
        leaseDurationMonths: Number(tenantDetails.leaseDurationMonths) || 12,
        agreementRef: tenantDetails.agreementRef || `LEASE-SREEJA-${flatNumber}-${new Date().getFullYear()}`
      },
      status: 'Pending',
      requestedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      notes: notes || 'Owner tenancy conversion application'
    };

    setData(prev => ({
      ...prev,
      tenancyRequests: [newRequest, ...prev.tenancyRequests]
    }));

    return newRequest;
  };

  // Approve Tenancy Request (By Manager)
  const approveTenancyRequest = (requestId, reviewerName = 'Sarah Vance (Manager)') => {
    setData(prev => {
      const req = prev.tenancyRequests.find(r => r.id === requestId);
      if (!req) return prev;

      const tenantEmail = req.tenantDetails.email.toLowerCase();
      const flatNum = req.flatNumber;

      // 1. Update request status
      const updatedRequests = prev.tenancyRequests.map(r =>
        r.id === requestId
          ? { ...r, status: 'Approved', reviewedAt: new Date().toISOString(), reviewedBy: reviewerName }
          : r
      );

      // 2. Update Flat Occupancy to Tenanted & assign tenant
      const updatedFlats = prev.flats.map(f => {
        if (f.flatNumber === flatNum) {
          const leaseEnd = new Date(req.tenantDetails.leaseStart);
          leaseEnd.setMonth(leaseEnd.getMonth() + (req.tenantDetails.leaseDurationMonths || 12));

          return {
            ...f,
            occupancyStatus: 'Tenanted',
            tenant: {
              name: req.tenantDetails.name,
              email: tenantEmail,
              phone: req.tenantDetails.phone,
              leaseStart: req.tenantDetails.leaseStart,
              leaseEnd: leaseEnd.toISOString().split('T')[0]
            }
          };
        }
        return f;
      });

      // 3. Whitelist tenant's Google email in authorizedUsers
      const existingUserIndex = prev.authorizedUsers.findIndex(u => u.email.toLowerCase() === tenantEmail);
      let updatedUsers = [...prev.authorizedUsers];

      const initials = req.tenantDetails.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const tenantUserData = {
        email: tenantEmail,
        displayName: req.tenantDetails.name,
        role: 'tenant',
        flatNumber: flatNum,
        phone: req.tenantDetails.phone,
        avatar: initials || 'TN',
        status: 'active'
      };

      if (existingUserIndex >= 0) {
        updatedUsers[existingUserIndex] = { ...updatedUsers[existingUserIndex], ...tenantUserData };
      } else {
        updatedUsers.push(tenantUserData);
      }

      return {
        ...prev,
        tenancyRequests: updatedRequests,
        flats: updatedFlats,
        authorizedUsers: updatedUsers
      };
    });
  };

  // Reject Tenancy Request (By Manager)
  const rejectTenancyRequest = (requestId, reviewerNotes = '', reviewerName = 'Sarah Vance (Manager)') => {
    setData(prev => ({
      ...prev,
      tenancyRequests: prev.tenancyRequests.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'Rejected',
              reviewedAt: new Date().toISOString(),
              reviewedBy: reviewerName,
              notes: reviewerNotes ? `${r.notes} | Rejection note: ${reviewerNotes}` : r.notes
            }
          : r
      )
    }));
  };

  // Pay Maintenance Invoice
  const payMaintenanceInvoice = (invoiceId, paymentMethod = 'UPI (Google Pay)') => {
    setData(prev => {
      const inv = prev.maintenance.find(i => i.id === invoiceId);
      if (!inv) return prev;

      const txnId = `TXN-SREEJA-${Math.floor(100000 + Math.random() * 900000)}`;
      const nowIso = new Date().toISOString();

      const updatedInvoices = prev.maintenance.map(i =>
        i.id === invoiceId
          ? {
              ...i,
              status: 'Paid',
              paidAt: nowIso,
              paymentMethod,
              transactionId: txnId
            }
          : i
      );

      // Also update flat's maintenance status
      const updatedFlats = prev.flats.map(f =>
        f.flatNumber === inv.unitNumber ? { ...f, maintenanceStatus: 'Paid' } : f
      );

      return {
        ...prev,
        maintenance: updatedInvoices,
        flats: updatedFlats
      };
    });
  };

  // Create Service Ticket
  const createServiceTicket = ({ unitNumber, residentName, residentEmail, category, subcategory, title, description, urgency, preferredSlot, phone }) => {
    const newId = `SR-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const newTicket = {
      id: newId,
      unitNumber,
      residentName,
      tenantId: residentEmail,
      category,
      subcategory: subcategory || category,
      title,
      description,
      urgency: urgency || 'Normal',
      status: 'Assigned',
      assignedTo: category === 'Electric' ? 'Dave Miller (Certified Electrician)' : 'Sam Patel (Master Plumber)',
      assignedPhone: category === 'Electric' ? '+91 98452 33445' : '+91 98451 22334',
      preferredSlot: preferredSlot || 'Morning (9:00 AM - 12:00 PM)',
      residentPhone: phone || '+91 98765 00000',
      createdAt: nowIso,
      updatedAt: nowIso,
      resolutionNotes: 'Ticket logged and dispatched to resident maintenance technician.'
    };

    setData(prev => ({
      ...prev,
      serviceRequests: [newTicket, ...prev.serviceRequests]
    }));

    return newTicket;
  };

  // Update Service Ticket Status
  const updateTicketStatus = (ticketId, newStatus, notes) => {
    setData(prev => ({
      ...prev,
      serviceRequests: prev.serviceRequests.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              resolutionNotes: notes || t.resolutionNotes
            }
          : t
      )
    }));
  };

  // Publish Announcement
  const publishAnnouncement = ({ title, category, priority, content, targetAudience, author }) => {
    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      title,
      category: category || 'General',
      priority: priority || 'Normal',
      pinned: priority === 'Urgent',
      author: author || 'Sarah Vance (Property Manager)',
      publishedDate: new Date().toISOString().split('T')[0],
      targetAudience: targetAudience || 'All Residents',
      content
    };

    setData(prev => ({
      ...prev,
      announcements: [newAnnouncement, ...prev.announcements]
    }));
  };

  // Reset demo data to initial factory state
  const resetToFactoryData = () => {
    setData(INITIAL_DATA);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = {
    buildingInfo: data.buildingInfo,
    flats: data.flats,
    tenancyRequests: data.tenancyRequests,
    authorizedUsers: data.authorizedUsers,
    maintenance: data.maintenance,
    serviceRequests: data.serviceRequests,
    announcements: data.announcements,
    associationRules: data.associationRules,
    meetingMinutes: data.meetingMinutes,
    expenseStatements: data.expenseStatements,
    getUserFlat,
    submitTenancyRequest,
    approveTenancyRequest,
    rejectTenancyRequest,
    payMaintenanceInvoice,
    createServiceTicket,
    updateTicketStatus,
    publishAnnouncement,
    resetToFactoryData
  };

  return <ApartmentContext.Provider value={value}>{children}</ApartmentContext.Provider>;
}

export function useApartment() {
  const context = useContext(ApartmentContext);
  if (!context) {
    throw new Error('useApartment must be used within an ApartmentProvider');
  }
  return context;
}
