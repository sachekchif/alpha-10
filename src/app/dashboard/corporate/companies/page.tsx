'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, Search, Filter, Plus, Eye, MoreHorizontal,
  CreditCard, ChevronRight, X, Clock, XCircle, ArrowUpRight,
  ArrowDownRight, RefreshCw, AlertCircle, CheckCircle2, ShieldAlert,
  Lock, Unlock, Key, Mail, Phone, FileText, UserCheck, Copy, Check,
  Loader2, Globe, Tag
} from 'lucide-react';
import { Drawer, Form, Select, DatePicker, Space, Button } from 'antd';
import {
  useGetCorporateUsersQuery,
  useLazyGetCorporateUserByCashAccountQuery,
  useLazyGetCorporateUserByBvnQuery,
  useLazyGetCorporateUserByEmailQuery,
  useLazyGetCorporateUserByPhoneQuery,
  useLazyPullCorporateCustomerByIdQuery,
  useOnboardCorporateUserMutation,
  useApproveCorporateOnboardingMutation,
  useBlockCorporateUserMutation,
  useResetCorporateUserPasswordMutation,
  CorporateUser,
  CorporateOnboardingPayload,
} from '@/auth/services/corporateApi';

function CopyButton({ text, label }: { text?: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  if (!text || text === '—' || text === 'Not Assigned') return null;

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

const mockCompanies: CorporateUser[] = [
  {
    id: 'corp-67bc3c5a-2e8a-4f64-a4ea-435ff62cf292',
    companyName: 'TechCorp Innovations Ltd',
    companyEmail: 'contact@techcorp.ng',
    companyPhoneNumber: '08031234567',
    companyAddress: '12 Marina Road, Victoria Island, Lagos',
    companyRegistrationNumber: 'RC-2024-001',
    taxIdentificationNumber: 'TIN-98765432-001',
    bvn: '22188198766',
    registrationDate: '2024-01-15',
    industryCd: 'Technology',
    businessNature: 'Software & Cloud Solutions',
    status: 'Active',
    createdAt: '2025-01-12T10:00:00Z',
    accountsCount: 3,
    totalBalance: 45200000,
    contactPersonFirstName: 'Jesufemi',
    contactPersonLastName: 'Ojelere',
    contactPersonPhoneNo: '07062397917',
    contactPersonEmailAddress: 'fojelere@yahoo.com',
  },
  {
    id: 'corp-89ab4d6b-3f9b-5e75-b5fa-5460073dg303',
    companyName: 'Globex Manufacturing Nigeria',
    companyEmail: 'info@globexmfg.com',
    companyPhoneNumber: '08059876543',
    companyAddress: 'Industrial Layout, Ikeja, Lagos',
    companyRegistrationNumber: 'RC-2024-045',
    taxIdentificationNumber: 'TIN-45678912-002',
    bvn: '22170829104',
    registrationDate: '2023-11-20',
    industryCd: 'Manufacturing',
    businessNature: 'FMCG Manufacturing',
    status: 'Active',
    createdAt: '2025-02-03T11:30:00Z',
    accountsCount: 1,
    totalBalance: 12800000,
    contactPersonFirstName: 'Ayokulehin',
    contactPersonLastName: 'Owoyeye',
    contactPersonPhoneNo: '08139603898',
    contactPersonEmailAddress: 'owoyeyeayokulehin@gmail.com',
  },
  {
    id: 'corp-12cd5e7c-4a0c-6f86-c6ab-6571184eh404',
    companyName: 'Alpha Retail Group Plc',
    companyEmail: 'corporate@alpharetail.ng',
    companyPhoneNumber: '07011223344',
    companyAddress: 'Ahmadu Bello Way, Abuja',
    companyRegistrationNumber: 'RC-2023-812',
    taxIdentificationNumber: 'TIN-11223344-003',
    bvn: '22233445566',
    registrationDate: '2023-05-10',
    industryCd: 'Retail',
    businessNature: 'Supermarket Chain & E-commerce',
    status: 'Pending',
    createdAt: '2025-02-19T14:15:00Z',
    accountsCount: 2,
    totalBalance: 8340000,
    contactPersonFirstName: 'Kelechi',
    contactPersonLastName: 'Okafor',
    contactPersonPhoneNo: '07011223344',
    contactPersonEmailAddress: 'kokafor@alpharetail.ng',
  },
  {
    id: 'corp-34ef7g9d-5b1d-7a97-d7bc-7682295fi505',
    companyName: 'Nexus Capital Partners',
    companyEmail: 'admin@nexuscapital.com',
    companyPhoneNumber: '08099887766',
    companyAddress: 'Ikoyi Link Bridge Road, Ikoyi, Lagos',
    companyRegistrationNumber: 'RC-2022-500',
    taxIdentificationNumber: 'TIN-55667788-004',
    bvn: '22345678901',
    registrationDate: '2022-08-01',
    industryCd: 'Finance',
    businessNature: 'Asset Management & Private Equity',
    status: 'Active',
    createdAt: '2025-04-07T09:00:00Z',
    accountsCount: 5,
    totalBalance: 210400000,
    contactPersonFirstName: 'Babatunde',
    contactPersonLastName: 'Adeyemi',
    contactPersonPhoneNo: '08099887766',
    contactPersonEmailAddress: 'badeyemi@nexuscapital.com',
  },
  {
    id: 'corp-56gh8h0e-6c2e-8b08-e8cd-8793306gj606',
    companyName: 'XYZ Imports & Logistics',
    companyEmail: 'support@xyzimports.ng',
    companyPhoneNumber: '08123456789',
    companyAddress: 'Apapa Port Complex, Lagos',
    companyRegistrationNumber: 'RC-2024-388',
    taxIdentificationNumber: 'TIN-99887766-005',
    bvn: '22456789012',
    registrationDate: '2024-03-30',
    industryCd: 'Logistics',
    businessNature: 'Maritime Freight & Clearing',
    status: 'Blocked',
    createdAt: '2025-04-28T16:45:00Z',
    accountsCount: 2,
    totalBalance: 5100000,
    contactPersonFirstName: 'Fatima',
    contactPersonLastName: 'Bello',
    contactPersonPhoneNo: '08123456789',
    contactPersonEmailAddress: 'fbello@xyzimports.ng',
  },
];

const statusStyles: Record<string, string> = {
  Active: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  Pending: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  Blocked: 'text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
};

export default function ExploreCompaniesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Single Lookup States
  const [lookupType, setLookupType] = useState<'cashAccount' | 'bvn' | 'email' | 'phone' | 'symplus'>('cashAccount');
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);

  // RTK Query & Mutation Hooks
  const { data: apiResponse, isLoading: loadingList, refetch } = useGetCorporateUsersQuery();
  const [triggerByCashAccount, { isLoading: searchingCashAcc }] = useLazyGetCorporateUserByCashAccountQuery();
  const [triggerByBvn, { isLoading: searchingBvn }] = useLazyGetCorporateUserByBvnQuery();
  const [triggerByEmail, { isLoading: searchingEmail }] = useLazyGetCorporateUserByEmailQuery();
  const [triggerByPhone, { isLoading: searchingPhone }] = useLazyGetCorporateUserByPhoneQuery();
  const [triggerPullSymplus, { isLoading: searchingSymplus }] = useLazyPullCorporateCustomerByIdQuery();

  const [onboardCorporate, { isLoading: onboarding }] = useOnboardCorporateUserMutation();
  const [approveOnboarding, { isLoading: approving }] = useApproveCorporateOnboardingMutation();
  const [blockUser, { isLoading: blocking }] = useBlockCorporateUserMutation();
  const [resetPassword, { isLoading: resettingPassword }] = useResetCorporateUserPasswordMutation();

  // Onboarding Form State
  const [onboardForm, setOnboardForm] = useState<CorporateOnboardingPayload>({
    companyName: '',
    companyEmail: '',
    companyPhoneNumber: '',
    companyAddress: '',
    companyRegistrationNumber: '',
    taxIdentificationNumber: '',
    bvn: '',
    registrationDate: new Date().toISOString().split('T')[0],
    industryCd: 'Technology',
    businessNature: 'Commercial Enterprise',
    bankCd: '058',
    bankAccountName: '',
    bankAccountNo: '',
    contactPersonTitleCd: 'Mr',
    contactPersonFirstName: '',
    contactPersonLastName: '',
    contactPersonPhoneNo: '',
    contactPersonEmailAddress: '',
    identityDocTypeCd: 'CAC_CERTIFICATE',
    identityDocName: 'CAC Certificate of Incorporation',
    identityDocNo: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Combine API data with fallbacks
  const apiCompanies = apiResponse?.data || [];
  const allCompanies = apiCompanies.length > 0 ? apiCompanies : mockCompanies;

  const filteredCompanies = allCompanies.filter(c =>
    c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    c.companyRegistrationNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c.industryCd?.toLowerCase().includes(search.toLowerCase()) ||
    c.taxIdentificationNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c.companyEmail?.toLowerCase().includes(search.toLowerCase())
  );

  // Quick Action Handlers
  const handleApproveOnboarding = async (id: string, name: string) => {
    try {
      await approveOnboarding(id).unwrap();
      showToast(`Corporate onboarding for ${name} approved successfully.`);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || `Failed to approve onboarding for ${name}.`);
    }
  };

  const handleBlockCompany = async (id: string, name: string) => {
    try {
      await blockUser(id).unwrap();
      showToast(`Account status for ${name} updated (Blocked/Unblocked).`);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || `Failed to update account status for ${name}.`);
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    try {
      await resetPassword(id).unwrap();
      showToast(`Password reset link dispatched to ${name}.`);
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || `Failed to reset password for ${name}.`);
    }
  };

  // Execute Targeted Single-Field Lookup
  const handleExecuteLookup = async () => {
    if (!lookupQuery.trim()) {
      showToast('Please enter a valid lookup search term.');
      return;
    }
    try {
      let res: any;
      if (lookupType === 'cashAccount') {
        res = await triggerByCashAccount(lookupQuery).unwrap();
      } else if (lookupType === 'bvn') {
        res = await triggerByBvn(lookupQuery).unwrap();
      } else if (lookupType === 'email') {
        res = await triggerByEmail(lookupQuery).unwrap();
      } else if (lookupType === 'phone') {
        res = await triggerByPhone(lookupQuery).unwrap();
      } else if (lookupType === 'symplus') {
        res = await triggerPullSymplus(lookupQuery).unwrap();
      }
      setLookupResult(res?.data || res);
      showToast(`Lookup completed for ${lookupType}: ${lookupQuery}`);
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || `No record found for ${lookupType}: ${lookupQuery}`);
    }
  };

  // Onboarding Submit
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onboardCorporate(onboardForm).unwrap();
      showToast(`Corporate customer "${onboardForm.companyName}" onboarded successfully!`);
      setIsOnboardModalOpen(false);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || 'Failed to onboard corporate customer.');
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500 font-sans text-gray-900 dark:text-gray-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700">
          <CheckCircle2 className="text-emerald-400" size={18} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Corporate Customer Directory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage corporate entity records, onboardings, cash accounts & investments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 font-semibold rounded-xl text-xs transition cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loadingList ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => setIsOnboardModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-xl text-sm transition shadow-sm cursor-pointer"
          >
            <Plus size={16} /> Onboard Corporate Customer
          </button>
        </div>
      </div>

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Total Corporate Entities</span>
            <Building2 size={18} className="text-[#961A1C]" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{allCompanies.length}</p>
          <p className="text-[11px] text-gray-400 font-mono">Registered businesses on platform</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Active Accounts</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 font-mono">
            {allCompanies.filter(c => c.status === 'Active').length}
          </p>
          <p className="text-[11px] text-gray-400 font-mono">Verified & operational</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Pending Onboarding</span>
            <Clock size={18} className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600 font-mono">
            {allCompanies.filter(c => c.status === 'Pending').length}
          </p>
          <p className="text-[11px] text-gray-400 font-mono">Awaiting admin review</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Blocked Accounts</span>
            <XCircle size={18} className="text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600 font-mono">
            {allCompanies.filter(c => c.status === 'Blocked').length}
          </p>
          <p className="text-[11px] text-gray-400 font-mono">Requires compliance review</p>
        </div>
      </div>

      {/* Main Corporate Directory Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by company name, RC number, TIN, or industry..."
              className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-4 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition w-full md:w-auto cursor-pointer"
          >
            <Filter size={15} /> Advanced API Lookup Suite
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-[11px]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Corporate Entity</th>
                <th className="px-5 py-3.5 font-semibold">RC Number</th>
                <th className="px-5 py-3.5 font-semibold">TIN</th>
                <th className="px-5 py-3.5 font-semibold">Industry</th>
                <th className="px-5 py-3.5 font-semibold">Contact Person</th>
                <th className="px-5 py-3.5 font-semibold text-right">Total Balance</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 font-mono text-xs">
                    No corporate customers matching criteria.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map(company => {
                  const regNo = company.companyRegistrationNumber || 'RC-2024-000';
                  const tin = company.taxIdentificationNumber || 'TIN-000000';
                  const contactName = `${company.contactPersonFirstName || ''} ${company.contactPersonLastName || ''}`.trim() || '—';
                  const status = company.status || 'Active';

                  return (
                    <tr
                      key={company.id}
                      onClick={() => router.push(`/dashboard/corporate/companies/${company.id}`)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-800 to-[#961A1C] flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-xs">
                            {company.companyName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-xs">{company.companyName}</p>
                            <p className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                              <span>{company.companyEmail}</span>
                              <CopyButton text={company.companyEmail} label="Email" />
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1">
                          <span>{regNo}</span>
                          <CopyButton text={regNo} label="RC Number" />
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1">
                          <span>{tin}</span>
                          <CopyButton text={tin} label="Tax ID" />
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-200">
                        {company.industryCd || 'General'}
                      </td>
                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300 font-sans">
                        <p className="font-semibold text-xs">{contactName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{company.contactPersonPhoneNo || company.companyPhoneNumber}</p>
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                        ₦{(company.totalBalance || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${statusStyles[status] || statusStyles.Active}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => router.push(`/dashboard/corporate/companies/${company.id}`)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition cursor-pointer"
                            title="View Corporate Profile"
                          >
                            <Eye size={15} />
                          </button>
                          {status === 'Pending' && (
                            <button
                              onClick={() => handleApproveOnboarding(company.id, company.companyName)}
                              disabled={approving}
                              className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 font-semibold rounded text-[10px] cursor-pointer"
                              title="Approve Onboarding"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleBlockCompany(company.id, company.companyName)}
                            disabled={blocking}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                            title="Block / Toggle Account Status"
                          >
                            <Lock size={14} />
                          </button>
                          <button
                            onClick={() => handleResetPassword(company.id, company.companyName)}
                            disabled={resettingPassword}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition cursor-pointer"
                            title="Reset Password"
                          >
                            <Key size={14} />
                          </button>
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

      {/* FILTER & SINGLE-FIELD API LOOKUP DRAWER */}
      <Drawer
        title={<span className="font-bold text-lg text-gray-900 dark:text-white">Corporate API Search & Lookup Suite</span>}
        placement="right"
        onClose={() => {
          setIsFilterOpen(false);
          setLookupResult(null);
        }}
        open={isFilterOpen}
        width={420}
        classNames={{
          header: "border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50",
          body: "p-6 space-y-6",
        }}
      >
        <div className="space-y-4">
          <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider">Targeted Single-Field API Search</h4>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Select Lookup Endpoint</label>
            <select
              value={lookupType}
              onChange={(e: any) => setLookupType(e.target.value)}
              className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            >
              <option value="cashAccount">GET /corporate/users/cash-account/{'{cashAccountNumber}'}</option>
              <option value="bvn">GET /corporate/users/bvn/{'{bvn}'}</option>
              <option value="email">GET /corporate/users/email/{'{email}'}</option>
              <option value="phone">GET /corporate/users/phone/{'{phoneNumber}'}</option>
              <option value="symplus">GET /corporate/users/pull-corporate-customer-by-id/{'{customerId}'}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Lookup Query Value</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={lookupQuery}
                onChange={e => setLookupQuery(e.target.value)}
                placeholder={
                  lookupType === 'cashAccount' ? 'e.g. 1000293847' :
                  lookupType === 'bvn' ? 'e.g. 22188198766' :
                  lookupType === 'email' ? 'e.g. contact@techcorp.ng' :
                  lookupType === 'phone' ? 'e.g. 08031234567' : 'e.g. CUST-0091'
                }
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
              />
              <button
                onClick={handleExecuteLookup}
                disabled={searchingCashAcc || searchingBvn || searchingEmail || searchingPhone || searchingSymplus}
                className="px-4 py-2.5 bg-[#961A1C] text-white font-semibold rounded-xl text-xs hover:bg-[#7a1517] disabled:opacity-50 flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                {(searchingCashAcc || searchingBvn || searchingEmail || searchingPhone || searchingSymplus) ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : 'Execute'}
              </button>
            </div>
          </div>

          {lookupResult && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1.5">
                <span className="font-bold text-[#961A1C]">Lookup Result Payload</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-bold">200 OK</span>
              </div>
              <p><span className="text-gray-400">Company Name:</span> <strong className="text-gray-900 dark:text-white">{lookupResult.companyName || lookupResult.name || 'Found'}</strong></p>
              <p><span className="text-gray-400">RC Number:</span> {lookupResult.companyRegistrationNumber || '—'}</p>
              <p><span className="text-gray-400">Email:</span> {lookupResult.companyEmail || '—'}</p>
              <p><span className="text-gray-400">Phone:</span> {lookupResult.companyPhoneNumber || '—'}</p>
            </div>
          )}
        </div>
      </Drawer>

      {/* CORPORATE ONBOARDING MODAL WIZARD */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">Onboard New Corporate Customer</h3>
                <p className="text-xs text-gray-400 font-mono">POST /api/corporate/users/onboard</p>
              </div>
              <button
                onClick={() => setIsOnboardModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-6 text-xs font-sans">
              {/* Section 1: Company Profile */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#961A1C] uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-1">
                  1. Company Registration & Profile
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 font-semibold mb-1">Company Name *</label>
                    <input
                      required
                      type="text"
                      value={onboardForm.companyName}
                      onChange={e => setOnboardForm({ ...onboardForm, companyName: e.target.value })}
                      placeholder="e.g. Zenith Tech Solutions Ltd"
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-semibold mb-1">Company Email *</label>
                    <input
                      required
                      type="email"
                      value={onboardForm.companyEmail}
                      onChange={e => setOnboardForm({ ...onboardForm, companyEmail: e.target.value })}
                      placeholder="corporate@company.com"
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-semibold mb-1">Company Phone *</label>
                    <input
                      required
                      type="text"
                      value={onboardForm.companyPhoneNumber}
                      onChange={e => setOnboardForm({ ...onboardForm, companyPhoneNumber: e.target.value })}
                      placeholder="08030000000"
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-semibold mb-1">RC / Registration No *</label>
                    <input
                      required
                      type="text"
                      value={onboardForm.companyRegistrationNumber}
                      onChange={e => setOnboardForm({ ...onboardForm, companyRegistrationNumber: e.target.value })}
                      placeholder="RC-2024-999"
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-semibold mb-1">Tax ID (TIN) *</label>
                    <input
                      required
                      type="text"
                      value={onboardForm.taxIdentificationNumber}
                      onChange={e => setOnboardForm({ ...onboardForm, taxIdentificationNumber: e.target.value })}
                      placeholder="TIN-12345678"
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-semibold mb-1">BVN (Corporate/Rep) *</label>
                    <input
                      required
                      type="text"
                      value={onboardForm.bvn}
                      onChange={e => setOnboardForm({ ...onboardForm, bvn: e.target.value })}
                      placeholder="22188198766"
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Address & Industry */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#961A1C] uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-1">
                  2. Industry & Location
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 font-semibold mb-1">Industry</label>
                    <input
                      type="text"
                      value={onboardForm.industryCd}
                      onChange={e => setOnboardForm({ ...onboardForm, industryCd: e.target.value })}
                      placeholder="Technology / Finance / Retail"
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-semibold mb-1">Nature of Business</label>
                    <input
                      type="text"
                      value={onboardForm.businessNature}
                      onChange={e => setOnboardForm({ ...onboardForm, businessNature: e.target.value })}
                      placeholder="Commercial Enterprise"
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-500 font-semibold mb-1">Company Registered Address *</label>
                    <input
                      required
                      type="text"
                      value={onboardForm.companyAddress}
                      onChange={e => setOnboardForm({ ...onboardForm, companyAddress: e.target.value })}
                      placeholder="Full street address..."
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Contact Person Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#961A1C] uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-1">
                  3. Contact Person & Representative
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 font-semibold mb-1">First Name</label>
                    <input
                      type="text"
                      value={onboardForm.contactPersonFirstName}
                      onChange={e => setOnboardForm({ ...onboardForm, contactPersonFirstName: e.target.value })}
                      placeholder="John"
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-semibold mb-1">Last Name</label>
                    <input
                      type="text"
                      value={onboardForm.contactPersonLastName}
                      onChange={e => setOnboardForm({ ...onboardForm, contactPersonLastName: e.target.value })}
                      placeholder="Doe"
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-semibold mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={onboardForm.contactPersonEmailAddress}
                      onChange={e => setOnboardForm({ ...onboardForm, contactPersonEmailAddress: e.target.value })}
                      placeholder="jdoe@company.com"
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-semibold mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={onboardForm.contactPersonPhoneNo}
                      onChange={e => setOnboardForm({ ...onboardForm, contactPersonPhoneNo: e.target.value })}
                      placeholder="08031112222"
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={onboarding}
                  className="px-5 py-2 bg-[#961A1C] text-white font-semibold rounded-xl hover:bg-[#7a1517] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {onboarding && <Loader2 size={14} className="animate-spin" />}
                  Submit Onboarding Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
