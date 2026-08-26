'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PortalShell } from '@/components/layout/portal-shell';
import { DataStore } from '@/lib/storage/data-store';
import { Project, ProjectMilestone, MilestoneStatus, Client, Invoice, Quote } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { DocumentViewerModal } from '@/components/documents/document-viewer-modal';
import {
  ArrowLeft,
  HardHat,
  Plus,
  Calendar,
  MapPin,
  Share2,
  FileText,
  CheckCircle2,
  Clock,
  Building,
  User,
  Check,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { formatZAR, formatDate } from '@/lib/utils/formatters';
import { WhatsAppShareService } from '@/lib/share/whatsapp';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | undefined>();
  const [client, setClient] = useState<Client | undefined>();
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState(DataStore.getSettings());

  // Milestone Modal
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Partial<ProjectMilestone> | null>(null);

  // Document Viewer Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const refreshData = () => {
    const p = DataStore.getProjectById(projectId);
    setProject(p);
    if (p) {
      setClient(DataStore.getClientById(p.clientId));
      setMilestones(DataStore.getMilestonesByProjectId(p.id));
      setInvoices(DataStore.getInvoices().filter((i) => i.projectId === p.id));
    }
    setSettings(DataStore.getSettings());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('vacanyi-data-changed', refreshData);
    return () => window.removeEventListener('vacanyi-data-changed', refreshData);
  }, [projectId]);

  if (!project) {
    return (
      <PortalShell>
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">Project not found.</p>
          <Link href="/projects" className="mt-4 inline-block px-4 py-2 bg-[#082B52] text-white rounded-lg text-xs font-bold">
            Back to Projects
          </Link>
        </div>
      </PortalShell>
    );
  }

  const handleOpenNewMilestone = () => {
    const nextIndex = milestones.length + 1;
    setEditingMilestone({
      projectId: project.id,
      orderIndex: nextIndex,
      title: '',
      description: '',
      status: 'pending',
      percentageOfContract: 0,
      amount: 0,
      targetDate: '',
      notes: '',
    });
    setIsMilestoneModalOpen(true);
  };

  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone || !editingMilestone.title) return;

    DataStore.saveMilestone({
      ...editingMilestone,
      projectId: project.id,
      title: editingMilestone.title,
      amount: Number(editingMilestone.amount) || 0,
      percentageOfContract: Number(editingMilestone.percentageOfContract) || 0,
    });

    setIsMilestoneModalOpen(false);
    setEditingMilestone(null);
    refreshData();
  };

  const handleUpdateMilestoneStatus = (m: ProjectMilestone, newStatus: MilestoneStatus) => {
    const completedDate = newStatus === 'completed' || newStatus === 'certified' ? new Date().toISOString().split('T')[0] : undefined;
    DataStore.saveMilestone({
      ...m,
      status: newStatus,
      completedDate,
      certifiedBy: newStatus === 'certified' ? 'Vacanyi Project Engineer' : m.certifiedBy,
    });
    refreshData();
  };

  const handleWhatsAppProgressUpdate = () => {
    if (!client) return;
    const msg = WhatsAppShareService.createMilestoneUpdateMessage(project, client, settings);
    WhatsAppShareService.openWhatsApp(client.whatsappPhone || client.phone, msg);
  };

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Back link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#082B52] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Directory</span>
        </Link>

        {/* Project Header Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#082B52] bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                  {project.projectCode}
                </span>
                <span className="text-xs font-bold uppercase text-[#D5A11E]">
                  {project.projectType.replace('_', ' ')}
                </span>
                <Badge status={project.status} />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#082B52] mt-2 tracking-tight">
                {project.title}
              </h2>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
                {client && (
                  <Link
                    href={`/clients/${client.id}`}
                    className="flex items-center gap-1.5 text-[#082B52] font-semibold hover:underline"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Client: {client.name} {client.companyName ? `(${client.companyName})` : ''}</span>
                  </Link>
                )}
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Site: {project.siteAddress}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <HardHat className="w-3.5 h-3.5 text-slate-400" />
                  <span>Foreman: {project.siteForeman || 'Vacanyi Site Team'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <button
                onClick={handleWhatsAppProgressUpdate}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>1-Tap WhatsApp Update</span>
              </button>
              <button
                onClick={() => setReportModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold transition-all shadow-xs"
              >
                <FileText className="w-4 h-4 text-[#D5A11E]" />
                <span>Milestone Report PDF</span>
              </button>
            </div>
          </div>

          {/* Progress Overview Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Contract Value</span>
              <p className="text-xl font-bold text-[#082B52] mt-0.5">{formatZAR(project.contractValue)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Timeline Dates</span>
              <p className="text-xs font-semibold text-slate-800 mt-1">
                Started: {formatDate(project.startDate)} • Target: {formatDate(project.estimatedCompletionDate)}
              </p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-emerald-800 uppercase font-bold">Milestone Completion</span>
                <span className="text-lg font-black text-emerald-800">{project.progressPercentage}%</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all"
                  style={{ width: `${project.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Management Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-[#082B52]">Construction Milestones & Drawdown Schedule</h3>
              <p className="text-xs text-slate-500">
                Phase-by-phase quality certifications, percentage allocations, and inspection sign-offs.
              </p>
            </div>

            <button
              onClick={handleOpenNewMilestone}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#082B52] text-white rounded-lg text-xs font-bold hover:bg-[#103D70] transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 text-[#D5A11E]" />
              <span>Add Milestone Stage</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {milestones.map((m, idx) => {
              const isDone = m.status === 'completed' || m.status === 'certified';

              return (
                <div
                  key={m.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    m.status === 'certified'
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : m.status === 'completed'
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : m.status === 'in_progress'
                      ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-400/30'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : m.status === 'in_progress'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{m.title}</h4>
                          <Badge status={m.status} />
                        </div>
                        {m.description && (
                          <p className="text-xs text-slate-600 mt-1">{m.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-slate-500">
                          <span>Target: <strong className="text-slate-700">{formatDate(m.targetDate)}</strong></span>
                          {m.completedDate && (
                            <span className="text-emerald-700">Completed: <strong>{formatDate(m.completedDate)}</strong></span>
                          )}
                          {m.certifiedBy && (
                            <span className="text-emerald-800 font-semibold">✓ Certified by {m.certifiedBy}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Financial value & quick status toggle */}
                    <div className="flex items-center justify-between md:justify-end gap-4 pl-10 md:pl-0 border-t md:border-t-0 pt-2 md:pt-0 border-current/10">
                      <div className="text-left md:text-right">
                        <span className="text-xs font-bold text-slate-900 block">{formatZAR(m.amount)}</span>
                        <span className="text-[10px] text-slate-500">{m.percentageOfContract}% of Contract</span>
                      </div>

                      <select
                        value={m.status}
                        onChange={(e) => handleUpdateMilestoneStatus(m, e.target.value as MilestoneStatus)}
                        className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="certified">Certified (Sign-off)</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Milestone Modal */}
      <Modal
        isOpen={isMilestoneModalOpen}
        onClose={() => {
          setIsMilestoneModalOpen(false);
          setEditingMilestone(null);
        }}
        title="Add Construction Milestone"
        subtitle={`Project: ${project.title}`}
      >
        <form onSubmit={handleSaveMilestone} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Milestone Stage Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={editingMilestone?.title || ''}
              onChange={(e) => setEditingMilestone((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Brickwork Superstructure to Wallplate Height"
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description & Scope</label>
            <textarea
              rows={2}
              value={editingMilestone?.description || ''}
              onChange={(e) => setEditingMilestone((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Laying clay bricks, lintels, damp proof coursing, brickforce reinforcement."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Milestone Value (ZAR)</label>
              <input
                type="number"
                step="0.01"
                value={editingMilestone?.amount || ''}
                onChange={(e) => {
                  const amt = Number(e.target.value);
                  const pct = project.contractValue > 0 ? Math.round((amt / project.contractValue) * 100) : 0;
                  setEditingMilestone((prev) => ({ ...prev, amount: amt, percentageOfContract: pct }));
                }}
                placeholder="e.g. 250000"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">% of Contract</label>
              <input
                type="number"
                value={editingMilestone?.percentageOfContract || ''}
                onChange={(e) => {
                  const pct = Number(e.target.value);
                  const amt = (project.contractValue * pct) / 100;
                  setEditingMilestone((prev) => ({ ...prev, percentageOfContract: pct, amount: amt }));
                }}
                placeholder="e.g. 25"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Completion Date</label>
              <input
                type="date"
                value={editingMilestone?.targetDate || ''}
                onChange={(e) => setEditingMilestone((prev) => ({ ...prev, targetDate: e.target.value }))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsMilestoneModalOpen(false);
                setEditingMilestone(null);
              }}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold shadow-xs"
            >
              Save Milestone
            </button>
          </div>
        </form>
      </Modal>

      {/* Project Milestone Report PDF Modal */}
      <DocumentViewerModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        documentType="project_report"
        project={project}
        client={client}
        settings={settings}
      />
    </PortalShell>
  );
}
