'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Pagination, Modal, Select, Drawer, Switch } from 'antd';
import {
  Headphones,
  MessageSquare,
  CheckCircle,
  Clock,
  Search,
  Plus,
  AlertCircle,
  AlertTriangle,
  X,
  Send,
  FileText,
  Trash2,
  Edit3,
  CreditCard,
  Mail,
  User,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Eye,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Layers,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetSupportCasesQuery,
  useGetSupportCaseByIdQuery,
  useAssignSupportCaseMutation,
  useSendSupportMacroMutation,
  useAddSupportNoteMutation,
  useUpdateSupportCaseStatusMutation,
  useGetSupportCategoriesQuery,
  useCreateSupportCategoryMutation,
  useUpdateSupportCategoryMutation,
  useDeleteSupportCategoryMutation,
  useGetSupportMacrosQuery,
  SupportCase,
  SupportCaseDetails,
  SupportCategory,
  SupportMacro,
} from '@/auth/services/adminApi';
import { useToast } from '@/auth/components/ToastContainer';

interface StatCardProps {
  cardTitle: string;
  value: string;
  icon: React.ReactNode;
  subText: string;
}

function StatCard({ cardTitle, value, icon, subText }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md p-3.5 shadow-xs border border-gray-200 dark:border-gray-800 relative overflow-hidden flex flex-col justify-between hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] bg-[#961A1C] rounded-r-sm" />
      <div className="flex items-center justify-between pl-2">
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 tracking-tight">
          {cardTitle}
        </span>
        <span className="p-1 rounded bg-gray-50 dark:bg-gray-700 text-[#961A1C]">
          {icon}
        </span>
      </div>
      <div className="my-2 pl-2">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight font-mono">
          {value}
        </h2>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 pl-2 pt-1 border-t border-gray-100 dark:border-gray-800">
        <span>{subText}</span>
      </div>
    </div>
  );
}

function priorityBadgeColor(priority: string) {
  const p = (priority || '').toLowerCase();
  if (p === 'critical') return 'text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800';
  if (p === 'high') return 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
  if (p === 'medium') return 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
  return 'text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
}

function statusBadgeColor(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'resolved' || s === 'done') {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
  }
  if (s === 'open') {
    return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
  }
  if (s.includes('waitingoncustomer')) {
    return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
  }
  if (s.includes('waitingonus') || s === 'pending') {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
  }
  if (s === 'escalated') {
    return 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800';
  }
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
}

export default function CustomerSupportPage() {
  return (
    <RoleGuard allowedRoles={['All']}>
      <Suspense fallback={<div className="p-6 text-xs text-gray-400 font-mono">Loading support desk...</div>}>
        <SupportContent />
      </Suspense>
    </RoleGuard>
  );
}

function SupportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  const tabParam = searchParams?.get('tab');
  const [activeTab, setActiveTab] = useState<'tickets' | 'categories' | 'macros'>('tickets');

  useEffect(() => {
    if (tabParam === 'categories') setActiveTab('categories');
    else if (tabParam === 'macros') setActiveTab('macros');
    else setActiveTab('tickets');
  }, [tabParam]);

  const handleTabChange = (tab: 'tickets' | 'categories' | 'macros') => {
    setActiveTab(tab);
    router.push(`${pathname}?tab=${tab}`);
  };

  // Filters & Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SupportCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({ code: '', title: '', description: '', isActive: true });

  // RTK Query Hooks
  const { data: casesData, isFetching: isFetchingCases, isError: isCasesError, refetch: refetchCases } = useGetSupportCasesQuery({
    pageNumber,
    pageSize,
    status: statusFilter !== 'All' ? statusFilter : undefined,
    search: search.trim() || undefined,
  });

  const { data: categoriesData, isFetching: isFetchingCategories, refetch: refetchCategories } = useGetSupportCategoriesQuery();
  const { data: macrosData, isFetching: isFetchingMacros, refetch: refetchMacros } = useGetSupportMacrosQuery();

  const [createCategory, { isLoading: isCreatingCategory }] = useCreateSupportCategoryMutation();
  const [updateCategory, { isLoading: isUpdatingCategory }] = useUpdateSupportCategoryMutation();
  const [deleteCategory] = useDeleteSupportCategoryMutation();

  // Normalized cases list
  const rawCases = casesData?.data;
  const casesList: SupportCase[] = Array.isArray(rawCases)
    ? rawCases
    : Array.isArray((rawCases as any)?.items)
    ? (rawCases as any).items
    : Array.isArray((rawCases as any)?.data)
    ? (rawCases as any).data
    : [];

  const totalCasesCount = (rawCases as any)?.totalCount ?? casesList.length;

  const categoriesList: SupportCategory[] = Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : Array.isArray((categoriesData?.data as any)?.items)
    ? (categoriesData?.data as any).items
    : [];

  const macrosList: SupportMacro[] = Array.isArray(macrosData?.data)
    ? macrosData.data
    : Array.isArray((macrosData?.data as any)?.items)
    ? (macrosData?.data as any).items
    : [];

  // Filtered cases by priority locally if set
  const filteredCases = useMemo(() => {
    if (priorityFilter === 'All') return casesList;
    return casesList.filter((c) => (c.priority || '').toLowerCase() === priorityFilter.toLowerCase());
  }, [casesList, priorityFilter]);

  // Analytics Stats
  const openCasesCount = useMemo(
    () => casesList.filter((c) => {
      const s = (c.status || '').toLowerCase();
      return s === 'open' || s.includes('waitingonus') || s === 'pending';
    }).length,
    [casesList]
  );

  const criticalCount = useMemo(
    () => casesList.filter((c) => (c.priority || '').toLowerCase() === 'critical' || (c.priority || '').toLowerCase() === 'high').length,
    [casesList]
  );

  const activeCategoriesCount = useMemo(
    () => categoriesList.filter((c) => c.isActive !== false).length,
    [categoriesList]
  );

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.code.trim() || !categoryForm.title.trim()) {
      toast.error('Code and Title are required.', 'Validation Error');
      return;
    }
    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, body: categoryForm }).unwrap();
        toast.success(`Category "${categoryForm.title}" updated.`, 'Category Updated');
      } else {
        await createCategory(categoryForm).unwrap();
        toast.success(`Category "${categoryForm.title}" created.`, 'Category Created');
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({ code: '', title: '', description: '', isActive: true });
      refetchCategories();
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || err?.data?.message || 'Failed to save category.', 'Error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this support category?')) {
      try {
        await deleteCategory(id).unwrap();
        toast.success('Support category deleted.', 'Category Deleted');
        refetchCategories();
      } catch (err: any) {
        toast.error(err?.data?.statusMessage || err?.data?.message || 'Failed to delete category.', 'Error');
      }
    }
  };

  return (
    <div className="space-y-4 pb-12 w-full font-sans">
      
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white leading-tight">
            Customer Support Desk
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Monitor customer inquiries, manage ticket priorities, agent assignments, and customer wallet diagnostics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              refetchCases();
              refetchCategories();
              refetchMacros();
            }}
            disabled={isFetchingCases}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer disabled:opacity-50"
            title="Refresh Support Desk"
          >
            <RefreshCw size={13} className={isFetchingCases ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {activeTab === 'categories' && (
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryForm({ code: '', title: '', description: '', isActive: true });
                setIsCategoryModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#961A1C] hover:bg-[#7e1517] rounded-md transition shadow-2xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Stat Cards (Unified Single Brand Color Accent) ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard
          cardTitle="Total Tickets"
          value={isFetchingCases ? '—' : String(totalCasesCount)}
          icon={<MessageSquare size={14} className="text-[#961A1C]" />}
          subText="Recorded customer inquiry cases"
        />
        <StatCard
          cardTitle="Open & In-Progress"
          value={isFetchingCases ? '—' : String(openCasesCount)}
          icon={<Clock size={14} className="text-[#961A1C]" />}
          subText="Awaiting support team response"
        />
        <StatCard
          cardTitle="Critical & High"
          value={isFetchingCases ? '—' : String(criticalCount)}
          icon={<AlertTriangle size={14} className="text-[#961A1C]" />}
          subText="High urgency customer tickets"
        />
        <StatCard
          cardTitle="Active Categories"
          value={isFetchingCategories ? '—' : String(activeCategoriesCount)}
          icon={<Layers size={14} className="text-[#961A1C]" />}
          subText="Configured case routing types"
        />
      </div>

      {/* ── Main Tabbed Content Card (New Table Design) ─────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden flex flex-col">
        
        {/* Navigation Tabs Header */}
        <div className="px-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleTabChange('tickets')}
              className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tickets'
                  ? 'border-[#961A1C] text-[#961A1C] dark:text-[#e05557]'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Headphones size={13} />
              <span>Tickets Ledger</span>
            </button>

            <button
              onClick={() => handleTabChange('categories')}
              className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'categories'
                  ? 'border-[#961A1C] text-[#961A1C] dark:text-[#e05557]'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Layers size={13} />
              <span>Categories ({categoriesList.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('macros')}
              className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'macros'
                  ? 'border-[#961A1C] text-[#961A1C] dark:text-[#e05557]'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Sparkles size={13} />
              <span>Canned Macros ({macrosList.length})</span>
            </button>
          </div>
        </div>

        {/* ── TAB 1: TICKETS LEDGER ─────────────────────────────────────────── */}
        {activeTab === 'tickets' && (
          <div>
            {/* Filters Toolbar */}
            <div className="px-3.5 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/50 flex flex-wrap items-center gap-2.5 text-xs">
              
              {/* Search Box */}
              <div className="relative min-w-[220px] flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                <input
                  type="text"
                  placeholder="Search subject, customer, email, ticket #..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPageNumber(1);
                  }}
                  className="w-full pl-8 pr-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <Select
                size="small"
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setPageNumber(1);
                }}
                className="w-36 text-xs"
                options={[
                  { value: 'All', label: 'All Statuses' },
                  { value: 'Open', label: 'Open' },
                  { value: 'WaitingOnUs', label: 'Waiting On Us' },
                  { value: 'WaitingOnCustomer', label: 'Waiting On Customer' },
                  { value: 'Resolved', label: 'Resolved' },
                  { value: 'Escalated', label: 'Escalated' },
                ]}
              />

              {/* Priority Filter */}
              <Select
                size="small"
                value={priorityFilter}
                onChange={(val) => {
                  setPriorityFilter(val);
                  setPageNumber(1);
                }}
                className="w-32 text-xs"
                options={[
                  { value: 'All', label: 'All Priorities' },
                  { value: 'Critical', label: 'Critical' },
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' },
                ]}
              />

              {/* Reset Filters */}
              {(search || statusFilter !== 'All' || priorityFilter !== 'All') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('All');
                    setPriorityFilter('All');
                    setPageNumber(1);
                  }}
                  className="text-[11px] text-gray-500 hover:text-[#961A1C] underline font-medium cursor-pointer"
                >
                  Reset filters
                </button>
              )}

              <div className="ml-auto text-[11px] text-gray-400 font-mono">
                {filteredCases.length} {filteredCases.length === 1 ? 'ticket' : 'tickets'}
              </div>
            </div>

            {/* Tickets Table */}
            <div className="min-h-[340px]">
              {isFetchingCases ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2.5 text-gray-400 font-mono text-xs">
                  <RefreshCw size={22} className="animate-spin text-[#961A1C]" />
                  <span>Loading support cases...</span>
                </div>
              ) : isCasesError ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 gap-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-center justify-center">
                    <AlertCircle size={20} className="text-[#961A1C]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Failed to load support tickets
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Unable to retrieve support cases from the server.
                    </p>
                  </div>
                  <button
                    onClick={() => refetchCases()}
                    className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#961A1C] hover:bg-[#7e1517] text-white rounded-md text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <span>Retry Fetch</span>
                  </button>
                </div>
              ) : filteredCases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400 text-xs">
                  <MessageSquare size={32} className="opacity-25" />
                  <span className="font-medium text-gray-600 dark:text-gray-300">No support tickets found</span>
                  <span className="text-[11px] text-gray-400">All customer inquiries are addressed or filter matched no tickets</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100/75 dark:bg-gray-800/80 uppercase tracking-wider font-mono">
                      <tr>
                        <th className="px-3 py-2 w-12 text-center border-b border-r border-gray-200 dark:border-gray-700">
                          #
                        </th>
                        <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 min-w-[240px]">
                          Customer Profile
                        </th>
                        <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 min-w-[260px]">
                          Ticket Subject
                        </th>
                        <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                          Priority
                        </th>
                        <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                          Status
                        </th>
                        <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                          Assigned Agent
                        </th>
                        <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                          Updated
                        </th>
                        <th className="px-3 py-2 text-center border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredCases.map((ticket, idx) => {
                        const customerName = ticket.customerName || 'Customer';
                        const customerEmail = ticket.customerEmail || 'No email provided';
                        const initials = customerName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || 'CU';

                        return (
                          <tr
                            key={ticket.id || idx}
                            className="hover:bg-blue-50/20 dark:hover:bg-gray-800/40 transition-colors group"
                          >
                            {/* S/N */}
                            <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                              #{(pageNumber - 1) * pageSize + idx + 1}
                            </td>

                            {/* Customer Profile Box */}
                            <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 min-w-[240px]">
                              <div className="flex items-center gap-2.5 p-2 rounded-lg border border-gray-200/90 dark:border-gray-700/80 bg-gray-50/70 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:border-[#961A1C]/50 hover:shadow-2xs transition-all max-w-xs">
                                <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-[#961A1C] to-[#500e10] flex items-center justify-center text-white font-mono font-bold text-xs shrink-0 shadow-2xs">
                                  {initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="font-semibold text-xs text-gray-900 dark:text-white truncate block">
                                    {customerName}
                                  </span>
                                  <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                    <Mail size={11} className="shrink-0 text-gray-400" />
                                    <span className="truncate">{customerEmail}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Ticket Ref & Subject */}
                            <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 min-w-[260px]">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="font-mono text-[10px] font-bold text-[#961A1C] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-1.5 py-0.2 rounded">
                                  {ticket.ticketNumber || ticket.id?.slice(0, 8)}
                                </span>
                                {ticket.categoryName && (
                                  <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.2 rounded font-medium">
                                    {ticket.categoryName}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => setSelectedCaseId(ticket.id)}
                                className="font-medium text-xs text-gray-900 dark:text-white hover:text-[#961A1C] dark:hover:text-[#e05557] transition-colors text-left truncate block max-w-sm cursor-pointer"
                                title={ticket.subject}
                              >
                                {ticket.subject}
                              </button>
                            </td>

                            {/* Priority */}
                            <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${priorityBadgeColor(
                                  ticket.priority
                                )}`}
                              >
                                {ticket.priority === 'Critical' && <AlertTriangle size={10} />}
                                <span>{ticket.priority}</span>
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${statusBadgeColor(
                                  ticket.status
                                )}`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                <span>{ticket.status}</span>
                              </span>
                            </td>

                            {/* Assigned Agent */}
                            <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-600 dark:text-gray-300 whitespace-nowrap">
                              {ticket.assignedTo ? (
                                <span className="truncate max-w-[140px] block" title={ticket.assignedTo}>
                                  {ticket.assignedTo}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">Unassigned</span>
                              )}
                            </td>

                            {/* Updated */}
                            <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Clock size={11} className="text-gray-400 shrink-0" />
                                <span>
                                  {ticket.updatedAt
                                    ? new Date(ticket.updatedAt).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                    : 'Recently'}
                                </span>
                              </div>
                            </td>

                            {/* Action */}
                            <td className="px-3 py-2 text-center align-middle border-b border-gray-200 dark:border-gray-800 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedCaseId(ticket.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#961A1C] dark:hover:text-[#e05557] transition cursor-pointer"
                              >
                                <Eye size={12} />
                                <span>Details</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            {!isFetchingCases && !isCasesError && filteredCases.length > 0 && (
              <div className="px-3.5 py-2.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                  Showing {(pageNumber - 1) * pageSize + 1}–
                  {Math.min(pageNumber * pageSize, totalCasesCount)} of {totalCasesCount} tickets
                </span>

                <Pagination
                  current={pageNumber}
                  pageSize={pageSize}
                  total={totalCasesCount}
                  onChange={(page, pSize) => {
                    setPageNumber(page);
                    setPageSize(pSize);
                  }}
                  showSizeChanger
                  pageSizeOptions={['10', '20', '50']}
                  size="small"
                />
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: CATEGORIES MANAGEMENT ──────────────────────────────────── */}
        {activeTab === 'categories' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Support Issue Categories
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manage categorized inquiry buckets for automatic queue routing
                </p>
              </div>
            </div>

            {categoriesList.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-xs">
                <Layers size={32} className="mx-auto mb-2 opacity-30" />
                <span>No support categories found. Click "Add Category" to create one.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoriesList.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 shadow-2xs flex flex-col justify-between hover:border-gray-300 dark:hover:border-gray-700 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase font-bold text-[#961A1C] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-2 py-0.5 rounded">
                          {cat.code}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            cat.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                          }`}
                        >
                          {cat.isActive !== false ? 'Active' : 'Hidden'}
                        </span>
                      </div>

                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mt-2">
                        {cat.title}
                      </h4>
                      {cat.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-gray-800/80 text-xs text-gray-400">
                      <span className="font-mono text-[11px]">{cat.caseCount ?? 0} linked cases</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setCategoryForm({
                              code: cat.code,
                              title: cat.title,
                              description: cat.description || '',
                              isActive: cat.isActive ?? true,
                            });
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-1 text-gray-500 hover:text-[#961A1C] rounded transition cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: CANNED MACROS ───────────────────────────────────────────── */}
        {activeTab === 'macros' && (
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Standard Support Macros
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pre-approved canned response templates for rapid one-click customer resolution
              </p>
            </div>

            {macrosList.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-xs">
                <Sparkles size={32} className="mx-auto mb-2 opacity-30" />
                <span>No macros configured on the server.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-4xl">
                {macrosList.map((macro) => (
                  <div
                    key={macro.id || macro.code}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-xs text-gray-900 dark:text-white">
                          {macro.title}
                        </h4>
                        <span className="font-mono text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded">
                          {macro.code}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-100 dark:border-gray-800 font-mono text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {macro.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Ticket Details Drawer (Consumes GET /admin/support/cases/{id}, assign, status, notes, macro) ── */}
      {selectedCaseId && (
        <CaseDetailsDrawer
          caseId={selectedCaseId}
          onClose={() => setSelectedCaseId(null)}
          macros={macrosList}
        />
      )}

      {/* ── Support Category Modal ──────────────────────────────────────────── */}
      <Modal
        open={isCategoryModalOpen}
        onCancel={() => setIsCategoryModalOpen(false)}
        footer={null}
        width={440}
        centered
        destroyOnClose
      >
        <div className="py-2 text-left font-sans">
          <div className="flex items-center gap-3 pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-lg bg-[#961A1C]/10 flex items-center justify-center shrink-0">
              <Layers size={20} className="text-[#961A1C]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {editingCategory ? 'Edit Support Category' : 'Create Support Category'}
              </h3>
              <p className="text-xs text-gray-500">
                Define category routing for customer tickets
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category Code *
              </label>
              <input
                type="text"
                required
                disabled={Boolean(editingCategory)}
                value={categoryForm.code}
                onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. WALLET_FUNDING"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={categoryForm.title}
                onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                placeholder="e.g. Wallet Funding & Deposits"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Briefly describe what this category handles..."
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg">
              <div>
                <span className="text-xs font-semibold text-gray-900 dark:text-white block">Active Status</span>
                <span className="text-[11px] text-gray-400">Make this category visible in the client app</span>
              </div>
              <Switch
                checked={categoryForm.isActive}
                onChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-lg transition text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isCreatingCategory || isUpdatingCategory}
                className="flex-1 py-2 px-4 bg-[#961A1C] hover:bg-[#7e1517] text-white font-semibold rounded-lg transition text-xs disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isCreatingCategory || isUpdatingCategory ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

    </div>
  );
}

// ─── Case Details Drawer Component ───────────────────────────────────────────
function CaseDetailsDrawer({
  caseId,
  onClose,
  macros,
}: {
  caseId: string;
  onClose: () => void;
  macros: SupportMacro[];
}) {
  const toast = useToast();
  const { data, isFetching, refetch } = useGetSupportCaseByIdQuery(caseId);
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateSupportCaseStatusMutation();
  const [assignCase, { isLoading: isAssigning }] = useAssignSupportCaseMutation();
  const [addNote, { isLoading: isAddingNote }] = useAddSupportNoteMutation();
  const [sendMacro, { isLoading: isSendingMacro }] = useSendSupportMacroMutation();

  const [noteText, setNoteText] = useState('');
  const [isCustomerVisible, setIsCustomerVisible] = useState(false);
  const [assigneeEmail, setAssigneeEmail] = useState('');
  const [selectedMacroCode, setSelectedMacroCode] = useState('');
  const [copiedAcc, setCopiedAcc] = useState(false);

  const caseDetails: SupportCaseDetails = (data?.data as SupportCaseDetails) || {
    id: caseId,
    ticketNumber: caseId,
    subject: 'Customer Support Inquiry',
    priority: 'Medium',
    status: 'Open',
  };

  const handleStatusChange = async (newStatus: any) => {
    try {
      await updateStatus({ id: caseId, body: { status: newStatus } }).unwrap();
      toast.success(`Case status set to ${newStatus}.`, 'Status Updated');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Failed to update status.', 'Error');
    }
  };

  const handleAssign = async () => {
    if (!assigneeEmail.trim()) {
      toast.error('Please enter an agent email address.', 'Missing Email');
      return;
    }
    try {
      await assignCase({ id: caseId, body: { assignedToUserEmail: assigneeEmail.trim() } }).unwrap();
      toast.success(`Case assigned to ${assigneeEmail}.`, 'Case Assigned');
      setAssigneeEmail('');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Failed to assign case.', 'Error');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await addNote({ id: caseId, body: { note: noteText, isCustomerVisible } }).unwrap();
      toast.success(isCustomerVisible ? 'Reply dispatched to customer.' : 'Internal staff note saved.', 'Note Added');
      setNoteText('');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Failed to save note.', 'Error');
    }
  };

  const handleSendMacro = async () => {
    if (!selectedMacroCode) {
      toast.error('Select a macro first.', 'Selection Required');
      return;
    }
    try {
      await sendMacro({ id: caseId, code: selectedMacroCode }).unwrap();
      toast.success(`Canned response "${selectedMacroCode}" sent to customer.`, 'Macro Dispatched');
      setSelectedMacroCode('');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Failed to send macro.', 'Error');
    }
  };

  const copyAccountNum = () => {
    if (caseDetails.customerWallet?.accountNumber) {
      navigator.clipboard.writeText(caseDetails.customerWallet.accountNumber);
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 1800);
    }
  };

  return (
    <Drawer
      open={Boolean(caseId)}
      onClose={onClose}
      size={640}
      destroyOnClose
      className="dark:bg-gray-900"
      title={
        <div className="flex items-center justify-between w-full pr-4 text-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            <Headphones size={18} className="text-[#961A1C]" />
            <h3 className="text-sm font-semibold">Support Case Diagnostics</h3>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${statusBadgeColor(caseDetails.status)}`}>
            {caseDetails.status}
          </span>
        </div>
      }
    >
      <div className="space-y-4 text-xs font-sans pb-8">
        
        {/* Case Header Card */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-[#961A1C]">
              {caseDetails.ticketNumber || caseDetails.id}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${priorityBadgeColor(caseDetails.priority)}`}>
              {caseDetails.priority} Priority
            </span>
          </div>

          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {caseDetails.subject}
          </h3>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <User size={13} className="text-gray-400" />
              <span>{caseDetails.customerName || 'Customer'}</span>
            </div>
            {caseDetails.customerEmail && (
              <div className="flex items-center gap-1 font-mono">
                <Mail size={13} className="text-gray-400" />
                <span>{caseDetails.customerEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions (Status, Assign, Macro) */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 space-y-3">
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-semibold">
            Triage & Quick Actions
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Status Change */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                Update Status
              </label>
              <Select
                value={caseDetails.status}
                onChange={handleStatusChange}
                disabled={isUpdatingStatus}
                className="w-full text-xs"
                options={[
                  { value: 'Open', label: 'Open' },
                  { value: 'WaitingOnUs', label: 'Waiting On Us' },
                  { value: 'WaitingOnCustomer', label: 'Waiting On Customer' },
                  { value: 'Resolved', label: 'Resolved' },
                  { value: 'Escalated', label: 'Escalated' },
                ]}
              />
            </div>

            {/* Assign Case */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                Assign To Agent
              </label>
              <div className="flex gap-1.5">
                <input
                  type="email"
                  placeholder="agent@alpha10.com"
                  value={assigneeEmail}
                  onChange={(e) => setAssigneeEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                />
                <button
                  onClick={handleAssign}
                  disabled={isAssigning}
                  className="px-3 py-1 bg-[#961A1C] hover:bg-[#7e1517] text-white rounded text-xs font-semibold transition cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isAssigning ? '...' : 'Assign'}
                </button>
              </div>
            </div>
          </div>

          {/* Send Canned Macro */}
          {macros.length > 0 && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700/80">
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                Send Canned Response Macro
              </label>
              <div className="flex gap-2">
                <Select
                  value={selectedMacroCode || undefined}
                  placeholder="Choose ready-made reply..."
                  onChange={(val) => setSelectedMacroCode(val)}
                  className="w-full text-xs flex-1"
                  options={macros.map((m) => ({
                    value: m.code,
                    label: `${m.title} (${m.code})`,
                  }))}
                />
                <button
                  onClick={handleSendMacro}
                  disabled={!selectedMacroCode || isSendingMacro}
                  className="px-3 py-1 bg-[#961A1C] hover:bg-[#7e1517] text-white rounded text-xs font-semibold transition cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1"
                >
                  <Send size={12} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Customer Wallet Diagnostics */}
        {caseDetails.customerWallet && (
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Wallet size={15} className="text-[#961A1C]" />
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-gray-700 dark:text-gray-300 font-semibold">
                  Customer Wallet Diagnostics
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                {caseDetails.customerWallet.tier || 'Standard Tier'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono block">Wallet Balance</span>
                <span className="text-base font-bold text-gray-900 dark:text-white font-mono mt-0.5 block">
                  {caseDetails.customerWallet.currency || 'NGN'} {(caseDetails.customerWallet.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono block">Account Number</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {caseDetails.customerWallet.accountNumber}
                  </span>
                  <button
                    onClick={copyAccountNum}
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-0.5 rounded cursor-pointer"
                    title="Copy Account Number"
                  >
                    {copiedAcc ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Money Moves */}
            {caseDetails.recentTransactions && caseDetails.recentTransactions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block">
                  Recent Money Moves ({caseDetails.recentTransactions.length})
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {caseDetails.recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2 rounded bg-gray-50/70 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        {tx.type === 'Credit' ? (
                          <ArrowDownLeft size={14} className="text-emerald-500 shrink-0" />
                        ) : (
                          <ArrowUpRight size={14} className="text-red-500 shrink-0" />
                        )}
                        <div>
                          <span className="font-medium text-gray-800 dark:text-gray-200 block truncate max-w-[200px]">
                            {tx.description}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">{tx.timestamp}</span>
                        </div>
                      </div>
                      <span className={`font-mono font-semibold ${tx.type === 'Credit' ? 'text-emerald-600' : 'text-gray-800 dark:text-gray-200'}`}>
                        {tx.type === 'Credit' ? '+' : '-'}₦{tx.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Case Notes & Customer Responses */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 space-y-3">
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-semibold">
            Case Notes &amp; Responses
          </h4>

          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="space-y-2">
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write an internal note or customer-visible reply..."
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCustomerVisible}
                  onChange={(e) => setIsCustomerVisible(e.target.checked)}
                  className="rounded text-[#961A1C] focus:ring-[#961A1C]"
                />
                <span>Visible to customer (asks for response)</span>
              </label>

              <button
                type="submit"
                disabled={!noteText.trim() || isAddingNote}
                className="px-3 py-1.5 bg-[#961A1C] hover:bg-[#7e1517] text-white rounded text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send size={12} />
                <span>{isCustomerVisible ? 'Send to Customer' : 'Save Internal Note'}</span>
              </button>
            </div>
          </form>

          {/* Notes History */}
          {caseDetails.notes && caseDetails.notes.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              {caseDetails.notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg border text-xs ${
                    note.isCustomerVisible
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {note.author}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          note.isCustomerVisible
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {note.isCustomerVisible ? 'Customer Visible' : 'Internal Note'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {note.createdAt}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {note.note}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Drawer>
  );
}
