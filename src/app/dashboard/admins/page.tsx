'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Search, ChevronRight, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
} from '@/auth/services/adminApi';
import { useToast } from '@/auth/components/ToastContainer';

const ROLES_FILTER = ['All', 'SuperAdmin', 'Control', 'Approver', 'Initiator', 'Audit', 'Operations'];
const CREATABLE_ROLES = ['SuperAdmin', 'Control', 'Approver', 'Initiator', 'Audit', 'Operations'];

function roleBadgeColor(role: string) {
  if (role === 'SuperAdmin' || role === 'SUPER_ADMIN') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  if (role === 'Control' || role === 'control') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (role === 'Audit') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
  if (role === 'Approver') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (role === 'Initiator') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
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
  const PAGE_SIZE = 20;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: 'Control' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data, isFetching, isError, refetch } = useGetAdminUsersQuery({
    pageNumber,
    pageSize: PAGE_SIZE,
    role: roleFilter !== 'All' ? roleFilter : undefined,
  });

  const [createAdmin, { isLoading: isCreating }] = useCreateAdminUserMutation();

  // Normalise response — backend may return items inside data.items, data.data, or data itself
  const rawData = data?.data;
  const items: any[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray((rawData as any)?.items)
    ? (rawData as any).items
    : Array.isArray((rawData as any)?.data)
    ? (rawData as any).data
    : [];
  const totalCount: number = (rawData as any)?.totalCount ?? items.length;

  const filtered = searchQuery
    ? items.filter(
        (u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.role?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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
      toast.success(`${form.firstName} ${form.lastName} has been created. Login credentials have been sent to their email.`, 'Admin Created');
      setIsModalOpen(false);
      setForm({ firstName: '', lastName: '', email: '', role: 'Control' });
      setFormErrors({});
    } catch (err: any) {
      const msg = err?.data?.statusMessage || err?.data?.message || 'Failed to create admin. Please try again.';
      toast.error(msg, 'Create Failed');
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage admin accounts and role assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button
            id="add-admin-btn"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg shadow-sm transition"
          >
            <UserPlus size={16} /> Add Admin
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {ROLES_FILTER.map((r) => (
              <button
                key={r}
                onClick={() => { setRoleFilter(r); setPageNumber(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors border ${
                  roleFilter === r
                    ? 'bg-[#961A1C] text-white border-[#961A1C]'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Loader2 size={28} className="animate-spin text-[#961A1C]" />
              <span className="text-sm font-medium">Loading admins...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <AlertCircle size={28} className="text-[#961A1C]" />
              <span className="text-sm font-medium">Failed to load admins.</span>
              <button onClick={() => refetch()} className="text-xs text-[#961A1C] hover:underline font-semibold">Try again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Users size={32} className="opacity-40" />
              <span className="text-sm font-medium">No admins found.</span>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filtered.map((admin) => (
                  <tr
                    key={admin.id}
                    onClick={() => router.push(`/dashboard/admins/${admin.id}`)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#961A1C] to-[#4d0000] flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {`${admin.firstName?.[0] || ''}${admin.lastName?.[0] || ''}`.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {admin.firstName} {admin.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleBadgeColor(admin.role)}`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${admin.isActive === false ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {admin.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                      {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/admins/${admin.id}`); }}
                        className="text-gray-400 hover:text-[#961A1C] transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isFetching && !isError && filtered.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500">
            <span>Showing {((pageNumber - 1) * PAGE_SIZE) + 1}–{Math.min(pageNumber * PAGE_SIZE, totalCount)} of {totalCount} admins</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
              >Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = pageNumber <= 3 ? i + 1 : pageNumber - 2 + i;
                if (pg > totalPages) return null;
                return (
                  <button
                    key={pg}
                    onClick={() => setPageNumber(pg)}
                    className={`px-3 py-1 border rounded-md ${pg === pageNumber ? 'bg-[#961A1C] text-white border-[#961A1C] font-medium' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >{pg}</button>
                );
              })}
              <button
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                disabled={pageNumber >= totalPages}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
              >Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#961A1C]/10 flex items-center justify-center">
                  <UserPlus size={18} className="text-[#961A1C]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Add New Admin</h3>
                  <p className="text-xs text-gray-500">Login credentials will be emailed to them.</p>
                </div>
              </div>
              <button onClick={() => { setIsModalOpen(false); setFormErrors({}); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">First Name *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className={`w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${formErrors.firstName ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                    placeholder="John"
                  />
                  {formErrors.firstName && <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Last Name *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className={`w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${formErrors.lastName ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                    placeholder="Doe"
                  />
                  {formErrors.lastName && <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${formErrors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                  placeholder="john.doe@alpha10.com"
                />
                {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                >
                  {CREATABLE_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg text-xs text-blue-700 dark:text-blue-400">
                A temporary password will be generated and emailed to the new admin. They can change it upon first login.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setFormErrors({}); }}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-2.5 px-4 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isCreating ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
