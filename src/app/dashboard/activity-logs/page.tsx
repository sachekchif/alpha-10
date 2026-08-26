'use client';

import React, { useState } from 'react';
import {
  History, Search, Loader2, AlertCircle, RefreshCw, Filter, X,
} from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import { useGetAuditTrailQuery, AuditTrailEntry } from '@/auth/services/adminApi';

export default function ActivityLogsPage() {
  return (
    <RoleGuard allowedRoles={['SuperAdmin']}>
      <ActivityLogsContent />
    </RoleGuard>
  );
}

const MODULE_OPTIONS = [
  'All', 'InvestmentEducation', 'MutualFundContent', 'PortfolioSettings',
  'AdminUsers', 'Auth', 'System',
];

const ACTION_OPTIONS = [
  'All', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW',
];

function ActivityLogsContent() {
  const [pageNumber, setPageNumber] = useState(1);
  const PAGE_SIZE = 25;

  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [performedById, setPerformedById] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [appliedModule, setAppliedModule] = useState('');
  const [appliedAction, setAppliedAction] = useState('');
  const [appliedReferenceId, setAppliedReferenceId] = useState('');
  const [appliedPerformedById, setAppliedPerformedById] = useState('');

  const { data, isFetching, isError, refetch } = useGetAuditTrailQuery({
    module: appliedModule || undefined,
    action: appliedAction || undefined,
    referenceId: appliedReferenceId || undefined,
    performedById: appliedPerformedById || undefined,
    pageNumber,
    pageSize: PAGE_SIZE,
  });

  const rawData = data?.data;
  const items: AuditTrailEntry[] = rawData
    ? Array.isArray(rawData)
      ? rawData
      : Array.isArray((rawData as any)?.items) ? (rawData as any).items
      : Array.isArray((rawData as any)?.data) ? (rawData as any).data : []
    : [];
  const totalCount: number = (rawData as any)?.totalCount ?? items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const hasActiveFilters = appliedModule || appliedAction || appliedReferenceId || appliedPerformedById;

  function applyFilters() {
    setAppliedModule(moduleFilter && moduleFilter !== 'All' ? moduleFilter : '');
    setAppliedAction(actionFilter && actionFilter !== 'All' ? actionFilter : '');
    setAppliedReferenceId(referenceId.trim());
    setAppliedPerformedById(performedById.trim());
    setPageNumber(1);
    setShowFilters(false);
  }

  function clearFilters() {
    setModuleFilter('');
    setActionFilter('');
    setReferenceId('');
    setPerformedById('');
    setAppliedModule('');
    setAppliedAction('');
    setAppliedReferenceId('');
    setAppliedPerformedById('');
    setPageNumber(1);
  }

  function formatTimestamp(ts?: string) {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  }

  function actionColor(action?: string) {
    if (!action) return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    const a = action.toUpperCase();
    if (a === 'CREATE') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (a === 'UPDATE') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    if (a === 'DELETE') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (a === 'LOGIN') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  }

  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
          <p className="text-gray-500 text-sm mt-1">Audit trail of all admin actions across the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button
            id="audit-filter-btn"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${hasActiveFilters
              ? 'bg-[#961A1C] text-white hover:bg-[#7a1517]'
              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter size={14} /> Filters {hasActiveFilters && '(Active)'}
          </button>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-red-600 transition">
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Filter Audit Logs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Module</label>
              <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]">
                {MODULE_OPTIONS.map((m) => <option key={m} value={m === 'All' ? '' : m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Action</label>
              <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]">
                {ACTION_OPTIONS.map((a) => <option key={a} value={a === 'All' ? '' : a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Reference ID</label>
              <input type="text" value={referenceId} onChange={(e) => setReferenceId(e.target.value)} placeholder="e.g. abc-123"
                className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Performed By (ID)</label>
              <input type="text" value={performedById} onChange={(e) => setPerformedById(e.target.value)} placeholder="Admin ID"
                className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-3">
            <button onClick={() => setShowFilters(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition">Cancel</button>
            <button onClick={applyFilters} className="px-4 py-2 text-sm font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg transition">Apply Filters</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Loader2 size={28} className="animate-spin text-[#961A1C]" />
              <span className="text-sm font-medium">Loading activity logs...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <AlertCircle size={28} className="text-[#961A1C]" />
              <span className="text-sm font-medium">Failed to load audit trail.</span>
              <button onClick={() => refetch()} className="text-xs text-[#961A1C] hover:underline font-semibold">Try again</button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <History size={32} className="opacity-40" />
              <span className="text-sm font-medium">
                {hasActiveFilters ? 'No logs matched your filters.' : 'No activity logs found.'}
              </span>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-[#961A1C] hover:underline font-semibold">Clear filters</button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">Module</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Performed By</th>
                  <th className="px-6 py-4 font-medium">Reference ID</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {items.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatTimestamp(entry.createdAt || entry.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      {entry.module ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-mono">
                          {entry.module}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {entry.action ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${actionColor(entry.action)}`}>
                          {entry.action}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {entry.performedBy || entry.performedById || '—'}
                        </p>
                        {entry.performedById && entry.performedBy && (
                          <p className="text-xs text-gray-400 font-mono">{entry.performedById}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {entry.referenceId ? (
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{entry.referenceId}</span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{entry.description || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {entry.ipAddress || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isFetching && !isError && items.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500">
            <span>Showing {((pageNumber - 1) * PAGE_SIZE) + 1}–{Math.min(pageNumber * PAGE_SIZE, totalCount)} of {totalCount} logs</span>
            <div className="flex gap-2">
              <button onClick={() => setPageNumber((p) => Math.max(1, p - 1))} disabled={pageNumber === 1} className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40">Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = pageNumber <= 3 ? i + 1 : pageNumber - 2 + i;
                if (pg > totalPages) return null;
                return (
                  <button key={pg} onClick={() => setPageNumber(pg)}
                    className={`px-3 py-1 border rounded-md ${pg === pageNumber ? 'bg-[#961A1C] text-white border-[#961A1C] font-medium' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    {pg}
                  </button>
                );
              })}
              <button onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))} disabled={pageNumber >= totalPages} className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
