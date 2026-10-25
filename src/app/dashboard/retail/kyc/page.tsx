'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Dropdown, Drawer, MenuProps, Modal, Tag } from 'antd';
import { 
  FileText, CheckCircle2, XCircle, Clock, Search, Filter, 
  MoreVertical, Eye, AlertTriangle, User, RefreshCw, Loader2, 
  Check, X, Copy, ShieldCheck, Building2, Phone, Mail, 
  CreditCard, ExternalLink, Calendar, MapPin, UserCheck, ShieldAlert
} from 'lucide-react';
import {
  useGetPendingKycQuery,
  useApproveKycMutation,
  useRejectKycMutation,
  PendingKycItem,
  KycProfile,
  RetailUser,
} from '@/auth/services/retailApi';

function CopyButton({ text, label }: { text?: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  if (!text || text === '—' || text === 'None' || text === 'Not Assigned') return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied!' : `Copy ${label || 'text'}`}
      className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer inline-flex items-center gap-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/60 shrink-0"
    >
      {copied ? (
        <Check size={12} className="text-emerald-600 animate-in zoom-in" />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
}

export interface NormalizedKycRecord {
  id: string;
  userId: string;
  customerId?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  username?: string;
  email?: string;
  phone?: string;
  bvn?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  occupation?: string;
  employerName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  identityDocType?: string;
  identityDocNumber?: string;
  identityDocExpiryDate?: string;
  motherMaidenName?: string;
  nationalId?: string;
  status: string;
  kycLevel?: number;
  dateCreated?: string;
  rawProfile?: Partial<RetailUser>;
  rawKyc?: Partial<KycProfile>;
}

export default function KycPage() {
  const [activeTab, setActiveTab] = useState<'Pending' | 'All'>('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<NormalizedKycRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // In-drawer confirmation modal for Approval
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [recordToApprove, setRecordToApprove] = useState<NormalizedKycRecord | null>(null);

  // In-drawer Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // RTK Query
  const { data: pendingData, isLoading, isFetching, refetch } = useGetPendingKycQuery();
  const [approveKyc, { isLoading: approving }] = useApproveKycMutation();
  const [rejectKyc, { isLoading: rejecting }] = useRejectKycMutation();

  // Normalize API response shape: supports both [{ profile, kyc }] and flat KycProfile[]
  const normalizedRecords = useMemo<NormalizedKycRecord[]>(() => {
    const rawData = pendingData?.data;
    let items: any[] = [];
    if (Array.isArray(rawData)) {
      items = rawData;
    } else if (rawData && typeof rawData === 'object') {
      items = Array.isArray((rawData as any).items)
        ? (rawData as any).items
        : Array.isArray((rawData as any).data)
        ? (rawData as any).data
        : [];
    }

    return items.map((item, index) => {
      // Shape 1: Wrapped object { profile: RetailUser, kyc: KycProfile }
      if (item && (item.profile || item.kyc)) {
        const prof = item.profile || {};
        const k = item.kyc || {};
        const userId = prof.id || k.userId || `kyc-user-${index}`;
        const fullName = `${prof.firstName || ''} ${prof.middleName ? prof.middleName + ' ' : ''}${prof.lastName || ''}`.trim() 
          || k.otherNames 
          || prof.username 
          || 'Retail Customer';
        const address = [prof.addressStreet, prof.addressCity, prof.addressState, prof.addressCountry].filter(Boolean).join(', ')
          || k.addressCountry 
          || '—';

        return {
          id: k.id || prof.id || `kyc-${index}`,
          userId,
          customerId: k.customerId || '—',
          fullName,
          firstName: prof.firstName,
          lastName: prof.lastName,
          middleName: prof.middleName,
          username: prof.username,
          email: prof.email || k.alternateEmailAddress,
          phone: prof.phoneNumber || k.alternatePhoneNumber,
          bvn: prof.bvn,
          gender: prof.gender,
          dateOfBirth: prof.dateOfBirth,
          address,
          occupation: k.occupation || k.employmentJobTitle || '—',
          employerName: k.employerName || '—',
          bankName: k.bankName || '—',
          bankAccountNumber: k.bankAccountNumber || '—',
          identityDocType: k.identityDocType || k.identityDocName || 'National ID',
          identityDocNumber: k.identityDocNumber || k.nationalId || '—',
          identityDocExpiryDate: k.identityDocExpiryDate || '—',
          motherMaidenName: k.motherMaidenName || '—',
          nationalId: k.nationalId,
          status: k.status || prof.status || 'Pending',
          kycLevel: k.kycLevel || 40,
          dateCreated: k.dateCreated || prof.createdAt,
          rawProfile: prof,
          rawKyc: k,
        };
      }

      // Shape 2: Flat KycProfile
      const k = item || {};
      const fullName = `${k.title || ''} ${k.otherNames || 'Customer'}`.trim();
      const address = [k.addressStreet, k.addressCity, k.addressState, k.addressCountry].filter(Boolean).join(', ') || '—';

      return {
        id: k.id || `kyc-${index}`,
        userId: k.userId || `user-${index}`,
        customerId: k.customerId || '—',
        fullName,
        firstName: k.title,
        lastName: k.otherNames,
        username: undefined,
        email: k.alternateEmailAddress || '—',
        phone: k.alternatePhoneNumber || '—',
        bvn: '—',
        gender: '—',
        dateOfBirth: '—',
        address,
        occupation: k.occupation || k.employmentJobTitle || '—',
        employerName: k.employerName || '—',
        bankName: k.bankName || '—',
        bankAccountNumber: k.bankAccountNumber || '—',
        identityDocType: k.identityDocType || k.identityDocName || 'ID Document',
        identityDocNumber: k.identityDocNumber || k.nationalId || '—',
        identityDocExpiryDate: k.identityDocExpiryDate || '—',
        motherMaidenName: k.motherMaidenName || '—',
        nationalId: k.nationalId,
        status: k.status || 'Pending',
        kycLevel: k.kycLevel || 0,
        dateCreated: k.dateCreated || k.createdAt,
        rawProfile: {},
        rawKyc: k,
      };
    });
  }, [pendingData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // KPI Metrics Calculation
  const totalQueueCount = normalizedRecords.length;
  const pendingCount = normalizedRecords.filter((r) => r.status.toLowerCase() === 'pending').length;
  const highTierCount = normalizedRecords.filter((r) => (r.kycLevel || 0) >= 40).length;

  const filteredRequests = useMemo(() => {
    let result = normalizedRecords;

    if (activeTab === 'Pending') {
      result = result.filter((r) => r.status.toLowerCase() === 'pending');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          (r.email || '').toLowerCase().includes(q) ||
          (r.phone || '').toLowerCase().includes(q) ||
          (r.bvn || '').toLowerCase().includes(q) ||
          (r.customerId || '').toLowerCase().includes(q) ||
          (r.employerName || '').toLowerCase().includes(q) ||
          (r.bankName || '').toLowerCase().includes(q) ||
          (r.identityDocNumber || '').toLowerCase().includes(q) ||
          r.userId.toLowerCase().includes(q)
      );
    }

    return result;
  }, [normalizedRecords, activeTab, searchQuery]);

  const openReviewDrawer = (record: NormalizedKycRecord) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  const handleTriggerApprove = (record: NormalizedKycRecord) => {
    setRecordToApprove(record);
    setApproveConfirmOpen(true);
  };

  const executeApproval = async () => {
    if (!recordToApprove?.userId) return;
    try {
      await approveKyc(recordToApprove.userId).unwrap();
      showToast(`KYC submission approved for ${recordToApprove.fullName}!`);
      setApproveConfirmOpen(false);
      setDrawerOpen(false);
      setRecordToApprove(null);
      refetch();
    } catch {
      showToast('Failed to approve KYC verification.');
    }
  };

  const handleTriggerReject = (record: NormalizedKycRecord) => {
    setSelectedRecord(record);
    setRejectModalOpen(true);
  };

  const executeRejection = async () => {
    if (!selectedRecord?.userId) return;
    try {
      await rejectKyc({ id: selectedRecord.userId, body: { remarks: rejectionRemarks } }).unwrap();
      showToast(`KYC submission rejected for ${selectedRecord.fullName}.`);
      setRejectModalOpen(false);
      setDrawerOpen(false);
      setRejectionRemarks('');
      refetch();
    } catch {
      showToast('Failed to reject KYC verification.');
    }
  };

  const getMenuItems = (record: NormalizedKycRecord): MenuProps['items'] => [
    {
      key: 'review',
      label: (
        <span onClick={() => openReviewDrawer(record)} className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200 py-0.5 cursor-pointer">
          <Eye size={14} className="text-gray-500" /> Review Verification File
        </span>
      ),
    },
    {
      key: 'view-profile',
      label: (
        <Link href={`/dashboard/retail/customers/${record.userId}`} className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 py-0.5">
          <User size={14} className="text-gray-500" /> View Customer Profile
        </Link>
      ),
    },
    {
      key: 'approve',
      label: (
        <span onClick={() => handleTriggerApprove(record)} className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 py-0.5 cursor-pointer">
          <CheckCircle2 size={14} /> Approve Verification
        </span>
      ),
    },
    { type: 'divider' },
    {
      key: 'reject',
      label: (
        <span
          onClick={() => handleTriggerReject(record)}
          className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 py-0.5 cursor-pointer"
        >
          <XCircle size={14} /> Reject Request
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto font-sans relative">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700 animate-in fade-in">
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
          className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer shadow-2xs"
        >
          {isFetching ? <Loader2 size={14} className="animate-spin text-[#961A1C]" /> : <RefreshCw size={14} />}
          Refresh Queue
        </button>
      </div>

      {/* KPI Cards Row (Matching Admin & Customer Hub Designs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 font-semibold block">
              Total In Queue
            </span>
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono mt-1">
              {totalQueueCount}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">Submitted KYC requests</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
            <FileText size={20} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 font-semibold block">
              Pending Review
            </span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">
              {pendingCount}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">Awaiting compliance verification</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 font-semibold block">
              Tier 40+ Submissions
            </span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono mt-1">
              {highTierCount}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">High-tier upgrade requests</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      {/* Main Table Card (Site-Wide Spreadsheet Grid Design) */}
      <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden shadow-none font-sans">
        {/* Toolbar */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="flex items-center gap-1.5 self-start md:self-auto">
            {(['Pending', 'All'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#961A1C] text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab === 'Pending' ? `Pending Review (${pendingCount})` : `All Submissions (${totalQueueCount})`}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, BVN, phone, employer..."
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-1.5 pl-8 pr-3 rounded text-xs focus:outline-none focus:border-[#961A1C] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto min-h-[300px] relative">
          {isLoading || isFetching ? (
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-[#961A1C]" size={28} />
            </div>
          ) : null}

          <table className="w-full text-left text-xs border-collapse">
            <thead className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100/75 dark:bg-gray-800/80 uppercase tracking-wider font-mono">
              <tr>
                <th className="px-3 py-2 w-10 text-center border-b border-r border-gray-200 dark:border-gray-700">#</th>
                <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 min-w-[220px]">Customer Profile</th>
                <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 min-w-[200px]">ID Document & BVN</th>
                <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 min-w-[170px]">Employment & Role</th>
                <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 min-w-[170px]">Settlement Bank</th>
                <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 text-center whitespace-nowrap">Tier / Status</th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-right w-24 sticky right-0 bg-gray-100 dark:bg-gray-800 z-10 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.06)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-sans">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center border-b border-gray-200 dark:border-gray-800">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2.5 border border-gray-200 dark:border-gray-700">
                      <ShieldCheck size={20} className="text-gray-400" />
                    </div>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">
                      No Pending KYC Submissions
                    </h4>
                    <p className="text-[11px] text-gray-500 font-mono">
                      All submitted customer verification records have been processed.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((record, idx) => {
                  const initials = `${record.firstName?.[0] || ''}${record.lastName?.[0] || ''}`.toUpperCase() || 'CU';

                  return (
                    <tr
                      key={record.id}
                      onClick={() => openReviewDrawer(record)}
                      className="hover:bg-blue-50/20 dark:hover:bg-gray-800/40 transition-colors cursor-pointer group"
                    >
                      {/* S/N */}
                      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                        #{idx + 1}
                      </td>

                      {/* Customer Profile */}
                      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#961A1C] to-[#500e10] flex items-center justify-center text-white text-xs font-mono font-bold shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[160px]">
                                {record.fullName}
                              </span>
                              {record.customerId && record.customerId !== '—' && (
                                <span className="text-[10px] text-gray-400 font-mono">({record.customerId})</span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono truncate max-w-[180px]">
                              {record.email || '—'}
                            </div>
                            {record.phone && (
                              <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                                <span>{record.phone}</span>
                                <CopyButton text={record.phone} label="Phone" />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* ID Document & BVN */}
                      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="text-[11px] font-semibold text-gray-900 dark:text-white">
                              {record.identityDocType}
                            </span>
                            <span className="text-[10px] text-gray-500">#{record.identityDocNumber}</span>
                            <CopyButton text={record.identityDocNumber} label="Doc Number" />
                          </div>
                          {record.bvn && record.bvn !== '—' && (
                            <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                              <span>BVN: <strong className="text-gray-700 dark:text-gray-300">{record.bvn}</strong></span>
                              <CopyButton text={record.bvn} label="BVN" />
                            </div>
                          )}
                          {record.identityDocExpiryDate && record.identityDocExpiryDate !== '—' && (
                            <div className="text-[10px] text-gray-400 font-mono">
                              Exp: {record.identityDocExpiryDate}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Employment & Role */}
                      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[160px]">
                            {record.employerName}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate max-w-[160px]">
                            {record.occupation}
                          </div>
                        </div>
                      </td>

                      {/* Settlement Bank */}
                      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[160px]">
                            {record.bankName}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                            <span>{record.bankAccountNumber}</span>
                            <CopyButton text={record.bankAccountNumber} label="Bank Account" />
                          </div>
                        </div>
                      </td>

                      {/* Tier / Status */}
                      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            {record.status}
                          </span>
                          {record.kycLevel ? (
                            <span className="text-[9px] font-mono font-bold text-blue-600 dark:text-blue-400">
                              Level {record.kycLevel}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="px-3 py-2 align-middle border-b border-gray-200 dark:border-gray-800 text-right whitespace-nowrap sticky right-0 bg-white dark:bg-gray-900 z-10 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.06)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openReviewDrawer(record)}
                            className="px-2 py-1 text-[11px] font-semibold text-[#961A1C] hover:bg-[#961A1C]/10 rounded border border-[#961A1C]/30 transition-colors cursor-pointer"
                          >
                            Review
                          </button>
                          <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']} placement="bottomRight">
                            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition cursor-pointer">
                              <MoreVertical size={14} />
                            </button>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Drawer (Unboxed Key-Value Layout per UI Guidelines) */}
      <Drawer
        title={
          <div className="flex items-center justify-between w-full pr-2">
            <span className="font-mono text-sm font-bold uppercase text-gray-900 dark:text-white">
              KYC Verification File
            </span>
            {selectedRecord?.customerId && selectedRecord.customerId !== '—' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                Cust #{selectedRecord.customerId}
              </span>
            )}
          </div>
        }
        placement="right"
        width={540}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedRecord && (
          <div className="space-y-6 text-xs font-sans pb-10">
            {/* Customer Identification Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedRecord.fullName}
                </h3>
                {selectedRecord.username && (
                  <p className="text-gray-400 font-mono text-xs">@{selectedRecord.username}</p>
                )}
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                {selectedRecord.status} (Tier {selectedRecord.kycLevel || 40})
              </span>
            </div>

            {/* Section 1: Personal Demographic Details (Unboxed key-value pairs) */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
                Personal Demographics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-[11px] block">First Name</span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selectedRecord.firstName || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Last Name</span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selectedRecord.lastName || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Date of Birth</span>
                  <p className="font-semibold text-gray-900 dark:text-white font-mono text-sm mt-0.5">{selectedRecord.dateOfBirth || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Gender</span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selectedRecord.gender || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Bank Verification Number (BVN)</span>
                  <div className="flex items-center gap-1 mt-0.5 font-mono text-sm font-semibold text-gray-900 dark:text-white">
                    <span>{selectedRecord.bvn || '—'}</span>
                    <CopyButton text={selectedRecord.bvn} label="BVN" />
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Mother&apos;s Maiden Name</span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selectedRecord.motherMaidenName || '—'}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Section 2: Contact & Location */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
                Contact & Residential Details
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-[11px] block">Email Address</span>
                  <div className="flex items-center gap-1 mt-0.5 font-mono text-sm font-semibold text-gray-900 dark:text-white">
                    <span>{selectedRecord.email || '—'}</span>
                    <CopyButton text={selectedRecord.email} label="Email" />
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Primary Phone Number</span>
                  <div className="flex items-center gap-1 mt-0.5 font-mono text-sm font-semibold text-gray-900 dark:text-white">
                    <span>{selectedRecord.phone || '—'}</span>
                    <CopyButton text={selectedRecord.phone} label="Phone" />
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Residential Address</span>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5 text-xs">{selectedRecord.address}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Section 3: Identity & Verification Document */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
                Identification Document
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-[11px] block">Document Type</span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selectedRecord.identityDocType || 'National ID'}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Document Number</span>
                  <div className="flex items-center gap-1 mt-0.5 font-mono text-sm font-semibold text-gray-900 dark:text-white">
                    <span>{selectedRecord.identityDocNumber || '—'}</span>
                    <CopyButton text={selectedRecord.identityDocNumber} label="Doc Number" />
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Document Expiry</span>
                  <p className="font-semibold text-gray-900 dark:text-white font-mono text-sm mt-0.5">{selectedRecord.identityDocExpiryDate || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Submission Timestamp</span>
                  <p className="font-semibold text-gray-900 dark:text-white font-mono text-xs mt-0.5">
                    {selectedRecord.dateCreated ? new Date(selectedRecord.dateCreated).toLocaleString('en-GB') : '—'}
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Section 4: Employment & Settlement Bank */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
                Employment & Settlement Account
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-[11px] block">Employer Name</span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selectedRecord.employerName}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Occupation</span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selectedRecord.occupation}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Bank Name</span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selectedRecord.bankName}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Bank Account Number</span>
                  <div className="flex items-center gap-1 mt-0.5 font-mono text-sm font-semibold text-gray-900 dark:text-white">
                    <span>{selectedRecord.bankAccountNumber}</span>
                    <CopyButton text={selectedRecord.bankAccountNumber} label="Bank Account" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Profile Link */}
            <div className="pt-2">
              <Link
                href={`/dashboard/retail/customers/${selectedRecord.userId}`}
                className="w-full py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 transition"
              >
                <ExternalLink size={14} /> Open Customer 360 Profile
              </Link>
            </div>

            {/* Bottom Actions with In-Drawer Confirmation */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => handleTriggerApprove(selectedRecord)}
                disabled={approving}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs text-xs"
              >
                {approving ? <Loader2 className="animate-spin" size={14} /> : <Check size={16} />}
                Approve KYC Verification
              </button>
              <button
                onClick={() => handleTriggerReject(selectedRecord)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs text-xs"
              >
                <X size={16} />
                Reject Verification
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Confirmation Modal for KYC Approval */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-mono text-sm font-bold uppercase text-emerald-600 border-b border-gray-100 dark:border-gray-800 pb-2">
            <CheckCircle2 size={16} /> Confirm KYC Approval
          </div>
        }
        open={approveConfirmOpen}
        onCancel={() => {
          setApproveConfirmOpen(false);
          setRecordToApprove(null);
        }}
        footer={null}
        width={420}
      >
        <div className="space-y-4 pt-3 text-xs font-sans">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to approve the KYC submission for{' '}
            <strong className="text-gray-900 dark:text-white font-semibold">
              {recordToApprove?.fullName}
            </strong>
            ?
          </p>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 font-mono text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Customer ID:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{recordToApprove?.customerId || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">User ID:</span>
              <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">{recordToApprove?.userId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">KYC Level:</span>
              <span className="font-bold text-emerald-600">Upgrade to Tier {recordToApprove?.kycLevel || 40}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                setApproveConfirmOpen(false);
                setRecordToApprove(null);
              }}
              className="px-3.5 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-md transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={executeApproval}
              disabled={approving}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {approving ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
              Confirm Approval
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-mono text-sm font-bold uppercase text-red-600 border-b border-gray-100 dark:border-gray-800 pb-2">
            <XCircle size={16} /> Reject KYC Submission
          </div>
        }
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        footer={null}
        width={420}
      >
        <div className="space-y-4 pt-3 text-xs font-sans">
          <p className="text-gray-600 dark:text-gray-300">
            Please enter the reason for rejecting{' '}
            <strong className="text-gray-900 dark:text-white font-semibold">
              {selectedRecord?.fullName}
            </strong>
            &apos;s KYC submission:
          </p>
          <textarea
            rows={3}
            value={rejectionRemarks}
            onChange={(e) => setRejectionRemarks(e.target.value)}
            placeholder="e.g. Identity document number unreadable or expired."
            className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-[#961A1C]"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-md hover:bg-gray-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={executeRejection}
              disabled={rejecting || !rejectionRemarks.trim()}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md flex items-center gap-1.5 disabled:opacity-50 transition cursor-pointer shadow-2xs"
            >
              {rejecting ? <Loader2 size={13} className="animate-spin" /> : <X size={14} />}
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
