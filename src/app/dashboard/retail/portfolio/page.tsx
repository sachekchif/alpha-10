'use client';

import React, { useState } from 'react';
import {
  BarChart3, Plus, Pencil, Trash2, X, Loader2, AlertCircle,
  RefreshCw, Check, Search,
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

  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage portfolio categories and duration options for the Retail app</p>
      </div>

      {/* Main card with tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">

        {/* Tab header */}
        <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700 px-6 pt-4 bg-gray-50/50 dark:bg-gray-900/20">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'categories' ? 'border-[#961A1C] text-[#961A1C]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Portfolio Categories
          </button>
          <button
            onClick={() => setActiveTab('durations')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'durations' ? 'border-[#961A1C] text-[#961A1C]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Duration Options
          </button>
        </div>

        {/* Tab content */}
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
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
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

  const filtered = search
    ? items.filter((i) => i.name?.toLowerCase().includes(search.toLowerCase()) || i.code?.toLowerCase().includes(search.toLowerCase()))
    : items;

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.code.trim()) errors.code = 'Code is required';
    if (!form.name.trim()) errors.name = 'Name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function openCreate() {
    setForm({ code: '', name: '', isActive: true, displayOrder: 0 });
    setFormErrors({});
    setSelectedItem(null);
    setModalMode('create');
  }

  function openEdit(item: PortfolioCategory) {
    setForm({ code: item.code ?? '', name: item.name ?? '', isActive: item.isActive ?? true, displayOrder: item.displayOrder ?? 0 });
    setFormErrors({});
    setSelectedItem(item);
    setModalMode('edit');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (modalMode === 'create') {
        await createItem(form).unwrap();
        toast.success('Category created.', 'Created');
      } else if (selectedItem) {
        await updateItem({ id: selectedItem.id, body: form }).unwrap();
        toast.success('Category updated.', 'Updated');
      }
      setModalMode(null);
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
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button id="create-category-btn" onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg transition">
            <Plus size={16} /> New Category
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[250px]">
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 size={28} className="animate-spin text-[#961A1C]" />
            <span className="text-sm font-medium">Loading categories...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <AlertCircle size={28} className="text-[#961A1C]" />
            <span className="text-sm font-medium">Failed to load categories.</span>
            <button onClick={() => refetch()} className="text-xs text-[#961A1C] hover:underline font-semibold">Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <BarChart3 size={28} className="opacity-40" />
            <span className="text-sm font-medium">No portfolio categories found.</span>
            <button onClick={openCreate} className="text-xs text-[#961A1C] hover:underline font-semibold">Create the first category</button>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Display Order</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">{item.code}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4"><StatusBadge active={item.isActive ?? true} /></td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{item.displayOrder ?? 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-[#961A1C] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition" title="Edit"><Pencil size={15} /></button>
                      <button onClick={() => setDeleteTarget(item)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Category modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{modalMode === 'create' ? 'New Category' : 'Edit Category'}</h3>
              <button onClick={() => setModalMode(null)} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Code *</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className={`w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] font-mono ${formErrors.code ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                  placeholder="e.g. GROWTH" />
                {formErrors.code && <p className="text-xs text-red-500 mt-1">{formErrors.code}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${formErrors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                  placeholder="e.g. Growth Portfolio" />
                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Display Order</label>
                  <input type="number" min={0} value={form.displayOrder ?? 0} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition w-full">
                    <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-3.5 h-3.5 accent-[#961A1C]" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalMode(null)} className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors text-sm">Cancel</button>
                <button type="submit" disabled={isCreating || isUpdating} className="flex-1 py-2.5 px-4 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                  {(isCreating || isUpdating) ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : modalMode === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Category"
          name={deleteTarget.name}
          isDeleting={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

// ─── DURATIONS TAB ───────────────────────────────────────────────────────────
function DurationsTab() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<PortfolioDuration | null>(null);
  const [form, setForm] = useState<CreatePortfolioDurationRequest>({
    durationMonths: 12, label: '', expectedReturnMinPercent: 0, expectedReturnMaxPercent: 0,
    badge: '', earlyExitPenaltyPercent: 0, isActive: true, displayOrder: 0,
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
    setForm({ durationMonths: 12, label: '', expectedReturnMinPercent: 0, expectedReturnMaxPercent: 0, badge: '', earlyExitPenaltyPercent: 0, isActive: true, displayOrder: 0 });
    setFormErrors({});
    setSelectedItem(null);
    setModalMode('create');
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
    setModalMode('edit');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (modalMode === 'create') {
        await createItem(form).unwrap();
        toast.success('Duration option created.', 'Created');
      } else if (selectedItem) {
        await updateItem({ id: selectedItem.id, body: form }).unwrap();
        toast.success('Duration option updated.', 'Updated');
      }
      setModalMode(null);
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
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search durations..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button id="create-duration-btn" onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg transition">
            <Plus size={16} /> New Duration
          </button>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[250px]">
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 size={28} className="animate-spin text-[#961A1C]" />
            <span className="text-sm font-medium">Loading durations...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <AlertCircle size={28} className="text-[#961A1C]" />
            <span className="text-sm font-medium">Failed to load durations.</span>
            <button onClick={() => refetch()} className="text-xs text-[#961A1C] hover:underline font-semibold">Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <BarChart3 size={28} className="opacity-40" />
            <span className="text-sm font-medium">No portfolio durations found.</span>
            <button onClick={openCreate} className="text-xs text-[#961A1C] hover:underline font-semibold">Create the first duration</button>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Label</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Return Range</th>
                <th className="px-6 py-4 font-medium">Early Exit Penalty</th>
                <th className="px-6 py-4 font-medium">Badge</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.label}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{item.durationMonths}</span> months
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-0.5 rounded-full border border-green-100 dark:border-green-900/30">
                      {item.expectedReturnMinPercent ?? 0}% – {item.expectedReturnMaxPercent ?? 0}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                    {item.earlyExitPenaltyPercent != null ? `${item.earlyExitPenaltyPercent}%` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {item.badge
                      ? <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">{item.badge}</span>
                      : <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>}
                  </td>
                  <td className="px-6 py-4"><StatusBadge active={item.isActive ?? true} /></td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{item.displayOrder ?? 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-[#961A1C] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition" title="Edit"><Pencil size={15} /></button>
                      <button onClick={() => setDeleteTarget(item)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Duration modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl border border-gray-100 dark:border-gray-700 my-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{modalMode === 'create' ? 'New Duration Option' : 'Edit Duration Option'}</h3>
              <button onClick={() => setModalMode(null)} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Label *</label>
                  <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
                    className={`w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${formErrors.label ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                    placeholder="e.g. 1 Year" />
                  {formErrors.label && <p className="text-xs text-red-500 mt-1">{formErrors.label}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Duration (Months) *</label>
                  <input type="number" min={1} value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: Number(e.target.value) })}
                    className={`w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${formErrors.durationMonths ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`} />
                  {formErrors.durationMonths && <p className="text-xs text-red-500 mt-1">{formErrors.durationMonths}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Expected Return Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input type="number" min={0} max={100} step={0.01} value={form.expectedReturnMinPercent ?? 0} onChange={(e) => setForm({ ...form, expectedReturnMinPercent: Number(e.target.value) })}
                      className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" placeholder="Min" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                  </div>
                  <div className="relative">
                    <input type="number" min={0} max={100} step={0.01} value={form.expectedReturnMaxPercent ?? 0} onChange={(e) => setForm({ ...form, expectedReturnMaxPercent: Number(e.target.value) })}
                      className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" placeholder="Max" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                  </div>
                </div>
                {(form.expectedReturnMinPercent || 0) > 0 && (form.expectedReturnMaxPercent || 0) > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 font-semibold">
                    Preview: {form.expectedReturnMinPercent}% – {form.expectedReturnMaxPercent}% p.a.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Early Exit Penalty</label>
                  <input type="number" min={0} max={100} step={0.01} value={form.earlyExitPenaltyPercent ?? 0} onChange={(e) => setForm({ ...form, earlyExitPenaltyPercent: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
                  <span className="absolute right-3 bottom-2.5 text-gray-400 text-xs font-bold">%</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Badge Text</label>
                  <input type="text" value={form.badge ?? ''} onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                    placeholder="e.g. Popular" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Display Order</label>
                  <input type="number" min={0} value={form.displayOrder ?? 0} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition w-full">
                    <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-3.5 h-3.5 accent-[#961A1C]" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalMode(null)} className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors text-sm">Cancel</button>
                <button type="submit" disabled={isCreating || isUpdating} className="flex-1 py-2.5 px-4 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                  {(isCreating || isUpdating) ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : modalMode === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Duration"
          name={deleteTarget.label}
          isDeleting={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

// ─── Shared helpers ──────────────────────────────────────────────────────────
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
      {active ? <><Check size={10} /> Active</> : 'Inactive'}
    </span>
  );
}

function DeleteConfirmModal({ title, name, isDeleting, onCancel, onConfirm }: {
  title: string; name: string; isDeleting: boolean;
  onCancel: () => void; onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600"><Trash2 size={22} /></div>
        </div>
        <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
          Are you sure you want to delete <strong className="text-gray-800 dark:text-white">&ldquo;{name}&rdquo;</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors text-sm">Cancel</button>
          <button onClick={onConfirm} disabled={isDeleting} className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2">
            {isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
