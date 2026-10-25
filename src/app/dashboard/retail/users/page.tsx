'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle,
  Eye,
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

const kycStyles: Record<string, string> = {
  Approved: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
  Pending: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
  Rejected: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
};

const statusStyles: Record<string, string> = {
  Active: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
  Pending: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
  Suspended: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
  Deleted: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400',
};

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export default function RetailUsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [kycFilter, setKycFilter] = useState<string>('All');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // RTK Query hooks
  const { data: response, isLoading, isFetching } = useGetRetailUsersQuery({
    page,
    pageSize,
    search: search || undefined,
    status: statusFilter !== 'All' ? statusFilter : undefined,
    kycStatus: kycFilter !== 'All' ? kycFilter : undefined,
  });

  const [suspendUser] = useSuspendUserMutation();
  const [activateUser] = useActivateUserMutation();
  const [blockUser] = useBlockUserMutation();
  const [resetPin] = useResetPinMutation();
  const [resetPassword] = useResetPasswordMutation();
  const [unlockLogin] = useUnlockLoginMutation();

  const userList: RetailUser[] =
    response?.data?.items || response?.data?.users || response?.data?.data || [];
  const totalCount = response?.data?.totalCount || userList.length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAction = async (action: string, user: RetailUser) => {
    if (!user.id) return;
    setActiveMenuId(null);
    try {
      if (action === 'suspend') {
        await suspendUser(user.id).unwrap();
        showToast(`User ${user.firstName || ''} suspended successfully.`);
      } else if (action === 'activate') {
        await activateUser(user.id).unwrap();
        showToast(`User ${user.firstName || ''} activated successfully.`);
      } else if (action === 'block') {
        await blockUser(user.id).unwrap();
        showToast(`Block status toggled for ${user.firstName || ''}.`);
      } else if (action === 'reset-pin') {
        await resetPin(user.id).unwrap();
        showToast(`PIN reset instructions sent to ${user.email || user.firstName}.`);
      } else if (action === 'reset-password') {
        await resetPassword(user.id).unwrap();
        showToast(`Password reset OTP dispatched to ${user.email || user.firstName}.`);
      } else if (action === 'unlock') {
        await unlockLogin(user.id).unwrap();
        showToast(`Login lock cleared for ${user.firstName || ''}.`);
      }
    } catch {
      showToast('Action failed. Please try again.');
    }
  };

  const totalUsersCount = totalCount;
  const kycApprovedCount = userList.filter((u) => u.kycStatus === 'Approved').length;
  const suspendedCount = userList.filter((u) => u.status === 'Suspended').length;

  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500 relative">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700">
          <CheckCircle className="text-green-400" size={18} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Retail Customers</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage individual retail account holders, KYC status, and security options
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Retail Users"
          value={isLoading ? '...' : totalUsersCount}
          icon={<Users size={18} />}
          color="blue"
        />
        <StatCard
          label="KYC Approved (Page)"
          value={isLoading ? '...' : kycApprovedCount}
          icon={<UserCheck size={18} />}
          color="green"
        />
        <StatCard
          label="Suspended (Page)"
          value={isLoading ? '...' : suspendedCount}
          icon={<UserX size={18} />}
          color="red"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, phone, BVN..."
              className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter size={15} />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs py-1.5 px-2.5 font-medium text-gray-700 dark:text-gray-200"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
                <option value="Deleted">Deleted</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>KYC:</span>
              <select
                value={kycFilter}
                onChange={(e) => {
                  setKycFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs py-1.5 px-2.5 font-medium text-gray-700 dark:text-gray-200"
              >
                <option value="All">All KYC</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px] relative">
          {isLoading || isFetching ? (
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-[#961A1C]" size={32} />
            </div>
          ) : null}

          <table className="w-full text-left text-xs border-collapse">
            <thead className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100/75 dark:bg-gray-800/80 uppercase tracking-wider font-mono">
              <tr>
                <th className="px-3 py-2 w-10 text-center border-b border-r border-gray-200 dark:border-gray-700">#</th>
                <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 min-w-[200px]">Customer</th>
                <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Phone / BVN</th>
                <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Cash Account</th>
                <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 text-center whitespace-nowrap">KYC</th>
                <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 text-center whitespace-nowrap">Status</th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-right w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-sans">
              {userList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-xs font-mono border-b border-gray-200 dark:border-gray-800">
                    No retail customers found matching criteria.
                  </td>
                </tr>
              ) : (
                userList.map((user, idx) => {
                  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unnamed Customer';
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-blue-50/20 dark:hover:bg-gray-800/40 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/dashboard/retail/users/${user.id}`)}
                    >
                      {/* S/N */}
                      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                        #{idx + 1}
                      </td>

                      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#961A1C] to-[#4d0000] flex items-center justify-center text-white text-xs font-bold shrink-0 font-mono">
                            {fullName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[170px]">
                              {fullName}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono truncate max-w-[170px]">{user.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-mono whitespace-nowrap">
                        <div>{user.phoneNumber || '—'}</div>
                        {user.bvn && (
                          <div className="text-[10px] text-gray-400">BVN: {user.bvn}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {user.cashAccountNo || user.vnuban || '—'}
                      </td>
                      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                            kycStyles[user.kycStatus || 'Pending'] || kycStyles.Pending
                          }`}
                        >
                          {user.kycStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                            statusStyles[user.status || 'Active'] || statusStyles.Active
                          }`}
                        >
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td
                        className="px-3 py-2 align-middle border-b border-gray-200 dark:border-gray-800 text-right relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-block text-left">
                          <button
                            onClick={() =>
                              setActiveMenuId(activeMenuId === user.id ? null : (user.id || null))
                            }
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
                          >
                            <MoreHorizontal size={14} />
                          </button>

                          {activeMenuId === user.id && (
                            <div className="absolute right-6 mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-30 text-left text-xs font-medium">
                              <button
                                onClick={() => router.push(`/dashboard/retail/users/${user.id}`)}
                                className="w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                              >
                                <Eye size={14} /> View Details
                              </button>
                              {user.status === 'Suspended' ? (
                                <button
                                  onClick={() => handleAction('activate', user)}
                                  className="w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-green-600"
                                >
                                  <UserCheck size={14} /> Activate Account
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAction('suspend', user)}
                                  className="w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
                                >
                                  <UserX size={14} /> Suspend Account
                                </button>
                              )}
                              <button
                                onClick={() => handleAction('block', user)}
                                className="w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-amber-600"
                              >
                                <Lock size={14} /> Toggle Block Status
                              </button>
                              <button
                                onClick={() => handleAction('unlock', user)}
                                className="w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600"
                              >
                                <Unlock size={14} /> Clear Login Lock
                              </button>
                              <button
                                onClick={() => handleAction('reset-pin', user)}
                                className="w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                              >
                                <KeyRound size={14} /> Reset PIN
                              </button>
                              <button
                                onClick={() => handleAction('reset-password', user)}
                                className="w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                              >
                                <ShieldAlert size={14} /> Reset Password
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
          <div>
            Showing Page {page} (Showing {userList.length} items)
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span>Page {page}</span>
            <button
              disabled={userList.length < pageSize}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
