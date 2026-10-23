'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Drawer, Modal, Select, Switch, Dropdown } from 'antd';
import {
  FolderTree,
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
  Eye,
  Copy,
  Hash,
  Percent,
  LayoutGrid,
  List,
} from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetLearnTopicsQuery,
  useCreateLearnTopicMutation,
  useUpdateLearnTopicMutation,
  useDeleteLearnTopicMutation,
  LearnTopic,
  CreateLearnTopicRequest,
} from '@/auth/services/adminApi';
import { useToast } from '@/auth/components/ToastContainer';
import { TableSkeletonRows, TableSkeletonCol } from '@/components/TableSkeleton';

function extractTopics(data: any): LearnTopic[] {
  if (!data) return [];
  const raw = data.data !== undefined ? data.data : data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

const emptyTopicForm = (): CreateLearnTopicRequest => ({
  code: '',
  title: '',
  description: '',
  displayOrder: 1,
  isActive: true,
});

const TOPICS_SKELETON_COLS: TableSkeletonCol[] = [
  { type: 'number', align: 'center', width: 'w-6' },
  { type: 'avatar', width: 'w-24' },
  { type: 'text', width: 'w-56' },
  { type: 'number', align: 'center', width: 'w-10' },
  { type: 'badge', align: 'center', width: 'w-14' },
  { type: 'actions', align: 'right', stickyRight: true, width: 'w-20' },
];

export default function TopicsManagementPage() {
  return (
    <RoleGuard allowedRoles={['SuperAdmin', 'Control']}>
      <TopicsManagementContent />
    </RoleGuard>
  );
}

function TopicsManagementContent() {
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [pageNumber, setPageNumber] = useState(1);
  const PAGE_SIZE = 12;

  // Drawer / Form state
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<LearnTopic | null>(null);
  const [form, setForm] = useState<CreateLearnTopicRequest>(emptyTopicForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // View details drawer state
  const [viewTopic, setViewTopic] = useState<LearnTopic | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<LearnTopic | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // RTK Query
  const { data, isFetching, isError, error, refetch } = useGetLearnTopicsQuery();
  const [createTopic, { isLoading: isCreating }] = useCreateLearnTopicMutation();
  const [updateTopic, { isLoading: isUpdating }] = useUpdateLearnTopicMutation();
  const [deleteTopic, { isLoading: isDeleting }] = useDeleteLearnTopicMutation();

  const topics = useMemo(() => extractTopics(data), [data]);

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchSearch =
        !searchQuery ||
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'All'
          ? true
          : statusFilter === 'Active'
          ? t.isActive === true
          : t.isActive === false;
      return matchSearch && matchStatus;
    });
  }, [topics, searchQuery, statusFilter]);

  const totalCount = filteredTopics.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedTopics = useMemo(() => {
    const start = (pageNumber - 1) * PAGE_SIZE;
    return filteredTopics.slice(start, start + PAGE_SIZE);
  }, [filteredTopics, pageNumber, PAGE_SIZE]);

  const activeCount = useMemo(() => topics.filter((t) => t.isActive).length, [topics]);
  const inactiveCount = useMemo(() => topics.filter((t) => !t.isActive).length, [topics]);
  const userPercentage = useMemo(() => {
    if (!topics.length) return '0.0%';
    return ((activeCount / topics.length) * 100).toFixed(1) + '%';
  }, [topics.length, activeCount]);

  // Handlers
  const handleOpenCreate = () => {
    setSelectedTopic(null);
    setForm({
      code: '',
      title: '',
      description: '',
      displayOrder: (topics.length || 0) + 1,
      isActive: true,
    });
    setFormErrors({});
    setDrawerMode('create');
  };

  const handleOpenEdit = (topic: LearnTopic) => {
    setSelectedTopic(topic);
    setForm({
      code: topic.code || '',
      title: topic.title || '',
      description: topic.description || '',
      displayOrder: topic.displayOrder ?? 1,
      isActive: topic.isActive ?? true,
    });
    setFormErrors({});
    setDrawerMode('edit');
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.code.trim()) errors.code = 'Topic code/slug is required';
    else if (!/^[a-zA-Z0-9_-]+$/.test(form.code.trim())) {
      errors.code = 'Code can only contain letters, numbers, hyphens and underscores';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (drawerMode === 'create') {
        await createTopic(form).unwrap();
        toast.success(`Topic "${form.title}" created successfully.`, 'Topic Created');
      } else if (drawerMode === 'edit' && selectedTopic) {
        await updateTopic({ id: selectedTopic.id, body: form }).unwrap();
        toast.success(`Topic "${form.title}" updated successfully.`, 'Topic Updated');
      }
      setDrawerMode(null);
      refetch();
    } catch (err: any) {
      const msg = err?.data?.statusMessage || err?.data?.message || err?.data?.title || 'An error occurred while saving topic.';
      toast.error(msg, 'Save Failed');
    }
  };

  const handleToggleActive = async (topic: LearnTopic) => {
    try {
      await updateTopic({
        id: topic.id,
        body: {
          code: topic.code,
          title: topic.title,
          description: topic.description,
          displayOrder: topic.displayOrder,
          isActive: !topic.isActive,
        },
      }).unwrap();
      toast.success(
        `Topic "${topic.title}" is now ${!topic.isActive ? 'Active' : 'Hidden'}.`,
        'Status Updated'
      );
      refetch();
    } catch (err: any) {
      toast.error('Failed to update topic status.', 'Update Error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteTopic(deleteTarget.id).unwrap();
      toast.success(`Topic "${deleteTarget.title}" deleted successfully.`, 'Topic Deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      const msg =
        err?.data?.statusMessage ||
        err?.data?.message ||
        err?.data?.title ||
        'Cannot delete topic. It may still contain articles or associated resources.';
      setDeleteError(msg);
      toast.error(msg, 'Deletion Failed');
    }
  };

  return (
    <div className="space-y-4 pb-12 w-full font-sans">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white leading-tight">
            Topics Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Organize educational content into structured categories and filtering taxonomies
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
            <Plus size={14} /> Add Topic
          </button>
        </div>
      </div>

      {/* ── Analytics Stats Bar ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard
          cardTitle="Total"
          value={isFetching ? '—' : String(topics.length)}
          topText="Total"
          icon={<FolderTree size={14} className="text-gray-400 shrink-0" />}
          subText="Taxonomy categories"
        />
        <StatCard
          cardTitle="Active"
          value={isFetching ? '—' : String(activeCount)}
          topText="Active"
          icon={<Check size={14} className="text-emerald-500 shrink-0" />}
          subText="Visible to retail users"
        />
        <StatCard
          cardTitle="Inactive"
          value={isFetching ? '—' : String(inactiveCount)}
          topText="Inactive"
          icon={<X size={14} className="text-gray-400 shrink-0" />}
          subText="Unpublished categories"
        />
        <StatCard
          cardTitle="User Percentage"
          value={isFetching ? '—' : userPercentage}
          topText="User Percentage"
          icon={<Percent size={14} className="text-[#961A1C] shrink-0" />}
          subText="Curriculum taxonomy reach"
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
              placeholder="Search topic title, code or slug..."
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
                  Failed to load topics
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(error as any)?.data?.statusMessage ||
                    'An error occurred while fetching topic taxonomy records.'}
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
                      className="h-44 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 animate-pulse p-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="w-48 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="w-full h-8 bg-gray-100 dark:bg-gray-750 rounded" />
                      </div>
                      <div className="w-full h-7 bg-gray-200 dark:bg-gray-700 rounded mt-4" />
                    </div>
                  ))}
                </div>
              ) : filteredTopics.length === 0 ? (
                <div className="py-16 text-center">
                  <FolderTree className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={36} />
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">No topics found</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    {searchQuery || statusFilter !== 'All'
                      ? 'No topics match your current filter settings.'
                      : 'No topics are created yet. Click "+ Add Topic" to create your first category.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {paginatedTopics.map((topic, idx) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      index={(pageNumber - 1) * PAGE_SIZE + idx}
                      onView={() => setViewTopic(topic)}
                      onEdit={() => handleOpenEdit(topic)}
                      onDelete={() => setDeleteTarget(topic)}
                      onToggle={() => handleToggleActive(topic)}
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
                      Topic Code / Slug
                    </th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700">
                      Topic Title &amp; Description
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
                    <TableSkeletonRows rows={7} columns={TOPICS_SKELETON_COLS} />
                  ) : filteredTopics.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <FolderTree className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={36} />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">No topics found</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                          {searchQuery || statusFilter !== 'All'
                            ? 'No topics match your current filter settings.'
                            : 'No topics are created yet. Click "+ Add Topic" to create your first category.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedTopics.map((topic, idx) => (
                      <TopicRow
                        key={topic.id}
                        topic={topic}
                        index={(pageNumber - 1) * PAGE_SIZE + idx}
                        onView={() => setViewTopic(topic)}
                        onEdit={() => handleOpenEdit(topic)}
                        onDelete={() => setDeleteTarget(topic)}
                        onToggle={() => handleToggleActive(topic)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {!isFetching && !isError && filteredTopics.length > 0 && (
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
            <FolderTree size={18} className="text-[#961A1C]" />
            <h3 className="text-sm font-semibold">
              {drawerMode === 'create' ? 'Add New Topic' : 'Edit Topic'}
            </h3>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Topic Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Mutual Funds & Collective Schemes"
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-md text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${
                  formErrors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Topic Code / Slug *
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
                placeholder="e.g. mutual_funds"
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-md text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${
                  formErrors.code ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {formErrors.code && <p className="text-xs text-red-500 mt-1">{formErrors.code}</p>}
              <p className="text-[10px] text-gray-400 mt-1">
                Unique identifier used as filtering tag in retail apps.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short summary of what this topic covers..."
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
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
                    Make this topic available for investor navigation
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
              <span>{drawerMode === 'create' ? 'Create Topic' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Drawer>

      {/* ── Topic Details Drawer ─────────────────────────────────────────── */}
      <TopicDetailsDrawer
        topic={viewTopic}
        onClose={() => setViewTopic(null)}
        onEdit={(t) => {
          setViewTopic(null);
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
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Delete Topic</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Are you sure you want to delete{' '}
            <strong className="text-gray-800 dark:text-gray-200">"{deleteTarget?.title}"</strong>?
            This action cannot be undone.
          </p>
          {deleteError && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2 rounded mt-2 border border-red-200 dark:border-red-900/40">
              {deleteError}
            </p>
          )}
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

function TopicRow({
  topic,
  index,
  onView,
  onEdit,
  onDelete,
  onToggle,
}: {
  topic: LearnTopic;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const copyCode = () => {
    if (topic.code) {
      navigator.clipboard.writeText(topic.code);
    }
  };

  return (
    <tr className="hover:bg-blue-50/20 dark:hover:bg-gray-800/40 transition-colors group">
      {/* S/N */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 whitespace-nowrap">
        #{index + 1}
      </td>

      {/* Topic Code */}
      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded bg-gray-100 dark:bg-gray-800 text-[#961A1C] shrink-0">
            <FolderTree size={13} />
          </span>
          <span className="font-mono text-[11px] font-semibold text-gray-800 dark:text-gray-200">
            {topic.code}
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

      {/* Title & Description */}
      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 min-w-[200px]">
        <button
          onClick={onView}
          className="font-medium text-xs text-gray-900 dark:text-white hover:text-[#961A1C] dark:hover:text-[#e05557] transition-colors text-left truncate block max-w-sm cursor-pointer"
          title={topic.title}
        >
          {topic.title}
        </button>
        {topic.description && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-sm mt-0.5">
            {topic.description}
          </p>
        )}
      </td>

      {/* Display Order */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
        {topic.displayOrder ?? 1}
      </td>

      {/* Status */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
            topic.isActive
              ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              topic.isActive ? 'bg-emerald-500' : 'bg-gray-400'
            }`}
          />
          {topic.isActive ? 'Active' : 'Hidden'}
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
                  label: 'Edit Topic',
                  icon: <Pencil size={13} />,
                  onClick: onEdit,
                },
                {
                  key: 'toggle',
                  label: topic.isActive ? 'Hide Topic' : 'Activate Topic',
                  icon: <Check size={13} />,
                  onClick: onToggle,
                },
                {
                  type: 'divider',
                },
                {
                  key: 'delete',
                  label: 'Delete Topic',
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

// ─── Topic Card Component (Used for Cards View) ───────────────────────────────
function TopicCard({
  topic,
  index,
  onView,
  onEdit,
  onDelete,
  onToggle,
}: {
  topic: LearnTopic;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-850 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-xs transition-all duration-200 flex flex-col justify-between p-4 group">
      <div>
        {/* Header: Icon, Slug, Status, Actions */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-md bg-red-50 dark:bg-red-950/40 text-[#961A1C] flex items-center justify-center shrink-0 border border-red-100 dark:border-red-900/30">
              <FolderTree size={16} />
            </span>
            <span className="font-mono text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
              {topic.code}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
                topic.isActive
                  ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  topic.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                }`}
              />
              {topic.isActive ? 'Active' : 'Hidden'}
            </span>
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
                    label: 'Edit Topic',
                    icon: <Pencil size={13} />,
                    onClick: onEdit,
                  },
                  {
                    key: 'toggle',
                    label: topic.isActive ? 'Hide Topic' : 'Activate Topic',
                    icon: <Check size={13} />,
                    onClick: onToggle,
                  },
                  { type: 'divider' },
                  {
                    key: 'delete',
                    label: 'Delete Topic',
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

        {/* Title */}
        <h3
          onClick={onView}
          className="text-sm font-semibold text-gray-900 dark:text-white hover:text-[#961A1C] dark:hover:text-[#e05557] transition-colors cursor-pointer line-clamp-1 mb-1.5"
          title={topic.title}
        >
          {topic.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 min-h-[32px]">
          {topic.description || 'No descriptive summary configured for this topic category.'}
        </p>
      </div>

      {/* Footer / Actions */}
      <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs">
        <span className="font-mono text-[11px] text-gray-400">
          Order: #{topic.displayOrder ?? 1}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onView}
            className="px-2.5 py-1 text-xs font-semibold text-[#961A1C] hover:bg-[#961A1C]/10 rounded border border-[#961A1C]/25 hover:border-[#961A1C]/50 transition cursor-pointer"
          >
            Details
          </button>
          <button
            onClick={onEdit}
            className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition cursor-pointer"
            title="Edit Topic"
          >
            <Pencil size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Topic Details Drawer (Cards Layout) ──────────────────────────────────────
function TopicDetailsDrawer({
  topic,
  onClose,
  onEdit,
}: {
  topic: LearnTopic | null;
  onClose: () => void;
  onEdit: (topic: LearnTopic) => void;
}) {
  return (
    <Drawer
      open={Boolean(topic)}
      onClose={onClose}
      size={560}
      destroyOnClose
      className="dark:bg-gray-900"
      title={
        <div className="flex items-center justify-between w-full pr-4 text-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            <FolderTree size={18} className="text-[#961A1C]" />
            <h3 className="text-sm font-semibold">Topic Details</h3>
          </div>
          {topic && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
                topic.isActive
                  ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  topic.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                }`}
              />
              {topic.isActive ? 'Active' : 'Hidden'}
            </span>
          )}
        </div>
      }
    >
      {topic && (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 [scrollbar-width:none]">
            {/* Card 1: Primary Overview Card */}
            <div className="p-4 rounded-lg bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
                Topic Taxonomy
              </span>
              <h2 className="text-2xl font-light text-gray-900 dark:text-gray-50 leading-snug tracking-tight">
                {topic.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="font-mono text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                  Slug: {topic.code}
                </span>
                <span className="font-mono text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                  Display Order #{topic.displayOrder ?? 1}
                </span>
              </div>
            </div>

            {/* Card 2: Description Card */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-850/60 border border-gray-200 dark:border-gray-800 space-y-1.5">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
                Curriculum Description
              </span>
              <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-sans leading-relaxed">
                {topic.description || 'No description provided for this topic.'}
              </p>
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
              onClick={() => onEdit(topic)}
              className="px-3.5 py-1.5 rounded-md bg-[#961A1C] hover:bg-[#7a1517] text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil size={13} />
              <span>Edit Topic</span>
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
