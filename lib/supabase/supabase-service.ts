import { supabase, isSupabaseConfigured } from './client';
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

export class SupabaseService {
  /**
   * Test live connection to Supabase instance
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.from('vacanyi_settings').select('*').limit(1);
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Connected to Supabase successfully' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Connection failed' };
    }
  }

  // --- Settings ---
  static async fetchSettings(): Promise<CompanySettings | null> {
    try {
      const { data, error } = await supabase.from('vacanyi_settings').select('*').single();
      if (error || !data) return null;
      return {
        id: data.id,
        companyName: data.company_name,
        shortName: data.short_name,
        tagline: data.tagline || '',
        registrationNumber: data.registration_number || '',
        taxNumber: data.tax_number || '',
        vatNumber: data.vat_number || '',
        nhbrcNumber: data.nhbrc_number || '',
        phone: data.phone || '',
        whatsappPhone: data.whatsapp_phone || '',
        email: data.email || '',
        website: data.website || '',
        address: data.address || '',
        bankName: data.bank_name || '',
        accountName: data.account_name || '',
        accountNumber: data.account_number || '',
        accountType: data.account_type || '',
        branchCode: data.branch_code || '',
        swiftCode: data.swift_code || '',
        vatPercentage: Number(data.vat_percentage) || 15,
        isVatRegistered: data.is_vat_registered ?? true,
        defaultQuoteValidityDays: data.default_quote_validity_days || 30,
        defaultInvoiceTermsDays: data.default_invoice_terms_days || 7,
        defaultQuoteTerms: data.default_quote_terms || '',
        defaultInvoiceTerms: data.default_invoice_terms || '',
        updatedAt: data.updated_at || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  static async updateSettings(settings: CompanySettings): Promise<boolean> {
    try {
      const { error } = await supabase.from('vacanyi_settings').upsert({
        id: 'default',
        company_name: settings.companyName,
        short_name: settings.shortName,
        tagline: settings.tagline,
        registration_number: settings.registrationNumber,
        tax_number: settings.taxNumber,
        vat_number: settings.vatNumber,
        nhbrc_number: settings.nhbrcNumber,
        phone: settings.phone,
        whatsapp_phone: settings.whatsappPhone,
        email: settings.email,
        website: settings.website,
        address: settings.address,
        bank_name: settings.bankName,
        account_name: settings.accountName,
        account_number: settings.accountNumber,
        account_type: settings.accountType,
        branch_code: settings.branchCode,
        swift_code: settings.swiftCode,
        vat_percentage: settings.vatPercentage,
        is_vat_registered: settings.isVatRegistered,
        default_quote_validity_days: settings.defaultQuoteValidityDays,
        default_invoice_terms_days: settings.defaultInvoiceTermsDays,
        default_quote_terms: settings.defaultQuoteTerms,
        default_invoice_terms: settings.defaultInvoiceTerms,
        updated_at: new Date().toISOString(),
      });
      return !error;
    } catch {
      return false;
    }
  }

  // --- Clients ---
  static async fetchClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase.from('vacanyi_clients').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        companyName: c.company_name || '',
        email: c.email || '',
        phone: c.phone,
        whatsappPhone: c.whatsapp_phone || c.phone,
        physicalAddress: c.physical_address || '',
        idOrRegistrationNumber: c.id_or_registration_number || '',
        clientType: c.client_type || 'residential',
        status: c.status || 'active',
        notes: c.notes || '',
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));
    } catch {
      return [];
    }
  }

  static async upsertClient(client: Client): Promise<boolean> {
    try {
      const { error } = await supabase.from('vacanyi_clients').upsert({
        id: client.id.includes('-') && client.id.length === 36 ? client.id : undefined,
        name: client.name,
        company_name: client.companyName,
        email: client.email,
        phone: client.phone,
        whatsapp_phone: client.whatsappPhone,
        physical_address: client.physicalAddress,
        id_or_registration_number: client.idOrRegistrationNumber,
        client_type: client.clientType,
        status: client.status,
        notes: client.notes,
        updated_at: new Date().toISOString(),
      });
      return !error;
    } catch {
      return false;
    }
  }

  // --- Projects ---
  static async fetchProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase.from('vacanyi_projects').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((p: any) => ({
        id: p.id,
        clientId: p.client_id,
        title: p.title,
        projectCode: p.project_code,
        description: p.description || '',
        siteAddress: p.site_address,
        projectType: p.project_type || 'residential',
        status: p.status || 'in_progress',
        contractValue: Number(p.contract_value) || 0,
        startDate: p.start_date,
        estimatedCompletionDate: p.estimated_completion_date,
        actualCompletionDate: p.actual_completion_date,
        progressPercentage: p.progress_percentage || 0,
        siteForeman: p.site_foreman || '',
        notes: p.notes || '',
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
    } catch {
      return [];
    }
  }

  // --- Milestones ---
  static async fetchMilestones(): Promise<ProjectMilestone[]> {
    try {
      const { data, error } = await supabase.from('vacanyi_project_milestones').select('*').order('order_index', { ascending: true });
      if (error || !data) return [];
      return data.map((m: any) => ({
        id: m.id,
        projectId: m.project_id,
        orderIndex: m.order_index,
        title: m.title,
        description: m.description || '',
        status: m.status || 'pending',
        percentageOfContract: Number(m.percentage_of_contract) || 0,
        amount: Number(m.amount) || 0,
        targetDate: m.target_date,
        completedDate: m.completed_date,
        certifiedBy: m.certified_by,
        notes: m.notes || '',
        createdAt: m.created_at,
        updatedAt: m.updated_at,
      }));
    } catch {
      return [];
    }
  }

  // --- Quotes ---
  static async fetchQuotes(): Promise<Quote[]> {
    try {
      const { data, error } = await supabase.from('vacanyi_quotes').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((q: any) => ({
        id: q.id,
        clientId: q.client_id,
        projectId: q.project_id,
        quoteNumber: q.quote_number,
        title: q.title,
        siteAddress: q.site_address || '',
        issueDate: q.issue_date,
        expiryDate: q.expiry_date,
        status: q.status || 'sent',
        subtotal: Number(q.subtotal) || 0,
        discountAmount: Number(q.discount_amount) || 0,
        vatPercentage: Number(q.vat_percentage) || 15,
        vatAmount: Number(q.vat_amount) || 0,
        totalAmount: Number(q.total_amount) || 0,
        scopeOfWork: q.scope_of_work || '',
        paymentScheduleTerms: q.payment_schedule_terms || '',
        specialNotes: q.special_notes || '',
        createdAt: q.created_at,
        updatedAt: q.updated_at,
      }));
    } catch {
      return [];
    }
  }

  // --- Invoices ---
  static async fetchInvoices(): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase.from('vacanyi_invoices').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((i: any) => ({
        id: i.id,
        clientId: i.client_id,
        projectId: i.project_id,
        quoteId: i.quote_id,
        invoiceNumber: i.invoice_number,
        invoiceType: i.invoice_type || 'progress_draw',
        title: i.title,
        issueDate: i.issue_date,
        dueDate: i.due_date,
        status: i.status || 'issued',
        subtotal: Number(i.subtotal) || 0,
        retentionPercentage: Number(i.retention_percentage) || 0,
        retentionAmount: Number(i.retention_amount) || 0,
        vatPercentage: Number(i.vat_percentage) || 15,
        vatAmount: Number(i.vat_amount) || 0,
        totalAmount: Number(i.total_amount) || 0,
        amountPaid: Number(i.amount_paid) || 0,
        balanceDue: Number(i.balance_due) || 0,
        paymentReference: i.payment_reference || i.invoice_number,
        notes: i.notes || '',
        createdAt: i.created_at,
        updatedAt: i.updated_at,
      }));
    } catch {
      return [];
    }
  }

  // --- Receipts ---
  static async fetchReceipts(): Promise<MilestoneReceipt[]> {
    try {
      const { data, error } = await supabase.from('vacanyi_receipts').select('*').order('payment_date', { ascending: false });
      if (error || !data) return [];
      return data.map((r: any) => ({
        id: r.id,
        receiptNumber: r.receipt_number,
        clientId: r.client_id,
        projectId: r.project_id,
        invoiceId: r.invoice_id,
        paymentDate: r.payment_date,
        amountPaid: Number(r.amount_paid) || 0,
        paymentMethod: r.payment_method || 'EFT',
        bankReference: r.bank_reference || '',
        milestoneDescription: r.milestone_description || '',
        remainingProjectBalance: Number(r.remaining_project_balance) || 0,
        receivedBy: r.received_by || 'Vacanyi Accounts',
        notes: r.notes || '',
        createdAt: r.created_at,
      }));
    } catch {
      return [];
    }
  }
}
