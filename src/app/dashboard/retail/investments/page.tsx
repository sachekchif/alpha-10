'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Select, Modal, Drawer, Input, Tag, Button, Dropdown, MenuProps, message, Switch 
} from 'antd';
import { 
  TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Search, Filter, 
  MoreVertical, Clock, CheckCircle2, XCircle, Download, Calendar, ChevronRight,
  Plus, ArrowUpRight, ArrowDownRight, RefreshCw, DollarSign, Shield, FileText,
  User, Award, Eye, FileSpreadsheet, RotateCcw, AlertTriangle, Layers, Building2,
  Lock, Unlock, ChevronDown, Check, UserCheck, ShieldAlert, Loader2, Trash2, Pencil, Wifi, X, Play, Upload
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, Cell, Tooltip as RechartsTooltip 
} from 'recharts';
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

// --- TYPES ---
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High';

const RISK_META: Record<RiskLevel, { color: string; bg: string }> = {
  Low: { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' },
  Medium: { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200' },
  High: { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200' },
  'Very High': { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40 border-red-200' },
};

const PRODUCT_COLORS: Record<string, string> = {
  'Fixed Deposit': '#961A1C',
  'Treasury Bills': '#3B82F6',
  'Mutual Fund': '#10B981',
  'Bond': '#F59E0B',
  'Dollar Investment': '#8B5CF6',
  'Other Products': '#6B7280',
};

const INVESTMENT_TYPES = [
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

// GROWTH TREND DATA MAP
const growthTrendDataMap = {
  Daily: [
    { label: 'Mon', amount: 12.1 },
    { label: 'Tue', amount: 12.2 },
    { label: 'Wed', amount: 12.35 },
    { label: 'Thu', amount: 12.4 },
    { label: 'Fri', amount: 12.45 },
    { label: 'Sat', amount: 12.48 },
    { label: 'Sun', amount: 12.5 },
  ],
  Weekly: [
    { label: 'Wk 1', amount: 11.2 },
    { label: 'Wk 2', amount: 11.8 },
    { label: 'Wk 3', amount: 12.1 },
    { label: 'Wk 4', amount: 12.5 },
  ],
  Monthly: [
    { label: 'Jan', amount: 8.5 },
    { label: 'Feb', amount: 9.2 },
    { label: 'Mar', amount: 9.8 },
    { label: 'Apr', amount: 10.4 },
    { label: 'May', amount: 11.1 },
    { label: 'Jun', amount: 11.9 },
    { label: 'Jul', amount: 12.5 },
  ],
  Yearly: [
    { label: '2022', amount: 4.2 },
    { label: '2023', amount: 6.8 },
    { label: '2024', amount: 9.5 },
    { label: '2025', amount: 11.8 },
    { label: '2026', amount: 12.5 },
  ],
};

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

export default function InvestmentManagementPage() {
  return (
    <RoleGuard allowedRoles={['SuperAdmin', 'Control']}>
      <InvestmentManagementContent />
    </RoleGuard>
  );
}

function InvestmentManagementContent() {
  const toast = useToast();

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('order-asc');
  const [growthPeriod, setGrowthPeriod] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');

  // Modals & Drawers State
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<InvestmentEducation | null>(null);
  const [form, setForm] = useState<CreateInvestmentEducationRequest & { category?: string; tags?: string }>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [steps, setSteps] = useState<string[]>(['Choose an investment product that matches your financial goals.']);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InvestmentEducation | null>(null);

  // RTK Query hooks
  const { data, isFetching, refetch } = useGetInvestmentEducationsQuery({ pageNumber: 1, pageSize: 50 });
  const [createItem, { isLoading: isCreating }] = useCreateInvestmentEducationMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateInvestmentEducationMutation();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteInvestmentEducationMutation();

  const apiItems: InvestmentEducation[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data?.data as any)?.items)
    ? (data?.data as any).items
    : [];

  const maxOrder = useMemo(() => {
    if (apiItems.length === 0) return 0;
    return Math.max(...apiItems.map((i) => i.displayOrder ?? 0));
  }, [apiItems]);

  const activeCount = apiItems.filter((i) => i.isActive).length;

  const formatModuleCode = (code?: string) => {
    if (!code) return '—';
    const found = INVESTMENT_TYPES.find((t) => t.value === code);
    if (found) return found.label;
    return code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Filtered & Sorted Investments
  const filteredItems = useMemo(() => {
    return apiItems.filter((item) => {
      const matchesSearch = 
        !searchQuery ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.heroText?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === 'All'
          ? true
          : selectedStatus === 'Active'
          ? item.isActive === true
          : item.isActive === false;

      const matchesProduct =
        selectedProduct === 'All' || item.code === selectedProduct;

      const matchesRisk =
        selectedRisk === 'All' || item.riskLevel === selectedRisk;

      return matchesSearch && matchesStatus && matchesProduct && matchesRisk;
    }).sort((a, b) => {
      if (sortBy === 'order-asc') return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
      if (sortBy === 'order-desc') return (b.displayOrder ?? 0) - (a.displayOrder ?? 0);
      if (sortBy === 'title-asc') return (a.title ?? '').localeCompare(b.title ?? '');
      return 0;
    });
  }, [apiItems, searchQuery, selectedStatus, selectedProduct, selectedRisk, sortBy]);

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.code.trim()) errors.code = 'Investment type is required';
    if (!form.title.trim()) errors.title = 'Title is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function openCreate() {
    setForm({
      ...emptyForm(),
      displayOrder: maxOrder + 1,
    });
    setSteps(['Choose an investment product that matches your financial goals.']);
    setFormErrors({});
    setSelectedItem(null);
    setDrawerMode('create');
  }

  function openEdit(item: InvestmentEducation) {
    const rawSteps = item.howItWorksText
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
    setSteps(rawSteps.length > 0 ? rawSteps : ['Choose an investment product that matches your financial goals.']);
    setFormErrors({});
    setSelectedItem(item);
    setDrawerMode('edit');
  }

  // Handle Create/Edit Investment via real API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const formattedSteps = steps
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s, idx) => `${idx + 1}. ${s}`)
        .join('\n');

      const { category, tags, ...apiPayload } = form;
      const formattedPayload: CreateInvestmentEducationRequest = {
        ...apiPayload,
        code: form.code.trim().toLowerCase().replace(/\s+/g, '_'),
        title: form.title.trim(),
        heroText: form.heroText?.trim() || '',
        detailsText: form.detailsText?.trim() || '',
        howItWorksText: formattedSteps || form.howItWorksText?.trim() || '',
        displayOrder: drawerMode === 'create' ? maxOrder + 1 : form.displayOrder,
      };

      if (drawerMode === 'create') {
        await createItem(formattedPayload).unwrap();
        toast.success(`Investment "${form.title}" created successfully.`, 'Created');
      } else if (selectedItem) {
        await updateItem({ id: selectedItem.id, body: formattedPayload }).unwrap();
        toast.success(`Investment updated successfully.`, 'Updated');
      }
      setDrawerMode(null);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Operation failed.', 'Error');
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem(deleteTarget.id).unwrap();
      toast.success(`Investment deleted successfully.`, 'Deleted');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Delete failed.', 'Error');
    }
  };

  // Row Action Dropdown Menu
  const getActionMenu = (item: InvestmentEducation): MenuProps => ({
    items: [
      {
        key: 'view-inv',
        label: (
          <Link href={`/dashboard/retail/investments/${item.id}`} className="flex items-center gap-2 text-xs font-semibold text-[#961A1C]">
            <Eye size={14} /> View Details
          </Link>
        ),
      },
      {
        key: 'edit-inv',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Pencil size={14} /> Edit Investment
          </span>
        ),
        onClick: () => openEdit(item),
      },
      { type: 'divider' },
      {
        key: 'delete-inv',
        label: (
          <span className="flex items-center gap-2 text-xs font-semibold text-red-600">
            <Trash2 size={14} /> Delete Investment
          </span>
        ),
        onClick: () => setDeleteTarget(item),
      },
    ],
  });

  return (
    <div className="space-y-6 pb-16 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Investment Management
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor, manage, and track all retail investment offerings across the platform.
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => refetch()}
            className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download size={14} /> Export
          </button>
          <button
            id="create-investment-btn"
            onClick={openCreate}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus size={15} /> Add Investment
          </button>
        </div>
      </div>

      {/* 2. CONSOLIDATED HIGH-SIGNAL METRIC CARDS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: PORTFOLIO VALUE & CAPITAL */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-[#961A1C] rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Listed Products</span>
            <Tag color="volcano" className="!bg-[#961A1C]/10 !text-[#961A1C] !border-none font-semibold text-[10px] m-0">AUM</Tag>
          </div>
          <div className="my-2.5 pl-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{isFetching ? '—' : apiItems.length}</h2>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pl-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <span>Live Products: <strong className="text-gray-800 dark:text-gray-200">{activeCount} Active</strong></span>
            <span className="text-[11px]">Retail Catalog</span>
          </div>
        </div>

        {/* CARD 2: ACTIVE PORTFOLIO */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-emerald-500 rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Investments</span>
            <Tag color="emerald" className="font-semibold text-[10px] m-0">Earning Yield</Tag>
          </div>
          <div className="my-2.5 pl-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">32,450</h2>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pl-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <span>Active Capital: <strong className="text-emerald-600">₦10.8B</strong></span>
            <span className="text-[11px] text-amber-600 font-semibold">890 Pending</span>
          </div>
        </div>

        {/* CARD 3: ACCRUED YIELD & RETURNS */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-blue-500 rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Interest Accrued</span>
            <Tag color="blue" className="font-semibold text-[10px] m-0">+14.5% Avg ROI</Tag>
          </div>
          <div className="my-2.5 pl-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">₦1.12B</h2>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pl-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <span>Paid Out: <strong className="text-purple-600">₦850.2M</strong></span>
            <span>Unrealised: <strong className="text-blue-600">₦270.2M</strong></span>
          </div>
        </div>

        {/* CARD 4: MATURITY & LIQUIDITY OUTLOOK */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-amber-500 rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Maturing Today</span>
            <Tag color="red" className="font-bold text-[10px] m-0">Liquidity</Tag>
          </div>
          <div className="my-2.5 pl-2 flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">12</h2>
            <span className="text-sm font-bold text-red-600 dark:text-red-400">(₦45.2M)</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pl-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <span>This Wk: <strong className="text-gray-800 dark:text-gray-200">86 (₦320M)</strong></span>
            <span className="text-[11px] text-gray-400">30D: 452 (₦1.8B)</span>
          </div>
        </div>

      </div>

      {/* 4. ANALYTICS SECTION (CHARTS & MATURITY CALENDAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LINE CHART: INVESTMENT GROWTH TREND */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Portfolio Growth</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Total AUM growth trajectory (Billions)</p>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-gray-700 p-0.5 rounded-md">
              {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setGrowthPeriod(period)}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded transition cursor-pointer ${
                    growthPeriod === period
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthTrendDataMap[growthPeriod]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} tickFormatter={(v) => `₦${v}B`} />
                <RechartsTooltip formatter={(val: any) => [`₦${val} Billion`, 'AUM Value']} />
                <Line type="monotone" dataKey="amount" stroke="#961A1C" strokeWidth={2.5} dot={{ r: 3, fill: '#961A1C' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
            <span>Growth Rate: <strong className="text-emerald-600">+18.4% YOY</strong></span>
            <span className="text-[11px]">Updated live</span>
          </div>
        </div>

        {/* BAR CHART: INVESTMENT PRODUCTS BREAKDOWN */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Product Distribution</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Fixed Deposit, T-Bills, Mutual Funds, Bonds</p>
          </div>

          <div className="h-44 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { product: 'FD', count: 18450, fill: PRODUCT_COLORS['Fixed Deposit'] },
                  { product: 'TB', count: 12200, fill: PRODUCT_COLORS['Treasury Bills'] },
                  { product: 'MF', count: 8500, fill: PRODUCT_COLORS['Mutual Fund'] },
                  { product: 'Bond', count: 3200, fill: PRODUCT_COLORS['Bond'] },
                  { product: 'USD', count: 2860, fill: PRODUCT_COLORS['Dollar Investment'] },
                ]}
                margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
              >
                <XAxis dataKey="product" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} tickFormatter={(v) => `${v / 1000}k`} />
                <RechartsTooltip formatter={(val: any) => [val ? val.toLocaleString() : '0', 'Investments']} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {[PRODUCT_COLORS['Fixed Deposit'], PRODUCT_COLORS['Treasury Bills'], PRODUCT_COLORS['Mutual Fund'], PRODUCT_COLORS['Bond'], PRODUCT_COLORS['Dollar Investment']].map((color, idx) => (
                    <Cell key={`bar-${idx}`} fill={color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
            <span>Top Product: <strong className="text-gray-800 dark:text-gray-200">Fixed Deposit (40.8%)</strong></span>
          </div>
        </div>

        {/* MATURITY CALENDAR WIDGET */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Calendar size={15} className="text-[#961A1C]" /> Maturity Calendar
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Liquidity planning</p>
          </div>

          <div className="space-y-2.5">
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-100 dark:border-red-900/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">Today</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">12 Investments</span>
              </div>
              <span className="text-xs font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/60 px-2 py-0.5 rounded">₦45.2M</span>
            </div>

            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">This Week</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">86 Investments</span>
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">₦320M</span>
            </div>

            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Next 30 Days</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">452 Investments</span>
              </div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded">₦1.8B</span>
            </div>
          </div>
        </div>

      </div>

      {/* 5. MAIN DIRECTORY TABLE & CONTROLS */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs space-y-4 p-5">
        
        {/* Search & Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search by Title, Product Type, or Headline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-4 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Sort By:</span>
            <Select
              value={sortBy}
              onChange={setSortBy}
              size="small"
              className="w-44 text-xs"
              options={[
                { value: 'order-asc', label: 'Display Order (1-9)' },
                { value: 'order-desc', label: 'Display Order (9-1)' },
                { value: 'title-asc', label: 'Title (A-Z)' },
              ]}
            />
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex items-center gap-2.5 flex-wrap text-xs">
          <span className="text-gray-500 font-semibold flex items-center gap-1">
            <Filter size={13} /> Filters:
          </span>

          <Select
            value={selectedProduct}
            onChange={setSelectedProduct}
            size="small"
            className="w-36"
            options={[
              { value: 'All', label: 'All Products' },
              ...INVESTMENT_TYPES,
            ]}
          />

          <Select
            value={selectedRisk}
            onChange={setSelectedRisk}
            size="small"
            className="w-36"
            options={[
              { value: 'All', label: 'All Risk Levels' },
              { value: 'Low', label: 'Low Risk' },
              { value: 'Medium', label: 'Medium Risk' },
              { value: 'High', label: 'High Risk' },
              { value: 'Very High', label: 'Very High Risk' },
            ]}
          />

          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            size="small"
            className="w-32"
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active Only' },
              { value: 'Inactive', label: 'Inactive Only' },
            ]}
          />

          {(selectedStatus !== 'All' || selectedProduct !== 'All' || selectedRisk !== 'All' || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedStatus('All');
                setSelectedProduct('All');
                setSelectedRisk('All');
                setSearchQuery('');
              }}
              className="text-xs text-[#961A1C] hover:underline font-semibold ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* DATA TABLE CONTAINER (REAL BACKEND DATA) */}
        <div className="overflow-x-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
              <Loader2 size={24} className="animate-spin text-[#961A1C]" />
              <span className="text-xs font-medium">Loading investment offerings from API...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                <Search size={22} />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No investment offerings match your filters</h3>
              <Button
                onClick={() => {
                  setSelectedStatus('All');
                  setSelectedProduct('All');
                  setSelectedRisk('All');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-[#961A1C]"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">S/N</th>
                  <th className="px-4 py-3">Title / Description</th>
                  <th className="px-4 py-3">Product Type</th>
                  <th className="px-4 py-3">Risk Level</th>
                  <th className="px-4 py-3 text-center">Capital</th>
                  <th className="px-4 py-3 text-center">Returns</th>
                  <th className="px-4 py-3 text-center">Withdrawal</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filteredItems.map((item, idx) => {
                  const risk = (item.riskLevel || 'Low') as RiskLevel;
                  const meta = RISK_META[risk] ?? RISK_META['Low'];
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                      {/* S/N */}
                      <td className="px-4 py-3.5 font-mono font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        #{item.displayOrder || idx + 1}
                      </td>

                      {/* Title & Description Stack */}
                      <td className="px-4 py-3.5 min-w-[220px]">
                        <div>
                          <Link
                            href={`/dashboard/retail/investments/${item.id}`}
                            className="font-bold text-sm text-gray-900 dark:text-white hover:text-[#961A1C] transition-colors block"
                          >
                            {item.title}
                          </Link>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-xs mt-0.5">
                            {item.heroText || item.detailsText || 'No summary description provided'}
                          </p>
                        </div>
                      </td>

                      {/* Product Type */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-gray-800 dark:text-gray-200">
                        {formatModuleCode(item.code)}
                      </td>

                      {/* Risk Level */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.bg} ${meta.color}`}>
                          <Wifi size={11} />
                          {item.riskLevel || 'Low'}
                        </span>
                      </td>

                      {/* Capital */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {item.capitalGuaranteed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <Check size={12} className="stroke-[3]" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 dark:text-red-400">
                            <X size={12} className="stroke-[2.5]" /> No
                          </span>
                        )}
                      </td>

                      {/* Returns */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {item.returnsGuaranteed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <Check size={12} className="stroke-[3]" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 dark:text-red-400">
                            <X size={12} className="stroke-[2.5]" /> No
                          </span>
                        )}
                      </td>

                      {/* Withdrawal */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {item.withdrawalRestrictions ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            <X size={12} className="stroke-[2.5]" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <Check size={12} className="stroke-[3]" /> No
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200'
                        }`}>
                          {item.isActive ? <><Check size={10} /> Active</> : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <Dropdown menu={getActionMenu(item)} trigger={['click']} placement="bottomRight">
                          <Button type="text" size="small" className="text-gray-400 hover:text-gray-600">
                            <MoreVertical size={16} />
                          </Button>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Slide-Out Uploading Drawer (Ant Design Drawer) ───────────────── */}
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
              {drawerMode === 'create' ? 'Add Investment' : 'Edit Investment'}
            </h3>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">

          <div className="flex-1 overflow-y-auto space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            
            {/* Tag Level Badge & Select */}
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
                placeholder="Investment Title (e.g. Fixed Deposit High Yield Portfolio)"
                className={`w-full text-xl sm:text-2xl font-bold bg-transparent text-gray-900 dark:text-white border-b-2 border-dashed focus:border-solid border-gray-300 dark:border-gray-700 py-1.5 focus:border-[#961A1C] outline-none transition placeholder:text-gray-300 dark:placeholder:text-gray-600 ${
                  formErrors.title ? 'border-red-500' : ''
                }`}
              />
              {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
              <p className="text-[11px] text-gray-400 mt-1">Retail investor mobile app header title</p>
            </div>

            {/* Investment Type Dropdown & Category Type Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Investment Type *
                </label>
                <Select
                  value={form.code || 'mutual_funds'}
                  onChange={(val) => setForm({ ...form, code: val })}
                  options={INVESTMENT_TYPES}
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

            {/* Hero Headline & Full Details Description */}
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
                  placeholder="Investment product summary for retail investors..."
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
                  placeholder="Full investment terms, security backing, and strategy overview..."
                />
              </div>
            </div>

            {/* How It Works Section - Connected Steps */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  How It Works — Step-by-Step Investment Guide
                </label>
                <button
                  type="button"
                  onClick={() => setSteps([...steps, ''])}
                  className="flex items-center gap-1 text-xs text-[#961A1C] hover:underline font-semibold cursor-pointer"
                >
                  <Plus size={13} /> Add Step
                </button>
              </div>

              <div className="relative pl-6 space-y-4">
                {steps.length > 1 && (
                  <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-200 dark:bg-gray-700" />
                )}

                {steps.map((stepText, idx) => (
                  <div key={idx} className="relative flex items-center gap-3 group">
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
                          className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition cursor-pointer"
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
                  Risk Level Profile
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Low', 'Medium', 'High', 'Very High'] as RiskLevel[]).map((r) => {
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
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        active
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

            {/* Domain Switches for Capital, Returns & Withdrawal */}
            <div className="space-y-3">
              {/* Capital */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="pr-3">
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    Would the customer need capital for this investment?
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
                    Will the customer receive guaranteed ROI for this investment?
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
                    Are there withdrawal restrictions on this investment?
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
                    Active Status
                  </span>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                    Retail users can now access this investment offering
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
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
              <span>{drawerMode === 'create' ? 'Add Investment' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Drawer>

      {/* --- EXPORT MODAL --- */}
      <Modal
        title="Export Investment Records"
        open={exportModalOpen}
        onCancel={() => setExportModalOpen(false)}
        onOk={() => {
          message.success('Exporting investments report (.xlsx)...');
          setExportModalOpen(false);
        }}
        okText="Download Export"
        okButtonProps={{ style: { backgroundColor: '#961A1C', borderColor: '#961A1C' } }}
        width={420}
        centered
      >
        <div className="py-2 space-y-3 text-xs">
          <p className="text-gray-600 dark:text-gray-300">
            Export filtered customer investment portfolio records into spreadsheet format.
          </p>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1 font-mono text-[11px]">
            <div>Total Records: <strong>{filteredItems.length} Investments</strong></div>
            <div>Format: <strong>Excel (.xlsx) / CSV</strong></div>
          </div>
        </div>
      </Modal>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Modal
        title="Delete Investment"
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onOk={handleDelete}
        confirmLoading={isDeleting}
        okText="Delete Investment"
        okButtonProps={{ danger: true }}
        width={400}
        centered
      >
        <div className="py-2 text-xs text-gray-600 dark:text-gray-300">
          Are you sure you want to delete investment <strong className="text-gray-900 dark:text-white">&ldquo;{deleteTarget?.title}&rdquo;</strong>? This action will remove it from the backend API.
        </div>
      </Modal>

    </div>
  );
}
