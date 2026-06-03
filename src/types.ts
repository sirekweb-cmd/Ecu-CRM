export type ClientStatus = 'initial' | 'development' | 'billed' | 'finished';

export interface TimelineEvent {
  id: string;
  title: string;
  content: string;
  date: string;
  addedBy?: string;
  type: 'note' | 'status' | 'call';
}

export interface Client {
  id: string;
  name: string;
  representative: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  serviceType: string;
  status: ClientStatus;
  lastContact: string;
  initials: string;
  ruc: string;
  address?: string;
  notes?: string;
  timeline: TimelineEvent[];
}

export interface ActivityLog {
  id: string;
  title: string;
  detail: string;
  time: string;
  author: string;
  type: 'register' | 'payment' | 'proposal' | 'complete';
  statusLabel?: string;
  statusType?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  password?: string;
  phone?: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: 'planning' | 'ongoing' | 'testing' | 'completed';
  progress: number;
  tasks: ProjectTask[];
  assignedTo: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientRuc: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // e.g. 0.15 for IVA 15% in Ecuador
  taxAmount: number;
  total: number;
  status: 'draft' | 'pending' | 'authorized' | 'rejected';
  sriAccessKey?: string;
  sriMessage?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  unitPrice: number;
}

export interface FiscalSettings {
  nombreComercial: string;
  slogan: string;
  ruc: string;
  telefono: string;
  direccion: string;
  firmaElectronica: string;
}

