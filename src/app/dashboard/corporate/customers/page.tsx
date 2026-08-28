'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dropdown, MenuProps, Drawer } from 'antd';
import {
  Search, Download, CheckCircle2, Clock,
  ChevronLeft, ChevronRight, MoreVertical, Building2,
  Lock, Unlock, Users, Loader2, KeyRound, UserCheck, UserX, Eye,
  ShieldAlert, RefreshCw, SlidersHorizontal, Filter, ChevronDown,
  Plus, XCircle, Copy, Check, FileText, Activity, ShieldCheck, Tag
} from 'lucide-react';
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

export default function CorporateCustomersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Drawer & Modal States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [lookupType, setLookupType] = useState<'cashAccount' | 'bvn' | 'email' | 'phone' | 'symplus'>('cashAccount');
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);

  const tabs = ['All', 'Active', 'Pending Onboarding', 'Corporate Wallets', 'Dormant', 'Blocked'];

  // RTK Queries & Mutations
  const { data: apiResponse, isLoading, isFetching, refetch } = useGetCorporateUsersQuery();
  const [triggerByCashAccount, { isLoading: searchingCashAcc }] = useLazyGetCorporateUserByCashAccountQuery();
  const [triggerByBvn, { isLoading: searchingBvn }] = useLazyGetCorporateUserByBvnQuery();
  const [triggerByEmail, { isLoading: searchingEmail }] = useLazyGetCorporateUserByEmailQuery();
  const [triggerByPhone, { isLoading: searchingPhone }] = useLazyGetCorporateUserByPhoneQuery();
  const [triggerPullSymplus, { isLoading: searchingSymplus }] = useLazyPullCorporateCustomerByIdQuery();

  const [onboardCorporate, { isLoading: onboarding }] = useOnboardCorporateUserMutation();
  const [approveOnboarding, { isLoading: approving }] = useApproveCorporateOnboardingMutation();
  const [blockUser, { isLoading: blocking }] = useBlockCorporateUserMutation();
  const [resetPassword, { isLoading: resettingPassword }] = useResetCorporateUserPasswordMutation();

  // Form State
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

  const apiCompanies = apiResponse?.data || [];
  const companyList: CorporateUser[] = apiCompanies.length > 0 ? apiCompanies : mockCompanies;

  const filteredBySearch = companyList.filter((c) =>
    c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.companyRegistrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industryCd?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.companyEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredByTab = filteredBySearch.filter((c) => {
    if (activeTab === 'Active') return c.status === 'Active';
    if (activeTab === 'Pending Onboarding') return c.status === 'Pending';
    if (activeTab === 'Blocked') return c.status === 'Blocked';
    if (activeTab === 'Corporate Wallets') return (c.accountsCount || 0) > 0;
    if (activeTab === 'Dormant') return c.status === 'Dormant';
    return true;
  });

  const totalCount = filteredByTab.length;

  const toggleSelectAll = () => {
    if (selectedCompanies.length === filteredByTab.length && filteredByTab.length > 0) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(filteredByTab.map((c) => c.id).filter(Boolean));
    }
  };

  const toggleSelectCompany = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCompanies.includes(id)) {
      setSelectedCompanies(selectedCompanies.filter((c) => c !== id));
    } else {
      setSelectedCompanies([...selectedCompanies, id]);
    }
  };

  const handleRowClick = (id: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    router.push(`/dashboard/corporate/customers/${id}`);
  };

  // Menu Actions
  const handleApproveOnboarding = async (id: string, name: string) => {
    try {
      await approveOnboarding(id).unwrap();
      showToast(`Corporate onboarding for ${name} approved successfully.`);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || `Failed to approve onboarding.`);
    }
  };

  const handleBlockCompany = async (id: string, name: string) => {
    try {
      await blockUser(id).unwrap();
      showToast(`Account status for ${name} updated.`);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || `Failed to update status.`);
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    try {
      await resetPassword(id).unwrap();
      showToast(`Password reset link dispatched to ${name}.`);
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || `Failed to reset password.`);
    }
  };

  const handleExecuteLookup = async () => {
    if (!lookupQuery.trim()) {
      showToast('Please enter a valid lookup query.');
      return;
    }
    try {
      let res: any;
      if (lookupType === 'cashAccount') res = await triggerByCashAccount(lookupQuery).unwrap();
      else if (lookupType === 'bvn') res = await triggerByBvn(lookupQuery).unwrap();
      else if (lookupType === 'email') res = await triggerByEmail(lookupQuery).unwrap();
      else if (lookupType === 'phone') res = await triggerByPhone(lookupQuery).unwrap();
      else if (lookupType === 'symplus') res = await triggerPullSymplus(lookupQuery).unwrap();
      setLookupResult(res?.data || res);
      showToast(`Lookup completed for ${lookupType}: ${lookupQuery}`);
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || `No record found for ${lookupType}.`);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onboardCorporate(onboardForm).unwrap();
      showToast(`Corporate customer "${onboardForm.companyName}" onboarded!`);
      setIsOnboardModalOpen(false);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || 'Failed to onboard corporate entity.');
    }
  };

  const getMenuItems = (c: CorporateUser): MenuProps['items'] => [
    {
      key: 'view-profile',
      label: (
        <Link href={`/dashboard/corporate/customers/${c.id}`} className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200 py-0.5">
          <Eye size={14} className="text-gray-500" /> View Corporate Profile
        </Link>
      ),
    },
    {
      key: 'approve-onboarding',
      label: (
        <span
          onClick={() => handleApproveOnboarding(c.id, c.companyName)}
          className="flex items-center gap-2 text-xs font-semibold text-amber-600 py-0.5"
        >
          <UserCheck size={14} /> Approve Onboarding
        </span>
      ),
    },
    {
      key: 'block-toggle',
      label: (
        <span onClick={() => handleBlockCompany(c.id, c.companyName)} className="flex items-center gap-2 text-xs font-semibold text-red-600 py-0.5">
          <Lock size={14} /> {c.status === 'Blocked' ? 'Unblock Account' : 'Block Account'}
        </span>
      ),
    },
    { type: 'divider' },
    {
      key: 'reset-password',
      label: (
        <span onClick={() => handleResetPassword(c.id, c.companyName)} className="flex items-center gap-2 text-xs font-semibold text-blue-600 py-0.5">
          <ShieldAlert size={14} /> Reset Password
        </span>
      ),
    },
  ];

  // Calculated Stats
  const activeCount = companyList.filter((c) => c.status === 'Active').length;
  const pendingCount = companyList.filter((c) => c.status === 'Pending').length;
  const walletsCount = companyList.filter((c) => (c.accountsCount || 0) > 0).length;
  const dormantCount = companyList.filter((c) => c.status === 'Dormant').length;
  const blockedCount = companyList.filter((c) => c.status === 'Blocked').length;

  return (
    <div className="flex flex-col gap-6 pb-12 w-full animate-in fade-in duration-500 font-sans text-gray-900 dark:text-gray-100 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700">
          <CheckCircle2 className="text-emerald-400" size={18} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Corporate Customer Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Directory and real-time status of corporate banking entities and customer accounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast('Exporting corporate customer directory...')}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-2xs cursor-pointer"
          >
            <Download size={14} className="text-gray-500" /> Export List
          </button>
          <button
            onClick={() => setIsOnboardModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-lg text-xs transition shadow-2xs cursor-pointer"
          >
            <Plus size={15} /> Onboard Corporate
          </button>
        </div>
      </div>

      {/* ── Filters Bar (On Top of Stat Cards) ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Segmented Filter Tabs */}
        <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg p-1 flex items-center gap-1 overflow-x-auto w-full md:w-auto shadow-2xs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs transition whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#961A1C] text-white font-bold shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filter & Sort Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            Filters & API Lookup <SlidersHorizontal size={13} className="text-gray-500" />
          </button>

          <Dropdown
            menu={{
              items: [
                { key: 'newest', label: 'Registration Date: Newest First' },
                { key: 'oldest', label: 'Registration Date: Oldest First' },
                { key: 'name', label: 'Company Name (A-Z)' },
              ],
            }}
            trigger={['click']}
          >
            <button className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs">
              Sort by <ChevronDown size={13} className="text-gray-500" />
            </button>
          </Dropdown>
        </div>
      </div>

      {/* ── Top 6 Stat Cards (Matching Retail Page Style) ────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total Corporate Customers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/80 p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-[#961A1C] rounded-r-md" />
          <div className="pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Entities</span>
          </div>
          <div className="mt-3 pl-2 flex flex-col gap-[2px]">
            <p className="text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-tight leading-none">
              {isLoading ? '...' : companyList.length.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Companies</p>
          </div>
        </div>

        {/* Card 2: Active Accounts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/80 p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-emerald-500 rounded-r-md" />
          <div className="pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Accounts</span>
          </div>
          <div className="mt-3 pl-2 flex flex-col gap-[2px]">
            <p className="text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-tight leading-none">
              {isLoading ? '...' : activeCount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Active Entities</p>
          </div>
        </div>

        {/* Card 3: Pending Onboarding */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/80 p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-amber-500 rounded-r-md" />
          <div className="pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Pending Review</span>
          </div>
          <div className="mt-3 pl-2 flex flex-col gap-[2px]">
            <p className="text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-tight leading-none">
              {isLoading ? '...' : pendingCount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Needs Approval</p>
          </div>
        </div>

        {/* Card 4: Corporate Wallets */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/80 p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-purple-600 rounded-r-md" />
          <div className="pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Cash Accounts</span>
          </div>
          <div className="mt-3 pl-2 flex flex-col gap-[2px]">
            <p className="text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-tight leading-none">
              {isLoading ? '...' : walletsCount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Accounts Configured</p>
          </div>
        </div>

        {/* Card 5: Dormant */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/80 p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-slate-400 rounded-r-md" />
          <div className="pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Dormant Accounts</span>
          </div>
          <div className="mt-3 pl-2 flex flex-col gap-[2px]">
            <p className="text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-tight leading-none">
              {isLoading ? '...' : dormantCount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Inactive Entities</p>
          </div>
        </div>

        {/* Card 6: Blocked */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/80 p-4 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-red-600 rounded-r-md" />
          <div className="pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Blocked Entities</span>
          </div>
          <div className="mt-3 pl-2 flex flex-col gap-[2px]">
            <p className="text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-tight leading-none">
              {isLoading ? '...' : blockedCount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Blocked Accounts</p>
          </div>
        </div>
      </div>

      {/* ── Table Card Container (Matching Retail Table Design) ───────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden">
        {/* Search & Pagination Control Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company name, RC, TIN, email..."
              className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-1.5 pl-8 pr-3 rounded-lg text-xs focus:outline-none focus:border-[#961A1C]"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 font-mono w-full sm:w-auto justify-between sm:justify-end">
            <span>Page {page} ({totalCount} items)</span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Page {page}</span>
              <button
                disabled={totalCount < pageSize}
                onClick={() => setPage((p) => p + 1)}
                className="p-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-gray-50/80 dark:bg-gray-900/50 text-gray-500 border-b border-gray-100 dark:border-gray-700 text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.length === filteredByTab.length && filteredByTab.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-[#961A1C] focus:ring-[#961A1C] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Corporate Entity</th>
                <th className="py-3 px-4">RC Number</th>
                <th className="py-3 px-4">TIN</th>
                <th className="py-3 px-4">Industry</th>
                <th className="py-3 px-4">Contact Representative</th>
                <th className="py-3 px-4 text-right">Total Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filteredByTab.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 font-mono text-xs">
                    No corporate customers matching criteria.
                  </td>
                </tr>
              ) : (
                filteredByTab.map((company) => {
                  const regNo = company.companyRegistrationNumber || 'RC-2024-000';
                  const tin = company.taxIdentificationNumber || 'TIN-000000';
                  const contactName = `${company.contactPersonFirstName || ''} ${company.contactPersonLastName || ''}`.trim() || '—';
                  const status = company.status || 'Active';
                  const isSelected = selectedCompanies.includes(company.id);

                  return (
                    <tr
                      key={company.id}
                      onClick={(e) => handleRowClick(company.id, e)}
                      className={`hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition cursor-pointer ${
                        isSelected ? 'bg-red-50/30 dark:bg-red-950/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelectCompany(company.id, e as any)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-[#961A1C] focus:ring-[#961A1C] cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-800 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
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
                      <td className="py-3.5 px-4 font-mono text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1">
                          <span>{regNo}</span>
                          <CopyButton text={regNo} label="RC Number" />
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1">
                          <span>{tin}</span>
                          <CopyButton text={tin} label="Tax ID" />
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-gray-200">
                        {company.industryCd || 'General'}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300">
                        <p className="font-semibold text-xs">{contactName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{company.contactPersonPhoneNo || company.companyPhoneNumber}</p>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                        ₦{(company.totalBalance || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${statusStyles[status] || statusStyles.Active}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Dropdown menu={{ items: getMenuItems(company) }} trigger={['click']} placement="bottomRight">
                          <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer">
                            <MoreVertical size={16} />
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

        {/* Bottom Pagination Bar */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500 font-mono">
          <div>
            Showing <span className="font-bold text-gray-700 dark:text-gray-300">{filteredByTab.length}</span> items
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition font-semibold cursor-pointer"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 font-bold text-gray-800 dark:text-gray-200 rounded-lg">
              {page}
            </span>
            <button
              disabled={filteredByTab.length < pageSize}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition font-semibold cursor-pointer"
            >
              Next
            </button>
          </div>
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
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 font-mono">Lookup Query Value</label>
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
                    <label className="block text-gray-500 font-semibold mb-1">BVN (Corporate Rep) *</label>
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

              {/* Section 2: Location & Business */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#961A1C] uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-1">
                  2. Location & Industry
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
                    <label className="block text-gray-500 font-semibold mb-1">Registered Address *</label>
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

              {/* Section 3: Contact Representative */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#961A1C] uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-1">
                  3. Contact Representative
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
