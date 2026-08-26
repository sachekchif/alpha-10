'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Dropdown, MenuProps, Modal, Drawer, Select, Switch } from 'antd';
import {
  BookOpen, Plus, Search, ChevronRight, X, Loader2, AlertCircle,
  RefreshCw, Pencil, Trash2, Check, BarChart2, Users, Clock,
  TrendingUp, Eye, Shield, Zap, DollarSign, ToggleLeft, ToggleRight,
  GraduationCap, Target, FileText, Filter, MoreHorizontal, Sparkles,
  Play, Upload, Wifi, Image as ImageIcon,
} from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetInvestmentEducationsQuery,
  useCreateInvestmentEducationMutation,
  useUpdateInvestmentEducationMutation,
  useDeleteInvestmentEducationMutation,
  InvestmentEducation,
  CreateInvestmentEducationRequest,
} from '@/auth/services/adminApi';
import { useToast } from '@/auth/components/ToastContainer';

// ─── constants ────────────────────────────────────────────────────────────────
const RISK_LEVELS = ['Low', 'Medium', 'High', 'Very High'] as const;
type RiskLevel = typeof RISK_LEVELS[number];

const RISK_META: Record<RiskLevel, { color: string; bg: string; dot: string }> = {
  Low: { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', dot: 'bg-emerald-500' },
  Medium: { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', dot: 'bg-amber-500' },
  High: { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30', dot: 'bg-orange-500' },
  'Very High': { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', dot: 'bg-red-500' },
};

const INVESTMENT_ICONS: Record<string, React.ReactNode> = {
  mutual_funds: <BarChart2 size={20} />,
  treasury_bills: <Shield size={20} />,
  fixed_deposit: <DollarSign size={20} />,
  bonds: <TrendingUp size={20} />,
  equities: <Zap size={20} />,
  savings: <Target size={20} />,
  investment_banking: <DollarSign size={20} />,
};

const EDUCATION_TYPES = [
  { value: 'mutual_funds', label: 'Mutual Funds' },
  { value: 'investment_banking', label: 'Investment Banking' },
  { value: 'treasury_bills', label: 'Treasury Bills' },
  { value: 'fixed_deposit', label: 'Fixed Deposit' },
  { value: 'bonds', label: 'Bonds' },
  { value: 'equities', label: 'Equities' },
  { value: 'savings', label: 'Savings' },
  { value: 'eurobonds', label: 'Eurobonds' },
];

const TAG_OPTIONS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Expert', label: 'Expert' },
];

const CATEGORY_OPTIONS = [
  'Fixed Income', 'Equity', 'Money Market', 'Savings', 'Alternative', 'USD Investment', 'Investment Banking',
];

const emptyForm = (): CreateInvestmentEducationRequest & { category?: string; tags?: string } => ({
  code: 'mutual_funds',
  title: '',
  heroText: '',
  detailsText: '',
  howItWorksText: '',
  riskLevel: 'Low',
  capitalGuaranteed: false,
  returnsGuaranteed: false,
  withdrawalRestrictions: false,
  isActive: true,
  displayOrder: 0,
  category: 'Fixed Income',
  tags: 'Intermediate',
});

// ─── page guard ───────────────────────────────────────────────────────────────
export default function InvestmentEducationPage() {
  return (
    <RoleGuard allowedRoles={['SuperAdmin', 'Control']}>
      <InvestmentEducationContent />
    </RoleGuard>
  );
}

// ─── main content ─────────────────────────────────────────────────────────────
function InvestmentEducationContent() {
  const router = useRouter();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [pageNumber, setPageNumber] = useState(1);
  const PAGE_SIZE = 20;

  // Drawer & Form State
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<InvestmentEducation | null>(null);
  const [form, setForm] = useState<ReturnType<typeof emptyForm>>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [steps, setSteps] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<InvestmentEducation | null>(null);

  // RTK Query
  const { data, isFetching, isError, refetch } = useGetInvestmentEducationsQuery({ pageNumber, pageSize: PAGE_SIZE });
  const [createItem, { isLoading: isCreating }] = useCreateInvestmentEducationMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateInvestmentEducationMutation();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteInvestmentEducationMutation();

  // Parse items from various API shapes
  const rawData = data?.data;
  const items: InvestmentEducation[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray((rawData as any)?.items)
      ? (rawData as any).items
      : Array.isArray((rawData as any)?.data)
        ? (rawData as any).data
        : [];
  const totalCount = (rawData as any)?.totalCount ?? items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const activeCount = items.filter((i) => i.isActive).length;

  // Client-side filter (remove once server-side search/filter is available)
  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchSearch =
        !searchQuery ||
        i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.code?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRisk = riskFilter === 'All' || i.riskLevel === riskFilter;
      const matchStatus = statusFilter === 'All'
        ? true
        : statusFilter === 'Active'
          ? i.isActive === true
          : i.isActive === false;
      return matchSearch && matchRisk && matchStatus;
    });
  }, [items, searchQuery, riskFilter, statusFilter]);

  // ── form helpers ────────────────────────────────────────────────────────────
  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.code.trim()) errors.code = 'Education type is required';
    if (!form.title.trim()) errors.title = 'Title is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function openCreate() {
    const maxOrder = items.reduce((max, i) => Math.max(max, i.displayOrder ?? 0), 0);
    setForm({
      ...emptyForm(),
      code: 'mutual_funds',
      displayOrder: maxOrder + 1,
      category: 'Fixed Income',
      tags: 'Intermediate',
    });
    setSteps([
      'Choose a fund that matches your financial goals.',
      'Deposit funds into your preferred allocation.',
      'Track returns and reinvest earnings seamlessly.',
    ]);
    setCoverImage(null);
    setFormErrors({});
    setSelectedItem(null);
    setDrawerMode('create');
  }

  function openEdit(item: InvestmentEducation) {
    const parsedSteps = item.howItWorksText
      ? item.howItWorksText.split('\n').map((s) => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)
      : [];

    setForm({
      code: item.code ?? 'mutual_funds',
      title: item.title ?? '',
      heroText: item.heroText ?? '',
      detailsText: item.detailsText ?? '',
      howItWorksText: item.howItWorksText ?? '',
      riskLevel: item.riskLevel ?? 'Low',
      capitalGuaranteed: item.capitalGuaranteed ?? false,
      returnsGuaranteed: item.returnsGuaranteed ?? false,
      withdrawalRestrictions: item.withdrawalRestrictions ?? false,
      isActive: item.isActive ?? true,
      displayOrder: item.displayOrder ?? 0,
      category: 'Fixed Income',
      tags: 'Intermediate',
    });
    setSteps(parsedSteps.length > 0 ? parsedSteps : ['Choose a fund that matches your goals.']);
    setCoverImage(null);
    setFormErrors({});
    setSelectedItem(item);
    setDrawerMode('edit');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const { category, tags, ...apiPayload } = form;
      const formattedSteps = steps
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s, idx) => `${idx + 1}. ${s}`)
        .join('\n');

      const formattedPayload: CreateInvestmentEducationRequest = {
        ...apiPayload,
        code: apiPayload.code.trim().toLowerCase().replace(/\s+/g, '_'),
        title: apiPayload.title.trim(),
        heroText: apiPayload.heroText?.trim() || '',
        detailsText: apiPayload.detailsText?.trim() || '',
        howItWorksText: formattedSteps || apiPayload.howItWorksText?.trim() || '',
      };

      if (drawerMode === 'create') {
        await createItem(formattedPayload).unwrap();
        toast.success('Education content created successfully.', 'Created');
      } else if (selectedItem) {
        await updateItem({ id: selectedItem.id, body: formattedPayload }).unwrap();
        toast.success('Education content updated successfully.', 'Updated');
      }
      setDrawerMode(null);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || err?.data?.message || 'Operation failed.', 'Error');
    }
  }

  async function handleToggleActive(item: InvestmentEducation) {
    try {
      const payload: CreateInvestmentEducationRequest = {
        code: item.code ?? '',
        title: item.title ?? '',
        heroText: item.heroText ?? '',
        detailsText: item.detailsText ?? '',
        howItWorksText: item.howItWorksText ?? '',
        riskLevel: item.riskLevel ?? 'Low',
        capitalGuaranteed: item.capitalGuaranteed ?? false,
        returnsGuaranteed: item.returnsGuaranteed ?? false,
        withdrawalRestrictions: item.withdrawalRestrictions ?? false,
        isActive: !item.isActive,
        displayOrder: item.displayOrder ?? 0,
      };
      await updateItem({ id: item.id, body: payload }).unwrap();
      toast.success(
        `"${item.title}" ${!item.isActive ? 'published' : 'set to draft'}.`,
        !item.isActive ? 'Published' : 'Unpublished',
      );
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Toggle failed.', 'Error');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteItem(deleteTarget.id).unwrap();
      toast.success(`"${deleteTarget.title}" has been deleted.`, 'Deleted');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Delete failed.', 'Delete Failed');
    }
  }

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 pb-12 w-full">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-medium text-gray-900 dark:text-white leading-tight">
              Admin Education
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              LMS content management for admin to help retail users understand what to invest in
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            id="create-education-btn"
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-md shadow-sm transition"
          >
            <Plus size={15} /> Add Content
          </button>
        </div>
      </div>

      {/* ── Analytics Stats Bar ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          cardTitle="Total Modules"
          value={isFetching ? '—' : String(totalCount)}
          topText={`${activeCount} published`}
          icon={<FileText size={15} className="text-gray-400 shrink-0" />}
          subText="Delivered to client"
        />
        <StatCard
          cardTitle="Total Enrolled"
          value="48,200"
          topText="+18% from the last month"
          icon={<Users size={15} className="text-gray-400 shrink-0" />}
          subText="Across all modules"
        />
        <StatCard
          cardTitle="Avg Completion"
          value="71.4%"
          topText="+4.2% from the last month"
          icon={<BarChart2 size={15} className="text-gray-400 shrink-0" />}
          subText="Module completion rate"
        />
        <StatCard
          cardTitle="Avg Read Time"
          value="4.2 min"
          topText="-0.8% from last month"
          icon={<Clock size={15} className="text-gray-400 shrink-0" />}
          subText="Average per module"
        />
      </div>

      {/* ── Main Content Card ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3 justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search by title or code…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPageNumber(1); }}
              className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-8 pr-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Filter size={13} /> Filters:
            </div>

            {/* Risk Filter */}
            <div className="flex items-center gap-1">
              {(['All', ...RISK_LEVELS] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${riskFilter === r
                    ? 'bg-[#961A1C] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[320px]">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 size={28} className="animate-spin text-[#961A1C]" />
              <span className="text-sm font-medium">Loading education content…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <AlertCircle size={28} className="text-[#961A1C]" />
              <span className="text-sm font-medium">Failed to load content.</span>
              <button onClick={() => refetch()} className="text-xs text-[#961A1C] hover:underline font-semibold">Try again</button>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onCreateClick={openCreate} hasSearch={!!searchQuery} />
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {/* Column Headers */}
              <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-2.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/60 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800 text-center">
                <div className="col-span-1">S/N</div>
                <div className="col-span-3 text-left">Title / Description</div>
                <div className="col-span-2 text-left">Module</div>
                <div className="col-span-1">Risk Level</div>
                <div className="col-span-1">Capital</div>
                <div className="col-span-1">Returns</div>
                <div className="col-span-1">Withdrawal</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {filtered.map((item, idx) => (
                <EducationRow
                  key={item.id}
                  item={item}
                  index={idx}
                  onView={() => router.push(`/dashboard/retail/education/${item.id}`)}
                  onEdit={() => openEdit(item)}
                  onDelete={() => setDeleteTarget(item)}
                  onToggle={() => handleToggleActive(item)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isFetching && !isError && filtered.length > 0 && (
          <div className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>
              Showing{' '}
              <strong className="text-gray-700 dark:text-gray-300">{((pageNumber - 1) * PAGE_SIZE) + 1}–{Math.min(pageNumber * PAGE_SIZE, totalCount)}</strong>{' '}
              of <strong className="text-gray-700 dark:text-gray-300">{totalCount}</strong> modules
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

      {/* ── Create / Edit Drawer (Ant Design Drawer) ────────────────────── */}
      <Drawer
        open={Boolean(drawerMode)}
        onClose={() => setDrawerMode(null)}
        width={560}
        destroyOnClose
        maskClosable={false}
        className="dark:bg-gray-900"
        title={
          <div className="flex items-center justify-between  text-gray-900 dark:text-white">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                  {drawerMode === 'create' ? 'Add New Education Module' : 'Edit Education Module'}
                </h3>
              </div>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">

          <div className="flex-1 overflow-y-auto space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Top Cover Image Uploading & Preview Area (App structure) */}
            <div className="relative w-full h-48 bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 flex flex-col items-center justify-center group">
              {coverImage ? (
                <>
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover opacity-85" />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                      <Play size={20} className="ml-1 fill-white" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full p-4 hover:bg-gray-800/60 transition text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-red-600/20 text-[#961A1C] flex items-center justify-center mb-2">
                    <Play size={20} className="ml-1 fill-[#961A1C]" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200">
                    <Upload size={14} /> Click or drop cover media thumbnail
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">App thumbnail preview placeholder (UI Only)</p>
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

            {/* Tag Badge Display & Dropdown */}
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/30">
                {form.tags || 'Intermediate'}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Tag Level:</span>
                <Select
                  value={form.tags || 'Intermediate'}
                  onChange={(val) => setForm({ ...form, tags: val })}
                  options={TAG_OPTIONS}
                  className="w-36 text-xs"
                  size="small"
                />
              </div>
            </div>

            {/* Title Field (Large heading style like on app) */}
            <div>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Module Title (e.g. Understanding Mutual Funds)"
                className={`w-full text-xl sm:text-2xl font-bold bg-transparent text-gray-900 dark:text-white border-b-2 border-dashed focus:border-solid border-gray-300 dark:border-gray-700 py-1.5 focus:border-[#961A1C] outline-none transition placeholder:text-gray-300 dark:placeholder:text-gray-600 ${formErrors.title ? 'border-red-500' : ''
                  }`}
              />
              {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
              <p className="text-[11px] text-gray-400 mt-1">12 min read · Retail investor app header</p>
            </div>

            {/* Education Type (Slug/Code Dropdown) & Category Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Education Type *
                </label>
                <Select
                  value={form.code || 'mutual_funds'}
                  onChange={(val) => setForm({ ...form, code: val })}
                  options={EDUCATION_TYPES}
                  className="w-full"
                />
                {formErrors.code && <p className="text-xs text-red-500 mt-1">{formErrors.code}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Category Type
                </label>
                <Select
                  value={form.category || CATEGORY_OPTIONS[0]}
                  onChange={(val) => setForm({ ...form, category: val })}
                  options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Hero & Overview Text */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Hero Headline
                </label>
                <textarea
                  rows={2}
                  value={form.heroText}
                  onChange={(e) => setForm({ ...form, heroText: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
                  placeholder="A mutual fund pools money from many investors..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Details & Description
                </label>
                <textarea
                  rows={3}
                  value={form.detailsText}
                  onChange={(e) => setForm({ ...form, detailsText: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
                  placeholder="On Alpha10, mutual funds are a good starting point if you want broad exposure..."
                />
              </div>
            </div>

            {/* How It Works Section - Connected Steps */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  How It Works (Steps)
                </label>
                <button
                  type="button"
                  onClick={() => setSteps([...steps, ''])}
                  className="flex items-center gap-1 text-xs text-[#961A1C] hover:underline font-semibold"
                >
                  <Plus size={13} /> Add Step
                </button>
              </div>

              <div className="relative pl-6 space-y-4">
                {/* Vertical Connecting Line */}
                {steps.length > 1 && (
                  <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-200 dark:bg-gray-700" />
                )}

                {steps.map((stepText, idx) => (
                  <div key={idx} className="relative flex items-center gap-3 group">
                    {/* Step Badge */}
                    <div className="absolute -left-6 z-10 w-6 h-6 rounded-full bg-[#961A1C] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                      {idx + 1}
                    </div>

                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={stepText}
                        onChange={(e) => {
                          const updated = [...steps];
                          updated[idx] = e.target.value;
                          setSteps(updated);
                        }}
                        placeholder={`Step ${idx + 1} description...`}
                        className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                      />
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Level with Wifi icon */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Wifi size={16} className="text-[#961A1C]" />
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  Risk Level
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {RISK_LEVELS.map((r) => {
                  const active = form.riskLevel === r;
                  const wifiColors: Record<RiskLevel, string> = {
                    Low: 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800',
                    Medium: 'text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800',
                    High: 'text-orange-700 bg-orange-50 border-orange-300 dark:bg-orange-950/40 dark:border-orange-800',
                    'Very High': 'text-red-700 bg-red-50 border-red-300 dark:bg-red-950/40 dark:border-red-800',
                  };
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, riskLevel: r })}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${active
                        ? `${wifiColors[r]} ring-2 ring-current shadow-xs`
                        : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <Wifi size={13} className={active ? 'animate-pulse' : 'opacity-60'} />
                      <span>{r}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Capital, Returns, Withdrawal Questions */}
            <div className="space-y-3">
              {/* Capital */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="pr-3">
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    Would the user need capital to understand this lecture?
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Capital Guaranteed</p>
                </div>
                <Switch
                  checked={form.capitalGuaranteed}
                  onChange={(checked) => setForm({ ...form, capitalGuaranteed: checked })}
                />
              </div>

              {/* Returns */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="pr-3">
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    The customer would get ROI after taking this lecture
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Returns Guaranteed</p>
                </div>
                <Switch
                  checked={form.returnsGuaranteed}
                  onChange={(checked) => setForm({ ...form, returnsGuaranteed: checked })}
                />
              </div>

              {/* Withdrawal */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="pr-3">
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    Would the user have restrictions on withdrawal?
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Withdrawal Restrictions</p>
                </div>
                <Switch
                  checked={form.withdrawalRestrictions}
                  onChange={(checked) => setForm({ ...form, withdrawalRestrictions: checked })}
                />
              </div>
            </div>

            {/* Active Status Section */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                    Active
                  </span>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                    Retail users can now have access to this lecture
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
                  onChange={(checked) => setForm({ ...form, isActive: checked })}
                />
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Button (Styled like mobile app primary button) */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-4 pb-1 mt-4">
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-2 py-3.5 px-4 bg-[#961A1C] hover:bg-[#7a1517] text-white rounded-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isCreating || isUpdating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              <span>{drawerMode === 'create' ? 'Publish Course' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Drawer>

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
          <h3 className="text-base font-bold text-center text-gray-900 dark:text-white mb-2">Delete Module</h3>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-1 text-sm">
            You are about to permanently delete:
          </p>
          <p className="text-center text-sm font-bold text-gray-800 dark:text-white mb-4">
            &ldquo;{deleteTarget?.title}&rdquo;
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg px-4 py-2.5 mb-5">
            <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
              Enrolled investors will lose access to this content. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-xl transition-colors text-sm cursor-pointer"
            >
              Keep It
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : 'Delete Module'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

// Card Options Dropdown items
const getCardMenu = (cardTitle: string): MenuProps => ({
  items: [
    { key: '1', label: `View ${cardTitle} Details` },
    { key: '2', label: 'Export Dataset' },
    { key: '3', label: 'Configure Thresholds' },
  ],
});

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
      {/* Small bar at middle left of the card in dark red (#961A1C) */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-[#961A1C] rounded-r-md" />

      {/* Top Row: Trend Badge on Left + Options Menu on Right */}
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

      {/* Middle: Numeric Display with semibold font weight */}
      <div className="my-3 pl-2">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight font-sans">
          {value}
        </h2>
      </div>

      {/* Bottom Row: Icon + Subtitle text */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pl-2 pt-1 border-t border-gray-50 dark:border-gray-700/40">
        {icon}
        <span>{subText}</span>
      </div>
    </div>
  );
}

function EducationRow({
  item, index, onView, onEdit, onDelete, onToggle,
}: {
  item: InvestmentEducation;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const risk = (item.riskLevel || 'Low') as RiskLevel;
  const meta = RISK_META[risk] ?? RISK_META['Low'];
  const iconKey = item.code?.toLowerCase();
  const icon = INVESTMENT_ICONS[iconKey ?? ''] ?? <BookOpen size={18} />;

  const formatModuleCode = (code?: string) => {
    if (!code) return '—';
    const found = EDUCATION_TYPES.find((t) => t.value === code);
    if (found) return found.label;
    return code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="grid grid-cols-12 gap-3 items-center px-5 py-3.5 hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors group border-b border-gray-50 dark:border-gray-800/40">
      {/* 1. S/N */}
      <div className="col-span-12 md:col-span-1 flex justify-center">
        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-2.5 py-1 font-mono">
          #{item.displayOrder || index + 1}
        </span>
      </div>

      {/* 2. Title & Description */}
      <div className="col-span-12 md:col-span-3 min-w-0 flex flex-col justify-center">
        <button
          onClick={onView}
          className="font-bold text-sm text-gray-900 dark:text-white hover:text-[#961A1C] dark:hover:text-[#e05557] transition-colors text-left truncate block"
          title={item.title}
        >
          {item.title}
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs mt-0.5">
          {item.heroText || item.detailsText || 'No description provided'}
        </p>
      </div>

      {/* 3. Module */}
      <div className="col-span-12 md:col-span-2 min-w-0">
        <span className="font-semibold text-xs text-gray-900 dark:text-white truncate block">
          {formatModuleCode(item.code)}
        </span>
      </div>

      {/* 4. Risk Level — col 1 */}
      <div className="hidden md:flex col-span-1 justify-center items-center">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${meta.bg} ${meta.color}`}>
          <Wifi size={11} />
          {item.riskLevel || 'Low'}
        </span>
      </div>

      {/* 5. Capital — col 1 */}
      <div className="hidden md:flex col-span-1 justify-center items-center text-xs">
        {item.capitalGuaranteed ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400" title="Capital Guaranteed">
            <Check size={12} className="stroke-[3]" /> Yes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 dark:text-red-400" title="No Capital Needed">
            <X size={12} className="stroke-[2.5]" /> No
          </span>
        )}
      </div>

      {/* 6. Returns — col 1 */}
      <div className="hidden md:flex col-span-1 justify-center items-center text-xs">
        {item.returnsGuaranteed ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400" title="ROI Guaranteed">
            <Check size={12} className="stroke-[3]" /> Yes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 dark:text-red-400" title="No ROI Guaranteed">
            <X size={12} className="stroke-[2.5]" /> No
          </span>
        )}
      </div>

      {/* 7. Withdrawal — col 1 */}
      <div className="hidden md:flex col-span-1 justify-center items-center text-xs">
        {item.withdrawalRestrictions ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400" title="Restricted Withdrawal">
            <X size={12} className="stroke-[2.5]" /> Yes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400" title="Flexible Withdrawal">
            <Check size={12} className="stroke-[3]" /> No
          </span>
        )}
      </div>

      {/* 8. Actions (Text link View Details + Edit & Delete icons) — col 2 */}
      <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
        <button
          onClick={onView}
          className="text-xs font-semibold text-[#961A1C] hover:underline cursor-pointer"
        >
          View Details
        </button>
        <ActionBtn onClick={onEdit} title="Edit" icon={<Pencil size={14} />} hoverColor="hover:text-[#961A1C] hover:bg-red-50 dark:hover:bg-red-900/20" />
        <ActionBtn onClick={onDelete} title="Delete" icon={<Trash2 size={14} />} hoverColor="hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" />
      </div>
    </div>
  );
}

function Pill({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${active
      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
      : 'bg-gray-100 dark:bg-gray-700/60 text-gray-400 line-through'
      }`}>
      {label}
    </span>
  );
}

function ActionBtn({
  onClick, title, icon, hoverColor,
}: { onClick: () => void; title: string; icon: React.ReactNode; hoverColor: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md text-gray-400 ${hoverColor} transition-all`}
    >
      {icon}
    </button>
  );
}

function EmptyState({ onCreateClick, hasSearch }: { onCreateClick: () => void; hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-700/40 flex items-center justify-center">
        <GraduationCap size={28} className="opacity-50" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
          {hasSearch ? 'No modules match your search' : 'No education modules yet'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {hasSearch ? 'Try a different search term or clear your filters.' : 'Create your first module to start building the investor curriculum.'}
        </p>
      </div>
      {!hasSearch && (
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg shadow-sm transition"
        >
          <Plus size={14} /> Create First Module
        </button>
      )}
    </div>
  );
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-[#961A1C]">{icon}</div>
      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{text}</span>
    </div>
  );
}

function FieldWrapper({
  label, children, error, hint,
}: { label: string; children: React.ReactNode; error?: string; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      {children}
      {hint && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} /> {error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] transition ${hasError ? 'border-red-400 dark:border-red-600' : 'border-gray-200 dark:border-gray-700'
    }`;
}
