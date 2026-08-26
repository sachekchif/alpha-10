'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Select, Modal, Input, Tag, Button, Dropdown, MenuProps, message, Tooltip 
} from 'antd';
import { 
  TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Search, Filter, 
  MoreVertical, Clock, CheckCircle2, XCircle, Download, Calendar, ChevronRight,
  Plus, ArrowUpRight, ArrowDownRight, RefreshCw, DollarSign, Shield, FileText,
  User, Award, Eye, FileSpreadsheet, RotateCcw, AlertTriangle, Layers, Building2,
  Lock, Unlock, ChevronDown, Check, UserCheck, ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar 
} from 'recharts';

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
  product: ProductType;
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

// --- MOCK DATA ---
const mockInvestments: InvestmentRecord[] = [
  {
    id: 'INV-7721',
    customerName: 'Oluwaseun Adeleke',
    customerId: 'CUST-8291',
    accountNumber: '0123456789',
    phone: '+234 801 234 5678',
    product: 'Fixed Deposit',
    currency: 'NGN',
    principal: 5000000.00,
    interestRate: 14.5,
    currentValue: 5362500.00,
    status: 'Active',
    state: 'Healthy',
    startDate: '15 Aug 2025',
    maturityDate: '15 Aug 2026',
    relationshipManager: 'Sarah Jenkins',
    tenureMonths: 12,
  },
  {
    id: 'INV-7722',
    customerName: 'Jane Smith',
    customerId: 'CUST-8292',
    accountNumber: '0123456790',
    phone: '+234 802 345 6789',
    product: 'Treasury Bills',
    currency: 'NGN',
    principal: 12500000.00,
    interestRate: 18.2,
    currentValue: 13637500.00,
    status: 'Active',
    state: 'Awaiting Redemption',
    startDate: '01 Sep 2025',
    maturityDate: '29 Jul 2026',
    relationshipManager: 'Babajide S.',
    tenureMonths: 12,
  },
  {
    id: 'INV-7723',
    customerName: 'TechCorp Industries Ltd',
    customerId: 'CUST-8293',
    accountNumber: '0123456791',
    phone: '+234 803 456 7890',
    product: 'Bond',
    currency: 'NGN',
    principal: 50000000.00,
    interestRate: 16.0,
    currentValue: 54000000.00,
    status: 'Pending Approval',
    state: 'Compliance Review',
    startDate: '20 Jul 2026',
    maturityDate: '20 Jul 2028',
    relationshipManager: 'Sarah Jenkins',
    tenureMonths: 24,
  },
  {
    id: 'INV-7724',
    customerName: 'Sarah Williams',
    customerId: 'CUST-8294',
    accountNumber: '0123456792',
    phone: '+234 804 567 8901',
    product: 'Mutual Fund',
    currency: 'NGN',
    principal: 2500000.00,
    interestRate: 12.0,
    currentValue: 2650000.00,
    status: 'Matured',
    state: 'Healthy',
    startDate: '10 Jan 2025',
    maturityDate: '10 Jul 2026',
    relationshipManager: 'Chidinma E.',
    tenureMonths: 6,
  },
  {
    id: 'INV-7725',
    customerName: 'David Brown Store',
    customerId: 'CUST-8295',
    accountNumber: '0123456793',
    phone: '+234 805 678 9012',
    product: 'Dollar Investment',
    currency: 'USD',
    principal: 45000.00,
    interestRate: 8.5,
    currentValue: 47868.75,
    status: 'Active',
    state: 'Healthy',
    startDate: '05 May 2025',
    maturityDate: '05 May 2026',
    relationshipManager: 'Babajide S.',
    tenureMonths: 12,
  },
  {
    id: 'INV-7726',
    customerName: 'Emily Davis',
    customerId: 'CUST-8296',
    accountNumber: '0123456794',
    phone: '+234 806 789 0123',
    product: 'Fixed Deposit',
    currency: 'NGN',
    principal: 1000000.00,
    interestRate: 13.0,
    currentValue: 1065000.00,
    status: 'Redeemed',
    state: 'Healthy',
    startDate: '01 Nov 2024',
    maturityDate: '01 May 2025',
    relationshipManager: 'Sarah Jenkins',
    tenureMonths: 6,
  },
  {
    id: 'INV-7727',
    customerName: 'Global Trade Enterprise',
    customerId: 'CUST-8297',
    accountNumber: '0123456795',
    phone: '+234 807 890 1234',
    product: 'Treasury Bills',
    currency: 'NGN',
    principal: 25000000.00,
    interestRate: 17.5,
    currentValue: 27187500.00,
    status: 'Active',
    state: 'Under Review',
    startDate: '10 Feb 2026',
    maturityDate: '10 Aug 2026',
    relationshipManager: 'Chidinma E.',
    tenureMonths: 6,
  },
  {
    id: 'INV-7728',
    customerName: 'Amara Nwosu',
    customerId: 'CUST-8298',
    accountNumber: '0123456796',
    phone: '+234 808 901 2345',
    product: 'Mutual Fund',
    currency: 'NGN',
    principal: 750000.00,
    interestRate: 11.5,
    currentValue: 793125.00,
    status: 'Cancelled',
    state: 'Disputed',
    startDate: '12 May 2026',
    maturityDate: '12 Nov 2026',
    relationshipManager: 'Babajide S.',
    tenureMonths: 6,
  },
];

// RECHARTS COLOR PALETTES
const STATUS_COLORS = {
  Active: '#10B981',
  Pending: '#F59E0B',
  Matured: '#3B82F6',
  Redeemed: '#8B5CF6',
  Cancelled: '#6B7280',
};

const PRODUCT_COLORS = {
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
  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<string>('All');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('All');
  const [selectedMaturity, setSelectedMaturity] = useState<string>('All');
  const [selectedRm, setSelectedRm] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('principal-desc');
  const [growthPeriod, setGrowthPeriod] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');

  // Modals State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentRecord | null>(null);

  // New Investment Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustId, setNewCustId] = useState('');
  const [newProduct, setNewProduct] = useState<ProductType>('Fixed Deposit');
  const [newPrincipal, setNewPrincipal] = useState('1000000');
  const [newRate, setNewRate] = useState('14.5');
  const [newTenure, setNewTenure] = useState('12');

  // Filtered & Sorted Investments
  const filteredInvestments = useMemo(() => {
    return mockInvestments.filter((inv) => {
      // Search
      const matchesSearch = 
        inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.accountNumber.includes(searchQuery) ||
        inv.phone.includes(searchQuery) ||
        inv.product.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter Dropdowns
      const matchesStatus = selectedStatus === 'All' || inv.status === selectedStatus;
      const matchesProduct = selectedProduct === 'All' || inv.product === selectedProduct;
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
  }, [searchQuery, selectedStatus, selectedProduct, selectedCurrency, selectedRm, sortBy]);

  // Handle Create Investment
  const handleCreateInvestment = () => {
    if (!newCustName) {
      message.error('Please enter customer name.');
      return;
    }
    message.success(`New ${newProduct} created successfully for ${newCustName}!`);
    setCreateModalOpen(false);
    setNewCustName('');
  };

  // Row Action Dropdown Menu
  const getActionMenu = (record: InvestmentRecord): MenuProps => ({
    items: [
      {
        key: 'view-inv',
        label: (
          <Link href={`/dashboard/retail/investments/${record.id}`} className="flex items-center gap-2 text-xs font-semibold text-[#961A1C]">
            <Eye size={14} /> View Investment
          </Link>
        ),
      },
      {
        key: 'view-cust',
        label: (
          <Link href={`/dashboard/retail/customers/${record.customerId}`} className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <User size={14} /> View Customer
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
        key: 'extend',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-blue-600">
            <Calendar size={14} /> Extend Maturity
          </span>
        ),
        onClick: () => message.info(`Extend maturity modal triggered for ${record.id}`),
      },
      {
        key: 'statement',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Download size={14} /> Export Statement
          </span>
        ),
        onClick: () => message.info(`Downloading investment statement for ${record.id}...`),
      },
      {
        key: 'audit',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <FileText size={14} /> View Audit Log
          </span>
        ),
        onClick: () => message.info(`Opening audit trail for ${record.id}...`),
      },
      { type: 'divider' },
      {
        key: 'cancel',
        label: (
          <span className="flex items-center gap-2 text-xs font-semibold text-red-600">
            <XCircle size={14} /> Cancel Investment
          </span>
        ),
        onClick: () => message.warning(`Cancellation workflow initiated for ${record.id}`),
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
            Monitor, manage, and track all customer investments across the platform.
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-1.5 shadow-2xs"
          >
            <Download size={14} /> Export Investments
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg transition flex items-center gap-1.5 shadow-sm"
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
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded transition ${
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
            <span className="text-[11px]">Updated 10m ago</span>
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
              placeholder="Search by Investment ID, Customer Name, Account No, Product, Phone..."
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

          {/* Status Filter */}
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

          {/* Product Filter */}
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

          {/* Currency Filter */}
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

          {/* RM Filter */}
          <Select
            value={selectedRm}
            onChange={setSelectedRm}
            size="small"
            className="w-36"
            options={[
              { value: 'All', label: 'All Officers (RM)' },
              { value: 'Sarah Jenkins', label: 'Sarah Jenkins' },
              { value: 'Babajide S.', label: 'Babajide S.' },
              { value: 'Chidinma E.', label: 'Chidinma E.' },
            ]}
          />

          {(selectedStatus !== 'All' || selectedProduct !== 'All' || selectedCurrency !== 'All' || selectedRm !== 'All' || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedStatus('All');
                setSelectedProduct('All');
                setSelectedCurrency('All');
                setSelectedRm('All');
                setSearchQuery('');
              }}
              className="text-xs text-[#961A1C] hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* DATA TABLE CONTAINER (HIDDEN SCROLLBAR) */}
        <div className="overflow-x-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {filteredInvestments.length === 0 ? (
            /* EMPTY STATE */
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                <Search size={22} />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No investments match your filters</h3>
              <p className="text-xs text-gray-500 max-w-sm">
                Adjust your search parameters, status, product, or currency filters to view registered customer investments.
              </p>
              <Button
                onClick={() => {
                  setSelectedStatus('All');
                  setSelectedProduct('All');
                  setSelectedCurrency('All');
                  setSelectedRm('All');
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
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Principal</th>
                  <th className="px-4 py-3">Interest Rate</th>
                  <th className="px-4 py-3">Current Value</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Operational State</th>
                  <th className="px-4 py-3">Maturity Date</th>
                  <th className="px-4 py-3">RM</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredInvestments.map((inv) => {
                  const sym = inv.currency === 'USD' ? '$' : inv.currency === 'GBP' ? '£' : inv.currency === 'EUR' ? '€' : '₦';
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition">
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/retail/investments/${inv.id}`}
                          className="font-mono font-bold text-[#961A1C] hover:underline"
                        >
                          {inv.id}
                        </Link>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <Link
                            href={`/dashboard/retail/customers/${inv.customerId}`}
                            className="font-bold text-gray-900 dark:text-white hover:underline"
                          >
                            {inv.customerName}
                          </Link>
                          <span className="text-[11px] text-gray-400 font-mono">{inv.accountNumber}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Tag color="purple" className="font-semibold text-[10px] rounded-md">
                          {inv.product}
                        </Tag>
                      </td>

                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                        {sym}{inv.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-3 font-semibold text-emerald-600">
                        +{inv.interestRate}% p.a.
                      </td>

                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                        {sym}{inv.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-3">
                        <InvestmentStatusBadge status={inv.status} />
                      </td>

                      <td className="px-4 py-3">
                        <InvestmentStateBadge state={inv.state} />
                      </td>

                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {inv.maturityDate}
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {inv.relationshipManager}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Dropdown menu={getActionMenu(inv)} trigger={['click']} placement="bottomRight">
                          <button className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <MoreVertical size={16} />
                          </button>
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

      {/* --- CREATE INVESTMENT MODAL --- */}
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
        okText="Create Investment"
        okButtonProps={{ style: { backgroundColor: '#961A1C', borderColor: '#961A1C' } }}
        width={500}
        centered
      >
        <div className="py-2 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Oluwaseun Adeleke"
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Customer ID / Account
              </label>
              <Input
                placeholder="CUST-8291 / 0123456789"
                value={newCustId}
                onChange={(e) => setNewCustId(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Investment Product
              </label>
              <Select
                value={newProduct}
                onChange={setNewProduct}
                className="w-full text-xs"
                options={[
                  { value: 'Fixed Deposit', label: 'Fixed Deposit' },
                  { value: 'Treasury Bills', label: 'Treasury Bills' },
                  { value: 'Mutual Fund', label: 'Mutual Fund' },
                  { value: 'Bond', label: 'Bond' },
                  { value: 'Dollar Investment', label: 'Dollar Investment' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Principal (NGN)
              </label>
              <Input
                type="number"
                value={newPrincipal}
                onChange={(e) => setNewPrincipal(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Interest Rate (%)
              </label>
              <Input
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Tenure (Months)
              </label>
              <Input
                type="number"
                value={newTenure}
                onChange={(e) => setNewTenure(e.target.value)}
              />
            </div>
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
            Export filtered customer investment portfolio records into spreadsheet format for accounting, treasury, or compliance auditing.
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

    </div>
  );
}

// --- HELPER KPI CARD ---
function KpiCard({ title, value, highlight, tag }: { title: string; value: string; highlight: string; tag?: string }) {
  const barColors: Record<string, string> = {
    red: 'bg-[#961A1C]',
    green: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    gray: 'bg-gray-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700/80 shadow-2xs relative overflow-hidden flex flex-col justify-between">
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] rounded-r-md ${barColors[highlight] || 'bg-[#961A1C]'}`} />
      <div className="flex items-center justify-between pl-1.5">
        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate">{title}</span>
        {tag && <Tag color="red" className="font-bold text-[9px] px-1 py-0">{tag}</Tag>}
      </div>
      <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight block mt-1 pl-1.5 font-sans">
        {value}
      </span>
    </div>
  );
}

// --- HELPER PERFORMANCE CARD ---
function PerformanceCard({ title, value, sub, color }: { title: string; value: string; sub: string; color: string }) {
  const barColors: Record<string, string> = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    gray: 'bg-gray-400',
    red: 'bg-[#961A1C]',
  };

  const textColors: Record<string, string> = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    amber: 'text-amber-600 dark:text-amber-400',
    gray: 'text-gray-700 dark:text-gray-300',
    red: 'text-[#961A1C] dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-2xs relative overflow-hidden flex flex-col justify-between">
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] rounded-r-md ${barColors[color] || 'bg-[#961A1C]'}`} />
      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block truncate pl-1.5">{title}</span>
      <span className={`text-lg md:text-xl font-bold tracking-tight block mt-1 pl-1.5 ${textColors[color]}`}>
        {value}
      </span>
      <span className="text-[10px] text-gray-400 block mt-0.5 pl-1.5">{sub}</span>
    </div>
  );
}
