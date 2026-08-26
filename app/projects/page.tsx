'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PortalShell } from '@/components/layout/portal-shell';
import { DataStore } from '@/lib/storage/data-store';
import { Project, ProjectType, ProjectStatus, Client } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  HardHat,
  Plus,
  Search,
  MapPin,
  Calendar,
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Building,
} from 'lucide-react';
import { formatZAR, formatDate } from '@/lib/utils/formatters';

function ProjectsContent() {
  const searchParams = useSearchParams();
  const shouldOpenNew = searchParams.get('new') === 'true';

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(shouldOpenNew);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);

  const refreshData = () => {
    setProjects(DataStore.getProjects());
    setClients(DataStore.getClients());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('vacanyi-data-changed', refreshData);
    return () => window.removeEventListener('vacanyi-data-changed', refreshData);
  }, []);

  const handleOpenNew = () => {
    setEditingProject({
      title: '',
      clientId: clients[0]?.id || '',
      siteAddress: '',
      description: '',
      projectType: 'residential',
      status: 'in_progress',
      contractValue: 0,
      startDate: new Date().toISOString().split('T')[0],
      estimatedCompletionDate: '',
      siteForeman: 'Godfrey Mathebula',
      progressPercentage: 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editingProject.title || !editingProject.clientId || !editingProject.siteAddress) return;

    DataStore.saveProject({
      ...editingProject,
      title: editingProject.title,
      clientId: editingProject.clientId,
      siteAddress: editingProject.siteAddress,
      contractValue: Number(editingProject.contractValue) || 0,
    });

    setIsModalOpen(false);
    setEditingProject(null);
    refreshData();
  };

  const filteredProjects = projects.filter((p) => {
    const client = clients.find((c) => c.id === p.clientId);
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(search.toLowerCase()) ||
      p.siteAddress.toLowerCase().includes(search.toLowerCase()) ||
      (client && client.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#082B52] tracking-tight">Site Projects & Milestones</h2>
            <p className="text-xs text-slate-500 mt-1">
              Track active construction sites, stage certifications, target completion dates, and foreman assignments.
            </p>
          </div>

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4 text-[#D5A11E]" />
            <span>New Site Project</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project name, project code, site address, or client..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#082B52]"
          >
            <option value="all">All Project Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="planning">Planning Phase</option>
            <option value="snagging">Snagging & Finishes</option>
            <option value="completed">Completed / Handed Over</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 max-w-lg mx-auto my-6 space-y-3">
            <HardHat className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Construction Sites Registered</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Track building milestones, certification stages, and progress reports for your turnkey construction contracts.
            </p>
            <button
              onClick={() => {
                setEditingProject({
                  clientId: clients[0]?.id || '',
                  title: '',
                  siteAddress: '',
                  projectType: 'residential',
                  status: 'in_progress',
                  contractValue: 0,
                  startDate: new Date().toISOString().split('T')[0],
                  estimatedCompletionDate: '',
                  progressPercentage: 0,
                  siteForeman: '',
                  notes: '',
                });
                setIsModalOpen(true);
              }}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#D5A11E]" />
              <span>Register Site Project</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProjects.map((p) => {
              const client = clients.find((c) => c.id === p.clientId);
              const milestoneCount = p.milestones?.length || 0;
              const completedMilestones = p.milestones?.filter((m) => m.status === 'completed' || m.status === 'certified').length || 0;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 shadow-2xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-[#082B52] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {p.projectCode}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-[#D5A11E]">
                            {p.projectType.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-slate-900 mt-2">{p.title}</h3>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          Client: <span className="font-semibold text-slate-900">{client?.name || 'Unassigned'}</span>
                        </p>
                      </div>
                      <Badge status={p.status} />
                    </div>

                    {p.description && (
                      <p className="text-xs text-slate-600 mt-3 line-clamp-2">{p.description}</p>
                    )}

                    <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{p.siteAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Started: {formatDate(p.startDate)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">Contract Milestones</span>
                        <span className="text-emerald-700 font-bold">{p.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${p.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Contract Value & Milestones Count */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Contract Sum</span>
                        <p className="font-bold text-[#082B52]">{formatZAR(p.contractValue)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Milestones</span>
                        <p className="font-bold text-slate-800">
                          {completedMilestones} / {milestoneCount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-medium truncate">
                      Foreman: <strong className="text-slate-700">{p.siteForeman || 'Vacanyi Team'}</strong>
                    </span>

                    <Link
                      href={`/projects/${p.id}`}
                      className="flex items-center gap-1 text-xs font-bold text-[#082B52] hover:text-[#D5A11E] py-2 px-3.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <span>Manage Milestones</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        title="Register New Construction Project"
        subtitle="Vacanyi Site Tracker"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Project Title / Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={editingProject?.title || ''}
              onChange={(e) => setEditingProject((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Sambo Medical Centre - Phase 2 Structural Extension"
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={editingProject?.clientId || ''}
                onChange={(e) => setEditingProject((prev) => ({ ...prev, clientId: e.target.value }))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="">Select a Client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.companyName ? `(${c.companyName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Project Type</label>
              <select
                value={editingProject?.projectType || 'residential'}
                onChange={(e) => setEditingProject((prev) => ({ ...prev, projectType: e.target.value as ProjectType }))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="residential">Residential Construction</option>
                <option value="new_build">New Building Construction</option>
                <option value="renovation">Renovations & Alterations</option>
                <option value="roofing">Roofing & Timber Trusses</option>
                <option value="commercial">Commercial Development</option>
                <option value="structural">Concrete & Foundations</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Site Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={editingProject?.siteAddress || ''}
              onChange={(e) => setEditingProject((prev) => ({ ...prev, siteAddress: e.target.value }))}
              placeholder="e.g. Plot 48, Bendor Ridge Estate, Polokwane"
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contract Value (ZAR)</label>
              <input
                type="number"
                step="0.01"
                value={editingProject?.contractValue || ''}
                onChange={(e) => setEditingProject((prev) => ({ ...prev, contractValue: Number(e.target.value) }))}
                placeholder="e.g. 1250000"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={editingProject?.startDate || ''}
                onChange={(e) => setEditingProject((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Completion Date</label>
              <input
                type="date"
                value={editingProject?.estimatedCompletionDate || ''}
                onChange={(e) => setEditingProject((prev) => ({ ...prev, estimatedCompletionDate: e.target.value }))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Site Foreman</label>
              <input
                type="text"
                value={editingProject?.siteForeman || ''}
                onChange={(e) => setEditingProject((prev) => ({ ...prev, siteForeman: e.target.value }))}
                placeholder="e.g. Godfrey Mathebula"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Initial Status</label>
              <select
                value={editingProject?.status || 'in_progress'}
                onChange={(e) => setEditingProject((prev) => ({ ...prev, status: e.target.value as ProjectStatus }))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="planning">Planning / Pre-Site</option>
                <option value="in_progress">In Progress</option>
                <option value="snagging">Finishing & Snags</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Project Notes</label>
            <textarea
              rows={2}
              value={editingProject?.notes || ''}
              onChange={(e) => setEditingProject((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Architectural plans approved; structural engineer booked for foundation signoff."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingProject(null);
              }}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold shadow-xs"
            >
              Save Project
            </button>
          </div>
        </form>
      </Modal>
    </PortalShell>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Projects...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}

