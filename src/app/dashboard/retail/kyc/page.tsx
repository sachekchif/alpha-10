'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Dropdown, Drawer, MenuProps, Modal } from 'antd';
import { 
  FileText, CheckCircle2, XCircle, Clock, Search, Filter, 
  MoreVertical, Eye, AlertTriangle, User, RefreshCw, Loader2, Check, X
} from 'lucide-react';
import {
  useGetPendingKycQuery,
  useApproveKycMutation,
  useRejectKycMutation,
  KycProfile,
} from '@/auth/services/retailApi';

export default function KycPage() {
  const [activeTab, setActiveTab] = useState('Pending Review');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKyc, setSelectedKyc] = useState<KycProfile | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // RTK Query
  const { data: pendingData, isLoading, isFetching, refetch } = useGetPendingKycQuery();
  const [approveKyc, { isLoading: approving }] = useApproveKycMutation();
  const [rejectKyc, { isLoading: rejecting }] = useRejectKycMutation();

  const kycItems: KycProfile[] = pendingData?.data?.items || pendingData?.data?.data || [];

  const tabs = ['Pending Review', 'All'];

  const filteredRequests = kycItems.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const title = (item.title || '').toLowerCase();
      const names = (item.otherNames || '').toLowerCase();
      const emp = (item.employerName || '').toLowerCase();
      const bkn = (item.bankName || '').toLowerCase();
      return title.includes(q) || names.includes(q) || emp.includes(q) || bkn.includes(q);
    }
    return true;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openReviewDrawer = (kycItem: KycProfile) => {
    setSelectedKyc(kycItem);
    setDrawerOpen(true);
  };

  const handleApprove = async (userId?: string) => {
    if (!userId) return;
    try {
      await approveKyc(userId).unwrap();
      showToast('KYC submission approved and Symplus customer created!');
      setDrawerOpen(false);
      refetch();
    } catch {
      showToast('Failed to approve KYC.');
    }
  };

  const handleReject = async () => {
    if (!selectedKyc?.userId) return;
    try {
      await rejectKyc({ id: selectedKyc.userId, body: { remarks: rejectionRemarks } }).unwrap();
      showToast('KYC submission rejected.');
      setRejectModalOpen(false);
      setDrawerOpen(false);
      setRejectionRemarks('');
      refetch();
    } catch {
      showToast('Failed to reject KYC.');
    }
  };

  const getMenuItems = (item: KycProfile): MenuProps['items'] => [
    {
      key: 'review',
      label: (
        <span onClick={() => openReviewDrawer(item)} className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200 py-0.5">
          <Eye size={14} className="text-gray-500" /> Review Verification File
        </span>
      ),
    },
    {
      key: 'view-profile',
      label: (
        <Link href={`/dashboard/retail/customers/${item.userId}`} className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 py-0.5">
          <User size={14} className="text-gray-500" /> View Customer Profile
        </Link>
      ),
    },
    {
      key: 'approve',
      label: (
        <span onClick={() => handleApprove(item.userId)} className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 py-0.5">
          <CheckCircle2 size={14} /> Approve Verification
        </span>
      ),
    },
    { type: 'divider' },
    {
      key: 'reject',
      label: (
        <span
          onClick={() => {
            setSelectedKyc(item);
            setRejectModalOpen(true);
          }}
          className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 py-0.5"
        >
          <XCircle size={14} /> Reject Request
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto font-sans relative">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700">
          <CheckCircle2 className="text-green-400" size={18} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight uppercase">
            KYC Verification Queue
          </h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
            Review and approve pending identity submissions for retail customer accounts
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 transition"
        >
          {isFetching ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Refresh Queue
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === tab
                    ? 'bg-[#961A1C] text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, employer, bank..."
              className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-4 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px] relative">
          {isLoading || isFetching ? (
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-[#961A1C]" size={32} />
            </div>
          ) : null}

          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-mono">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase">User / Names</th>
                <th className="px-4 py-3 font-semibold uppercase">ID Doc Info</th>
                <th className="px-4 py-3 font-semibold uppercase">Employer / Bank</th>
                <th className="px-4 py-3 font-semibold uppercase">Nationality</th>
                <th className="px-4 py-3 font-semibold uppercase">Status</th>
                <th className="px-4 py-3 font-semibold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 font-sans">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-xs font-mono">
                    No pending KYC submissions in queue.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req, idx) => {
                  const names = `${req.title || ''} ${req.otherNames || 'Customer'}`.trim();
                  return (
                    <tr
                      key={req.id || req.userId || idx}
                      onClick={() => openReviewDrawer(req)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition cursor-pointer"
                    >
                      <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                        <div>{names}</div>
                        <div className="text-[10px] text-gray-400 font-mono font-normal">ID: {req.userId}</div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 font-mono">
                        <div>{req.identityDocType || req.identityDocName || 'ID Document'}</div>
                        <div className="text-[10px] text-gray-400">{req.identityDocNumber || 'No doc number'}</div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">
                        <div>{req.employerName || '—'}</div>
                        <div className="text-[10px] text-gray-400">{req.bankName ? `${req.bankName} (${req.bankAccountNumber || ''})` : ''}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-gray-600 dark:text-gray-300">
                        {req.nationality || 'Nigerian'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400">
                          {req.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <Dropdown menu={{ items: getMenuItems(req) }} trigger={['click']} placement="bottomRight">
                          <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition">
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
      </div>

      {/* Review Drawer */}
      <Drawer
        title={<span className="font-mono text-sm font-bold uppercase text-gray-900 dark:text-white">KYC Verification File</span>}
        placement="right"
        width={560}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedKyc && (
          <div className="space-y-6 text-xs font-sans">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">User ID:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedKyc.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Full Names:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedKyc.title || ''} {selectedKyc.otherNames || ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nationality:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedKyc.nationality || '—'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-mono font-bold uppercase text-gray-900 dark:text-white">Identification Details</h4>
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <div>
                  <span className="text-gray-400">Doc Type</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedKyc.identityDocType || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Doc Number</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 font-mono">{selectedKyc.identityDocNumber || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400">National ID</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 font-mono">{selectedKyc.nationalId || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Issue Authority</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedKyc.identityDocIssueAuthority || '—'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-mono font-bold uppercase text-gray-900 dark:text-white">Employment & Bank Info</h4>
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <div>
                  <span className="text-gray-400">Employer</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedKyc.employerName || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Job Title</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedKyc.employmentJobTitle || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Bank Name</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedKyc.bankName || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Account Number</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 font-mono">{selectedKyc.bankAccountNumber || '—'}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => handleApprove(selectedKyc.userId)}
                disabled={approving}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                {approving ? <Loader2 className="animate-spin" size={14} /> : <Check size={16} />}
                Approve KYC
              </button>
              <button
                onClick={() => setRejectModalOpen(true)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                <X size={16} />
                Reject KYC
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Reject Modal */}
      <Modal
        title={<span className="font-mono text-sm font-bold uppercase text-red-600">Reject KYC Submission</span>}
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        footer={null}
        width={400}
      >
        <div className="space-y-4 pt-2 text-xs font-sans">
          <p className="text-gray-600 dark:text-gray-300">
            Please enter the reason for rejecting this customer&apos;s KYC submission:
          </p>
          <textarea
            rows={3}
            value={rejectionRemarks}
            onChange={(e) => setRejectionRemarks(e.target.value)}
            placeholder="e.g. Identity document number unreadable or expired."
            className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={rejecting || !rejectionRemarks.trim()}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              {rejecting ? <Loader2 className="animate-spin" size={14} /> : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
