'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dropdown, MenuProps, Pagination, Select, Drawer, Modal } from 'antd';
import {
  Search,
  Download,
  CheckCircle2,
  Clock,
  MoreVertical,
  User,
  Lock,
  Unlock,
  Users,
  Loader2,
  KeyRound,
  UserCheck,
  UserX,
  Eye,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Fingerprint,
  MapPin,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Mail,
  Phone,
  Copy,
  Check,
  X,
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

interface StatCardProps {
  cardTitle: string;
  value: string;
  icon: React.ReactNode;
  subText: string;
}

function StatCard({ cardTitle, value, icon, subText }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md p-3.5 shadow-xs border border-gray-200 dark:border-gray-800 relative overflow-hidden flex flex-col justify-between hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
      {/* Unified Brand Color Accent Indicator on ALL Cards */}
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
        <span className="truncate">{subText}</span>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected customer for Quick Details Drawer
  const [viewCustomer, setViewCustomer] = useState<RetailUser | null>(null);

  // Status mapping for API query
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

  const getMenuItems = (c: RetailUser): MenuProps['items'] => [
    {
      key: 'view-drawer',
      label: (
        <span
          onClick={() => setViewCustomer(c)}
          className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200 py-0.5 cursor-pointer"
        >
          <Eye size={14} className="text-gray-500" /> Quick Preview
        </span>
      ),
    },
    {
      key: 'view-profile',
      label: (
        <Link href={`/dashboard/retail/customers/${c.id}`} className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200 py-0.5">
          <ExternalLink size={14} className="text-gray-500" /> View Full Profile
        </Link>
      ),
    },
    { type: 'divider' },
    {
      key: 'suspend-toggle',
      label: (
        <span
          onClick={() => handleAction(c.status === 'Suspended' ? 'activate' : 'suspend', c)}
          className={`flex items-center gap-2 text-xs font-semibold py-0.5 cursor-pointer ${c.status === 'Suspended' ? 'text-green-600' : 'text-red-600'}`}
        >
          {c.status === 'Suspended' ? <UserCheck size={14} /> : <UserX size={14} />}
          {c.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
        </span>
      ),
    },
    {
      key: 'block-toggle',
      label: (
        <span onClick={() => handleAction('block', c)} className="flex items-center gap-2 text-xs font-medium text-amber-600 py-0.5 cursor-pointer">
          <Lock size={14} /> Toggle Block Status
        </span>
      ),
    },
    {
      key: 'unlock-login',
      label: (
        <span onClick={() => handleAction('unlock', c)} className="flex items-center gap-2 text-xs font-medium text-blue-600 py-0.5 cursor-pointer">
          <Unlock size={14} /> Clear Failed Logins ({c.loginAttempts || 0})
        </span>
      ),
    },
    { type: 'divider' },
    {
      key: 'reset-pin',
      label: (
        <span onClick={() => handleAction('reset-pin', c)} className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 py-0.5 cursor-pointer">
          <KeyRound size={14} /> Reset PIN
        </span>
      ),
    },
    {
      key: 'reset-password',
      label: (
        <span onClick={() => handleAction('reset-password', c)} className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 py-0.5 cursor-pointer">
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
    <div className="space-y-4 pb-12 w-full font-sans text-gray-900 dark:text-gray-100 relative">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700">
          <CheckCircle2 className="text-green-400" size={18} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header (Matching Admin Management Page) ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white leading-tight">
            Customer Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Directory and real-time status of retail banking customers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer disabled:opacity-50"
            title="Refresh Customer List"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => showToast('Exporting customer directory...')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#961A1C] hover:bg-[#7e1517] rounded-md transition shadow-2xs cursor-pointer"
          >
            <Download size={14} />
            <span>Export List</span>
          </button>
        </div>
      </div>

      {/* ── Stat Cards (Matching Admin Management Unified Design) ───────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <StatCard
          cardTitle="Total Customers"
          value={isLoading ? '—' : totalUsersCount.toLocaleString()}
          icon={<Users size={14} className="text-[#961A1C]" />}
          subText="Registered retail users"
        />
        <StatCard
          cardTitle="Active Accounts"
          value={isLoading ? '—' : activeCount.toLocaleString()}
          icon={<UserCheck size={14} className="text-[#961A1C]" />}
          subText="Currently active & verified"
        />
        <StatCard
          cardTitle="Pending KYC"
          value={isLoading ? '—' : pendingCount.toLocaleString()}
          icon={<Clock size={14} className="text-[#961A1C]" />}
          subText="Awaiting compliance review"
        />
        <StatCard
          cardTitle="Biometrics Enabled"
          value={isLoading ? '—' : biometricsCount.toLocaleString()}
          icon={<Fingerprint size={14} className="text-[#961A1C]" />}
          subText="Biometrics authentication active"
        />
        <StatCard
          cardTitle="Dormant Accounts"
          value={isLoading ? '—' : dormantCount.toLocaleString()}
          icon={<AlertTriangle size={14} className="text-[#961A1C]" />}
          subText="No transaction activity"
        />
        <StatCard
          cardTitle="Suspended"
          value={isLoading ? '—' : suspendedCount.toLocaleString()}
          icon={<ShieldAlert size={14} className="text-[#961A1C]" />}
          subText="Restricted or blocked"
        />
      </div>

      {/* ── Main Content Card (Table Design matching Admin Management) ─────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden flex flex-col">
        {/* Filters Toolbar */}
        <div className="px-3.5 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex flex-wrap items-center gap-2.5 text-xs">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search by name, BVN, phone, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <Select
            size="small"
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val);
              setPage(1);
            }}
            className="w-44 text-xs"
            options={[
              { value: 'All', label: 'All Accounts' },
              { value: 'Active', label: 'Active only' },
              { value: 'Pending KYC', label: 'Pending KYC' },
              { value: 'Biometrics Enabled', label: 'Biometrics Enabled' },
              { value: 'Dormant', label: 'Dormant only' },
              { value: 'Suspended', label: 'Suspended only' },
            ]}
          />

          {/* Reset Filters */}
          {(searchQuery || activeTab !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveTab('All');
                setPage(1);
              }}
              className="text-[11px] text-gray-500 hover:text-[#961A1C] underline font-medium cursor-pointer"
            >
              Reset filters
            </button>
          )}


        </div>

        {/* Content Table */}
        <div className="min-h-[320px]">
          {isLoading || isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2.5 text-gray-400 font-mono text-xs">
              <Loader2 size={22} className="animate-spin text-[#961A1C]" />
              <span>Loading customer directory...</span>
            </div>
          ) : filteredByTab.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400 text-xs">
              <Users size={32} className="opacity-25" />
              <span className="font-medium text-gray-600 dark:text-gray-300">No customers found</span>
              <span className="text-[11px] text-gray-400">Try adjusting your search criteria or status filter</span>
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
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      BVN / Phone
                    </th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Location & Referral
                    </th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Security & Biometrics
                    </th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Account Status
                    </th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Joined Date
                    </th>
                    <th className="px-3 py-2 text-center border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredByTab.map((c, idx) => {
                    const fullName =
                      `${c.firstName || ''} ${c.middleName ? c.middleName + ' ' : ''}${c.lastName || ''}`.trim() ||
                      c.username ||
                      'Customer';
                    const initials = (c.firstName?.[0] || fullName[0] || 'C').toUpperCase();
                    const locationStr =
                      [c.addressCity, c.addressState].filter(Boolean).join(', ') ||
                      c.addressCountry ||
                      c.addressStreet ||
                      'Nigeria';
                    const formattedDate = c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—';

                    return (
                      <tr
                        key={c.id || idx}
                        className="hover:bg-blue-50/20 dark:hover:bg-gray-800/40 transition-colors group"
                      >
                        {/* S/N */}
                        <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                          #{(page - 1) * pageSize + idx + 1}
                        </td>

                        {/* Customer Avatar & Name (User requested: "cards for users circle and name should not be the same") */}
                        <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 min-w-[240px]">
                          <div className="flex items-center gap-3">
                            {c.photoUrl ? (
                              <img
                                src={c.photoUrl}
                                alt={fullName}
                                className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-700 shadow-2xs"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-stone-700 to-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs font-mono">
                                {initials}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setViewCustomer(c)}
                                  className="font-semibold text-xs text-gray-900 dark:text-white truncate block hover:text-[#961A1C] dark:hover:text-red-400 transition-colors cursor-pointer text-left"
                                  title={`Preview ${fullName}`}
                                >
                                  {fullName}
                                </button>
                                {c.username && (
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    (@{c.username})
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 truncate">{c.email || '—'}</p>
                            </div>
                          </div>
                        </td>

                        {/* BVN / Phone */}
                        <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
                          <p className="font-mono font-semibold text-gray-900 dark:text-white text-xs">
                            {c.bvn ? `BVN: ${c.bvn}` : '—'}
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">{c.phoneNumber || '—'}</p>
                        </td>

                        {/* Location & Referral */}
                        <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap text-xs">
                          <div
                            className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium truncate max-w-[150px]"
                            title={locationStr}
                          >
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

                        {/* Security & Biometrics */}
                        <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
                          <div className="flex flex-wrap items-center gap-1">
                            {c.biometricLoginEnabled && (
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                                title="Biometric Login"
                              >
                                Bio Login
                              </span>
                            )}
                            {c.biometricForTransactionsEnabled && (
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                                title="Biometric Tx"
                              >
                                Bio Tx
                              </span>
                            )}
                            {(c.loginAttempts || 0) > 0 ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800">
                                {c.loginAttempts} Failed
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                0 Failed
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Account Status */}
                        <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
                          {c.status === 'Active' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          )}
                          {c.status === 'Pending' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Pending KYC
                            </span>
                          )}
                          {c.status === 'Suspended' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Suspended
                            </span>
                          )}
                          {c.status === 'Dormant' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                              Dormant
                            </span>
                          )}
                          {c.status !== 'Active' &&
                            c.status !== 'Pending' &&
                            c.status !== 'Suspended' &&
                            c.status !== 'Dormant' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {c.status || 'Active'}
                              </span>
                            )}
                        </td>

                        {/* Joined Date */}
                        <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-gray-400 shrink-0" />
                            <span>{formattedDate}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-2 text-center align-middle border-b border-gray-200 dark:border-gray-800 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Details Button requested by user */}
                            <button
                              onClick={() => setViewCustomer(c)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-[#961A1C] hover:text-white dark:hover:bg-[#961A1C] dark:hover:text-white rounded transition cursor-pointer"
                              title="View Details in Drawer"
                            >
                              <Eye size={12} />
                              <span>View Details</span>
                            </button>

                            {/* Full Profile Link Button */}
                            <button
                              onClick={() => router.push(`/dashboard/retail/customers/${c.id}`)}
                              className="inline-flex items-center p-1 text-gray-400 hover:text-[#961A1C] dark:hover:text-red-400 transition cursor-pointer"
                              title="Open Full Customer Profile"
                            >
                              <ExternalLink size={13} />
                            </button>

                            {/* Dropdown for More Actions */}
                            <Dropdown menu={{ items: getMenuItems(c) }} trigger={['click']} placement="bottomRight">
                              <button className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer">
                                <MoreVertical size={14} />
                              </button>
                            </Dropdown>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Table Footer & Antd Pagination ─────────────────────────────────── */}
        {!isLoading && !isFetching && filteredByTab.length > 0 && (
          <div className="px-3.5 py-2.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, totalCount)} of {totalCount} customers
            </span>

            <Pagination
              current={page}
              pageSize={pageSize}
              total={totalCount}
              onChange={(p, pSize) => {
                setPage(p);
                setPageSize(pSize);
              }}
              showSizeChanger
              pageSizeOptions={['10', '20', '50', '100']}
              size="small"
            />
          </div>
        )}
      </div>

      {/* ── Customer Details Drawer (Fast preview without navigating away) ────── */}
      <CustomerDetailsDrawer
        customer={viewCustomer}
        onClose={() => setViewCustomer(null)}
        onViewFullProfile={(id) => {
          setViewCustomer(null);
          router.push(`/dashboard/retail/customers/${id}`);
        }}
        onAction={handleAction}
      />
    </div>
  );
}

function CustomerDetailsDrawer({
  customer,
  onClose,
  onViewFullProfile,
  onAction,
}: {
  customer: RetailUser | null;
  onClose: () => void;
  onViewFullProfile: (id: string) => void;
  onAction: (action: string, customer: RetailUser) => void;
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    title: string;
    message: string;
    confirmLabel: string;
    isDanger?: boolean;
  } | null>(null);

  if (!customer) return null;

  const fullName =
    `${customer.firstName || ''} ${customer.middleName ? customer.middleName + ' ' : ''}${customer.lastName || ''}`.trim() ||
    customer.username ||
    'Retail Customer';
  const initials = (customer.firstName?.[0] || fullName[0] || 'C').toUpperCase();
  const isActive = customer.status === 'Active';
  const locationStr =
    [customer.addressStreet, customer.addressCity, customer.addressState, customer.addressCountry]
      .filter(Boolean)
      .join(', ') || 'Nigeria';

  const copyText = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  return (
    <Drawer
      open={Boolean(customer)}
      onClose={onClose}
      size={560}
      destroyOnClose
      className="dark:bg-gray-900 font-sans"
      title={
        <div className="flex items-center justify-between w-full pr-4 text-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            <User size={18} className="text-[#961A1C]" />
            <h3 className="text-sm font-semibold">Customer Details Preview</h3>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}
          >
            {customer.status || 'Active'}
          </span>
        </div>
      }
    >
      <div className="space-y-5 text-xs font-sans text-gray-900 dark:text-gray-100">
        {/* Profile Section (No Card Wrapper) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3.5 min-w-0">
            {customer.photoUrl ? (
              <img
                src={customer.photoUrl}
                alt={fullName}
                className="w-14 h-14 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-700 shadow-xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#961A1C] to-[#500e10] flex items-center justify-center text-white font-mono font-bold text-lg shadow-xs shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight truncate">
                {fullName}
              </h4>
              {customer.username && (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono block mt-0.5">
                  @{customer.username}
                </span>
              )}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  Retail Customer
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onViewFullProfile(customer.id!)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#961A1C] hover:bg-[#7e1517] text-white rounded-md text-xs font-semibold shadow-2xs transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <span>Open Full Profile</span>
            <ExternalLink size={12} />
          </button>
        </div>

        {/* Contact & Identification Section (No Card, No Icons, Light Gray Label on Top, Dark Value Below) */}
        <div className="pb-5 border-b border-gray-200 dark:border-gray-800 space-y-3">
          <h5 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider font-mono">
            Contact & Identification
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
            {/* Email Address */}
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block">
                Email Address
              </span>
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono truncate">
                  {customer.email || '—'}
                </span>
                {customer.email && (
                  <button
                    onClick={() => copyText(customer.email!, 'email')}
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-0.5 rounded transition cursor-pointer shrink-0"
                    title="Copy Email"
                  >
                    {copiedField === 'email' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block">
                Phone Number
              </span>
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                  {customer.phoneNumber || '—'}
                </span>
                {customer.phoneNumber && (
                  <button
                    onClick={() => copyText(customer.phoneNumber!, 'phone')}
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-0.5 rounded transition cursor-pointer shrink-0"
                    title="Copy Phone"
                  >
                    {copiedField === 'phone' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                )}
              </div>
            </div>

            {/* BVN */}
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block">
                Bank Verification Number (BVN)
              </span>
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                  {customer.bvn || 'Not Linked'}
                </span>
                {customer.bvn && (
                  <button
                    onClick={() => copyText(customer.bvn!, 'bvn')}
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-0.5 rounded transition cursor-pointer shrink-0"
                    title="Copy BVN"
                  >
                    {copiedField === 'bvn' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                )}
              </div>
            </div>

            {/* Customer ID */}
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block">
                Customer ID
              </span>
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono truncate">
                  {customer.id || '—'}
                </span>
                {customer.id && (
                  <button
                    onClick={() => copyText(customer.id!, 'id')}
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-0.5 rounded transition cursor-pointer shrink-0"
                    title="Copy ID"
                  >
                    {copiedField === 'id' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Security & Compliance Section (No Card, No Icons, Light Gray Label on Top, Dark Value Below) */}
        <div className="pb-5 border-b border-gray-200 dark:border-gray-800 space-y-3">
          <h5 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider font-mono">
            Security & Compliance
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
            {/* Biometric Login */}
            <div>
              <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block">
                Biometric Login
              </span>
              <span
                className={`text-sm font-semibold block mt-0.5 ${
                  customer.biometricLoginEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {customer.biometricLoginEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {/* Biometric Tx */}
            <div>
              <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block">
                Biometric Transactions
              </span>
              <span
                className={`text-sm font-semibold block mt-0.5 ${
                  customer.biometricForTransactionsEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {customer.biometricForTransactionsEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {/* Failed Login Attempts */}
            <div>
              <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block">
                Failed Login Attempts
              </span>
              <span
                className={`text-sm font-semibold block mt-0.5 font-mono ${
                  (customer.loginAttempts || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                }`}
              >
                {customer.loginAttempts || 0} attempts
              </span>
            </div>

            {/* Referral Code */}
            <div>
              <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block">
                Referral Code
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white block mt-0.5 font-mono">
                {customer.referralCode || 'None'}
              </span>
            </div>

            {/* Registered Address */}
            <div className="sm:col-span-2">
              <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block">
                Registered Address
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white block mt-0.5">
                {locationStr}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Administrative Actions (No Card, with in-drawer confirmation modals) */}
        <div className="pt-2 space-y-3">
          <h5 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider font-mono">
            Quick Actions
          </h5>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                if (customer.status === 'Suspended') {
                  setConfirmAction({
                    type: 'activate',
                    title: 'Activate Customer Account',
                    message: `Are you sure you want to reactivate access for ${fullName}? They will be able to log in and perform retail transactions.`,
                    confirmLabel: 'Activate Account',
                    isDanger: false,
                  });
                } else {
                  setConfirmAction({
                    type: 'suspend',
                    title: 'Suspend Customer Account',
                    message: `Are you sure you want to suspend account access for ${fullName}? This will immediately invalidate sessions and block further logins.`,
                    confirmLabel: 'Suspend Account',
                    isDanger: true,
                  });
                }
              }}
              className={`p-2.5 rounded-lg text-xs font-semibold transition cursor-pointer border flex items-center justify-center text-center ${
                customer.status === 'Suspended'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 hover:bg-emerald-100'
                  : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:border-red-800 hover:bg-red-100'
              }`}
            >
              {customer.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
            </button>

            <button
              onClick={() =>
                setConfirmAction({
                  type: 'unlock',
                  title: 'Clear Failed Logins',
                  message: `Are you sure you want to reset failed login attempts to 0 for ${fullName}? This clears any temporary system lockouts.`,
                  confirmLabel: 'Clear Failed Logins',
                  isDanger: false,
                })
              }
              className="p-2.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 hover:bg-blue-100 transition cursor-pointer flex items-center justify-center text-center"
            >
              Clear Failed Logins
            </button>

            <button
              onClick={() =>
                setConfirmAction({
                  type: 'reset-pin',
                  title: 'Reset Transaction PIN',
                  message: `Are you sure you want to initiate a PIN reset for ${fullName}? An authorization instruction will be sent to the customer.`,
                  confirmLabel: 'Send PIN Reset',
                  isDanger: false,
                })
              }
              className="p-2.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 hover:bg-gray-200 transition cursor-pointer flex items-center justify-center text-center"
            >
              Reset PIN
            </button>

            <button
              onClick={() =>
                setConfirmAction({
                  type: 'reset-password',
                  title: 'Reset Account Password',
                  message: `Are you sure you want to send a password reset link to ${fullName}? A secure link will be sent to ${customer.email || 'their registered email'}.`,
                  confirmLabel: 'Send Password Reset',
                  isDanger: false,
                })
              }
              className="p-2.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 hover:bg-gray-200 transition cursor-pointer flex items-center justify-center text-center"
            >
              Reset Password
            </button>
          </div>
        </div>

        {/* In-Drawer Confirmation Modal */}
        {confirmAction && (
          <Modal
            open={Boolean(confirmAction)}
            onCancel={() => setConfirmAction(null)}
            onOk={() => {
              onAction(confirmAction.type, customer);
              setConfirmAction(null);
            }}
            okText={confirmAction.confirmLabel}
            okButtonProps={{
              danger: confirmAction.isDanger,
              className: confirmAction.isDanger ? '!bg-red-600 hover:!bg-red-700' : '!bg-[#961A1C] hover:!bg-[#7e1517]',
            }}
            title={
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <AlertTriangle size={16} className={confirmAction.isDanger ? 'text-red-500' : 'text-amber-500'} />
                <span>{confirmAction.title}</span>
              </div>
            }
            centered
          >
            <div className="py-2 text-xs text-gray-600 dark:text-gray-300">
              <p>{confirmAction.message}</p>
            </div>
          </Modal>
        )}
      </div>
    </Drawer>
  );
}
