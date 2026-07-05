import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { dbStore, Customer, Task, Document, Employee, Lead } from './server/dbStore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable large JSON bodies for base64 file uploads
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Lazy loading of Gemini Client
let aiClient: GoogleGenAI | null = null;

function getAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY is not configured in the environment.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Ensure upload directory exists
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// API Routes

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const users = dbStore.getUsers();
  const user = users.find(u => u.email === email && u.passwordHash === password);

  if (user) {
    const { passwordHash, ...userResponse } = user;
    dbStore.logActivity(user.id, user.name, 'Logged in successfully', 'Authentication');
    res.json({ success: true, user: userResponse });
  } else {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
});

// Customers CRUD
app.get('/api/customers', (req, res) => {
  res.json(dbStore.getCustomers());
});

app.post('/api/customers', (req, res) => {
  const { name, company, email, phone, gst, address, assignedEmployeeId, userId, userName } = req.body;
  const customers = dbStore.getCustomers();
  
  const newCustomer: Customer = {
    id: `cust-${Date.now()}`,
    name: name || 'New Customer',
    company: company || 'Self Employed',
    email: email || '',
    phone: phone || '',
    gst: gst || '',
    address: address || '',
    status: 'Active',
    assignedEmployeeId: assignedEmployeeId || 'usr-3',
    createdDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    notes: []
  };

  customers.push(newCustomer);
  dbStore.setCustomers(customers);
  
  dbStore.logActivity(userId || 'system', userName || 'System', `Created customer ${newCustomer.name}`, 'Customers');
  dbStore.addNotification('New Customer Registered', `${newCustomer.name} (${newCustomer.company}) has been added.`, 'Customer Added');

  res.status(201).json(newCustomer);
});

app.put('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { userId, userName, ...customerUpdates } = updates;
  const customers = dbStore.getCustomers();
  const idx = customers.findIndex(c => c.id === id);

  if (idx !== -1) {
    customers[idx] = {
      ...customers[idx],
      ...customerUpdates,
      lastUpdated: new Date().toISOString()
    };
    dbStore.setCustomers(customers);
    dbStore.logActivity(userId || 'system', userName || 'System', `Updated customer details for ${customers[idx].name}`, 'Customers');
    res.json(customers[idx]);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.query;
  const customers = dbStore.getCustomers();
  const idx = customers.findIndex(c => c.id === id);

  if (idx !== -1) {
    const deleted = customers.splice(idx, 1)[0];
    dbStore.setCustomers(customers);
    dbStore.logActivity((userId as string) || 'system', (userName as string) || 'System', `Deleted customer ${deleted.name}`, 'Customers');
    res.json({ success: true, deletedId: id });
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
});

app.post('/api/customers/:id/notes', (req, res) => {
  const { id } = req.params;
  const { content, createdBy, userId } = req.body;
  const customers = dbStore.getCustomers();
  const idx = customers.findIndex(c => c.id === id);

  if (idx !== -1) {
    const newNote = {
      id: `note-${Date.now()}`,
      content,
      createdBy: createdBy || 'System',
      date: new Date().toISOString()
    };
    customers[idx].notes.push(newNote);
    customers[idx].lastUpdated = new Date().toISOString();
    dbStore.setCustomers(customers);
    dbStore.logActivity(userId || 'system', createdBy || 'System', `Added note to customer ${customers[idx].name}`, 'Customers');
    res.json(newNote);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
});

// Tasks CRUD
app.get('/api/tasks', (req, res) => {
  res.json(dbStore.getTasks());
});

app.post('/api/tasks', (req, res) => {
  const { title, description, assignedEmployeeId, priority, deadline, customerId, userId, userName } = req.body;
  const tasks = dbStore.getTasks();

  const newTask: Task = {
    id: `task-${Date.now()}`,
    title: title || 'Untitled Task',
    description: description || '',
    assignedEmployeeId: assignedEmployeeId || 'usr-3',
    priority: priority || 'Medium',
    deadline: deadline || new Date().toISOString().split('T')[0],
    status: 'Pending',
    attachments: [],
    comments: [],
    customerId: customerId || undefined
  };

  tasks.push(newTask);
  dbStore.setTasks(tasks);

  dbStore.logActivity(userId || 'system', userName || 'System', `Created task: ${newTask.title}`, 'Tasks');
  dbStore.addNotification('Task Assigned', `New task "${newTask.title}" assigned to you.`, 'Task Assigned');

  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { userId, userName, ...taskUpdates } = updates;
  const tasks = dbStore.getTasks();
  const idx = tasks.findIndex(t => t.id === id);

  if (idx !== -1) {
    tasks[idx] = {
      ...tasks[idx],
      ...taskUpdates
    };
    dbStore.setTasks(tasks);
    dbStore.logActivity(userId || 'system', userName || 'System', `Updated task: ${tasks[idx].title}`, 'Tasks');
    res.json(tasks[idx]);
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.query;
  const tasks = dbStore.getTasks();
  const idx = tasks.findIndex(t => t.id === id);

  if (idx !== -1) {
    const deleted = tasks.splice(idx, 1)[0];
    dbStore.setTasks(tasks);
    dbStore.logActivity((userId as string) || 'system', (userName as string) || 'System', `Deleted task: ${deleted.title}`, 'Tasks');
    res.json({ success: true });
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

app.post('/api/tasks/:id/comments', (req, res) => {
  const { id } = req.params;
  const { content, author, userId } = req.body;
  const tasks = dbStore.getTasks();
  const idx = tasks.findIndex(t => t.id === id);

  if (idx !== -1) {
    const newComment = {
      id: `tc-${Date.now()}`,
      author: author || 'System',
      content,
      timestamp: new Date().toISOString()
    };
    tasks[idx].comments.push(newComment);
    dbStore.setTasks(tasks);
    dbStore.logActivity(userId || 'system', author || 'System', `Commented on task: ${tasks[idx].title}`, 'Tasks');
    res.json(newComment);
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

// Documents CRUD
app.get('/api/documents', (req, res) => {
  res.json(dbStore.getDocuments());
});

app.post('/api/documents', (req, res) => {
  const { name, category, fileData, mimeType, size, uploadedById, uploadedByName, customerId } = req.body;
  const documents = dbStore.getDocuments();

  const newDoc: Document = {
    id: `doc-${Date.now()}`,
    name: name || 'Untitled Document',
    category: category || 'Others',
    size: size || 'Unknown Size',
    mimeType: mimeType || 'application/octet-stream',
    uploadedById: uploadedById || 'system',
    uploadedByName: uploadedByName || 'System',
    createdDate: new Date().toISOString(),
    customerId: customerId || undefined
  };

  // If there is real base64 file data, we could save it to disk
  if (fileData) {
    try {
      const buffer = Buffer.from(fileData, 'base64');
      fs.writeFileSync(path.join(UPLOADS_DIR, `${newDoc.id}_${newDoc.name}`), buffer);
    } catch (e) {
      console.error('Error saving uploaded file:', e);
    }
  }

  documents.push(newDoc);
  dbStore.setDocuments(documents);

  dbStore.logActivity(uploadedById || 'system', uploadedByName || 'System', `Uploaded document ${newDoc.name}`, 'Documents');
  dbStore.addNotification('Document Uploaded', `${newDoc.name} has been uploaded to ${category}.`, 'Document Uploaded');

  res.status(201).json(newDoc);
});

app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.query;
  const documents = dbStore.getDocuments();
  const idx = documents.findIndex(d => d.id === id);

  if (idx !== -1) {
    const deleted = documents.splice(idx, 1)[0];
    dbStore.setDocuments(documents);

    // Attempt to delete from disk
    try {
      const filePath = path.join(UPLOADS_DIR, `${deleted.id}_${deleted.name}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error('Error deleting file from disk:', e);
    }

    dbStore.logActivity((userId as string) || 'system', (userName as string) || 'System', `Deleted document ${deleted.name}`, 'Documents');
    res.json({ success: true });
  } else {
    res.status(404).json({ message: 'Document not found' });
  }
});

// Employees CRUD
app.get('/api/employees', (req, res) => {
  res.json(dbStore.getEmployees());
});

app.post('/api/employees', (req, res) => {
  const { name, email, role, department, phone, userId, userName } = req.body;
  const employees = dbStore.getEmployees();

  const newEmployee: Employee = {
    id: `usr-${Date.now()}`,
    name: name || 'New Employee',
    email: email || '',
    role: role || 'Executive',
    department: department || 'Support',
    phone: phone || '',
    attendance: [
      { date: new Date().toISOString().split('T')[0], status: 'Present' }
    ],
    performanceScore: 85
  };

  employees.push(newEmployee);
  dbStore.setEmployees(employees);

  dbStore.logActivity(userId || 'system', userName || 'System', `Added employee ${newEmployee.name}`, 'Employees');
  res.status(201).json(newEmployee);
});

app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { userId, userName, ...employeeUpdates } = updates;
  const employees = dbStore.getEmployees();
  const idx = employees.findIndex(e => e.id === id);

  if (idx !== -1) {
    employees[idx] = {
      ...employees[idx],
      ...employeeUpdates
    };
    dbStore.setEmployees(employees);
    dbStore.logActivity(userId || 'system', userName || 'System', `Updated employee ${employees[idx].name}`, 'Employees');
    res.json(employees[idx]);
  } else {
    res.status(404).json({ message: 'Employee not found' });
  }
});

app.delete('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.query;
  const employees = dbStore.getEmployees();
  const idx = employees.findIndex(e => e.id === id);

  if (idx !== -1) {
    const deleted = employees.splice(idx, 1)[0];
    dbStore.setEmployees(employees);
    dbStore.logActivity((userId as string) || 'system', (userName as string) || 'System', `Deleted employee: ${deleted.name}`, 'Employees');
    res.json({ success: true });
  } else {
    res.status(404).json({ message: 'Employee not found' });
  }
});

// Leads CRUD
app.get('/api/leads', (req, res) => {
  res.json(dbStore.getLeads());
});

app.post('/api/leads', (req, res) => {
  const { name, company, email, phone, source, status, notes, followUpDate, assignedEmployeeId, userId, userName } = req.body;
  const leads = dbStore.getLeads();

  const newLead: Lead = {
    id: `lead-${Date.now()}`,
    name: name || 'New Lead',
    company: company || 'Individual',
    email: email || '',
    phone: phone || '',
    source: source || 'Website',
    status: status || 'New',
    notes: notes || '',
    followUpDate: followUpDate || new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    assignedEmployeeId: assignedEmployeeId || 'usr-3',
    createdDate: new Date().toISOString()
  };

  leads.push(newLead);
  dbStore.setLeads(leads);

  dbStore.logActivity(userId || 'system', userName || 'System', `Created Lead: ${newLead.name}`, 'Leads');
  res.status(201).json(newLead);
});

app.put('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { userId, userName, ...leadUpdates } = updates;
  const leads = dbStore.getLeads();
  const idx = leads.findIndex(l => l.id === id);

  if (idx !== -1) {
    leads[idx] = {
      ...leads[idx],
      ...leadUpdates
    };
    dbStore.setLeads(leads);
    dbStore.logActivity(userId || 'system', userName || 'System', `Updated Lead: ${leads[idx].name}`, 'Leads');
    res.json(leads[idx]);
  } else {
    res.status(404).json({ message: 'Lead not found' });
  }
});

app.delete('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.query;
  const leads = dbStore.getLeads();
  const idx = leads.findIndex(l => l.id === id);

  if (idx !== -1) {
    const deleted = leads.splice(idx, 1)[0];
    dbStore.setLeads(leads);
    dbStore.logActivity((userId as string) || 'system', (userName as string) || 'System', `Deleted Lead: ${deleted.name}`, 'Leads');
    res.json({ success: true });
  } else {
    res.status(404).json({ message: 'Lead not found' });
  }
});

// Notifications API
app.get('/api/notifications', (req, res) => {
  res.json(dbStore.getNotifications());
});

app.post('/api/notifications/read-all', (req, res) => {
  const notifs = dbStore.getNotifications().map(n => ({ ...n, read: true }));
  dbStore.setNotifications(notifs);
  res.json({ success: true });
});

app.post('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const notifs = dbStore.getNotifications();
  const idx = notifs.findIndex(n => n.id === id);
  if (idx !== -1) {
    notifs[idx].read = true;
    dbStore.setNotifications(notifs);
    res.json({ success: true });
  } else {
    res.status(404).json({ message: 'Notification not found' });
  }
});

// Activity Logs API
app.get('/api/activity-logs', (req, res) => {
  res.json(dbStore.getActivityLogs());
});

// Settings API
app.get('/api/settings', (req, res) => {
  res.json(dbStore.getSettings());
});

app.put('/api/settings', (req, res) => {
  const updates = req.body;
  const { userId, userName, ...settingsUpdates } = updates;
  dbStore.updateSettings(settingsUpdates);
  dbStore.logActivity(userId || 'system', userName || 'System', 'Updated company settings', 'Settings');
  res.json(dbStore.getSettings());
});

// Reports & Statistics
app.get('/api/reports/stats', (req, res) => {
  const customers = dbStore.getCustomers();
  const tasks = dbStore.getTasks();
  const leads = dbStore.getLeads();
  const docs = dbStore.getDocuments();

  // Basic counters
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'Completed' || t.status === 'Cancelled') return false;
    return new Date(t.deadline) < new Date();
  }).length;

  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.status === 'Converted').length;
  const documentsUploaded = docs.length;

  // Monthly Revenue estimation (synthetic representation based on customer records)
  const estimatedRevenue = activeCustomers * 1500; // Mock SaaS calculation ($1500 per customer)

  // Monthly breakdown for visual charts
  const customerGrowth = [
    { name: 'Jan', count: Math.max(1, totalCustomers - 3) },
    { name: 'Feb', count: Math.max(1, totalCustomers - 2) },
    { name: 'Mar', count: Math.max(2, totalCustomers - 1) },
    { name: 'Apr', count: Math.max(2, totalCustomers - 1) },
    { name: 'May', count: totalCustomers },
    { name: 'Jun', count: totalCustomers }
  ];

  const revenueTrends = [
    { name: 'Jan', revenue: (totalCustomers - 3) * 1400 },
    { name: 'Feb', revenue: (totalCustomers - 2) * 1450 },
    { name: 'Mar', revenue: (totalCustomers - 1) * 1450 },
    { name: 'Apr', revenue: (totalCustomers - 1) * 1500 },
    { name: 'May', revenue: totalCustomers * 1480 },
    { name: 'Jun', revenue: estimatedRevenue }
  ];

  res.json({
    kpis: {
      totalCustomers,
      activeCustomers,
      pendingTasks,
      completedTasks,
      overdueTasks,
      totalLeads,
      convertedLeads,
      documentsUploaded,
      estimatedRevenue
    },
    charts: {
      customerGrowth,
      revenueTrends,
      taskCompletion: [
        { name: 'Completed', value: completedTasks },
        { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length },
        { name: 'Pending', value: tasks.filter(t => t.status === 'Pending').length },
        { name: 'Overdue', value: overdueTasks }
      ]
    }
  });
});

// AI Executive Report Generator (using Gemini)
app.post('/api/reports/ai-summary', async (req, res) => {
  try {
    const customers = dbStore.getCustomers();
    const tasks = dbStore.getTasks();
    const leads = dbStore.getLeads();
    const employees = dbStore.getEmployees();

    const activeCustomerCount = customers.filter(c => c.status === 'Active').length;
    const pendingTaskCount = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
    const completedTaskCount = tasks.filter(t => t.status === 'Completed').length;
    const convertedLeadsCount = leads.filter(l => l.status === 'Converted').length;
    const newLeadsCount = leads.filter(l => l.status === 'New').length;

    const dataPayload = {
      customersCount: customers.length,
      activeCustomers: activeCustomerCount,
      totalTasks: tasks.length,
      pendingTasks: pendingTaskCount,
      completedTasks: completedTaskCount,
      totalLeads: leads.length,
      convertedLeads: convertedLeadsCount,
      newLeads: newLeadsCount,
      employeeCount: employees.length
    };

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are an enterprise AI back-office analytics consultant. Analyze the following real-time operations data from "BackOffice Pro":
${JSON.stringify(dataPayload, null, 2)}

Provide a concise, professional, commercial executive-grade operations review. Write 2-3 short, highly actionable paragraphs covering:
1. Operational efficiency and bottlenecks (e.g., tasks backlog vs workforce scale).
2. Lead conversion analytics and opportunities.
3. Strategic recommendations to improve customer success, and employee allocations.
Use elegant, professional, corporate business language. Avoid code details, formatting markers, or conversational chat prefixes. Go straight to the report.`,
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error('AI Summary Error:', error);
    res.status(500).json({ 
      error: 'AI summary could not be generated.', 
      details: error.message || 'Check your GEMINI_API_KEY settings.' 
    });
  }
});

// CSV Import/Export
app.post('/api/customers/import', (req, res) => {
  const { csvText, userId, userName } = req.body;
  if (!csvText) {
    return res.status(400).json({ message: 'No CSV content provided.' });
  }

  try {
    const lines = csvText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
    if (lines.length <= 1) {
      return res.status(400).json({ message: 'Empty or invalid CSV file.' });
    }

    const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
    const customers = dbStore.getCustomers();
    let importCount = 0;

    for (let i = 1; i < lines.length; i++) {
      // Regex to handle commas inside quotes if any, simple split for now
      const values = lines[i].split(',').map((v: string) => v.trim().replace(/^"|"$/g, ''));
      if (values.length < headers.length) continue;

      const nameIdx = headers.indexOf('name');
      const companyIdx = headers.indexOf('company');
      const emailIdx = headers.indexOf('email');
      const phoneIdx = headers.indexOf('phone');
      const gstIdx = headers.indexOf('gst');
      const addressIdx = headers.indexOf('address');

      if (nameIdx === -1) continue;

      const newCust: Customer = {
        id: `cust-${Date.now()}-${i}`,
        name: values[nameIdx] || 'Imported Customer',
        company: companyIdx !== -1 ? values[companyIdx] : 'N/A',
        email: emailIdx !== -1 ? values[emailIdx] : '',
        phone: phoneIdx !== -1 ? values[phoneIdx] : '',
        gst: gstIdx !== -1 ? values[gstIdx] : '',
        address: addressIdx !== -1 ? values[addressIdx] : '',
        status: 'Active',
        assignedEmployeeId: 'usr-3',
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        notes: []
      };

      customers.push(newCust);
      importCount++;
    }

    if (importCount > 0) {
      dbStore.setCustomers(customers);
      dbStore.logActivity(userId || 'system', userName || 'System', `Imported ${importCount} customers via CSV`, 'Customers');
      dbStore.addNotification('CSV Import Completed', `Successfully imported ${importCount} new customer profiles.`, 'Customer Added');
    }

    res.json({ success: true, count: importCount });
  } catch (e: any) {
    res.status(500).json({ message: 'Failed to process CSV file.', error: e.message });
  }
});

// Configure Vite integration
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  // Serve static assets from production build folder
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[BackOffice Pro Server] Online and listening on port ${PORT}`);
});
