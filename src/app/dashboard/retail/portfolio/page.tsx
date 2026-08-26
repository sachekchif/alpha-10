'use client';

import React, { useState, useMemo } from 'react';
import { Drawer, Switch, Modal, Pagination } from 'antd';
import {
  Plus, Pencil, Trash2, X, Loader2, AlertCircle,
  RefreshCw, Check, Search, BarChart3, Clock, Percent, ShieldCheck
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
    <div className="flex flex-col gap-6 pb-12 w-full">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Portfolio Settings
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage portfolio risk categories, duration terms, and yield parameters for retail investors
          </p>
        </div>
      </div>

      {/* Top Analytics KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Portfolio Categories</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{isCatFetching ? '—' : String(categories.length)}</h3>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">{activeCategoriesCount} active categories</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Duration Terms</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{isDurFetching ? '—' : String(durations.length)}</h3>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">{activeDurationsCount} lock-in terms available</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Max Yield Tier</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">18.5% p.a.</h3>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Upper bound return rate</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Configuration Status</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Live Sync</h3>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Mobile app parameters active</span>
        </div>
      </div>

      {/* Main Tabbed Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">

        {/* Tab Header */}
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 px-6 pt-2 gap-6 bg-gray-50/50 dark:bg-gray-900/30">
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'categories'
                ? 'border-[#961A1C] text-[#961A1C]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Portfolio Categories
          </button>
          <button
            onClick={() => setActiveTab('durations')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'durations'
                ? 'border-[#961A1C] text-[#961A1C]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Duration Options & Lock-In Terms
          </button>
        </div>

        {/* Tab Content */}
        <div>
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
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const filtered = useMemo(() => {
    if (!search) return items;
    return items.filter((i) => i.name?.toLowerCase().includes(search.toLowerCase()) || i.code?.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  const paginated = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageNumber, pageSize]);

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
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search categories by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-1.5 pl-9 pr-3 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg transition cursor-pointer"
          >
            <Plus size={14} /> New Category
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="min-h-[280px]">
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
            <Loader2 size={24} className="animate-spin text-[#961A1C]" />
            <span className="text-xs font-medium">Loading portfolio categories...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
            <AlertCircle size={24} className="text-[#961A1C]" />
            <span className="text-xs font-medium">Failed to load categories.</span>
            <button onClick={() => refetch()} className="text-xs text-[#961A1C] hover:underline font-medium">Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
            <span className="text-xs font-medium">No portfolio categories found.</span>
            <button onClick={openCreate} className="text-xs text-[#961A1C] font-semibold hover:underline mt-1">Create first category</button>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50/80 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">S/N</th>
                <th className="px-5 py-3">Category Code</th>
                <th className="px-5 py-3">Category Name</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {paginated.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-gray-500">
                    #{(pageNumber - 1) * pageSize + idx + 1}
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-semibold text-[#961A1C] bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900">
                      {item.code}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">
                    {item.name}
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200'
                    }`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded transition cursor-pointer"
                        title="Edit Category"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-1 text-red-500 hover:text-red-700 rounded transition cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {filtered.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
          <span className="text-xs text-gray-500 font-medium">
            Showing {paginated.length} of {filtered.length} entries
          </span>

          <Pagination
            current={pageNumber}
            pageSize={pageSize}
            total={filtered.length}
            onChange={(page, pSize) => {
              setPageNumber(page);
              if (pSize) setPageSize(pSize);
            }}
            showSizeChanger
            pageSizeOptions={['10', '20', '50']}
            size="small"
          />
        </div>
      )}

      {/* Drawer (maskClosable=true) */}
      <Drawer
        open={Boolean(drawerMode)}
        onClose={() => setDrawerMode(null)}
        width={500}
        destroyOnClose
        maskClosable={true}
        className="dark:bg-gray-900"
        title={
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {drawerMode === 'create' ? 'Add Portfolio Category' : 'Edit Portfolio Category'}
          </h3>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-4">
          <div className="flex-1 overflow-y-auto space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category Code *
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. GROWTH"
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
              />
              {formErrors.code && <p className="text-xs text-red-500 mt-1">{formErrors.code}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Growth & Equity Portfolio"
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
              />
              {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-700 dark:text-gray-300">Active Status</span>
              <Switch
                checked={form.isActive ?? true}
                onChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="w-full py-2.5 bg-[#961A1C] text-white font-semibold text-xs rounded-lg hover:bg-[#7a1517] transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isCreating || isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            <span>{drawerMode === 'create' ? 'Create Category' : 'Save Changes'}</span>
          </button>
        </form>
      </Drawer>

      {/* Delete confirmation */}
      <Modal
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        footer={null}
        width={380}
        centered
      >
        <div className="py-2 text-xs text-gray-600 dark:text-gray-300">
          Are you sure you want to delete <strong>&ldquo;{deleteTarget?.name}&rdquo;</strong>?
        </div>
      </Modal>
    </div>
  );
}

// ─── DURATIONS TAB ───────────────────────────────────────────────────────────
function DurationsTab() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const filtered = useMemo(() => {
    if (!search) return items;
    return items.filter((i) => i.label?.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  const paginated = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageNumber, pageSize]);

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
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search duration options..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-1.5 pl-9 pr-3 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg transition cursor-pointer"
          >
            <Plus size={14} /> New Duration
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="min-h-[280px]">
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
            <Loader2 size={24} className="animate-spin text-[#961A1C]" />
            <span className="text-xs font-medium">Loading duration options...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
            <AlertCircle size={24} className="text-[#961A1C]" />
            <span className="text-xs font-medium">Failed to load duration options.</span>
            <button onClick={() => refetch()} className="text-xs text-[#961A1C] hover:underline font-medium">Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
            <span className="text-xs font-medium">No duration options found.</span>
            <button onClick={openCreate} className="text-xs text-[#961A1C] font-semibold hover:underline mt-1">Create first duration</button>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50/80 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">S/N</th>
                <th className="px-5 py-3">Label & Tenure</th>
                <th className="px-5 py-3">Expected Return Range</th>
                <th className="px-5 py-3 text-center">Early Exit Penalty</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {paginated.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-gray-500">
                    #{(pageNumber - 1) * pageSize + idx + 1}
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white block">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {item.durationMonths} months lock-in
                    </span>
                  </td>

                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {item.expectedReturnMinPercent ?? 0}% – {item.expectedReturnMaxPercent ?? 0}% p.a.
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-center font-mono">
                    {item.earlyExitPenaltyPercent != null ? `${item.earlyExitPenaltyPercent}%` : '0%'}
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200'
                    }`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded transition cursor-pointer"
                        title="Edit Duration"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-1 text-red-500 hover:text-red-700 rounded transition cursor-pointer"
                        title="Delete Duration"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {filtered.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
          <span className="text-xs text-gray-500 font-medium">
            Showing {paginated.length} of {filtered.length} entries
          </span>

          <Pagination
            current={pageNumber}
            pageSize={pageSize}
            total={filtered.length}
            onChange={(page, pSize) => {
              setPageNumber(page);
              if (pSize) setPageSize(pSize);
            }}
            showSizeChanger
            pageSizeOptions={['10', '20', '50']}
            size="small"
          />
        </div>
      )}

      {/* Drawer (maskClosable=true) */}
      <Drawer
        open={Boolean(drawerMode)}
        onClose={() => setDrawerMode(null)}
        width={500}
        destroyOnClose
        maskClosable={true}
        className="dark:bg-gray-900"
        title={
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {drawerMode === 'create' ? 'Add Duration Option' : 'Edit Duration Option'}
          </h3>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-4">
          <div className="flex-1 overflow-y-auto space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tenure Label *
              </label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. 1 Year Lock-In"
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
              />
              {formErrors.label && <p className="text-xs text-red-500 mt-1">{formErrors.label}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (Months) *
              </label>
              <input
                type="number"
                min={1}
                value={form.durationMonths}
                onChange={(e) => setForm({ ...form, durationMonths: Number(e.target.value) })}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
              />
              {formErrors.durationMonths && <p className="text-xs text-red-500 mt-1">{formErrors.durationMonths}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expected Return Range (% p.a.)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={form.expectedReturnMinPercent ?? 0}
                  onChange={(e) => setForm({ ...form, expectedReturnMinPercent: Number(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                  placeholder="Min %"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={form.expectedReturnMaxPercent ?? 0}
                  onChange={(e) => setForm({ ...form, expectedReturnMaxPercent: Number(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                  placeholder="Max %"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Early Exit Penalty (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={form.earlyExitPenaltyPercent ?? 0}
                  onChange={(e) => setForm({ ...form, earlyExitPenaltyPercent: Number(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={form.badge ?? ''}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                  placeholder="e.g. Popular"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-700 dark:text-gray-300">Active Status</span>
              <Switch
                checked={form.isActive ?? true}
                onChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="w-full py-2.5 bg-[#961A1C] text-white font-semibold text-xs rounded-lg hover:bg-[#7a1517] transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isCreating || isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            <span>{drawerMode === 'create' ? 'Create Duration' : 'Save Changes'}</span>
          </button>
        </form>
      </Drawer>

      {/* Delete confirmation */}
      <Modal
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        footer={null}
        width={380}
        centered
      >
        <div className="py-2 text-xs text-gray-600 dark:text-gray-300">
          Are you sure you want to delete <strong>&ldquo;{deleteTarget?.label}&rdquo;</strong>?
        </div>
      </Modal>
    </div>
  );
}
