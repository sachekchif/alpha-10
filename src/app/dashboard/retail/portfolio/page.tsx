'use client';

import React, { useState, useMemo } from 'react';
import { Drawer, Switch, Modal } from 'antd';
import {
  BarChart3, Plus, Pencil, Trash2, X, Loader2, AlertCircle,
  RefreshCw, Check, Search, Sparkles, Clock, Percent, ShieldCheck,
  Tag, ArrowUpRight, Layers, Award, Zap,
} from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetPortfolioCategoriesQuery,
  useCreatePortfolioCategoryMutation,
  useUpdatePortfolioCategoryMutation,
  useDeletePortfolioCategoryMutation,
  useGetPortfolioDurationsQuery,
  useCreatePortfolioDurationMutation,
  useUpdatePortfolioDurationMutation,
  useDeletePortfolioDurationMutation,
  PortfolioCategory,
  PortfolioDuration,
  CreatePortfolioCategoryRequest,
  CreatePortfolioDurationRequest,
} from '@/auth/services/adminApi';
import { useToast } from '@/auth/components/ToastContainer';

type Tab = 'categories' | 'durations';

export default function PortfolioSettingsPage() {
  return (
    <RoleGuard allowedRoles={['SuperAdmin', 'Control']}>
      <PortfolioSettingsContent />
    </RoleGuard>
  );
}

function PortfolioSettingsContent() {
  const [activeTab, setActiveTab] = useState<Tab>('categories');

  const { data: catData, isFetching: isCatFetching } = useGetPortfolioCategoriesQuery();
  const { data: durData, isFetching: isDurFetching } = useGetPortfolioDurationsQuery();

  const categories: PortfolioCategory[] = Array.isArray(catData?.data)
    ? catData.data
    : Array.isArray((catData?.data as any)?.items) ? (catData?.data as any).items : [];

  const durations: PortfolioDuration[] = Array.isArray(durData?.data)
    ? durData.data
    : Array.isArray((durData?.data as any)?.items) ? (durData?.data as any).items : [];

  const activeCategoriesCount = categories.filter((c) => c.isActive).length;
  const activeDurationsCount = durations.filter((d) => d.isActive).length;

  return (
    <div className="flex flex-col gap-6 pb-12 w-full animate-in fade-in duration-500">
      
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#961A1C]/10 flex items-center justify-center">
            <BarChart3 size={20} className="text-[#961A1C]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Portfolio Settings
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Manage portfolio risk categories, duration terms, and yield parameters for retail investors
            </p>
          </div>
        </div>
      </div>

      {/* ── Top Analytics KPI Bar ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          cardTitle="Portfolio Categories"
          value={isCatFetching ? '—' : String(categories.length)}
          topText={`${activeCategoriesCount} active in app`}
          icon={<BarChart3 size={15} className="text-gray-400 shrink-0" />}
          subText="Categorized investment pools"
        />
        <StatCard
          cardTitle="Duration Options"
          value={isDurFetching ? '—' : String(durations.length)}
          topText={`${activeDurationsCount} lock-in terms available`}
          icon={<Clock size={15} className="text-gray-400 shrink-0" />}
          subText="Tenure lock-in options"
        />
        <StatCard
          cardTitle="Max Yield Tier"
          value="18.5% p.a."
          topText="Highest duration yield"
          icon={<Percent size={15} className="text-gray-400 shrink-0" />}
          subText="Upper bound return rate"
        />
        <StatCard
          cardTitle="Configuration Status"
          value="100% Synced"
          topText="Live LMS synchronization"
          icon={<ShieldCheck size={15} className="text-gray-400 shrink-0" />}
          subText="Retail app parameters"
        />
      </div>

      {/* ── Main Tabbed Container ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-xs flex flex-col overflow-hidden">

        {/* Tab Header */}
        <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700 px-6 pt-3 bg-gray-50/50 dark:bg-gray-900/30">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'categories'
                ? 'border-[#961A1C] text-[#961A1C]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Portfolio Categories
          </button>
          <button
            onClick={() => setActiveTab('durations')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'durations'
                ? 'border-[#961A1C] text-[#961A1C]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Duration Options & Lock-In Terms
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-0">
          {activeTab === 'categories' ? <CategoriesTab /> : <DurationsTab />}
        </div>
      </div>
    </div>
  );
}

// ─── CATEGORIES TAB ──────────────────────────────────────────────────────────
function CategoriesTab() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<PortfolioCategory | null>(null);
  const [form, setForm] = useState<CreatePortfolioCategoryRequest>({ code: '', name: '', isActive: true, displayOrder: 0 });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<PortfolioCategory | null>(null);

  const { data, isFetching, isError, refetch } = useGetPortfolioCategoriesQuery();
  const [createItem, { isLoading: isCreating }] = useCreatePortfolioCategoryMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdatePortfolioCategoryMutation();
  const [deleteItem, { isLoading: isDeleting }] = useDeletePortfolioCategoryMutation();

  const rawData = data?.data;
  const items: PortfolioCategory[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray((rawData as any)?.items) ? (rawData as any).items
    : Array.isArray((rawData as any)?.data) ? (rawData as any).data : [];

  const maxOrder = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.max(...items.map((i) => i.displayOrder ?? 0));
  }, [items]);

  const filtered = search
    ? items.filter((i) => i.name?.toLowerCase().includes(search.toLowerCase()) || i.code?.toLowerCase().includes(search.toLowerCase()))
    : items;

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.code.trim()) errors.code = 'Category code is required';
    if (!form.name.trim()) errors.name = 'Category name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function openCreate() {
    setForm({ code: '', name: '', isActive: true, displayOrder: maxOrder + 1 });
    setFormErrors({});
    setSelectedItem(null);
    setDrawerMode('create');
  }

  function openEdit(item: PortfolioCategory) {
    setForm({ code: item.code ?? '', name: item.name ?? '', isActive: item.isActive ?? true, displayOrder: item.displayOrder ?? 0 });
    setFormErrors({});
    setSelectedItem(item);
    setDrawerMode('edit');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const formattedBody: CreatePortfolioCategoryRequest = {
        ...form,
        code: form.code.trim().toUpperCase().replace(/\s+/g, '_'),
        name: form.name.trim(),
        displayOrder: drawerMode === 'create' ? maxOrder + 1 : form.displayOrder,
      };

      if (drawerMode === 'create') {
        await createItem(formattedBody).unwrap();
        toast.success('Portfolio category created successfully.', 'Created');
      } else if (selectedItem) {
        await updateItem({ id: selectedItem.id, body: formattedBody }).unwrap();
        toast.success('Portfolio category updated successfully.', 'Updated');
      }
      setDrawerMode(null);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Operation failed.', 'Error');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteItem(deleteTarget.id).unwrap();
      toast.success(`"${deleteTarget.name}" deleted.`, 'Deleted');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Delete failed.', 'Delete Failed');
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700/80 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search categories by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button
            id="create-category-btn"
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-xl transition cursor-pointer shadow-xs"
          >
            <Plus size={15} /> New Category
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="min-h-[250px]">
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={28} className="animate-spin text-[#961A1C]" />
            <span className="text-sm font-medium">Loading portfolio categories...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <AlertCircle size={28} className="text-[#961A1C]" />
            <span className="text-sm font-medium">Failed to load portfolio categories.</span>
            <button onClick={() => refetch()} className="text-xs text-[#961A1C] hover:underline font-semibold">Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <BarChart3 size={32} className="opacity-40" />
            <span className="text-sm font-medium">No portfolio categories found.</span>
            <button onClick={openCreate} className="text-xs text-[#961A1C] hover:underline font-semibold">Create first category</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {/* Headers */}
            <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-2.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/60 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800 text-center">
              <div className="col-span-1">S/N</div>
              <div className="col-span-3 text-left">Category Code</div>
              <div className="col-span-5 text-left">Category Name</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {filtered.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center px-5 py-3.5 hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors group border-b border-gray-50 dark:border-gray-800/40">
                {/* S/N */}
                <div className="col-span-12 md:col-span-1 flex justify-center">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-2.5 py-1 font-mono">
                    #{item.displayOrder || idx + 1}
                  </span>
                </div>

                {/* Code */}
                <div className="col-span-12 md:col-span-3 min-w-0">
                  <span className="font-mono text-xs font-bold text-[#961A1C] bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-md border border-red-200 dark:border-red-800 inline-block">
                    {item.code}
                  </span>
                </div>

                {/* Name */}
                <div className="col-span-12 md:col-span-5 min-w-0">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white truncate block">
                    {item.name}
                  </span>
                </div>

                {/* Status */}
                <div className="hidden md:flex col-span-1 justify-center items-center">
                  <StatusBadge active={item.isActive ?? true} />
                </div>

                {/* Actions */}
                <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 text-gray-400 hover:text-[#961A1C] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition cursor-pointer"
                    title="Edit Category"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Drawer */}
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
              {drawerMode === 'create' ? 'Add Portfolio Category' : 'Edit Portfolio Category'}
            </h3>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            
            {/* Top Info Banner */}
            <div className="p-4 rounded-2xl bg-gray-900 text-white border border-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-[#961A1C] flex items-center justify-center shrink-0">
                <BarChart3 size={20} className="text-[#961A1C]" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Portfolio Classification</p>
                <p className="text-[11px] text-gray-400">Categories organize retail investment strategies and risk profiles</p>
              </div>
            </div>

            {/* Category Code Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Category Code *
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. GROWTH or FIXED_INCOME"
                className={`w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${
                  formErrors.code ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {formErrors.code && <p className="text-xs text-red-500 mt-1">{formErrors.code}</p>}
            </div>

            {/* Category Name Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Category Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Growth & Equity Portfolio"
                className={`w-full text-lg font-bold bg-transparent text-gray-900 dark:text-white border-b-2 border-dashed focus:border-solid border-gray-300 dark:border-gray-700 py-1.5 focus:border-[#961A1C] outline-none transition placeholder:text-gray-300 dark:placeholder:text-gray-600 ${
                  formErrors.name ? 'border-red-500' : ''
                }`}
              />
              {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
            </div>

            {/* Active Switch */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                    Active Status
                  </span>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                    Retail investors can select this portfolio category
                  </p>
                </div>
                <Switch
                  checked={form.isActive ?? true}
                  onChange={(checked) => setForm({ ...form, isActive: checked })}
                />
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
              <span>{drawerMode === 'create' ? 'Create Category' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Drawer>

      {/* Delete confirmation */}
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
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Delete Category</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Are you sure you want to delete <strong className="text-gray-800 dark:text-white">&ldquo;{deleteTarget?.name}&rdquo;</strong>? This cannot be undone.
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
              {isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── DURATIONS TAB ───────────────────────────────────────────────────────────
function DurationsTab() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<PortfolioDuration | null>(null);
  const [form, setForm] = useState<CreatePortfolioDurationRequest>({
    durationMonths: 12, label: '', expectedReturnMinPercent: 5, expectedReturnMaxPercent: 15,
    badge: '', earlyExitPenaltyPercent: 2, isActive: true, displayOrder: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<PortfolioDuration | null>(null);

  const { data, isFetching, isError, refetch } = useGetPortfolioDurationsQuery();
  const [createItem, { isLoading: isCreating }] = useCreatePortfolioDurationMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdatePortfolioDurationMutation();
  const [deleteItem, { isLoading: isDeleting }] = useDeletePortfolioDurationMutation();

  const rawData = data?.data;
  const items: PortfolioDuration[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray((rawData as any)?.items) ? (rawData as any).items
    : Array.isArray((rawData as any)?.data) ? (rawData as any).data : [];

  const maxOrder = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.max(...items.map((i) => i.displayOrder ?? 0));
  }, [items]);

  const filtered = search
    ? items.filter((i) => i.label?.toLowerCase().includes(search.toLowerCase()))
    : items;

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.label.trim()) errors.label = 'Label is required';
    if (!form.durationMonths || form.durationMonths <= 0) errors.durationMonths = 'Duration must be > 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function openCreate() {
    setForm({
      durationMonths: 12, label: '', expectedReturnMinPercent: 5, expectedReturnMaxPercent: 15,
      badge: '', earlyExitPenaltyPercent: 2, isActive: true, displayOrder: maxOrder + 1,
    });
    setFormErrors({});
    setSelectedItem(null);
    setDrawerMode('create');
  }

  function openEdit(item: PortfolioDuration) {
    setForm({
      durationMonths: item.durationMonths ?? 12, label: item.label ?? '',
      expectedReturnMinPercent: item.expectedReturnMinPercent ?? 0,
      expectedReturnMaxPercent: item.expectedReturnMaxPercent ?? 0,
      badge: item.badge ?? '', earlyExitPenaltyPercent: item.earlyExitPenaltyPercent ?? 0,
      isActive: item.isActive ?? true, displayOrder: item.displayOrder ?? 0,
    });
    setFormErrors({});
    setSelectedItem(item);
    setDrawerMode('edit');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const formattedBody: CreatePortfolioDurationRequest = {
        ...form,
        label: form.label.trim(),
        displayOrder: drawerMode === 'create' ? maxOrder + 1 : form.displayOrder,
      };

      if (drawerMode === 'create') {
        await createItem(formattedBody).unwrap();
        toast.success('Duration option created successfully.', 'Created');
      } else if (selectedItem) {
        await updateItem({ id: selectedItem.id, body: formattedBody }).unwrap();
        toast.success('Duration option updated successfully.', 'Updated');
      }
      setDrawerMode(null);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Operation failed.', 'Error');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteItem(deleteTarget.id).unwrap();
      toast.success(`"${deleteTarget.label}" deleted.`, 'Deleted');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Delete failed.', 'Delete Failed');
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700/80 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search durations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button
            id="create-duration-btn"
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-xl transition cursor-pointer shadow-xs"
          >
            <Plus size={15} /> New Duration Option
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="min-h-[250px]">
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={28} className="animate-spin text-[#961A1C]" />
            <span className="text-sm font-medium">Loading duration options...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <AlertCircle size={28} className="text-[#961A1C]" />
            <span className="text-sm font-medium">Failed to load duration options.</span>
            <button onClick={() => refetch()} className="text-xs text-[#961A1C] hover:underline font-semibold">Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Clock size={32} className="opacity-40" />
            <span className="text-sm font-medium">No duration options found.</span>
            <button onClick={openCreate} className="text-xs text-[#961A1C] hover:underline font-semibold">Create first duration</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {/* Headers */}
            <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-2.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/60 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800 text-center">
              <div className="col-span-1">S/N</div>
              <div className="col-span-3 text-left">Tenure Label & Duration</div>
              <div className="col-span-3">Expected Return Range</div>
              <div className="col-span-2">Early Exit Penalty</div>
              <div className="col-span-1">Badge</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {filtered.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center px-5 py-3.5 hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors group border-b border-gray-50 dark:border-gray-800/40">
                {/* S/N */}
                <div className="col-span-12 md:col-span-1 flex justify-center">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-2.5 py-1 font-mono">
                    #{item.displayOrder || idx + 1}
                  </span>
                </div>

                {/* Label & Duration */}
                <div className="col-span-12 md:col-span-3 min-w-0 flex flex-col justify-center">
                  <span className="font-bold text-sm text-gray-900 dark:text-white truncate block">
                    {item.label}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock size={11} /> {item.durationMonths} months lock-in
                  </span>
                </div>

                {/* Expected Return */}
                <div className="hidden md:flex col-span-3 justify-center items-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <Percent size={11} /> {item.expectedReturnMinPercent ?? 0}% – {item.expectedReturnMaxPercent ?? 0}% p.a.
                  </span>
                </div>

                {/* Early Exit Penalty */}
                <div className="hidden md:flex col-span-2 justify-center items-center text-xs">
                  <span className="font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md font-mono">
                    {item.earlyExitPenaltyPercent != null ? `${item.earlyExitPenaltyPercent}%` : '0%'}
                  </span>
                </div>

                {/* Badge */}
                <div className="hidden md:flex col-span-1 justify-center items-center">
                  {item.badge ? (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      {item.badge}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 text-gray-400 hover:text-[#961A1C] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition cursor-pointer"
                    title="Edit Duration"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition cursor-pointer"
                    title="Delete Duration"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Duration Drawer */}
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
              {drawerMode === 'create' ? 'Add Duration Option' : 'Edit Duration Option'}
            </h3>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            
            {/* Top Banner */}
            <div className="p-4 rounded-2xl bg-gray-900 text-white border border-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-[#961A1C] flex items-center justify-center shrink-0">
                <Clock size={20} className="text-[#961A1C]" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Duration & Tenure Terms</p>
                <p className="text-[11px] text-gray-400">Lock-in tenure options and expected yield bands for investors</p>
              </div>
            </div>

            {/* Label Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Tenure Label *
              </label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. 1 Year Lock-In"
                className={`w-full text-lg font-bold bg-transparent text-gray-900 dark:text-white border-b-2 border-dashed focus:border-solid border-gray-300 dark:border-gray-700 py-1.5 focus:border-[#961A1C] outline-none transition placeholder:text-gray-300 dark:placeholder:text-gray-600 ${
                  formErrors.label ? 'border-red-500' : ''
                }`}
              />
              {formErrors.label && <p className="text-xs text-red-500 mt-1">{formErrors.label}</p>}
            </div>

            {/* Duration Months */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Duration (Months) *
              </label>
              <input
                type="number"
                min={1}
                value={form.durationMonths}
                onChange={(e) => setForm({ ...form, durationMonths: Number(e.target.value) })}
                className={`w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${
                  formErrors.durationMonths ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {formErrors.durationMonths && <p className="text-xs text-red-500 mt-1">{formErrors.durationMonths}</p>}
            </div>

            {/* Return Range */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Expected Return Range (% p.a.)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={form.expectedReturnMinPercent ?? 0}
                    onChange={(e) => setForm({ ...form, expectedReturnMinPercent: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                    placeholder="Min %"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={form.expectedReturnMaxPercent ?? 0}
                    onChange={(e) => setForm({ ...form, expectedReturnMaxPercent: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                    placeholder="Max %"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                </div>
              </div>
            </div>

            {/* Early Exit Penalty & Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Early Exit Penalty (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={form.earlyExitPenaltyPercent ?? 0}
                  onChange={(e) => setForm({ ...form, earlyExitPenaltyPercent: Number(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                />
                <span className="absolute right-3 bottom-3 text-gray-400 text-xs font-bold">%</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={form.badge ?? ''}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                  placeholder="e.g. Popular or High Yield"
                />
              </div>
            </div>

            {/* Active Switch */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                    Active Status
                  </span>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                    Retail investors can select this tenure duration option
                  </p>
                </div>
                <Switch
                  checked={form.isActive ?? true}
                  onChange={(checked) => setForm({ ...form, isActive: checked })}
                />
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
              <span>{drawerMode === 'create' ? 'Create Duration Option' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Drawer>

      {/* Delete confirmation */}
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
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Delete Duration</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Are you sure you want to delete <strong className="text-gray-800 dark:text-white">&ldquo;{deleteTarget?.label}&rdquo;</strong>? This cannot be undone.
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
              {isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Shared helpers ──────────────────────────────────────────────────────────
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

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
      active
        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
    }`}>
      {active ? <><Check size={11} className="stroke-[3]" /> Active</> : 'Inactive'}
    </span>
  );
}
