'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Dropdown, Tag, Select, Modal, Input, Button, DatePicker, Checkbox, 
  Tooltip, Badge, message, MenuProps 
} from 'antd';
import { 
  Wallet, ArrowDownToLine, ArrowUpFromLine, TrendingUp, Search, Filter, 
  MoreVertical, CreditCard, Download, Shield, Plus, Minus, RotateCcw, 
  ChevronLeft, ChevronRight, AlertTriangle, ShieldAlert, Lock, Unlock, 
  UserCheck, PauseCircle, CheckCircle2, XCircle, Clock, Eye, FileSpreadsheet,
  Users, Building2, Store, DollarSign, Layers, ArrowUpRight, ArrowDownRight,
  RefreshCw, FileText, Ban, Trash2, Edit3, ChevronDown, Check, Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, Legend
} from 'recharts';

const { RangePicker } = DatePicker;

// --- TYPES & INTERFACES ---
type WalletStatus = 'Active' | 'Suspended' | 'Dormant' | 'Frozen' | 'Closed';
type WalletState = 'Healthy' | 'Under Review' | 'Frozen Funds' | 'Restricted' | 'Pending Activation' | 'Compliance Hold' | 'AML Investigation';
type WalletType = 'Personal' | 'Business' | 'Corporate' | 'Merchant';
type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR';

export interface WalletRecord {
  id: string;
  customerName: string;
  customerId: string;
  email: string;
  phone: string;
  accountNumber: string;
  walletType: WalletType;
  currency: Currency;
  balance: number;
  status: WalletStatus;
  state: WalletState;
  lastActivity: string;
  createdDate: string;
  virtualAccount: string;
}

// --- MOCK DATA ---
const mockWallets: WalletRecord[] = [
  {
    id: 'W-9182',
    customerName: 'Oluwaseun Adeleke',
    customerId: 'CUST-8291',
    email: 'seun.adeleke@gmail.com',
    phone: '+234 801 234 5678',
    accountNumber: '0123456789',
    walletType: 'Personal',
    currency: 'NGN',
    balance: 450000.00,
    status: 'Active',
    state: 'Healthy',
    lastActivity: '10 mins ago',
    createdDate: '12 Jan 2025',
    virtualAccount: '0123456789 (Alpha 10)',
  },
  {
    id: 'W-9183',
    customerName: 'Jane Smith',
    customerId: 'CUST-8292',
    email: 'jane.smith@example.com',
    phone: '+234 802 345 6789',
    accountNumber: '0123456790',
    walletType: 'Personal',
    currency: 'NGN',
    balance: 12500.00,
    status: 'Active',
    state: 'Healthy',
    lastActivity: '45 mins ago',
    createdDate: '15 Feb 2025',
    virtualAccount: '0123456790 (Alpha 10)',
  },
  {
    id: 'W-9184',
    customerName: 'TechCorp Industries Ltd',
    customerId: 'CUST-8293',
    email: 'finance@techcorp.ng',
    phone: '+234 803 456 7890',
    accountNumber: '0123456791',
    walletType: 'Corporate',
    currency: 'NGN',
    balance: 12500000.50,
    status: 'Active',
    state: 'Healthy',
    lastActivity: '2 hours ago',
    createdDate: '01 Nov 2024',
    virtualAccount: '0123456791 (Alpha 10)',
  },
  {
    id: 'W-9185',
    customerName: 'Sarah Williams',
    customerId: 'CUST-8294',
    email: 'sarah.w@example.com',
    phone: '+234 804 567 8901',
    accountNumber: '0123456792',
    walletType: 'Personal',
    currency: 'NGN',
    balance: 2450000.00,
    status: 'Frozen',
    state: 'Frozen Funds',
    lastActivity: '1 day ago',
    createdDate: '20 Mar 2025',
    virtualAccount: '0123456792 (Alpha 10)',
  },
  {
    id: 'W-9186',
    customerName: 'David Brown Store',
    customerId: 'CUST-8295',
    email: 'david.b@example.com',
    phone: '+234 805 678 9012',
    accountNumber: '0123456793',
    walletType: 'Merchant',
    currency: 'NGN',
    balance: 580000.00,
    status: 'Active',
    state: 'Healthy',
    lastActivity: '3 hours ago',
    createdDate: '05 May 2025',
    virtualAccount: '0123456793 (Alpha 10)',
  },
  {
    id: 'W-9187',
    customerName: 'Emily Davis',
    customerId: 'CUST-8296',
    email: 'emily.d@example.com',
    phone: '+234 806 789 0123',
    accountNumber: '0123456794',
    walletType: 'Personal',
    currency: 'USD',
    balance: 14500.00,
    status: 'Active',
    state: 'Under Review',
    lastActivity: '5 hours ago',
    createdDate: '18 Jun 2025',
    virtualAccount: 'USD-981245 (Alpha 10)',
  },
  {
    id: 'W-9188',
    customerName: 'Global Trade Enterprise',
    customerId: 'CUST-8297',
    email: 'ops@globaltrade.io',
    phone: '+234 807 890 1234',
    accountNumber: '0123456795',
    walletType: 'Business',
    currency: 'NGN',
    balance: 8900000.00,
    status: 'Suspended',
    state: 'Restricted',
    lastActivity: '3 days ago',
    createdDate: '10 Aug 2024',
    virtualAccount: '0123456795 (Alpha 10)',
  },
  {
    id: 'W-9189',
    customerName: 'Amara Nwosu',
    customerId: 'CUST-8298',
    email: 'amara.nwosu@yahoo.com',
    phone: '+234 808 901 2345',
    accountNumber: '0123456796',
    walletType: 'Personal',
    currency: 'NGN',
    balance: 0.00,
    status: 'Dormant',
    state: 'Healthy',
    lastActivity: '120 days ago',
    createdDate: '11 Jan 2024',
    virtualAccount: '0123456796 (Alpha 10)',
  },
  {
    id: 'W-9190',
    customerName: 'Kiddies Fun World',
    customerId: 'CUST-8299',
    email: 'info@kiddiesfun.ng',
    phone: '+234 809 012 3456',
    accountNumber: '0123456797',
    walletType: 'Merchant',
    currency: 'NGN',
    balance: 340000.00,
    status: 'Active',
    state: 'Healthy',
    lastActivity: '30 mins ago',
    createdDate: '02 Feb 2025',
    virtualAccount: '0123456797 (Alpha 10)',
  },
  {
    id: 'W-9191',
    customerName: 'Chidinma Eze',
    customerId: 'CUST-8300',
    email: 'chidinma.eze@techcorp.ng',
    phone: '+234 810 123 4567',
    accountNumber: '0123456798',
    walletType: 'Personal',
    currency: 'GBP',
    balance: 4200.00,
    status: 'Active',
    state: 'Healthy',
    lastActivity: '1 hour ago',
    createdDate: '14 Apr 2025',
    virtualAccount: 'GBP-772810 (Alpha 10)',
  },
  {
    id: 'W-9192',
    customerName: 'Apex Capital Holdings',
    customerId: 'CUST-8301',
    email: 'treasury@apexcap.com',
    phone: '+234 811 234 5678',
    accountNumber: '0123456799',
    walletType: 'Corporate',
    currency: 'NGN',
    balance: 45200000.00,
    status: 'Active',
    state: 'Compliance Hold',
    lastActivity: '6 hours ago',
    createdDate: '01 Dec 2023',
    virtualAccount: '0123456799 (Alpha 10)',
  },
  {
    id: 'W-9193',
    customerName: 'Ibrahim Babajide',
    customerId: 'CUST-8302',
    email: 'baba.ibrahim@outlook.com',
    phone: '+234 812 345 6789',
    accountNumber: '0123456800',
    walletType: 'Personal',
    currency: 'EUR',
    balance: 150.00,
    status: 'Closed',
    state: 'Healthy',
    lastActivity: '180 days ago',
    createdDate: '09 Sep 2023',
    virtualAccount: 'EUR-102938 (Alpha 10)',
  },
];

// Recharts Colors
const STATUS_COLORS = {
  Active: '#10B981',
  Suspended: '#F59E0B',
  Dormant: '#6B7280',
  Frozen: '#EF4444',
  Closed: '#374151',
};

const TYPE_COLORS = {
  Personal: '#8B5CF6',
  Business: '#3B82F6',
  Corporate: '#961A1C',
  Merchant: '#10B981',
};

// Analytics Data
const statusDistributionData = [
  { name: 'Active', value: 112400, color: STATUS_COLORS.Active },
  { name: 'Suspended', value: 1450, color: STATUS_COLORS.Suspended },
  { name: 'Dormant', value: 8230, color: STATUS_COLORS.Dormant },
  { name: 'Frozen', value: 890, color: STATUS_COLORS.Frozen },
  { name: 'Closed', value: 4975, color: STATUS_COLORS.Closed },
];

const creationTrendDataMap = {
  Today: [
    { time: '00:00', count: 12 },
    { time: '04:00', count: 8 },
    { time: '08:00', count: 45 },
    { time: '12:00', count: 112 },
    { time: '16:00', count: 148 },
    { time: '20:00', count: 87 },
  ],
  '7 Days': [
    { time: 'Mon', count: 320 },
    { time: 'Tue', count: 410 },
    { time: 'Wed', count: 380 },
    { time: 'Thu', count: 490 },
    { time: 'Fri', count: 560 },
    { time: 'Sat', count: 280 },
    { time: 'Sun', count: 210 },
  ],
  '30 Days': [
    { time: 'Week 1', count: 2100 },
    { time: 'Week 2', count: 2850 },
    { time: 'Week 3', count: 3100 },
    { time: 'Week 4', count: 2950 },
  ],
  '3 Months': [
    { time: 'May', count: 10400 },
    { time: 'Jun', count: 12100 },
    { time: 'Jul', count: 14800 },
  ],
  '12 Months': [
    { time: 'Q1', count: 28400 },
    { time: 'Q2', count: 34500 },
    { time: 'Q3', count: 39100 },
    { time: 'Q4', count: 42000 },
  ],
};

const walletTypeData = [
  { type: 'Personal', count: 85200, color: TYPE_COLORS.Personal },
  { type: 'Business', count: 24100, color: TYPE_COLORS.Business },
  { type: 'Corporate', count: 12800, color: TYPE_COLORS.Corporate },
  { type: 'Merchant', count: 6440, color: TYPE_COLORS.Merchant },
];

export default function WalletManagementPage() {
  const router = useRouter();

  // --- STATE ---
  const [wallets, setWallets] = useState<WalletRecord[]>(mockWallets);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('balance-desc');
  const [trendPeriod, setTrendPeriod] = useState<'Today' | '7 Days' | '30 Days' | '3 Months' | '12 Months'>('30 Days');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState<{ wallet: WalletRecord; actionType: string } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Wallet Form State
  const [newWalletForm, setNewWalletForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    walletType: 'Personal' as WalletType,
    currency: 'NGN' as Currency,
    initialBalance: 0,
  });

  // --- FILTERED & SORTED DATA ---
  const filteredWallets = useMemo(() => {
    return wallets.filter((w) => {
      // Search
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        w.id.toLowerCase().includes(query) ||
        w.customerName.toLowerCase().includes(query) ||
        w.accountNumber.includes(query) ||
        w.email.toLowerCase().includes(query) ||
        w.phone.includes(query);

      // Status
      const matchesStatus = selectedStatus === 'All' || w.status === selectedStatus;

      // Type
      const matchesType = selectedType === 'All' || w.walletType === selectedType;

      // Currency
      const matchesCurrency = selectedCurrency === 'All' || w.currency === selectedCurrency;

      // State
      const matchesState = selectedState === 'All' || w.state === selectedState;

      return matchesSearch && matchesStatus && matchesType && matchesCurrency && matchesState;
    }).sort((a, b) => {
      if (sortBy === 'balance-desc') return b.balance - a.balance;
      if (sortBy === 'balance-asc') return a.balance - b.balance;
      if (sortBy === 'name-asc') return a.customerName.localeCompare(b.customerName);
      if (sortBy === 'date-desc') return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      return 0;
    });
  }, [wallets, searchQuery, selectedStatus, selectedType, selectedCurrency, selectedState, sortBy]);

  // Handle Action Trigger
  const handleActionTrigger = (wallet: WalletRecord, actionType: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (actionType === 'View Wallet') {
      router.push(`/dashboard/retail/wallets/${wallet.id}`);
      return;
    }
    setActionTarget({ wallet, actionType });
    setActionReason('');
    setIsActionModalOpen(true);
  };

  // Submit Action Confirmation
  const handleConfirmAction = () => {
    if (!actionTarget) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const { wallet, actionType } = actionTarget;
      setWallets((prev) =>
        prev.map((w) => {
          if (w.id === wallet.id) {
            let updatedStatus = w.status;
            let updatedState = w.state;

            if (actionType === 'Freeze Wallet') {
              updatedStatus = 'Frozen';
              updatedState = 'Frozen Funds';
            } else if (actionType === 'Suspend Wallet') {
              updatedStatus = 'Suspended';
              updatedState = 'Restricted';
            } else if (actionType === 'Reactivate Wallet' || actionType === 'Unfreeze Wallet') {
              updatedStatus = 'Active';
              updatedState = 'Healthy';
            } else if (actionType === 'Close Wallet') {
              updatedStatus = 'Closed';
            }

            return { ...w, status: updatedStatus, state: updatedState };
          }
          return w;
        })
      );

      setIsSubmitting(false);
      setIsActionModalOpen(false);
      message.success(`Wallet ${wallet.id} updated: ${actionType} executed successfully.`);
    }, 600);
  };

  // Submit Create Wallet Form
  const handleCreateWallet = () => {
    if (!newWalletForm.customerName || !newWalletForm.email) {
      message.error('Please enter customer name and email.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newId = `W-${Math.floor(1000 + Math.random() * 9000)}`;
      const created: WalletRecord = {
        id: newId,
        customerName: newWalletForm.customerName,
        customerId: `CUST-${Math.floor(8000 + Math.random() * 1000)}`,
        email: newWalletForm.email,
        phone: newWalletForm.phone || '+234 800 000 0000',
        accountNumber: `012${Math.floor(1000000 + Math.random() * 9000000)}`,
        walletType: newWalletForm.walletType,
        currency: newWalletForm.currency,
        balance: Number(newWalletForm.initialBalance) || 0,
        status: 'Active',
        state: 'Healthy',
        lastActivity: 'Just now',
        createdDate: '29 Jul 2026',
        virtualAccount: `${Math.floor(1000000000 + Math.random() * 9000000000)} (Wema Bank)`,
      };

      setWallets([created, ...wallets]);
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
      setNewWalletForm({
        customerName: '',
        email: '',
        phone: '',
        walletType: 'Personal',
        currency: 'NGN',
        initialBalance: 0,
      });
      message.success(`New ${created.walletType} wallet ${newId} created successfully!`);
    }, 800);
  };

  // Dropdown menu items for table row
  const getRowMenu = (wallet: WalletRecord): MenuProps => ({
    items: [
      {
        key: 'view',
        label: (
          <span className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
            <Eye size={14} className="text-gray-500" /> View Wallet Details
          </span>
        ),
        onClick: () => router.push(`/dashboard/retail/wallets/${wallet.id}`),
      },
      {
        key: 'txns',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <FileText size={14} className="text-gray-500" /> View Transactions
          </span>
        ),
        onClick: () => router.push(`/dashboard/transactions?wallet=${wallet.id}`),
      },
      {
        key: 'freeze',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Lock size={14} /> Freeze Wallet
          </span>
        ),
        onClick: () => handleActionTrigger(wallet, 'Freeze Wallet'),
      },
      {
        key: 'suspend',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-orange-600 dark:text-orange-400">
            <PauseCircle size={14} /> Suspend Wallet
          </span>
        ),
        onClick: () => handleActionTrigger(wallet, 'Suspend Wallet'),
      },
      {
        key: 'reactivate',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <RotateCcw size={14} /> Reactivate Wallet
          </span>
        ),
        onClick: () => handleActionTrigger(wallet, 'Reactivate Wallet'),
      },
      {
        key: 'export',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Download size={14} className="text-gray-500" /> Export Statement
          </span>
        ),
        onClick: () => message.info(`Downloading statement for ${wallet.id}...`),
      },
      { type: 'divider' },
      {
        key: 'close',
        label: (
          <span className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
            <Trash2 size={14} /> Close Wallet
          </span>
        ),
        onClick: () => handleActionTrigger(wallet, 'Close Wallet'),
      },
    ],
  });

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Wallet className="text-[#961A1C]" size={26} />
            Wallet Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Monitor, search and manage all customer wallets across the platform.
          </p>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            icon={<Download size={14} />}
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 font-semibold text-xs h-9 rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Export Wallets
          </Button>

          <Button
            type="primary"
            icon={<Plus size={15} />}
            onClick={() => setIsCreateModalOpen(true)}
            style={{ backgroundColor: '#961A1C', borderColor: '#961A1C' }}
            className="!bg-[#961A1C] hover:!bg-[#7a1517] !text-white font-semibold text-xs h-9 rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            Create Wallet
          </Button>
        </div>
      </div>

      {/* 2. OVERVIEW STATISTICS (8 KPI CARDS GRID) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <KpiCard title="Total Wallets" value="128,540" icon={<Wallet size={15} className="text-purple-600" />} color="bg-purple-50 dark:bg-purple-950/40" />
        <KpiCard title="Active Wallets" value="112,400" icon={<CheckCircle2 size={15} className="text-emerald-600" />} color="bg-emerald-50 dark:bg-emerald-950/40" />
        <KpiCard title="Suspended" value="1,450" icon={<PauseCircle size={15} className="text-amber-600" />} color="bg-amber-50 dark:bg-amber-950/40" />
        <KpiCard title="Dormant" value="8,230" icon={<Clock size={15} className="text-gray-600" />} color="bg-gray-100 dark:bg-gray-800" />
        <KpiCard title="Frozen" value="890" icon={<Lock size={15} className="text-red-600" />} color="bg-red-50 dark:bg-red-950/40" />
        <KpiCard title="Created Today" value="412" icon={<Plus size={15} className="text-blue-600" />} color="bg-blue-50 dark:bg-blue-950/40" />
        <KpiCard title="Pending Review" value="185" icon={<ShieldAlert size={15} className="text-orange-600" />} color="bg-orange-50 dark:bg-orange-950/40" />
        <KpiCard title="Closed Wallets" value="4,975" icon={<XCircle size={15} className="text-gray-500" />} color="bg-gray-100 dark:bg-gray-800/80" />
      </div>

      {/* 3. ANALYTICS SECTION (CHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* DONUT CHART: WALLET STATUS DISTRIBUTION */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between">
              Wallet Status Distribution
              <span className="text-[11px] font-medium text-gray-400">Real-time</span>
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Proportion of operational wallet statuses</p>
          </div>

          <div className="h-52 w-full relative my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(val: any) => (val ? val.toLocaleString() : '0')} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-gray-900 dark:text-white">128.5K</span>
              <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Wallets</span>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="grid grid-cols-5 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/60 text-xs">
            {statusDistributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600 dark:text-gray-300 font-medium text-[11px]">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LINE CHART: WALLET CREATION TREND */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Wallet Creation Trend</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">New retail wallet registrations over selected period</p>
            </div>
            
            {/* Trend Period Switcher */}
            <div className="flex bg-gray-100 dark:bg-gray-700 p-0.5 rounded-md self-start sm:self-auto">
              {(['Today', '7 Days', '30 Days', '3 Months', '12 Months'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTrendPeriod(period)}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded transition ${
                    trendPeriod === period
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={creationTrendDataMap[trendPeriod]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <RechartsTooltip formatter={(val: any) => [val ? val.toLocaleString() : '0', 'Wallets Opened']} />
                <Line type="monotone" dataKey="count" stroke="#961A1C" strokeWidth={2.5} dot={{ r: 3, fill: '#961A1C' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <span>Average Growth Rate: <strong className="text-emerald-600 dark:text-emerald-400">+14.2%</strong></span>
            <span className="text-[11px]">Updated 5 mins ago</span>
          </div>
        </div>

      </div>

      {/* 4. WALLET DIRECTORY (SEARCH, FILTERS & TABLE) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs overflow-hidden">
        
        {/* TOOLBAR: SEARCH & MULTI-FILTERS */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Wallet ID, Customer Name, Account No, Email, Phone..."
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Sort Control */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Sort:</span>
              <Select
                value={sortBy}
                onChange={setSortBy}
                size="small"
                className="w-44 text-xs"
                options={[
                  { value: 'balance-desc', label: 'Highest Balance' },
                  { value: 'balance-asc', label: 'Lowest Balance' },
                  { value: 'name-asc', label: 'Customer Name (A-Z)' },
                  { value: 'date-desc', label: 'Newest First' },
                ]}
              />
            </div>
          </div>

          {/* Filter Dropdowns Row */}
          <div className="flex items-center gap-2.5 flex-wrap pt-1 text-xs">
            <span className="text-gray-500 font-semibold flex items-center gap-1">
              <Filter size={13} /> Filters:
            </span>

            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              size="small"
              className="w-32"
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Active', label: 'Active' },
                { value: 'Suspended', label: 'Suspended' },
                { value: 'Dormant', label: 'Dormant' },
                { value: 'Frozen', label: 'Frozen' },
                { value: 'Closed', label: 'Closed' },
              ]}
            />

            {/* Type Filter */}
            <Select
              value={selectedType}
              onChange={setSelectedType}
              size="small"
              className="w-32"
              options={[
                { value: 'All', label: 'All Types' },
                { value: 'Personal', label: 'Personal' },
                { value: 'Business', label: 'Business' },
                { value: 'Corporate', label: 'Corporate' },
                { value: 'Merchant', label: 'Merchant' },
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

            {/* State Filter */}
            <Select
              value={selectedState}
              onChange={setSelectedState}
              size="small"
              className="w-36"
              options={[
                { value: 'All', label: 'All States' },
                { value: 'Healthy', label: 'Healthy' },
                { value: 'Under Review', label: 'Under Review' },
                { value: 'Frozen Funds', label: 'Frozen Funds' },
                { value: 'Restricted', label: 'Restricted' },
                { value: 'Pending Activation', label: 'Pending Activation' },
                { value: 'Compliance Hold', label: 'Compliance Hold' },
              ]}
            />

            {/* Reset Filters Button */}
            {(selectedStatus !== 'All' || selectedType !== 'All' || selectedCurrency !== 'All' || selectedState !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedStatus('All');
                  setSelectedType('All');
                  setSelectedCurrency('All');
                  setSelectedState('All');
                  setSearchQuery('');
                }}
                className="text-xs text-[#961A1C] hover:underline font-semibold ml-auto"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {filteredWallets.length === 0 ? (
            /* EMPTY STATE */
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                <Search size={22} />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No wallets match your filters</h3>
              <p className="text-xs text-gray-500 max-w-sm">
                Adjust your search parameters, status, type or state filters to view registered customer wallets.
              </p>
              <Button
                onClick={() => {
                  setSelectedStatus('All');
                  setSelectedType('All');
                  setSelectedCurrency('All');
                  setSelectedState('All');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold"
              >
                Clear Search & Filters
              </Button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-700 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Wallet ID</th>
                  <th className="px-5 py-3">Customer Name</th>
                  <th className="px-5 py-3">Wallet Type</th>
                  <th className="px-5 py-3">Currency</th>
                  <th className="px-5 py-3">Current Balance</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">State</th>
                  <th className="px-5 py-3">Last Activity</th>
                  <th className="px-5 py-3">Created Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {filteredWallets.map((wallet) => (
                  <tr
                    key={wallet.id}
                    onClick={() => router.push(`/dashboard/retail/wallets/${wallet.id}`)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition cursor-pointer group"
                  >
                    {/* Wallet ID */}
                    <td className="px-5 py-3.5 font-mono font-bold text-[#961A1C] dark:text-red-400 group-hover:underline">
                      {wallet.id}
                    </td>

                    {/* Customer Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white">{wallet.customerName}</span>
                        <span className="text-[11px] text-gray-400 line-clamp-1">{wallet.email}</span>
                      </div>
                    </td>

                    {/* Wallet Type */}
                    <td className="px-5 py-3.5">
                      <Tag
                        className="font-medium rounded-md text-[11px] border-none px-2 py-0.5"
                        color={
                          wallet.walletType === 'Corporate' ? 'red' :
                          wallet.walletType === 'Business' ? 'blue' :
                          wallet.walletType === 'Merchant' ? 'green' : 'purple'
                        }
                      >
                        {wallet.walletType}
                      </Tag>
                    </td>

                    {/* Currency */}
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/80 px-2 py-0.5 rounded text-[11px]">
                        {wallet.currency}
                      </span>
                    </td>

                    {/* Current Balance */}
                    <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white text-sm">
                      {wallet.currency === 'USD' ? '$' : wallet.currency === 'GBP' ? '£' : wallet.currency === 'EUR' ? '€' : '₦'}
                      {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={wallet.status} />
                    </td>

                    {/* State Badge */}
                    <td className="px-5 py-3.5">
                      <StateBadge state={wallet.state} />
                    </td>

                    {/* Last Activity */}
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {wallet.lastActivity}
                    </td>

                    {/* Created Date */}
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {wallet.createdDate}
                    </td>

                    {/* Actions Menu */}
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <Dropdown menu={getRowMenu(wallet)} trigger={['click']} placement="bottomRight">
                        <button className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                          <MoreVertical size={16} />
                        </button>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION / FOOTER */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Showing <strong className="text-gray-900 dark:text-white">{filteredWallets.length}</strong> of{' '}
            <strong className="text-gray-900 dark:text-white">{wallets.length}</strong> loaded wallets (Total 128,540)
          </div>
          <div className="flex items-center gap-2">
            <Button size="small" disabled>
              Previous
            </Button>
            <span className="px-2 font-semibold text-gray-900 dark:text-white">Page 1 of 1</span>
            <Button size="small" disabled>
              Next
            </Button>
          </div>
        </div>

      </div>

      {/* --- MODAL 1: CREATE WALLET MODAL --- */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <Plus className="text-[#961A1C]" size={20} />
            Create Customer Wallet (Permission Controlled)
          </div>
        }
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsCreateModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSubmitting}
            onClick={handleCreateWallet}
            style={{ backgroundColor: '#961A1C', borderColor: '#961A1C' }}
            className="!bg-[#961A1C] hover:!bg-[#7a1517] !text-white font-semibold"
          >
            Create & Provision Wallet
          </Button>,
        ]}
        width={520}
        centered
      >
        <div className="py-2 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Customer Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Oluwaseun Adeleke"
              value={newWalletForm.customerName}
              onChange={(e) => setNewWalletForm({ ...newWalletForm, customerName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="customer@email.com"
                value={newWalletForm.email}
                onChange={(e) => setNewWalletForm({ ...newWalletForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <Input
                placeholder="+234 800 000 0000"
                value={newWalletForm.phone}
                onChange={(e) => setNewWalletForm({ ...newWalletForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Wallet Type</label>
              <Select
                value={newWalletForm.walletType}
                onChange={(val) => setNewWalletForm({ ...newWalletForm, walletType: val })}
                className="w-full"
                options={[
                  { value: 'Personal', label: 'Personal Wallet' },
                  { value: 'Business', label: 'Business Wallet' },
                  { value: 'Corporate', label: 'Corporate Wallet' },
                  { value: 'Merchant', label: 'Merchant Wallet' },
                ]}
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Currency</label>
              <Select
                value={newWalletForm.currency}
                onChange={(val) => setNewWalletForm({ ...newWalletForm, currency: val })}
                className="w-full"
                options={[
                  { value: 'NGN', label: 'NGN (Nigerian Naira)' },
                  { value: 'USD', label: 'USD (US Dollar)' },
                  { value: 'GBP', label: 'GBP (British Pound)' },
                  { value: 'EUR', label: 'EUR (Euro)' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Initial Opening Balance</label>
            <Input
              type="number"
              placeholder="0.00"
              value={newWalletForm.initialBalance}
              onChange={(e) => setNewWalletForm({ ...newWalletForm, initialBalance: Number(e.target.value) })}
            />
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500 text-[11px] leading-relaxed border border-gray-200 dark:border-gray-700">
            <strong>Notice:</strong> Creating a new wallet automatically assigns a dedicated virtual account and links the wallet to the customer&apos;s KYC tier.
          </div>
        </div>
      </Modal>

      {/* --- MODAL 2: EXPORT WALLETS MODAL --- */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <FileSpreadsheet className="text-[#961A1C]" size={20} />
            Export Customer Wallet Dataset
          </div>
        }
        open={isExportModalOpen}
        onCancel={() => setIsExportModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsExportModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="export"
            type="primary"
            onClick={() => {
              message.success('Wallet dataset export started. Report will download automatically.');
              setIsExportModalOpen(false);
            }}
            style={{ backgroundColor: '#961A1C', borderColor: '#961A1C' }}
            className="!bg-[#961A1C] hover:!bg-[#7a1517] !text-white font-semibold"
          >
            Download Export (.xlsx)
          </Button>,
        ]}
        width={480}
        centered
      >
        <div className="py-2 space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Select Date Range</label>
            <RangePicker className="w-full" />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">File Format</label>
            <Select
              defaultValue="xlsx"
              className="w-full"
              options={[
                { value: 'xlsx', label: 'Excel Spreadsheet (.xlsx)' },
                { value: 'csv', label: 'Comma Separated Values (.csv)' },
                { value: 'pdf', label: 'PDF Summary Report (.pdf)' },
              ]}
            />
          </div>

          <div className="pt-2">
            <Checkbox defaultChecked>Include Audit Trail & Virtual Account Details</Checkbox>
          </div>
        </div>
      </Modal>

      {/* --- MODAL 3: ACTION CONFIRMATION MODAL --- */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <AlertTriangle className="text-amber-500" size={20} />
            Confirm Action: {actionTarget?.actionType}
          </div>
        }
        open={isActionModalOpen}
        onCancel={() => setIsActionModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsActionModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger={actionTarget?.actionType.includes('Close') || actionTarget?.actionType.includes('Freeze')}
            loading={isSubmitting}
            onClick={handleConfirmAction}
            className="font-semibold"
          >
            Confirm & Execute
          </Button>,
        ]}
        width={460}
        centered
      >
        {actionTarget && (
          <div className="py-2 space-y-3 text-xs">
            <p className="text-gray-700 dark:text-gray-300">
              You are about to execute <strong>{actionTarget.actionType}</strong> on wallet{' '}
              <strong className="text-[#961A1C]">{actionTarget.wallet.id}</strong> belonging to{' '}
              <strong>{actionTarget.wallet.customerName}</strong>.
            </p>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Reason / Compliance Note <span className="text-red-500">*</span>
              </label>
              <Input.TextArea
                rows={3}
                placeholder="Specify the reason or compliance ticket reference for this administrative action..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

// --- HELPER KPI CARD COMPONENT ---
function KpiCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700/80 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
      <div className="flex items-center justify-between mb-1.5">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight font-sans">{value}</h4>
        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-0.5 truncate">{title}</p>
      </div>
    </div>
  );
}

// --- STATUS BADGE COMPONENT ---
export function StatusBadge({ status }: { status: WalletStatus }) {
  const styles: Record<WalletStatus, { color: string; label: string; icon: React.ReactNode }> = {
    Active: { color: 'success', label: 'Active', icon: <CheckCircle2 size={12} /> },
    Suspended: { color: 'warning', label: 'Suspended', icon: <PauseCircle size={12} /> },
    Dormant: { color: 'default', label: 'Dormant', icon: <Clock size={12} /> },
    Frozen: { color: 'error', label: 'Frozen', icon: <Lock size={12} /> },
    Closed: { color: 'default', label: 'Closed', icon: <XCircle size={12} /> },
  };

  const current = styles[status] || styles.Active;
  return (
    <Tag color={current.color} className="inline-flex items-center gap-1 px-2 py-0.5 font-semibold text-[11px] rounded-md">
      {current.icon}
      {current.label}
    </Tag>
  );
}

// --- STATE BADGE COMPONENT ---
export function StateBadge({ state }: { state: WalletState }) {
  const styles: Record<WalletState, { color: string; label: string }> = {
    Healthy: { color: 'green', label: 'Healthy' },
    'Under Review': { color: 'processing', label: 'Under Review' },
    'Frozen Funds': { color: 'volcano', label: 'Frozen Funds' },
    Restricted: { color: 'warning', label: 'Restricted' },
    'Pending Activation': { color: 'purple', label: 'Pending Activation' },
    'Compliance Hold': { color: 'red', label: 'Compliance Hold' },
    'AML Investigation': { color: 'magenta', label: 'AML Investigation' },
  };

  const current = styles[state] || styles.Healthy;
  return (
    <Tag color={current.color} className="font-medium text-[11px] rounded-md border-none">
      {current.label}
    </Tag>
  );
}
