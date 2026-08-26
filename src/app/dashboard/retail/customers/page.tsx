'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dropdown, MenuProps } from 'antd';
import { 
  Search, Download, ShieldAlert, CheckCircle2, XCircle, Clock, Shield, 
  ChevronLeft, ChevronRight, ArrowUpDown, Plus, MoreVertical, User, 
  DownloadCloud, Mail, Lock, Unlock, Users, TrendingUp, TrendingDown, Edit3, Trash2
} from 'lucide-react';

const mockCustomers = [
  { id: 'CUST-8291', name: 'John Doe', email: 'john.doe@example.com', phone: '+234 801 234 5678', tier: 'Tier 3', balance: '₦450,000', status: 'Active', joined: '12 May 2026', riskScore: 'Low' },
  { id: 'CUST-8292', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+234 802 345 6789', tier: 'Tier 1', balance: '₦12,500', status: 'Pending', joined: '11 Jul 2026', riskScore: 'Medium' },
  { id: 'CUST-8293', name: 'Michael Johnson', email: 'michael.j@example.com', phone: '+234 803 456 7890', tier: 'Tier 2', balance: '₦125,000', status: 'Active', joined: '01 Jun 2026', riskScore: 'Low' },
  { id: 'CUST-8294', name: 'Sarah Williams', email: 'sarah.w@example.com', phone: '+234 804 567 8901', tier: 'Tier 3', balance: '₦2,450,000', status: 'Suspended', joined: '15 Jan 2025', riskScore: 'High' },
  { id: 'CUST-8295', name: 'David Brown', email: 'david.b@example.com', phone: '+234 805 678 9012', tier: 'Tier 1', balance: '₦5,000', status: 'Dormant', joined: '22 Nov 2024', riskScore: 'Low' },
  { id: 'CUST-8296', name: 'Emily Davis', email: 'emily.d@example.com', phone: '+234 806 789 0123', tier: 'Tier 2', balance: '₦85,000', status: 'Active', joined: '04 Mar 2026', riskScore: 'Low' },
  { id: 'CUST-8297', name: 'Daniel Miller', email: 'daniel.m@example.com', phone: '+234 807 890 1234', tier: 'Tier 3', balance: '₦1,120,000', status: 'Active', joined: '30 Aug 2025', riskScore: 'Medium' },
  { id: 'CUST-8298', name: 'Olivia Wilson', email: 'olivia.w@example.com', phone: '+234 808 901 2345', tier: 'Tier 2', balance: '₦45,000', status: 'Active', joined: '18 Feb 2026', riskScore: 'Low' },
];

export default function CustomersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const tabs = ['All', 'Active', 'Pending KYC', 'High Value', 'Dormant', 'Suspended'];

  const filteredCustomers = mockCustomers.filter(customer => {
    if (activeTab === 'Active' && customer.status !== 'Active') return false;
    if (activeTab === 'Pending KYC' && customer.status !== 'Pending') return false;
    if (activeTab === 'High Value' && customer.tier !== 'Tier 3') return false;
    if (activeTab === 'Dormant' && customer.status !== 'Dormant') return false;
    if (activeTab === 'Suspended' && customer.status !== 'Suspended') return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.id.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const toggleSelectCustomer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter(c => c !== id));
    } else {
      setSelectedCustomers([...selectedCustomers, id]);
    }
  };

  const handleRowClick = (id: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      window.open(`/dashboard/retail/customers/${id}`, '_blank');
    } else {
      router.push(`/dashboard/retail/customers/${id}`);
    }
  };

  // REDUCED CONCISE DROPDOWN MENU ITEMS
  const getMenuItems = (customer: any): MenuProps['items'] => [
    {
      key: 'view-profile',
      label: (
        <Link href={`/dashboard/retail/customers/${customer.id}`} className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200 py-0.5">
          <User size={14} className="text-gray-500" /> View Profile
        </Link>
      ),
    },
    {
      key: 'edit-details',
      label: (
        <span className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 py-0.5">
          <Edit3 size={14} className="text-gray-500" /> Edit Details
        </span>
      ),
    },
    {
      key: 'review-kyc',
      label: (
        <span className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 py-0.5">
          <Shield size={14} className="text-gray-500" /> Review KYC
        </span>
      ),
    },
    {
      key: 'freeze-unfreeze',
      label: (
        <span className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 py-0.5">
          {customer.status === 'Active' ? <Lock size={14} className="text-red-500" /> : <Unlock size={14} className="text-emerald-500" />}
          {customer.status === 'Active' ? 'Freeze Account' : 'Unfreeze Account'}
        </span>
      ),
    },
    { type: 'divider' },
    {
      key: 'close-account',
      label: (
        <span className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 py-0.5">
          <Trash2 size={14} /> Close Account
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      
      {/* 1. TOP HEADER & ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Customer Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Directory and real-time status of retail banking customers</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition shadow-2xs">
            <Download size={14} className="text-gray-500" /> Export List
          </button>
        </div>
      </div>

      {/* 2. TOP STATS ROW (STYLING MATCHING IMAGE 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* STAT 1: TOTAL CUSTOMERS */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Users size={14} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">Total Customers</span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">128,540</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={12} />
            <span>+8.4% vs last month</span>
          </div>
        </div>

        {/* STAT 2: ACTIVE CUSTOMERS */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={14} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">Active Accounts</span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">112,400</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={12} />
            <span>+2% active today</span>
          </div>
        </div>

        {/* STAT 3: PENDING KYC */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock size={14} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">Pending KYC</span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">3,820</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            <Clock size={12} />
            <span>126 needs review</span>
          </div>
        </div>

        {/* STAT 4: HIGH VALUE TIER 3 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Shield size={14} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">High Value (T3)</span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">1,250</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={12} />
            <span>+12.3% growth</span>
          </div>
        </div>

        {/* STAT 5: DORMANT ACCOUNTS */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 flex items-center justify-center shrink-0">
              <XCircle size={14} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">Dormant Accounts</span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">8,400</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-rose-500">
            <TrendingDown size={12} />
            <span>-1.4% vs last month</span>
          </div>
        </div>

        {/* STAT 6: SUSPENDED / FLAGGED */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert size={14} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">Suspended</span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">2,670</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-rose-500">
            <ShieldAlert size={12} />
            <span>Action required</span>
          </div>
        </div>

      </div>

      {/* 3. TABLE CONTAINER & TOOLBAR (STRUCTURED EXACTLY LIKE IMAGE 2) */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
        
        {/* Bulk Action Toolbar */}
        {selectedCustomers.length > 0 && (
          <div className="h-12 bg-gray-900 text-white flex items-center justify-between px-4">
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="bg-gray-800 px-2 py-0.5 rounded text-[11px]">{selectedCustomers.length} Selected</span>
              <span>Bulk Customer Actions</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <button className="hover:underline flex items-center gap-1"><DownloadCloud size={14} /> Export</button>
              <button className="hover:underline flex items-center gap-1"><Mail size={14} /> Email</button>
              <button onClick={() => setSelectedCustomers([])} className="ml-2 text-gray-400 hover:text-white">Clear</button>
            </div>
          </div>
        )}

        {/* IMAGE 2 TABLE HEADER: TITLE ON LEFT, SEARCH & TABS ON RIGHT */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/40 dark:bg-gray-900/40">
          
          {/* Left Side: Title */}
          <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            All Customers
          </h2>

          {/* Right Side: Search Input + Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, customers..."
                className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-black dark:focus:border-white transition shadow-2xs"
              />
            </div>

            {/* Filter Tabs / Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead className="bg-gray-50/80 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800">
              <tr className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-black focus:ring-black" 
                  />
                </th>
                <th className="px-4 py-3 font-semibold">
                  <div className="flex items-center gap-1 cursor-pointer">Customer <ArrowUpDown size={12}/></div>
                </th>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Contact Details</th>
                <th className="px-4 py-3 font-semibold">Tier</th>
                <th className="px-4 py-3 font-semibold text-right">Balance</th>
                <th className="px-4 py-3 font-semibold">Risk Score</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Joined Date</th>
                <th className="px-4 py-3 font-semibold text-right w-14"></th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-100 dark:divide-gray-800/60">
              {filteredCustomers.map((customer, i) => (
                <tr 
                  key={i} 
                  onClick={(e) => handleRowClick(customer.id, e)}
                  className={`transition-colors group cursor-pointer ${
                    selectedCustomers.includes(customer.id) 
                      ? 'bg-gray-50 dark:bg-gray-800/40' 
                      : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/40'
                  }`}
                >
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={(e) => toggleSelectCustomer(customer.id, e as any)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 text-black focus:ring-black" 
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-xs">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-[11px]">{customer.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{customer.email}</span>
                      <span className="text-[11px] text-gray-400">{customer.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Shield size={12} className={customer.tier === 'Tier 3' ? 'text-purple-500' : customer.tier === 'Tier 2' ? 'text-blue-500' : 'text-gray-400'} />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{customer.tier}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-right tabular-nums">{customer.balance}</td>
                  <td className="px-4 py-3">
                    <RiskBadge score={customer.riskScore} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={customer.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{customer.joined}</td>
                  
                  {/* Action Menu (Fixed Dropdown Popup Container to Prevent Extra Scrollbar) */}
                  <td className="px-4 py-3 text-right">
                    <Dropdown 
                      menu={{ items: getMenuItems(customer) }} 
                      trigger={['click']}
                      placement="bottomRight"
                      getPopupContainer={() => document.body}
                      destroyPopupOnHide
                    >
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compact Footer / Pagination */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/30">
          <div className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredCustomers.length}</span> of <span className="font-semibold text-gray-900 dark:text-white">{mockCustomers.length}</span> customers
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 text-xs font-semibold text-gray-900 dark:text-white">1</span>
            <button className="p-1 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    Active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    Suspended: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
    Pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
    Dormant: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  }[status] || 'bg-gray-100 text-gray-600 border-gray-200';

  const Icon = {
    Active: CheckCircle2,
    Suspended: ShieldAlert,
    Pending: Clock,
    Dormant: XCircle
  }[status] || XCircle;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${styles}`}>
      <Icon size={10} /> {status}
    </span>
  );
}

function RiskBadge({ score }: { score: string }) {
  const styles = {
    Low: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
    Medium: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
    High: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50',
  }[score] || 'text-gray-600 bg-gray-50';

  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[11px] font-semibold ${styles}`}>
      {score} Risk
    </span>
  );
}
