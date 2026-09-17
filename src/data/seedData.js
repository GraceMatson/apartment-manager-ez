/**
 * Sreeja Fantasy Apartments - Resident & Property Management Suite
 * Seed Data Store & Multi-Flat Registry
 */

export const INITIAL_DATA = {
  buildingInfo: {
    name: "Sreeja Fantasy Apartments",
    address: "Plot 42, Green Valley Enclave, Hyderabad",
    totalFlats: 10,
    blocks: ["Block A", "Block B"],
    propertyManager: "Sarah Vance"
  },

  // Pre-approved whitelist of Google email addresses
  authorizedUsers: [
    {
      email: "sarah.vance@sreejafantasy.com",
      displayName: "Sarah Vance",
      role: "manager", // manager | owner | tenant
      flatNumber: null,
      phone: "+91 98765 43210",
      avatar: "SV",
      status: "active"
    },
    {
      email: "gracemarymatson@gmail.com",
      displayName: "Grace Matson",
      role: "manager",
      flatNumber: null,
      phone: "+91 98765 00001",
      avatar: "GM",
      status: "active"
    },
    {
      email: "gracematson@google.com",
      displayName: "Grace Matson",
      role: "manager",
      flatNumber: null,
      phone: "+91 98765 00002",
      avatar: "GM",
      status: "active"
    },
    {
      email: "alex.rivera@sreejafantasy.com",
      displayName: "Alex Rivera",
      role: "owner",
      flatNumber: "402",
      phone: "+91 98450 12345",
      avatar: "AR",
      status: "active"
    },
    {
      email: "carlos.mendez@sreejafantasy.com",
      displayName: "Carlos Mendez",
      role: "tenant",
      flatNumber: "402",
      phone: "+91 98450 99887",
      avatar: "CM",
      status: "active"
    },
    {
      email: "rajesh.sharma@sreejafantasy.com",
      displayName: "Rajesh Sharma",
      role: "owner",
      flatNumber: "101",
      phone: "+91 98765 11223",
      avatar: "RS",
      status: "active"
    },
    {
      email: "meera.iyer@sreejafantasy.com",
      displayName: "Meera Iyer",
      role: "owner",
      flatNumber: "102",
      phone: "+91 98765 22334",
      avatar: "MI",
      status: "active"
    },
    {
      email: "amit.verma@sreejafantasy.com",
      displayName: "Amit Verma",
      role: "tenant",
      flatNumber: "102",
      phone: "+91 98765 33445",
      avatar: "AV",
      status: "active"
    },
    {
      email: "david.chen@sreejafantasy.com",
      displayName: "David Chen",
      role: "owner",
      flatNumber: "201",
      phone: "+91 98765 44556",
      avatar: "DC",
      status: "active"
    },
    {
      email: "priya.nair@sreejafantasy.com",
      displayName: "Priya Nair",
      role: "owner",
      flatNumber: "202",
      phone: "+91 98765 55667",
      avatar: "PN",
      status: "active"
    },
    {
      email: "elena.rostova@sreejafantasy.com",
      displayName: "Elena Rostova",
      role: "owner",
      flatNumber: "501",
      phone: "+91 98765 88990",
      avatar: "ER",
      status: "active"
    }
  ],

  // Building Flats Registry
  flats: [
    {
      id: "flat-101",
      flatNumber: "101",
      block: "Block A",
      floor: "1st Floor",
      layout: "2 BHK (1,250 sq ft)",
      parkingSlot: "P-01",
      occupancyStatus: "Owner-Occupied",
      owner: {
        name: "Rajesh Sharma",
        email: "rajesh.sharma@sreejafantasy.com",
        phone: "+91 98765 11223"
      },
      tenant: null,
      maintenanceStatus: "Paid",
      monthlyDues: 250,
      dueDate: "2026-09-25"
    },
    {
      id: "flat-102",
      flatNumber: "102",
      block: "Block A",
      floor: "1st Floor",
      layout: "2 BHK (1,250 sq ft)",
      parkingSlot: "P-02",
      occupancyStatus: "Tenanted",
      owner: {
        name: "Meera Iyer",
        email: "meera.iyer@sreejafantasy.com",
        phone: "+91 98765 22334"
      },
      tenant: {
        name: "Amit Verma",
        email: "amit.verma@sreejafantasy.com",
        phone: "+91 98765 33445",
        leaseStart: "2026-01-01",
        leaseEnd: "2026-12-31"
      },
      maintenanceStatus: "Paid",
      monthlyDues: 250,
      dueDate: "2026-09-25"
    },
    {
      id: "flat-201",
      flatNumber: "201",
      block: "Block A",
      floor: "2nd Floor",
      layout: "3 BHK (1,600 sq ft)",
      parkingSlot: "P-03",
      occupancyStatus: "Owner-Occupied",
      owner: {
        name: "David Chen",
        email: "david.chen@sreejafantasy.com",
        phone: "+91 98765 44556"
      },
      tenant: null,
      maintenanceStatus: "Overdue",
      monthlyDues: 290,
      dueDate: "2026-09-10"
    },
    {
      id: "flat-202",
      flatNumber: "202",
      block: "Block A",
      floor: "2nd Floor",
      layout: "2 BHK (1,250 sq ft)",
      parkingSlot: "P-04",
      occupancyStatus: "Owner-Occupied",
      owner: {
        name: "Priya Nair",
        email: "priya.nair@sreejafantasy.com",
        phone: "+91 98765 55667"
      },
      tenant: null,
      maintenanceStatus: "Paid",
      monthlyDues: 250,
      dueDate: "2026-09-25"
    },
    {
      id: "flat-301",
      flatNumber: "301",
      block: "Block B",
      floor: "3rd Floor",
      layout: "3 BHK (1,600 sq ft)",
      parkingSlot: "P-05",
      occupancyStatus: "Owner-Occupied",
      owner: {
        name: "Clara Oswald",
        email: "clara.oswald@sreejafantasy.com",
        phone: "+91 98765 66778"
      },
      tenant: null,
      maintenanceStatus: "Overdue",
      monthlyDues: 290,
      dueDate: "2026-09-10"
    },
    {
      id: "flat-302",
      flatNumber: "302",
      block: "Block B",
      floor: "3rd Floor",
      layout: "2 BHK (1,250 sq ft)",
      parkingSlot: "P-06",
      occupancyStatus: "Owner-Occupied",
      owner: {
        name: "Vikram Malhotra",
        email: "vikram.malhotra@sreejafantasy.com",
        phone: "+91 98765 77889"
      },
      tenant: null,
      maintenanceStatus: "Paid",
      monthlyDues: 250,
      dueDate: "2026-09-25"
    },
    {
      id: "flat-401",
      flatNumber: "401",
      block: "Block B",
      floor: "4th Floor",
      layout: "2 BHK (1,250 sq ft)",
      parkingSlot: "P-07",
      occupancyStatus: "Owner-Occupied",
      owner: {
        name: "Sunita Rao",
        email: "sunita.rao@sreejafantasy.com",
        phone: "+91 98765 88991"
      },
      tenant: null,
      maintenanceStatus: "Pending",
      monthlyDues: 250,
      dueDate: "2026-09-25"
    },
    {
      id: "flat-402",
      flatNumber: "402",
      block: "Block B",
      floor: "4th Floor",
      layout: "2 BHK (1,350 sq ft)",
      parkingSlot: "P-08",
      occupancyStatus: "Owner-Occupied",
      owner: {
        name: "Alex Rivera",
        email: "alex.rivera@sreejafantasy.com",
        phone: "+91 98450 12345"
      },
      tenant: null,
      maintenanceStatus: "Pending",
      monthlyDues: 285,
      dueDate: "2026-09-25"
    },
    {
      id: "flat-501",
      flatNumber: "501",
      block: "Block B",
      floor: "5th Floor",
      layout: "3 BHK Penthouse (2,400 sq ft)",
      parkingSlot: "P-09 & P-10",
      occupancyStatus: "Tenanted",
      owner: {
        name: "Elena Rostova",
        email: "elena.rostova@sreejafantasy.com",
        phone: "+91 98765 88990"
      },
      tenant: {
        name: "Marcus Brody",
        email: "marcus.brody@sreejafantasy.com",
        phone: "+91 98765 99001",
        leaseStart: "2025-11-01",
        leaseEnd: "2026-10-31"
      },
      maintenanceStatus: "Paid",
      monthlyDues: 340,
      dueDate: "2026-09-20"
    },
    {
      id: "flat-502",
      flatNumber: "502",
      block: "Block B",
      floor: "5th Floor",
      layout: "3 BHK Penthouse (2,400 sq ft)",
      parkingSlot: "P-11 & P-12",
      occupancyStatus: "Owner-Occupied",
      owner: {
        name: "Ananya Deshmukh",
        email: "ananya.deshmukh@sreejafantasy.com",
        phone: "+91 98765 99112"
      },
      tenant: null,
      maintenanceStatus: "Paid",
      monthlyDues: 340,
      dueDate: "2026-09-20"
    }
  ],

  // Tenancy Profile Change Requests
  tenancyRequests: [
    {
      id: "req-402-1",
      flatNumber: "402",
      ownerName: "Alex Rivera",
      ownerEmail: "alex.rivera@sreejafantasy.com",
      tenantDetails: {
        name: "Carlos Mendez",
        email: "carlos.mendez@sreejafantasy.com",
        phone: "+91 98450 99887",
        leaseStart: "2026-10-01",
        leaseDurationMonths: 11,
        agreementRef: "LEASE-SREEJA-402-2026"
      },
      status: "Pending", // "Pending" | "Approved" | "Rejected"
      requestedAt: "2026-09-17T12:00:00Z",
      reviewedAt: null,
      reviewedBy: null,
      notes: "Prospective tenant employed at IT Park. Requesting verification and whitelist approval."
    }
  ],

  // Maintenance Invoices
  maintenance: [
    {
      id: "inv-202609-402",
      unitNumber: "402",
      flatId: "flat-402",
      residentName: "Alex Rivera",
      tenantId: "alex.rivera@sreejafantasy.com",
      period: "September 2026",
      dueDate: "2026-09-25",
      baseAmount: 180,
      sinkingFund: 40,
      waterUtility: 45,
      parkingFee: 20,
      totalAmount: 285,
      status: "Pending",
      paidAt: null,
      paymentMethod: null,
      transactionId: null,
      notes: "Sreeja Fantasy Apartments - Standard monthly assessment for Flat 402"
    },
    {
      id: "inv-202608-402",
      unitNumber: "402",
      flatId: "flat-402",
      residentName: "Alex Rivera",
      tenantId: "alex.rivera@sreejafantasy.com",
      period: "August 2026",
      dueDate: "2026-08-25",
      baseAmount: 180,
      sinkingFund: 40,
      waterUtility: 45,
      parkingFee: 20,
      totalAmount: 285,
      status: "Paid",
      paidAt: "2026-08-04T14:32:00Z",
      paymentMethod: "Credit Card (HDFC Visa)",
      transactionId: "TXN-SREEJA-89412A",
      notes: "Settled on time with auto-receipt generated."
    },
    {
      id: "inv-202609-101",
      unitNumber: "101",
      flatId: "flat-101",
      residentName: "Rajesh Sharma",
      tenantId: "rajesh.sharma@sreejafantasy.com",
      period: "September 2026",
      dueDate: "2026-09-25",
      baseAmount: 160,
      sinkingFund: 35,
      waterUtility: 40,
      parkingFee: 15,
      totalAmount: 250,
      status: "Paid",
      paidAt: "2026-09-02T11:00:00Z",
      paymentMethod: "UPI (Google Pay)",
      transactionId: "TXN-SREEJA-90112B",
      notes: "Settled via UPI"
    },
    {
      id: "inv-202609-102",
      unitNumber: "102",
      flatId: "flat-102",
      residentName: "Amit Verma (Tenant) / Meera Iyer",
      tenantId: "amit.verma@sreejafantasy.com",
      period: "September 2026",
      dueDate: "2026-09-25",
      baseAmount: 160,
      sinkingFund: 35,
      waterUtility: 40,
      parkingFee: 15,
      totalAmount: 250,
      status: "Paid",
      paidAt: "2026-09-03T16:20:00Z",
      paymentMethod: "Net Banking (SBI)",
      transactionId: "TXN-SREEJA-90415C",
      notes: "Paid by tenant Amit Verma"
    },
    {
      id: "inv-202609-201",
      unitNumber: "201",
      flatId: "flat-201",
      residentName: "David Chen",
      tenantId: "david.chen@sreejafantasy.com",
      period: "September 2026",
      dueDate: "2026-09-10",
      baseAmount: 185,
      sinkingFund: 45,
      waterUtility: 40,
      parkingFee: 20,
      totalAmount: 290,
      status: "Overdue",
      paidAt: null,
      paymentMethod: null,
      transactionId: null,
      notes: "Overdue payment notice dispatched on Sept 14."
    },
    {
      id: "inv-202609-301",
      unitNumber: "301",
      flatId: "flat-301",
      residentName: "Clara Oswald",
      tenantId: "clara.oswald@sreejafantasy.com",
      period: "September 2026",
      dueDate: "2026-09-10",
      baseAmount: 185,
      sinkingFund: 45,
      waterUtility: 40,
      parkingFee: 20,
      totalAmount: 290,
      status: "Overdue",
      paidAt: null,
      paymentMethod: null,
      transactionId: null,
      notes: "Reminder sent to owner."
    },
    {
      id: "inv-202609-501",
      unitNumber: "501",
      flatId: "flat-501",
      residentName: "Marcus Brody (Tenant) / Elena Rostova",
      tenantId: "marcus.brody@sreejafantasy.com",
      period: "September 2026",
      dueDate: "2026-09-20",
      baseAmount: 220,
      sinkingFund: 60,
      waterUtility: 40,
      parkingFee: 20,
      totalAmount: 340,
      status: "Paid",
      paidAt: "2026-09-02T10:15:00Z",
      paymentMethod: "Bank Wire / ACH",
      transactionId: "TXN-SREEJA-90214B",
      notes: "Penthouse tier assessment settled."
    }
  ],

  // Service Requests
  serviceRequests: [
    {
      id: "SR-4021",
      unitNumber: "402",
      residentName: "Alex Rivera",
      tenantId: "alex.rivera@sreejafantasy.com",
      category: "Plumbing",
      subcategory: "Pipe & Drain Leak",
      title: "Kitchen Sink Drain Slow & Minor Under-Sink Drip",
      description: "Water drains slowly in the primary kitchen sink and there is a steady drip originating near the P-trap joint into the cabinet basin.",
      urgency: "High",
      status: "In Progress",
      assignedTo: "Sam Patel (Licensed Master Plumber)",
      assignedPhone: "+91 98451 22334",
      preferredSlot: "Morning (9:00 AM - 12:00 PM)",
      residentPhone: "+91 98450 12345",
      createdAt: "2026-09-15T10:15:00Z",
      updatedAt: "2026-09-16T14:10:00Z",
      resolutionNotes: "Initial inspection completed. P-trap gasket worn out; replacement seal arriving tomorrow morning."
    },
    {
      id: "SR-5012",
      unitNumber: "501",
      residentName: "Marcus Brody",
      tenantId: "marcus.brody@sreejafantasy.com",
      category: "Electric",
      subcategory: "Circuit Breaker & Power",
      title: "Master Bedroom Breaker Tripping on Air Conditioner Start",
      description: "Whenever the split AC compressor engages, the 20A breaker in the subpanel trips.",
      urgency: "High",
      status: "Assigned",
      assignedTo: "Dave Miller (Certified Electrician)",
      assignedPhone: "+91 98452 33445",
      preferredSlot: "Afternoon (1:00 PM - 4:00 PM)",
      residentPhone: "+91 98765 99001",
      createdAt: "2026-09-16T16:45:00Z",
      updatedAt: "2026-09-17T09:00:00Z",
      resolutionNotes: "Assigned to Dave Miller. Diagnosing startup capacitor load."
    },
    {
      id: "SR-1013",
      unitNumber: "101",
      residentName: "Rajesh Sharma",
      tenantId: "rajesh.sharma@sreejafantasy.com",
      category: "Plumbing",
      subcategory: "Faucets & Fixtures",
      title: "Balcony Tap Water Pressure Low",
      description: "Water flow in the utility balcony tap is very slow.",
      urgency: "Normal",
      status: "Resolved",
      assignedTo: "Sam Patel (Licensed Master Plumber)",
      assignedPhone: "+91 98451 22334",
      preferredSlot: "Anytime",
      residentPhone: "+91 98765 11223",
      createdAt: "2026-09-09T11:20:00Z",
      updatedAt: "2026-09-11T15:30:00Z",
      resolutionNotes: "Cleared lime scale sediment from valve line. Pressure restored."
    }
  ],

  // Community Announcements
  announcements: [
    {
      id: "ann-201",
      title: "Semi-Annual Overhead Tank Cleaning & Water Supply Schedule",
      category: "Maintenance",
      priority: "Urgent",
      pinned: true,
      author: "Sarah Vance (Property Manager)",
      publishedDate: "2026-09-16",
      targetAudience: "All Blocks (A & B)",
      content: "Please note that all overhead drinking and domestic water tanks in Sreeja Fantasy Apartments will undergo high-pressure cleaning and sterilization this Saturday, September 19, from 9:00 AM to 2:00 PM. Water supply will remain shut during these hours. Please store sufficient potable water."
    },
    {
      id: "ann-202",
      title: "Notice of 2026 Annual General Body Meeting (AGM)",
      category: "General",
      priority: "Important",
      pinned: true,
      author: "Sreeja Fantasy Apartments Association Executive Committee",
      publishedDate: "2026-09-12",
      targetAudience: "All Apartment Owners & Residents",
      content: "The Executive Committee cordially invites all homeowners and residents to the 2026 AGM on Sunday, October 4 at 6:00 PM in the Community Banquet Hall. Key agenda items: audited financial review, election of committee office bearers, and approval of rooftop solar grid."
    },
    {
      id: "ann-203",
      title: "Basement EV Charging Bays Commissioned",
      category: "Amenities",
      priority: "Event",
      pinned: false,
      author: "Facilities Team",
      publishedDate: "2026-09-05",
      targetAudience: "All Residents",
      content: "Four dedicated smart Level-2 EV charging bays are now live near Pillar B-14 in Basement 2. Residents can activate charging via the association smart RFID tag. Standard municipal tariff applies without markup."
    }
  ],

  // Meeting Minutes
  meetingMinutes: [
    {
      id: "min-202608",
      title: "Executive Committee Monthly Meeting - August 2026",
      meetingDate: "2026-08-18",
      time: "7:00 PM - 9:00 PM",
      venue: "Sreeja Fantasy Clubhouse Boardroom",
      chairedBy: "Sarah Vance (Association President)",
      attendeesCount: 16,
      attendees: "Sarah Vance (President), Rajesh Sharma (Treasurer), David Chen (Secretary), and 13 Flat Owners",
      agenda: [
        "1. Rooftop Solar Photovoltaic feasibility evaluation",
        "2. Review of Q2 financial performance & reserve fund yield",
        "3. Sreeja Fantasy water booster pump overhaul",
        "4. Tenancy registration compliance & profile approval workflow"
      ],
      resolutions: [
        {
          code: "RES-SREEJA-2026-08-A",
          text: "Unanimously approved contract award to CleanSun Energy for 45 kWp commercial rooftop solar installation with expected ROI of 3.4 years.",
          vote: "Passed Unanimously (16-0)"
        },
        {
          code: "RES-SREEJA-2026-08-B",
          text: "Authorized an allocation of $4,200 from Sinking Fund for replacement of Block A secondary booster pump impeller and ceramic seals.",
          vote: "Passed (15-1)"
        }
      ],
      actionItems: [
        { task: "Execute solar grid agreement with municipal utility", owner: "Sarah Vance", deadline: "2026-09-20", status: "In Progress" },
        { task: "Oversee water pump overhaul and log pressure telemetry", owner: "Facilities Team", deadline: "2026-09-25", status: "Completed" }
      ]
    }
  ],

  // Expense Statements
  expenseStatements: [
    {
      id: "stmt-202608",
      period: "August 2026",
      publishedDate: "2026-09-05",
      status: "Published",
      publishedBy: "Rajesh Sharma (Treasurer) & Sarah Vance (President)",
      totalIncome: 34800,
      totalExpenses: 28650,
      netSurplus: 6150,
      reserveFundBalance: 142500,
      notes: "Sreeja Fantasy Apartments Association Statement. Surplus of $6,150 transferred into Capital Sinking Reserve Fund.",
      categories: [
        { name: "Common Area Electricity & Pumping", amount: 7420, percent: 25.9, notes: "Lifts, water pumps, and basement ventilation" },
        { name: "24/7 Security Agency & Monitoring", amount: 8600, percent: 30.0, notes: "Round-the-clock guards, supervisor & perimeter CCTV" },
        { name: "Housekeeping, Sanitation & Waste Hauling", amount: 4850, percent: 16.9, notes: "Daily floor sanitation, garbage clearing & city hauling" },
        { name: "Elevators Comprehensive AMC & Service", amount: 2800, percent: 9.8, notes: "Monthly preventative inspection for Block A & B lifts" },
        { name: "Landscaping, Courtyard & Tree Care", amount: 1450, percent: 5.1, notes: "Garden maintenance and lawn care" },
        { name: "Diesel Generator Backup AMC & Fuel", amount: 1280, percent: 4.5, notes: "Emergency power backup fuel readiness" },
        { name: "Pool Chemicals & Water Filtration", amount: 650, percent: 2.3, notes: "Water quality balancing and filter backwashing" },
        { name: "Administrative, Software & Banking", amount: 1600, percent: 5.5, notes: "Management portal licenses, banking and legal filing" }
      ]
    }
  ]
};
