'use client';

import {
  Client,
  Project,
  ProjectMilestone,
  Quote,
  QuoteItem,
  Invoice,
  InvoiceItem,
  MilestoneReceipt,
  CompanySettings,
} from '../types';
import {
  initialCompanySettings,
  initialClients,
  initialProjects,
  initialMilestones,
  initialQuotes,
  initialQuoteItems,
  initialInvoices,
  initialInvoiceItems,
  initialReceipts,
} from './mock-data';

const STORAGE_KEYS = {
  SETTINGS: 'vacanyi_portal_settings_v4',
  CLIENTS: 'vacanyi_portal_clients_v4',
  PROJECTS: 'vacanyi_portal_projects_v4',
  MILESTONES: 'vacanyi_portal_milestones_v4',
  QUOTES: 'vacanyi_portal_quotes_v4',
  QUOTE_ITEMS: 'vacanyi_portal_quote_items_v4',
  INVOICES: 'vacanyi_portal_invoices_v4',
  INVOICE_ITEMS: 'vacanyi_portal_invoice_items_v4',
  RECEIPTS: 'vacanyi_portal_receipts_v4',
};

function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for cross-component reactivity
    window.dispatchEvent(new Event('vacanyi-data-changed'));
  } catch (err) {
    console.error(`Error writing localStorage key "${key}":`, err);
  }
}

export class DataStore {
  // Settings
  static getSettings(): CompanySettings {
    return getStored<CompanySettings>(STORAGE_KEYS.SETTINGS, initialCompanySettings);
  }

  static updateSettings(updates: Partial<CompanySettings>): CompanySettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    setStored(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  // Clients
  static getClients(): Client[] {
    const clients = getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
    if (!clients || clients.length === 0) {
      if (initialClients.length > 0) {
        setStored(STORAGE_KEYS.CLIENTS, initialClients);
        return initialClients;
      }
    }
    return clients;
  }

  static getClientById(id: string): Client | undefined {
    return this.getClients().find((c) => c.id === id);
  }

  static saveClient(client: Partial<Client> & { name: string; phone: string }): Client {
    const clients = this.getClients();
    const now = new Date().toISOString();
    let saved: Client;

    if (client.id) {
      const idx = clients.findIndex((c) => c.id === client.id);
      if (idx >= 0) {
        saved = { ...clients[idx], ...client, updatedAt: now };
        clients[idx] = saved;
      } else {
        saved = {
          id: client.id,
          name: client.name,
          companyName: client.companyName || '',
          email: client.email || '',
          phone: client.phone,
          whatsappPhone: client.whatsappPhone || client.phone.replace(/[^0-9]/g, ''),
          physicalAddress: client.physicalAddress || '',
          idOrRegistrationNumber: client.idOrRegistrationNumber || '',
          clientType: client.clientType || 'residential',
          status: client.status || 'active',
          notes: client.notes || '',
          createdAt: now,
          updatedAt: now,
        };
        clients.unshift(saved);
      }
    } else {
      saved = {
        id: `cli-${Date.now()}`,
        name: client.name,
        companyName: client.companyName || '',
        email: client.email || '',
        phone: client.phone,
        whatsappPhone: client.whatsappPhone || client.phone.replace(/[^0-9]/g, ''),
        physicalAddress: client.physicalAddress || '',
        idOrRegistrationNumber: client.idOrRegistrationNumber || '',
        clientType: client.clientType || 'residential',
        status: client.status || 'active',
        notes: client.notes || '',
        createdAt: now,
        updatedAt: now,
      };
      clients.unshift(saved);
    }

    setStored(STORAGE_KEYS.CLIENTS, clients);
    return saved;
  }

  static deleteClient(id: string): void {
    const clients = this.getClients().filter((c) => c.id !== id);
    setStored(STORAGE_KEYS.CLIENTS, clients);
  }

  // Projects
  static getProjects(): Project[] {
    const projects = getStored<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
    const milestones = this.getMilestones();
    return projects.map((p) => ({
      ...p,
      milestones: milestones.filter((m) => m.projectId === p.id).sort((a, b) => a.orderIndex - b.orderIndex),
    }));
  }

  static getProjectById(id: string): Project | undefined {
    return this.getProjects().find((p) => p.id === id);
  }

  static saveProject(project: Partial<Project> & { title: string; clientId: string; siteAddress: string }): Project {
    const projects = getStored<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
    const now = new Date().toISOString();
    let saved: Project;

    if (project.id) {
      const idx = projects.findIndex((p) => p.id === project.id);
      if (idx >= 0) {
        saved = { ...projects[idx], ...project, updatedAt: now };
        projects[idx] = saved;
      } else {
        saved = {
          id: project.id,
          clientId: project.clientId,
          title: project.title,
          projectCode: project.projectCode || `VAC-PRJ-${new Date().getFullYear()}-${String(projects.length + 1).padStart(3, '0')}`,
          description: project.description || '',
          siteAddress: project.siteAddress,
          projectType: project.projectType || 'residential',
          status: project.status || 'in_progress',
          contractValue: project.contractValue || 0,
          startDate: project.startDate || now.split('T')[0],
          estimatedCompletionDate: project.estimatedCompletionDate,
          actualCompletionDate: project.actualCompletionDate,
          progressPercentage: project.progressPercentage || 0,
          siteForeman: project.siteForeman || '',
          notes: project.notes || '',
          createdAt: now,
          updatedAt: now,
        };
        projects.unshift(saved);
      }
    } else {
      saved = {
        id: `prj-${Date.now()}`,
        clientId: project.clientId,
        title: project.title,
        projectCode: project.projectCode || `VAC-PRJ-${new Date().getFullYear()}-${String(projects.length + 1).padStart(3, '0')}`,
        description: project.description || '',
        siteAddress: project.siteAddress,
        projectType: project.projectType || 'residential',
        status: project.status || 'in_progress',
        contractValue: project.contractValue || 0,
        startDate: project.startDate || now.split('T')[0],
        estimatedCompletionDate: project.estimatedCompletionDate,
        actualCompletionDate: project.actualCompletionDate,
        progressPercentage: project.progressPercentage || 0,
        siteForeman: project.siteForeman || '',
        notes: project.notes || '',
        createdAt: now,
        updatedAt: now,
      };
      projects.unshift(saved);
    }

    setStored(STORAGE_KEYS.PROJECTS, projects);
    return saved;
  }

  static deleteProject(id: string): void {
    const projects = getStored<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects).filter((p) => p.id !== id);
    setStored(STORAGE_KEYS.PROJECTS, projects);
  }

  // Milestones
  static getMilestones(): ProjectMilestone[] {
    return getStored<ProjectMilestone[]>(STORAGE_KEYS.MILESTONES, initialMilestones);
  }

  static getMilestonesByProjectId(projectId: string): ProjectMilestone[] {
    return this.getMilestones()
      .filter((m) => m.projectId === projectId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  static saveMilestone(milestone: Partial<ProjectMilestone> & { projectId: string; title: string }): ProjectMilestone {
    const milestones = this.getMilestones();
    const now = new Date().toISOString();
    let saved: ProjectMilestone;

    if (milestone.id) {
      const idx = milestones.findIndex((m) => m.id === milestone.id);
      if (idx >= 0) {
        saved = { ...milestones[idx], ...milestone, updatedAt: now };
        milestones[idx] = saved;
      } else {
        saved = {
          id: milestone.id,
          projectId: milestone.projectId,
          orderIndex: milestone.orderIndex || 1,
          title: milestone.title,
          description: milestone.description || '',
          status: milestone.status || 'pending',
          percentageOfContract: milestone.percentageOfContract || 0,
          amount: milestone.amount || 0,
          targetDate: milestone.targetDate,
          completedDate: milestone.completedDate,
          certifiedBy: milestone.certifiedBy,
          notes: milestone.notes || '',
          createdAt: now,
          updatedAt: now,
        };
        milestones.push(saved);
      }
    } else {
      saved = {
        id: `mls-${Date.now()}`,
        projectId: milestone.projectId,
        orderIndex: milestone.orderIndex || (this.getMilestonesByProjectId(milestone.projectId).length + 1),
        title: milestone.title,
        description: milestone.description || '',
        status: milestone.status || 'pending',
        percentageOfContract: milestone.percentageOfContract || 0,
        amount: milestone.amount || 0,
        targetDate: milestone.targetDate,
        completedDate: milestone.completedDate,
        certifiedBy: milestone.certifiedBy,
        notes: milestone.notes || '',
        createdAt: now,
        updatedAt: now,
      };
      milestones.push(saved);
    }

    setStored(STORAGE_KEYS.MILESTONES, milestones);
    this.recalculateProjectProgress(milestone.projectId);
    return saved;
  }

  static deleteMilestone(id: string): void {
    const milestones = this.getMilestones();
    const target = milestones.find((m) => m.id === id);
    const updated = milestones.filter((m) => m.id !== id);
    setStored(STORAGE_KEYS.MILESTONES, updated);
    if (target) {
      this.recalculateProjectProgress(target.projectId);
    }
  }

  static recalculateProjectProgress(projectId: string): void {
    const project = this.getProjectById(projectId);
    if (!project) return;
    const projectMilestones = this.getMilestonesByProjectId(projectId);
    if (projectMilestones.length === 0) return;

    const completed = projectMilestones.filter((m) => m.status === 'completed' || m.status === 'certified');
    const totalPercentage = completed.reduce((sum, m) => sum + (m.percentageOfContract || 0), 0);
    const calculatedProgress = Math.min(100, Math.round(totalPercentage));

    this.saveProject({
      ...project,
      progressPercentage: calculatedProgress,
      status: calculatedProgress === 100 ? 'completed' : project.status,
    });
  }

  // Quotes
  static getQuotes(): Quote[] {
    const quotes = getStored<Quote[]>(STORAGE_KEYS.QUOTES, initialQuotes);
    const items = this.getQuoteItems();
    return quotes.map((q) => ({
      ...q,
      items: items.filter((i) => i.quoteId === q.id).sort((a, b) => a.orderIndex - b.orderIndex),
    }));
  }

  static getQuoteById(id: string): Quote | undefined {
    return this.getQuotes().find((q) => q.id === id);
  }

  static getQuoteItems(): QuoteItem[] {
    return getStored<QuoteItem[]>(STORAGE_KEYS.QUOTE_ITEMS, initialQuoteItems);
  }

  static saveQuote(
    quote: Partial<Quote> & { clientId: string; title: string; siteAddress: string },
    items: Array<Omit<QuoteItem, 'id' | 'quoteId' | 'createdAt' | 'orderIndex'> & { id?: string; orderIndex?: number }>
  ): Quote {
    const quotes = getStored<Quote[]>(STORAGE_KEYS.QUOTES, initialQuotes);
    let allItems = this.getQuoteItems();
    const now = new Date().toISOString();
    const quoteId = quote.id || `quo-${Date.now()}`;

    // Calculate subtotal from items
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitRate), 0);
    const discount = quote.discountAmount || 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const vatPercentage = quote.vatPercentage !== undefined ? quote.vatPercentage : 15;
    const vatAmount = vatPercentage > 0 ? (taxableAmount * vatPercentage) / 100 : 0;
    const totalAmount = taxableAmount + vatAmount;

    let saved: Quote;

    const quoteNumber = quote.quoteNumber || `VAC-QUO-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`;

    if (quote.id) {
      const idx = quotes.findIndex((q) => q.id === quote.id);
      saved = {
        ...quotes[idx],
        ...quote,
        subtotal,
        discountAmount: discount,
        vatPercentage,
        vatAmount,
        totalAmount,
        updatedAt: now,
      };
      if (idx >= 0) quotes[idx] = saved;
      else quotes.unshift(saved);
    } else {
      saved = {
        id: quoteId,
        clientId: quote.clientId,
        projectId: quote.projectId,
        quoteNumber,
        title: quote.title,
        siteAddress: quote.siteAddress,
        issueDate: quote.issueDate || now.split('T')[0],
        expiryDate: quote.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: quote.status || 'sent',
        subtotal,
        discountAmount: discount,
        vatPercentage,
        vatAmount,
        totalAmount,
        scopeOfWork: quote.scopeOfWork || '',
        paymentScheduleTerms: quote.paymentScheduleTerms || '',
        specialNotes: quote.specialNotes || '',
        createdAt: now,
        updatedAt: now,
      };
      quotes.unshift(saved);
    }

    // Replace items for this quote
    allItems = allItems.filter((i) => i.quoteId !== quoteId);
    const savedItems: QuoteItem[] = items.map((item, idx) => ({
      id: item.id || `qit-${Date.now()}-${idx}`,
      quoteId,
      orderIndex: idx + 1,
      category: item.category || 'Masonry & Brickwork',
      description: item.description,
      unit: item.unit || 'm²',
      quantity: Number(item.quantity) || 1,
      unitRate: Number(item.unitRate) || 0,
      totalAmount: Number(item.quantity) * Number(item.unitRate),
      createdAt: now,
    }));

    allItems.push(...savedItems);

    setStored(STORAGE_KEYS.QUOTES, quotes);
    setStored(STORAGE_KEYS.QUOTE_ITEMS, allItems);

    return { ...saved, items: savedItems };
  }

  static deleteQuote(id: string): void {
    const quotes = getStored<Quote[]>(STORAGE_KEYS.QUOTES, initialQuotes).filter((q) => q.id !== id);
    const items = this.getQuoteItems().filter((i) => i.quoteId !== id);
    setStored(STORAGE_KEYS.QUOTES, quotes);
    setStored(STORAGE_KEYS.QUOTE_ITEMS, items);
  }

  // Invoices
  static getInvoices(): Invoice[] {
    const invoices = getStored<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices);
    const items = this.getInvoiceItems();
    return invoices.map((inv) => ({
      ...inv,
      items: items.filter((i) => i.invoiceId === inv.id).sort((a, b) => a.orderIndex - b.orderIndex),
    }));
  }

  static getInvoiceById(id: string): Invoice | undefined {
    return this.getInvoices().find((inv) => inv.id === id);
  }

  static getInvoiceItems(): InvoiceItem[] {
    return getStored<InvoiceItem[]>(STORAGE_KEYS.INVOICE_ITEMS, initialInvoiceItems);
  }

  static saveInvoice(
    invoice: Partial<Invoice> & { clientId: string; title: string },
    items: Array<Omit<InvoiceItem, 'id' | 'invoiceId' | 'createdAt' | 'orderIndex'> & { id?: string; orderIndex?: number }>
  ): Invoice {
    const invoices = getStored<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices);
    let allItems = this.getInvoiceItems();
    const now = new Date().toISOString();
    const invoiceId = invoice.id || `inv-${Date.now()}`;

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitRate), 0);
    const retentionPercentage = invoice.retentionPercentage || 0;
    const retentionAmount = retentionPercentage > 0 ? (subtotal * retentionPercentage) / 100 : 0;
    const billableSubtotal = Math.max(0, subtotal - retentionAmount);
    const vatPercentage = invoice.vatPercentage !== undefined ? invoice.vatPercentage : 15;
    const vatAmount = vatPercentage > 0 ? (billableSubtotal * vatPercentage) / 100 : 0;
    const totalAmount = billableSubtotal + vatAmount;
    const amountPaid = invoice.amountPaid || 0;
    const balanceDue = Math.max(0, totalAmount - amountPaid);

    let status = invoice.status || 'issued';
    if (amountPaid >= totalAmount && totalAmount > 0) {
      status = 'paid';
    } else if (amountPaid > 0 && amountPaid < totalAmount) {
      status = 'partially_paid';
    }

    const invoiceNumber = invoice.invoiceNumber || `VAC-INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;

    let saved: Invoice;

    if (invoice.id) {
      const idx = invoices.findIndex((i) => i.id === invoice.id);
      saved = {
        ...invoices[idx],
        ...invoice,
        subtotal,
        retentionPercentage,
        retentionAmount,
        vatPercentage,
        vatAmount,
        totalAmount,
        amountPaid,
        balanceDue,
        status,
        updatedAt: now,
      };
      if (idx >= 0) invoices[idx] = saved;
      else invoices.unshift(saved);
    } else {
      saved = {
        id: invoiceId,
        clientId: invoice.clientId,
        projectId: invoice.projectId,
        quoteId: invoice.quoteId,
        invoiceNumber,
        invoiceType: invoice.invoiceType || 'progress_draw',
        title: invoice.title,
        issueDate: invoice.issueDate || now.split('T')[0],
        dueDate: invoice.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status,
        subtotal,
        retentionPercentage,
        retentionAmount,
        vatPercentage,
        vatAmount,
        totalAmount,
        amountPaid,
        balanceDue,
        paymentReference: invoice.paymentReference || invoiceNumber,
        notes: invoice.notes || '',
        createdAt: now,
        updatedAt: now,
      };
      invoices.unshift(saved);
    }

    allItems = allItems.filter((i) => i.invoiceId !== invoiceId);
    const savedItems: InvoiceItem[] = items.map((item, idx) => ({
      id: item.id || `iit-${Date.now()}-${idx}`,
      invoiceId,
      orderIndex: idx + 1,
      description: item.description,
      unit: item.unit || 'sum',
      quantity: Number(item.quantity) || 1,
      unitRate: Number(item.unitRate) || 0,
      totalAmount: Number(item.quantity) * Number(item.unitRate),
      createdAt: now,
    }));

    allItems.push(...savedItems);

    setStored(STORAGE_KEYS.INVOICES, invoices);
    setStored(STORAGE_KEYS.INVOICE_ITEMS, allItems);

    return { ...saved, items: savedItems };
  }

  static recordInvoicePayment(
    invoiceId: string,
    amount: number,
    paymentMethod: 'EFT' | 'Bank Deposit' | 'Cash' | 'Card' | 'Instant EFT',
    bankReference?: string,
    notes?: string
  ): { invoice: Invoice; receipt: MilestoneReceipt } {
    const invoice = this.getInvoiceById(invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const newAmountPaid = (invoice.amountPaid || 0) + amount;
    const newBalanceDue = Math.max(0, invoice.totalAmount - newAmountPaid);
    const newStatus = newBalanceDue === 0 ? 'paid' : 'partially_paid';

    const updatedInvoice = this.saveInvoice(
      {
        ...invoice,
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
      },
      invoice.items || []
    );

    // Auto-generate milestone receipt
    const receipt = this.saveReceipt({
      clientId: invoice.clientId,
      projectId: invoice.projectId,
      invoiceId: invoice.id,
      amountPaid: amount,
      paymentMethod,
      bankReference: bankReference || invoice.paymentReference,
      milestoneDescription: `Payment for ${invoice.title}`,
      remainingProjectBalance: newBalanceDue,
      receivedBy: 'Vacanyi Accounts',
      notes: notes || `Direct payment logged against invoice ${invoice.invoiceNumber}`,
    });

    return { invoice: updatedInvoice, receipt };
  }

  static deleteInvoice(id: string): void {
    const invoices = getStored<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices).filter((i) => i.id !== id);
    const items = this.getInvoiceItems().filter((i) => i.invoiceId !== id);
    setStored(STORAGE_KEYS.INVOICES, invoices);
    setStored(STORAGE_KEYS.INVOICE_ITEMS, items);
  }

  // Receipts
  static getReceipts(): MilestoneReceipt[] {
    return getStored<MilestoneReceipt[]>(STORAGE_KEYS.RECEIPTS, initialReceipts);
  }

  static getReceiptById(id: string): MilestoneReceipt | undefined {
    return this.getReceipts().find((r) => r.id === id);
  }

  static saveReceipt(receipt: Partial<MilestoneReceipt> & { clientId: string; amountPaid: number }): MilestoneReceipt {
    const receipts = this.getReceipts();
    const now = new Date().toISOString();
    const receiptNumber = receipt.receiptNumber || `VAC-REC-${new Date().getFullYear()}-${String(receipts.length + 1).padStart(3, '0')}`;

    const saved: MilestoneReceipt = {
      id: receipt.id || `rec-${Date.now()}`,
      receiptNumber,
      clientId: receipt.clientId,
      projectId: receipt.projectId,
      invoiceId: receipt.invoiceId,
      paymentDate: receipt.paymentDate || now.split('T')[0],
      amountPaid: receipt.amountPaid,
      paymentMethod: receipt.paymentMethod || 'EFT',
      bankReference: receipt.bankReference || receiptNumber,
      milestoneDescription: receipt.milestoneDescription || 'Milestone Progress Payment',
      remainingProjectBalance: receipt.remainingProjectBalance || 0,
      receivedBy: receipt.receivedBy || 'Vacanyi Accounts Department',
      notes: receipt.notes || '',
      createdAt: now,
    };

    const existingIdx = receipts.findIndex((r) => r.id === saved.id);
    if (existingIdx >= 0) receipts[existingIdx] = saved;
    else receipts.unshift(saved);

    setStored(STORAGE_KEYS.RECEIPTS, receipts);
    return saved;
  }

  static deleteReceipt(id: string): void {
    const receipts = this.getReceipts().filter((r) => r.id !== id);
    setStored(STORAGE_KEYS.RECEIPTS, receipts);
  }

  // Financial Stats & Aggregations
  static getFinancialOverview() {
    const invoices = this.getInvoices();
    const quotes = this.getQuotes();
    const projects = this.getProjects();
    const receipts = this.getReceipts();

    const totalRevenueCollected = receipts.reduce((sum, r) => sum + Number(r.amountPaid || 0), 0);
    const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);
    const totalReceivables = invoices
      .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((sum, i) => sum + Number(i.balanceDue || 0), 0);

    const activeQuotesPipeline = quotes
      .filter((q) => q.status === 'sent' || q.status === 'accepted')
      .reduce((sum, q) => sum + Number(q.totalAmount || 0), 0);

    const activeProjectsCount = projects.filter((p) => p.status === 'in_progress').length;
    const completedProjectsCount = projects.filter((p) => p.status === 'completed').length;

    const overdueInvoices = invoices.filter((i) => {
      if (i.status === 'paid' || i.status === 'cancelled') return false;
      return new Date(i.dueDate) < new Date();
    });

    const overdueReceivables = overdueInvoices.reduce((sum, i) => sum + Number(i.balanceDue || 0), 0);

    return {
      totalRevenueCollected,
      totalInvoiced,
      totalReceivables,
      activeQuotesPipeline,
      activeProjectsCount,
      completedProjectsCount,
      overdueInvoicesCount: overdueInvoices.length,
      overdueReceivables,
    };
  }

  // Reset to initial seed
  static resetToDefaultData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CLIENTS);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.MILESTONES);
    localStorage.removeItem(STORAGE_KEYS.QUOTES);
    localStorage.removeItem(STORAGE_KEYS.QUOTE_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.INVOICE_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.RECEIPTS);
    window.dispatchEvent(new Event('vacanyi-data-changed'));
  }
}
