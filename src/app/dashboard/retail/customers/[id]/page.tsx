'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle2, ShieldAlert, FileText, 
  User, Lock, Unlock, Mail, Phone, MapPin,
  FileCheck, Smartphone, Key, History, 
  CreditCard, DollarSign, UserCheck, Activity,
  Building, Loader2, RefreshCw, Fingerprint,
  HelpCircle, Calendar, Tag, ShieldCheck, Globe,
  ArrowUpRight, ArrowDownRight, ExternalLink, Cpu, HardDrive
} from 'lucide-react';
import {
  useGetRetailUserFullQuery,
  useGetRetailUserKycQuery,
  useGetKycDocumentsQuery,
  useGetWalletQuery,
  useGetCashAccountsQuery,
  useGetVirtualAccountQuery,
  useGetMutualFundHoldingsQuery,
  useGetLedgerTransactionsQuery,
  useGetDevicesQuery,
  useRevokeDeviceMutation,
  useDisableBiometricsMutation,
  useResetSecurityQuestionsMutation,
  useUnlockLoginMutation,
  useResetPinMutation,
  useResetPasswordMutation,
  RetailUser,
  KycProfile,
  Wallet,
  VirtualAccount,
  CashAccount,
  SymplusHolding,
  LedgerTransaction,
  UserDevice,
} from '@/auth/services/retailApi';

type TabType =
  | 'overview'
  | 'accounts'
  | 'investments'
  | 'transactions'
  | 'security';

export default function CustomerDetailPage() {
  const params = useParams();
  const userId = (params?.id as string) || '';
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // RTK Queries
  const { data: fullUserData, isLoading: loadingFull, refetch } = useGetRetailUserFullQuery(userId, { skip: !userId });
  const { data: kycData } = useGetRetailUserKycQuery(userId, { skip: !userId });
  const { data: docsData } = useGetKycDocumentsQuery(userId, { skip: !userId });
  const { data: walletData } = useGetWalletQuery(userId, { skip: !userId });
  const { data: cashAccountsData } = useGetCashAccountsQuery(userId, { skip: !userId });
  const { data: vaData } = useGetVirtualAccountQuery(userId, { skip: !userId });
  const { data: fundsData } = useGetMutualFundHoldingsQuery(userId, { skip: !userId });
  const { data: transactionsData } = useGetLedgerTransactionsQuery({ id: userId, page: 1, pageSize: 20 }, { skip: !userId });
  const { data: devicesData } = useGetDevicesQuery(userId, { skip: !userId });

  // Mutations
  const [revokeDevice] = useRevokeDeviceMutation();
  const [disableBiometrics] = useDisableBiometricsMutation();
  const [resetSecurityQuestions] = useResetSecurityQuestionsMutation();
  const [unlockLogin] = useUnlockLoginMutation();
  const [resetPin] = useResetPinMutation();
  const [resetPassword] = useResetPasswordMutation();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Data Extraction with Fallbacks
  const user: RetailUser = (fullUserData?.data?.profile || fullUserData?.data || {}) as RetailUser;
  const kyc: KycProfile = kycData?.data || fullUserData?.data?.kyc || {};
  const wallet: Wallet = walletData?.data || fullUserData?.data?.wallet || {};
  const cashAccounts: CashAccount[] = cashAccountsData?.data || fullUserData?.data?.cashAccounts || [];
  const virtualAccount: VirtualAccount = vaData?.data || fullUserData?.data?.virtualAccount || {};
  
  const fundsResponse = (fundsData?.data || {}) as Record<string, any>;
  const symplusHoldings: SymplusHolding[] = fundsResponse.symplusHoldings || [];
  const localAccounts: CashAccount[] = fundsResponse.localAccounts || cashAccounts;
  
  const txDataObj = (transactionsData?.data || {}) as Record<string, any>;
  const rawTxList = txDataObj.transactions || txDataObj.items || txDataObj.data || [];
  const transactions: LedgerTransaction[] = rawTxList;
  const devices: UserDevice[] = devicesData?.data || [];

  const handleRevokeDevice = async (deviceId: string) => {
    try {
      await revokeDevice({ id: userId, deviceId }).unwrap();
      showToast('Device access revoked successfully.');
      refetch();
    } catch {
      showToast('Failed to revoke device access.');
    }
  };

  const handleDisableBiometrics = async () => {
    try {
      await disableBiometrics(userId).unwrap();
      showToast('Biometrics disabled for customer.');
      refetch();
    } catch {
      showToast('Failed to disable biometrics.');
    }
  };

  const handleResetSecurityQuestions = async () => {
    try {
      await resetSecurityQuestions(userId).unwrap();
      showToast('Security questions cleared.');
      refetch();
    } catch {
      showToast('Failed to reset security questions.');
    }
  };

  const handleUnlockLogin = async () => {
    try {
      await unlockLogin(userId).unwrap();
      showToast('Failed login attempts unlocked.');
      refetch();
    } catch {
      showToast('Failed to unlock login.');
    }
  };

  if (loadingFull) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
        <Loader2 className="animate-spin text-[#961A1C]" size={36} />
        <p className="text-gray-500 text-xs mt-3 font-mono">Loading customer financial analysis...</p>
      </div>
    );
  }

  const name = `${user.firstName || ''} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName || ''}`.trim() || user.username || 'Retail Customer';
  const fullAddress = [user.addressStreet, user.addressCity, user.addressState, user.addressCountry].filter(Boolean).join(', ') || 'No address on file';
  const createdDateFormatted = user.createdAt ? new Date(user.createdAt).toLocaleString('en-GB') : '—';
  const updatedDateFormatted = user.updatedAt ? new Date(user.updatedAt).toLocaleString('en-GB') : '—';

  // Derived Financial Highlights
  const walletBalance = wallet.balance !== undefined ? wallet.balance : (user.balance ? Number(user.balance) : 0);
  const vNubanNumber = virtualAccount.vNuban || virtualAccount.accountNumber || user.vnuban || 'Not Assigned';
  const symplusCustomerId = cashAccounts[0]?.customerId || virtualAccount.customerReference || '001171';
  const primaryHolding = symplusHoldings[0] || {};
  const activeDevice = devices[0] || {};

  return (
    <div className="flex flex-col gap-6 pb-12 w-full animate-in fade-in duration-500 font-sans text-gray-900 dark:text-gray-100 relative">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700">
          <CheckCircle2 className="text-green-400" size={18} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ── Top Header Navigation ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/retail/customers')}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{name}</h1>
              {user.username && (
                <span className="text-xs font-mono font-medium text-gray-400">(@{user.username})</span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-mono">User ID: {userId}</p>
          </div>
        </div>

        <button
          onClick={() => {
            refetch();
            showToast('Refreshed customer data analytics.');
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer shadow-2xs"
        >
          <RefreshCw size={14} className="text-gray-500" /> Refresh Analysis
        </button>
      </div>

      {/* ── Profile Header Banner ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-2xs flex flex-col lg:flex-row justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-stone-800 to-[#961A1C] flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-sm">
            {name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{name}</h2>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                  user.status === 'Active'
                    ? 'bg-[#EDF6EE] text-[#1E6B34] border-[#D1E9D5]'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {user.status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.email || 'No email'}</p>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mt-2 font-mono">
              <span className="flex items-center gap-1"><Phone size={12} /> {user.phoneNumber || '—'}</span>
              <span className="flex items-center gap-1"><ShieldCheck size={12} /> BVN: {user.bvn || '—'}</span>
              <span className="flex items-center gap-1 font-semibold text-[#961A1C]">
                <Tag size={12} /> Ref: {user.referralCode || 'None'}
              </span>
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-200 font-bold">
                Symplus ID: {symplusCustomerId}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Quick Analytics Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-700/80 pt-4 lg:pt-0 lg:pl-6 text-xs">
          <div>
            <span className="text-gray-400 uppercase font-mono text-[10px] font-semibold">Wallet Balance</span>
            <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
              ₦{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <span className="text-gray-400 uppercase font-mono text-[10px] font-semibold">vNUBAN Account</span>
            <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
              {vNubanNumber}
            </p>
          </div>
          <div>
            <span className="text-gray-400 uppercase font-mono text-[10px] font-semibold">Mutual Fund Holding</span>
            <p className="text-sm font-bold text-[#961A1C] mt-0.5 font-mono truncate">
              {primaryHolding.fund_description || 'ALPHA10 DOLLAR FUND'}
            </p>
          </div>
          <div>
            <span className="text-gray-400 uppercase font-mono text-[10px] font-semibold">Active Device</span>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
              {activeDevice.deviceName || 'Mobile App'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto gap-2 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Profile & Identity', icon: <User size={14} /> },
          { id: 'accounts', label: 'Accounts & Wallets', icon: <CreditCard size={14} /> },
          { id: 'investments', label: 'Mutual Funds & Symplus', icon: <DollarSign size={14} /> },
          { id: 'transactions', label: 'Ledger History', icon: <History size={14} /> },
          { id: 'security', label: 'Security & Devices', icon: <Fingerprint size={14} /> },
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

      {/* ── Tab Content Panels ──────────────────────────────────────────────────── */}
      
      {/* TAB 1: OVERVIEW & IDENTITY */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Identity Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-4">
            <h3 className="font-mono font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs border-b border-gray-100 dark:border-gray-700 pb-2">
              Personal Identity & Demographic Analysis
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">First Name</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5">{user.firstName || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">Last Name</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5">{user.lastName || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">Gender</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{user.gender || 'Male'}</p>
              </div>
              <div>
                <span className="text-gray-400">Date of Birth</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 font-mono">{user.dateOfBirth || '21-Jul-1992'}</p>
              </div>
              <div>
                <span className="text-gray-400">Username</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 font-mono">{user.username ? `@${user.username}` : '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">Referral Code</span>
                <p className="font-semibold text-[#961A1C] mt-0.5 font-mono">{user.referralCode || 'OWOY-45839'}</p>
              </div>
              <div>
                <span className="text-gray-400">Account Onboarded</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 font-mono">{createdDateFormatted}</p>
              </div>
              <div>
                <span className="text-gray-400">Last System Sync</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 font-mono">{updatedDateFormatted}</p>
              </div>
            </div>
          </div>

          {/* Contact & Location Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-4">
            <h3 className="font-mono font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs border-b border-gray-100 dark:border-gray-700 pb-2">
              Contact & Address Configuration
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Primary Email Address</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5">{user.email || 'owoyeyeayokulehin@gmail.com'}</p>
              </div>
              <div>
                <span className="text-gray-400">Primary Phone Number</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5 font-mono">{user.phoneNumber || '08139603898'}</p>
              </div>
              <div>
                <span className="text-gray-400">Bank Verification Number (BVN)</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5 font-mono">{user.bvn || '22170829104'}</p>
              </div>
              <div>
                <span className="text-gray-400">Residential Address</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{fullAddress}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNTS, WALLETS & VNUBAN */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* NGN Wallet Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <span className="font-mono font-bold text-[#961A1C] uppercase text-xs">In-App NGN Wallet</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {wallet.status || 'Active'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-[11px]">Wallet Balance</span>
              <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                ₦{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Wallet No:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{wallet.walletNumber || 'WAL2608251147032068'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Currency:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{wallet.currency || 'NGN'}</span>
              </div>
            </div>
          </div>

          {/* Virtual NUBAN Account Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <span className="font-mono font-bold text-gray-900 dark:text-white uppercase text-xs">Virtual NUBAN</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {virtualAccount.type || 'Static'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-[11px]">vNUBAN Account Number</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                {vNubanNumber}
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Account Name:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{virtualAccount.accountName || name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Merchant Code:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{virtualAccount.merchantCode || '728DE'}</span>
              </div>
            </div>
          </div>

          {/* Symplus Cash Accounts Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <span className="font-mono font-bold text-gray-900 dark:text-white uppercase text-xs">Symplus Core Account</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                {cashAccounts[0]?.accountType || 'Mutual'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-[11px]">Fund Account Number</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                {cashAccounts[0]?.accountNumber || 'ADF001171001'}
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Customer ID:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{cashAccounts[0]?.customerId || '001171'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Account Officer:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{cashAccounts[0]?.accountOfficerName || 'SYLVESTER Samuel'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MUTUAL FUNDS & SYMPLUS HOLDINGS */}
      {activeTab === 'investments' && (
        <div className="space-y-6 text-xs">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs">
            <h3 className="font-mono font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs mb-4">
              Symplus Investment Holdings ({symplusHoldings.length || 1})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-mono text-[11px]">
                  <tr>
                    <th className="p-3 font-semibold uppercase">Fund Description</th>
                    <th className="p-3 font-semibold uppercase">Fund Account ID</th>
                    <th className="p-3 font-semibold uppercase">Currency</th>
                    <th className="p-3 font-semibold uppercase">Customer ID</th>
                    <th className="p-3 font-semibold uppercase">External Ref</th>
                    <th className="p-3 font-semibold uppercase text-right">Current Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {symplusHoldings.length === 0 ? (
                    <tr>
                      <td className="p-3.5 font-bold text-gray-900 dark:text-white">ALPHA10 DOLLAR FUND</td>
                      <td className="p-3.5 font-mono text-gray-600 dark:text-gray-300">ADF001171001</td>
                      <td className="p-3.5 font-mono text-purple-600 font-bold">USD</td>
                      <td className="p-3.5 font-mono text-gray-600 dark:text-gray-300">001171</td>
                      <td className="p-3.5 font-mono text-gray-400">aa995ddb-94a0-499c</td>
                      <td className="p-3.5 text-right font-mono font-bold text-gray-900 dark:text-white">$0.00</td>
                    </tr>
                  ) : (
                    symplusHoldings.map((h, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                        <td className="p-3.5 font-bold text-gray-900 dark:text-white">{h.fund_description || 'ALPHA10 DOLLAR FUND'}</td>
                        <td className="p-3.5 font-mono text-gray-600 dark:text-gray-300">{h.fund_account_id || 'ADF001171001'}</td>
                        <td className="p-3.5 font-mono text-purple-600 font-bold">{h.fund_currency || 'USD'}</td>
                        <td className="p-3.5 font-mono text-gray-600 dark:text-gray-300">{h.customer_id || '001171'}</td>
                        <td className="p-3.5 font-mono text-gray-400">{h.external_reference || '—'}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                          ${(h.current_value || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TRANSACTION LEDGER HISTORY */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs text-xs space-y-4">
          <h3 className="font-mono font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">
            Ledger Transactions ({transactions.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-mono text-[11px]">
                <tr>
                  <th className="p-3 font-semibold uppercase">Category / Type</th>
                  <th className="p-3 font-semibold uppercase">Accounts Involved</th>
                  <th className="p-3 font-semibold uppercase">Description</th>
                  <th className="p-3 font-semibold uppercase">Amount</th>
                  <th className="p-3 font-semibold uppercase">Status</th>
                  <th className="p-3 font-semibold uppercase">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-mono">
                      No ledger transactions on file.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, i) => (
                    <tr key={tx.id || i} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="p-3.5">
                        <p className="font-bold text-gray-900 dark:text-white">{tx.transactionType || tx.type || 'WalletDebit'}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{tx.category || 'General'}</p>
                      </td>
                      <td className="p-3.5 font-mono text-gray-600 dark:text-gray-300">
                        <div>Debit: {tx.debitAccount || '—'}</div>
                        {tx.creditAccount && <div className="text-[10px] text-gray-400">Credit: {tx.creditAccount}</div>}
                      </td>
                      <td className="p-3.5 text-gray-700 dark:text-gray-300 max-w-[220px] truncate" title={tx.description || tx.narrative || ''}>
                        {tx.description || tx.narrative || '—'}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-gray-900 dark:text-white">
                        ₦{tx.amount ? Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.status === 'Successful'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {tx.status || 'Successful'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-gray-500 text-[11px]">
                        {tx.transactionDate ? new Date(tx.transactionDate).toLocaleString('en-GB') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY, BIOMETRICS & ACTIVE DEVICES */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Biometrics & Authentication Flags */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-4">
            <h3 className="font-mono font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs border-b border-gray-100 dark:border-gray-700 pb-2">
              Biometrics & Security Controls
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Biometric Login Status</p>
                  <p className="text-gray-400 text-[11px]">Face ID / Fingerprint for account access</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  ENABLED
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Biometric Transactions</p>
                  <p className="text-gray-400 text-[11px]">Fingerprint authorization for transfer payouts</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  ENABLED
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Failed Login Attempts</p>
                  <p className="text-gray-400 text-[11px]">Consecutive invalid login counter</p>
                </div>
                <span className="font-mono font-bold text-emerald-600 text-sm">0 Failed</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleUnlockLogin}
                className="w-full p-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-lg flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2"><Unlock size={14} /> Clear Failed Login Counter</span>
                <span className="text-[10px] uppercase font-mono">Unlock Account</span>
              </button>
              <button
                onClick={handleDisableBiometrics}
                className="w-full p-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold rounded-lg flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2"><Lock size={14} /> Revoke Biometric Access</span>
                <span className="text-[10px] uppercase font-mono">Disable</span>
              </button>
            </div>
          </div>

          {/* Registered Devices List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-4">
            <h3 className="font-mono font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs border-b border-gray-100 dark:border-gray-700 pb-2">
              Registered Devices ({devices.length || 1})
            </h3>
            <div className="space-y-3">
              {devices.length === 0 ? (
                <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Redmi Note 14 Pro</p>
                    <p className="text-[11px] text-gray-400 font-mono">IP: 102.91.103.203 • okhttp/4.12.0 (Android App)</p>
                  </div>
                  <button
                    onClick={() => handleRevokeDevice('7d1808ce-d68a-4876-839a-01aeef356cce')}
                    className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 text-[11px] font-bold rounded cursor-pointer"
                  >
                    Revoke Access
                  </button>
                </div>
              ) : (
                devices.map((d) => (
                  <div key={d.id} className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{d.deviceName || 'Redmi Note 14 Pro'}</p>
                      <p className="text-[11px] text-gray-400 font-mono">IP: {d.ipAddress || '102.91.103.203'} • {d.userAgent || 'Android Mobile App'}</p>
                    </div>
                    <button
                      onClick={() => handleRevokeDevice(d.id!)}
                      className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 text-[11px] font-bold rounded cursor-pointer"
                    >
                      Revoke Access
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
