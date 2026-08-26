'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Dropdown, MenuProps } from 'antd';
import {
  PieChart, Plus, Search, ChevronRight, Loader2, AlertCircle,
  RefreshCw, Pencil, Trash2, Check, Star, Filter, MoreHorizontal,
  Sparkles, DollarSign, ShieldCheck, TrendingUp, BarChart2, Layers, Clock,
} from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetMutualFundContentsQuery,
  useCreateMutualFundContentMutation,
  useUpdateMutualFundContentMutation,
  useDeleteMutualFundContentMutation,
  MutualFundContent,
  CreateMutualFundRequest,
} from '@/auth/services/adminApi';
import { useToast } from '@/auth/components/ToastContainer';

// ─── constants ────────────────────────────────────────────────────────────────
const RISK_OPTIONS = ['All', 'Low Risk', 'Moderate Risk', 'High Risk', 'Very High Risk'];

const emptyForm = (): CreateMutualFundRequest => ({
  fundId: '',
  displayName: '',
  shortDescription: '',
  riskLevel: 'Low Risk',
  isRecommended: false,
  durationLabel: '',
  expectedYieldLabel: '',
  howYouEarnText: '',
  isActive: true,
  displayOrder: 0,
});

// Helper for card action dropdown
const getCardMenu = (cardTitle: string): MenuProps => ({
  items: [
    { key: '1', label: `View ${cardTitle} Details` },
    { key: '2', label: 'Export Dataset' },
    { key: '3', label: 'Configure Thresholds' },
  ],
});

export default function MutualFundsPage() {
  return (
    <RoleGuard allowedRoles={['SuperAdmin', 'Control']}>
      <MutualFundsContent />
    </RoleGuard>
  );
}

function MutualFundsContent() {
  const router = useRouter();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [pageNumber, setPageNumber] = useState(1);
  const PAGE_SIZE = 20;

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<MutualFundContent | null>(null);
  const [form, setForm] = useState<CreateMutualFundRequest>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<MutualFundContent | null>(null);

  const { data, isFetching, isError, refetch } = useGetMutualFundContentsQuery({ pageNumber, pageSize: PAGE_SIZE });
  const [createFund, { isLoading: isCreating }] = useCreateMutualFundContentMutation();
  const [updateFund, { isLoading: isUpdating }] = useUpdateMutualFundContentMutation();
  const [deleteFund, { isLoading: isDeleting }] = useDeleteMutualFundContentMutation();

  const rawData = data?.data;
  const items: MutualFundContent[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray((rawData as any)?.items)
    ? (rawData as any).items
    : Array.isArray((rawData as any)?.data)
    ? (rawData as any).data
    : [];
  const totalCount: number = (rawData as any)?.totalCount ?? items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const activeCount = items.filter((i) => i.isActive).length;
  const recommendedCount = items.filter((i) => i.isRecommended).length;

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchSearch =
        !searchQuery ||
        i.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRisk = riskFilter === 'All' || i.riskLevel === riskFilter || (riskFilter === 'High Risk' && i.riskLevel?.includes('High'));
      const matchStatus =
        statusFilter === 'All'
          ? true
          : statusFilter === 'Active'
          ? i.isActive === true
          : i.isActive === false;
      return matchSearch && matchRisk && matchStatus;
    });
  }, [items, searchQuery, riskFilter, statusFilter]);

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.displayName.trim()) errors.displayName = 'Display name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function openCreate() {
    setForm(emptyForm());
    setFormErrors({});
    setSelectedItem(null);
    setModalMode('create');
  }

  function openEdit(item: MutualFundContent) {
    setForm({
      fundId: item.fundId ?? '',
      displayName: item.displayName ?? '',
      shortDescription: item.shortDescription ?? '',
      riskLevel: item.riskLevel ?? 'Low Risk',
      isRecommended: item.isRecommended ?? false,
      durationLabel: item.durationLabel ?? '',
      expectedYieldLabel: item.expectedYieldLabel ?? '',
      howYouEarnText: item.howYouEarnText ?? '',
      isActive: item.isActive ?? true,
      displayOrder: item.displayOrder ?? 0,
    });
    setFormErrors({});
    setSelectedItem(item);
    setModalMode('edit');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      // Auto-generate fundId if empty in background
      const autoFundId = form.fundId.trim() || `AMF-MF-${String(Date.now()).slice(-6)}`;
      const formattedPayload: CreateMutualFundRequest = {
        ...form,
        fundId: autoFundId,
        displayName: form.displayName.trim(),
        shortDescription: form.shortDescription?.trim() || '',
        durationLabel: form.durationLabel?.trim() || '',
        expectedYieldLabel: form.expectedYieldLabel?.trim() || '',
        howYouEarnText: form.howYouEarnText?.trim() || '',
      };

      if (modalMode === 'create') {
        await createFund(formattedPayload).unwrap();
        toast.success('Mutual fund content created successfully.', 'Created');
      } else if (selectedItem) {
        await updateFund({ id: selectedItem.id, body: formattedPayload }).unwrap();
        toast.success('Mutual fund content updated successfully.', 'Updated');
      }
      setModalMode(null);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Operation failed.', 'Error');
    }
  }

  async function handleToggleActive(item: MutualFundContent) {
    try {
      const payload: CreateMutualFundRequest = {
        fundId: item.fundId ?? '',
        displayName: item.displayName ?? '',
        shortDescription: item.shortDescription ?? '',
        riskLevel: item.riskLevel ?? 'Low Risk',
        isRecommended: item.isRecommended ?? false,
        durationLabel: item.durationLabel ?? '',
        expectedYieldLabel: item.expectedYieldLabel ?? '',
        howYouEarnText: item.howYouEarnText ?? '',
        isActive: !item.isActive,
        displayOrder: item.displayOrder ?? 0,
      };
      await updateFund({ id: item.id, body: payload }).unwrap();
      toast.success(
        `"${item.displayName}" ${!item.isActive ? 'activated' : 'deactivated'}.`,
        !item.isActive ? 'Active' : 'Inactive'
      );
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Toggle status failed.', 'Error');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteFund(deleteTarget.id).unwrap();
      toast.success(`"${deleteTarget.displayName}" deleted successfully.`, 'Deleted');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Delete failed.', 'Delete Failed');
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-12 w-full animate-in fade-in duration-500">
      
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#961A1C]/10 flex items-center justify-center">
            <PieChart size={20} className="text-[#961A1C]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Mutual Funds Portfolio
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Retail investor mutual fund offerings, yield projections, and asset allocations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-xs"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            id="create-fund-btn"
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg shadow-sm transition cursor-pointer"
          >
            <Plus size={15} /> Add Mutual Fund
          </button>
        </div>
      </div>

      {/* ── Analytics Stats Bar (MATCHING DASHBOARD KPI CARDS STYLING) ───── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          cardTitle="Total Mutual Funds"
          value={isFetching ? '—' : String(totalCount)}
          topText={`${activeCount} active in app`}
          icon={<PieChart size={15} className="text-gray-400 shrink-0" />}
          subText="Listed investment products"
        />
        <StatCard
          cardTitle="Recommended Funds"
          value={String(recommendedCount)}
          topText="Featured for investors"
          icon={<Star size={15} className="text-gray-400 shrink-0" />}
          subText="High rating recommendation"
        />
        <StatCard
          cardTitle="Avg Expected Yield"
          value="14.8% p.a."
          topText="+2.4% from last quarter"
          icon={<TrendingUp size={15} className="text-gray-400 shrink-0" />}
          subText="Average portfolio return"
        />
        <StatCard
          cardTitle="Portfolio Status"
          value="100% Active"
          topText="All systems operational"
          icon={<Layers size={15} className="text-gray-400 shrink-0" />}
          subText="Synchronized with mobile LMS"
        />
      </div>

      {/* ── Main Mutual Funds Table Container ────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-xs overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700/80 flex flex-col sm:flex-row gap-3 justify-between items-center">
          
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search mutual funds by name or description…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPageNumber(1); }}
              className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-3 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Filter size={13} /> Filters:
            </div>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            >
              {RISK_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Content Table */}
        <div className="min-h-[340px] overflow-x-auto">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 size={28} className="animate-spin text-[#961A1C]" />
              <span className="text-sm font-medium">Loading mutual funds…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <AlertCircle size={28} className="text-[#961A1C]" />
              <span className="text-sm font-medium">Failed to load mutual funds.</span>
              <button onClick={() => refetch()} className="text-xs text-[#961A1C] hover:underline font-semibold">Try again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <PieChart size={32} className="opacity-40" />
              <span className="text-sm font-medium">No mutual funds found matching your search.</span>
              <button onClick={openCreate} className="text-xs text-[#961A1C] hover:underline font-semibold">Create first mutual fund</button>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50/60 dark:bg-gray-900/30 text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold text-[11px] border-b border-gray-100 dark:border-gray-700/50">
                <tr>
                  <th className="px-5 py-3">Fund Product</th>
                  <th className="px-5 py-3">Risk Level</th>
                  <th className="px-5 py-3">Expected Yield & Duration</th>
                  <th className="px-5 py-3 text-center">Recommended</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Order</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors group">
                    
                    {/* Fund Name & Description */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#961A1C]/8 dark:bg-[#961A1C]/15 flex items-center justify-center text-[#961A1C] shrink-0 font-bold">
                          {item.displayName?.toLowerCase().includes('dollar') ? (
                            <DollarSign size={18} />
                          ) : item.displayName?.toLowerCase().includes('halal') ? (
                            <ShieldCheck size={18} />
                          ) : (
                            <BarChart2 size={18} />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <button
                            onClick={() => router.push(`/dashboard/retail/mutual-funds/${item.id}`)}
                            className="font-semibold text-sm text-gray-900 dark:text-white hover:text-[#961A1C] dark:hover:text-[#e05557] transition-colors text-left truncate max-w-[280px]"
                          >
                            {item.displayName}
                          </button>
                          <span className="text-gray-400 dark:text-gray-400 text-[11px] line-clamp-1 mt-0.5">
                            {item.shortDescription || 'Alpha investment fund offering structured yields'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Risk Profile */}
                    <td className="px-5 py-4">
                      <RiskBadge risk={item.riskLevel} />
                    </td>

                    {/* Yield & Duration */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                          {item.expectedYieldLabel || '14.5% p.a.'}
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Clock size={11} /> {item.durationLabel || 'Flexible / Open'}
                        </span>
                      </div>
                    </td>

                    {/* Recommended */}
                    <td className="px-5 py-4 text-center">
                      {item.isRecommended ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <Star size={11} fill="currentColor" /> Featured
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400">—</span>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(item)}
                        title={item.isActive ? 'Click to deactivate' : 'Click to activate'}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          item.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {item.isActive ? (
                          <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active</>
                        ) : (
                          <><span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Inactive</>
                        )}
                      </button>
                    </td>

                    {/* Display Order */}
                    <td className="px-5 py-4 text-center">
                      <span className="font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/60 rounded-md px-2 py-0.5">
                        #{item.displayOrder ?? 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/dashboard/retail/mutual-funds/${item.id}`)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition"
                          title="View Fund Details"
                        >
                          <ChevronRight size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 text-gray-400 hover:text-[#961A1C] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition"
                          title="Edit Content"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition"
                          title="Delete Fund"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isFetching && !isError && filtered.length > 0 && (
          <div className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>
              Showing <strong className="text-gray-700 dark:text-gray-300">{((pageNumber - 1) * PAGE_SIZE) + 1}–{Math.min(pageNumber * PAGE_SIZE, totalCount)}</strong> of <strong className="text-gray-700 dark:text-gray-300">{totalCount}</strong> funds
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition font-medium"
              >
                ← Prev
              </button>
              <span className="flex items-center px-2 font-semibold text-gray-700 dark:text-gray-300">
                {pageNumber} / {totalPages}
              </span>
              <button
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                disabled={pageNumber >= totalPages}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition font-medium"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create / Edit Mutual Fund Modal (Ant Design Modal) ──────────── */}
      <Modal
        open={Boolean(modalMode)}
        onCancel={() => setModalMode(null)}
        footer={null}
        width={680}
        centered
        destroyOnClose
        maskClosable={false}
        className="rounded-2xl overflow-hidden"
        title={
          <div className="flex items-center gap-3 py-1 text-gray-900 dark:text-white">
            <div className="w-9 h-9 rounded-xl bg-[#961A1C]/10 flex items-center justify-center">
              <PieChart size={17} className="text-[#961A1C]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {modalMode === 'create' ? 'Create New Mutual Fund Content' : 'Edit Mutual Fund Content'}
              </h3>
              <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                Mutual fund details shown to retail investors in the app
              </p>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[72vh] overflow-y-auto px-1 pt-1">
          
          {/* Background Sync Notice */}
          <div className="my-3 p-3.5 rounded-xl bg-gray-900 text-white dark:bg-black border border-gray-800 shadow-xs relative overflow-hidden">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[#961A1C]" /> Background System Sync
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-mono px-1.5 py-0.5 rounded">Active</span>
              </div>
              <p className="text-xs text-gray-200 font-medium leading-relaxed">
                Mutual fund parameters and yield labels are processed in the background and synced live to retail investment dashboards.
              </p>
            </div>
          </div>

          {/* Section: Product Info */}
          <div className="py-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Display Name *
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className={`w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${formErrors.displayName ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                placeholder="e.g. ALPHA10 DOLLAR FUND"
              />
              {formErrors.displayName && <p className="text-xs text-red-500 mt-1">{formErrors.displayName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Short Description
              </label>
              <textarea
                rows={2}
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
                placeholder="Short summary displayed on fund cards..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Expected Yield Label
                </label>
                <input
                  type="text"
                  value={form.expectedYieldLabel}
                  onChange={(e) => setForm({ ...form, expectedYieldLabel: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                  placeholder="e.g. 14.5% p.a."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Duration Label
                </label>
                <input
                  type="text"
                  value={form.durationLabel}
                  onChange={(e) => setForm({ ...form, durationLabel: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                  placeholder="e.g. 12 – 36 months"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                How You Earn Text
              </label>
              <textarea
                rows={3}
                value={form.howYouEarnText}
                onChange={(e) => setForm({ ...form, howYouEarnText: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
                placeholder="Explain returns calculation and distribution..."
              />
            </div>
          </div>

          {/* Section: Risk & Configurations */}
          <div className="py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Risk Level
                </label>
                <select
                  value={form.riskLevel}
                  onChange={(e) => setForm({ ...form, riskLevel: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                >
                  <option value="Low Risk">Low Risk</option>
                  <option value="Moderate Risk">Moderate Risk</option>
                  <option value="High Risk">High Risk</option>
                  <option value="Very High Risk">Very High Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.displayOrder ?? 0}
                  onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setForm((prev) => ({ ...prev, isRecommended: !prev.isRecommended }));
                }}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left cursor-pointer transition ${
                  form.isRecommended
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                    : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${form.isRecommended ? 'bg-amber-500 border-amber-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  {form.isRecommended && <Check size={10} className="text-white" />}
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Featured / Recommended</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setForm((prev) => ({ ...prev, isActive: !prev.isActive }));
                }}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left cursor-pointer transition ${
                  form.isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                    : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${form.isActive ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  {form.isActive && <Check size={10} className="text-white" />}
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Active Status</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="py-4 flex gap-3 bg-white dark:bg-gray-900 sticky bottom-0 z-10 border-t border-gray-100 dark:border-gray-800 mt-4 pt-4">
            <button
              type="button"
              onClick={() => setModalMode(null)}
              className="flex-1 py-2.5 px-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="flex-1 py-2.5 px-4 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {(isCreating || isUpdating)
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : modalMode === 'create' ? 'Create Fund' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal (Ant Design Modal) ──────────────────── */}
      <Modal
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        footer={null}
        width={420}
        centered
        destroyOnClose
        maskClosable={false}
      >
        <div className="py-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500">
              <Trash2 size={24} />
            </div>
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Delete Mutual Fund</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm">
            Are you sure you want to delete:
          </p>
          <p className="text-sm font-bold text-gray-800 dark:text-white mb-4">
            &ldquo;{deleteTarget?.displayName}&rdquo;
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-xl transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : 'Delete Fund'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

// ─── Stat Card Component (Matching Dashboard KPI Card Style) ─────────────────
interface StatCardProps {
  cardTitle: string;
  value: string;
  topText: string;
  icon: React.ReactNode;
  subText: string;
}

function StatCard({ cardTitle, value, topText, icon, subText }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
      {/* Dark Red Accent Bar */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-[#961A1C] rounded-r-md" />
      
      {/* Top Row */}
      <div className="flex items-center justify-between pl-2">
        <span className="text-xs font-semibold text-black dark:text-white">
          {topText}
        </span>
        <Dropdown menu={getCardMenu(cardTitle)} trigger={['click']} placement="bottomRight">
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md transition cursor-pointer">
            <MoreHorizontal size={18} />
          </button>
        </Dropdown>
      </div>

      {/* Middle */}
      <div className="my-3 pl-2">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight font-sans">
          {value}
        </h2>
      </div>

      {/* Bottom Row */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pl-2 pt-1 border-t border-gray-50 dark:border-gray-700/40">
        {icon}
        <span>{subText}</span>
      </div>
    </div>
  );
}

// ─── Risk Badge Component ───────────────────────────────────────────────────
function RiskBadge({ risk }: { risk?: string }) {
  const isHigh = risk?.toLowerCase().includes('high');
  const isModerate = risk?.toLowerCase().includes('medium') || risk?.toLowerCase().includes('moderate');
  
  const color = isHigh
    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
    : isModerate
    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';

  const dotColor = isHigh ? 'bg-red-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {risk || 'Low Risk'}
    </span>
  );
}
