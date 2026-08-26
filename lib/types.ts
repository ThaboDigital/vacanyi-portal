// Vacanyi Building Contractor Management Portal Types

export type ClientType = 'residential' | 'commercial' | 'developer' | 'subcontractor';
export type ClientStatus = 'active' | 'lead' | 'archived';

export interface Client {
  id: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  whatsappPhone: string;
  physicalAddress: string;
  idOrRegistrationNumber?: string;
  clientType: ClientType;
  status: ClientStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectType = 'new_build' | 'residential' | 'renovation' | 'roofing' | 'commercial' | 'structural';
export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'snagging' | 'completed';

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'certified';

export interface ProjectMilestone {
  id: string;
  projectId: string;
  orderIndex: number;
  title: string;
  description?: string;
  status: MilestoneStatus;
  percentageOfContract: number;
  amount: number;
  targetDate?: string;
  completedDate?: string;
  certifiedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  projectCode: string;
  description?: string;
  siteAddress: string;
  projectType: ProjectType;
  status: ProjectStatus;
  contractValue: number;
  startDate?: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  progressPercentage: number;
  siteForeman?: string;
  notes?: string;
  milestones?: ProjectMilestone[];
  createdAt: string;
  updatedAt: string;
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'invoiced' | 'expired';

export type BOQCategory = 
  | 'Preliminaries & Site Setup'
  | 'Earthworks & Excavation'
  | 'Concrete & Foundation'
  | 'Masonry & Brickwork'
  | 'Roofing & Timber Trusses'
  | 'Plumbing & Drainage'
  | 'Electrical & Lighting'
  | 'Plastering & Ceilings'
  | 'Flooring & Tiling'
  | 'Painting & Finishes'
  | 'Doors, Windows & Glazing'
  | 'External Works & Paving'
  | 'Sundries & Contingency';

export interface QuoteItem {
  id: string;
  quoteId: string;
  orderIndex: number;
  category: BOQCategory | string;
  description: string;
  unit: string;
  quantity: number;
  unitRate: number;
  totalAmount: number;
  createdAt: string;
}

export interface Quote {
  id: string;
  clientId: string;
  projectId?: string;
  quoteNumber: string;
  title: string;
  siteAddress: string;
  issueDate: string;
  expiryDate: string;
  status: QuoteStatus;
  subtotal: number;
  discountAmount: number;
  vatPercentage: number;
  vatAmount: number;
  totalAmount: number;
  scopeOfWork?: string;
  paymentScheduleTerms?: string;
  specialNotes?: string;
  items?: QuoteItem[];
  createdAt: string;
  updatedAt: string;
}

export type InvoiceType = 'tax_invoice' | 'progress_draw' | 'deposit' | 'final' | 'variation';
export type InvoiceStatus = 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  orderIndex: number;
  description: string;
  unit: string;
  quantity: number;
  unitRate: number;
  totalAmount: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  projectId?: string;
  quoteId?: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  title: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  retentionPercentage: number;
  retentionAmount: number;
  vatPercentage: number;
  vatAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentReference: string;
  notes?: string;
  items?: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'EFT' | 'Bank Deposit' | 'Cash' | 'Card' | 'Instant EFT';

export interface MilestoneReceipt {
  id: string;
  receiptNumber: string;
  clientId: string;
  projectId?: string;
  invoiceId?: string;
  paymentDate: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  bankReference?: string;
  milestoneDescription: string;
  remainingProjectBalance: number;
  receivedBy: string;
  notes?: string;
  createdAt: string;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  shortName: string;
  tagline: string;
  registrationNumber: string;
  taxNumber: string;
  vatNumber: string;
  nhbrcNumber: string;
  phone: string;
  whatsappPhone: string;
  email: string;
  website: string;
  address: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  branchCode: string;
  swiftCode: string;
  vatPercentage: number;
  isVatRegistered: boolean;
  defaultQuoteValidityDays: number;
  defaultInvoiceTermsDays: number;
  defaultQuoteTerms: string;
  defaultInvoiceTerms: string;
  signatureDataUrl?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  details?: Record<string, unknown>;
  createdAt: string;
}
