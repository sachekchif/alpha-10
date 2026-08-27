'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dropdown, MenuProps } from 'antd';
import { 
  Search, Download, CheckCircle2, Clock, 
  ChevronLeft, ChevronRight, MoreVertical, User, 
  Lock, Unlock, Users, Loader2, KeyRound, UserCheck, UserX, Eye,
  ShieldAlert, AlertTriangle, Hexagon, XCircle, RefreshCw,
  SlidersHorizontal, Filter, ChevronDown, TrendingUp, TrendingDown,
  Fingerprint, MapPin, Tag, ShieldCheck
} from 'lucide-react';
import {
  useGetRetailUsersQuery,
  useSuspendUserMutation,
  useActivateUserMutation,
  useBlockUserMutation,
  useResetPinMutation,
  useResetPasswordMutation,
  useUnlockLoginMutation,
  RetailUser,
} from '@/auth/services/retailApi';

export default function CustomersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const tabs = ['All', 'Active', 'Pending KYC', 'Biometrics Enabled', 'Dormant', 'Suspended'];

  // Status mapping
  const statusFilter =
    activeTab === 'Active'
      ? 'Active'
      : activeTab === 'Pending KYC'
      ? 'Pending'
      : activeTab === 'Suspended'
      ? 'Suspended'
      : undefined;

  const { data: response, isLoading, isFetching, refetch } = useGetRetailUsersQuery({
    page,
    pageSize,
    search: searchQuery || undefined,
    status: statusFilter,
  });

  const [suspendUser] = useSuspendUserMutation();
  const [activateUser] = useActivateUserMutation();
  const [blockUser] = useBlockUserMutation();
  const [resetPin] = useResetPinMutation();
  const [resetPassword] = useResetPasswordMutation();
  const [unlockLogin] = useUnlockLoginMutation();

  const customerList: RetailUser[] =
    response?.data?.users || response?.data?.items || response?.data?.data || [];
  const totalCount = response?.data?.totalCount || customerList.length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAction = async (action: string, customer: RetailUser) => {
    if (!customer.id) return;
    try {
      if (action === 'suspend') {
        await suspendUser(customer.id).unwrap();
        showToast(`Customer ${customer.firstName || ''} suspended.`);
      } else if (action === 'activate') {
        await activateUser(customer.id).unwrap();
        showToast(`Customer ${customer.firstName || ''} activated.`);
      } else if (action === 'block') {
        await blockUser(customer.id).unwrap();
        showToast(`Block status toggled for ${customer.firstName || ''}.`);
      } else if (action === 'unlock') {
        await unlockLogin(customer.id).unwrap();
        showToast(`Failed login attempts cleared for ${customer.firstName || ''}.`);
      } else if (action === 'reset-pin') {
        await resetPin(customer.id).unwrap();
        showToast(`PIN reset dispatched for ${customer.firstName || ''}.`);
      } else if (action === 'reset-password') {
        await resetPassword(customer.id).unwrap();
        showToast(`Password reset OTP sent to ${customer.email || ''}.`);
      }
      refetch();
    } catch {
      showToast('Action failed. Please try again.');
    }
  };

  const filteredByTab = customerList.filter((c) => {
    if (activeTab === 'Biometrics Enabled' && !c.biometricLoginEnabled && !c.biometricForTransactionsEnabled) {
      return false;
    }
    if (activeTab === 'Dormant' && c.status !== 'Dormant') return false;
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedCustomers.length === filteredByTab.length && filteredByTab.length > 0) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredByTab.map((c) => c.id!).filter(Boolean));
    }
  };

  const toggleSelectCustomer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter((c) => c !== id));
    } else {
      setSelectedCustomers([...selectedCustomers, id]);
    }
  };

  const handleRowClick = (id: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    router.push(`/dashboard/retail/customers/${id}`);
  };

  const getMenuItems = (c: RetailUser): MenuProps['items'] => [
    {
      key: 'view-profile',
      label: (
        <Link href={`/dashboard/retail/customers/${c.id}`} className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200 py-0.5">
          <Eye size={14} className="text-gray-500" /> View Customer Profile
        </Link>
      ),
    },
    {
      key: 'suspend-toggle',
      label: (
        <span
          onClick={() => handleAction(c.status === 'Suspended' ? 'activate' : 'suspend', c)}
          className={`flex items-center gap-2 text-xs font-semibold py-0.5 ${c.status === 'Suspended' ? 'text-green-600' : 'text-red-600'}`}
        >
          {c.status === 'Suspended' ? <UserCheck size={14} /> : <UserX size={14} />}
          {c.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
        </span>
      ),
    },
    {
      key: 'block-toggle',
      label: (
        <span onClick={() => handleAction('block', c)} className="flex items-center gap-2 text-xs font-medium text-amber-600 py-0.5">
          <Lock size={14} /> Toggle Block Status
        </span>
      ),
    },
    {
      key: 'unlock-login',
      label: (
        <span onClick={() => handleAction('unlock', c)} className="flex items-center gap-2 text-xs font-medium text-blue-600 py-0.5">
          <Unlock size={14} /> Clear Failed Logins ({c.loginAttempts || 0})
        </span>
      ),
    },
    { type: 'divider' },
    {
      key: 'reset-pin',
      label: (
        <span onClick={() => handleAction('reset-pin', c)} className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 py-0.5">
          <KeyRound size={14} /> Reset PIN
        </span>
      ),
    },
    {
      key: 'reset-password',
      label: (
        <span onClick={() => handleAction('reset-password', c)} className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 py-0.5">
          <ShieldAlert size={14} /> Reset Password
        </span>
      ),
    },
  ];

  // Calculated Stats
  const totalUsersCount = totalCount;
  const activeCount = customerList.filter((c) => c.status === 'Active').length;
  const pendingCount = customerList.filter((c) => c.status === 'Pending').length;
  const biometricsCount = customerList.filter((c) => c.biometricLoginEnabled || c.biometricForTransactionsEnabled).length;
  const dormantCount = customerList.filter((c) => c.status === 'Dormant').length;
  const suspendedCount = customerList.filter((c) => c.status === 'Suspended').length;

  return (
    <div className="flex flex-col gap-6 pb-12 w-full animate-in fade-in duration-500 font-sans text-gray-900 dark:text-gray-100 relative">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700">
          <CheckCircle2 className="text-green-400" size={18} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Customer Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Directory and real-time status of retail banking customers
          </p>
        </div>

        <button
          onClick={() => showToast('Exporting customer directory...')}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-2xs cursor-pointer"
        >
          <Download size={14} className="text-gray-500" /> Export List
        </button>
      </div>

      {/* ── Top 6 Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total Customers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Customers</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50 flex items-center gap-1">
              <TrendingUp size={11} /> 5.0%
            </span>
          </div>
          <div className="my-1.5">
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
              {isLoading ? '...' : totalUsersCount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Customers</p>
          </div>
        </div>

        {/* Card 2: Active Accounts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Accounts</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50 flex items-center gap-1">
              <TrendingUp size={11} /> 2.0%
            </span>
          </div>
          <div className="my-1.5">
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
              {isLoading ? '...' : activeCount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Active Users</p>
          </div>
        </div>

        {/* Card 3: Pending KYC */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Pending KYC</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50 flex items-center gap-1">
              <Clock size={11} /> {pendingCount}
            </span>
          </div>
          <div className="my-1.5">
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
              {isLoading ? '...' : pendingCount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Needs Review</p>
          </div>
        </div>

        {/* Card 4: Biometrics Enabled */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Biometrics Enabled</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/50 flex items-center gap-1">
              <Fingerprint size={11} /> Active
            </span>
          </div>
          <div className="my-1.5">
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
              {isLoading ? '...' : biometricsCount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Biometrics Configured</p>
          </div>
        </div>

        {/* Card 5: Dormant Accounts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Dormant Accounts</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50 flex items-center gap-1">
              <TrendingDown size={11} /> 1.4%
            </span>
          </div>
          <div className="my-1.5">
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
              {isLoading ? '...' : dormantCount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Inactive Users</p>
          </div>
        </div>

        {/* Card 6: Suspended */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Suspended</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50 flex items-center gap-1">
              <AlertTriangle size={11} /> Action
            </span>
          </div>
          <div className="my-1.5">
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
              {isLoading ? '...' : suspendedCount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Blocked Accounts</p>
          </div>
        </div>
      </div>

      {/* ── Table Card Container ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden">
        {/* Table Control Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Segmented Filter Tabs Container */}
          <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg p-1 flex items-center gap-1 overflow-x-auto w-full md:w-auto shadow-2xs">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-md text-xs transition whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#961A1C] text-white font-bold shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Right Action Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, BVN, email..."
                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-1.5 pl-8 pr-3 rounded-lg text-xs focus:outline-none focus:border-[#961A1C]"
              />
            </div>

            <Dropdown
              menu={{
                items: [
                  { key: 'all', label: 'All Statuses', onClick: () => setActiveTab('All') },
                  { key: 'active', label: 'Active Accounts', onClick: () => setActiveTab('Active') },
                  { key: 'pending', label: 'Pending KYC', onClick: () => setActiveTab('Pending KYC') },
                  { key: 'suspended', label: 'Suspended Accounts', onClick: () => setActiveTab('Suspended') },
                ],
              }}
              trigger={['click']}
            >
              <button className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs">
                Filters <SlidersHorizontal size={13} className="text-gray-500" />
              </button>
            </Dropdown>

            <Dropdown
              menu={{
                items: [
                  { key: 'newest', label: 'Joined Date: Newest First' },
                  { key: 'oldest', label: 'Joined Date: Oldest First' },
                  { key: 'name', label: 'Customer Name (A-Z)' },
                ],
              }}
              trigger={['click']}
            >
              <button className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs">
                Sort by <ChevronDown size={13} className="text-gray-500" />
              </button>
            </Dropdown>
          </div>
        </div>

        {/* ── Table Maxing Important Retail Customer Data ────────────────────────────── */}
        <div className="overflow-x-auto min-h-[360px] relative">
          {isLoading || isFetching ? (
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-gray-900 dark:text-white" size={32} />
            </div>
          ) : null}

          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F7] dark:bg-gray-900/60 text-gray-500 font-mono text-[11px] border-b border-gray-200/70 dark:border-gray-700/80">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.length === filteredByTab.length && filteredByTab.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                </th>
                <th className="px-4 py-3.5 font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                  FULL NAME & USERNAME •
                </th>
                <th className="px-4 py-3.5 font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                  BVN / PHONE NUMBER •
                </th>
                <th className="px-4 py-3.5 font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                  LOCATION & REFERRAL •
                </th>
                <th className="px-4 py-3.5 font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                  SECURITY & BIOMETRICS •
                </th>
                <th className="px-4 py-3.5 font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                  ACCOUNT STATUS •
                </th>
                <th className="px-4 py-3.5 font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                  JOIN DATE •
                </th>
                <th className="px-4 py-3.5 text-right w-10"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 font-sans">
              {filteredByTab.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-xs font-mono">
                    No customers found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredByTab.map((c) => {
                  const fullName = `${c.firstName || ''} ${c.middleName ? c.middleName + ' ' : ''}${c.lastName || ''}`.trim() || c.username || 'Customer';
                  const formattedDate = c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—';
                  const locationStr = [c.addressCity, c.addressState, c.addressCountry].filter(Boolean).join(', ') || c.addressStreet || 'Nigeria';

                  return (
                    <tr
                      key={c.id}
                      onClick={(e) => handleRowClick(c.id!, e)}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-900/40 transition cursor-pointer"
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(c.id!)}
                          onChange={(e) => toggleSelectCustomer(c.id!, e as any)}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                      </td>

                      {/* FULL NAME & USERNAME */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {c.photoUrl ? (
                            <img
                              src={c.photoUrl}
                              alt={fullName}
                              className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-stone-700 to-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                              {fullName[0]}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-gray-900 dark:text-white text-xs">{fullName}</p>
                              {c.username && (
                                <span className="text-[10px] text-gray-400 font-mono">(@{c.username})</span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 font-normal">{c.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* BVN / PHONE NUMBER */}
                      <td className="px-4 py-3.5">
                        <p className="font-mono font-bold text-gray-900 dark:text-white text-xs">
                          {c.bvn ? `BVN: ${c.bvn}` : '—'}
                        </p>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{c.phoneNumber || '—'}</p>
                      </td>

                      {/* LOCATION & REFERRAL */}
                      <td className="px-4 py-3.5 text-xs">
                        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium truncate max-w-[140px]" title={locationStr}>
                          <MapPin size={12} className="text-gray-400 shrink-0" />
                          <span className="truncate">{locationStr}</span>
                        </div>
                        {c.referralCode ? (
                          <div className="text-[11px] font-mono text-[#961A1C] font-semibold mt-0.5">
                            Ref: {c.referralCode}
                          </div>
                        ) : (
                          <div className="text-[11px] text-gray-400 font-mono">No referral</div>
                        )}
                      </td>

                      {/* SECURITY & BIOMETRICS */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-1">
                          {c.biometricLoginEnabled && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200" title="Biometric Login">
                              Bio Login
                            </span>
                          )}
                          {c.biometricForTransactionsEnabled && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200" title="Biometric Tx">
                              Bio Tx
                            </span>
                          )}
                          {(c.loginAttempts || 0) > 0 ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                              {c.loginAttempts} Failed
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              0 Failed
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ACCOUNT STATUS */}
                      <td className="px-4 py-3.5">
                        {c.status === 'Active' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-[11px] font-bold bg-[#EDF6EE] text-[#1E6B34] border border-[#D1E9D5] dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1E6B34] dark:bg-emerald-400 mr-1.5" />
                            Active
                          </span>
                        )}
                        {c.status === 'Pending' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-[11px] font-bold bg-[#FFF9EA] text-[#8C6B00] border border-[#F5E6B8] dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8C6B00] dark:bg-amber-400 mr-1.5" />
                            Pending KYC
                          </span>
                        )}
                        {c.status === 'Suspended' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-[11px] font-bold bg-[#FDF2F2] text-[#9B1C1C] border border-[#F8BD00] dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9B1C1C] dark:bg-red-400 mr-1.5" />
                            Suspended
                          </span>
                        )}
                        {c.status === 'Dormant' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5" />
                            Dormant
                          </span>
                        )}
                        {c.status !== 'Active' && c.status !== 'Pending' && c.status !== 'Suspended' && c.status !== 'Dormant' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
                            {c.status || 'Active'}
                          </span>
                        )}
                      </td>

                      {/* JOIN DATE */}
                      <td className="px-4 py-3.5 font-medium text-gray-600 dark:text-gray-300 text-xs font-mono">
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <Dropdown menu={{ items: getMenuItems(c) }} trigger={['click']} placement="bottomRight">
                          <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition">
                            <MoreVertical size={15} />
                          </button>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 font-mono">
          <div>Showing Page {page} ({filteredByTab.length} items)</div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            <span>Page {page}</span>
            <button
              disabled={filteredByTab.length < pageSize}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
