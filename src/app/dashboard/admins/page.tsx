'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Pagination, Modal, Select, Drawer } from 'antd';
import {
  Users,
  UserPlus,
  Search,
  ChevronRight,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  ShieldAlert,
  Mail,
  Copy,
  Check,
  Calendar,
  Crown,
  ExternalLink,
  Eye,
  MoreHorizontal,
  Shield,
  Clock,
  CheckCircle,
  UserX,
} from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  AdminUser,
} from '@/auth/services/adminApi';
import { useToast } from '@/auth/components/ToastContainer';

const ROLES_OPTIONS = [
  { value: 'All', label: 'All Roles' },
  { value: 'SuperAdmin', label: 'SuperAdmin' },
  { value: 'Control', label: 'Control' },
  { value: 'Approver', label: 'Approver' },
  { value: 'Initiator', label: 'Initiator' },
  { value: 'Audit', label: 'Audit' },
  { value: 'Operations', label: 'Operations' },
];

const CREATABLE_ROLES = ['SuperAdmin', 'Control', 'Approver', 'Initiator', 'Audit', 'Operations'];

function roleBadgeColor(role: string) {
  const r = (role || '').toLowerCase();
  if (r.includes('super')) return 'bg-red-50 text-[#961A1C] dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800';
  if (r.includes('control')) return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
  if (r.includes('audit')) return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
  if (r.includes('approv')) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
  if (r.includes('initiat')) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
}

interface StatCardProps {
  cardTitle: string;
  value: string;
  topText?: string;
  icon: React.ReactNode;
  subText: string;
}

function StatCard({ cardTitle, value, topText, icon, subText }: StatCardProps) {
  const displayTitle = cardTitle || topText;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md p-3.5 shadow-xs border border-gray-200 dark:border-gray-800 relative overflow-hidden flex flex-col justify-between hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
      {/* Unified Brand Color Accent Indicator on ALL Cards */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] bg-[#961A1C] rounded-r-sm" />
      <div className="flex items-center justify-between pl-2">
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 tracking-tight">
          {displayTitle}
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
        <span>{subText}</span>
      </div>
    </div>
  );
}

export default function AdminManagementPage() {
  return (
    <RoleGuard allowedRoles={['SuperAdmin']}>
      <AdminManagementContent />
    </RoleGuard>
  );
}

function AdminManagementContent() {
  const router = useRouter();
  const toast = useToast();

  // Filters & pagination
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Selected admin for Drawer
  const [viewAdmin, setViewAdmin] = useState<AdminUser | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: 'Control' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data, isFetching, isError, refetch } = useGetAdminUsersQuery({
    pageNumber,
    pageSize,
    role: roleFilter !== 'All' ? roleFilter : undefined,
  });

  const [createAdmin, { isLoading: isCreating }] = useCreateAdminUserMutation();

  // Normalise response
  const rawData = data?.data;
  const items: AdminUser[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray((rawData as any)?.users)
    ? (rawData as any).users
    : Array.isArray((rawData as any)?.items)
    ? (rawData as any).items
    : Array.isArray((rawData as any)?.data)
    ? (rawData as any).data
    : [];

  const totalCount: number = (rawData as any)?.totalCount ?? items.length;

  const filtered = useMemo(() => {
    let result = items;

    // Status filter
    if (statusFilter === 'Active') {
      result = result.filter((u) => u.isActive !== false);
    } else if (statusFilter === 'Inactive') {
      result = result.filter((u) => u.isActive === false);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.role?.toLowerCase().includes(q) ||
          u.id?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [items, searchQuery, statusFilter]);

  // Statistics summaries
  const superAdminCount = useMemo(
    () => items.filter((u) => u.role?.toLowerCase().includes('super')).length,
    [items]
  );

  const activeCount = useMemo(
    () => items.filter((u) => u.isActive !== false).length,
    [items]
  );

  const inactiveCount = useMemo(
    () => items.filter((u) => u.isActive === false).length,
    [items]
  );

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.firstName.trim()) errors.firstName = 'First name is required';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Invalid email address';
    if (!form.role) errors.role = 'Role is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await createAdmin(form).unwrap();
      toast.success(
        `${form.firstName} ${form.lastName} has been created. Login credentials have been sent to their email.`,
        'Admin Created'
      );
      setIsModalOpen(false);
      setForm({ firstName: '', lastName: '', email: '', role: 'Control' });
      setFormErrors({});
      refetch();
    } catch (err: any) {
      const msg = err?.data?.statusMessage || err?.data?.message || 'Failed to create admin. Please try again.';
      toast.error(msg, 'Create Failed');
    }
  }

  return (
    <div className="space-y-4 pb-12 w-full font-sans">
      
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white leading-tight">
            Admin Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage administrative user accounts, security roles, and system access permissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer disabled:opacity-50"
            title="Refresh Admin List"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            id="add-admin-btn"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#961A1C] hover:bg-[#7e1517] rounded-md transition shadow-2xs cursor-pointer"
          >
            <UserPlus size={14} />
            <span>Add Admin</span>
          </button>
        </div>
      </div>

      {/* ── Stat Cards (Unified Single Brand Color Accent) ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard
          cardTitle="Total Admins"
          value={isFetching ? '—' : String(totalCount)}
          icon={<Users size={14} className="text-[#961A1C]" />}
          subText="Registered administrative staff"
        />
        <StatCard
          cardTitle="Active Accounts"
          value={isFetching ? '—' : String(activeCount)}
          icon={<UserCheck size={14} className="text-[#961A1C]" />}
          subText="Currently active and authorized"
        />
        <StatCard
          cardTitle="Inactive Accounts"
          value={isFetching ? '—' : String(inactiveCount)}
          icon={<UserX size={14} className="text-[#961A1C]" />}
          subText="Suspended or deactivated staff"
        />
        <StatCard
          cardTitle="SuperAdmins"
          value={isFetching ? '—' : String(superAdminCount)}
          icon={<ShieldAlert size={14} className="text-[#961A1C]" />}
          subText="Full system administrative privileges"
        />
      </div>

      {/* ── Main Content Card (New Table Design) ────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden flex flex-col">
        
        {/* Filters Toolbar */}
        <div className="px-3.5 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex flex-wrap items-center gap-2.5 text-xs">
          
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search by name, email, role or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPageNumber(1);
              }}
              className="w-full pl-8 pr-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <Select
            size="small"
            value={roleFilter}
            onChange={(val) => {
              setRoleFilter(val);
              setPageNumber(1);
            }}
            className="w-36 text-xs"
            options={ROLES_OPTIONS}
          />

          {/* Status Filter */}
          <Select
            size="small"
            value={statusFilter}
            onChange={(val: 'All' | 'Active' | 'Inactive') => {
              setStatusFilter(val);
              setPageNumber(1);
            }}
            className="w-32 text-xs"
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active only' },
              { value: 'Inactive', label: 'Inactive only' },
            ]}
          />

          {/* Reset Filters */}
          {(searchQuery || roleFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('All');
                setStatusFilter('All');
                setPageNumber(1);
              }}
              className="text-[11px] text-gray-500 hover:text-[#961A1C] underline font-medium cursor-pointer"
            >
              Reset filters
            </button>
          )}

          <div className="ml-auto text-[11px] text-gray-400 font-mono">
            {filtered.length} {filtered.length === 1 ? 'account' : 'accounts'}
          </div>
        </div>

        {/* Content Table */}
        <div className="min-h-[320px]">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2.5 text-gray-400 font-mono text-xs">
              <Loader2 size={22} className="animate-spin text-[#961A1C]" />
              <span>Loading administrator profiles...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-center justify-center">
                <AlertCircle size={20} className="text-[#961A1C]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Failed to load admin accounts
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Unable to retrieve admin user list from the server.
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#961A1C] hover:bg-[#7e1517] text-white rounded-md text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <span>Retry Fetch</span>
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400 text-xs">
              <Users size={32} className="opacity-25" />
              <span className="font-medium text-gray-600 dark:text-gray-300">No admin accounts found</span>
              <span className="text-[11px] text-gray-400">Try adjusting your search criteria or role filters</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100/75 dark:bg-gray-800/80 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-3 py-2 w-12 text-center border-b border-r border-gray-200 dark:border-gray-700">
                      #
                    </th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 min-w-[280px]">
                      Admin Profile
                    </th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Security Role
                    </th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Account Status
                    </th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Created Date
                    </th>
                    <th className="px-3 py-2 text-center border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map((admin, idx) => {
                    const fullName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || '—';
                    const initials = `${admin.firstName?.[0] || ''}${admin.lastName?.[0] || ''}`.toUpperCase() || 'A';
                    const isUserActive = admin.isActive !== false;
                    const isSuper = admin.role?.toLowerCase().includes('super');

                    return (
                      <tr
                        key={admin.id}
                        className="hover:bg-blue-50/20 dark:hover:bg-gray-800/40 transition-colors group"
                      >
                        {/* S/N */}
                        <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                          #{(pageNumber - 1) * pageSize + idx + 1}
                        </td>

                        {/* Admin Profile Box Cell */}
                        <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 min-w-[280px]">
                          <div className="flex items-center gap-3 p-2 rounded-lg border border-gray-200/90 dark:border-gray-700/80 bg-gray-50/70 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:border-[#961A1C]/50 hover:shadow-2xs transition-all max-w-sm">
                            {/* Avatar Box with Status Dot */}
                            <div className="relative shrink-0">
                              <div className="w-9 h-9 rounded-md bg-gradient-to-tr from-[#961A1C] to-[#500e10] flex items-center justify-center text-white font-mono font-bold text-xs shadow-2xs">
                                {initials}
                              </div>
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${
                                  isUserActive ? 'bg-emerald-500' : 'bg-gray-400'
                                }`}
                                title={isUserActive ? 'Active' : 'Inactive'}
                              />
                            </div>

                            {/* Profile Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setViewAdmin(admin)}
                                  className="font-semibold text-xs text-gray-900 dark:text-white truncate block hover:text-[#961A1C] dark:hover:text-red-400 transition-colors cursor-pointer text-left"
                                  title={fullName}
                                >
                                  {fullName}
                                </button>
                                {isSuper && (
                                  <span
                                    className="shrink-0 p-0.5 rounded bg-red-100 dark:bg-red-950/60 text-[#961A1C] dark:text-red-400"
                                    title="SuperAdmin Clearance"
                                  >
                                    <Crown size={11} />
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                <Mail size={11} className="shrink-0 text-gray-400" />
                                <span className="truncate">{admin.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Security Role */}
                        <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${roleBadgeColor(
                              admin.role
                            )}`}
                          >
                            <Shield size={11} />
                            <span>{admin.role}</span>
                          </span>
                        </td>

                        {/* Account Status */}
                        <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                              isUserActive
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isUserActive ? 'bg-emerald-500' : 'bg-red-500'
                              }`}
                            />
                            <span>{isUserActive ? 'Active' : 'Inactive'}</span>
                          </span>
                        </td>

                        {/* Created Date */}
                        <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-gray-400 shrink-0" />
                            <span>
                              {admin.createdAt
                                ? new Date(admin.createdAt).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-2 text-center align-middle border-b border-gray-200 dark:border-gray-800 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewAdmin(admin)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#961A1C] dark:hover:text-[#e05557] transition cursor-pointer"
                              title="Quick Profile Drawer"
                            >
                              <Eye size={12} />
                              <span>Details</span>
                            </button>

                            <button
                              onClick={() => router.push(`/dashboard/admins/${admin.id}`)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-[#961A1C] dark:hover:text-red-400 transition cursor-pointer"
                              title="Full Profile Page"
                            >
                              <ExternalLink size={12} />
                            </button>
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

        {/* ── Table Footer & Antd Pagination ────────────────────────────────── */}
        {!isFetching && !isError && filtered.length > 0 && (
          <div className="px-3.5 py-2.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
              Showing {(pageNumber - 1) * pageSize + 1}–
              {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} admins
            </span>

            <Pagination
              current={pageNumber}
              pageSize={pageSize}
              total={totalCount}
              onChange={(page, pSize) => {
                setPageNumber(page);
                setPageSize(pSize);
              }}
              showSizeChanger
              pageSizeOptions={['10', '20', '50', '100']}
              size="small"
            />
          </div>
        )}
      </div>

      {/* ── Admin Details Drawer ────────────────────────────────────────────── */}
      <AdminDetailsDrawer
        admin={viewAdmin}
        onClose={() => setViewAdmin(null)}
        onViewFullProfile={(id) => {
          setViewAdmin(null);
          router.push(`/dashboard/admins/${id}`);
        }}
      />

      {/* ── Add Admin Modal ─────────────────────────────────────────────────── */}
      <Modal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setFormErrors({});
        }}
        footer={null}
        width={440}
        centered
        destroyOnClose
        maskClosable={true}
      >
        <div className="py-2 text-left font-sans">
          <div className="flex items-center gap-3 pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-lg bg-[#961A1C]/10 flex items-center justify-center shrink-0">
              <UserPlus size={20} className="text-[#961A1C]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Add New Admin User</h3>
              <p className="text-xs text-gray-500">Login credentials will be sent to their email address.</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className={`w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${
                    formErrors.firstName ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                  }`}
                  placeholder="e.g. Samuel"
                />
                {formErrors.firstName && (
                  <p className="text-[10px] text-red-500 mt-0.5 font-mono">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className={`w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${
                    formErrors.lastName ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                  }`}
                  placeholder="e.g. Chif"
                />
                {formErrors.lastName && (
                  <p className="text-[10px] text-red-500 mt-0.5 font-mono">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${
                  formErrors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                }`}
                placeholder="e.g. samuel.chif@alpha10.com"
              />
              {formErrors.email && (
                <p className="text-[10px] text-red-500 mt-0.5 font-mono">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Assigned Role *
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
              >
                {CREATABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-lg text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-sans">
              A temporary password will be generated and dispatched to the user&apos;s email address. They will be prompted to reset password upon initial login.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setFormErrors({});
                }}
                className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-lg transition text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 py-2 px-4 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-lg transition text-xs disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCreating ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Creating...
                  </>
                ) : (
                  'Create Admin'
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>

    </div>
  );
}

// ─── Admin Details Drawer Component ──────────────────────────────────────────
function AdminDetailsDrawer({
  admin,
  onClose,
  onViewFullProfile,
}: {
  admin: AdminUser | null;
  onClose: () => void;
  onViewFullProfile: (id: string) => void;
}) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!admin) return null;

  const fullName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || '—';
  const initials = `${admin.firstName?.[0] || ''}${admin.lastName?.[0] || ''}`.toUpperCase() || 'A';
  const isUserActive = admin.isActive !== false;
  const isSuper = admin.role?.toLowerCase().includes('super');

  const copyId = () => {
    if (admin.id) {
      navigator.clipboard.writeText(admin.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1800);
    }
  };

  const copyEmail = () => {
    if (admin.email) {
      navigator.clipboard.writeText(admin.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1800);
    }
  };

  return (
    <Drawer
      open={Boolean(admin)}
      onClose={onClose}
      size={560}
      destroyOnClose
      className="dark:bg-gray-900"
      title={
        <div className="flex items-center justify-between w-full pr-4 text-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[#961A1C]" />
            <h3 className="text-sm font-semibold">Administrator Profile</h3>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
              isUserActive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}
          >
            {isUserActive ? 'Active Account' : 'Inactive Account'}
          </span>
        </div>
      }
    >
      <div className="space-y-4 text-xs font-sans">
        
        {/* Profile Card Header Box */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#961A1C] to-[#500e10] flex items-center justify-center text-white font-mono font-bold text-lg shadow-sm shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  {fullName}
                </h4>
                {isSuper && (
                  <span className="p-0.5 rounded bg-red-100 dark:bg-red-950/60 text-[#961A1C] dark:text-red-400">
                    <Crown size={13} />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${roleBadgeColor(admin.role)}`}>
                  <Shield size={11} />
                  <span>{admin.role}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onViewFullProfile(admin.id)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#961A1C] hover:bg-[#7e1517] text-white rounded-md text-xs font-semibold shadow-2xs transition cursor-pointer self-start sm:self-auto"
          >
            <span>Open Profile</span>
            <ExternalLink size={12} />
          </button>
        </div>

        {/* Account Contact & ID Box */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 space-y-3">
          <h5 className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-semibold">
            Account Credentials
          </h5>

          <div className="space-y-2">
            {/* Email */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700/60">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#961A1C]" />
                <span className="font-mono text-gray-800 dark:text-gray-200 text-xs">
                  {admin.email}
                </span>
              </div>
              <button
                onClick={copyEmail}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded transition cursor-pointer"
                title="Copy Email"
              >
                {copiedEmail ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>

            {/* Admin ID */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700/60">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">ID</span>
                <span className="font-mono text-gray-600 dark:text-gray-300 text-xs truncate max-w-xs">
                  {admin.id}
                </span>
              </div>
              <button
                onClick={copyId}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded transition cursor-pointer"
                title="Copy ID"
              >
                {copiedId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Security & Access Scope Card */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 space-y-3">
          <h5 className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-semibold">
            Security Scope
          </h5>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700/60">
              <span className="text-[10px] text-gray-400 uppercase font-mono block">Role Scope</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5 block">
                {admin.role}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700/60">
              <span className="text-[10px] text-gray-400 uppercase font-mono block">Status</span>
              <span className={`text-xs font-semibold mt-0.5 block ${isUserActive ? 'text-emerald-600' : 'text-red-500'}`}>
                {isUserActive ? 'Authorized' : 'Suspended'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700/60 col-span-2">
              <span className="text-[10px] text-gray-400 uppercase font-mono block">Registration Date</span>
              <div className="flex items-center gap-1.5 text-xs text-gray-800 dark:text-gray-200 font-mono mt-0.5">
                <Calendar size={13} className="text-gray-400" />
                <span>
                  {admin.createdAt
                    ? new Date(admin.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'System Initial'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Drawer>
  );
}
