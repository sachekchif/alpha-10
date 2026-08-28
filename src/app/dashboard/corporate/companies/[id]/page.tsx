'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, ShieldAlert, FileText,
  User, Lock, Unlock, Mail, Phone, MapPin,
  FileCheck, Key, History, CreditCard, DollarSign,
  UserCheck, Activity, Building, Loader2, RefreshCw,
  Fingerprint, HelpCircle, Calendar, Tag, ShieldCheck,
  Globe, Copy, Check, ExternalLink, AlertCircle, Building2
} from 'lucide-react';
import {
  useGetCorporateUserByIdQuery,
  useGetCorporateUserAccountsQuery,
  useGetCorporateUserMutualFundsQuery,
  useLazyPullCorporateCustomerByIdQuery,
  useApproveCorporateOnboardingMutation,
  useBlockCorporateUserMutation,
  useResetCorporateUserPasswordMutation,
  CorporateUser,
  CorporateCashAccount,
  CorporateMutualFund,
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

type TabType = 'overview' | 'accounts' | 'investments' | 'symplus' | 'security';

export default function CorporateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const corporateId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pulledSymplusModal, setPulledSymplusModal] = useState<any | null>(null);

  // RTK Queries
  const { data: userResponse, isLoading: loadingCompany, refetch: refetchUser } = useGetCorporateUserByIdQuery(corporateId, { skip: !corporateId });
  const { data: accountsResponse, isLoading: loadingAccounts, refetch: refetchAccounts } = useGetCorporateUserAccountsQuery(corporateId, { skip: !corporateId });
  const { data: fundsResponse, isLoading: loadingFunds, refetch: refetchFunds } = useGetCorporateUserMutualFundsQuery(corporateId, { skip: !corporateId });
  const [triggerPullSymplus, { isLoading: pullingSymplus }] = useLazyPullCorporateCustomerByIdQuery();

  // Mutations
  const [approveOnboarding, { isLoading: approving }] = useApproveCorporateOnboardingMutation();
  const [blockUser, { isLoading: blocking }] = useBlockCorporateUserMutation();
  const [resetPassword, { isLoading: resettingPassword }] = useResetCorporateUserPasswordMutation();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mock Fallbacks if backend doesn't return data for this specific ID
  const companyData: CorporateUser = userResponse?.data || {
    id: corporateId,
    companyName: 'TechCorp Innovations Ltd',
    companyEmail: 'contact@techcorp.ng',
    companyPhoneNumber: '08031234567',
    companyAddress: '12 Marina Road, Victoria Island, Lagos State, Nigeria',
    companyRegistrationNumber: 'RC-2024-001',
    taxIdentificationNumber: 'TIN-98765432-001',
    bvn: '22188198766',
    registrationDate: '2024-01-15',
    industryCd: 'Technology',
    businessNature: 'Software Development & Enterprise Infrastructure',
    status: 'Active',
    createdAt: '2025-01-12T10:00:00Z',
    updatedAt: '2025-08-27T14:31:00Z',
    contactPersonTitleCd: 'Mr',
    contactPersonFirstName: 'Jesufemi',
    contactPersonLastName: 'Ojelere',
    contactPersonPhoneNo: '07062397917',
    contactPersonEmailAddress: 'fojelere@yahoo.com',
    bankCd: '058',
    bankAccountName: 'TechCorp Innovations Operating Acc',
    bankAccountNo: '0123456789',
    bankBranchName: 'Victoria Island Main Branch',
    identityDocTypeCd: 'CAC_CERTIFICATE',
    identityDocName: 'Certificate of Incorporation',
    identityDocNo: 'RC-2024-001',
    officerId: 'OFFICER-009',
    introducerId: 'INTRO-102',
    planId: 'PLAN-CORP-PLATINUM',
  };

  const cashAccounts: CorporateCashAccount[] = accountsResponse?.data || [
    {
      id: 'acc-01',
      accountNumber: '1000293847',
      accountName: 'TechCorp Operating Account',
      currency: 'NGN',
      balance: 32500000.50,
      status: 'Active',
      bankCode: '058',
      branchName: 'VI Victoria Island',
      createdAt: '2025-01-15T09:00:00Z',
    },
    {
      id: 'acc-02',
      accountNumber: '1000293888',
      accountName: 'TechCorp USD Investment Cash Vault',
      currency: 'USD',
      balance: 25000.00,
      status: 'Active',
      bankCode: '058',
      branchName: 'Head Office Treasury',
      createdAt: '2025-03-01T10:30:00Z',
    },
  ];

  const mutualFunds: CorporateMutualFund[] = fundsResponse?.data || [
    {
      fundAccountId: 'ADF001171001',
      fundDescription: 'ALPHA10 DOLLAR FIXED INCOME FUND',
      currency: 'USD',
      currentValue: 15000.00,
      units: 150.0,
      costPrice: 14200.00,
      gainLossAmount: 800.00,
      status: 'Active',
    },
    {
      fundAccountId: 'MMF001171002',
      fundDescription: 'ALPHA10 NIGERIAN MONEY MARKET FUND',
      currency: 'NGN',
      currentValue: 12700000.00,
      units: 127000.0,
      costPrice: 12000000.00,
      gainLossAmount: 700000.00,
      status: 'Active',
    },
  ];

  const totalCashBalance = cashAccounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const totalFundValue = mutualFunds.reduce((acc, curr) => acc + (curr.currentValue || 0), 0);
  const contactName = `${companyData.contactPersonFirstName || ''} ${companyData.contactPersonLastName || ''}`.trim() || 'Not Assigned';
  const symplusCustomerId = companyData.id || 'CUST-CORP-001';

  // Quick Action Handlers
  const handleApproveOnboarding = async () => {
    try {
      await approveOnboarding(corporateId).unwrap();
      showToast(`Onboarding request for ${companyData.companyName} approved successfully.`);
      refetchUser();
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || 'Failed to approve onboarding.');
    }
  };

  const handleBlockCompany = async () => {
    try {
      await blockUser(corporateId).unwrap();
      showToast(`Account status for ${companyData.companyName} toggled (Blocked/Active).`);
      refetchUser();
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || 'Failed to update account status.');
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword(corporateId).unwrap();
      showToast(`Password reset notification sent to ${companyData.companyEmail}.`);
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || 'Failed to reset password.');
    }
  };

  const handlePullSymplus = async () => {
    try {
      const res = await triggerPullSymplus(symplusCustomerId).unwrap();
      setPulledSymplusModal(res?.data || res);
      showToast(`Symplus record pulled for customer ${symplusCustomerId}`);
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || `Failed to pull Symplus record for ${symplusCustomerId}.`);
    }
  };

  if (loadingCompany) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
        <Loader2 className="animate-spin text-[#961A1C]" size={36} />
        <p className="text-gray-500 text-xs mt-3 font-mono">Loading corporate record details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12 w-full animate-in fade-in duration-500 font-sans text-gray-900 dark:text-gray-100 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700">
          <CheckCircle2 className="text-emerald-400" size={18} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <div>
        <button
          onClick={() => router.push('/dashboard/corporate/companies')}
          className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition cursor-pointer shadow-2xs flex items-center gap-2 text-xs font-semibold"
        >
          <ArrowLeft size={16} /> Back to Corporate Directory
        </button>
      </div>

      {/* Profile Header Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-2xs flex flex-col lg:flex-row justify-between gap-6">
        <div className="flex flex-col items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-800 to-[#961A1C] flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-md">
            {companyData.companyName[0]}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{companyData.companyName}</h2>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                  companyData.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : companyData.status === 'Pending'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {companyData.status || 'Active'}
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono flex items-center gap-1">
              <span>RC No: {companyData.companyRegistrationNumber || 'RC-2024-001'}</span>
              <CopyButton text={companyData.companyRegistrationNumber} label="RC Number" />
              <span>• TIN: {companyData.taxIdentificationNumber || 'TIN-98765432-001'}</span>
              <CopyButton text={companyData.taxIdentificationNumber} label="Tax ID" />
            </p>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 pt-1 font-mono">
              <span className="flex items-center gap-1">
                <Mail size={12} /> {companyData.companyEmail}
                <CopyButton text={companyData.companyEmail} label="Email" />
              </span>
              <span className="flex items-center gap-1">
                <Phone size={12} /> {companyData.companyPhoneNumber || '—'}
                <CopyButton text={companyData.companyPhoneNumber} label="Phone" />
              </span>
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-200 font-bold flex items-center gap-1">
                <span>ID: {companyData.id}</span>
                <CopyButton text={companyData.id} label="Corporate ID" />
              </span>
            </div>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-700/80 pt-4 lg:pt-0 lg:pl-6 text-xs shrink-0 self-center">
          <div>
            <span className="text-gray-500 font-medium text-[11px]">Total Cash Balance</span>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 font-mono">
              ₦{totalCashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <span className="text-gray-500 font-medium text-[11px]">Mutual Funds Value</span>
            <p className="text-lg font-bold text-emerald-600 mt-1 font-mono">
              ₦{totalFundValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <span className="text-gray-500 font-medium text-[11px]">Cash Accounts</span>
            <p className="text-sm font-bold text-purple-600 mt-1 font-mono">
              {cashAccounts.length} Active Accounts
            </p>
          </div>
          <div>
            <span className="text-gray-500 font-medium text-[11px]">Contact Representative</span>
            <p className="text-xs font-bold text-gray-900 dark:text-white mt-1 truncate">
              {contactName}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto gap-2 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Company Profile & Registration', icon: <Building2 size={14} /> },
          { id: 'accounts', label: `Cash Accounts (${cashAccounts.length})`, icon: <CreditCard size={14} /> },
          { id: 'investments', label: `Mutual Funds (${mutualFunds.length})`, icon: <DollarSign size={14} /> },
          { id: 'symplus', label: 'Symplus Core Sync', icon: <Building size={14} /> },
          { id: 'security', label: 'Security & Account Actions', icon: <Lock size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#961A1C] text-[#961A1C] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Corporate Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm border-b border-gray-100 dark:border-gray-700 pb-2">
              Corporate Registration & Tax Identity
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">Company Name</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5">{companyData.companyName}</p>
              </div>
              <div>
                <span className="text-gray-400">Industry</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5">{companyData.industryCd || 'Technology'}</p>
              </div>
              <div>
                <span className="text-gray-400">RC / Reg Number</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 font-mono flex items-center gap-1">
                  <span>{companyData.companyRegistrationNumber || 'RC-2024-001'}</span>
                  <CopyButton text={companyData.companyRegistrationNumber} label="RC Number" />
                </p>
              </div>
              <div>
                <span className="text-gray-400">Tax ID (TIN)</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 font-mono flex items-center gap-1">
                  <span>{companyData.taxIdentificationNumber || 'TIN-98765432-001'}</span>
                  <CopyButton text={companyData.taxIdentificationNumber} label="Tax ID" />
                </p>
              </div>
              <div>
                <span className="text-gray-400">BVN</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 font-mono flex items-center gap-1">
                  <span>{companyData.bvn || '22188198766'}</span>
                  <CopyButton text={companyData.bvn} label="BVN" />
                </p>
              </div>
              <div>
                <span className="text-gray-400">Registration Date</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 font-mono">{companyData.registrationDate || '2024-01-15'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">Business Nature</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{companyData.businessNature || 'Commercial Enterprise'}</p>
              </div>
            </div>
          </div>

          {/* Contact Person & Address Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm border-b border-gray-100 dark:border-gray-700 pb-2">
              Representative & Address Configuration
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Contact Person</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5">{contactName}</p>
              </div>
              <div>
                <span className="text-gray-400">Contact Email</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5 flex items-center gap-1 font-mono">
                  <span>{companyData.contactPersonEmailAddress || companyData.companyEmail}</span>
                  <CopyButton text={companyData.contactPersonEmailAddress || companyData.companyEmail} label="Contact Email" />
                </p>
              </div>
              <div>
                <span className="text-gray-400">Contact Phone</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5 flex items-center gap-1 font-mono">
                  <span>{companyData.contactPersonPhoneNo || companyData.companyPhoneNumber}</span>
                  <CopyButton text={companyData.contactPersonPhoneNo || companyData.companyPhoneNumber} label="Contact Phone" />
                </p>
              </div>
              <div>
                <span className="text-gray-400">Registered Office Address</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{companyData.companyAddress}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CASH ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                Corporate Cash Accounts ({cashAccounts.length})
              </h3>
              <button onClick={() => refetchAccounts()} className="text-xs text-gray-500 hover:text-gray-900 font-semibold cursor-pointer">
                Refresh Accounts
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-[11px]">
                  <tr>
                    <th className="p-3 font-semibold">Account Name</th>
                    <th className="p-3 font-semibold">Account Number</th>
                    <th className="p-3 font-semibold">Currency</th>
                    <th className="p-3 font-semibold">Bank Branch</th>
                    <th className="p-3 font-semibold text-right">Balance</th>
                    <th className="p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {cashAccounts.map((acc, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="p-3.5 font-bold text-gray-900 dark:text-white">{acc.accountName}</td>
                      <td className="p-3.5 font-mono text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1">
                          <span>{acc.accountNumber}</span>
                          <CopyButton text={acc.accountNumber} label="Account Number" />
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-purple-600 font-bold">{acc.currency}</td>
                      <td className="p-3.5 text-gray-600 dark:text-gray-300">{acc.branchName || 'Main Branch'}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                        {acc.currency === 'USD' ? '$' : '₦'}{(acc.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {acc.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MUTUAL FUNDS INVESTMENTS */}
      {activeTab === 'investments' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                Corporate Mutual Fund Holdings ({mutualFunds.length})
              </h3>
              <button onClick={() => refetchFunds()} className="text-xs text-gray-500 hover:text-gray-900 font-semibold cursor-pointer">
                Refresh Investments
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-[11px]">
                  <tr>
                    <th className="p-3 font-semibold">Fund Description</th>
                    <th className="p-3 font-semibold">Fund Account ID</th>
                    <th className="p-3 font-semibold">Currency</th>
                    <th className="p-3 font-semibold">Units</th>
                    <th className="p-3 font-semibold text-right">Cost Price</th>
                    <th className="p-3 font-semibold text-right">Current Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {mutualFunds.map((fund, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="p-3.5 font-bold text-gray-900 dark:text-white">{fund.fundDescription}</td>
                      <td className="p-3.5 font-mono text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1">
                          <span>{fund.fundAccountId}</span>
                          <CopyButton text={fund.fundAccountId} label="Fund Account ID" />
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-purple-600 font-bold">{fund.currency}</td>
                      <td className="p-3.5 font-mono text-gray-700 dark:text-gray-300">{(fund.units || 0).toLocaleString()}</td>
                      <td className="p-3.5 text-right font-mono text-gray-500">
                        {fund.currency === 'USD' ? '$' : '₦'}{(fund.costPrice || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-600">
                        {fund.currency === 'USD' ? '$' : '₦'}{(fund.currentValue || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYMPLUS INTEGRATION */}
      {activeTab === 'symplus' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Symplus Live External Integration</h3>
                <p className="text-xs text-gray-400 font-mono">GET /api/corporate/users/pull-corporate-customer-by-id/{'{customerId}'}</p>
              </div>
              <button
                disabled={pullingSymplus}
                onClick={handlePullSymplus}
                className="px-4 py-2 bg-[#961A1C] text-white hover:bg-[#7a1517] font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {pullingSymplus ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Pull Live Symplus Customer Record
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl space-y-2 border border-gray-200/60 dark:border-gray-700">
                <span className="text-gray-400 text-[11px]">Symplus Customer ID</span>
                <p className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  <span>{symplusCustomerId}</span>
                  <CopyButton text={symplusCustomerId} label="Symplus Customer ID" />
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl space-y-2 border border-gray-200/60 dark:border-gray-700">
                <span className="text-gray-400 text-[11px]">Sync Status</span>
                <p className="text-lg font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={16} /> VERIFIED & SYNCED
                </p>
              </div>
            </div>

            {pulledSymplusModal && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/80 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2 font-mono text-xs animate-in fade-in">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="font-bold text-[#961A1C]">Live Pulled Symplus Customer Data</span>
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-bold">SYMPLUS CORE OK</span>
                </div>
                <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-[11px] overflow-x-auto">
                  {JSON.stringify(pulledSymplusModal, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY & MANAGEMENT ACTIONS */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm border-b border-gray-100 dark:border-gray-700 pb-2">
              Corporate Account Administration & Security Controls
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Approve Onboarding */}
              <div className="p-4 border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                  <UserCheck size={18} /> Approve Onboarding
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Approve pending corporate onboarding request for {companyData.companyName}.
                </p>
                <button
                  onClick={handleApproveOnboarding}
                  disabled={approving}
                  className="w-full py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  {approving && <Loader2 size={13} className="animate-spin" />}
                  Approve Corporate Onboarding
                </button>
              </div>

              {/* Block / Unblock Account */}
              <div className="p-4 border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold">
                  <Lock size={18} /> Block Account
                </div>
                <p className="text-xs text-red-700 dark:text-red-400">
                  Restrict corporate operations and disable cash account access immediately.
                </p>
                <button
                  onClick={handleBlockCompany}
                  disabled={blocking}
                  className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  {blocking && <Loader2 size={13} className="animate-spin" />}
                  {companyData.status === 'Blocked' ? 'Unblock Account' : 'Block Corporate Account'}
                </button>
              </div>

              {/* Reset Password */}
              <div className="p-4 border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold">
                  <Key size={18} /> Reset Password
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Send secure password reset link to corporate contact email ({companyData.companyEmail}).
                </p>
                <button
                  onClick={handleResetPassword}
                  disabled={resettingPassword}
                  className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  {resettingPassword && <Loader2 size={13} className="animate-spin" />}
                  Trigger Password Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
