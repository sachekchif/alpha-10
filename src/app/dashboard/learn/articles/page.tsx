'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Drawer, Modal, Select, Switch, Dropdown } from 'antd';
import {
  FileText,
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
  Eye,
  FolderTree,
  Clock,
  Image as ImageIcon,
  Video as VideoIcon,
  BookOpen,
  Sparkles,
  MoreHorizontal,
  Copy,
  Check,
  Percent,
  Star,
  Upload,
} from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetLearnArticlesQuery,
  useGetLearnArticleByIdQuery,
  useGetLearnTopicsQuery,
  useCreateLearnArticleMutation,
  useUpdateLearnArticleMutation,
  useDeleteLearnArticleMutation,
  LearnArticle,
  CreateLearnArticleRequest,
  LearnTopic,
} from '@/auth/services/adminApi';
import { useToast } from '@/auth/components/ToastContainer';
import { TableSkeletonRows, TableSkeletonCol } from '@/components/TableSkeleton';

function extractData<T>(res: any): T[] {
  if (!res) return [];
  const raw = res.data !== undefined ? res.data : res;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

const emptyArticleForm = (): CreateLearnArticleRequest => ({
  code: '',
  topicCode: '',
  title: '',
  summary: '',
  body: '',
  keyTakeaway: '',
  level: 'Beginner',
  readMinutes: 3,
  mediaType: 'None',
  mediaUrl: '',
  nextArticleCode: '',
  displayOrder: 1,
  isActive: true,
});

const ARTICLE_SKELETON_COLS: TableSkeletonCol[] = [
  { type: 'number', align: 'center', width: 'w-6' },
  { type: 'avatar', width: 'w-24' },
  { type: 'text', width: 'w-48' },
  { type: 'badge', align: 'center', width: 'w-16' },
  { type: 'badge', align: 'center', width: 'w-14' },
  { type: 'badge', align: 'center', width: 'w-12' },
  { type: 'badge', align: 'center', width: 'w-14' },
  { type: 'badge', align: 'center', width: 'w-12' },
  { type: 'actions', align: 'right', stickyRight: true, width: 'w-20' },
];

export default function ArticlesManagementPage() {
  return (
    <RoleGuard allowedRoles={['SuperAdmin', 'Control']}>
      <ArticlesManagementContent />
    </RoleGuard>
  );
}

function ArticlesManagementContent() {
  const toast = useToast();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('All');
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [pageNumber, setPageNumber] = useState(1);
  const PAGE_SIZE = 20;

  // Drawer / Form state
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<LearnArticle | null>(null);
  const [form, setForm] = useState<CreateLearnArticleRequest>(emptyArticleForm());
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // View detail drawer state (stores article ID to call getLearnArticleById API)
  const [viewArticleId, setViewArticleId] = useState<string | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<LearnArticle | null>(null);

  // RTK Query
  const { data: articlesData, isFetching, isError, error, refetch } = useGetLearnArticlesQuery();
  const { data: topicsData } = useGetLearnTopicsQuery();

  const [createArticle, { isLoading: isCreating }] = useCreateLearnArticleMutation();
  const [updateArticle, { isLoading: isUpdating }] = useUpdateLearnArticleMutation();
  const [deleteArticle, { isLoading: isDeleting }] = useDeleteLearnArticleMutation();

  const articles = useMemo(() => extractData<LearnArticle>(articlesData), [articlesData]);
  const topics = useMemo(() => extractData<LearnTopic>(topicsData), [topicsData]);

  const topicMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of topics) {
      if (t.code) map[t.code] = t.title || t.code;
    }
    return map;
  }, [topics]);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchSearch =
        !searchQuery ||
        art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTopic = topicFilter === 'All' || art.topicCode === topicFilter;
      const matchLevel = levelFilter === 'All' || art.level === levelFilter;
      const matchStatus =
        statusFilter === 'All'
          ? true
          : statusFilter === 'Active'
          ? art.isActive === true
          : art.isActive === false;
      return matchSearch && matchTopic && matchLevel && matchStatus;
    });
  }, [articles, searchQuery, topicFilter, levelFilter, statusFilter]);

  const totalCount = articles.length;
  const activeCount = useMemo(() => articles.filter((a) => a.isActive).length, [articles]);
  const inactiveCount = useMemo(() => articles.filter((a) => !a.isActive).length, [articles]);
  const userPercentage = useMemo(() => {
    if (!totalCount) return '0.0%';
    return ((activeCount / totalCount) * 100).toFixed(1) + '%';
  }, [totalCount, activeCount]);

  const totalFilteredCount = filteredArticles.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / PAGE_SIZE));
  const paginatedArticles = useMemo(() => {
    const start = (pageNumber - 1) * PAGE_SIZE;
    return filteredArticles.slice(start, start + PAGE_SIZE);
  }, [filteredArticles, pageNumber, PAGE_SIZE]);

  // Handlers
  const handleOpenCreate = () => {
    setSelectedArticle(null);
    setForm({
      ...emptyArticleForm(),
      topicCode: topics[0]?.code || '',
      displayOrder: (articles.length || 0) + 1,
    });
    setCoverImagePreview(null);
    setFormErrors({});
    setDrawerMode('create');
  };

  const handleOpenEdit = (article: LearnArticle) => {
    setSelectedArticle(article);
    setForm({
      code: article.code || '',
      topicCode: article.topicCode || '',
      title: article.title || '',
      summary: article.summary || '',
      body: article.body || '',
      keyTakeaway: article.keyTakeaway || '',
      level: article.level || 'Beginner',
      readMinutes: article.readMinutes ?? 3,
      mediaType: article.mediaType || 'None',
      mediaUrl: article.mediaUrl || '',
      nextArticleCode: article.nextArticleCode || '',
      displayOrder: article.displayOrder ?? 1,
      isActive: article.isActive ?? true,
    });
    setCoverImagePreview(article.mediaUrl || null);
    setFormErrors({});
    setDrawerMode('edit');
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.topicCode) errors.topicCode = 'Please select a topic';
    if (!form.summary.trim()) errors.summary = 'Summary is required';
    if (!form.body.trim()) errors.body = 'Article content body is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const generatedCode =
      form.code ||
      form.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') ||
      `art_${Date.now()}`;

    const payload: CreateLearnArticleRequest = {
      ...form,
      code: generatedCode,
      mediaType: coverImagePreview ? 'Image' : 'None',
      mediaUrl: coverImagePreview || '',
    };

    try {
      if (drawerMode === 'create') {
        await createArticle(payload).unwrap();
        toast.success(`Article "${form.title}" created successfully.`, 'Article Created');
      } else if (drawerMode === 'edit' && selectedArticle) {
        await updateArticle({ id: selectedArticle.id, body: payload }).unwrap();
        toast.success(`Article "${form.title}" updated successfully.`, 'Article Updated');
      }
      setDrawerMode(null);
      refetch();
    } catch (err: any) {
      const msg = err?.data?.statusMessage || err?.data?.message || err?.data?.title || 'An error occurred while saving article.';
      toast.error(msg, 'Save Failed');
    }
  };

  const handleToggleActive = async (article: LearnArticle) => {
    try {
      await updateArticle({
        id: article.id,
        body: {
          code: article.code,
          topicCode: article.topicCode,
          title: article.title,
          summary: article.summary,
          body: article.body,
          keyTakeaway: article.keyTakeaway,
          level: article.level,
          readMinutes: article.readMinutes,
          mediaType: article.mediaType,
          mediaUrl: article.mediaUrl,
          nextArticleCode: article.nextArticleCode,
          displayOrder: article.displayOrder,
          isActive: !article.isActive,
        },
      }).unwrap();
      toast.success(
        `Article "${article.title}" is now ${!article.isActive ? 'Active' : 'Hidden'}.`,
        'Status Updated'
      );
      refetch();
    } catch (err: any) {
      toast.error('Failed to update article status.', 'Update Error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteArticle(deleteTarget.id).unwrap();
      toast.success(`Article "${deleteTarget.title}" deleted successfully.`, 'Article Deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      const msg = err?.data?.statusMessage || err?.data?.message || err?.data?.title || 'Failed to delete article.';
      toast.error(msg, 'Delete Error');
    }
  };

  return (
    <div className="space-y-4 pb-12 w-full font-sans">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white leading-tight">
            Articles Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Publish and manage reading material, editorial guides, and investor education articles
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
            <Plus size={14} /> Add Article
          </button>
        </div>
      </div>

      {/* ── Analytics Stats Bar (Total, Active, Inactive, User Percentage) ────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard
          cardTitle="Total"
          value={isFetching ? '—' : String(totalCount)}
          topText="Total"
          icon={<FileText size={14} className="text-gray-400 shrink-0" />}
          subText="Curated learning curriculum"
        />
        <StatCard
          cardTitle="Active"
          value={isFetching ? '—' : String(activeCount)}
          topText="Active"
          icon={<Check size={14} className="text-emerald-500 shrink-0" />}
          subText="Visible to investors"
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
      <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden flex flex-col">
        {/* Filters Toolbar */}
        <div className="px-3.5 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex flex-wrap items-center gap-2.5 text-xs">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search article title, code or summary..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPageNumber(1);
              }}
              className="w-full pl-8 pr-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>

          {/* Topic Filter */}
          <Select
            size="small"
            value={topicFilter}
            onChange={(val) => {
              setTopicFilter(val);
              setPageNumber(1);
            }}
            className="w-36 text-xs"
            options={[
              { value: 'All', label: 'All Topics' },
              ...topics.map((t) => ({ value: t.code, label: t.title })),
            ]}
          />

          {/* Level Filter */}
          <Select
            size="small"
            value={levelFilter}
            onChange={(val) => {
              setLevelFilter(val);
              setPageNumber(1);
            }}
            className="w-28 text-xs"
            options={[
              { value: 'All', label: 'All Levels' },
              { value: 'Beginner', label: 'Beginner' },
              { value: 'Intermediate', label: 'Intermediate' },
              { value: 'Advanced', label: 'Advanced' },
            ]}
          />

          {/* Status Filter */}
          <Select
            size="small"
            value={statusFilter}
            onChange={(val: 'All' | 'Active' | 'Inactive') => {
              setStatusFilter(val);
              setPageNumber(1);
            }}
            className="w-28 text-xs"
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active only' },
              { value: 'Inactive', label: 'Hidden only' },
            ]}
          />

          {/* Reset Filters */}
          {(searchQuery || topicFilter !== 'All' || levelFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTopicFilter('All');
                setLevelFilter('All');
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
                  Failed to load articles
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(error as any)?.data?.statusMessage ||
                    'An error occurred while fetching article data.'}
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
                      Article Code
                    </th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700">
                      Title &amp; Summary
                    </th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Topic
                    </th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Level
                    </th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Read Time
                    </th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Media
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
                    <TableSkeletonRows rows={7} columns={ARTICLE_SKELETON_COLS} />
                  ) : filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center">
                        <FileText className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={36} />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">No articles found</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                          {searchQuery || topicFilter !== 'All' || levelFilter !== 'All' || statusFilter !== 'All'
                            ? 'No articles match your current filter settings.'
                            : 'No articles are published yet. Click "+ Add Article" to publish your first piece.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedArticles.map((art, idx) => (
                      <ArticleRow
                        key={art.id}
                        art={art}
                        topicName={topicMap[art.topicCode] || art.topicCode}
                        index={(pageNumber - 1) * PAGE_SIZE + idx}
                        onView={() => setViewArticleId(art.id)}
                        onEdit={() => handleOpenEdit(art)}
                        onDelete={() => setDeleteTarget(art)}
                        onToggle={() => handleToggleActive(art)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {!isFetching && !isError && filteredArticles.length > 0 && (
          <div className="flex items-center justify-between px-3.5 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 mt-auto text-xs">
            <span className="text-gray-500 font-mono text-[11px]">
              Showing {(pageNumber - 1) * PAGE_SIZE + 1}–{Math.min(pageNumber * PAGE_SIZE, totalFilteredCount)} of {totalFilteredCount} records
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
        size={560}
        destroyOnClose
        maskClosable={false}
        className="dark:bg-gray-900"
        title={
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <FileText size={18} className="text-[#961A1C]" />
            <h3 className="text-sm font-semibold">
              {drawerMode === 'create' ? 'Add New Article' : 'Edit Article'}
            </h3>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-4 [scrollbar-width:none]">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Article Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Navigating Inflation and Fixed Income Rates"
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-md text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${
                  formErrors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Parent Topic *
              </label>
              <Select
                value={form.topicCode || undefined}
                onChange={(val) => setForm({ ...form, topicCode: val })}
                placeholder="Select Topic"
                className="w-full text-xs"
                options={topics.map((t) => ({ value: t.code, label: t.title }))}
              />
              {formErrors.topicCode && (
                <p className="text-xs text-red-500 mt-1">{formErrors.topicCode}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Summary *
              </label>
              <textarea
                rows={2}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="Short summary preview for investor feeds..."
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-md text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${
                  formErrors.summary ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {formErrors.summary && <p className="text-xs text-red-500 mt-1">{formErrors.summary}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Article Body Content (Markdown Supported) *
              </label>
              <textarea
                rows={7}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Full article content formatted in markdown or plain text..."
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-md text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${
                  formErrors.body ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {formErrors.body && <p className="text-xs text-red-500 mt-1">{formErrors.body}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Key Takeaway
              </label>
              <input
                type="text"
                value={form.keyTakeaway}
                onChange={(e) => setForm({ ...form, keyTakeaway: e.target.value })}
                placeholder="One-sentence key takeaway callout"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Target Level
                </label>
                <Select
                  value={form.level || 'Beginner'}
                  onChange={(val) => setForm({ ...form, level: val })}
                  className="w-full text-xs"
                  options={[
                    { value: 'Beginner', label: 'Beginner' },
                    { value: 'Intermediate', label: 'Intermediate' },
                    { value: 'Advanced', label: 'Advanced' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Read Minutes
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.readMinutes}
                  onChange={(e) =>
                    setForm({ ...form, readMinutes: parseInt(e.target.value) || 3 })
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

            {/* Upload Box (Replaces Media Type and URL) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Article Cover Image
                </label>
                <span className="text-[11px] text-gray-400">Optional</span>
              </div>
              {coverImagePreview ? (
                <div className="relative w-full h-44 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 group">
                  <img
                    src={coverImagePreview}
                    alt="Article Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="px-3 py-1.5 rounded-md bg-white/95 hover:bg-white text-gray-800 text-xs font-medium cursor-pointer transition shadow-xs flex items-center gap-1.5">
                      <Upload size={13} />
                      <span>Change Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setCoverImagePreview(url);
                            setForm((prev) => ({ ...prev, mediaType: 'Image', mediaUrl: url }));
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImagePreview(null);
                        setForm((prev) => ({ ...prev, mediaType: 'None', mediaUrl: '' }));
                      }}
                      className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-[#961A1C] dark:hover:border-[#961A1C] rounded-lg bg-gray-50/50 dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer p-4 text-center group">
                  <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-center justify-center text-[#961A1C] mb-2 group-hover:scale-105 transition-transform">
                    <Upload size={18} />
                  </div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-200">
                    <span className="text-[#961A1C] font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    SVG, PNG, JPG, or WEBP (Max 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setCoverImagePreview(url);
                        setForm((prev) => ({ ...prev, mediaType: 'Image', mediaUrl: url }));
                      }
                    }}
                  />
                </label>
              )}
            </div>

            <div className="p-3 rounded-md bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                    Active Status
                  </span>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
                    Make this article visible to retail app readers
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
              <span>{drawerMode === 'create' ? 'Publish Article' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Drawer>

      {/* ── Article Details Drawer (Calls GET /admin/learn/articles/{id}) ─── */}
      <ArticleDetailsDrawer
        articleId={viewArticleId}
        initialArticle={articles.find((a) => a.id === viewArticleId)}
        onClose={() => setViewArticleId(null)}
        onEdit={(art) => {
          setViewArticleId(null);
          handleOpenEdit(art);
        }}
        topicMap={topicMap}
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
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Delete Article</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Are you sure you want to delete{' '}
            <strong className="text-gray-800 dark:text-gray-200">"{deleteTarget?.title}"</strong>?
            This will permanently remove it from the investor curriculum.
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

function ArticleRow({
  art,
  topicName,
  index,
  onView,
  onEdit,
  onDelete,
  onToggle,
}: {
  art: LearnArticle;
  topicName: string;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const copyCode = () => {
    if (art.code) {
      navigator.clipboard.writeText(art.code);
    }
  };

  return (
    <tr className="hover:bg-blue-50/20 dark:hover:bg-gray-800/40 transition-colors group">
      {/* S/N */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 whitespace-nowrap">
        #{index + 1}
      </td>

      {/* Article Code */}
      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded bg-gray-100 dark:bg-gray-800 text-[#961A1C] shrink-0">
            <FileText size={13} />
          </span>
          <span className="font-mono text-[11px] font-semibold text-gray-800 dark:text-gray-200">
            {art.code}
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

      {/* Title & Summary */}
      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 min-w-[200px]">
        <button
          onClick={onView}
          className="font-medium text-xs text-gray-900 dark:text-white hover:text-[#961A1C] dark:hover:text-[#e05557] transition-colors text-left truncate block max-w-sm cursor-pointer"
          title={art.title}
        >
          {art.title}
        </button>
        {art.summary && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-sm mt-0.5">
            {art.summary}
          </p>
        )}
      </td>

      {/* Topic */}
      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded">
          <FolderTree size={11} />
          {topicName}
        </span>
      </td>

      {/* Level */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        <span
          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
            art.level === 'Beginner'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
          }`}
        >
          {art.level}
        </span>
      </td>

      {/* Read Time */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap font-mono text-[11px] text-gray-600 dark:text-gray-300">
        <span className="inline-flex items-center gap-1">
          <Clock size={12} className="text-gray-400" />
          {art.readMinutes} min
        </span>
      </td>

      {/* Media */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        {art.mediaType === 'Image' ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 dark:text-purple-400 font-medium">
            <ImageIcon size={12} /> Image
          </span>
        ) : art.mediaType === 'Video' ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
            <VideoIcon size={12} /> Video
          </span>
        ) : (
          <span className="text-[11px] text-gray-400">None</span>
        )}
      </td>

      {/* Status */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
            art.isActive
              ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              art.isActive ? 'bg-emerald-500' : 'bg-gray-400'
            }`}
          />
          {art.isActive ? 'Active' : 'Hidden'}
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
                  label: 'Edit Article',
                  icon: <Pencil size={13} />,
                  onClick: onEdit,
                },
                {
                  key: 'toggle',
                  label: art.isActive ? 'Hide Article' : 'Publish Article',
                  icon: <Check size={13} />,
                  onClick: onToggle,
                },
                {
                  type: 'divider',
                },
                {
                  key: 'delete',
                  label: 'Delete Article',
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

// ─── Article Details Drawer (Calls GET /admin/learn/articles/{id}) ──────────────
function ArticleDetailsDrawer({
  articleId,
  initialArticle,
  onClose,
  onEdit,
  topicMap,
}: {
  articleId: string | null;
  initialArticle?: LearnArticle;
  onClose: () => void;
  onEdit: (art: LearnArticle) => void;
  topicMap: Record<string, string>;
}) {
  const {
    data,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetLearnArticleByIdQuery(articleId!, { skip: !articleId });

  const raw = data?.data !== undefined ? data.data : data;
  const article = (raw as LearnArticle | undefined) || initialArticle;

  return (
    <Drawer
      open={Boolean(articleId)}
      onClose={onClose}
      size={580}
      destroyOnClose
      className="dark:bg-gray-900"
      title={
        <div className="flex items-center justify-between w-full pr-4 text-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#961A1C]" />
            <h3 className="text-sm font-semibold">Article Details</h3>
            {isFetching && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#961A1C] font-normal font-mono ml-2">
                <Loader2 size={12} className="animate-spin" />
                <span>Syncing API...</span>
              </span>
            )}
          </div>
          {article && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
                article.isActive
                  ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  article.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                }`}
              />
              {article.isActive ? 'Active' : 'Hidden'}
            </span>
          )}
        </div>
      }
    >
      {isFetching && !article ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 size={32} className="animate-spin text-[#961A1C]" />
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 font-mono">
            Calling GET /api/admin/learn/articles/{articleId?.slice(0, 8)}...
          </p>
        </div>
      ) : isError && !article ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 gap-3 text-center">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-center justify-center">
            <AlertCircle size={20} className="text-[#961A1C]" />
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
            Failed to load article details
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {(error as any)?.data?.statusMessage ||
              (error as any)?.data?.message ||
              'An error occurred while fetching the article record from the API.'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#961A1C] hover:bg-[#7e1517] text-white rounded-md text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <span>Retry Fetch</span>
          </button>
        </div>
      ) : article ? (
        <div className="flex flex-col h-full">
          {isError && (
            <div className="mb-3 p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <span>Could not refresh from live API. Showing cached article details.</span>
              <button
                onClick={() => refetch()}
                className="underline font-semibold ml-2 hover:text-amber-900 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 [scrollbar-width:none]">
            {/* 1. Topic (Bigger) */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-md">
                <FolderTree size={14} />
                {topicMap[article.topicCode] || article.topicCode}
              </span>
            </div>

            {/* 2. Title (Bigger but in lighter font weight) */}
            <h2 className="text-2xl font-light text-gray-900 dark:text-gray-50 leading-snug tracking-tight">
              {article.title}
            </h2>

            {/* 3. Summary */}
            {article.summary && (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-sans">
                {article.summary}
              </p>
            )}

            {/* 4. How long it takes to read · Display Order */}
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1">
                <Clock size={13} className="text-gray-400" />
                {article.readMinutes} min read
              </span>
              <span className="text-gray-300 dark:text-gray-600 font-bold">·</span>
              <span>Display Order #{article.displayOrder}</span>
            </div>

            {/* 5. Level */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Level:</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider ${
                  article.level === 'Beginner'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : article.level === 'Intermediate'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    : 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                }`}
              >
                {article.level}
              </span>
            </div>

            {/* (No slug - removed as requested) */}

            {/* Media Preview (If Any) */}
            {article.mediaUrl && (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 max-h-56 bg-gray-100 dark:bg-gray-850">
                <img
                  src={article.mediaUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* 6. Full Article Content */}
            <div className="space-y-1.5 pt-1 border-t border-gray-100 dark:border-gray-800">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
                Full Article Content
              </span>
              <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-lg border border-gray-200 dark:border-gray-800 text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-sans leading-relaxed whitespace-pre-wrap">
                {article.body}
              </div>
            </div>

            {/* 7. Key Takeaway with Gold Star */}
            {article.keyTakeaway && (
              <div className="p-4 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <Star size={16} className="text-amber-500 fill-amber-400 shrink-0" />
                  <span className="uppercase tracking-wider font-mono">Key Takeaway</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed pl-6">
                  {article.keyTakeaway}
                </p>
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
              onClick={() => onEdit(article)}
              className="px-3.5 py-1.5 rounded-md bg-[#961A1C] hover:bg-[#7a1517] text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil size={13} />
              <span>Edit Article</span>
            </button>
          </div>
        </div>
      ) : null}
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
