'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Dropdown, Drawer, MenuProps } from 'antd';
import { 
  FileText, CheckCircle2, XCircle, Clock, Search, Filter, 
  MoreVertical, Eye, FileUp, AlertTriangle, ChevronRight, ChevronLeft,
  ShieldCheck, ShieldAlert, UserCheck, MapPin, Download, Plus, ArrowUpDown,
  X, Check, Lock, Shield, User, FileCheck, RefreshCw, Send
} from 'lucide-react';

const mockKycRequests = [
  { id: 'KYC-1092', name: 'John Doe', customerId: 'CUST-8291', type: 'Tier 2 Upgrade', docType: 'NIN Document', submitted: '2 hours ago', status: 'Pending', risk: 'Low', score: '98.4%', selfieMatch: 'Pass (98.4%)', address: '14 Adeola Odeku St, VI, Lagos' },
  { id: 'KYC-1093', name: 'Jane Smith', customerId: 'CUST-8292', type: 'Identity Verification', docType: 'International Passport', submitted: '3 hours ago', status: 'Pending', risk: 'Medium', score: '94.1%', selfieMatch: 'Pass (94.1%)', address: '8 Ikeja GRA, Lagos' },
  { id: 'KYC-1094', name: 'Michael Johnson', customerId: 'CUST-8293', type: 'Address Proof', docType: 'Utility Bill (LWC)', submitted: '5 hours ago', status: 'Approved', risk: 'Low', score: '99.0%', selfieMatch: 'Pass (99.0%)', address: '42 Marina Rd, Lagos Island' },
  { id: 'KYC-1095', name: 'Sarah Williams', customerId: 'CUST-8294', type: 'Liveness & Selfie', docType: 'PVC Voters Card', submitted: '1 day ago', status: 'Rejected', risk: 'High', score: '62.0%', selfieMatch: 'Fail (Unclear Face)', address: '12 Lekki Phase 1, Lagos' },
  { id: 'KYC-1096', name: 'David Brown', customerId: 'CUST-8295', type: 'Tier 2 Upgrade', docType: 'NIN Document', submitted: '2 days ago', status: 'Manual Review', risk: 'Medium', score: '88.5%', selfieMatch: 'Pass (88.5%)', address: '55 Allen Ave, Ikeja, Lagos' },
  { id: 'KYC-1097', name: 'Emily Davis', customerId: 'CUST-8296', type: 'Identity Verification', docType: 'International Passport', submitted: '2 days ago', status: 'Pending', risk: 'Low', score: '97.8%', selfieMatch: 'Pass (97.8%)', address: '19 Bodija Estate, Ibadan' },
  { id: 'KYC-1098', name: 'Daniel Miller', customerId: 'CUST-8297', type: 'Tier 2 Upgrade', docType: 'NIN Document', submitted: '3 days ago', status: 'Approved', risk: 'Low', score: '99.5%', selfieMatch: 'Pass (99.5%)', address: '3 Trans Amadi, Port Harcourt' },
];

export default function KycPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState<any>(null);

  const tabs = ['All', 'Pending Review', 'Tier 2 Upgrades', 'Manual Review', 'Approved', 'Rejected'];

  const filteredRequests = mockKycRequests.filter(req => {
    if (activeTab === 'Pending Review' && req.status !== 'Pending') return false;
    if (activeTab === 'Tier 2 Upgrades' && req.type !== 'Tier 2 Upgrade') return false;
    if (activeTab === 'Manual Review' && req.status !== 'Manual Review') return false;
    if (activeTab === 'Approved' && req.status !== 'Approved') return false;
    if (activeTab === 'Rejected' && req.status !== 'Rejected') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        req.name.toLowerCase().includes(q) ||
        req.id.toLowerCase().includes(q) ||
        req.customerId.toLowerCase().includes(q) ||
        req.docType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openReviewDrawer = (kycItem: any) => {
    setSelectedKyc(kycItem);
    setDrawerOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length && filteredRequests.length > 0) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(r => r.id));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedRequests.includes(id)) {
      setSelectedRequests(selectedRequests.filter(item => item !== id));
    } else {
      setSelectedRequests([...selectedRequests, id]);
    }
  };

  // Streamlined Antd Dropdown Menu Items
  const getMenuItems = (req: any): MenuProps['items'] => [
    {
      key: 'review',
      label: (
        <span onClick={() => openReviewDrawer(req)} className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200 py-0.5">
          <Eye size={14} className="text-gray-500" /> Review Verification File
        </span>
      ),
    },
    {
      key: 'view-profile',
      label: (
        <Link href={`/dashboard/retail/customers/${req.customerId}`} className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 py-0.5">
          <User size={14} className="text-gray-500" /> View Customer Profile
        </Link>
      ),
    },
    {
      key: 'approve',
      label: (
        <span className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 py-0.5">
          <CheckCircle2 size={14} /> Approve Verification
        </span>
      ),
    },
    {
      key: 'flag-manual',
      label: (
        <span className="flex items-center gap-2 text-xs font-medium text-purple-600 dark:text-purple-400 py-0.5">
          <AlertTriangle size={14} /> Send to Manual Review
        </span>
      ),
    },
    { type: 'divider' },
    {
      key: 'reject',
      label: (
        <span className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 py-0.5">
          <XCircle size={14} /> Reject Request
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      
      {/* 1. TOP HEADER & ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">KYC & Identity Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Audit, verify, and approve customer identity and Tier 2 upgrade submissions</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition shadow-2xs">
            <Download size={14} className="text-gray-500" /> Export Audit Trail
          </button>
        </div>
      </div>

      {/* 2. TOP STATS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* STAT 1: TOTAL REQUESTS (MOVED TO START) */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center shrink-0">
              <FileCheck size={14} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">Total Requests</span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">4,820</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-purple-600 dark:text-purple-400">
            <FileCheck size={12} />
            <span>+8.4% vs last month</span>
          </div>
        </div>

        {/* STAT 2: PENDING REVIEW */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock size={14} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">Pending Review</span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">142</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            <Clock size={12} />
            <span>+12 submitted today</span>
          </div>
        </div>

        {/* STAT 3: TIER 2 UPGRADES */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={14} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">Tier 2 Requests</span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">89</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={12} />
            <span>+15% growth</span>
          </div>
        </div>

        {/* STAT 4: LIVENESS & SELFIE CHECKS */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <UserCheck size={14} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">Selfie Liveness</span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">230</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <UserCheck size={12} />
            <span>98.2% auto-pass</span>
          </div>
        </div>

        {/* STAT 5: APPROVED TODAY */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={14} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">Approved Today</span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">85</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={12} />
            <span>+15% vs yesterday</span>
          </div>
        </div>

        {/* STAT 6: REJECTED / FLAGGED */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert size={14} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">Rejected Today</span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">12</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-rose-500">
            <ShieldAlert size={12} />
            <span>-2% vs yesterday</span>
          </div>
        </div>

      </div>

      {/* 3. TABLE CONTAINER & TOOLBAR (STRUCTURED EXACTLY LIKE CUSTOMERS PAGE / IMAGE 2) */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
        
        {/* Bulk Action Toolbar */}
        {selectedRequests.length > 0 && (
          <div className="h-12 bg-gray-900 text-white flex items-center justify-between px-4">
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="bg-gray-800 px-2 py-0.5 rounded text-[11px]">{selectedRequests.length} Selected</span>
              <span>Bulk KYC Actions</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <button className="hover:underline flex items-center gap-1"><CheckCircle2 size={14} /> Bulk Approve</button>
              <button className="hover:underline flex items-center gap-1 text-red-400"><XCircle size={14} /> Bulk Reject</button>
              <button onClick={() => setSelectedRequests([])} className="ml-2 text-gray-400 hover:text-white">Clear</button>
            </div>
          </div>
        )}

        {/* IMAGE 2 TABLE HEADER: TITLE ON LEFT, SEARCH & TABS ON RIGHT */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/40 dark:bg-gray-900/40">
          
          {/* Left Side: Title */}
          <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            KYC Verification Queue
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
                placeholder="Search name, ID, or doc..."
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
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[850px]">
            <thead className="bg-gray-50/80 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800">
              <tr className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-black focus:ring-black" 
                  />
                </th>
                <th className="px-4 py-3 font-semibold">Request ID</th>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">Verification Type</th>
                <th className="px-4 py-3 font-semibold">Document Uploaded</th>
                <th className="px-4 py-3 font-semibold">Selfie Match</th>
                <th className="px-4 py-3 font-semibold">Risk Score</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-100 dark:divide-gray-800/60">
              {filteredRequests.map((req, i) => (
                <tr 
                  key={i} 
                  onClick={() => openReviewDrawer(req)}
                  className={`transition-colors group cursor-pointer ${
                    selectedRequests.includes(req.id) 
                      ? 'bg-gray-50 dark:bg-gray-800/40' 
                      : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/40'
                  }`}
                >
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      checked={selectedRequests.includes(req.id)}
                      onChange={(e) => toggleSelect(req.id, e as any)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 text-black focus:ring-black" 
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400 text-[11px] font-semibold">{req.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-xs">
                        {req.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">{req.name}</span>
                        <span className="text-[11px] text-gray-400 font-mono">{req.customerId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{req.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
                      <FileText size={13} className="text-gray-400" />
                      <span>{req.docType}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                      req.selfieMatch.startsWith('Pass') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {req.selfieMatch.startsWith('Pass') ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {req.selfieMatch}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge score={req.risk} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={req.status} />
                  </td>
                  
                  {/* Action Menu (Fixed Dropdown Popup Container) */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => openReviewDrawer(req)}
                        className="bg-black hover:bg-gray-800 text-white px-2.5 py-1 rounded-md text-xs font-semibold transition"
                      >
                        Review
                      </button>
                      
                      <Dropdown 
                        menu={{ items: getMenuItems(req) }} 
                        trigger={['click']}
                        placement="bottomRight"
                        getPopupContainer={() => document.body}
                        destroyPopupOnHide
                      >
                        <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                          <MoreVertical size={16} />
                        </button>
                      </Dropdown>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compact Footer / Pagination */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/30">
          <div className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredRequests.length}</span> of <span className="font-semibold text-gray-900 dark:text-white">{mockKycRequests.length}</span> requests
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

      {/* COMPREHENSIVE TIER 2 KYC VERIFICATION AUDIT DRAWER (DERIVED FROM MOBILE APP FLOW) */}
      <Drawer
        title={
          <div className="flex items-center justify-between w-full pr-4">
            <span className="text-sm font-bold text-gray-900 dark:text-white">KYC Verification Audit File</span>
            <span className="text-xs font-mono font-semibold text-gray-400">{selectedKyc?.id}</span>
          </div>
        }
        placement="right"
        width={560}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        extra={
          <button 
            onClick={() => setDrawerOpen(false)}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        }
      >
        {selectedKyc && (
          <div className="space-y-6 text-xs text-gray-700 dark:text-gray-300">
            
            {/* Applicant Summary Banner */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-black text-white font-bold flex items-center justify-center text-lg">
                  {selectedKyc.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">{selectedKyc.name}</h3>
                  <div className="text-[11px] text-gray-500 font-mono">ID: {selectedKyc.customerId} • Submitted {selectedKyc.submitted}</div>
                </div>
              </div>
              <StatusBadge status={selectedKyc.status} />
            </div>

            {/* Mobile App Tier 2 Upgrade Details */}
            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
              <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-gray-400" /> Tier 2 Account Upgrade Details
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-[11px] text-gray-400">Current Tier</span>
                  <div className="font-bold text-gray-900 dark:text-white mt-0.5">Tier 1 (₦50,000 Limit)</div>
                </div>
                <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-[11px] text-gray-400">Requested Upgrade</span>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Tier 2 (₦500,000 Limit)</div>
                </div>
              </div>
            </div>

            {/* Liveness Check & Selfie Verification Box */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <UserCheck size={14} className="text-gray-400" /> Mobile Liveness Selfie Verification Check
              </h4>
              
              <div className="grid grid-cols-2 gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/40 dark:bg-gray-800/40">
                
                {/* Captured Selfie Box */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-xl text-gray-600 dark:text-gray-300 border-2 border-emerald-500 overflow-hidden relative">
                    {/* Simulated captured image container */}
                    <User size={42} className="text-gray-400" />
                    <span className="absolute bottom-1 right-1 bg-emerald-500 text-white p-0.5 rounded-full">
                      <Check size={10} />
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 mt-2">Captured Mobile Selfie</span>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">Liveness Check: PASSED</span>
                </div>

                {/* Match Score & Details */}
                <div className="space-y-2 flex flex-col justify-center">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60">
                    <div className="text-[10px] font-semibold uppercase">Face Match Score</div>
                    <div className="text-base font-bold">{selectedKyc.score}</div>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Selfie vs Government ID Face Embedding: <span className="font-semibold text-emerald-600">High Confidence Match</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Document Upload Details */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileCheck size={14} className="text-gray-400" /> Uploaded Government Identification
              </h4>

              <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span className="text-gray-500">Document Type</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedKyc.docType}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span className="text-gray-500">Document Number</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">12345678901</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span className="text-gray-500">Verified Address</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedKyc.address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Mobile Terms Consent</span>
                  <span className="font-semibold text-emerald-600">Accepted on App</span>
                </div>
              </div>

              {/* Document Image Preview Box */}
              <div className="h-36 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center p-4">
                <FileText size={32} className="text-gray-400 mb-1.5" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedKyc.docType} High-Res Document File</span>
                <span className="text-[11px] text-gray-400 mt-0.5">Encrypted Image File (PNG/PDF)</span>
              </div>
            </div>

            {/* Compliance Action Buttons */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2">
                <button className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm">
                  <CheckCircle2 size={14} /> Approve Tier 2 Upgrade
                </button>
                <button className="py-2.5 px-4 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 text-xs font-semibold rounded-lg transition flex items-center gap-1">
                  <XCircle size={14} /> Reject
                </button>
              </div>
              <button className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold rounded-lg transition">
                Send to Manual Compliance Review
              </button>
            </div>

          </div>
        )}
      </Drawer>

    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60',
    'Manual Review': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/60',
  }[status] || 'bg-gray-100 text-gray-600 border-gray-200';

  const Icon = {
    Approved: CheckCircle2,
    Rejected: XCircle,
    Pending: Clock,
    'Manual Review': AlertTriangle
  }[status] || Clock;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${styles}`}>
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
