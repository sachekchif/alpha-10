'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Dropdown, MenuProps, Modal, Drawer, Select, Switch } from 'antd';
import {
  BookOpen, Plus, Search, ChevronRight, ChevronLeft, X, Loader2, AlertCircle,
  RefreshCw, Pencil, Trash2, Check, BarChart2, Users, Clock,
  TrendingUp, Eye, Shield, Zap, DollarSign, ToggleLeft, ToggleRight,
  GraduationCap, Target, FileText, Filter, MoreHorizontal, MoreVertical, Sparkles,
  Play, Upload, Wifi, Image as ImageIcon, Copy, Percent,
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
import { TableSkeletonRows, TableSkeletonCol } from '@/components/TableSkeleton';

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

const EDUCATION_SKELETON_COLS: TableSkeletonCol[] = [
  { type: 'number', align: 'center', width: 'w-6' },
  { type: 'avatar', width: 'w-24' },
  { type: 'text', width: 'w-48' },
  { type: 'badge', align: 'center', width: 'w-14' },
  { type: 'badge', align: 'center', width: 'w-10' },
  { type: 'badge', align: 'center', width: 'w-10' },
  { type: 'badge', align: 'center', width: 'w-14' },
  { type: 'badge', align: 'center', width: 'w-12' },
  { type: 'actions', align: 'right', stickyRight: true, width: 'w-20' },
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
  const [typeFilter, setTypeFilter] = useState<string>('All');
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
  const { data, isFetching, isError, error, refetch } = useGetInvestmentEducationsQuery({ pageNumber, pageSize: PAGE_SIZE });
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
  const inactiveCount = Math.max(0, totalCount - activeCount);
  const userPercentage = totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(1) + '%' : '0.0%';

  // Client-side filter (remove once server-side search/filter is available)
  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchSearch =
        !searchQuery ||
        i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.heroText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.detailsText?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'All' || i.code?.toLowerCase() === typeFilter.toLowerCase();
      const matchRisk = riskFilter === 'All' || i.riskLevel === riskFilter;
      const matchStatus = statusFilter === 'All'
        ? true
        : statusFilter === 'Active'
          ? i.isActive === true
          : i.isActive === false;
      return matchSearch && matchType && matchRisk && matchStatus;
    });
  }, [items, searchQuery, typeFilter, riskFilter, statusFilter]);

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
    <div className="space-y-2.5 pb-8 w-full">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white leading-tight">
            Investment Education Modules
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            LMS content modules and risk parameters for retail investor guidance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            id="create-education-btn"
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-md shadow-sm transition cursor-pointer"
          >
            <Plus size={14} /> Add Module
          </button>
        </div>
      </div>

      {/* ── Analytics Stats Bar ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard
          cardTitle="Total"
          value={isFetching ? '—' : String(totalCount)}
          topText="Total"
          icon={<FileText size={14} className="text-gray-400 shrink-0" />}
          subText="All educational modules"
        />
        <StatCard
          cardTitle="Active"
          value={isFetching ? '—' : String(activeCount)}
          topText="Active"
          icon={<Check size={14} className="text-emerald-500 shrink-0" />}
          subText="Published to investors"
        />
        <StatCard
          cardTitle="Inactive"
          value={isFetching ? '—' : String(inactiveCount)}
          topText="Inactive"
          icon={<X size={14} className="text-gray-400 shrink-0" />}
          subText="Unpublished drafts"
        />
        <StatCard
          cardTitle="User Percentage"
          value={isFetching ? '—' : userPercentage}
          topText="User Percentage"
          icon={<Percent size={14} className="text-[#961A1C] shrink-0" />}
          subText="Curriculum availability rate"
        />
      </div>

      {/* ── Main Content Card (Audit Ledger Style) ────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">

        {/* Filters Toolbar */}
        <div className="px-3.5 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex flex-wrap items-center gap-2.5 text-xs">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search title, code, summary..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPageNumber(1); }}
              className="w-full pl-8 pr-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>

          {/* Module Type Filter */}
          <Select
            size="small"
            value={typeFilter}
            onChange={(val) => { setTypeFilter(val); setPageNumber(1); }}
            className="w-36 text-xs"
            options={[
              { value: 'All', label: 'All Modules' },
              ...EDUCATION_TYPES.map((t) => ({ value: t.value, label: t.label })),
            ]}
          />

          {/* Risk Filter */}
          <Select
            size="small"
            value={riskFilter}
            onChange={(val) => { setRiskFilter(val); setPageNumber(1); }}
            className="w-28 text-xs"
            options={[
              { value: 'All', label: 'All Risks' },
              ...RISK_LEVELS.map((r) => ({ value: r, label: `${r} Risk` })),
            ]}
          />

          {/* Status Filter */}
          <Select
            size="small"
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPageNumber(1); }}
            className="w-28 text-xs"
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active only' },
              { value: 'Inactive', label: 'Draft only' },
            ]}
          />

          {/* Reset Filters */}
          {(searchQuery || typeFilter !== 'All' || riskFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('All');
                setRiskFilter('All');
                setStatusFilter('All');
                setPageNumber(1);
              }}
              className="text-[11px] text-gray-500 hover:text-[#961A1C] underline font-medium cursor-pointer ml-auto"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Content Table */}
        <div className="min-h-[300px]">
          {isError ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-center justify-center">
                <AlertCircle size={20} className="text-[#961A1C]" />
              </div>
              <div className="max-w-md">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {(error as any)?.status === 401 || (error as any)?.data?.statusCode === 401
                    ? 'Permission Denied (HTTP 401)'
                    : 'Failed to load education modules'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(error as any)?.data?.statusMessage ||
                    'You do not have permission to perform this action. The backend requires granting the SuperAdmin role access to /api/admin/investment-education.'}
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#961A1C] hover:bg-[#7e1517] text-white rounded-md text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <span>Retry Fetch</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100/75 dark:bg-gray-800/80 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-3 py-2 w-12 text-center border-b border-r border-gray-200 dark:border-gray-700">#</th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Module Code</th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700">Title &amp; Overview</th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Risk</th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Capital</th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Returns</th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Withdrawals</th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Status</th>
                    <th className="px-3 py-2 w-24 text-right border-b border-gray-200 dark:border-gray-700 sticky right-0 bg-gray-100 dark:bg-gray-800 z-10 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.06)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-sans">
                  {isFetching ? (
                    <TableSkeletonRows rows={7} columns={EDUCATION_SKELETON_COLS} />
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8">
                        <EmptyState onCreateClick={openCreate} hasSearch={Boolean(searchQuery || typeFilter !== 'All' || riskFilter !== 'All' || statusFilter !== 'All')} />
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, idx) => (
                      <EducationRow
                        key={item.id}
                        item={item}
                        index={idx}
                        onView={() => router.push(`/dashboard/retail/education/${item.id}`)}
                        onEdit={() => openEdit(item)}
                        onDelete={() => setDeleteTarget(item)}
                        onToggle={() => handleToggleActive(item)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {!isFetching && !isError && filtered.length > 0 && (
          <div className="flex items-center justify-between px-3.5 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 mt-auto text-xs">
            <span className="text-gray-500 font-mono text-[11px]">
              Showing {((pageNumber - 1) * PAGE_SIZE) + 1}–{Math.min(pageNumber * PAGE_SIZE, totalCount)} of {totalCount} records
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-mono text-[11px]">Page {pageNumber} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber === 1}
                  className="p-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-colors cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                  disabled={pageNumber >= totalPages}
                  className="p-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-colors cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
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
  topText?: string;
  icon: React.ReactNode;
  subText: string;
}

function StatCard({ cardTitle, value, topText, icon, subText }: StatCardProps) {
  const displayTitle = cardTitle || topText || '';
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md p-3.5 shadow-xs border border-gray-200 dark:border-gray-800 relative overflow-hidden flex flex-col justify-between hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
      {/* Small bar at middle left of the card in dark red (#961A1C) */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] bg-[#961A1C] rounded-r-sm" />

      {/* Top Row: Title on Left + Options Menu on Right */}
      <div className="flex items-center justify-between pl-2">
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 tracking-tight">
          {displayTitle}
        </span>
        <Dropdown menu={getCardMenu(displayTitle)} trigger={['click']} placement="bottomRight">
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded transition cursor-pointer">
            <MoreHorizontal size={15} />
          </button>
        </Dropdown>
      </div>

      {/* Middle: Numeric Display with semibold font weight */}
      <div className="my-2 pl-2">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight font-mono">
          {value}
        </h2>
      </div>

      {/* Bottom Row: Icon + Subtitle text */}
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 pl-2 pt-1 border-t border-gray-100 dark:border-gray-800">
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
  const icon = INVESTMENT_ICONS[iconKey ?? ''] ?? <BookOpen size={13} />;

  const formatModuleCode = (code?: string) => {
    if (!code) return '—';
    const found = EDUCATION_TYPES.find((t) => t.value === code);
    if (found) return found.label;
    return code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const copyCode = () => {
    if (item.code) {
      navigator.clipboard.writeText(item.code);
    }
  };

  return (
    <tr className="hover:bg-blue-50/20 dark:hover:bg-gray-800/40 transition-colors group">
      {/* S/N */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 whitespace-nowrap">
        #{item.displayOrder || index + 1}
      </td>

      {/* Module Code */}
      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0">
            {icon}
          </span>
          <div className="flex flex-col">
            <span className="font-mono text-[11px] font-semibold text-gray-800 dark:text-gray-200">
              {item.code ? item.code.toUpperCase() : '—'}
            </span>
            <span className="text-[10px] text-gray-400">
              {formatModuleCode(item.code)}
            </span>
          </div>
        </div>
      </td>

      {/* Title & Overview */}
      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 min-w-[200px]">
        <button
          onClick={onView}
          className="font-medium text-xs text-gray-900 dark:text-white hover:text-[#961A1C] dark:hover:text-[#e05557] transition-colors text-left truncate block max-w-xs cursor-pointer"
          title={item.title}
        >
          {item.title}
        </button>
        {(item.heroText || item.detailsText) && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-xs mt-0.5">
            {item.heroText || item.detailsText}
          </p>
        )}
      </td>

      {/* Risk Level */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${meta.bg} ${meta.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {item.riskLevel || 'Low'}
        </span>
      </td>

      {/* Guaranteed Capital */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        {item.capitalGuaranteed ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Check size={11} className="stroke-[3]" /> Yes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
            <X size={11} className="stroke-[2.5]" /> No
          </span>
        )}
      </td>

      {/* Guaranteed Returns */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        {item.returnsGuaranteed ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Check size={11} className="stroke-[3]" /> Yes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
            <X size={11} className="stroke-[2.5]" /> No
          </span>
        )}
      </td>

      {/* Withdrawal Restrictions */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        {item.withdrawalRestrictions ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400">
            Restricted
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400">
            Flexible
          </span>
        )}
      </td>

      {/* Status */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
          item.isActive
            ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          {item.isActive ? 'Active' : 'Draft'}
        </span>
      </td>

      {/* Sticky Right Actions Column */}
      <td className="px-3 py-2 align-middle border-b border-gray-200 dark:border-gray-800 text-right whitespace-nowrap sticky right-0 bg-white dark:bg-gray-900 z-10 group-hover:bg-gray-50 dark:group-hover:bg-gray-850 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={onView}
            className="text-[11px] font-medium text-[#961A1C] hover:bg-[#961A1C]/10 px-2.5 py-0.5 rounded border border-[#961A1C]/20 hover:border-[#961A1C]/40 transition-colors cursor-pointer"
          >
            Details
          </button>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  label: 'View Details',
                  icon: <Eye size={13} />,
                  onClick: onView,
                },
                {
                  key: 'edit',
                  label: 'Edit Content',
                  icon: <Pencil size={13} />,
                  onClick: onEdit,
                },
                {
                  key: 'toggle',
                  label: item.isActive ? 'Set to Draft' : 'Publish Module',
                  icon: item.isActive ? <ToggleLeft size={13} /> : <ToggleRight size={13} />,
                  onClick: onToggle,
                },
                {
                  key: 'copy',
                  label: 'Copy Code',
                  icon: <Copy size={13} />,
                  onClick: copyCode,
                },
                {
                  type: 'divider',
                },
                {
                  key: 'delete',
                  label: 'Delete Module',
                  icon: <Trash2 size={13} />,
                  danger: true,
                  onClick: onDelete,
                },
              ],
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <button
              className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title="More options"
            >
              <MoreVertical size={13} />
            </button>
          </Dropdown>
        </div>
      </td>
    </tr>
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
