'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Shield, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import { useGetAdminUserQuery } from '@/auth/services/adminApi';

function roleBadgeColor(role: string) {
  if (role === 'SuperAdmin' || role === 'SUPER_ADMIN') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  if (role === 'Control' || role === 'control') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (role === 'Audit') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
  if (role === 'Approver') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (role === 'Initiator') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}

export default function AdminDetailPage() {
  return (
    <RoleGuard allowedRoles={['SuperAdmin']}>
      <AdminDetailContent />
    </RoleGuard>
  );
}

function AdminDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useGetAdminUserQuery(id);

  const admin = data?.data;

  const fullName = admin ? `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim() : '—';
  const initials = admin
    ? `${admin.firstName?.[0] || ''}${admin.lastName?.[0] || ''}`.toUpperCase()
    : '?';

  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500 max-w-3xl">

      {/* Back */}
      <div>
        <button
          onClick={() => router.push('/dashboard/admins')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Admin Management
        </button>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Details</h1>
        <p className="text-gray-500 text-sm mt-1">View admin account information</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin text-[#961A1C]" />
          <span className="text-sm font-medium">Loading admin details...</span>
        </div>
      ) : isError ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 flex flex-col items-center gap-3 text-gray-400">
          <AlertCircle size={28} className="text-[#961A1C]" />
          <p className="text-sm font-medium">Failed to load admin details.</p>
          <button onClick={() => refetch()} className="text-xs text-[#961A1C] hover:underline font-semibold">Try again</button>
        </div>
      ) : !admin ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 flex flex-col items-center gap-3 text-gray-400">
          <User size={32} className="opacity-40" />
          <p className="text-sm font-medium">Admin not found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

          {/* Profile Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/40 dark:to-gray-800">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#961A1C] to-[#4d0000] flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-white dark:border-gray-700">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{fullName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleBadgeColor(admin.role)}`}>
                  {admin.role}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${admin.isActive === false ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                  {admin.isActive === false ? 'Inactive' : 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DetailField
              icon={<User size={15} />}
              label="First Name"
              value={admin.firstName || '—'}
            />
            <DetailField
              icon={<User size={15} />}
              label="Last Name"
              value={admin.lastName || '—'}
            />
            <DetailField
              icon={<Mail size={15} />}
              label="Email Address"
              value={admin.email || '—'}
            />
            <DetailField
              icon={<Shield size={15} />}
              label="Role"
              value={admin.role || '—'}
            />
            <DetailField
              icon={<Calendar size={15} />}
              label="Created At"
              value={
                admin.createdAt
                  ? new Date(admin.createdAt).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'
              }
            />
            <DetailField
              icon={<User size={15} />}
              label="Admin ID"
              value={admin.id || '—'}
              mono
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailField({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        <span className="text-gray-400">{icon}</span>
        {label}
      </div>
      <p className={`text-sm font-medium text-gray-900 dark:text-white ${mono ? 'font-mono text-xs break-all' : ''}`}>
        {value}
      </p>
    </div>
  );
}
