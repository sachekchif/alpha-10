'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Drawer, Modal, Select, Switch, Dropdown } from 'antd';
import {
  Video,
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
  Clock,
  ExternalLink,
  Play,
  MoreHorizontal,
  Copy,
  Sparkles,
  Percent,
  Eye,
  LayoutGrid,
  List,
} from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetLearnWebinarsQuery,
  useCreateLearnWebinarMutation,
  useUpdateLearnWebinarMutation,
  useDeleteLearnWebinarMutation,
  LearnWebinar,
  CreateLearnWebinarRequest,
} from '@/auth/services/adminApi';
import { useToast } from '@/auth/components/ToastContainer';
import { TableSkeletonRows, TableSkeletonCol } from '@/components/TableSkeleton';

function extractWebinars(data: any): LearnWebinar[] {
  if (!data) return [];
  const raw = data.data !== undefined ? data.data : data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

const emptyWebinarForm = (): CreateLearnWebinarRequest => ({
  code: '',
  title: '',
  durationMinutes: 45,
  videoUrl: '',
  displayOrder: 1,
  isActive: true,
});

const WEBINAR_SKELETON_COLS: TableSkeletonCol[] = [
  { type: 'number', align: 'center', width: 'w-6' },
  { type: 'avatar', width: 'w-24' },
  { type: 'text', width: 'w-60' },
  { type: 'badge', align: 'center', width: 'w-16' },
  { type: 'number', align: 'center', width: 'w-10' },
  { type: 'badge', align: 'center', width: 'w-14' },
  { type: 'actions', align: 'right', stickyRight: true, width: 'w-20' },
];

export default function WebinarsManagementPage() {
  return (
    <RoleGuard allowedRoles={['SuperAdmin', 'Control']}>
      <WebinarsManagementContent />
    </RoleGuard>
  );
}

function WebinarsManagementContent() {
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [pageNumber, setPageNumber] = useState(1);
  const PAGE_SIZE = 12;

  // Drawer / Form state
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [selectedWebinar, setSelectedWebinar] = useState<LearnWebinar | null>(null);
  const [form, setForm] = useState<CreateLearnWebinarRequest>(emptyWebinarForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // View details drawer state
  const [viewWebinar, setViewWebinar] = useState<LearnWebinar | null>(null);

  // Video preview modal
  const [previewWebinar, setPreviewWebinar] = useState<LearnWebinar | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<LearnWebinar | null>(null);

  // RTK Query
  const { data, isFetching, isError, error, refetch } = useGetLearnWebinarsQuery();
  const [createWebinar, { isLoading: isCreating }] = useCreateLearnWebinarMutation();
  const [updateWebinar, { isLoading: isUpdating }] = useUpdateLearnWebinarMutation();
  const [deleteWebinar, { isLoading: isDeleting }] = useDeleteLearnWebinarMutation();

  const webinars = useMemo(() => extractWebinars(data), [data]);

  const filteredWebinars = useMemo(() => {
    return webinars.filter((w) => {
      const matchSearch =
        !searchQuery ||
        w.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.videoUrl?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'All'
          ? true
          : statusFilter === 'Active'
          ? w.isActive === true
          : w.isActive === false;
      return matchSearch && matchStatus;
    });
  }, [webinars, searchQuery, statusFilter]);

  const totalCount = filteredWebinars.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedWebinars = useMemo(() => {
    const start = (pageNumber - 1) * PAGE_SIZE;
    return filteredWebinars.slice(start, start + PAGE_SIZE);
  }, [filteredWebinars, pageNumber, PAGE_SIZE]);

  const activeCount = useMemo(() => webinars.filter((w) => w.isActive).length, [webinars]);
  const inactiveCount = useMemo(() => webinars.filter((w) => !w.isActive).length, [webinars]);
  const userPercentage = useMemo(() => {
    if (!webinars.length) return '0.0%';
    return ((activeCount / webinars.length) * 100).toFixed(1) + '%';
  }, [webinars.length, activeCount]);
  const readyCount = useMemo(() => webinars.filter((w) => w.videoUrl && w.videoUrl.trim() !== '').length, [webinars]);
  const avgDuration = useMemo(() => {
    if (!webinars.length) return 0;
    const total = webinars.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);
    return Math.round(total / webinars.length);
  }, [webinars]);

  // Handlers
  const handleOpenCreate = () => {
    setSelectedWebinar(null);
    setForm({
      code: '',
      title: '',
      durationMinutes: 45,
      videoUrl: '',
      displayOrder: (webinars.length || 0) + 1,
      isActive: true,
    });
    setFormErrors({});
    setDrawerMode('create');
  };

  const handleOpenEdit = (webinar: LearnWebinar) => {
    setSelectedWebinar(webinar);
    setForm({
      code: webinar.code || '',
      title: webinar.title || '',
      durationMinutes: webinar.durationMinutes ?? 45,
      videoUrl: webinar.videoUrl || '',
      displayOrder: webinar.displayOrder ?? 1,
      isActive: webinar.isActive ?? true,
    });
    setFormErrors({});
    setDrawerMode('edit');
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.code.trim()) errors.code = 'Webinar slug/code is required';
    else if (!/^[a-zA-Z0-9_-]+$/.test(form.code.trim())) {
      errors.code = 'Code can only contain letters, numbers, hyphens and underscores';
    }
    if (!form.videoUrl.trim()) errors.videoUrl = 'Video URL or streaming link is required';
    else if (!/^https?:\/\//i.test(form.videoUrl.trim())) {
      errors.videoUrl = 'Please provide a valid URL starting with http:// or https://';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (drawerMode === 'create') {
        await createWebinar(form).unwrap();
        toast.success(`Webinar "${form.title}" created successfully.`, 'Webinar Created');
      } else if (drawerMode === 'edit' && selectedWebinar) {
        await updateWebinar({ id: selectedWebinar.id, body: form }).unwrap();
        toast.success(`Webinar "${form.title}" updated successfully.`, 'Webinar Updated');
      }
      setDrawerMode(null);
      refetch();
    } catch (err: any) {
      const msg = err?.data?.statusMessage || err?.data?.message || err?.data?.title || 'Failed to save webinar.';
      toast.error(msg, 'Save Failed');
    }
  };

  const handleToggleActive = async (webinar: LearnWebinar) => {
    try {
      await updateWebinar({
        id: webinar.id,
        body: {
          code: webinar.code,
          title: webinar.title,
          durationMinutes: webinar.durationMinutes,
          videoUrl: webinar.videoUrl,
          displayOrder: webinar.displayOrder,
          isActive: !webinar.isActive,
        },
      }).unwrap();
      toast.success(
        `Webinar "${webinar.title}" is now ${!webinar.isActive ? 'Active' : 'Hidden'}.`,
        'Status Updated'
      );
      refetch();
    } catch (err: any) {
      toast.error('Failed to update webinar status.', 'Update Error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteWebinar(deleteTarget.id).unwrap();
      toast.success(`Webinar "${deleteTarget.title}" deleted.`, 'Webinar Deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      const msg = err?.data?.statusMessage || err?.data?.message || err?.data?.title || 'Failed to delete webinar.';
      toast.error(msg, 'Delete Failed');
    }
  };

  return (
    <div className="space-y-4 pb-12 w-full font-sans">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white leading-tight">
            Webinars &amp; Masterclasses
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage educational webinars, video recordings, masterclass durations, and streaming feeds
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
            <Plus size={14} /> Add Webinar
          </button>
        </div>
      </div>

      {/* ── Analytics Stats Bar ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard
          cardTitle="Total"
          value={isFetching ? '—' : String(webinars.length)}
          topText="Total"
          icon={<Video size={14} className="text-gray-400 shrink-0" />}
          subText="All video masterclasses"
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
          subText="Masterclass availability rate"
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
              placeholder="Search webinar title, code or URL..."
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
              className="text-[11px] text-gray-500 hover:text-[#961A1C] underline font-medium cursor-pointer"
            >
              Reset filters
            </button>
          )}

          {/* View Mode Toggle (Cards default) */}
          <div className="flex items-center rounded border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-100/80 dark:bg-gray-800 ml-auto">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2 py-1 rounded text-xs transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-gray-900 text-[#961A1C] shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Cards view"
            >
              <LayoutGrid size={13} />
              <span className="text-[11px]">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 py-1 rounded text-xs transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-900 text-[#961A1C] shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Table view"
            >
              <List size={13} />
              <span className="text-[11px]">Table</span>
            </button>
          </div>
        </div>

        {/* Content Area: Cards View or Table View */}
        <div className="min-h-[300px]">
          {isError ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-center justify-center">
                <AlertCircle size={20} className="text-[#961A1C]" />
              </div>
              <div className="max-w-md">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Failed to load webinars
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(error as any)?.data?.statusMessage ||
                    'An error occurred while fetching video webinar records.'}
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#961A1C] hover:bg-[#7e1517] text-white rounded-md text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <span>Retry Fetch</span>
              </button>
            </div>
          ) : viewMode === 'cards' ? (
            /* ── Cards Grid View ────────────────────────────────────────────── */
            <div className="p-3.5">
              {isFetching ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-56 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 animate-pulse p-4 flex flex-col justify-between"
                    >
                      <div className="w-full h-28 bg-gray-200 dark:bg-gray-750 rounded" />
                      <div className="space-y-2 mt-3">
                        <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="w-full h-4 bg-gray-100 dark:bg-gray-750 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredWebinars.length === 0 ? (
                <div className="py-16 text-center">
                  <Video className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={36} />
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    No webinars found
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    {searchQuery || statusFilter !== 'All'
                      ? 'No masterclasses match your current filter criteria.'
                      : 'No webinars created yet. Click "+ Add Webinar" to link your first video masterclass.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {paginatedWebinars.map((webinar, idx) => (
                    <WebinarCard
                      key={webinar.id}
                      webinar={webinar}
                      index={(pageNumber - 1) * PAGE_SIZE + idx}
                      onView={() => setViewWebinar(webinar)}
                      onPreview={() => setPreviewWebinar(webinar)}
                      onEdit={() => handleOpenEdit(webinar)}
                      onDelete={() => setDeleteTarget(webinar)}
                      onToggle={() => handleToggleActive(webinar)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── Table View ─────────────────────────────────────────────────── */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100/75 dark:bg-gray-800/80 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-3 py-2 w-12 text-center border-b border-r border-gray-200 dark:border-gray-700">
                      #
                    </th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Webinar Code / Slug
                    </th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700">
                      Masterclass Title &amp; Stream URL
                    </th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Duration
                    </th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Display Order
                    </th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-3 py-2 w-28 text-right border-b border-gray-200 dark:border-gray-700 sticky right-0 bg-gray-100 dark:bg-gray-800 z-10 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.06)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-sans">
                  {isFetching ? (
                    <TableSkeletonRows rows={7} columns={WEBINAR_SKELETON_COLS} />
                  ) : filteredWebinars.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center">
                        <Video className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={36} />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          No webinars found
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                          {searchQuery || statusFilter !== 'All'
                            ? 'No masterclasses match your current filter criteria.'
                            : 'No webinars created yet. Click "+ Add Webinar" to link your first video masterclass.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedWebinars.map((webinar, idx) => (
                      <WebinarRow
                        key={webinar.id}
                        webinar={webinar}
                        index={(pageNumber - 1) * PAGE_SIZE + idx}
                        onView={() => setViewWebinar(webinar)}
                        onPreview={() => setPreviewWebinar(webinar)}
                        onEdit={() => handleOpenEdit(webinar)}
                        onDelete={() => setDeleteTarget(webinar)}
                        onToggle={() => handleToggleActive(webinar)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {!isFetching && !isError && filteredWebinars.length > 0 && (
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
            <Video size={18} className="text-[#961A1C]" />
            <h3 className="text-sm font-semibold">
              {drawerMode === 'create' ? 'Add Video Webinar' : 'Edit Webinar'}
            </h3>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Webinar Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Navigating Volatility in Emerging Markets"
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-md text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${
                  formErrors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Webinar Code / Slug *
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) =>
                  setForm({
                    ...form,
                    code: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                  })
                }
                placeholder="e.g. emerging_markets_masterclass"
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-md text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${
                  formErrors.code ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {formErrors.code && <p className="text-xs text-red-500 mt-1">{formErrors.code}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Streaming Video URL (YouTube, Vimeo, HLS or MP4) *
              </label>
              <input
                type="text"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-md text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${
                  formErrors.videoUrl ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {formErrors.videoUrl && (
                <p className="text-xs text-red-500 mt-1">{formErrors.videoUrl}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm({ ...form, durationMinutes: parseInt(e.target.value) || 45 })
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs font-mono text-gray-900 dark:text-white"
                />
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
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs font-mono text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="p-3 rounded-md bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                    Active Status
                  </span>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
                    Make this masterclass accessible in mobile feed
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
              <span>{drawerMode === 'create' ? 'Publish Webinar' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Drawer>

      {/* ── Webinar Details Drawer ───────────────────────────────────────── */}
      <WebinarDetailsDrawer
        webinar={viewWebinar}
        onClose={() => setViewWebinar(null)}
        onEdit={(w) => {
          setViewWebinar(null);
          handleOpenEdit(w);
        }}
        onPreview={(w) => {
          setPreviewWebinar(w);
        }}
      />

      {/* ── Video Player Modal ────────────────────────────────────────────── */}
      <Modal
        open={Boolean(previewWebinar)}
        onCancel={() => setPreviewWebinar(null)}
        footer={null}
        width={720}
        centered
        destroyOnClose
        className="dark:bg-gray-900"
      >
        {previewWebinar && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {previewWebinar.title}
              </h3>
              <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                <Clock size={12} /> {previewWebinar.durationMinutes} min
              </span>
            </div>

            <div className="relative aspect-video rounded-md overflow-hidden bg-black flex items-center justify-center">
              {previewWebinar.videoUrl.includes('youtube.com') ||
              previewWebinar.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={
                    previewWebinar.videoUrl.includes('watch?v=')
                      ? previewWebinar.videoUrl.replace('watch?v=', 'embed/')
                      : previewWebinar.videoUrl
                  }
                  title={previewWebinar.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-6 text-white space-y-3">
                  <Play size={40} className="mx-auto text-[#961A1C]" />
                  <p className="text-xs text-gray-300 font-mono break-all max-w-md mx-auto">
                    {previewWebinar.videoUrl}
                  </p>
                  <a
                    href={previewWebinar.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#961A1C] text-white text-xs font-semibold hover:bg-[#7a1517] transition"
                  >
                    <span>Open External Video Stream</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

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
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Delete Webinar</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Are you sure you want to delete{' '}
            <strong className="text-gray-800 dark:text-gray-200">"{deleteTarget?.title}"</strong>?
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

function WebinarRow({
  webinar,
  index,
  onView,
  onPreview,
  onEdit,
  onDelete,
  onToggle,
}: {
  webinar: LearnWebinar;
  index: number;
  onView: () => void;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const copyCode = () => {
    if (webinar.code) {
      navigator.clipboard.writeText(webinar.code);
    }
  };

  return (
    <tr className="hover:bg-blue-50/20 dark:hover:bg-gray-800/40 transition-colors group">
      {/* S/N */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 whitespace-nowrap">
        #{index + 1}
      </td>

      {/* Webinar Code */}
      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded bg-gray-100 dark:bg-gray-800 text-[#961A1C] shrink-0">
            <Video size={13} />
          </span>
          <span className="font-mono text-[11px] font-semibold text-gray-800 dark:text-gray-200">
            {webinar.code}
          </span>
          <button
            onClick={copyCode}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            title="Copy Code"
          >
            <Copy size={11} />
          </button>
        </div>
      </td>

      {/* Title & Stream Link */}
      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 min-w-[220px]">
        <button
          onClick={onView}
          className="font-medium text-xs text-gray-900 dark:text-white hover:text-[#961A1C] dark:hover:text-[#e05557] transition-colors text-left truncate block max-w-sm cursor-pointer"
          title={webinar.title}
        >
          {webinar.title}
        </button>
        {webinar.videoUrl && (
          <a
            href={webinar.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline truncate max-w-sm flex items-center gap-1 mt-0.5"
          >
            <ExternalLink size={10} />
            <span className="truncate">{webinar.videoUrl}</span>
          </a>
        )}
      </td>

      {/* Duration */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap font-mono text-[11px] text-gray-600 dark:text-gray-300">
        <span className="inline-flex items-center gap-1">
          <Clock size={12} className="text-gray-400" />
          {webinar.durationMinutes} min
        </span>
      </td>

      {/* Display Order */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
        {webinar.displayOrder ?? 1}
      </td>

      {/* Status */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
            webinar.isActive
              ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              webinar.isActive ? 'bg-emerald-500' : 'bg-gray-400'
            }`}
          />
          {webinar.isActive ? 'Active' : 'Hidden'}
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
          <button
            onClick={onPreview}
            className="text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer flex items-center gap-1"
            title="Preview Video Player"
          >
            <Play size={10} className="fill-current text-[#961A1C]" />
            Watch
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
                  key: 'preview',
                  label: 'Play Webinar',
                  icon: <Play size={13} />,
                  onClick: onPreview,
                },
                {
                  key: 'edit',
                  label: 'Edit Webinar',
                  icon: <Pencil size={13} />,
                  onClick: onEdit,
                },
                {
                  key: 'toggle',
                  label: webinar.isActive ? 'Hide Webinar' : 'Activate Webinar',
                  icon: <Check size={13} />,
                  onClick: onToggle,
                },
                {
                  type: 'divider',
                },
                {
                  key: 'delete',
                  label: 'Delete Webinar',
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

// ─── Webinar Card Component (Used for Cards View) ─────────────────────────────
function WebinarCard({
  webinar,
  index,
  onView,
  onPreview,
  onEdit,
  onDelete,
  onToggle,
}: {
  webinar: LearnWebinar;
  index: number;
  onView: () => void;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-850 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-xs transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Video Thumbnail Header */}
      <div className="relative w-full h-36 bg-gray-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30 z-0" />
        
        {/* Play Button Overlay */}
        <button
          onClick={onPreview}
          className="relative z-10 w-11 h-11 rounded-full bg-[#961A1C]/90 hover:bg-[#961A1C] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition cursor-pointer"
          title="Play Webinar"
        >
          <Play size={18} className="ml-0.5 fill-white" />
        </button>

        {/* Duration Badge */}
        <div className="absolute bottom-2.5 left-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[11px] backdrop-blur-xs">
          <Clock size={11} />
          <span>{webinar.durationMinutes} min</span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2.5 right-3 z-10">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider backdrop-blur-xs ${
              webinar.isActive
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                : 'bg-gray-900/80 text-gray-300 border border-gray-700'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                webinar.isActive ? 'bg-emerald-400' : 'bg-gray-400'
              }`}
            />
            {webinar.isActive ? 'Active' : 'Hidden'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-mono text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
              {webinar.code}
            </span>
            <span className="font-mono text-[11px] text-gray-400">
              Order #{webinar.displayOrder ?? 1}
            </span>
          </div>

          <h3
            onClick={onView}
            className="text-sm font-semibold text-gray-900 dark:text-white hover:text-[#961A1C] dark:hover:text-[#e05557] transition-colors cursor-pointer line-clamp-2 leading-snug"
            title={webinar.title}
          >
            {webinar.title}
          </h3>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onView}
              className="px-2.5 py-1 text-xs font-semibold text-[#961A1C] hover:bg-[#961A1C]/10 rounded border border-[#961A1C]/25 hover:border-[#961A1C]/50 transition cursor-pointer"
            >
              Details
            </button>
            <button
              onClick={onPreview}
              className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 transition cursor-pointer flex items-center gap-1"
            >
              <Play size={10} className="fill-current text-[#961A1C]" />
              Watch
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition cursor-pointer"
              title="Edit Webinar"
            >
              <Pencil size={13} />
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
                    key: 'preview',
                    label: 'Play Webinar',
                    icon: <Play size={13} />,
                    onClick: onPreview,
                  },
                  {
                    key: 'edit',
                    label: 'Edit Webinar',
                    icon: <Pencil size={13} />,
                    onClick: onEdit,
                  },
                  {
                    key: 'toggle',
                    label: webinar.isActive ? 'Hide Webinar' : 'Activate Webinar',
                    icon: <Check size={13} />,
                    onClick: onToggle,
                  },
                  { type: 'divider' },
                  {
                    key: 'delete',
                    label: 'Delete Webinar',
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
        </div>
      </div>
    </div>
  );
}

// ─── Webinar Details Drawer (Cards Layout) ────────────────────────────────────
function WebinarDetailsDrawer({
  webinar,
  onClose,
  onEdit,
  onPreview,
}: {
  webinar: LearnWebinar | null;
  onClose: () => void;
  onEdit: (w: LearnWebinar) => void;
  onPreview: (w: LearnWebinar) => void;
}) {
  return (
    <Drawer
      open={Boolean(webinar)}
      onClose={onClose}
      size={580}
      destroyOnClose
      className="dark:bg-gray-900"
      title={
        <div className="flex items-center justify-between w-full pr-4 text-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            <Video size={18} className="text-[#961A1C]" />
            <h3 className="text-sm font-semibold">Webinar Details</h3>
          </div>
          {webinar && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
                webinar.isActive
                  ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  webinar.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                }`}
              />
              {webinar.isActive ? 'Active' : 'Hidden'}
            </span>
          )}
        </div>
      }
    >
      {webinar && (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 [scrollbar-width:none]">
            {/* Card 1: Video Player / Play Card */}
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-900 relative shadow-xs">
              <div className="relative w-full h-52 flex flex-col items-center justify-center text-center p-4">
                <button
                  onClick={() => onPreview(webinar)}
                  className="w-14 h-14 rounded-full bg-[#961A1C] hover:bg-[#7a1517] text-white flex items-center justify-center shadow-xl transform hover:scale-110 transition cursor-pointer mb-2"
                  title="Launch Video Player"
                >
                  <Play size={24} className="ml-1 fill-white" />
                </button>
                <p className="text-xs font-semibold text-gray-200">
                  Click to play stream
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[11px] flex items-center gap-1 backdrop-blur-xs">
                    <Clock size={11} /> {webinar.durationMinutes} minutes
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Overview Card */}
            <div className="p-4 rounded-lg bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
                Webinar Masterclass
              </span>
              <h2 className="text-xl font-normal text-gray-900 dark:text-gray-50 leading-snug tracking-tight">
                {webinar.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="font-mono text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                  Slug: {webinar.code}
                </span>
                <span className="font-mono text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                  Display Order #{webinar.displayOrder ?? 1}
                </span>
              </div>
            </div>

            {/* Card 3: Stream URL Card */}
            {webinar.videoUrl && (
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-850/60 border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
                  Stream Endpoint
                </span>
                <div className="flex items-center justify-between gap-2 p-2.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs">
                  <span className="font-mono text-gray-800 dark:text-gray-200 truncate flex-1">
                    {webinar.videoUrl}
                  </span>
                  <a
                    href={webinar.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#961A1C] hover:bg-[#7a1517] text-white text-[11px] font-semibold shrink-0 transition"
                  >
                    <span>Open URL</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            )}
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
              onClick={() => onEdit(webinar)}
              className="px-3.5 py-1.5 rounded-md bg-[#961A1C] hover:bg-[#7a1517] text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil size={13} />
              <span>Edit Webinar</span>
            </button>
          </div>
        </div>
      )}
    </Drawer>
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
