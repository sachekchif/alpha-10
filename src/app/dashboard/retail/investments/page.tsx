'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Select, Modal, Input, Tag, Button, Dropdown, MenuProps, message 
} from 'antd';
import { 
  TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Search, Filter, 
  MoreVertical, Clock, CheckCircle2, XCircle, Download, Calendar, ChevronRight,
  Plus, ArrowUpRight, ArrowDownRight, RefreshCw, DollarSign, Shield, FileText,
  User, Award, Eye, FileSpreadsheet, RotateCcw, AlertTriangle, Layers, Building2,
  Lock, Unlock, ChevronDown, Check, UserCheck, ShieldAlert, Loader2, Trash2, Pencil
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
export type InvestmentStatus = 'Pending Approval' | 'Active' | 'Matured' | 'Redeemed' | 'Cancelled';
export type InvestmentState = 'Healthy' | 'Under Review' | 'On Hold' | 'Compliance Review' | 'Awaiting Funding' | 'Awaiting Redemption' | 'Disputed';
export type ProductType = 'Fixed Deposit' | 'Treasury Bills' | 'Mutual Fund' | 'Bond' | 'Dollar Investment' | 'Other Products';
export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR';

export interface InvestmentRecord {
  id: string;
  customerName: string;
  customerId: string;
  accountNumber: string;
  phone: string;
  product: string;
  currency: Currency;
  principal: number;
  interestRate: number;
  currentValue: number;
  status: InvestmentStatus;
  state: InvestmentState;
  startDate: string;
  maturityDate: string;
  relationshipManager: string;
  tenureMonths: number;
  apiItem?: InvestmentEducation;
}

// --- BADGE COMPONENTS ---
export function InvestmentStatusBadge({ status }: { status: InvestmentStatus }) {
  const styles: Record<InvestmentStatus, { bg: string; text: string; border: string }> = {
    'Active': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200/60 dark:border-emerald-800/50' },
    'Pending Approval': { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200/60 dark:border-amber-800/50' },
    'Matured': { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200/60 dark:border-blue-800/50' },
    'Redeemed': { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200/60 dark:border-purple-800/50' },
    'Cancelled': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700' },
  };

  const style = styles[status] || styles['Active'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function InvestmentStateBadge({ state }: { state: InvestmentState }) {
  const styles: Record<InvestmentState, { bg: string }> = {
    'Healthy': { bg: 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    'Under Review': { bg: 'bg-amber-100/70 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
    'On Hold': { bg: 'bg-orange-100/70 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
    'Compliance Review': { bg: 'bg-purple-100/70 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
    'Awaiting Funding': { bg: 'bg-blue-100/70 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    'Awaiting Redemption': { bg: 'bg-indigo-100/70 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
    'Disputed': { bg: 'bg-red-100/70 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  };

  const style = styles[state] || styles['Healthy'];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${style.bg}`}>
      {state}
    </span>
  );
}

const PRODUCT_COLORS: Record<string, string> = {
  'Fixed Deposit': '#961A1C',
  'Treasury Bills': '#3B82F6',
  'Mutual Fund': '#10B981',
  'Bond': '#F59E0B',
  'Dollar Investment': '#8B5CF6',
  'Other Products': '#6B7280',
};

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
  const [selectedCurrency, setSelectedCurrency] = useState<string>('All');
  const [selectedRm, setSelectedRm] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('principal-desc');
  const [growthPeriod, setGrowthPeriod] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');

  // Modals State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InvestmentEducation | null>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentRecord | null>(null);

  // Form State for API dispatch
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('mutual_funds');
  const [newHeroText, setNewHeroText] = useState('');
  const [newRiskLevel, setNewRiskLevel] = useState('Low');
  const [newCapitalGuaranteed, setNewCapitalGuaranteed] = useState(false);
  const [newReturnsGuaranteed, setNewReturnsGuaranteed] = useState(false);
  const [newWithdrawalRestrictions, setNewWithdrawalRestrictions] = useState(false);

  // RTK Query hooks
  const { data, isFetching, refetch } = useGetInvestmentEducationsQuery({ pageNumber: 1, pageSize: 50 });
  const [createItem, { isLoading: isCreating }] = useCreateInvestmentEducationMutation();
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

  // Combine real API items with dashboard display schema
  const investments: InvestmentRecord[] = useMemo(() => {
    if (apiItems.length > 0) {
      return apiItems.map((item, idx) => ({
        id: item.id || `INV-${7721 + idx}`,
        customerName: item.title || 'Investment Product',
        customerId: `MOD-${item.code || 'SYS'}`,
        accountNumber: `01234567${idx.toString().padStart(2, '0')}`,
        phone: item.heroText || 'Retail Investment Offering',
        product: item.code ? item.code.replace(/_/g, ' ').toUpperCase() : 'MUTUAL FUNDS',
        currency: 'NGN',
        principal: 5000000 + (idx * 2500000),
        interestRate: item.riskLevel === 'High' ? 18.5 : item.riskLevel === 'Medium' ? 14.5 : 12.0,
        currentValue: 5362500 + (idx * 2700000),
        status: item.isActive ? 'Active' : 'Pending Approval',
        state: item.capitalGuaranteed ? 'Healthy' : 'Under Review',
        startDate: '15 Aug 2025',
        maturityDate: '15 Aug 2026',
        relationshipManager: 'Sarah Jenkins',
        tenureMonths: 12,
        apiItem: item,
      }));
    }
    return [];
  }, [apiItems]);

  // Filtered & Sorted Investments
  const filteredInvestments = useMemo(() => {
    return investments.filter((inv) => {
      const matchesSearch = 
        inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.accountNumber.includes(searchQuery) ||
        inv.product.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'All' || inv.status === selectedStatus;
      const matchesProduct = selectedProduct === 'All' || inv.product.toLowerCase().includes(selectedProduct.toLowerCase());
      const matchesCurrency = selectedCurrency === 'All' || inv.currency === selectedCurrency;
      const matchesRm = selectedRm === 'All' || inv.relationshipManager === selectedRm;

      return matchesSearch && matchesStatus && matchesProduct && matchesCurrency && matchesRm;
    }).sort((a, b) => {
      if (sortBy === 'principal-desc') return b.principal - a.principal;
      if (sortBy === 'principal-asc') return a.principal - b.principal;
      if (sortBy === 'value-desc') return b.currentValue - a.currentValue;
      if (sortBy === 'rate-desc') return b.interestRate - a.interestRate;
      if (sortBy === 'name-asc') return a.customerName.localeCompare(b.customerName);
      return 0;
    });
  }, [investments, searchQuery, selectedStatus, selectedProduct, selectedCurrency, selectedRm, sortBy]);

  // Handle Create Investment via real API
  const handleCreateInvestment = async () => {
    if (!newTitle.trim()) {
      toast.error('Please enter investment title.', 'Validation Error');
      return;
    }
    try {
      const payload: CreateInvestmentEducationRequest = {
        code: newCode,
        title: newTitle.trim(),
        heroText: newHeroText.trim(),
        riskLevel: newRiskLevel,
        capitalGuaranteed: newCapitalGuaranteed,
        returnsGuaranteed: newReturnsGuaranteed,
        withdrawalRestrictions: newWithdrawalRestrictions,
        isActive: true,
        displayOrder: maxOrder + 1,
      };
      await createItem(payload).unwrap();
      toast.success(`Investment product "${newTitle}" created successfully.`, 'Created');
      setCreateModalOpen(false);
      setNewTitle('');
      setNewHeroText('');
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Failed to create investment product.', 'Error');
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem(deleteTarget.id).unwrap();
      toast.success(`Investment product deleted successfully.`, 'Deleted');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Delete failed.', 'Error');
    }
  };

  // Row Action Dropdown Menu
  const getActionMenu = (record: InvestmentRecord): MenuProps => ({
    items: [
      {
        key: 'view-inv',
        label: (
          <Link href={`/dashboard/retail/investments/${record.apiItem?.id || record.id}`} className="flex items-center gap-2 text-xs font-semibold text-[#961A1C]">
            <Eye size={14} /> View Investment
          </Link>
        ),
      },
      {
        key: 'redeem',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-emerald-600">
            <RotateCcw size={14} /> Redeem Investment
          </span>
        ),
        onClick: () => {
          setSelectedInvestment(record);
          setRedeemModalOpen(true);
        },
      },
      {
        key: 'statement',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Download size={14} /> Export Statement
          </span>
        ),
        onClick: () => toast.info(`Downloading statement for ${record.id}...`, 'Export'),
      },
      { type: 'divider' },
      {
        key: 'delete-inv',
        label: (
          <span className="flex items-center gap-2 text-xs font-semibold text-red-600">
            <Trash2 size={14} /> Delete Product
          </span>
        ),
        onClick: () => {
          if (record.apiItem) {
            setDeleteTarget(record.apiItem);
          } else {
            toast.info('Item cannot be deleted directly.', 'Info');
          }
        },
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
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus size={15} /> Create Investment
          </button>
        </div>
      </div>

      {/* 2. CONSOLIDATED HIGH-SIGNAL METRIC CARDS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: PORTFOLIO VALUE & CAPITAL */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-[#961A1C] rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Portfolio Value (AUM)</span>
            <Tag color="volcano" className="!bg-[#961A1C]/10 !text-[#961A1C] !border-none font-semibold text-[10px] m-0">AUM</Tag>
          </div>
          <div className="my-2.5 pl-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">₦13.57B</h2>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pl-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <span>Capital: <strong className="text-gray-800 dark:text-gray-200">₦12.45B</strong></span>
            <span className="text-[11px]">45,210 Accounts</span>
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
              placeholder="Search by Investment ID, Title, Product Type..."
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
                { value: 'principal-desc', label: 'Highest Principal' },
                { value: 'principal-asc', label: 'Lowest Principal' },
                { value: 'value-desc', label: 'Highest Current Value' },
                { value: 'rate-desc', label: 'Highest Interest Rate' },
                { value: 'name-asc', label: 'Customer Name (A-Z)' },
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
            value={selectedStatus}
            onChange={setSelectedStatus}
            size="small"
            className="w-36"
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Pending Approval', label: 'Pending Approval' },
              { value: 'Matured', label: 'Matured' },
              { value: 'Redeemed', label: 'Redeemed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
          />

          <Select
            value={selectedProduct}
            onChange={setSelectedProduct}
            size="small"
            className="w-36"
            options={[
              { value: 'All', label: 'All Products' },
              { value: 'Fixed Deposit', label: 'Fixed Deposit' },
              { value: 'Treasury Bills', label: 'Treasury Bills' },
              { value: 'Mutual Fund', label: 'Mutual Fund' },
              { value: 'Bond', label: 'Bond' },
              { value: 'Dollar Investment', label: 'Dollar Investment' },
            ]}
          />

          <Select
            value={selectedCurrency}
            onChange={setSelectedCurrency}
            size="small"
            className="w-28"
            options={[
              { value: 'All', label: 'All Currencies' },
              { value: 'NGN', label: 'NGN (₦)' },
              { value: 'USD', label: 'USD ($)' },
              { value: 'GBP', label: 'GBP (£)' },
              { value: 'EUR', label: 'EUR (€)' },
            ]}
          />

          {(selectedStatus !== 'All' || selectedProduct !== 'All' || selectedCurrency !== 'All' || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedStatus('All');
                setSelectedProduct('All');
                setSelectedCurrency('All');
                setSelectedRm('All');
                setSearchQuery('');
              }}
              className="text-xs text-[#961A1C] hover:underline font-semibold ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* DATA TABLE CONTAINER (HIDDEN SCROLLBAR) */}
        <div className="overflow-x-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
              <Loader2 size={24} className="animate-spin text-[#961A1C]" />
              <span className="text-xs font-medium">Loading real API investments...</span>
            </div>
          ) : filteredInvestments.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                <Search size={22} />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No investments match your filters</h3>
              <Button
                onClick={() => {
                  setSelectedStatus('All');
                  setSelectedProduct('All');
                  setSelectedCurrency('All');
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
                  <th className="px-4 py-3">Investment ID</th>
                  <th className="px-4 py-3">Customer / Title</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Principal</th>
                  <th className="px-4 py-3">Interest Rate</th>
                  <th className="px-4 py-3">Current Value</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Operational State</th>
                  <th className="px-4 py-3">Maturity Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filteredInvestments.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-[#961A1C] whitespace-nowrap">
                      {record.id}
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <Link href={`/dashboard/retail/investments/${record.apiItem?.id || record.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-[#961A1C] transition-colors">
                          {record.customerName}
                        </Link>
                        <p className="text-[11px] text-gray-400">{record.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{record.product}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {record.currency === 'USD' ? '$' : '₦'}{record.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/50">
                        {record.interestRate}% p.a.
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {record.currency === 'USD' ? '$' : '₦'}{record.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <InvestmentStatusBadge status={record.status} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <InvestmentStateBadge state={record.state} />
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {record.maturityDate}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <Dropdown menu={getActionMenu(record)} trigger={['click']} placement="bottomRight">
                        <Button type="text" size="small" className="text-gray-400 hover:text-gray-600">
                          <MoreVertical size={16} />
                        </Button>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- CREATE INVESTMENT MODAL WITH REAL API --- */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <Plus size={18} className="text-[#961A1C]" />
            Create Customer Investment
          </div>
        }
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={handleCreateInvestment}
        confirmLoading={isCreating}
        okText="Create Investment"
        okButtonProps={{ style: { backgroundColor: '#961A1C', borderColor: '#961A1C' } }}
        width={500}
        centered
      >
        <div className="py-2 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Investment Product Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Fixed Deposit High Yield Portfolio"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Product Offering Type
              </label>
              <Select
                value={newCode}
                onChange={setNewCode}
                className="w-full text-xs"
                options={[
                  { value: 'mutual_funds', label: 'Mutual Funds' },
                  { value: 'investment_banking', label: 'Investment Banking' },
                  { value: 'treasury_bills', label: 'Treasury Bills' },
                  { value: 'fixed_deposit', label: 'Fixed Deposit' },
                  { value: 'bonds', label: 'Bonds' },
                  { value: 'eurobonds', label: 'Eurobonds' },
                ]}
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Risk Level
              </label>
              <Select
                value={newRiskLevel}
                onChange={setNewRiskLevel}
                className="w-full text-xs"
                options={[
                  { value: 'Low', label: 'Low Risk' },
                  { value: 'Medium', label: 'Medium Risk' },
                  { value: 'High', label: 'High Risk' },
                  { value: 'Very High', label: 'Very High Risk' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Headline Summary
            </label>
            <Input.TextArea
              rows={2}
              placeholder="Brief overview of investment returns..."
              value={newHeroText}
              onChange={(e) => setNewHeroText(e.target.value)}
            />
          </div>
        </div>
      </Modal>

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
            <div>Total Records: <strong>{filteredInvestments.length} Investments</strong></div>
            <div>Format: <strong>Excel (.xlsx) / CSV</strong></div>
          </div>
        </div>
      </Modal>

      {/* --- REDEEM MODAL --- */}
      <Modal
        title={`Redeem Investment: ${selectedInvestment?.id}`}
        open={redeemModalOpen}
        onCancel={() => setRedeemModalOpen(false)}
        onOk={() => {
          message.success(`Investment ${selectedInvestment?.id} redeemed successfully to customer bank account.`);
          setRedeemModalOpen(false);
        }}
        okText="Confirm Payout"
        okButtonProps={{ style: { backgroundColor: '#10B981', borderColor: '#10B981' } }}
        width={440}
        centered
      >
        <div className="py-2 space-y-3 text-xs">
          <p className="text-gray-600 dark:text-gray-300">
            You are initiating full redemption payout for <strong>{selectedInvestment?.customerName}</strong>.
          </p>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200/60 space-y-1">
            <div>Principal: <strong>₦{selectedInvestment?.principal.toLocaleString()}</strong></div>
            <div>Current Value: <strong>₦{selectedInvestment?.currentValue.toLocaleString()}</strong></div>
            <div>Payout Account: <strong>{selectedInvestment?.accountNumber} (Alpha 10)</strong></div>
          </div>
        </div>
      </Modal>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Modal
        title="Delete Investment Product"
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onOk={handleDelete}
        confirmLoading={isDeleting}
        okText="Delete Product"
        okButtonProps={{ danger: true }}
        width={400}
        centered
      >
        <div className="py-2 text-xs text-gray-600 dark:text-gray-300">
          Are you sure you want to delete investment product <strong className="text-gray-900 dark:text-white">&ldquo;{deleteTarget?.title}&rdquo;</strong>? This action will remove it from the backend API.
        </div>
      </Modal>

    </div>
  );
}
