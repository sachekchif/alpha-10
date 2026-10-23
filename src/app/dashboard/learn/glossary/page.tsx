'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Drawer, Modal, Select, Switch, Dropdown } from 'antd';
import {
  BookMarked,
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Pencil,
  Trash2,
  Check,
  Tag,
  FileText,
  MoreHorizontal,
  Copy,
  Percent,
  Eye,
} from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetLearnGlossaryQuery,
  useCreateLearnGlossaryMutation,
  useUpdateLearnGlossaryMutation,
  useDeleteLearnGlossaryMutation,
  LearnGlossaryTerm,
  CreateLearnGlossaryRequest,
} from '@/auth/services/adminApi';
import { useToast } from '@/auth/components/ToastContainer';
import { TableSkeletonRows, TableSkeletonCol } from '@/components/TableSkeleton';

function extractGlossary(data: any): LearnGlossaryTerm[] {
  if (!data) return [];
  const raw = data.data !== undefined ? data.data : data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

const emptyGlossaryForm = (): CreateLearnGlossaryRequest => ({
  term: '',
  definition: '',
  displayOrder: 1,
  isActive: true,
});

const GLOSSARY_SKELETON_COLS: TableSkeletonCol[] = [
  { type: 'number', align: 'center', width: 'w-6' },
  { type: 'avatar', width: 'w-28' },
  { type: 'text', width: 'w-72' },
  { type: 'number', align: 'center', width: 'w-10' },
  { type: 'badge', align: 'center', width: 'w-14' },
  { type: 'actions', align: 'right', stickyRight: true, width: 'w-20' },
];

export default function GlossaryManagementPage() {
  return (
    <RoleGuard allowedRoles={['SuperAdmin', 'Control']}>
      <GlossaryManagementContent />
    </RoleGuard>
  );
}

function GlossaryManagementContent() {
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [pageNumber, setPageNumber] = useState(1);
  const PAGE_SIZE = 20;

  // Drawer / Form state
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<LearnGlossaryTerm | null>(null);
  const [form, setForm] = useState<CreateLearnGlossaryRequest>(emptyGlossaryForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [backendError, setBackendError] = useState<string | null>(null);

  // View details drawer state
  const [viewTerm, setViewTerm] = useState<LearnGlossaryTerm | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<LearnGlossaryTerm | null>(null);

  // RTK Query
  const { data, isFetching, isError, error, refetch } = useGetLearnGlossaryQuery();
  const [createTerm, { isLoading: isCreating }] = useCreateLearnGlossaryMutation();
  const [updateTerm, { isLoading: isUpdating }] = useUpdateLearnGlossaryMutation();
  const [deleteTerm, { isLoading: isDeleting }] = useDeleteLearnGlossaryMutation();

  const glossaryTerms = useMemo(() => extractGlossary(data), [data]);

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter((g) => {
      const matchSearch =
        !searchQuery ||
        g.term?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.definition?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'All'
          ? true
          : statusFilter === 'Active'
          ? g.isActive === true
          : g.isActive === false;
      return matchSearch && matchStatus;
    });
  }, [glossaryTerms, searchQuery, statusFilter]);

  const totalCount = filteredTerms.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedTerms = useMemo(() => {
    const start = (pageNumber - 1) * PAGE_SIZE;
    return filteredTerms.slice(start, start + PAGE_SIZE);
  }, [filteredTerms, pageNumber, PAGE_SIZE]);

  const activeCount = useMemo(() => glossaryTerms.filter((g) => g.isActive).length, [glossaryTerms]);
  const inactiveCount = useMemo(() => glossaryTerms.filter((g) => !g.isActive).length, [glossaryTerms]);
  const userPercentage = useMemo(() => {
    if (!glossaryTerms.length) return '0.0%';
    return ((activeCount / glossaryTerms.length) * 100).toFixed(1) + '%';
  }, [glossaryTerms.length, activeCount]);

  // Handlers
  const handleOpenCreate = () => {
    setSelectedTerm(null);
    setForm({
      term: '',
      definition: '',
      displayOrder: (glossaryTerms.length || 0) + 1,
      isActive: true,
    });
    setFormErrors({});
    setBackendError(null);
    setDrawerMode('create');
  };

  const handleOpenEdit = (term: LearnGlossaryTerm) => {
    setSelectedTerm(term);
    setForm({
      term: term.term || '',
      definition: term.definition || '',
      displayOrder: term.displayOrder ?? 1,
      isActive: term.isActive ?? true,
    });
    setFormErrors({});
    setBackendError(null);
    setDrawerMode('edit');
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.term.trim()) errors.term = 'Term title is required';
    if (!form.definition.trim()) errors.definition = 'Definition is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setBackendError(null);

    try {
      if (drawerMode === 'create') {
        await createTerm(form).unwrap();
        toast.success(`Glossary term "${form.term}" added.`, 'Term Created');
      } else if (drawerMode === 'edit' && selectedTerm) {
        await updateTerm({ id: selectedTerm.id, body: form }).unwrap();
        toast.success(`Glossary term "${form.term}" updated.`, 'Term Updated');
      }
      setDrawerMode(null);
      refetch();
    } catch (err: any) {
      const msg =
        err?.data?.statusMessage ||
        err?.data?.message ||
        err?.data?.title ||
        'Failed to save glossary term.';
      setBackendError(msg);
      toast.error(msg, 'Save Failed');
    }
  };

  const handleToggleActive = async (term: LearnGlossaryTerm) => {
    try {
      await updateTerm({
        id: term.id,
        body: {
          term: term.term,
          definition: term.definition,
          displayOrder: term.displayOrder,
          isActive: !term.isActive,
        },
      }).unwrap();
      toast.success(
        `Term "${term.term}" is now ${!term.isActive ? 'Active' : 'Hidden'}.`,
        'Status Updated'
      );
      refetch();
    } catch (err: any) {
      toast.error('Failed to update term status.', 'Update Error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTerm(deleteTarget.id).unwrap();
      toast.success(`Glossary term "${deleteTarget.term}" deleted.`, 'Term Deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      const msg = err?.data?.statusMessage || err?.data?.message || err?.data?.title || 'Failed to delete term.';
      toast.error(msg, 'Delete Failed');
    }
  };

  return (
    <div className="space-y-4 pb-12 w-full font-sans">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white leading-tight">
            Financial Glossary
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Maintain financial terminology definitions for investor education and quick mobile lookup
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-md shadow-xs transition cursor-pointer"
          >
            <Plus size={14} /> Add Term
          </button>
        </div>
      </div>

      {/* ── Analytics Stats Bar ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard
          cardTitle="Total"
          value={isFetching ? '—' : String(glossaryTerms.length)}
          topText="Total"
          icon={<BookMarked size={14} className="text-gray-400 shrink-0" />}
          subText="Dictionary lexicon"
        />
        <StatCard
          cardTitle="Active"
          value={isFetching ? '—' : String(activeCount)}
          topText="Active"
          icon={<Check size={14} className="text-emerald-500 shrink-0" />}
          subText="Published definitions"
        />
        <StatCard
          cardTitle="Inactive"
          value={isFetching ? '—' : String(inactiveCount)}
          topText="Inactive"
          icon={<X size={14} className="text-gray-400 shrink-0" />}
          subText="Unpublished terms"
        />
        <StatCard
          cardTitle="User Percentage"
          value={isFetching ? '—' : userPercentage}
          topText="User Percentage"
          icon={<Percent size={14} className="text-[#961A1C] shrink-0" />}
          subText="Active lexicon coverage"
        />
      </div>

      {/* ── Main Content Card (Audit Ledger Style) ────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden flex flex-col">
        {/* Filters Toolbar */}
        <div className="px-3.5 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex flex-wrap items-center gap-2.5 text-xs">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search terminology or definition..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPageNumber(1);
              }}
              className="w-full pl-8 pr-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>

          {/* Status Filter */}
          <Select
            size="small"
            value={statusFilter}
            onChange={(val: 'All' | 'Active' | 'Inactive') => {
              setStatusFilter(val);
              setPageNumber(1);
            }}
            className="w-32 text-xs"
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active only' },
              { value: 'Inactive', label: 'Hidden only' },
            ]}
          />

          {/* Reset Filters */}
          {(searchQuery || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
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
                  Failed to load glossary
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(error as any)?.data?.statusMessage ||
                    'An error occurred while fetching glossary records.'}
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
                    <th className="px-3 py-2 w-12 text-center border-b border-r border-gray-200 dark:border-gray-700">
                      #
                    </th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Term / Concept
                    </th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700">
                      Definition &amp; Explanation
                    </th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Display Order
                    </th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-3 py-2 w-24 text-right border-b border-gray-200 dark:border-gray-700 sticky right-0 bg-gray-100 dark:bg-gray-800 z-10 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.06)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-sans">
                  {isFetching ? (
                    <TableSkeletonRows rows={7} columns={GLOSSARY_SKELETON_COLS} />
                  ) : filteredTerms.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <BookMarked className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={36} />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">No glossary terms found</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                          {searchQuery || statusFilter !== 'All'
                            ? 'No terms match your current filter settings.'
                            : 'No glossary definitions added yet. Click "+ Add Term" to create your first entry.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedTerms.map((term, idx) => (
                      <GlossaryRow
                        key={term.id}
                        term={term}
                        index={(pageNumber - 1) * PAGE_SIZE + idx}
                        onView={() => setViewTerm(term)}
                        onEdit={() => handleOpenEdit(term)}
                        onDelete={() => setDeleteTarget(term)}
                        onToggle={() => handleToggleActive(term)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {!isFetching && !isError && filteredTerms.length > 0 && (
          <div className="flex items-center justify-between px-3.5 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 mt-auto text-xs">
            <span className="text-gray-500 font-mono text-[11px]">
              Showing {(pageNumber - 1) * PAGE_SIZE + 1}–{Math.min(pageNumber * PAGE_SIZE, totalCount)} of {totalCount} records
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-mono text-[11px]">
                Page {pageNumber} of {totalPages}
              </span>
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

      {/* ── Create / Edit Drawer ──────────────────────────────────────────── */}
      <Drawer
        open={Boolean(drawerMode)}
        onClose={() => setDrawerMode(null)}
        size={480}
        destroyOnClose
        maskClosable={false}
        className="dark:bg-gray-900"
        title={
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <BookMarked size={18} className="text-[#961A1C]" />
            <h3 className="text-sm font-semibold">
              {drawerMode === 'create' ? 'Add Glossary Term' : 'Edit Glossary Term'}
            </h3>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-4">
            {backendError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded text-xs text-red-600 dark:text-red-400">
                {backendError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Term Title *
              </label>
              <input
                type="text"
                value={form.term}
                onChange={(e) => setForm({ ...form, term: e.target.value })}
                placeholder="e.g. Yield to Maturity (YTM)"
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-md text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${
                  formErrors.term ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {formErrors.term && <p className="text-xs text-red-500 mt-1">{formErrors.term}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Definition &amp; Plain-English Explanation *
              </label>
              <textarea
                rows={5}
                value={form.definition}
                onChange={(e) => setForm({ ...form, definition: e.target.value })}
                placeholder="Explain this financial concept clearly for a retail investor..."
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-md text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${
                  formErrors.definition ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {formErrors.definition && (
                <p className="text-xs text-red-500 mt-1">{formErrors.definition}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={form.displayOrder}
                onChange={(e) =>
                  setForm({ ...form, displayOrder: parseInt(e.target.value) || 1 })
                }
                className="w-32 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs font-mono text-gray-900 dark:text-white"
              />
            </div>

            <div className="p-3 rounded-md bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                    Active Status
                  </span>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
                    Make this definition available for search in mobile dictionary
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
                  onChange={(checked) => setForm({ ...form, isActive: checked })}
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-3">
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="w-full py-2 px-4 bg-[#961A1C] hover:bg-[#7a1517] text-white rounded-md text-xs font-semibold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isCreating || isUpdating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              <span>{drawerMode === 'create' ? 'Save Term' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Drawer>

      {/* ── Glossary Details Drawer ───────────────────────────────────────── */}
      <GlossaryDetailsDrawer
        term={viewTerm}
        onClose={() => setViewTerm(null)}
        onEdit={(t) => {
          setViewTerm(null);
          handleOpenEdit(t);
        }}
      />

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      <Modal
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        footer={null}
        width={400}
        centered
        destroyOnClose
        className="dark:bg-gray-900"
      >
        <div className="p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-center justify-center mx-auto mb-3">
            <Trash2 size={20} className="text-[#961A1C]" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Delete Glossary Term</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Are you sure you want to delete{' '}
            <strong className="text-gray-800 dark:text-gray-200">"{deleteTarget?.term}"</strong>?
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 rounded-md bg-[#961A1C] hover:bg-[#7a1517] text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isDeleting && <Loader2 size={13} className="animate-spin" />}
              <span>Delete</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function GlossaryRow({
  term,
  index,
  onView,
  onEdit,
  onDelete,
  onToggle,
}: {
  term: LearnGlossaryTerm;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const copyTerm = () => {
    if (term.term) {
      navigator.clipboard.writeText(term.term);
    }
  };

  return (
    <tr className="hover:bg-blue-50/20 dark:hover:bg-gray-800/40 transition-colors group">
      {/* S/N */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 whitespace-nowrap">
        #{index + 1}
      </td>

      {/* Term */}
      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded bg-gray-100 dark:bg-gray-800 text-[#961A1C] shrink-0">
            <BookMarked size={13} />
          </span>
          <button
            onClick={onView}
            className="font-semibold text-xs text-gray-900 dark:text-white hover:text-[#961A1C] dark:hover:text-[#e05557] transition-colors cursor-pointer text-left"
          >
            {term.term}
          </button>
          <button
            onClick={copyTerm}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            title="Copy Term"
          >
            <Copy size={11} />
          </button>
        </div>
      </td>

      {/* Definition */}
      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 min-w-[240px]">
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
          {term.definition}
        </p>
      </td>

      {/* Display Order */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
        {term.displayOrder ?? 1}
      </td>

      {/* Status */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
            term.isActive
              ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              term.isActive ? 'bg-emerald-500' : 'bg-gray-400'
            }`}
          />
          {term.isActive ? 'Active' : 'Hidden'}
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
                  label: 'Edit Term',
                  icon: <Pencil size={13} />,
                  onClick: onEdit,
                },
                {
                  key: 'toggle',
                  label: term.isActive ? 'Hide Term' : 'Activate Term',
                  icon: <Check size={13} />,
                  onClick: onToggle,
                },
                {
                  type: 'divider',
                },
                {
                  key: 'delete',
                  label: 'Delete Term',
                  danger: true,
                  icon: <Trash2 size={13} />,
                  onClick: onDelete,
                },
              ],
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer">
              <MoreHorizontal size={14} />
            </button>
          </Dropdown>
        </div>
      </td>
    </tr>
  );
}

interface StatCardProps {
  cardTitle: string;
  value: string;
  topText?: string;
  icon: React.ReactNode;
  subText: string;
}

function StatCard({ cardTitle, value, topText, icon, subText }: StatCardProps) {
  const displayTitle = cardTitle || topText;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md p-3.5 shadow-xs border border-gray-200 dark:border-gray-800 relative overflow-hidden flex flex-col justify-between hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] bg-[#961A1C] rounded-r-sm" />
      <div className="flex items-center justify-between pl-2">
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 tracking-tight">
          {displayTitle}
        </span>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded transition cursor-pointer">
          <MoreHorizontal size={15} />
        </button>
      </div>
      <div className="my-2 pl-2">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight font-mono">
          {value}
        </h2>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 pl-2 pt-1 border-t border-gray-100 dark:border-gray-800">
        {icon}
        <span>{subText}</span>
      </div>
    </div>
  );
}

// ─── Glossary Term Details Drawer ──────────────────────────────────────────────
function GlossaryDetailsDrawer({
  term,
  onClose,
  onEdit,
}: {
  term: LearnGlossaryTerm | null;
  onClose: () => void;
  onEdit: (term: LearnGlossaryTerm) => void;
}) {
  return (
    <Drawer
      open={Boolean(term)}
      onClose={onClose}
      size={560}
      destroyOnClose
      className="dark:bg-gray-900"
      title={
        <div className="flex items-center justify-between w-full pr-4 text-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            <BookMarked size={18} className="text-[#961A1C]" />
            <h3 className="text-sm font-semibold">Glossary Term Details</h3>
          </div>
          {term && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
                term.isActive
                  ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  term.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                }`}
              />
              {term.isActive ? 'Active' : 'Hidden'}
            </span>
          )}
        </div>
      }
    >
      {term && (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 [scrollbar-width:none]">
            {/* Term Title */}
            <div>
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
                Financial Term
              </span>
              <h2 className="text-2xl font-light text-gray-900 dark:text-gray-50 leading-snug tracking-tight mt-0.5">
                {term.term}
              </h2>
            </div>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                Display Order: #{term.displayOrder ?? 1}
              </span>
              {term.createdAt && (
                <span className="text-[11px] font-mono text-gray-400">
                  Added: {new Date(term.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Definition Box */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
                Official Definition
              </span>
              <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-lg border border-gray-200 dark:border-gray-800 text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-sans leading-relaxed whitespace-pre-wrap">
                {term.definition}
              </div>
            </div>
          </div>

          {/* Sticky Drawer Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-3 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(term)}
              className="px-3.5 py-1.5 rounded-md bg-[#961A1C] hover:bg-[#7a1517] text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil size={13} />
              <span>Edit Term</span>
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
