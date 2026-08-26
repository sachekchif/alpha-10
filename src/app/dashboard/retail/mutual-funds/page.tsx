'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Drawer, Select, Switch } from 'antd';
import {
  PieChart, Plus, Search, Loader2, AlertCircle,
  RefreshCw, Pencil, Trash2, Check, Star, Filter,
  Sparkles, DollarSign, ShieldCheck, TrendingUp, BarChart2, Layers, Clock,
  Wifi, Play, Upload, X, ArrowUpRight,
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

// ─── constants & helpers ───────────────────────────────────────────────────────
const RISK_OPTIONS = ['All', 'Low Risk', 'Moderate Risk', 'High Risk', 'Very High Risk'];

const RISK_META: Record<string, { color: string; bg: string; label: string }> = {
  'Low Risk': { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800', label: 'Low Risk' },
  'Moderate Risk': { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800', label: 'Moderate' },
  'High Risk': { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800', label: 'High Risk' },
  'Very High Risk': { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800', label: 'Very High' },
};

const emptyForm = (): CreateMutualFundRequest => ({
  fundId: '',
  displayName: '',
  shortDescription: '',
  riskLevel: 'Low Risk',
  isRecommended: false,
  durationLabel: '12 – 36 months',
  expectedYieldLabel: '14.5% p.a.',
  howYouEarnText: 'Yield is calculated daily and paid monthly into your investment wallet.',
  isActive: true,
  displayOrder: 0,
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

  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<MutualFundContent | null>(null);
  const [form, setForm] = useState<CreateMutualFundRequest>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [coverImage, setCoverImage] = useState<string | null>(null);
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

  // Find maximum display order for dynamic auto-assignment
  const maxDisplayOrder = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.max(...items.map((i) => i.displayOrder ?? 0));
  }, [items]);

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
    setForm({
      ...emptyForm(),
      displayOrder: maxDisplayOrder + 1,
    });
    setCoverImage(null);
    setFormErrors({});
    setSelectedItem(null);
    setDrawerMode('create');
  }

  function openEdit(item: MutualFundContent) {
    setForm({
      fundId: item.fundId ?? '',
      displayName: item.displayName ?? '',
      shortDescription: item.shortDescription ?? '',
      riskLevel: item.riskLevel ?? 'Low Risk',
      isRecommended: item.isRecommended ?? false,
      durationLabel: item.durationLabel ?? '12 – 36 months',
      expectedYieldLabel: item.expectedYieldLabel ?? '14.5% p.a.',
      howYouEarnText: item.howYouEarnText ?? '',
      isActive: item.isActive ?? true,
      displayOrder: item.displayOrder ?? 0,
    });
    setCoverImage(null);
    setFormErrors({});
    setSelectedItem(item);
    setDrawerMode('edit');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const autoFundId = form.fundId.trim() || `AMF-MF-${String(Date.now()).slice(-6)}`;
      const formattedPayload: CreateMutualFundRequest = {
        ...form,
        fundId: autoFundId,
        displayName: form.displayName.trim(),
        shortDescription: form.shortDescription?.trim() || '',
        durationLabel: form.durationLabel?.trim() || '',
        expectedYieldLabel: form.expectedYieldLabel?.trim() || '',
        howYouEarnText: form.howYouEarnText?.trim() || '',
        displayOrder: drawerMode === 'create' ? maxDisplayOrder + 1 : form.displayOrder,
      };

      if (drawerMode === 'create') {
        await createFund(formattedPayload).unwrap();
        toast.success('Mutual fund content created successfully.', 'Created');
      } else if (selectedItem) {
        await updateFund({ id: selectedItem.id, body: formattedPayload }).unwrap();
        toast.success('Mutual fund content updated successfully.', 'Updated');
      }
      setDrawerMode(null);
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
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            id="create-fund-btn"
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus size={15} /> Add Mutual Fund
          </button>
        </div>
      </div>

      {/* ── Analytics Stats Bar ─────────────────────────────────────────── */}
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
              className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
              <Filter size={13} /> Filters:
            </div>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            >
              {RISK_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Content Table */}
        <div className="min-h-[340px]">
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
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {/* Column Headers */}
              <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-2.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/60 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800 text-center">
                <div className="col-span-1">S/N</div>
                <div className="col-span-4 text-left">Fund Product / Description</div>
                <div className="col-span-2">Risk Level</div>
                <div className="col-span-2">Expected Yield & Duration</div>
                <div className="col-span-1">Featured</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {filtered.map((item, idx) => (
                <MutualFundRow
                  key={item.id}
                  item={item}
                  index={idx}
                  onView={() => router.push(`/dashboard/retail/mutual-funds/${item.id}`)}
                  onEdit={() => openEdit(item)}
                  onDelete={() => setDeleteTarget(item)}
                />
              ))}
            </div>
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
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition font-medium cursor-pointer"
              >
                ← Prev
              </button>
              <span className="flex items-center px-2 font-semibold text-gray-700 dark:text-gray-300">
                {pageNumber} / {totalPages}
              </span>
              <button
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                disabled={pageNumber >= totalPages}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition font-medium cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create / Edit Mutual Fund Drawer (Ant Design Drawer) ─────────── */}
      <Drawer
        open={Boolean(drawerMode)}
        onClose={() => setDrawerMode(null)}
        width={560}
        destroyOnClose
        maskClosable={false}
        className="dark:bg-gray-900"
        title={
          <div className="flex items-center justify-between text-gray-900 dark:text-white">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white">
              {drawerMode === 'create' ? 'Add Mutual Fund' : 'Edit Mutual Fund'}
            </h3>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">

          <div className="flex-1 overflow-y-auto space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            
            {/* Top Cover Image / App Card Preview */}
            <div className="relative w-full h-48 bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 flex flex-col items-center justify-center group">
              {coverImage ? (
                <>
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover opacity-85" />
                  <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm mb-1">
                      {form.expectedYieldLabel || '14.5% p.a.'}
                    </span>
                    <span className="text-white font-bold text-base truncate max-w-xs">{form.displayName || 'Mutual Fund Title'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full p-4 hover:bg-gray-800/60 transition text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                    <TrendingUp size={22} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200">
                    <Upload size={14} /> Click or drop mutual fund cover image
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">App preview thumbnail placeholder (UI Only)</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCoverImage(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* Display Name / Header */}
            <div>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Fund Name (e.g. Fixed Income Portfolio)"
                className={`w-full text-xl sm:text-2xl font-bold bg-transparent text-gray-900 dark:text-white border-b-2 border-dashed focus:border-solid border-gray-300 dark:border-gray-700 py-1.5 focus:border-[#961A1C] outline-none transition placeholder:text-gray-300 dark:placeholder:text-gray-600 ${
                  formErrors.displayName ? 'border-red-500' : ''
                }`}
              />
              {formErrors.displayName && <p className="text-xs text-red-500 mt-1">{formErrors.displayName}</p>}
              <p className="text-[11px] text-gray-400 mt-1">Retail investor mobile fund card header</p>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Short Description
              </label>
              <textarea
                rows={2}
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
                placeholder="Targeting long term capital appreciation through equity investments..."
              />
            </div>

            {/* Yield Label & Duration Label */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Expected Yield Label (% p.a.)
                </label>
                <input
                  type="text"
                  value={form.expectedYieldLabel}
                  onChange={(e) => setForm({ ...form, expectedYieldLabel: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
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
                  className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                  placeholder="e.g. 12 – 36 months"
                />
              </div>
            </div>

            {/* Risk Level Selector */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Wifi size={16} className="text-[#961A1C]" />
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  Risk Profile
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Low Risk', 'Moderate Risk', 'High Risk', 'Very High Risk'].map((r) => {
                  const active = form.riskLevel === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, riskLevel: r })}
                      className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        active
                          ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-400 ring-2 ring-current shadow-xs'
                          : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Wifi size={12} className={active ? 'animate-pulse' : 'opacity-60'} />
                      <span>{r.replace(' Risk', '')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* How You Earn Text */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                How You Earn & Interest Terms
              </label>
              <textarea
                rows={3}
                value={form.howYouEarnText}
                onChange={(e) => setForm({ ...form, howYouEarnText: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
                placeholder="You earn as the prices of the funds in the portfolio change..."
              />
            </div>

            {/* Switches: Recommended & Active */}
            <div className="space-y-3">
              {/* Featured / Recommended */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="pr-3">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <Star size={14} className="text-amber-500" /> Featured / Recommended Fund
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Appears in the Recommended tab for investors</p>
                </div>
                <Switch
                  checked={form.isRecommended}
                  onChange={(checked) => setForm({ ...form, isRecommended: checked })}
                />
              </div>

              {/* Active Status */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                      Active
                    </span>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                      Retail users can now have access to this mutual fund
                    </p>
                  </div>
                  <Switch
                    checked={form.isActive}
                    onChange={(checked) => setForm({ ...form, isActive: checked })}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Sticky Bottom Action Button */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-4 pb-1 mt-4">
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="w-full py-3.5 px-4 bg-[#961A1C] hover:bg-[#7a1517] text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isCreating || isUpdating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              <span>{drawerMode === 'create' ? 'Create Mutual Fund' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Drawer>

      {/* Delete confirmation (Ant Design Modal) */}
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
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
              <Trash2 size={22} />
            </div>
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Delete Mutual Fund</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Are you sure you want to delete <strong className="text-gray-800 dark:text-white">&ldquo;{deleteTarget?.displayName}&rdquo;</strong>? This cannot be undone.
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
              {isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : 'Delete Fund'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({
  cardTitle, value, topText, icon, subText,
}: { cardTitle: string; value: string; topText: string; icon: React.ReactNode; subText: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
        <span className="font-semibold uppercase tracking-wider text-[10px]">{cardTitle}</span>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
        <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">{topText}</p>
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 border-t border-gray-50 dark:border-gray-800 pt-2">{subText}</p>
    </div>
  );
}

function MutualFundRow({
  item, index, onView, onEdit, onDelete,
}: { item: MutualFundContent; index: number; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const riskMeta = RISK_META[item.riskLevel || 'Low Risk'] ?? RISK_META['Low Risk'];

  return (
    <div className="grid grid-cols-12 gap-2 items-center px-5 py-3.5 hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors group border-b border-gray-50 dark:border-gray-800/40">
      {/* 1. S/N */}
      <div className="col-span-12 md:col-span-1 flex justify-center">
        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-2.5 py-1 font-mono">
          #{item.displayOrder || index + 1}
        </span>
      </div>

      {/* 2. Fund Product & Description Stack */}
      <div className="col-span-12 md:col-span-4 min-w-0 flex flex-col justify-center">
        <button
          onClick={onView}
          className="font-bold text-sm text-gray-900 dark:text-white hover:text-[#961A1C] dark:hover:text-[#e05557] transition-colors text-left truncate block"
          title={item.displayName}
        >
          {item.displayName}
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-sm mt-0.5">
          {item.shortDescription || 'Alpha investment fund offering structured yields'}
        </p>
      </div>

      {/* 3. Risk Level with Wifi icon */}
      <div className="hidden md:flex col-span-2 justify-center items-center">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${riskMeta.bg} ${riskMeta.color}`}>
          <Wifi size={11} />
          {item.riskLevel || 'Low Risk'}
        </span>
      </div>

      {/* 4. Expected Yield & Duration */}
      <div className="hidden md:flex col-span-2 flex-col justify-center items-center text-xs">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <TrendingUp size={11} /> {item.expectedYieldLabel || '14.5% p.a.'}
        </span>
        <span className="text-[10px] text-gray-400 mt-1">
          {item.durationLabel || '12 – 36 months'}
        </span>
      </div>

      {/* 5. Recommended Status */}
      <div className="hidden md:flex col-span-1 justify-center items-center">
        {item.isRecommended ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400" title="Featured / Recommended">
            <Star size={13} fill="currentColor" /> Yes
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </div>

      {/* 6. Actions (View Details text + Edit & Delete icons) */}
      <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
        <button
          onClick={onView}
          className="text-xs font-semibold text-[#961A1C] hover:underline cursor-pointer"
        >
          View Details
        </button>
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-[#961A1C] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition cursor-pointer"
          title="Edit Fund"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition cursor-pointer"
          title="Delete Fund"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
