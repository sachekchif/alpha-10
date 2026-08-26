'use client';

import React, { useState } from 'react';
import { 
  Segmented, Modal, Alert, DatePicker, Select, Checkbox, 
  Table, Tag, Button, Dropdown, MenuProps, Tooltip, Badge, message 
} from 'antd';
import { 
  Users, Wallet, ShieldAlert, MessageSquare, Download, RefreshCw, 
  Search, Filter, MoreHorizontal, ArrowUpRight, CheckCircle2, Clock, 
  XCircle, TrendingUp, AlertTriangle, ChevronRight, FileSpreadsheet, 
  Calendar, Layers, Check, ShieldCheck, Sparkles, Building
} from 'lucide-react';

const { RangePicker } = DatePicker;

// --- MOCK DATA FOR RECENT ACTIVITIES ---
interface ActivityItem {
  key: string;
  id: string;
  user: string;
  email: string;
  activity: string;
  category: 'KYC' | 'Wallet' | 'Investment' | 'Support' | 'Security';
  timestamp: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'In Progress';
}

const mockRecentActivities: ActivityItem[] = [
  {
    key: '1',
    id: 'ACT-9041',
    user: 'Oluwaseun Adeleke',
    email: 'seun.adeleke@gmail.com',
    activity: 'Completed Tier 3 BVN & Address Verification',
    category: 'KYC',
    timestamp: '2 mins ago',
    status: 'Completed',
  },
  {
    key: '2',
    id: 'ACT-9042',
    user: 'Amara Nwosu',
    email: 'amara.nwosu@yahoo.com',
    activity: 'Funded wallet with ₦450,000 via Paystack Direct Debit',
    category: 'Wallet',
    timestamp: '5 mins ago',
    status: 'Completed',
  },
  {
    key: '3',
    id: 'ACT-9043',
    user: 'Babajide Ibrahim',
    email: 'baba.ibrahim@outlook.com',
    activity: 'Subscribed ₦1,200,000 to Alpha Yield High Return Fund',
    category: 'Investment',
    timestamp: '12 mins ago',
    status: 'Completed',
  },
  {
    key: '4',
    id: 'ACT-9044',
    user: 'Chidinma Eze',
    email: 'chidinma.eze@techcorp.ng',
    activity: 'Raised Ticket #4892: Card Transaction Refund Query',
    category: 'Support',
    timestamp: '18 mins ago',
    status: 'In Progress',
  },
  {
    key: '5',
    id: 'ACT-9045',
    user: 'Emeka Okafor',
    email: 'emeka.okafor@gmail.com',
    activity: 'Submitted International Passport for Tier 2 KYC Review',
    category: 'KYC',
    timestamp: '25 mins ago',
    status: 'Pending',
  },
  {
    key: '6',
    id: 'ACT-9046',
    user: 'Fatima Bello',
    email: 'fatima.bello@kpmg.com',
    activity: 'Failed transfer attempt ₦85,000 due to insufficient funds',
    category: 'Wallet',
    timestamp: '32 mins ago',
    status: 'Failed',
  },
  {
    key: '7',
    id: 'ACT-9047',
    user: 'Tunde Bakare',
    email: 'tunde.b@gmail.com',
    activity: 'Activated Flexi Save Daily Interest Plan (₦300,000)',
    category: 'Investment',
    timestamp: '45 mins ago',
    status: 'Completed',
  },
];

// --- MOCK DATA FOR ACTIVE INVESTMENT PRODUCTS ---
interface InvestmentProduct {
  key: string;
  id: string;
  name: string;
  category: string;
  investorsCount: number;
  totalAum: string;
  roi: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  status: 'Active' | 'Hot' | 'Closing Soon';
  logoBgSolid: string;
  icon: React.ReactNode;
}

const mockInvestmentProducts: InvestmentProduct[] = [
  {
    key: '1',
    id: 'PROD-01',
    name: 'Alpha Yield Fixed Lock',
    category: 'Fixed Income',
    investorsCount: 14250,
    totalAum: '₦2.45 Billion',
    roi: '14.5% p.a.',
    riskLevel: 'Low',
    status: 'Hot',
    logoBgSolid: 'bg-[#961A1C]',
    icon: <TrendingUp size={16} className="text-white" />,
  },
  {
    key: '2',
    id: 'PROD-02',
    name: 'Flexi Save Daily Interest',
    category: 'High Yield Savings',
    investorsCount: 52180,
    totalAum: '₦1.85 Billion',
    roi: '11.2% p.a.',
    riskLevel: 'Low',
    status: 'Active',
    logoBgSolid: 'bg-black',
    icon: <Wallet size={16} className="text-white" />,
  },
  {
    key: '3',
    id: 'PROD-03',
    name: 'FGN Treasury Bills Fund',
    category: 'Government Bonds',
    investorsCount: 9420,
    totalAum: '₦4.10 Billion',
    roi: '16.8% p.a.',
    riskLevel: 'Low',
    status: 'Active',
    logoBgSolid: 'bg-emerald-700',
    icon: <Building size={16} className="text-white" />,
  },
  {
    key: '4',
    id: 'PROD-04',
    name: 'Target Wealth Builder',
    category: 'Automated Savings',
    investorsCount: 28900,
    totalAum: '₦780 Million',
    roi: '12.8% p.a.',
    riskLevel: 'Moderate',
    status: 'Active',
    logoBgSolid: 'bg-purple-700',
    icon: <Sparkles size={16} className="text-white" />,
  },
  {
    key: '5',
    id: 'PROD-05',
    name: 'Eurobond Sovereign Notes',
    category: 'USD Investment',
    investorsCount: 3150,
    totalAum: '$6.5 Million',
    roi: '8.5% p.a. ($)',
    riskLevel: 'Moderate',
    status: 'Closing Soon',
    logoBgSolid: 'bg-amber-600',
    icon: <ShieldCheck size={16} className="text-white" />,
  },
];

export default function RetailDashboard() {
  const [timeFilter, setTimeFilter] = useState<string>('Today');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [activitySearch, setActivitySearch] = useState<string>('');
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<string>('All');

  // Export Modal Form State
  const [exportFormat, setExportFormat] = useState<string>('xlsx');
  const [exportModule, setExportModule] = useState<string>('all');
  const [exportStatus, setExportStatus] = useState<string>('all');

  // Handle Export Download Action
  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsExportModalOpen(false);
      message.success('Retail Banking & Support Performance report downloaded successfully!');
    }, 1200);
  };

  // Card Options Dropdown items
  const getCardMenu = (cardTitle: string): MenuProps => ({
    items: [
      { key: '1', label: `View ${cardTitle} Details` },
      { key: '2', label: 'Export Dataset' },
      { key: '3', label: 'Configure Thresholds' },
    ],
  });

  // Filtered Activities
  const filteredActivities = mockRecentActivities.filter((item) => {
    const matchesCategory = activityCategoryFilter === 'All' || item.category === activityCategoryFilter;
    const matchesSearch = 
      item.user.toLowerCase().includes(activitySearch.toLowerCase()) ||
      item.activity.toLowerCase().includes(activitySearch.toLowerCase()) ||
      item.id.toLowerCase().includes(activitySearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Activity Table Columns
  const activityColumns = [
    {
      title: 'User & Activity',
      dataIndex: 'user',
      key: 'user',
      render: (text: string, record: ActivityItem) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-white text-xs">{text}</span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{record.activity}</span>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => {
        let color = 'default';
        if (cat === 'KYC') color = 'purple';
        if (cat === 'Wallet') color = 'default';
        if (cat === 'Investment') color = 'green';
        if (cat === 'Support') color = 'orange';
        if (cat === 'Security') color = 'red';
        return <Tag color={color}>{cat}</Tag>;
      },
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time: string) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{time}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'Completed') return <Tag color="success">Completed</Tag>;
        if (status === 'Pending') return <Tag color="warning">Pending</Tag>;
        if (status === 'In Progress') return <Tag color="processing">In Progress</Tag>;
        return <Tag color="error">Failed</Tag>;
      },
    },
  ];

  // Investment Products Table Columns
  const investmentColumns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: InvestmentProduct) => (
        <div className="flex items-center gap-3">
          {/* Solid Logo Icon Container with ROI Tag Badge on top */}
          <div className="relative shrink-0 my-1">
            <div className={`w-9 h-9 rounded-lg ${record.logoBgSolid} text-white flex items-center justify-center shadow-xs`}>
              {record.icon}
            </div>
            {/* ROI Tag Badge on the icon */}
            <span className="absolute -bottom-1 -right-1.5 bg-black text-white text-[9px] font-bold px-1 py-0.2 rounded-md shadow-xs border border-white dark:border-gray-800 whitespace-nowrap">
              {record.roi}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-900 dark:text-white text-xs">{text}</span>
              {record.status === 'Hot' && <Tag color="magenta">Hot</Tag>}
              {record.status === 'Closing Soon' && <Tag color="volcano">Closing</Tag>}
            </div>
            <span className="text-[11px] text-gray-400">{record.category}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Active Investors',
      dataIndex: 'investorsCount',
      key: 'investorsCount',
      render: (count: number) => (
        <span className="font-medium text-xs text-gray-800 dark:text-gray-200">
          {count.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Total AUM',
      dataIndex: 'totalAum',
      key: 'totalAum',
      render: (aum: string) => (
        <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">
          {aum}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      
      {/* 1. PAGE HEADER & EXTREME RIGHT ANTD FILTER + EXPORT REPORT BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Retail Banking Dashboard</h1>

        {/* EXTREME RIGHT CONTROLS USING ANTD */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Antd Segmented Time Filter */}
          <Segmented
            options={['Today', 'This Week', 'This Month', 'Custom']}
            value={timeFilter}
            onChange={(val) => setTimeFilter(val as string)}
            className="bg-white dark:bg-gray-800 p-0.5 rounded-lg font-medium text-xs border border-gray-200 dark:border-gray-700 shadow-xs"
          />

          {/* Export Report Button bringing up Modal */}
          <Button
            type="primary"
            icon={<Download size={14} />}
            onClick={() => setIsExportModalOpen(true)}
            style={{ backgroundColor: '#000000', color: '#ffffff', borderColor: '#000000' }}
            className="!bg-black hover:!bg-gray-900 !text-white border-none font-semibold text-xs h-9 rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* 2. EXPORT REPORT MODAL (WITH WARNING ALERT & FILTER CONTROLS) */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <FileSpreadsheet className="text-black dark:text-white" size={20} />
            Export System Performance Report
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
            loading={isExporting}
            onClick={handleExport}
            style={{ backgroundColor: '#000000', color: '#ffffff', borderColor: '#000000' }}
            className="!bg-black hover:!bg-gray-900 !text-white border-none font-semibold"
          >
            Download Excel Report
          </Button>,
        ]}
        width={560}
        centered
        className="rounded-2xl overflow-hidden"
      >
        <div className="py-2 space-y-4">
          
          {/* Sleek Modal System Notice (No Icon) */}
          <div className="p-4 rounded-xl bg-gray-900 text-white dark:bg-black border border-gray-800 shadow-xs relative overflow-hidden">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">Notice</span>
              <p className="text-xs text-gray-100 font-medium leading-relaxed">
                This is an excel showing the system status of the retail banking and support performance
              </p>
            </div>
          </div>

          {/* Filter options inside the modal */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Date Range Filter
              </label>
              <RangePicker className="w-full rounded-lg" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Module / Department
                </label>
                <Select
                  value={exportModule}
                  onChange={setExportModule}
                  className="w-full"
                  options={[
                    { value: 'all', label: 'All Modules (Retail + Support)' },
                    { value: 'retail', label: 'Retail Banking Overview' },
                    { value: 'wallets', label: 'Active Wallets & Funding' },
                    { value: 'kyc', label: 'Pending KYC Verifications' },
                    { value: 'support', label: 'Support Ticket Performance' },
                    { value: 'investments', label: 'Active Investment Products' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Record Status Filter
                </label>
                <Select
                  value={exportStatus}
                  onChange={setExportStatus}
                  className="w-full"
                  options={[
                    { value: 'all', label: 'All Record Statuses' },
                    { value: 'completed', label: 'Completed / Active Only' },
                    { value: 'pending', label: 'Pending Action Items' },
                    { value: 'flagged', label: 'Escalated / Failed Items' },
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                File Export Format
              </label>
              <Select
                value={exportFormat}
                onChange={setExportFormat}
                className="w-full"
                options={[
                  { value: 'xlsx', label: 'Excel Spreadsheet (.xlsx) — Recommended' },
                  { value: 'csv', label: 'Comma Separated Values (.csv)' },
                  { value: 'pdf', label: 'Executive PDF Summary (.pdf)' },
                ]}
              />
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Additional Excel Columns to Include
              </label>
              <div className="flex flex-col gap-2">
                <Checkbox defaultChecked className="text-xs">Include Detailed Audit Trail & User IDs</Checkbox>
                <Checkbox defaultChecked className="text-xs">Include Support Resolution SLA Metrics</Checkbox>
                <Checkbox defaultChecked className="text-xs">Include Investment Volume Breakdown</Checkbox>
              </div>
            </div>

          </div>
        </div>
      </Modal>

      {/* 3. THE 4 KPI CARDS (STALED EXACTLY LIKE THE ATTACHED IMAGE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: TOTAL CUSTOMERS */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
          {/* Small bar at middle left of the card in dark red (#961A1C) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-[#961A1C] rounded-r-md" />
          
          {/* Top Row: Trend Badge on Left + Options Menu on Right */}
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-black dark:text-white">
              +28% from the last month
            </span>
            <Dropdown menu={getCardMenu('Total Customers')} trigger={['click']} placement="bottomRight">
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md transition">
                <MoreHorizontal size={18} />
              </button>
            </Dropdown>
          </div>

          {/* Middle: Numeric Display with semibold font weight */}
          <div className="my-3 pl-2">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight font-sans">
              421,818
            </h2>
          </div>

          {/* Bottom Row: Icon + Subtitle text */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pl-2 pt-1 border-t border-gray-50 dark:border-gray-700/40">
            <Users size={15} className="text-gray-400 shrink-0" />
            <span>Delivered to client</span>
          </div>
        </div>

        {/* CARD 2: ACTIVE WALLETS */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
          {/* Small bar at middle left of the card in dark red (#961A1C) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-[#961A1C] rounded-r-md" />
          
          {/* Top Row */}
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-black dark:text-white">
              +17% from the last month
            </span>
            <Dropdown menu={getCardMenu('Active Wallets')} trigger={['click']} placement="bottomRight">
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md transition">
                <MoreHorizontal size={18} />
              </button>
            </Dropdown>
          </div>

          {/* Middle */}
          <div className="my-3 pl-2">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight font-sans">
              391,120
            </h2>
          </div>

          {/* Bottom Row */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pl-2 pt-1 border-t border-gray-50 dark:border-gray-700/40">
            <Wallet size={15} className="text-gray-400 shrink-0" />
            <span>Clicked by client</span>
          </div>
        </div>

        {/* CARD 3: PENDING KYC */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
          {/* Small bar at middle left of the card in dark red (#961A1C) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-[#961A1C] rounded-r-md" />
          
          {/* Top Row */}
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-black dark:text-white">
              +42% from the last month
            </span>
            <Dropdown menu={getCardMenu('Pending KYC')} trigger={['click']} placement="bottomRight">
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md transition">
                <MoreHorizontal size={18} />
              </button>
            </Dropdown>
          </div>

          {/* Middle */}
          <div className="my-3 pl-2">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight font-sans">
              320,121
            </h2>
          </div>

          {/* Bottom Row */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pl-2 pt-1 border-t border-gray-50 dark:border-gray-700/40">
            <ShieldAlert size={15} className="text-gray-400 shrink-0" />
            <span>Client was subscribed</span>
          </div>
        </div>

        {/* CARD 4: SUPPORT TICKETS */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
          {/* Small bar at middle left of the card in dark red (#961A1C) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-[#961A1C] rounded-r-md" />
          
          {/* Top Row */}
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-black dark:text-white">
              -8% from last month
            </span>
            <Dropdown menu={getCardMenu('Support Tickets')} trigger={['click']} placement="bottomRight">
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md transition">
                <MoreHorizontal size={18} />
              </button>
            </Dropdown>
          </div>

          {/* Middle */}
          <div className="my-3 pl-2">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight font-sans">
              1,482
            </h2>
          </div>

          {/* Bottom Row */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pl-2 pt-1 border-t border-gray-50 dark:border-gray-700/40">
            <MessageSquare size={15} className="text-gray-400 shrink-0" />
            <span>Open & escalated tickets</span>
          </div>
        </div>

      </div>

      {/* 4. UNDER CARDS: SIDE-BY-SIDE TABLES (RECENT ACTIVITIES & ACTIVE INVESTMENT PRODUCTS WITH COUNT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: RECENT ACTIVITIES TABLE */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800/90 rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 flex flex-col">
          
          {/* Table Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Activities</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Real-time system, KYC, wallet, and support logs</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#961A1C] w-40 sm:w-48"
                />
              </div>

              <Select
                value={activityCategoryFilter}
                onChange={setActivityCategoryFilter}
                size="small"
                className="w-28 text-xs"
                options={[
                  { value: 'All', label: 'All Types' },
                  { value: 'KYC', label: 'KYC' },
                  { value: 'Wallet', label: 'Wallet' },
                  { value: 'Investment', label: 'Investment' },
                  { value: 'Support', label: 'Support' },
                ]}
              />
            </div>
          </div>

          {/* Ant Design Activity Table */}
          <div className="flex-1 overflow-x-auto">
            <Table
              columns={activityColumns}
              dataSource={filteredActivities}
              pagination={{ pageSize: 5, size: 'small' }}
              size="small"
              className="custom-antd-table text-xs"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE INVESTMENT PRODUCTS TABLE WITH COUNT */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800/90 rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 flex flex-col">
          
          {/* Table Header with Product Count Badge ON TOP of Title */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col gap-1">
              <span className="self-start px-2 py-0.5 rounded-md text-[11px] font-bold bg-black text-white dark:bg-white dark:text-black shadow-xs">
                {mockInvestmentProducts.length} Active Products
              </span>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Active Investment Products</h2>
            </div>

            <Button type="text" size="small" className="text-xs font-semibold text-gray-800 hover:text-black dark:text-gray-200">
              View All
            </Button>
          </div>

          {/* Ant Design Investment Products Table */}
          <div className="flex-1 overflow-x-auto">
            <Table
              columns={investmentColumns}
              dataSource={mockInvestmentProducts}
              pagination={{ pageSize: 5, size: 'small' }}
              size="small"
              className="custom-antd-table text-xs"
            />
          </div>

        </div>

      </div>

    </div>
  );
}
