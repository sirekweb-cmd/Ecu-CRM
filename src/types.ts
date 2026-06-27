export type ClientStatus = 'nuevo lead' | 'en desarrollo' | 'cobrado' | 'finalizado';

export type ProjectStatus = 'En Planificación' | 'En Progreso' | 'Completado' | 'planning' | 'ongoing' | 'testing' | 'completed';

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName?: string;
  department?: string; // Herramientas | Materiales | Eléctrico
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  budget: number;
  progress: number;
  description: string;
  tasks?: ProjectTask[];
  assignedTo?: string;
}

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
  department?: string; // Herramientas | Materiales | Eléctrico
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
  username?: string;
  email: string;
  role: string;
  department?: string; // Herramientas | Materiales | Eléctrico | Global
  avatarUrl?: string;
  password?: string;
  phone?: string;
}

export interface InvoiceItem {
  id?: string;
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
  discount: number;
  taxRate: number; // e.g. 0.15 for IVA 15% in Ecuador
  taxAmount: number;
  retenciones: number;
  total: number;
  status: 'draft' | 'pending' | 'authorized' | 'rejected';
  type: 'invoice' | 'quote';
  department?: string;
  paymentCondition?: string; // Efectivo | Contraentrega | Tarjeta
  sriAccessKey?: string;
  sriMessage?: string;
}

export interface ProductLot {
  id: string;
  productId: string;
  lotNumber: string;
  quantity: number;
  expirationDate: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string; // Subcategoría
  sku: string;
  costPrice: number; // Modificado de cost a costPrice para consistencia con DB
  unitPrice: number;
  discount: number;
  stock: number;
  lowStockThreshold: number; // Agregado
  weight?: number;
  dimensions?: string; // Simplificado a string para alinear con DB
  imageUrl?: string;
  department: string; // Materiales | Oficina | Florería | Laboratorio
  isPublic?: boolean;
  providerId?: string;
}

export interface FiscalSettings {
  nombreComercial: string;
  slogan: string;
  ruc: string;
  telefono: string;
  direccion: string;
  firmaElectronica: string;
  botSriUrl?: string;
}

export interface Provider {
  id: string;
  ruc: string;
  nombre_empresa: string;
  condiciones_pago: string;
  telefono: string;
  email: string;
  department: string;
  logo_url?: string;
}