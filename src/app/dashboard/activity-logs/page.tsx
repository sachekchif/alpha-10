'use client';

import React, { useState } from 'react';
import { useGetAuditTrailQuery } from '@/auth/services/adminApi';
import { Select, Dropdown } from 'antd';
import { Search, ChevronLeft, ChevronRight, User, AlertCircle, FileText, Filter, X, Copy, Check, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableSkeletonRows, TableSkeletonCol } from '@/components/TableSkeleton';

const ACTIVITY_LOGS_SKELETON_COLS: TableSkeletonCol[] = [
  { type: 'checkbox', align: 'center' },
  { type: 'text', width: 'w-24' },
  { type: 'avatar', width: 'w-28' },
  { type: 'text', width: 'w-20' },
  { type: 'badge', align: 'center', width: 'w-16' },
  { type: 'text', width: 'w-20' },
  { type: 'text', width: 'w-48' },
  { type: 'actions', align: 'right', stickyRight: true, width: 'w-16' },
];

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [referenceId, setReferenceId] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(type);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const { data: response, isLoading, isError, error, refetch } = useGetAuditTrailQuery({
    pageNumber: page,
    pageSize,
    referenceId: referenceId || undefined,
    module: moduleFilter || undefined,
    action: actionFilter || undefined,
  });

  const auditEvents = response?.data?.items || response?.data?.data || [];
  const totalCount = response?.data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const modules = [
    'AdminUser', 'RetailKyc', 'CorporateOnboard', 'InvestmentEducation', 
    'MutualFundContent', 'PortfolioSettings', 'CashInflowGLs', 'SystemConfig', 
    'Learn', 'Support'
  ];

  const actions = ['Initiated', 'Approved', 'Rejected', 'Created', 'Updated', 'Deleted'];

  const moduleOptions = [
    { value: '', label: 'All Modules' },
    ...modules.map(m => ({ value: m, label: m.replace(/([A-Z])/g, ' $1').trim() }))
  ];

  const actionOptions = [
    { value: '', label: 'All Actions' },
    ...actions.map(a => ({ value: a, label: a }))
  ];

  const getStatusPill = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'approved':
      case 'created':
      case 'success':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'rejected':
      case 'deleted':
        return 'text-red-700 bg-red-50 border border-red-200';
      case 'updated':
      case 'initiated':
      case 'requested':
        return 'text-teal-700 bg-teal-50 border border-teal-200';
      default:
        return 'text-gray-700 bg-gray-50 border border-gray-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleClearFilters = () => {
    setModuleFilter('');
    setActionFilter('');
    setReferenceId('');
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-2.5 max-w-[1600px] mx-auto h-full">
      {/* Page Header */}
      <div className="mb-0.5">
        <h1 className="text-lg font-medium text-gray-900 dark:text-white">Activity Logs</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Audit trail of administrative actions and system events.
        </p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md flex flex-col flex-1 shadow-none overflow-hidden">
        
        {/* Always-Visible Filter Toolbar */}
        <div className="p-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search by Reference ID */}
            <div className="relative min-w-[200px] max-w-xs flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Filter by Reference ID..."
                value={referenceId}
                onChange={(e) => {
                  setReferenceId(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#961A1C] transition-colors"
              />
            </div>

            {/* Module Filter (Ant Design Select) */}
            <div className="w-44">
              <Select
                value={moduleFilter || ''}
                onChange={(val) => { setModuleFilter(val); setPage(1); }}
                options={moduleOptions}
                size="small"
                className="w-full text-xs"
                popupMatchSelectWidth={false}
              />
            </div>

            {/* Action Filter (Ant Design Select) */}
            <div className="w-36">
              <Select
                value={actionFilter || ''}
                onChange={(val) => { setActionFilter(val); setPage(1); }}
                options={actionOptions}
                size="small"
                className="w-full text-xs"
                popupMatchSelectWidth={false}
              />
            </div>

            {/* Clear Filters Button */}
            {(moduleFilter || actionFilter || referenceId) && (
              <button 
                onClick={handleClearFilters}
                className="px-2 py-1 text-xs text-gray-500 hover:text-[#961A1C] flex items-center gap-1 transition-colors"
                title="Reset filters"
              >
                <X size={13} />
                Reset
              </button>
            )}
          </div>

          {/* Record Count */}
          <div className="text-[11px] text-gray-400 font-mono">
            {totalCount > 0 && `${totalCount} records`}
          </div>
        </div>

        {/* Table Content */}
        {isError ? (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Failed to load activity logs</h3>
            <button onClick={() => refetch()} className="mt-3 px-3 py-1.5 bg-[#961A1C] text-white rounded text-xs font-medium hover:bg-[#7a1517] transition-colors cursor-pointer">
              Try Again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100/75 dark:bg-gray-800/80 uppercase tracking-wider font-mono">
                <tr>
                  <th className="px-3 py-2 w-10 text-center border-b border-r border-gray-200 dark:border-gray-700">
                    <input type="checkbox" className="rounded-sm border-gray-300 text-[#961A1C] focus:ring-[#961A1C]" />
                  </th>
                  <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Timestamp</th>
                  <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Actor</th>
                  <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Module</th>
                  <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Action</th>
                  <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Reference ID</th>
                  <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 w-full">Action Details</th>
                  <th className="px-3 py-2 w-16 text-right border-b border-gray-200 dark:border-gray-700 sticky right-0 bg-gray-100 dark:bg-gray-800 z-10 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.06)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-sans">
                {isLoading ? (
                  <TableSkeletonRows rows={8} columns={ACTIVITY_LOGS_SKELETON_COLS} />
                ) : auditEvents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-200 dark:border-gray-700">
                        <FileText size={24} className="text-gray-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No audit records found</h3>
                      <p className="text-xs text-gray-500">Try adjusting your filters or search query.</p>
                    </td>
                  </tr>
                ) : (
                  auditEvents.map((event, index) => (
                  <tr key={event.id || index} className="hover:bg-blue-50/20 dark:hover:bg-gray-800/40 transition-colors group">
                    <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800">
                      <input type="checkbox" className="rounded-sm border-gray-300 text-[#961A1C] focus:ring-[#961A1C] cursor-pointer" />
                    </td>
                    <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                      {formatDate(event.createdAt || event.timestamp)}
                    </td>
                    <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 text-[10px] font-bold text-gray-600 dark:text-gray-300">
                          {event.performedByName ? event.performedByName.charAt(0).toUpperCase() : <User size={10} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-gray-100 leading-tight">
                            {event.performedByName || 'Unknown'}
                          </span>
                          {(event.performedByRole || event.performedByEmail) && (
                            <span className="text-[10px] text-gray-400 font-mono leading-tight">
                              {event.performedByRole || event.performedByEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap font-mono text-[11px] text-gray-700 dark:text-gray-300">
                      {event.module?.replace(/([A-Z])/g, ' $1').trim() || 'System'}
                    </td>
                    <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold ${getStatusPill(event.action)}`}>
                        {event.action}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                      {event.referenceId ? (
                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">
                          {event.referenceId}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 text-xs min-w-[200px]" title={event.description}>
                      {event.description || '—'}
                    </td>
                    <td className="px-3 py-2 align-middle border-b border-gray-200 dark:border-gray-800 text-right whitespace-nowrap sticky right-0 bg-white dark:bg-gray-900 z-10 group-hover:bg-gray-50 dark:group-hover:bg-gray-850 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.06)]">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setSelectedEvent(event)}
                          className="text-[11px] font-medium text-[#961A1C] hover:bg-[#961A1C]/10 px-2.5 py-0.5 rounded border border-[#961A1C]/20 hover:border-[#961A1C]/40 transition-colors"
                        >
                          Details
                        </button>
                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: 'view',
                                label: 'View Details',
                                icon: <FileText size={13} />,
                                onClick: () => setSelectedEvent(event),
                              },
                              ...(event.referenceId ? [{
                                key: 'copy-ref',
                                label: 'Copy Reference ID',
                                icon: <Copy size={13} />,
                                onClick: () => handleCopy(event.referenceId!, 'ref'),
                              }] : []),
                              ...(event.id ? [{
                                key: 'copy-id',
                                label: 'Copy Event ID',
                                icon: <Copy size={13} />,
                                onClick: () => handleCopy(event.id!, 'id'),
                              }] : []),
                            ],
                          }}
                          trigger={['click']}
                          placement="bottomRight"
                        >
                          <button 
                            className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="More options"
                          >
                            <MoreVertical size={13} />
                          </button>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && !isError && auditEvents.length > 0 && (
          <div className="flex items-center justify-between px-3.5 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 mt-auto text-xs">
            <span className="text-gray-500 font-mono text-[11px]">
              Showing {auditEvents.length} of {totalCount} records
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-mono text-[11px]">Page {page} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="p-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Drawer Overlay */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Activity Details</h3>
                <button onClick={() => setSelectedEvent(null)} className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors bg-gray-100 dark:bg-gray-800">
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Date & Time</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedEvent.createdAt || selectedEvent.timestamp)}</p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Actor</label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                      {selectedEvent.performedByName ? (
                        <span className="font-bold text-gray-500 text-sm uppercase">
                          {selectedEvent.performedByName.charAt(0)}
                        </span>
                      ) : (
                        <User size={18} className="text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedEvent.performedByName || 'Unknown User'}</p>
                      {(selectedEvent.performedByEmail || selectedEvent.performedByRole) && (
                        <p className="text-xs text-gray-500">{selectedEvent.performedByEmail || selectedEvent.performedByRole}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Module & Action</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {selectedEvent.module?.replace(/([A-Z])/g, ' $1').trim() || 'System'}
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${getStatusPill(selectedEvent.action)}`}>
                      {selectedEvent.action}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Description</label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3.5 rounded-lg leading-relaxed border border-gray-100 dark:border-gray-700/50">
                    {selectedEvent.description || 'No additional details provided.'}
                  </p>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Event ID</label>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                      <span className="font-mono text-xs text-gray-600 dark:text-gray-300 truncate mr-2">{selectedEvent.id || 'N/A'}</span>
                      {selectedEvent.id && (
                        <button onClick={() => handleCopy(selectedEvent.id, 'id')} className="p-1.5 text-gray-400 hover:text-[#961A1C] transition-colors bg-white dark:bg-gray-900 shadow-sm rounded-md border border-gray-200 dark:border-gray-700 shrink-0">
                          {copiedId === 'id' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {selectedEvent.referenceId && (
                    <div>
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Reference ID</label>
                      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                        <span className="font-mono text-xs text-gray-600 dark:text-gray-300 truncate mr-2">{selectedEvent.referenceId}</span>
                        <button onClick={() => handleCopy(selectedEvent.referenceId, 'ref')} className="p-1.5 text-gray-400 hover:text-[#961A1C] transition-colors bg-white dark:bg-gray-900 shadow-sm rounded-md border border-gray-200 dark:border-gray-700 shrink-0">
                          {copiedId === 'ref' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
