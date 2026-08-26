'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Select, Modal, Input, Tag, Button, Dropdown, MenuProps, message, Tooltip 
} from 'antd';
import { 
  ArrowDownToLine, ArrowUpFromLine, RefreshCcw, XCircle, Clock, 
  Search, Filter, MoreVertical, Download, Calendar, ChevronRight, CheckCircle2, 
  ShieldAlert, Eye, Plus, ArrowUpRight, ArrowDownRight, RefreshCw, CreditCard,
  Building2, User, FileText, Check, Shield, AlertTriangle, Layers, Laptop, Smartphone,
  Copy, ExternalLink, HelpCircle, RotateCcw
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar 
} from 'recharts';

// --- TYPES ---
export type TransactionType = 'Deposit' | 'Withdrawal' | 'Transfer' | 'Bill Payment' | 'Card POS' | 'Yield Payout';
export type TransactionStatus = 'Completed' | 'Pending' | 'Failed' | 'Reversed';
export type ChannelType = 'Mobile App' | 'Web App' | 'Virtual Card' | 'POS Terminal' | 'API Engine';
export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR';

export interface TransactionRecord {
  id: string;
  sessionRef: string;
  customerName: string;
  customerId: string;
  accountNumber: string;
  type: TransactionType;
  direction: 'Credit' | 'Debit';
  amount: number;
  fee: number;
  currency: Currency;
  channel: ChannelType;
  status: TransactionStatus;
  counterparty: string;
  bankName: string;
  date: string;
  time: string;
  narration: string;
}

// --- BADGE COMPONENTS ---
export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const styles: Record<TransactionStatus, { bg: string; text: string; border: string }> = {
    'Completed': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200/60 dark:border-emerald-800/50' },
    'Pending': { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200/60 dark:border-amber-800/50' },
    'Failed': { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', border: 'border-red-200/60 dark:border-red-800/50' },
    'Reversed': { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200/60 dark:border-purple-800/50' },
  };

  const style = styles[status] || styles['Completed'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

// --- MOCK TRANSACTIONS ---
const mockTransactions: TransactionRecord[] = [
  {
    id: 'TXN-998123',
    sessionRef: 'NIBSS-901823746102',
    customerName: 'Oluwaseun Adeleke',
    customerId: 'CUST-8291',
    accountNumber: '0123456789',
    type: 'Deposit',
    direction: 'Credit',
    amount: 50000.00,
    fee: 0.00,
    currency: 'NGN',
    channel: 'Web App',
    status: 'Completed',
    counterparty: 'Alpha 10 Direct Funding',
    bankName: 'Alpha 10 Bank',
    date: '29 Jul 2026',
    time: '14:32 PM',
    narration: 'Paystack Card Direct Deposit into Savings Account',
  },
  {
    id: 'TXN-998124',
    sessionRef: 'NIBSS-901823746103',
    customerName: 'Jane Smith',
    customerId: 'CUST-8292',
    accountNumber: '0123456790',
    type: 'Withdrawal',
    direction: 'Debit',
    amount: 12500.00,
    fee: 50.00,
    currency: 'NGN',
    channel: 'Mobile App',
    status: 'Completed',
    counterparty: 'ATM Cash Withdrawal (VI Branch)',
    bankName: 'Alpha 10 Bank',
    date: '29 Jul 2026',
    time: '14:15 PM',
    narration: 'Self ATM Cash Withdrawal Victoria Island',
  },
  {
    id: 'TXN-998125',
    sessionRef: 'NIBSS-901823746104',
    customerName: 'Michael Johnson',
    customerId: 'CUST-8293',
    accountNumber: '0123456791',
    type: 'Transfer',
    direction: 'Debit',
    amount: 125000.00,
    fee: 10.00,
    currency: 'NGN',
    channel: 'Mobile App',
    status: 'Pending',
    counterparty: 'Chidinma Eze (Alpha 10)',
    bankName: 'Alpha 10 Bank',
    date: '29 Jul 2026',
    time: '13:45 PM',
    narration: 'Interbank Transfer for Consulting Services',
  },
  {
    id: 'TXN-998126',
    sessionRef: 'NIBSS-901823746105',
    customerName: 'Sarah Williams',
    customerId: 'CUST-8294',
    accountNumber: '0123456792',
    type: 'Yield Payout',
    direction: 'Credit',
    amount: 2450000.00,
    fee: 0.00,
    currency: 'NGN',
    channel: 'API Engine',
    status: 'Completed',
    counterparty: 'Alpha 10 Treasury Engine',
    bankName: 'Alpha 10 Bank',
    date: '29 Jul 2026',
    time: '12:30 PM',
    narration: 'Quarterly Fixed Deposit Interest Yield Credit',
  },
  {
    id: 'TXN-998127',
    sessionRef: 'NIBSS-901823746106',
    customerName: 'David Brown',
    customerId: 'CUST-8295',
    accountNumber: '0123456793',
    type: 'Bill Payment',
    direction: 'Debit',
    amount: 5000.00,
    fee: 0.00,
    currency: 'NGN',
    channel: 'Mobile App',
    status: 'Failed',
    counterparty: 'IKEDC Electricity Prepaid',
    bankName: 'Alpha 10 Bank',
    date: '29 Jul 2026',
    time: '11:20 AM',
    narration: 'Prepaid Utility Token Purchase Timeout',
  },
  {
    id: 'TXN-998128',
    sessionRef: 'NIBSS-901823746107',
    customerName: 'Emily Davis',
    customerId: 'CUST-8296',
    accountNumber: '0123456794',
    type: 'Transfer',
    direction: 'Credit',
    amount: 85000.00,
    fee: 0.00,
    currency: 'NGN',
    channel: 'Web App',
    status: 'Completed',
    counterparty: 'TechCorp Ltd (Alpha 10)',
    bankName: 'Alpha 10 Bank',
    date: '29 Jul 2026',
    time: '10:05 AM',
    narration: 'Vendor Payment for Graphic Design Retainer',
  },
  {
    id: 'TXN-998129',
    sessionRef: 'NIBSS-901823746108',
    customerName: 'Daniel Miller',
    customerId: 'CUST-8297',
    accountNumber: '0123456795',
    type: 'Card POS',
    direction: 'Debit',
    amount: 10000.00,
    fee: 50.00,
    currency: 'NGN',
    channel: 'Virtual Card',
    status: 'Reversed',
    counterparty: 'Shoprite Lekki Terminal 02',
    bankName: 'Alpha 10 Bank',
    date: '29 Jul 2026',
    time: '09:15 AM',
    narration: 'POS Merchant Purchase Duplicate Reversal',
  },
];

// RECHARTS COLOR PALETTES
const TYPE_COLORS = {
  Deposit: '#10B981',
  Withdrawal: '#3B82F6',
  Transfer: '#8B5CF6',
  'Bill Payment': '#F59E0B',
  'Card POS': '#EC4899',
  'Yield Payout': '#961A1C',
};

// HOURLY TREND DATA
const trendDataMap = {
  Today: [
    { time: '08:00', volume: 1.2 },
    { time: '10:00', volume: 2.8 },
    { time: '12:00', volume: 3.9 },
    { time: '14:00', volume: 4.85 },
    { time: '16:00', volume: 4.2 },
    { time: '18:00', volume: 3.1 },
  ],
  '7 Days': [
    { time: 'Mon', volume: 22.4 },
    { time: 'Tue', volume: 28.1 },
    { time: 'Wed', volume: 31.5 },
    { time: 'Thu', volume: 29.8 },
    { time: 'Fri', volume: 34.2 },
    { time: 'Sat', volume: 18.9 },
    { time: 'Sun', volume: 14.5 },
  ],
  '30 Days': [
    { time: 'Wk 1', volume: 110.5 },
    { time: 'Wk 2', volume: 125.8 },
    { time: 'Wk 3', volume: 142.1 },
    { time: 'Wk 4', volume: 135.4 },
  ],
  '12 Months': [
    { time: 'Jan', volume: 450 },
    { time: 'Feb', volume: 510 },
    { time: 'Mar', volume: 580 },
    { time: 'Apr', volume: 620 },
    { time: 'May', volume: 710 },
    { time: 'Jun', volume: 790 },
    { time: 'Jul', volume: 850 },
  ],
};

export default function TransactionsDirectoryPage() {
  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedChannel, setSelectedChannel] = useState<string>('All');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [trendPeriod, setTrendPeriod] = useState<'Today' | '7 Days' | '30 Days' | '12 Months'>('Today');

  // Modals State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<TransactionRecord | null>(null);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((txn) => {
      // Search
      const matchesSearch = 
        txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.sessionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.accountNumber.includes(searchQuery) ||
        txn.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.narration.toLowerCase().includes(searchQuery.toLowerCase());

      // Dropdowns
      const matchesType = selectedType === 'All' || txn.type === selectedType;
      const matchesStatus = selectedStatus === 'All' || txn.status === selectedStatus;
      const matchesChannel = selectedChannel === 'All' || txn.channel === selectedChannel;
      const matchesCurrency = selectedCurrency === 'All' || txn.currency === selectedCurrency;

      return matchesSearch && matchesType && matchesStatus && matchesChannel && matchesCurrency;
    }).sort((a, b) => {
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      if (sortBy === 'name-asc') return a.customerName.localeCompare(b.customerName);
      return 0; // default date-desc
    });
  }, [searchQuery, selectedType, selectedStatus, selectedChannel, selectedCurrency, sortBy]);

  // Action Dropdown Menu
  const getActionMenu = (record: TransactionRecord): MenuProps => ({
    items: [
      {
        key: 'details',
        label: (
          <span className="flex items-center gap-2 text-xs font-semibold text-[#961A1C]">
            <Eye size={14} /> View Transaction Details
          </span>
        ),
        onClick: () => {
          setSelectedTxn(record);
          setDetailsModalOpen(true);
        },
      },
      {
        key: 'customer',
        label: (
          <Link href={`/dashboard/retail/customers/${record.customerId}`} className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <User size={14} /> View Customer Profile
          </Link>
        ),
      },
      {
        key: 'requery',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-blue-600">
            <RefreshCw size={14} /> Requery NIBSS Status
          </span>
        ),
        onClick: () => message.info(`Requerying NIBSS switch status for ${record.id}...`),
      },
      {
        key: 'receipt',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Download size={14} /> Download Receipt (.pdf)
          </span>
        ),
        onClick: () => message.info(`Generating official receipt for ${record.id}...`),
      },
      {
        key: 'flag',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-amber-600">
            <ShieldAlert size={14} /> Flag for Fraud Review
          </span>
        ),
        onClick: () => message.warning(`Transaction ${record.id} flagged for compliance review.`),
      },
      { type: 'divider' },
      {
        key: 'reverse',
        label: (
          <span className="flex items-center gap-2 text-xs font-semibold text-red-600">
            <RotateCcw size={14} /> Initiate Reversal
          </span>
        ),
        onClick: () => message.warning(`Reversal request submitted for ${record.id}`),
      },
    ],
  });

  return (
    <div className="space-y-6 pb-16 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Transactions Directory
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor, audit, and manage all retail banking transactions across the platform.
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-1.5 shadow-2xs"
          >
            <Download size={14} /> Export Directory
          </button>
          <button
            onClick={() => message.info('Manual transaction entry modal...')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} /> New Transaction
          </button>
        </div>
      </div>

      {/* 2. CONSOLIDATED HIGH-SIGNAL METRIC CARDS (4 CARDS WITH CENTERED ACCENT BAR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: TOTAL VOLUME & COUNT */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-[#961A1C] rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Volume (24h)</span>
            <Tag color="volcano" className="!bg-[#961A1C]/10 !text-[#961A1C] !border-none font-semibold text-[10px] m-0">24h Ledger</Tag>
          </div>
          <div className="my-2.5 pl-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">₦4.85B</h2>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pl-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <span>Volume Count: <strong className="text-gray-800 dark:text-gray-200">44,677 Trx</strong></span>
            <span className="text-[11px] text-emerald-600 font-semibold">+14.2%</span>
          </div>
        </div>

        {/* CARD 2: SUCCESSFUL TRANSACTIONS */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-emerald-500 rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Successful Transactions</span>
            <Tag color="emerald" className="font-semibold text-[10px] m-0">Settled</Tag>
          </div>
          <div className="my-2.5 pl-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">42,105</h2>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pl-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <span>Settled Value: <strong className="text-emerald-600">₦4.52B</strong></span>
            <span className="text-[11px] text-emerald-600 font-semibold">94.2% Success</span>
          </div>
        </div>

        {/* CARD 3: PENDING & IN-FLIGHT */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-amber-500 rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Pending & In-Flight</span>
            <Tag color="amber" className="font-semibold text-[10px] m-0">Processing</Tag>
          </div>
          <div className="my-2.5 pl-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">2,120</h2>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pl-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <span>Pending Value: <strong className="text-amber-600">₦280.4M</strong></span>
            <span className="text-[11px] text-gray-400">Avg 1.2s Queue</span>
          </div>
        </div>

        {/* CARD 4: FAILED & REVERSED */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-gray-400 rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Failed / Reversed</span>
            <Tag color="default" className="font-semibold text-[10px] m-0">Exceptions</Tag>
          </div>
          <div className="my-2.5 pl-2 flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">452</h2>
            <span className="text-sm font-bold text-red-500">(₦48.2M)</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pl-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <span>Failure Rate: <strong className="text-gray-800 dark:text-gray-200">0.98%</strong></span>
            <span className="text-[11px] text-purple-600 font-semibold">120 Reversed</span>
          </div>
        </div>

      </div>

      {/* 3. MAIN DIRECTORY TABLE & FILTERS */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs space-y-4 p-5">
        
        {/* Search & Sort Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search by Reference ID, Session Ref, Customer Name, Account No, Counterparty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-4 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Sort By:</span>
            <Select
              value={sortBy}
              onChange={setSortBy}
              size="small"
              className="w-44 text-xs"
              options={[
                { value: 'date-desc', label: 'Newest First' },
                { value: 'amount-desc', label: 'Highest Amount' },
                { value: 'amount-asc', label: 'Lowest Amount' },
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

          {/* Type Filter */}
          <Select
            value={selectedType}
            onChange={setSelectedType}
            size="small"
            className="w-36"
            options={[
              { value: 'All', label: 'All Categories' },
              { value: 'Deposit', label: 'Deposit' },
              { value: 'Withdrawal', label: 'Withdrawal' },
              { value: 'Transfer', label: 'Transfer' },
              { value: 'Bill Payment', label: 'Bill Payment' },
              { value: 'Card POS', label: 'Card POS' },
              { value: 'Yield Payout', label: 'Yield Payout' },
            ]}
          />

          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            size="small"
            className="w-32"
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Failed', label: 'Failed' },
              { value: 'Reversed', label: 'Reversed' },
            ]}
          />

          {/* Channel Filter */}
          <Select
            value={selectedChannel}
            onChange={setSelectedChannel}
            size="small"
            className="w-32"
            options={[
              { value: 'All', label: 'All Channels' },
              { value: 'Mobile App', label: 'Mobile App' },
              { value: 'Web App', label: 'Web App' },
              { value: 'Virtual Card', label: 'Virtual Card' },
              { value: 'POS Terminal', label: 'POS Terminal' },
              { value: 'API Engine', label: 'API Engine' },
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

          {(selectedType !== 'All' || selectedStatus !== 'All' || selectedChannel !== 'All' || selectedCurrency !== 'All' || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedType('All');
                setSelectedStatus('All');
                setSelectedChannel('All');
                setSelectedCurrency('All');
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
          {filteredTransactions.length === 0 ? (
            /* EMPTY STATE */
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                <Search size={22} />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No transactions match your filters</h3>
              <p className="text-xs text-gray-500 max-w-sm">
                Adjust your search parameters, category, status, channel or currency filters to inspect transactions.
              </p>
              <Button
                onClick={() => {
                  setSelectedType('All');
                  setSelectedStatus('All');
                  setSelectedChannel('All');
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
                  <th className="px-4 py-3">Reference ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Fee</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Counterparty</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredTransactions.map((txn) => {
                  const sym = txn.currency === 'USD' ? '$' : txn.currency === 'GBP' ? '£' : txn.currency === 'EUR' ? '€' : '₦';
                  return (
                    <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setSelectedTxn(txn);
                            setDetailsModalOpen(true);
                          }}
                          className="font-mono font-bold text-[#961A1C] hover:underline flex items-center gap-1"
                        >
                          {txn.id}
                        </button>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <Link
                            href={`/dashboard/retail/customers/${txn.customerId}`}
                            className="font-bold text-gray-900 dark:text-white hover:underline"
                          >
                            {txn.customerName}
                          </Link>
                          <span className="text-[11px] text-gray-400 font-mono">{txn.accountNumber}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Tag color="purple" className="font-semibold text-[10px] rounded-md">
                          {txn.type}
                        </Tag>
                      </td>

                      <td className={`px-4 py-3 font-bold ${txn.direction === 'Credit' ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                        {txn.direction === 'Credit' ? '+' : '-'}{sym}{txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {sym}{txn.fee.toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {txn.channel}
                      </td>

                      <td className="px-4 py-3">
                        <TransactionStatusBadge status={txn.status} />
                      </td>

                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {txn.counterparty}
                      </td>

                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {txn.date}, {txn.time}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Dropdown menu={getActionMenu(txn)} trigger={['click']} placement="bottomRight">
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

      {/* --- TRANSACTION DETAILS MODAL --- */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
            <CreditCard size={20} className="text-[#961A1C]" />
            Transaction Details: {selectedTxn?.id}
          </div>
        }
        open={detailsModalOpen}
        onCancel={() => setDetailsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="receipt"
            type="primary"
            icon={<Download size={14} />}
            onClick={() => {
              message.success(`Receipt for ${selectedTxn?.id} generated successfully.`);
            }}
            style={{ backgroundColor: '#961A1C', borderColor: '#961A1C' }}
          >
            Download Receipt
          </Button>,
        ]}
        width={540}
        centered
      >
        {selectedTxn && (
          <div className="py-2 space-y-4 text-xs">
            {/* Amount Banner */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl flex items-center justify-between border border-gray-100 dark:border-gray-700">
              <div>
                <span className="text-[11px] text-gray-500 font-semibold block uppercase">Transaction Amount</span>
                <span className={`text-2xl font-bold font-mono ${selectedTxn.direction === 'Credit' ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                  {selectedTxn.direction === 'Credit' ? '+' : '-'}₦{selectedTxn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <TransactionStatusBadge status={selectedTxn.status} />
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <DetailItem label="Reference ID" value={<span className="font-mono font-bold text-[#961A1C]">{selectedTxn.id}</span>} />
              <DetailItem label="NIBSS Session Ref" value={<span className="font-mono text-gray-700 dark:text-gray-300">{selectedTxn.sessionRef}</span>} />
              <DetailItem label="Customer" value={<Link href={`/dashboard/retail/customers/${selectedTxn.customerId}`} className="font-bold hover:underline">{selectedTxn.customerName}</Link>} />
              <DetailItem label="Account Number" value={<span className="font-mono">{selectedTxn.accountNumber}</span>} />
              <DetailItem label="Category" value={selectedTxn.type} />
              <DetailItem label="Direction" value={selectedTxn.direction} />
              <DetailItem label="Fee Charged" value={`₦${selectedTxn.fee.toFixed(2)}`} />
              <DetailItem label="Channel" value={selectedTxn.channel} />
              <DetailItem label="Counterparty" value={selectedTxn.counterparty} />
              <DetailItem label="Beneficiary Bank" value={selectedTxn.bankName} />
              <DetailItem label="Date & Time" value={`${selectedTxn.date} at ${selectedTxn.time}`} />
              <DetailItem label="Currency" value={`${selectedTxn.currency} (NGN)`} />
            </div>

            {/* Narration */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl space-y-1 border border-gray-100 dark:border-gray-700">
              <span className="text-[11px] font-semibold text-gray-500 block">Bank Narration / Remarks</span>
              <p className="text-xs font-mono text-gray-800 dark:text-gray-200">{selectedTxn.narration}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* --- EXPORT MODAL --- */}
      <Modal
        title="Export Transactions Directory"
        open={exportModalOpen}
        onCancel={() => setExportModalOpen(false)}
        onOk={() => {
          message.success('Exporting transactions directory (.xlsx)...');
          setExportModalOpen(false);
        }}
        okText="Download CSV / Excel"
        okButtonProps={{ style: { backgroundColor: '#961A1C', borderColor: '#961A1C' } }}
        width={420}
        centered
      >
        <div className="py-2 space-y-3 text-xs">
          <p className="text-gray-600 dark:text-gray-300">
            Export filtered retail transactions directory records for auditing or accounting reporting.
          </p>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1 font-mono text-[11px]">
            <div>Total Records: <strong>{filteredTransactions.length} Transactions</strong></div>
            <div>Format: <strong>Excel (.xlsx) / CSV</strong></div>
          </div>
        </div>
      </Modal>

    </div>
  );
}

// --- HELPER DETAIL ITEM ---
function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col space-y-0.5">
      <span className="text-[11px] text-gray-400 font-medium">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
