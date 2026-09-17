/**
 * ApexLiving Apartment Management Suite
 * Seed Data Store - Initial Realistic Pre-seeded State
 */

export const INITIAL_DATA = {
  users: [
    {
      id: "usr-manager-1",
      email: "sarah.vance@apexliving.com",
      displayName: "Sarah Vance",
      role: "manager",
      title: "General Property Manager & Association President",
      building: "Aurora Residences",
      phone: "+1 (555) 901-2345",
      avatar: "SV",
      joinedDate: "2022-04-10"
    },
    {
      id: "usr-tenant-1",
      email: "alex.rivera@apexliving.com",
      displayName: "Alex Rivera",
      role: "tenant",
      unitNumber: "402",
      tower: "Tower A",
      floor: "4th Floor",
      bedrooms: "2 BHK (1,350 sq ft)",
      phone: "+1 (555) 234-5678",
      avatar: "AR",
      moveInDate: "2024-03-15"
    },
    {
      id: "usr-tenant-2",
      email: "elena.rostova@apexliving.com",
      displayName: "Elena Rostova",
      role: "tenant",
      unitNumber: "715",
      tower: "Tower B",
      floor: "7th Floor",
      bedrooms: "3 BHK Penthouse (2,400 sq ft)",
      phone: "+1 (555) 876-5432",
      avatar: "ER",
      moveInDate: "2023-11-01"
    },
    {
      id: "usr-tenant-3",
      email: "david.chen@apexliving.com",
      displayName: "David Chen",
      role: "tenant",
      unitNumber: "204",
      tower: "Tower A",
      floor: "2nd Floor",
      bedrooms: "2 BHK (1,350 sq ft)",
      phone: "+1 (555) 432-1098",
      avatar: "DC",
      moveInDate: "2025-01-10"
    },
    {
      id: "usr-tenant-4",
      email: "priya.nair@apexliving.com",
      displayName: "Priya Nair",
      role: "tenant",
      unitNumber: "508",
      tower: "Tower B",
      floor: "5th Floor",
      bedrooms: "2 BHK (1,400 sq ft)",
      phone: "+1 (555) 345-6789",
      avatar: "PN",
      moveInDate: "2024-08-20"
    }
  ],

  maintenance: [
    {
      id: "inv-202609-402",
      unitNumber: "402",
      residentName: "Alex Rivera",
      tenantId: "usr-tenant-1",
      period: "September 2026",
      dueDate: "2026-09-25",
      baseAmount: 180,
      sinkingFund: 40,
      waterUtility: 45,
      parkingFee: 20,
      totalAmount: 285,
      status: "Pending", // Pending, Paid, Overdue
      paidAt: null,
      paymentMethod: null,
      transactionId: null,
      notes: "Monthly standard assessment including parking bay #A-42"
    },
    {
      id: "inv-202608-402",
      unitNumber: "402",
      residentName: "Alex Rivera",
      tenantId: "usr-tenant-1",
      period: "August 2026",
      dueDate: "2026-08-25",
      baseAmount: 180,
      sinkingFund: 40,
      waterUtility: 45,
      parkingFee: 20,
      totalAmount: 285,
      status: "Paid",
      paidAt: "2026-08-04T14:32:00Z",
      paymentMethod: "Credit Card (Visa ending in 4242)",
      transactionId: "TXN-89412A",
      notes: "Settled on time with auto-receipt generated."
    },
    {
      id: "inv-202609-715",
      unitNumber: "715",
      residentName: "Elena Rostova",
      tenantId: "usr-tenant-2",
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
      transactionId: "TXN-90214B",
      notes: "Penthouse tier assessment paid via scheduled ACH."
    },
    {
      id: "inv-202609-204",
      unitNumber: "204",
      residentName: "David Chen",
      tenantId: "usr-tenant-3",
      period: "September 2026",
      dueDate: "2026-09-10",
      baseAmount: 180,
      sinkingFund: 40,
      waterUtility: 45,
      parkingFee: 20,
      totalAmount: 285,
      status: "Overdue",
      paidAt: null,
      paymentMethod: null,
      transactionId: null,
      notes: "Second payment notice dispatched on Sept 14."
    },
    {
      id: "inv-202609-508",
      unitNumber: "508",
      residentName: "Priya Nair",
      tenantId: "usr-tenant-4",
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
      notes: "Monthly standard assessment"
    },
    {
      id: "inv-202609-101",
      unitNumber: "101",
      residentName: "Marcus Brody",
      tenantId: "usr-tenant-5",
      period: "September 2026",
      dueDate: "2026-09-15",
      baseAmount: 170,
      sinkingFund: 35,
      waterUtility: 40,
      parkingFee: 15,
      totalAmount: 260,
      status: "Paid",
      paidAt: "2026-09-05T09:20:00Z",
      paymentMethod: "Online UPI / Debit",
      transactionId: "TXN-91104C",
      notes: "Received and verified."
    },
    {
      id: "inv-202609-305",
      unitNumber: "305",
      residentName: "Clara Oswald",
      tenantId: "usr-tenant-6",
      period: "September 2026",
      dueDate: "2026-09-10",
      baseAmount: 180,
      sinkingFund: 40,
      waterUtility: 45,
      parkingFee: 20,
      totalAmount: 285,
      status: "Overdue",
      paidAt: null,
      paymentMethod: null,
      transactionId: null,
      notes: "Overdue notice sent."
    }
  ],

  reminders: [
    {
      id: "rem-101",
      targetUnit: "402",
      tenantId: "usr-tenant-1",
      title: "Maintenance Fee Reminder - Sept 2026",
      message: "Dear Alex, this is a reminder that your monthly assessment of $285 is due on Sept 25, 2026.",
      category: "Dues",
      severity: "Normal",
      createdAt: "2026-09-15T08:00:00Z",
      read: false
    },
    {
      id: "rem-102",
      targetUnit: "All",
      tenantId: null,
      title: "Semi-Annual Overhead Water Tank Sanitization",
      message: "Water supply for Tower A & B will be paused Saturday Sept 19 between 9 AM and 2 PM. Please store sufficient drinking water.",
      category: "Service",
      severity: "Urgent",
      createdAt: "2026-09-16T11:30:00Z",
      read: false
    },
    {
      id: "rem-103",
      targetUnit: "204",
      tenantId: "usr-tenant-3",
      title: "Overdue Maintenance Notice",
      message: "Urgent: Your assessment of $285 due Sept 10 is currently past due. Please settle online to avoid late fee penalties.",
      category: "Overdue",
      severity: "High",
      createdAt: "2026-09-14T09:00:00Z",
      read: true
    },
    {
      id: "rem-104",
      targetUnit: "402",
      tenantId: "usr-tenant-1",
      title: "Plumbing Service Visit Scheduled",
      message: "Technician Sam Patel has accepted your service request #SR-4021 for the sink repair and is scheduled tomorrow 10:00 AM.",
      category: "Service",
      severity: "Normal",
      createdAt: "2026-09-16T14:20:00Z",
      read: true
    }
  ],

  serviceRequests: [
    {
      id: "SR-4021",
      unitNumber: "402",
      residentName: "Alex Rivera",
      tenantId: "usr-tenant-1",
      category: "Plumbing",
      subcategory: "Pipe & Drain Leak",
      title: "Kitchen Sink Drain Slow & Minor Under-Sink Drip",
      description: "Water drains slowly in the primary kitchen sink and there is a steady drip originating near the P-trap joint into the cabinet basin.",
      urgency: "High", // Low, Normal, High, Emergency
      status: "In Progress", // Pending, Assigned, In Progress, Resolved, Closed
      assignedTo: "Sam Patel (Licensed Master Plumber)",
      assignedPhone: "+1 (555) 765-4321",
      preferredSlot: "Morning (9:00 AM - 12:00 PM)",
      residentPhone: "+1 (555) 234-5678",
      createdAt: "2026-09-15T10:15:00Z",
      updatedAt: "2026-09-16T14:10:00Z",
      resolutionNotes: "Initial inspection completed. P-trap gasket worn out; technician arriving with replacement seal tomorrow."
    },
    {
      id: "SR-7152",
      unitNumber: "715",
      residentName: "Elena Rostova",
      tenantId: "usr-tenant-2",
      category: "Electric",
      subcategory: "Circuit Breaker & Power",
      title: "Master Bedroom Breaker Tripping on Air Conditioner Start",
      description: "Whenever the master suite split AC compressor engages, the 20A breaker in the subpanel immediately trips.",
      urgency: "High",
      status: "Assigned",
      assignedTo: "Dave Miller (Certified Electrician)",
      assignedPhone: "+1 (555) 321-9876",
      preferredSlot: "Afternoon (1:00 PM - 4:00 PM)",
      residentPhone: "+1 (555) 876-5432",
      createdAt: "2026-09-16T16:45:00Z",
      updatedAt: "2026-09-17T09:00:00Z",
      resolutionNotes: "Assigned to Dave Miller. Suspecting startup capacitor surge or faulty thermal overload switch."
    },
    {
      id: "SR-2043",
      unitNumber: "204",
      residentName: "David Chen",
      tenantId: "usr-tenant-3",
      category: "Plumbing",
      subcategory: "Faucets & Fixtures",
      title: "Guest Bathroom Shower Mixer Cartridge Sticky",
      description: "The hot/cold mixing valve is very stiff to rotate and water temperature fluctuates randomly.",
      urgency: "Normal",
      status: "Resolved",
      assignedTo: "Sam Patel (Licensed Master Plumber)",
      assignedPhone: "+1 (555) 765-4321",
      preferredSlot: "Anytime",
      residentPhone: "+1 (555) 432-1098",
      createdAt: "2026-09-09T11:20:00Z",
      updatedAt: "2026-09-11T15:30:00Z",
      resolutionNotes: "Replaced 35mm ceramic disc cartridge and cleaned lime scale. Valve operational smoothly."
    },
    {
      id: "SR-1004",
      unitNumber: "Common Area",
      residentName: "Building Staff",
      tenantId: "usr-manager-1",
      category: "Electric",
      subcategory: "Lighting",
      title: "Corridor Accent Fixture Intermittent - Tower A 3rd Floor",
      description: "Two recessed LED downlights near Unit 302 and 304 are flickering constantly.",
      urgency: "Normal",
      status: "Resolved",
      assignedTo: "Dave Miller (Certified Electrician)",
      assignedPhone: "+1 (555) 321-9876",
      preferredSlot: "Working Hours",
      residentPhone: "+1 (555) 901-2345",
      createdAt: "2026-09-08T08:30:00Z",
      updatedAt: "2026-09-09T14:00:00Z",
      resolutionNotes: "Faulty driver unit replaced; all corridor lights balanced and tested."
    },
    {
      id: "SR-4022",
      unitNumber: "402",
      residentName: "Alex Rivera",
      tenantId: "usr-tenant-1",
      category: "HVAC",
      subcategory: "Ventilation",
      title: "Annual Seasonal AC Filter Inspection & Vent Cleaning",
      description: "Requesting preventive maintenance check before fall temperature changes.",
      urgency: "Low",
      status: "Pending",
      assignedTo: "Unassigned",
      assignedPhone: "",
      preferredSlot: "Weekend Morning",
      residentPhone: "+1 (555) 234-5678",
      createdAt: "2026-09-17T09:10:00Z",
      updatedAt: "2026-09-17T09:10:00Z",
      resolutionNotes: "Pending manager review and batching with seasonal HVAC contractor visit."
    }
  ],

  announcements: [
    {
      id: "ann-201",
      title: "Semi-Annual Overhead Tank Cleaning & Water Supply Schedule",
      category: "Maintenance",
      priority: "Urgent", // Urgent, Important, Event, Normal
      pinned: true,
      author: "Sarah Vance (Property Manager)",
      publishedDate: "2026-09-16",
      targetAudience: "All Towers (A & B)",
      content: "Please note that all overhead drinking and domestic tanks will undergo chemical disinfection and high-pressure washing this Saturday, September 19, from 9:00 AM to 2:00 PM. Water supply will remain shut during these hours. Please store sufficient potable water for your household needs."
    },
    {
      id: "ann-202",
      title: "Notice of 2026 Annual General Body Meeting (AGM)",
      category: "General",
      priority: "Important",
      pinned: true,
      author: "Management Executive Committee",
      publishedDate: "2026-09-12",
      targetAudience: "All Apartment Owners & Residents",
      content: "The Executive Committee cordially invites all homeowners to the 2026 AGM on Sunday, October 4 at 6:00 PM in the Community Clubhouse Banquet Hall. Key agenda items include: review of 2025-2026 audited financial statements, election of 3 vacant EC seats, and voting on the proposed 45 kWp Rooftop Solar Grid project."
    },
    {
      id: "ann-203",
      title: "Level-2 Electric Vehicle (EV) Charging Bays Now Live in Basement 2",
      category: "Amenities",
      priority: "Event",
      pinned: false,
      author: "Facilities Team",
      publishedDate: "2026-09-05",
      targetAudience: "All Residents",
      content: "We are pleased to announce the commissioning of four fast EV charging bays adjacent to Pillar B-14 in Basement 2. Residents can activate charging via the building RFID smart key or mobile application. Billing is billed at direct municipal utility tariffs without markup."
    },
    {
      id: "ann-204",
      title: "Fall Landscape Beautification & Tree Trimming Notice",
      category: "Maintenance",
      priority: "Normal",
      pinned: false,
      author: "Sarah Vance (Property Manager)",
      publishedDate: "2026-08-28",
      targetAudience: "Ground Floor & Courtyard Facing Units",
      content: "Certified arborists will conduct perimeter canopy pruning and lawn aeration from Sept 21 to Sept 23 between 10:00 AM and 4:00 PM. Please avoid parking in the north driveway circle during operation hours."
    }
  ],

  associationRules: [
    {
      id: "rule-sec-1",
      section: "1.0",
      category: "Quiet Hours & Community Peace",
      title: "Quiet Hours & Noise Regulations",
      lastUpdated: "2026-01-15",
      clauses: [
        "1.1 Strict quiet hours are in effect from 10:00 PM to 7:00 AM on weekdays, and 11:00 PM to 8:00 AM on Saturdays, Sundays, and public holidays.",
        "1.2 Sound-producing devices (TVs, stereos, musical instruments) must be kept at reasonable volume levels at all times so as not to penetrate adjacent walls or floors.",
        "1.3 Social gatherings with more than 10 guests extending past 10:00 PM require advance notification to the Property Management office."
      ]
    },
    {
      id: "rule-sec-2",
      section: "2.0",
      category: "Parking & Vehicles",
      title: "Parking Regulations & EV Protocol",
      lastUpdated: "2026-06-01",
      clauses: [
        "2.1 Each residential unit is assigned specific numbered parking stall(s). Parking in any other resident's slot without written authorization is strictly prohibited.",
        "2.2 Visitor parking bays are reserved for genuine guests for a maximum of 24 consecutive hours. Unauthorized overnight parking by resident vehicles will incur tow warnings.",
        "2.3 Electric vehicle charging must be conducted exclusively via the dedicated EV charging infrastructure in Basement 2. Running domestic cables or extension cords from apartments or common sockets is a fire code violation."
      ]
    },
    {
      id: "rule-sec-3",
      section: "3.0",
      category: "Pets & Domestic Animals",
      title: "Pet Policy & Common Area Conduct",
      lastUpdated: "2025-10-10",
      clauses: [
        "3.1 All dogs and domestic pets must be kept on a leash or inside a carrier at all times when outside the apartment unit, including lobbies, elevators, and gardens.",
        "3.2 Pet owners are strictly required to clean up and safely dispose of all animal waste immediately using designated sanitary pet waste receptacles.",
        "3.3 Pets are not permitted inside the swimming pool water or inside the indoor fitness center."
      ]
    },
    {
      id: "rule-sec-4",
      section: "4.0",
      category: "Waste Management & Sustainability",
      title: "Waste Segregation & Disposal",
      lastUpdated: "2026-03-20",
      clauses: [
        "4.1 Mandatory three-stream sorting (Organic/Wet food waste, Dry clean recyclables, and Sanitary/Hazardous) is enforced across all residences.",
        "4.2 Flatten and bundle cardboard shipping boxes before depositing them into the basement recycling depot. Do not block floor refuse chutes with oversized parcels.",
        "4.3 Flammable substances, paint cans, and lithium batteries must not be discarded in floor garbage chutes."
      ]
    },
    {
      id: "rule-sec-5",
      section: "5.0",
      category: "Renovations & Moving",
      title: "Interior Work & Relocation Guidelines",
      lastUpdated: "2025-11-15",
      clauses: [
        "5.1 Noisy renovations, masonry, drilling, and tile work are permitted only Monday through Friday between 9:30 AM and 5:30 PM. No work is permitted on weekends.",
        "5.2 Service elevator reservations must be requested 48 hours in advance through the management portal before moving heavy furniture or materials.",
        "5.3 A refundable security deposit of $500 is required prior to commencing any major structural renovation."
      ]
    },
    {
      id: "rule-sec-6",
      section: "6.0",
      category: "Recreational Amenities",
      title: "Clubhouse, Gym & Swimming Pool Guidelines",
      lastUpdated: "2026-05-18",
      clauses: [
        "6.1 Swimming pool hours are 6:00 AM to 10:00 PM daily. Showering before entering the pool is mandatory; appropriate swimwear is required.",
        "6.2 Children under the age of 14 must be accompanied by an adult guardian at all times in the pool area. No glassware is permitted around the deck.",
        "6.3 Fitness center equipment must be wiped down with provided sanitizing wipes immediately after use."
      ]
    }
  ],

  meetingMinutes: [
    {
      id: "min-202608",
      title: "Executive Committee Monthly Meeting - August 2026",
      meetingDate: "2026-08-18",
      time: "7:00 PM - 9:00 PM",
      venue: "Community Boardroom & Virtual Zoom",
      chairedBy: "Sarah Vance (Association President)",
      attendeesCount: 18,
      attendees: "Sarah Vance (President), Marcus Brody (Secretary), Elena Rostova (Treasurer), Dave Miller (Facilities), 14 Homeowners",
      agenda: [
        "1. Rooftop Solar Photovoltaic feasibility evaluation",
        "2. Review of Q2 financial performance & reserve fund yield",
        "3. Water pump overhaul quotations",
        "4. Overdue maintenance accounts collection strategy"
      ],
      resolutions: [
        {
          code: "RES-2026-08-A",
          text: "Unanimously approved contract award to CleanSun Energy for 45 kWp commercial rooftop solar installation with expected ROI of 3.4 years.",
          vote: "Passed Unanimously (9-0)"
        },
        {
          code: "RES-2026-08-B",
          text: "Authorized an allocation of $4,200 from Sinking Fund for replacement of Tower A secondary booster pump impeller and ceramic seals.",
          vote: "Passed (8-1)"
        },
        {
          code: "RES-2026-08-C",
          text: "Adopted structured 3-stage automated reminder protocol for dues past 15 days before applying statutory late fees.",
          vote: "Passed Unanimously (9-0)"
        }
      ],
      actionItems: [
        { task: "Sign solar grid agreement with municipal utility", owner: "Sarah Vance", deadline: "2026-09-20", status: "In Progress" },
        { task: "Oversee water pump overhaul and log pressure telemetry", owner: "Facilities Team", deadline: "2026-09-25", status: "Completed" },
        { task: "Issue audited statement for August to all members", owner: "Elena Rostova (Treasurer)", deadline: "2026-09-05", status: "Completed" }
      ]
    },
    {
      id: "min-202607",
      title: "Quarterly Resident Townhall & Committee Meeting - July 2026",
      meetingDate: "2026-07-12",
      time: "6:30 PM - 8:30 PM",
      venue: "Clubhouse Main Hall",
      chairedBy: "Sarah Vance (Association President)",
      attendeesCount: 42,
      attendees: "Executive Committee Officers and 38 Apartment Owners",
      agenda: [
        "1. Physical security service contract performance review",
        "2. Underground EV charging station commissioning",
        "3. Common area landscaping master plan"
      ],
      resolutions: [
        {
          code: "RES-2026-07-A",
          text: "Extended security vendor service agreement for 12 months with added requirement for hourly digital NFC patrol checkpoints.",
          vote: "Passed (36-6)"
        },
        {
          code: "RES-2026-07-B",
          text: "Approved setup and tenant usage tariff for 4 smart EV charging stalls in Basement 2.",
          vote: "Passed Unanimously (42-0)"
        }
      ],
      actionItems: [
        { task: "Deploy NFC tag checkpoints on all perimeter gates", owner: "Security Head", deadline: "2026-08-01", status: "Completed" },
        { task: "Distribute EV charging user guides to residents", owner: "Property Management", deadline: "2026-08-10", status: "Completed" }
      ]
    }
  ],

  expenseStatements: [
    {
      id: "stmt-202608",
      period: "August 2026",
      publishedDate: "2026-09-05",
      status: "Published",
      publishedBy: "Elena Rostova (Treasurer) & Sarah Vance (President)",
      totalIncome: 34800,
      totalExpenses: 28650,
      netSurplus: 6150,
      reserveFundBalance: 142500,
      notes: "Surplus of $6,150 transferred into Capital Sinking Reserve Fund. Utility savings achieved through LED corridor retrofitting.",
      categories: [
        { name: "Common Area Electricity & Pumping", amount: 7420, percent: 25.9, notes: "Grid power for elevators, basement lighting & water pumps" },
        { name: "24/7 Security & Surveillance Staff", amount: 8600, percent: 30.0, notes: "6 guards on rotation, supervisor & CCTV system maintenance" },
        { name: "Housekeeping, Sanitation & Waste Hauling", amount: 4850, percent: 16.9, notes: "Daily floor cleaning, garbage chute clearing & city disposal" },
        { name: "Elevators Comprehensive AMC & Service", amount: 2800, percent: 9.8, notes: "Monthly preventative inspection and rope lubrication for 4 lifts" },
        { name: "Landscaping, Courtyard & Tree Care", amount: 1450, percent: 5.1, notes: "Arborist care, lawn mowing, seasonal fertilizers & flowers" },
        { name: "Diesel Generator Backup AMC & Fuel", amount: 1280, percent: 4.5, notes: "Emergency backup fuel reserves and automated transfer switch check" },
        { name: "Pool Chemicals & Water Filtration", amount: 650, percent: 2.3, notes: "Chlorine balance, silica filter backwash and pH testing" },
        { name: "Administrative, Software & Banking", amount: 1600, percent: 5.5, notes: "Management portal, accounting auditing & merchant processing fees" }
      ]
    },
    {
      id: "stmt-202607",
      period: "July 2026",
      publishedDate: "2026-08-05",
      status: "Published",
      publishedBy: "Elena Rostova (Treasurer) & Sarah Vance (President)",
      totalIncome: 33950,
      totalExpenses: 29100,
      netSurplus: 4850,
      reserveFundBalance: 136350,
      notes: "Includes one-time expenditure for Basement 2 EV charging station electrical panel integration.",
      categories: [
        { name: "Common Area Electricity & Pumping", amount: 7650, percent: 26.3, notes: "Elevator power & high summer air circulation in clubhouse" },
        { name: "24/7 Security & Surveillance Staff", amount: 8600, percent: 29.6, notes: "6 security officers & biometric entry gate maintenance" },
        { name: "Housekeeping, Sanitation & Waste Hauling", amount: 4850, percent: 16.7, notes: "Standard monthly housekeeping contract" },
        { name: "Elevators Comprehensive AMC & Service", amount: 2800, percent: 9.6, notes: "Quarterly safety certifications" },
        { name: "Landscaping, Courtyard & Tree Care", amount: 1400, percent: 4.8, notes: "Monsoon drain clearance and courtyard trimming" },
        { name: "Diesel Generator Backup AMC & Fuel", amount: 1350, percent: 4.6, notes: "Diesel replenishment for storm backup readiness" },
        { name: "Pool Chemicals & Water Filtration", amount: 700, percent: 2.4, notes: "Heavy summer pool usage treatments" },
        { name: "Administrative, Software & Banking", amount: 1750, percent: 6.0, notes: "Annual legal compliance filing and portal licenses" }
      ]
    }
  ]
};
