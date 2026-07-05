export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Executive' | 'Viewer';
  avatar?: string;
}

export interface Note {
  id: string;
  content: string;
  createdBy: string;
  date: string;
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
  notes: Note[];
}

export interface TaskComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface TaskAttachment {
  name: string;
  size: string;
  fileId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedEmployeeId: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  deadline: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'Overdue';
  attachments: TaskAttachment[];
  comments: TaskComment[];
  customerId?: string;
}

export interface Document {
  id: string;
  name: string;
  category: 'KYC' | 'Invoices' | 'Contracts' | 'Identity Proof' | 'Business Documents' | 'Others';
  size: string;
  mimeType: string;
  uploadedById: string;
  uploadedByName: string;
  createdDate: string;
  customerId?: string;
  fileData?: string; // Optional loaded content
}

export interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Executive' | 'Viewer';
  department: string;
  phone: string;
  attendance: AttendanceRecord[];
  performanceScore: number;
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

export interface KPIStats {
  totalCustomers: number;
  activeCustomers: number;
  pendingTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalLeads: number;
  convertedLeads: number;
  documentsUploaded: number;
  estimatedRevenue: number;
}

export interface ChartDataPoint {
  name: string;
  count?: number;
  revenue?: number;
  value?: number;
}

export interface ReportStats {
  kpis: KPIStats;
  charts: {
    customerGrowth: ChartDataPoint[];
    revenueTrends: ChartDataPoint[];
    taskCompletion: ChartDataPoint[];
  };
}
