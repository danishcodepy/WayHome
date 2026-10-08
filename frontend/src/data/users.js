/** WayHome data module — frontend demo data (backend replaces this later). */

// --------------------------------- Users ---------------------------------
export const users = [
  {
    id: 'u1',
    name: 'Arjun Kapoor',
    email: 'arjun.kapoor@wayhome.example',
    phone: '+91 98110 00001',
    role: 'Admin',
    status: 'Active',
  },
  {
    id: 'u2',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@example.com',
    phone: '+91 98110 00002',
    role: 'Property Manager',
    status: 'Active',
  },
  {
    id: 'u3',
    name: 'Anita Verma',
    email: 'anita.verma@example.com',
    phone: '+91 98110 00003',
    role: 'Property Manager',
    status: 'Active',
  },
  {
    id: 'u4',
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '+91 98110 00004',
    role: 'Tenant',
    status: 'Active',
  },
  {
    id: 'u5',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '+91 98110 00005',
    role: 'Tenant',
    status: 'Active',
  },
  {
    id: 'u6',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    phone: '+91 98110 00006',
    role: 'Student',
    status: 'Active',
  },
  {
    id: 'u7',
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@example.com',
    phone: '+91 98110 00007',
    role: 'Student',
    status: 'Active',
  },
  {
    id: 'u8',
    name: 'Rahul Jain',
    email: 'rahul.jain@example.com',
    phone: '+91 98110 00008',
    role: 'Tenant',
    status: 'Blocked',
  },
];


// ------------------------------ Applications ------------------------------
export const applications = [
  {
    id: 'ap1',
    applicantName: 'Vikram Singh',
    property: 'Premium 2 BHK Apartment',
    date: '2026-09-20',
    status: 'Pending',
  },
  {
    id: 'ap2',
    applicantName: 'Priya Nair',
    property: 'Metro Studio Residence',
    date: '2026-09-18',
    status: 'Approved',
  },
  {
    id: 'ap3',
    applicantName: 'Aarav Mehta',
    property: 'Comfort Stay PG',
    date: '2026-09-22',
    status: 'Pending',
  },
  {
    id: 'ap4',
    applicantName: 'Sneha Kulkarni',
    property: 'Lakeview Student Flat',
    date: '2026-09-15',
    status: 'Rejected',
  },
  {
    id: 'ap5',
    applicantName: 'Vikram Singh',
    property: 'Greenview Family Villa',
    date: '2026-09-10',
    status: 'Approved',
  },
  {
    id: 'ap6',
    applicantName: 'Priya Nair',
    property: 'Tech Park Studio',
    date: '2026-09-24',
    status: 'Pending',
  },
];


// ------------------------------- Agreements -------------------------------
export const agreements = [
  {
    id: 'ag1',
    property: 'Metro Studio Residence',
    tenant: 'Priya Nair',
    startDate: '2026-08-01',
    endDate: '2027-07-31',
    rent: 14500,
    status: 'Active',
  },
  {
    id: 'ag2',
    property: 'Greenview Family Villa',
    tenant: 'Vikram Singh',
    startDate: '2026-06-01',
    endDate: '2027-05-31',
    rent: 45000,
    status: 'Active',
  },
  {
    id: 'ag3',
    property: 'Riverside 2BHK',
    tenant: 'Sneha Kulkarni',
    startDate: '2025-09-01',
    endDate: '2026-08-31',
    rent: 16000,
    status: 'Expired',
  },
  {
    id: 'ag4',
    property: 'Cozy Artist Studio',
    tenant: 'Vikram Singh',
    startDate: '2026-09-01',
    endDate: '2027-08-31',
    rent: 18000,
    status: 'Active',
  },
];


// --------------------------------- Threads ---------------------------------
export const threads = [
  {
    id: 't1',
    name: 'Rohit Sharma',
    participants: ['You', 'Rohit Sharma'],
    messages: [
      {
        from: 'Rohit Sharma',
        text: 'Hi! Is the Premium 2 BHK Apartment still available?',
        time: '10:24 AM',
      },
      {
        from: 'You',
        text: 'Yes, it is available for immediate move-in.',
        time: '10:31 AM',
      },
      {
        from: 'Rohit Sharma',
        text: 'Great, can I schedule a visit this weekend?',
        time: '10:33 AM',
      },
    ],
  },
  {
    id: 't2',
    name: 'Sunita Devi',
    participants: ['You', 'Sunita Devi'],
    messages: [
      {
        from: 'Sunita Devi',
        text: 'Hello! Comfort Stay PG has one single room opening from next month.',
        time: 'Yesterday',
      },
      {
        from: 'You',
        text: 'Thanks! Does the rent include meals?',
        time: 'Yesterday',
      },
      {
        from: 'Sunita Devi',
        text: 'Yes, breakfast and dinner are included in the rent.',
        time: 'Yesterday',
      },
    ],
  },
  {
    id: 't3',
    name: 'Priya Nair',
    participants: ['You', 'Priya Nair'],
    messages: [
      {
        from: 'Priya Nair',
        text: 'Hi, I have submitted my application for the Metro Studio Residence.',
        time: 'Mon',
      },
      {
        from: 'You',
        text: 'Received! We will review it and get back within 48 hours.',
        time: 'Mon',
      },
    ],
  },
];


// ------------------------------ Notifications ------------------------------
export const notifications = [
  {
    id: 'n1',
    title: 'New application received',
    message: 'Vikram Singh applied for Premium 2 BHK Apartment.',
    time: '2h ago',
    read: false,
  },
  {
    id: 'n2',
    title: 'Rent reminder',
    message: 'Your rent of Rs. 14,500 for Metro Studio Residence is due on Oct 1.',
    time: '5h ago',
    read: false,
  },
  {
    id: 'n3',
    title: 'Agreement expiring',
    message: 'Your agreement for Riverside 2BHK expires in 30 days.',
    time: '1d ago',
    read: true,
  },
  {
    id: 'n4',
    title: 'New message',
    message: 'Rohit Sharma sent you a message.',
    time: '2d ago',
    read: true,
  },
  {
    id: 'n5',
    title: 'Listing approved',
    message: 'Your listing "Tech Park Studio" has been approved.',
    time: '3d ago',
    read: true,
  },
];
