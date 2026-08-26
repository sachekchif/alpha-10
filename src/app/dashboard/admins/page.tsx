'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Pagination, Modal } from 'antd';
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
} from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  AdminUser,
} from '@/auth/services/adminApi';
import { useToast } from '@/auth/components/ToastContainer';

const ROLES_FILTER = ['All', 'SuperAdmin', 'Control', 'Approver', 'Initiator', 'Audit', 'Operations'];
const CREATABLE_ROLES = ['SuperAdmin', 'Control', 'Approver', 'Initiator', 'Audit', 'Operations'];

function roleBadgeColor(role: string) {
  const r = (role || '').toLowerCase();
  if (r.includes('super')) return 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800';
  if (r.includes('control')) return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
  if (r.includes('audit')) return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
  if (r.includes('approv')) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
  if (r.includes('initiat')) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);

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

  // Normalise response — backend returns users in data.users, data.items, data.data, or data itself
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
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  // Statistics summaries
  const superAdminCount = useMemo(
    () => items.filter((u) => u.role?.toLowerCase().includes('super')).length,
    [items]
  );

  const controlCount = useMemo(
    () => items.filter((u) => u.role?.toLowerCase().includes('control')).length,
    [items]
  );

  const activeCount = useMemo(
    () => items.filter((u) => u.isActive !== false).length,
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
    <div className="flex flex-col gap-6 pb-12 w-full font-sans">
      
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Admin Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage administrative user accounts, security roles, and system access permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition shadow-2xs cursor-pointer"
            title="Refresh Admin List"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            id="add-admin-btn"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-white bg-[#961A1C] hover:bg-[#7a1517] text-xs font-semibold rounded-lg px-3.5 py-2 transition shadow-sm cursor-pointer"
          >
            <UserPlus size={15} />
            <span>Add Admin</span>
          </button>
        </div>
      </div>

      {/* ── Signature Stat Cards Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: TOTAL ADMINS */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-2xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-xs transition-all duration-200">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-[#961A1C] rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              System Total
            </span>
          </div>
          <div className="my-3 pl-2">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight font-sans">
              {totalCount}
            </h2>
          </div>
          <div className="flex items-center gap-2 pl-2 text-gray-500 dark:text-gray-400">
            <Users size={16} />
            <span className="text-xs font-medium">Total Admins</span>
          </div>
        </div>

        {/* CARD 2: SUPERADMINS */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-2xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-xs transition-all duration-200">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-red-600 rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-red-600 dark:text-red-400">
              High Access
            </span>
          </div>
          <div className="my-3 pl-2">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight font-sans">
              {superAdminCount}
            </h2>
          </div>
          <div className="flex items-center gap-2 pl-2 text-gray-500 dark:text-gray-400">
            <ShieldAlert size={16} className="text-red-600 dark:text-red-400" />
            <span className="text-xs font-medium">SuperAdmins</span>
          </div>
        </div>

        {/* CARD 3: CONTROL OFFICERS */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-2xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-xs transition-all duration-200">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-blue-600 rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Operations & Control
            </span>
          </div>
          <div className="my-3 pl-2">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight font-sans">
              {controlCount}
            </h2>
          </div>
          <div className="flex items-center gap-2 pl-2 text-gray-500 dark:text-gray-400">
            <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium">Control Staff</span>
          </div>
        </div>

        {/* CARD 4: ACTIVE ACCOUNTS */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-2xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-xs transition-all duration-200">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-emerald-600 rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Active Status
            </span>
          </div>
          <div className="my-3 pl-2">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight font-sans">
              {activeCount}
            </h2>
          </div>
          <div className="flex items-center gap-2 pl-2 text-gray-500 dark:text-gray-400">
            <UserCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium">Active Accounts</span>
          </div>
        </div>

      </div>

      {/* ── Table Card Container ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs flex flex-col overflow-hidden w-full">
        
        {/* Toolbar: Search & Role Filters */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-8 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {ROLES_FILTER.map((r) => {
              const isActive = roleFilter === r;
              return (
                <button
                  key={r}
                  onClick={() => {
                    setRoleFilter(r);
                    setPageNumber(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                    isActive
                      ? 'bg-[#961A1C] text-white border-[#961A1C]'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        {/* Admin Users Table */}
        <div className="overflow-x-auto min-h-[360px] w-full">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400 font-mono text-xs">
              <Loader2 size={24} className="animate-spin text-[#961A1C]" />
              <span>Loading admin user accounts...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400 text-xs">
              <AlertCircle size={24} className="text-[#961A1C]" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Failed to load admin accounts.
              </span>
              <button
                onClick={() => refetch()}
                className="text-xs text-[#961A1C] hover:underline font-semibold cursor-pointer"
              >
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400 text-xs">
              <Users size={32} className="opacity-30" />
              <span className="font-medium">No admin accounts found matching your criteria.</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead className="bg-gray-50/80 dark:bg-gray-900/60 text-gray-500 uppercase font-mono text-[10px] tracking-wider border-b border-gray-100 dark:border-gray-700/80">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Admin User</th>
                  <th className="px-6 py-3.5 font-bold">Email Address</th>
                  <th className="px-6 py-3.5 font-bold">Assigned Role</th>
                  <th className="px-6 py-3.5 font-bold">Account Status</th>
                  <th className="px-6 py-3.5 font-bold">Created Date</th>
                  <th className="px-6 py-3.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filtered.map((admin) => {
                  const fullName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || '—';
                  const initials = `${admin.firstName?.[0] || ''}${admin.lastName?.[0] || ''}`.toUpperCase() || 'A';
                  const isUserActive = admin.isActive !== false;

                  return (
                    <tr
                      key={admin.id}
                      onClick={() => router.push(`/dashboard/admins/${admin.id}`)}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group"
                    >
                      {/* Name & Avatar */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#961A1C] to-[#500e10] flex items-center justify-center text-white font-mono font-bold text-xs shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white text-xs block group-hover:text-[#961A1C] dark:group-hover:text-red-400 transition-colors">
                              {fullName}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 block sm:hidden">
                              {admin.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-3.5 font-mono text-gray-600 dark:text-gray-300">
                        {admin.email}
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${roleBadgeColor(admin.role)}`}>
                          {admin.role}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          isUserActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800'
                        }`}>
                          {isUserActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-3.5 font-mono text-gray-500 dark:text-gray-400 text-xs">
                        {admin.createdAt
                          ? new Date(admin.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/admins/${admin.id}`);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#961A1C] dark:hover:text-red-400 transition cursor-pointer"
                        >
                          <span>Details</span>
                          <ChevronRight size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Table Footer & Antd Pagination ────────────────────────────────── */}
        {!isFetching && !isError && filtered.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="font-mono text-gray-500 dark:text-gray-400">
              Showing {((pageNumber - 1) * pageSize) + 1}–{Math.min(pageNumber * pageSize, totalCount)} of {totalCount} admins
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
                {formErrors.firstName && <p className="text-[10px] text-red-500 mt-0.5 font-mono">{formErrors.firstName}</p>}
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
                {formErrors.lastName && <p className="text-[10px] text-red-500 mt-0.5 font-mono">{formErrors.lastName}</p>}
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
              {formErrors.email && <p className="text-[10px] text-red-500 mt-0.5 font-mono">{formErrors.email}</p>}
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
                  <option key={r} value={r}>{r}</option>
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
                {isCreating ? <><Loader2 size={13} className="animate-spin" /> Creating...</> : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

    </div>
  );
}
