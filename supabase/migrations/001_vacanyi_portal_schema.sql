-- Vacanyi Building Contractor Management Portal Schema
-- Prefix: vacanyi_*

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Company / Organization Settings
CREATE TABLE IF NOT EXISTS public.vacanyi_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    company_name TEXT NOT NULL DEFAULT 'Vacanyi Building Construction & Project',
    short_name TEXT NOT NULL DEFAULT 'Vacanyi Building',
    tagline TEXT DEFAULT 'Excellence in Residential & Commercial Construction',
    registration_number TEXT DEFAULT '2023/894120/07',
    tax_number TEXT DEFAULT '9821034821',
    vat_number TEXT DEFAULT '4980291823',
    nhbrc_number TEXT DEFAULT 'NHBRC-300029817',
    phone TEXT DEFAULT '063 343 7927',
    whatsapp_phone TEXT DEFAULT '27633437927',
    email TEXT DEFAULT 'info@vacanyi.co.za',
    website TEXT DEFAULT 'https://vacanyi.co.za',
    address TEXT DEFAULT '14 Enterprise Way, Polokwane / Tzaneen, Limpopo, 0700',
    bank_name TEXT DEFAULT 'First National Bank (FNB)',
    account_name TEXT DEFAULT 'Vacanyi Building Construction (Pty) Ltd',
    account_number TEXT DEFAULT '63098712345',
    account_type TEXT DEFAULT 'Business Cheque Account',
    branch_code TEXT DEFAULT '250655',
    swift_code TEXT DEFAULT 'FIRNZAJJ',
    vat_percentage NUMERIC(5,2) DEFAULT 15.00,
    is_vat_registered BOOLEAN DEFAULT true,
    default_quote_validity_days INT DEFAULT 30,
    default_invoice_terms_days INT DEFAULT 7,
    default_quote_terms TEXT DEFAULT '1. Quotation is valid for 30 days from date of issue.
2. 30% deposit required upon acceptance to secure project schedule and procurement.
3. Work proceeds strictly according to agreed milestone drawdowns.
4. Any variations or client-requested additions will be quoted and approved prior to commencement.
5. All structural works comply with SANS 10400 building regulations and NHBRC standards.',
    default_invoice_terms TEXT DEFAULT 'Payment due within 7 days of invoice presentation. Please use the invoice number as payment reference on EFT transfers.',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings row if not exists
INSERT INTO public.vacanyi_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 2. Clients Table
CREATE TABLE IF NOT EXISTS public.vacanyi_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company_name TEXT,
    email TEXT,
    phone TEXT NOT NULL,
    whatsapp_phone TEXT,
    physical_address TEXT,
    id_or_registration_number TEXT,
    client_type TEXT DEFAULT 'residential' CHECK (client_type IN ('residential', 'commercial', 'developer', 'subcontractor')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'lead', 'archived')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.vacanyi_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.vacanyi_clients(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    project_code TEXT UNIQUE NOT NULL,
    description TEXT,
    site_address TEXT NOT NULL,
    project_type TEXT DEFAULT 'residential' CHECK (project_type IN ('new_build', 'residential', 'renovation', 'roofing', 'commercial', 'structural')),
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'snagging', 'completed')),
    contract_value NUMERIC(14,2) DEFAULT 0,
    start_date DATE,
    estimated_completion_date DATE,
    actual_completion_date DATE,
    progress_percentage INT DEFAULT 0,
    site_foreman TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Project Milestones Table
CREATE TABLE IF NOT EXISTS public.vacanyi_project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.vacanyi_projects(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'certified')),
    percentage_of_contract NUMERIC(5,2) DEFAULT 0,
    amount NUMERIC(14,2) DEFAULT 0,
    target_date DATE,
    completed_date DATE,
    certified_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Quotations Table
CREATE TABLE IF NOT EXISTS public.vacanyi_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.vacanyi_clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.vacanyi_projects(id) ON DELETE SET NULL,
    quote_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    site_address TEXT,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'invoiced', 'expired')),
    subtotal NUMERIC(14,2) DEFAULT 0,
    discount_amount NUMERIC(14,2) DEFAULT 0,
    vat_percentage NUMERIC(5,2) DEFAULT 15.00,
    vat_amount NUMERIC(14,2) DEFAULT 0,
    total_amount NUMERIC(14,2) DEFAULT 0,
    scope_of_work TEXT,
    payment_schedule_terms TEXT,
    special_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Quotation Line Items Table (BOQ)
CREATE TABLE IF NOT EXISTS public.vacanyi_quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.vacanyi_quotes(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 1,
    category TEXT DEFAULT 'Masonry/Brickwork',
    description TEXT NOT NULL,
    unit TEXT DEFAULT 'm²',
    quantity NUMERIC(12,2) DEFAULT 1,
    unit_rate NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(14,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Invoices Table
CREATE TABLE IF NOT EXISTS public.vacanyi_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.vacanyi_clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.vacanyi_projects(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES public.vacanyi_quotes(id) ON DELETE SET NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_type TEXT DEFAULT 'progress_draw' CHECK (invoice_type IN ('tax_invoice', 'progress_draw', 'deposit', 'final', 'variation')),
    title TEXT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled')),
    subtotal NUMERIC(14,2) DEFAULT 0,
    retention_percentage NUMERIC(5,2) DEFAULT 0,
    retention_amount NUMERIC(14,2) DEFAULT 0,
    vat_percentage NUMERIC(5,2) DEFAULT 15.00,
    vat_amount NUMERIC(14,2) DEFAULT 0,
    total_amount NUMERIC(14,2) DEFAULT 0,
    amount_paid NUMERIC(14,2) DEFAULT 0,
    balance_due NUMERIC(14,2) DEFAULT 0,
    payment_reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Invoice Line Items Table
CREATE TABLE IF NOT EXISTS public.vacanyi_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.vacanyi_invoices(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 1,
    description TEXT NOT NULL,
    unit TEXT DEFAULT 'sum',
    quantity NUMERIC(12,2) DEFAULT 1,
    unit_rate NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(14,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Milestone Payment Receipts Table
CREATE TABLE IF NOT EXISTS public.vacanyi_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES public.vacanyi_clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.vacanyi_projects(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES public.vacanyi_invoices(id) ON DELETE SET NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_paid NUMERIC(14,2) NOT NULL,
    payment_method TEXT DEFAULT 'EFT' CHECK (payment_method IN ('EFT', 'Bank Deposit', 'Cash', 'Card', 'Instant EFT')),
    bank_reference TEXT,
    milestone_description TEXT,
    remaining_project_balance NUMERIC(14,2) DEFAULT 0,
    received_by TEXT DEFAULT 'Vacanyi Accounts',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Audit / Activity Logs Table
CREATE TABLE IF NOT EXISTS public.vacanyi_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_vacanyi_projects_client_id ON public.vacanyi_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_vacanyi_milestones_project_id ON public.vacanyi_project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_vacanyi_quotes_client_id ON public.vacanyi_quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_vacanyi_quote_items_quote_id ON public.vacanyi_quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_vacanyi_invoices_client_id ON public.vacanyi_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_vacanyi_invoices_project_id ON public.vacanyi_invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_vacanyi_invoice_items_invoice_id ON public.vacanyi_invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_vacanyi_receipts_client_id ON public.vacanyi_receipts(client_id);
CREATE INDEX IF NOT EXISTS idx_vacanyi_receipts_invoice_id ON public.vacanyi_receipts(invoice_id);
