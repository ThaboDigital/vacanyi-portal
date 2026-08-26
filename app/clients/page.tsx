'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PortalShell } from '@/components/layout/portal-shell';
import { DataStore } from '@/lib/storage/data-store';
import { Client, ClientType, ClientStatus, Invoice, MilestoneReceipt } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { DocumentViewerModal } from '@/components/documents/document-viewer-modal';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Share2,
  FileText,
  Building,
  MapPin,
  ArrowUpRight,
  UserCheck,
  Edit3,
} from 'lucide-react';
import { formatZAR, formatPhoneDisplay } from '@/lib/utils/formatters';
import { WhatsAppShareService } from '@/lib/share/whatsapp';

function ClientsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const shouldOpenNew = searchParams.get('new') === 'true';

  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<MilestoneReceipt[]>([]);
  const [search, setSearch] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [settings, setSettings] = useState(DataStore.getSettings());

  // Add/Edit Modal
  const [isClientModalOpen, setIsClientModalOpen] = useState(shouldOpenNew);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);

  // Statement Document Modal
  const [statementModalOpen, setStatementModalOpen] = useState(false);
  const [selectedStatementClient, setSelectedStatementClient] = useState<Client | null>(null);

  const refreshData = () => {
    setClients(DataStore.getClients());
    setInvoices(DataStore.getInvoices());
    setReceipts(DataStore.getReceipts());
    setSettings(DataStore.getSettings());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('vacanyi-data-changed', refreshData);
    return () => window.removeEventListener('vacanyi-data-changed', refreshData);
  }, []);

  const handleOpenNewClient = () => {
    setEditingClient({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      whatsappPhone: '',
      physicalAddress: '',
      idOrRegistrationNumber: '',
      clientType: 'residential',
      status: 'active',
      notes: '',
    });
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editingClient.name || !editingClient.phone) return;

    DataStore.saveClient({
      ...editingClient,
      name: editingClient.name,
      phone: editingClient.phone,
      whatsappPhone: editingClient.whatsappPhone || editingClient.phone,
    });

    setIsClientModalOpen(false);
    setEditingClient(null);
    refreshData();
  };

  const handleEditClient = (client: Client) => {
    setEditingClient({ ...client });
    setIsClientModalOpen(true);
  };

  const handleOpenStatement = (client: Client) => {
    setSelectedStatementClient(client);
    setStatementModalOpen(true);
  };

  const handleWhatsAppChat = (client: Client) => {
    const message = `Hello ${client.name}, this is Vacanyi Building Construction & Project following up regarding your construction project. How can we assist you today?`;
    WhatsAppShareService.openWhatsApp(client.whatsappPhone || client.phone, message);
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase().includes(search.toLowerCase())) ||
      c.phone.includes(search) ||
      (c.physicalAddress && c.physicalAddress.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'all' || c.clientType === typeFilter || c.status === typeFilter;

    return matchesSearch && matchesType;
  });

  const getClientFinancials = (clientId: string) => {
    const clientInvoices = invoices.filter((i) => i.clientId === clientId);
    const clientReceipts = receipts.filter((r) => r.clientId === clientId);
    const totalInvoiced = clientInvoices.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);
    const totalPaid = clientReceipts.reduce((sum, r) => sum + Number(r.amountPaid || 0), 0);
    const balanceDue = clientInvoices.reduce((sum, i) => sum + Number(i.balanceDue || 0), 0);
    return { totalInvoiced, totalPaid, balanceDue, invoices: clientInvoices, receipts: clientReceipts };
  };

  const selectedStatementData = selectedStatementClient ? getClientFinancials(selectedStatementClient.id) : null;

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#082B52] tracking-tight">Clients & CRM Directory</h2>
            <p className="text-xs text-slate-500 mt-1">
              Manage client accounts, contact details, physical sites, and statement ledgers.
            </p>
          </div>

          <button
            onClick={handleOpenNewClient}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4 text-[#D5A11E]" />
            <span>Add New Client</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name, company, phone, or location..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#082B52]"
            >
              <option value="all">All Categories</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="active">Active Status</option>
              <option value="lead">New Leads</option>
            </select>
          </div>
        </div>

        {/* Clients Grid */}
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 max-w-lg mx-auto my-6 space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Clients Registered Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start building your contractor client CRM. Register homeowner or commercial clients to issue quotes and invoices.
            </p>
            <button
              onClick={handleOpenNewClient}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#D5A11E]" />
              <span>Register New Client</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClients.map((client) => {
              const { totalInvoiced, totalPaid, balanceDue } = getClientFinancials(client.id);

              return (
              <div
                key={client.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-2xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D5A11E] bg-[#082B52] px-2 py-0.5 rounded">
                        {client.clientType}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 mt-2">{client.name}</h3>
                      {client.companyName && (
                        <p className="text-xs font-medium text-slate-600 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{client.companyName}</span>
                        </p>
                      )}
                    </div>
                    <Badge status={client.status} />
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#082B52] shrink-0" />
                      <span className="font-medium text-slate-800">{formatPhoneDisplay(client.phone)}</span>
                    </div>
                    {client.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.physicalAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{client.physicalAddress}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial Balance Strip */}
                  <div className="mt-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Invoiced</span>
                      <p className="font-bold text-[#082B52]">{formatZAR(totalInvoiced)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Balance Due</span>
                      <p className={`font-bold ${balanceDue > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                        {formatZAR(balanceDue)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* 1-Tap WhatsApp */}
                    <button
                      onClick={() => handleWhatsAppChat(client)}
                      className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                      title="1-Tap WhatsApp Chat"
                    >
                      <Share2 className="w-4 h-4 text-emerald-600" />
                    </button>

                    {/* Edit Client */}
                    <button
                      onClick={() => handleEditClient(client)}
                      className="p-2 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors"
                      title="Edit Client Details"
                    >
                      <Edit3 className="w-4 h-4 text-amber-700" />
                    </button>

                    {/* Statement PDF */}
                    <button
                      onClick={() => handleOpenStatement(client)}
                      className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      title="Generate Statement of Account PDF"
                    >
                      <FileText className="w-4 h-4 text-[#082B52]" />
                    </button>
                  </div>

                  <Link
                    href={`/clients/${client.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-[#082B52] hover:text-[#D5A11E] transition-colors py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100"
                  >
                    <span>View 360 Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Add / Edit Client Modal */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setEditingClient(null);
        }}
        title={editingClient?.id ? 'Edit Client Profile' : 'Register New Client'}
        subtitle="Contractor CRM & Site Account"
      >
        <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Full Name / Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editingClient?.name || ''}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Dr. TK Sambo"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Company / Entity Name</label>
              <input
                type="text"
                value={editingClient?.companyName || ''}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="e.g. Sambo Medical Properties (Pty) Ltd"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editingClient?.phone || ''}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. 082 555 4912"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={editingClient?.whatsappPhone || ''}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, whatsappPhone: e.target.value }))}
                placeholder="e.g. 27825554912"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={editingClient?.email || ''}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. client@example.co.za"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ID / Registration Number</label>
              <input
                type="text"
                value={editingClient?.idOrRegistrationNumber || ''}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, idOrRegistrationNumber: e.target.value }))}
                placeholder="e.g. 8204155092084 / 2021/123456/07"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Site / Physical Address</label>
            <input
              type="text"
              value={editingClient?.physicalAddress || ''}
              onChange={(e) => setEditingClient((prev) => ({ ...prev, physicalAddress: e.target.value }))}
              placeholder="e.g. Plot 48, Bendor Ridge Estate, Polokwane"
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Client Type</label>
              <select
                value={editingClient?.clientType || 'residential'}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, clientType: e.target.value as ClientType }))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="residential">Residential Homeowner</option>
                <option value="commercial">Commercial / Corporate</option>
                <option value="developer">Property Developer</option>
                <option value="subcontractor">Subcontractor / Partner</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={editingClient?.status || 'active'}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, status: e.target.value as ClientStatus }))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="active">Active Contractor Client</option>
                <option value="lead">Prospective Lead</option>
                <option value="archived">Archived / Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notes & Specifications</label>
            <textarea
              rows={3}
              value={editingClient?.notes || ''}
              onChange={(e) => setEditingClient((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Requires weekly milestone photo updates; plans approved by Polokwane municipality."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsClientModalOpen(false);
                setEditingClient(null);
              }}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold shadow-xs"
            >
              Save Client Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Statement of Account Modal */}
      {selectedStatementClient && selectedStatementData && (
        <DocumentViewerModal
          isOpen={statementModalOpen}
          onClose={() => {
            setStatementModalOpen(false);
            setSelectedStatementClient(null);
          }}
          documentType="statement"
          client={selectedStatementClient}
          settings={settings}
          statementData={{
            invoices: selectedStatementData.invoices,
            receipts: selectedStatementData.receipts,
            totalInvoiced: selectedStatementData.totalInvoiced,
            totalPaid: selectedStatementData.totalPaid,
            balanceDue: selectedStatementData.balanceDue,
          }}
        />
      )}
    </PortalShell>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Clients...</div>}>
      <ClientsContent />
    </Suspense>
  );
}

