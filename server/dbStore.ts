import fs from 'fs';
import path from 'path';

// Interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Executive' | 'Viewer';
  avatar?: string;
  passwordHash: string; // "password123" -> hashed or plain for simple demo auth
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  gst: string;
  address: string;
  status: 'Active' | 'Pending' | 'Inactive';
  assignedEmployeeId: string;
  createdDate: string;
  lastUpdated: string;
  notes: Array<{ id: string; content: string; createdBy: string; date: string }>;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedEmployeeId: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  deadline: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'Overdue';
  attachments: Array<{ name: string; size: string; fileId: string }>;
  comments: Array<{ id: string; author: string; content: string; timestamp: string }>;
  customerId?: string;
}

export interface Document {
  id: string;
  name: string;
  category: 'KYC' | 'Invoices' | 'Contracts' | 'Identity Proof' | 'Business Documents' | 'Others';
  size: string;
  mimeType: string;
  fileData?: string; // Base64 content
  uploadedById: string;
  uploadedByName: string;
  createdDate: string;
  customerId?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Executive' | 'Viewer';
  department: string;
  phone: string;
  attendance: Array<{ date: string; status: 'Present' | 'Absent' | 'Leave' }>;
  performanceScore: number; // out of 100
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: 'Website' | 'Phone' | 'Email' | 'Referral' | 'Campaign';
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
  notes: string;
  followUpDate: string;
  assignedEmployeeId: string;
  createdDate: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'Task Assigned' | 'Deadline Reminder' | 'Document Uploaded' | 'Customer Added' | 'System Alert';
  createdDate: string;
  read: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  timestamp: string;
  ipAddress: string;
  status: 'Success' | 'Failure';
}

export interface CompanySettings {
  companyName: string;
  logo: string;
  address: string;
  gstNumber: string;
  email: string;
  phone: string;
  timezone: string;
  currency: string;
  language: string;
}

export interface DBState {
  users: User[];
  customers: Customer[];
  tasks: Task[];
  documents: Document[];
  employees: Employee[];
  leads: Lead[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  settings: CompanySettings;
}

const DB_PATH = path.resolve(process.cwd(), 'db.json');

// Initial seed data
const initialDB: DBState = {
  users: [
    {
      id: 'usr-1',
      email: 'admin@backoffice.pro',
      name: 'Sarah Jenkins',
      role: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      passwordHash: 'password123'
    },
    {
      id: 'usr-2',
      email: 'manager@backoffice.pro',
      name: 'Michael Chen',
      role: 'Manager',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      passwordHash: 'password123'
    },
    {
      id: 'usr-3',
      email: 'executive@backoffice.pro',
      name: 'Arjun Mehta',
      role: 'Executive',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      passwordHash: 'password123'
    }
  ],
  customers: [
    {
      id: 'cust-1',
      name: 'John Doe',
      company: 'Acme Corporation',
      email: 'john.doe@acme.com',
      phone: '+1 (555) 019-2834',
      gst: '27AAAAA1111A1Z1',
      address: '120 San Francisco St, Suite 400, CA 94103',
      status: 'Active',
      assignedEmployeeId: 'usr-3',
      createdDate: '2026-02-15T10:00:00Z',
      lastUpdated: '2026-07-01T14:30:00Z',
      notes: [
        { id: 'note-1', content: 'Onboarding completed successfully.', createdBy: 'Michael Chen', date: '2026-02-16T11:00:00Z' },
        { id: 'note-2', content: 'Interested in renewing contract in Q4.', createdBy: 'Sarah Jenkins', date: '2026-06-30T16:45:00Z' }
      ]
    },
    {
      id: 'cust-2',
      name: 'Elena Rostova',
      company: 'Apex Tech Labs',
      email: 'elena@apextech.io',
      phone: '+1 (555) 048-9381',
      gst: '27BBBBB2222B2Z2',
      address: '45 Broad St, New York, NY 10004',
      status: 'Active',
      assignedEmployeeId: 'usr-2',
      createdDate: '2026-03-22T09:15:00Z',
      lastUpdated: '2026-06-25T11:20:00Z',
      notes: [
        { id: 'note-3', content: 'Requested a custom onboarding dashboard.', createdBy: 'Michael Chen', date: '2026-03-24T10:00:00Z' }
      ]
    },
    {
      id: 'cust-3',
      name: 'Marcus Aurelius',
      company: 'Roma Retail Group',
      email: 'marcus@romaretail.com',
      phone: '+1 (555) 083-1122',
      gst: '27CCCCC3333C3Z3',
      address: '500 Forum Way, Austin, TX 78701',
      status: 'Pending',
      assignedEmployeeId: 'usr-3',
      createdDate: '2026-06-18T14:00:00Z',
      lastUpdated: '2026-06-18T14:00:00Z',
      notes: []
    },
    {
      id: 'cust-4',
      name: 'Yuki Tanaka',
      company: 'Kyoto Imports',
      email: 'yuki@kyotoimports.co.jp',
      phone: '+81 90-1234-5678',
      gst: '27DDDDD4444D4Z4',
      address: '7-1 Karasuma-dori, Kyoto',
      status: 'Inactive',
      assignedEmployeeId: 'usr-3',
      createdDate: '2025-11-05T08:00:00Z',
      lastUpdated: '2026-05-10T15:00:00Z',
      notes: [
        { id: 'note-4', content: 'Account paused due to supply chain delays.', createdBy: 'Arjun Mehta', date: '2026-05-10T15:00:00Z' }
      ]
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Review Apex Contract Documents',
      description: 'Audit the signed SaaS contract and KYC papers submitted by Apex Tech Labs.',
      assignedEmployeeId: 'usr-2',
      priority: 'High',
      deadline: '2026-07-10',
      status: 'In Progress',
      attachments: [{ name: 'Apex_SaaS_Contract.pdf', size: '1.2 MB', fileId: 'doc-3' }],
      comments: [
        { id: 'tc-1', author: 'Sarah Jenkins', content: 'Please ensure we have the tax residency certificate too.', timestamp: '2026-07-04T09:30:00Z' }
      ],
      customerId: 'cust-2'
    },
    {
      id: 'task-2',
      title: 'Call Marcus for Onboarding',
      description: 'Schedule the kickoff call to set up Roma Retail Group on our platform.',
      assignedEmployeeId: 'usr-3',
      priority: 'Medium',
      deadline: '2026-07-08',
      status: 'Pending',
      attachments: [],
      comments: [],
      customerId: 'cust-3'
    },
    {
      id: 'task-3',
      title: 'Monthly Financial Audit',
      description: 'Generate reports, verify GST invoices, and close monthly accounts for June 2026.',
      assignedEmployeeId: 'usr-1',
      priority: 'Critical',
      deadline: '2026-07-05',
      status: 'Pending',
      attachments: [],
      comments: [],
    },
    {
      id: 'task-4',
      title: 'Update Onboarding Playbook',
      description: 'Incorporate new client guidelines into the customer success standard operating procedures.',
      assignedEmployeeId: 'usr-3',
      priority: 'Low',
      deadline: '2026-07-20',
      status: 'Completed',
      attachments: [],
      comments: [
        { id: 'tc-2', author: 'Arjun Mehta', content: 'Playbook updated. Version 2.1 is now live.', timestamp: '2026-07-02T16:00:00Z' }
      ]
    }
  ],
  documents: [
    {
      id: 'doc-1',
      name: 'Acme_GST_Registration.pdf',
      category: 'Business Documents',
      size: '412 KB',
      mimeType: 'application/pdf',
      uploadedById: 'usr-3',
      uploadedByName: 'Arjun Mehta',
      createdDate: '2026-02-15T10:15:00Z',
      customerId: 'cust-1'
    },
    {
      id: 'doc-2',
      name: 'Acme_Incorporation_Certificate.pdf',
      category: 'KYC',
      size: '1.4 MB',
      mimeType: 'application/pdf',
      uploadedById: 'usr-3',
      uploadedByName: 'Arjun Mehta',
      createdDate: '2026-02-15T10:20:00Z',
      customerId: 'cust-1'
    },
    {
      id: 'doc-3',
      name: 'Apex_SaaS_Contract.pdf',
      category: 'Contracts',
      size: '1.2 MB',
      mimeType: 'application/pdf',
      uploadedById: 'usr-2',
      uploadedByName: 'Michael Chen',
      createdDate: '2026-03-23T11:00:00Z',
      customerId: 'cust-2'
    }
  ],
  employees: [
    {
      id: 'usr-1',
      name: 'Sarah Jenkins',
      email: 'admin@backoffice.pro',
      role: 'Admin',
      department: 'Management',
      phone: '+1 (555) 010-2211',
      attendance: [
        { date: '2026-07-01', status: 'Present' },
        { date: '2026-07-02', status: 'Present' },
        { date: '2026-07-03', status: 'Present' },
        { date: '2026-07-04', status: 'Present' },
        { date: '2026-07-05', status: 'Present' }
      ],
      performanceScore: 98
    },
    {
      id: 'usr-2',
      name: 'Michael Chen',
      email: 'manager@backoffice.pro',
      role: 'Manager',
      department: 'Customer Success',
      phone: '+1 (555) 012-3456',
      attendance: [
        { date: '2026-07-01', status: 'Present' },
        { date: '2026-07-02', status: 'Present' },
        { date: '2026-07-03', status: 'Present' },
        { date: '2026-07-04', status: 'Present' },
        { date: '2026-07-05', status: 'Present' }
      ],
      performanceScore: 92
    },
    {
      id: 'usr-3',
      name: 'Arjun Mehta',
      email: 'executive@backoffice.pro',
      role: 'Executive',
      department: 'Sales & Support',
      phone: '+1 (555) 015-7788',
      attendance: [
        { date: '2026-07-01', status: 'Present' },
        { date: '2026-07-02', status: 'Present' },
        { date: '2026-07-03', status: 'Leave' },
        { date: '2026-07-04', status: 'Present' },
        { date: '2026-07-05', status: 'Present' }
      ],
      performanceScore: 89
    }
  ],
  leads: [
    {
      id: 'lead-1',
      name: 'Alice Johnson',
      company: 'Zenith Retailers',
      email: 'alice@zenithretail.com',
      phone: '+1 (555) 013-4411',
      source: 'Website',
      status: 'Qualified',
      notes: 'Demo booked for next week. Highly interested in standard plan.',
      followUpDate: '2026-07-12',
      assignedEmployeeId: 'usr-3',
      createdDate: '2026-06-28T09:00:00Z'
    },
    {
      id: 'lead-2',
      name: 'Robert Garcia',
      company: 'Garcia Logistics LLC',
      email: 'robert@garcialogistics.net',
      phone: '+1 (555) 014-9988',
      source: 'Referral',
      status: 'Contacted',
      notes: 'Initial phone screening done. Sent brochures.',
      followUpDate: '2026-07-07',
      assignedEmployeeId: 'usr-3',
      createdDate: '2026-07-01T11:30:00Z'
    },
    {
      id: 'lead-3',
      name: 'Charlotte Dubois',
      company: 'Dubois Fine Wines',
      email: 'charlotte@duboiswines.fr',
      phone: '+33 6 1234 5678',
      source: 'Campaign',
      status: 'New',
      notes: 'Inbound lead from the summer enterprise campaign. Needs discovery call.',
      followUpDate: '2026-07-09',
      assignedEmployeeId: 'usr-2',
      createdDate: '2026-07-04T15:20:00Z'
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      title: 'Critical Task Overdue',
      message: 'Financial Audit deadline is today! Please complete it.',
      type: 'Deadline Reminder',
      createdDate: '2026-07-05T08:00:00Z',
      read: false
    },
    {
      id: 'notif-2',
      title: 'New Customer Registered',
      message: 'Roma Retail Group (Marcus Aurelius) registered. Needs executive approval.',
      type: 'Customer Added',
      createdDate: '2026-06-18T14:00:00Z',
      read: true
    },
    {
      id: 'notif-3',
      title: 'SaaS Contract Uploaded',
      message: 'Michael Chen uploaded Apex_SaaS_Contract.pdf for Apex Tech Labs.',
      type: 'Document Uploaded',
      createdDate: '2026-03-23T11:05:00Z',
      read: true
    }
  ],
  activityLogs: [
    {
      id: 'log-1',
      userId: 'usr-1',
      userName: 'Sarah Jenkins',
      action: 'User Logged In',
      module: 'Authentication',
      timestamp: '2026-07-05T08:15:00Z',
      ipAddress: '192.168.1.104',
      status: 'Success'
    },
    {
      id: 'log-2',
      userId: 'usr-2',
      userName: 'Michael Chen',
      action: 'Comment added on Task Review Apex Contract',
      module: 'Tasks',
      timestamp: '2026-07-04T09:30:00Z',
      ipAddress: '192.168.1.51',
      status: 'Success'
    },
    {
      id: 'log-3',
      userId: 'usr-3',
      userName: 'Arjun Mehta',
      action: 'Lead Robert Garcia created',
      module: 'Leads',
      timestamp: '2026-07-01T11:32:00Z',
      ipAddress: '192.168.1.80',
      status: 'Success'
    }
  ],
  settings: {
    companyName: 'BackOffice Pro Technologies',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100',
    address: '404 Enterprise Way, Suite 800, Silicon Valley, CA 94025',
    gstNumber: '27AAAAA1111A1Z1',
    email: 'operations@backoffice.pro',
    phone: '+1 (800) 555-0100',
    timezone: 'UTC',
    currency: 'USD ($)',
    language: 'English (US)'
  }
};

class DBStore {
  private state: DBState;

  constructor() {
    this.state = { ...initialDB };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        // Merge with initial to ensure structures are present
        this.state = {
          users: parsed.users || initialDB.users,
          customers: parsed.customers || initialDB.customers,
          tasks: parsed.tasks || initialDB.tasks,
          documents: parsed.documents || initialDB.documents,
          employees: parsed.employees || initialDB.employees,
          leads: parsed.leads || initialDB.leads,
          notifications: parsed.notifications || initialDB.notifications,
          activityLogs: parsed.activityLogs || initialDB.activityLogs,
          settings: parsed.settings || initialDB.settings
        };
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Error loading DB file, fallback to initialDB:', e);
      this.state = { ...initialDB };
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing DB file:', e);
    }
  }

  // Getters
  public getUsers() { return this.state.users; }
  public getCustomers() { return this.state.customers; }
  public getTasks() { return this.state.tasks; }
  public getDocuments() { return this.state.documents; }
  public getEmployees() { return this.state.employees; }
  public getLeads() { return this.state.leads; }
  public getNotifications() { return this.state.notifications; }
  public getActivityLogs() { return this.state.activityLogs; }
  public getSettings() { return this.state.settings; }

  // Setters/Mutations
  public setCustomers(customers: Customer[]) {
    this.state.customers = customers;
    this.save();
  }

  public setTasks(tasks: Task[]) {
    this.state.tasks = tasks;
    this.save();
  }

  public setDocuments(docs: Document[]) {
    this.state.documents = docs;
    this.save();
  }

  public setEmployees(employees: Employee[]) {
    this.state.employees = employees;
    this.save();
  }

  public setLeads(leads: Lead[]) {
    this.state.leads = leads;
    this.save();
  }

  public setNotifications(notifications: Notification[]) {
    this.state.notifications = notifications;
    this.save();
  }

  public setActivityLogs(logs: ActivityLog[]) {
    this.state.activityLogs = logs;
    this.save();
  }

  public updateSettings(settings: CompanySettings) {
    this.state.settings = settings;
    this.save();
  }

  public logActivity(userId: string, userName: string, action: string, module: string, status: 'Success' | 'Failure' = 'Success') {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId,
      userName,
      action,
      module,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1', // Placeholder IP
      status
    };
    this.state.activityLogs.unshift(newLog);
    // limit logs to 50
    if (this.state.activityLogs.length > 50) {
      this.state.activityLogs.pop();
    }
    this.save();
  }

  public addNotification(title: string, message: string, type: Notification['type']) {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      createdDate: new Date().toISOString(),
      read: false
    };
    this.state.notifications.unshift(newNotif);
    this.save();
  }
}

export const dbStore = new DBStore();
