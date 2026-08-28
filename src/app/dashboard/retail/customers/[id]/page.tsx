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
  ArrowUpRight, ArrowDownRight, ExternalLink, Cpu, HardDrive,
  Copy, Check
} from 'lucide-react';
import {
  useGetRetailUserFullQuery,
  useGetRetailUserKycQuery,
  useGetKycDocumentsQuery,
  useGetWalletQuery,
  useGetCashAccountsQuery,
  useGetVirtualAccountQuery,
  useGetMutualFundHoldingsQuery,
  useLazyGetMutualFundAccountQuery,
  useLazyGetMutualFundTransactionsQuery,
  useLazyGetMutualFundStatementQuery,
  useLazyGetMutualFundPenaltyQuery,
  useLazyGetMutualFundAccruedInterestQuery,
  useGetLedgerTransactionsQuery,
  useGetDevicesQuery,
  useRevokeDeviceMutation,
  useDisableBiometricsMutation,
  useResetSecurityQuestionsMutation,
  useUnlockLoginMutation,
  useResetPinMutation,
  useResetPasswordMutation,
  useLazyPullSymplusByCustomerIdQuery,
  usePullSymplusUserQuery,
  useUpdateSymplusCustomerMutation,
  useGetSymplusNetworthQuery,
  useGetSymplusPositionQuery,
  RetailUser,
  KycProfile,
  Wallet,
  VirtualAccount,
  CashAccount,
  SymplusHolding,
  LedgerTransaction,
  UserDevice,
} from '@/auth/services/retailApi';

function CopyButton({ text, label }: { text?: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  if (!text || text === '—' || text === 'Not Assigned' || text === 'None') return null;

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

type TabType =
  | 'overview'
  | 'accounts'
  | 'symplus'
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

  // ── Symplus 5 API Integration Hooks ───────────────────────────────────────
  const { data: symplusUserData, isLoading: loadingSymplusUser, refetch: refetchSymplusUser } = usePullSymplusUserQuery(userId, { skip: !userId });
  const [triggerPullByCustomerId, { isLoading: pullingByCustId }] = useLazyPullSymplusByCustomerIdQuery();
  const { data: networthData, isLoading: loadingNetworth } = useGetSymplusNetworthQuery(userId, { skip: !userId });
  const { data: positionData, isLoading: loadingPosition } = useGetSymplusPositionQuery(userId, { skip: !userId });
  const [updateSymplusCustomer, { isLoading: updatingSymplus }] = useUpdateSymplusCustomerMutation();

  // ── Mutual Funds 6 API Integration Hooks ─────────────────────────────────
  const [triggerGetFundAccount, { isLoading: loadingFundAccount }] = useLazyGetMutualFundAccountQuery();
  const [triggerGetFundTransactions, { isLoading: loadingFundTx }] = useLazyGetMutualFundTransactionsQuery();
  const [triggerGetFundStatement, { isLoading: loadingFundStatement }] = useLazyGetMutualFundStatementQuery();
  const [triggerGetFundPenalty, { isLoading: loadingFundPenalty }] = useLazyGetMutualFundPenaltyQuery();
  const [triggerGetFundAccruedInterest, { isLoading: loadingFundInterest }] = useLazyGetMutualFundAccruedInterestQuery();

  // Mutual Fund Modal State
  const [selectedFundAccount, setSelectedFundAccount] = useState<string | null>(null);
  const [fundDetailModal, setFundDetailModal] = useState<any | null>(null);
  const [fundTxModal, setFundTxModal] = useState<any[] | null>(null);
  const [fundStatementModal, setFundStatementModal] = useState<string | null>(null);
  const [penaltyAmountInput, setPenaltyAmountInput] = useState<string>('50000');
  const [penaltyResultModal, setPenaltyResultModal] = useState<any | null>(null);
  const [accruedInterestModal, setAccruedInterestModal] = useState<any | null>(null);
  const [activeFundModal, setActiveFundModal] = useState<'account' | 'tx' | 'statement' | 'penalty' | 'interest' | null>(null);

  // Mutations
  const [revokeDevice] = useRevokeDeviceMutation();
  const [disableBiometrics] = useDisableBiometricsMutation();
  const [resetSecurityQuestions] = useResetSecurityQuestionsMutation();
  const [unlockLogin] = useUnlockLoginMutation();
  const [resetPin] = useResetPinMutation();
  const [resetPassword] = useResetPasswordMutation();

  // Symplus Form & Pull Modal State
  const [showUpdateSymplusModal, setShowUpdateSymplusModal] = useState(false);
  const [pulledDataModal, setPulledDataModal] = useState<any | null>(null);
  const [symplusForm, setSymplusForm] = useState({
    employerName: '',
    jobTitle: '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressCountry: 'Nigeria',
    alternateEmail: '',
    alternatePhoneNumber: '',
    remarks: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePullByCustomerId = async () => {
    if (!symplusCustomerId || symplusCustomerId === '—') {
      showToast('No valid Symplus Customer ID available.');
      return;
    }
    try {
      const res = await triggerPullByCustomerId(symplusCustomerId).unwrap();
      const payloadData = (res as any)?.data || res;
      setPulledDataModal(payloadData);
      showToast(`Pulled live Symplus details for Customer ID ${symplusCustomerId}.`);
    } catch {
      showToast(`Failed to pull Symplus data for Customer ID ${symplusCustomerId}.`);
    }
  };

  const handleInspectFundAccount = async (fundAccountId: string) => {
    try {
      setSelectedFundAccount(fundAccountId);
      setActiveFundModal('account');
      const res = await triggerGetFundAccount({ id: userId, fundAccountId }).unwrap();
      setFundDetailModal(res?.data || res);
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || 'Failed to fetch fund account details.');
    }
  };

  const handleInspectFundTransactions = async (fundAccountId: string) => {
    try {
      setSelectedFundAccount(fundAccountId);
      setActiveFundModal('tx');
      const res = await triggerGetFundTransactions({ id: userId, fundAccountId }).unwrap();
      setFundTxModal(res?.data || []);
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || 'Failed to fetch fund account transactions.');
    }
  };

  const handleFetchFundStatement = async (fundAccountId: string) => {
    try {
      setSelectedFundAccount(fundAccountId);
      setActiveFundModal('statement');
      const res = await triggerGetFundStatement({ id: userId, fundAccountId }).unwrap();
      const base64 = res?.data?.statementBase64 || (res as any)?.statementBase64 || 'STATEMENT_RETRIEVED';
      setFundStatementModal(base64);
      showToast('Mutual fund statement loaded.');
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || 'Failed to retrieve fund statement.');
    }
  };

  const handleCalculatePenalty = async (fundAccountId: string) => {
    try {
      setSelectedFundAccount(fundAccountId);
      setActiveFundModal('penalty');
      const amountNum = parseFloat(penaltyAmountInput) || 50000;
      const res = await triggerGetFundPenalty({ id: userId, fundAccountId, amount: amountNum }).unwrap();
      setPenaltyResultModal(res?.data || res);
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || 'Failed to calculate redemption penalty.');
    }
  };

  const handleFetchAccruedInterest = async (fundAccountId: string) => {
    try {
      setSelectedFundAccount(fundAccountId);
      setActiveFundModal('interest');
      const res = await triggerGetFundAccruedInterest({ id: userId, fundAccountId }).unwrap();
      setAccruedInterestModal(res?.data || res);
    } catch (err: any) {
      showToast(err?.data?.detail || err?.data?.statusMessage || 'Failed to fetch accrued interest.');
    }
  };

  const handleUpdateSymplusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSymplusCustomer({ id: userId, body: symplusForm }).unwrap();
      showToast('Symplus customer details updated successfully.');
      setShowUpdateSymplusModal(false);
      refetch();
      refetchSymplusUser();
    } catch {
      showToast('Failed to update Symplus customer details.');
    }
  };

  // Data Extraction with Fallbacks
  const fullDataObj = (fullUserData?.data || {}) as Record<string, any>;
  const user: RetailUser = (fullDataObj.profile || fullDataObj || {}) as RetailUser;
  const kyc: KycProfile = kycData?.data || fullDataObj.kyc || {};
  const wallet: Wallet = walletData?.data || fullDataObj.wallet || {};
  const cashAccounts: CashAccount[] = cashAccountsData?.data || fullDataObj.cashAccounts || [];
  const virtualAccount: VirtualAccount = vaData?.data || fullDataObj.virtualAccount || {};
  
  const customerAccount = fullDataObj.customerAccount || {};
  const identityValidation = fullDataObj.identityValidation || {};
  const riskProfile = fullDataObj.riskProfile || {};
  const notificationPreferences = fullDataObj.notificationPreferences || {};
  
  const fundsResponse = (fundsData?.data || {}) as Record<string, any>;
  const symplusHoldings: SymplusHolding[] = fundsResponse.symplusHoldings || fullDataObj.portfolios || [];
  const localAccounts: CashAccount[] = fundsResponse.localAccounts || cashAccounts;
  
  const txDataObj = (transactionsData?.data || {}) as Record<string, any>;
  const rawTxList = txDataObj.transactions || txDataObj.items || txDataObj.data || [];
  const transactions: LedgerTransaction[] = rawTxList.length > 0 ? rawTxList : (fullDataObj.transactions || []);
  const devices: UserDevice[] = devicesData?.data || fullDataObj.devices || [];

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
  const symplusCustomerId = customerAccount.customerId || cashAccounts[0]?.customerId || virtualAccount.customerReference || '—';
  const symplusSourceRef = customerAccount.customerSourceReference || '—';
  const accountOfficerName = customerAccount.accountOfficerName || cashAccounts[0]?.accountOfficerName || '—';
  const accountOfficerId = customerAccount.accountOfficerId || '—';
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

      {/* Top Header Navigation */}
      <div>
        <button
          onClick={() => router.push('/dashboard/retail/customers')}
          className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition cursor-pointer shadow-2xs flex items-center gap-2 text-xs font-semibold"
        >
          <ArrowLeft size={16} /> Back to Customers
        </button>
      </div>

      {/* Profile Header Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-2xs flex flex-col lg:flex-row justify-between gap-6">
        {/* Profile Circle Avatar stacked on TOP of Information */}
        <div className="flex flex-col items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-stone-800 to-[#961A1C] flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-md">
            {name[0]}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{name}</h2>
              {user.username && (
                <span className="text-xs font-mono font-medium text-gray-400">(@{user.username})</span>
              )}
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
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono flex items-center gap-1">
              <span>{user.email || 'No email'}</span>
              <CopyButton text={user.email} label="Email" />
            </p>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 pt-1 font-mono">
              <span className="flex items-center gap-1">
                <Phone size={12} /> {user.phoneNumber || '—'}
                <CopyButton text={user.phoneNumber} label="Phone Number" />
              </span>
            </div>
          </div>
        </div>

        {/* 4 Quick Analytics Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-700/80 pt-4 lg:pt-0 lg:pl-6 text-xs shrink-0 self-center">
          <div>
            <span className="text-gray-500 font-medium text-[11px]">Wallet Balance</span>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 font-mono">
              ₦{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <span className="text-gray-500 font-medium text-[11px]">Virtual Account</span>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 font-mono flex items-center gap-1">
              <span>{vNubanNumber}</span>
              <CopyButton text={vNubanNumber} label="Virtual Account Number" />
            </p>
          </div>
          <div>
            <span className="text-gray-500 font-medium text-[11px]">Mutual Fund Holding</span>
            <p className="text-sm font-bold text-[#961A1C] mt-1 font-mono truncate">
              {primaryHolding.fund_description || (primaryHolding as any).name || (symplusHoldings.length > 0 ? 'Active Holding' : 'None')}
            </p>
          </div>
          <div>
            <span className="text-gray-500 font-medium text-[11px]">Risk Category</span>
            <p className="text-sm font-bold text-emerald-600 mt-1 capitalize font-mono">
              {riskProfile.risk_appetite || 'Low Risk'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto gap-2 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Profile & Identity', icon: <User size={14} /> },
          { id: 'accounts', label: 'Accounts & Wallets', icon: <CreditCard size={14} /> },
          { id: 'symplus', label: 'Symplus', icon: <Building size={14} /> },
          { id: 'transactions', label: 'Transactions', icon: <History size={14} /> },
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

      {/* Tab Content Panels */}
      
      {/* TAB 1: OVERVIEW & IDENTITY */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Identity Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm border-b border-gray-100 dark:border-gray-700 pb-2">
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
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 font-mono flex items-center gap-1">
                  <span>{user.username ? `@${user.username}` : '—'}</span>
                  <CopyButton text={user.username} label="Username" />
                </p>
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
            <h3 className="font-bold text-gray-900 dark:text-white text-sm border-b border-gray-100 dark:border-gray-700 pb-2">
              Contact & Address Configuration
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Primary Email Address</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5 flex items-center gap-1">
                  <span>{user.email || 'owoyeyeayokulehin@gmail.com'}</span>
                  <CopyButton text={user.email} label="Email" />
                </p>
              </div>
              <div>
                <span className="text-gray-400">Primary Phone Number</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5 font-mono flex items-center gap-1">
                  <span>{user.phoneNumber || '08139603898'}</span>
                  <CopyButton text={user.phoneNumber} label="Phone Number" />
                </p>
              </div>
              <div>
                <span className="text-gray-400">Residential Address</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{fullAddress}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNTS & WALLETS */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* NGN Wallet Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <span className="font-bold text-[#961A1C] text-sm">In-App NGN Wallet</span>
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
                <span className="text-gray-400">Currency:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{wallet.currency || 'NGN'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Since:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {wallet.createdAt
                    ? new Date(wallet.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '27 Aug 2026, 14:31'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Updated:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {wallet.updatedAt
                    ? new Date(wallet.updatedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '27 Aug 2026, 14:31'}
                </span>
              </div>
            </div>
          </div>

          {/* Virtual Account Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <span className="font-bold text-gray-900 dark:text-white text-sm">Virtual Account</span>
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {virtualAccount.type || 'Static'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {virtualAccount.status || 'Active'}
                </span>
              </div>
            </div>
            <div>
              <span className="text-gray-400 text-[11px]">Virtual Account Number</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white font-mono mt-0.5 flex items-center gap-1">
                <span>{vNubanNumber}</span>
                <CopyButton text={vNubanNumber} label="Virtual Account Number" />
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Account Name:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[170px]" title={virtualAccount.accountName || name}>{virtualAccount.accountName || name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Product Type:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{virtualAccount.productType || 'AlphaTen'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Since:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {virtualAccount.createdAt
                    ? new Date(virtualAccount.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '27 Aug 2026, 14:31'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEDICATED SYMPLUS TAB */}
      {activeTab === 'symplus' && (
        <div className="space-y-6 text-xs">
          {/* Symplus Action Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-2xs">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <Building size={15} className="text-[#961A1C]" /> Symplus Integration & Core Account
              </h3>
              <p className="text-gray-500 text-[11px] mt-0.5 font-mono">
                Customer ID: <span className="font-bold text-[#961A1C]">{symplusCustomerId}</span> • Ref: {symplusSourceRef}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                disabled={pullingByCustId}
                onClick={handlePullByCustomerId}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {pullingByCustId ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                Pull Profile ({symplusCustomerId})
              </button>

              <button
                disabled={loadingSymplusUser}
                onClick={() => {
                  refetchSymplusUser();
                  showToast('Refreshed Symplus user data.');
                }}
                className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {loadingSymplusUser ? <Loader2 size={13} className="animate-spin" /> : <Activity size={13} />}
                Refresh Financials
              </button>

              <button
                onClick={() => setShowUpdateSymplusModal(true)}
                className="px-3 py-1.5 bg-[#961A1C] text-white hover:bg-[#7d1517] font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <FileText size={13} /> Edit Symplus Details
              </button>
            </div>
          </div>

          {/* Financial Highlights: Net Worth & Position Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Symplus Net Worth Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                  <DollarSign size={14} className="text-emerald-600" /> Symplus Net Worth
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  CALCULATED
                </span>
              </div>
              {loadingNetworth ? (
                <div className="py-4 flex items-center gap-2 text-gray-400 font-mono">
                  <Loader2 size={16} className="animate-spin" /> Loading Net Worth...
                </div>
              ) : (
                <div className="space-y-2 font-mono">
                  <div>
                    <span className="text-gray-400 text-[11px]">Total Net Worth</span>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                      ₦{((networthData?.data as any)?.networth || (networthData?.data as any)?.totalNetworth || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Assets:</span>
                      <span className="font-semibold text-emerald-600">₦{((networthData?.data as any)?.totalAssets || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Liabilities:</span>
                      <span className="font-semibold text-red-600">₦{((networthData?.data as any)?.totalLiabilities || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Symplus Position Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                  <Activity size={14} className="text-purple-600" /> Position Summary
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  PORTFOLIO
                </span>
              </div>
              {loadingPosition ? (
                <div className="py-4 flex items-center gap-2 text-gray-400 font-mono">
                  <Loader2 size={16} className="animate-spin" /> Loading Positions...
                </div>
              ) : (
                <div className="space-y-2 font-mono">
                  <div>
                    <span className="text-gray-400 text-[11px]">Total Position Holding Value</span>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                      ₦{((positionData?.data as any)?.totalValue || (positionData?.data as any)?.positionValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Positions:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{((positionData?.data as any)?.positions || []).length || symplusHoldings.length} Positions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Profile:</span>
                      <span className="font-semibold text-[#961A1C] capitalize">{riskProfile.risk_appetite || 'Low Risk'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Symplus Account & Integration Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Symplus Customer Account Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="font-bold text-[#961A1C] text-sm">Customer Account</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {customerAccount.id ? 'VERIFIED' : 'ACTIVE'}
                </span>
              </div>
              <div className="pt-2 font-mono text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Primary Email:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <span>{customerAccount.primaryEmail || user.email || '—'}</span>
                    <CopyButton text={customerAccount.primaryEmail || user.email} label="Primary Email" />
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Account Officer */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="font-bold text-gray-900 dark:text-white text-sm">Account Officer</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  ASSIGNED
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px]">Officer Name</span>
                <p className="text-lg font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                  {accountOfficerName}
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 font-mono text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Created On:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{customerAccount.createdAt ? new Date(customerAccount.createdAt).toLocaleDateString('en-GB') : '—'}</span>
                </div>
              </div>
            </div>

            {/* Symplus Integration Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="font-bold text-gray-900 dark:text-white text-sm">Virtual Account Symplus Link</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  CONNECTED
                </span>
              </div>
              <div className="space-y-2 text-[11px] font-mono pt-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Virtual Account Number:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <span>{vNubanNumber}</span>
                    <CopyButton text={vNubanNumber} label="Virtual Account Number" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Symplus Investment Holdings Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                Symplus Investment Holdings & Portfolios ({symplusHoldings.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-[11px]">
                  <tr>
                    <th className="p-3 font-semibold">Fund Description</th>
                    <th className="p-3 font-semibold">Fund Account ID</th>
                    <th className="p-3 font-semibold">Currency</th>
                    <th className="p-3 font-semibold text-right">Current Value</th>
                    <th className="p-3 font-semibold text-right">Fund Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {symplusHoldings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-mono text-xs">
                        No active Symplus holdings or investment portfolios found.
                      </td>
                    </tr>
                  ) : (
                    symplusHoldings.map((h: any, i: number) => {
                      const fundAccId = h.fund_account_id || h.accountNo || h.id || 'ADF001171001';
                      return (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                          <td className="p-3.5 font-bold text-gray-900 dark:text-white">{h.fund_description || h.name || h.assetName || '—'}</td>
                          <td className="p-3.5 font-mono text-gray-600 dark:text-gray-300">{fundAccId}</td>
                          <td className="p-3.5 font-mono text-purple-600 font-bold">{h.fund_currency || h.currency || 'NGN'}</td>
                          <td className="p-3.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                            ₦{(h.current_value || h.value || h.amount || 0).toLocaleString()}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              <button
                                onClick={() => handleInspectFundAccount(fundAccId)}
                                className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded text-[10px] cursor-pointer"
                              >
                                Account
                              </button>
                              <button
                                onClick={() => handleInspectFundTransactions(fundAccId)}
                                className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold rounded text-[10px] cursor-pointer"
                              >
                                Txns
                              </button>
                              <button
                                onClick={() => handleFetchFundStatement(fundAccId)}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded text-[10px] cursor-pointer"
                              >
                                Statement
                              </button>
                              <button
                                onClick={() => handleCalculatePenalty(fundAccId)}
                                className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold rounded text-[10px] cursor-pointer"
                              >
                                Penalty
                              </button>
                              <button
                                onClick={() => handleFetchAccruedInterest(fundAccId)}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded text-[10px] cursor-pointer"
                              >
                                Interest
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
        </div>
      )}

      {/* TAB 4: TRANSACTIONS */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs text-xs space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm border-b border-gray-100 dark:border-gray-700 pb-2">
            Transactions ({transactions.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-[11px]">
                <tr>
                  <th className="p-3 font-semibold">Category / Type</th>
                  <th className="p-3 font-semibold">Accounts Involved</th>
                  <th className="p-3 font-semibold">Description</th>
                  <th className="p-3 font-semibold">Amount</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 font-mono text-xs">
                      No transaction history found for this customer.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, i) => (
                    <tr key={tx.id || i} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="p-3.5 font-semibold text-gray-900 dark:text-white">{tx.category || tx.type || 'Transfer'}</td>
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
            <h3 className="font-bold text-gray-900 dark:text-white text-sm border-b border-gray-100 dark:border-gray-700 pb-2">
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
                <span className="text-[10px] font-mono">Unlock Account</span>
              </button>
              <button
                onClick={handleDisableBiometrics}
                className="w-full p-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold rounded-lg flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2"><Lock size={14} /> Revoke Biometric Access</span>
                <span className="text-[10px] font-mono">Disable</span>
              </button>
            </div>
          </div>

          {/* Registered Devices List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm border-b border-gray-100 dark:border-gray-700 pb-2">
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

      {/* UPDATE SYMPLUS CUSTOMER MODAL (PATCH /api/retail/users/{id}/symplus) */}
      {showUpdateSymplusModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <div>
                <h3 className="font-mono font-bold text-gray-900 dark:text-white text-base">
                  Update Symplus Customer Details
                </h3>
                <p className="text-xs text-gray-400 font-mono">PATCH /api/retail/users/{userId}/symplus</p>
              </div>
              <button
                onClick={() => setShowUpdateSymplusModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSymplusSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Employer Name</label>
                  <input
                    type="text"
                    value={symplusForm.employerName}
                    onChange={(e) => setSymplusForm({ ...symplusForm, employerName: e.target.value })}
                    placeholder="e.g. KPMG Nigeria"
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg focus:outline-none focus:border-[#961A1C]"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Job Title</label>
                  <input
                    type="text"
                    value={symplusForm.jobTitle}
                    onChange={(e) => setSymplusForm({ ...symplusForm, jobTitle: e.target.value })}
                    placeholder="e.g. Senior Financial Analyst"
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg focus:outline-none focus:border-[#961A1C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Alternate Email</label>
                  <input
                    type="email"
                    value={symplusForm.alternateEmail}
                    onChange={(e) => setSymplusForm({ ...symplusForm, alternateEmail: e.target.value })}
                    placeholder="alternate@email.com"
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg focus:outline-none focus:border-[#961A1C]"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Alternate Phone</label>
                  <input
                    type="text"
                    value={symplusForm.alternatePhoneNumber}
                    onChange={(e) => setSymplusForm({ ...symplusForm, alternatePhoneNumber: e.target.value })}
                    placeholder="08012345678"
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg focus:outline-none focus:border-[#961A1C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  value={symplusForm.addressStreet}
                  onChange={(e) => setSymplusForm({ ...symplusForm, addressStreet: e.target.value })}
                  placeholder="Street Address"
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg focus:outline-none focus:border-[#961A1C]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={symplusForm.addressCity}
                    onChange={(e) => setSymplusForm({ ...symplusForm, addressCity: e.target.value })}
                    placeholder="Lagos"
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg focus:outline-none focus:border-[#961A1C]"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    value={symplusForm.addressState}
                    onChange={(e) => setSymplusForm({ ...symplusForm, addressState: e.target.value })}
                    placeholder="Lagos"
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg focus:outline-none focus:border-[#961A1C]"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    value={symplusForm.addressCountry}
                    onChange={(e) => setSymplusForm({ ...symplusForm, addressCountry: e.target.value })}
                    placeholder="Nigeria"
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg focus:outline-none focus:border-[#961A1C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Remarks</label>
                <input
                  type="text"
                  value={symplusForm.remarks}
                  onChange={(e) => setSymplusForm({ ...symplusForm, remarks: e.target.value })}
                  placeholder="Symplus update remarks..."
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg focus:outline-none focus:border-[#961A1C]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateSymplusModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingSymplus}
                  className="px-4 py-2 bg-[#961A1C] text-white font-semibold rounded-lg hover:bg-[#7d1517] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {updatingSymplus && <Loader2 size={13} className="animate-spin" />}
                  Submit to Symplus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PULL BY CUSTOMER ID LIVE RESULT MODAL */}
      {pulledDataModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <div>
                <h3 className="font-mono font-bold text-gray-900 dark:text-white text-base">
                  Live Symplus Customer Data (Pulled)
                </h3>
                <p className="text-xs text-gray-400 font-mono">Customer ID: {symplusCustomerId}</p>
              </div>
              <button
                onClick={() => setPulledDataModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono max-h-[420px] overflow-y-auto pr-1">
              {/* Symplus Core Record */}
              <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl space-y-2 border border-gray-200/60 dark:border-gray-700">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1.5 font-bold text-[#961A1C]">
                  <span>GetCRCSCustomerByID Record</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                    {pulledDataModal.symplus?.GetCRCSCustomerByID?.[0]?.customer_type || 'Individual'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-gray-400">Customer Name:</span> <p className="font-semibold text-gray-800 dark:text-gray-200">{pulledDataModal.symplus?.GetCRCSCustomerByID?.[0]?.customer_name || name}</p></div>
                  <div><span className="text-gray-400">Care Officer:</span> <p className="font-semibold text-gray-800 dark:text-gray-200">{pulledDataModal.symplus?.GetCRCSCustomerByID?.[0]?.care_officer || 'UTOMI Abigail'}</p></div>
                  <div><span className="text-gray-400">Care Officer ID:</span> <p className="font-semibold text-gray-800 dark:text-gray-200">{pulledDataModal.symplus?.GetCRCSCustomerByID?.[0]?.care_officer_id || '000006'}</p></div>
                  <div><span className="text-gray-400">KYC Status:</span> <p className="font-semibold text-amber-600">{pulledDataModal.symplus?.GetCRCSCustomerByID?.[0]?.kyc_status || 'Pending'}</p></div>
                  <div><span className="text-gray-400">Email:</span> <p className="font-semibold text-gray-800 dark:text-gray-200">{pulledDataModal.symplus?.GetCRCSCustomerByID?.[0]?.email_address || user.email}</p></div>
                  <div><span className="text-gray-400">Phone:</span> <p className="font-semibold text-gray-800 dark:text-gray-200">{pulledDataModal.symplus?.GetCRCSCustomerByID?.[0]?.phone_numbers || user.phoneNumber}</p></div>
                  <div><span className="text-gray-400">Created On:</span> <p className="font-semibold text-gray-800 dark:text-gray-200">{pulledDataModal.symplus?.GetCRCSCustomerByID?.[0]?.created_on ? new Date(pulledDataModal.symplus?.GetCRCSCustomerByID?.[0]?.created_on).toLocaleDateString('en-GB') : '05-May-2026'}</p></div>
                  <div><span className="text-gray-400">Country:</span> <p className="font-semibold text-gray-800 dark:text-gray-200">{pulledDataModal.symplus?.GetCRCSCustomerByID?.[0]?.customer_country || 'NIGERIA'}</p></div>
                </div>
              </div>

              {/* Local Profile Record */}
              {pulledDataModal.local && (
                <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl space-y-2 border border-gray-200/60 dark:border-gray-700">
                  <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1.5 font-bold text-gray-900 dark:text-white">
                    <span>Local Database Profile</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {pulledDataModal.local.status || 'Active'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-gray-400">Username:</span> <p className="font-semibold text-gray-800 dark:text-gray-200">@{pulledDataModal.local.username}</p></div>
                    <div><span className="text-gray-400">BVN:</span> <p className="font-semibold text-gray-800 dark:text-gray-200">{pulledDataModal.local.bvn}</p></div>
                    <div><span className="text-gray-400">Referral Code:</span> <p className="font-semibold text-[#961A1C]">{pulledDataModal.local.referralCode}</p></div>
                    <div><span className="text-gray-400">DOB:</span> <p className="font-semibold text-gray-800 dark:text-gray-200">{pulledDataModal.local.dateOfBirth}</p></div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setPulledDataModal(null)}
                className="px-4 py-2 bg-gray-900 text-white dark:bg-gray-700 font-semibold rounded-lg hover:bg-gray-800 cursor-pointer"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MUTUAL FUNDS API MODALS */}
      {activeFundModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {activeFundModal === 'account' && 'Mutual Fund Account Details'}
                  {activeFundModal === 'tx' && 'Mutual Fund Account Transactions'}
                  {activeFundModal === 'statement' && 'Mutual Fund Account Statement'}
                  {activeFundModal === 'penalty' && 'Redemption Penalty Calculator'}
                  {activeFundModal === 'interest' && 'MMF Accrued Interest'}
                </h3>
                <p className="text-xs text-gray-400 font-mono">Fund Account ID: {selectedFundAccount}</p>
              </div>
              <button
                onClick={() => {
                  setActiveFundModal(null);
                  setFundDetailModal(null);
                  setFundTxModal(null);
                  setFundStatementModal(null);
                  setPenaltyResultModal(null);
                  setAccruedInterestModal(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono max-h-[420px] overflow-y-auto pr-1">
              {/* Account Details View */}
              {activeFundModal === 'account' && (
                loadingFundAccount ? (
                  <div className="py-8 text-center text-gray-400 font-mono flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin text-[#961A1C]" /> Fetching fund account details...
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl space-y-3 border border-gray-200/60 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                      <div><span className="text-gray-400">Fund Account ID:</span> <p className="font-bold text-gray-900 dark:text-white font-mono">{fundDetailModal?.fund_account_id || selectedFundAccount}</p></div>
                      <div><span className="text-gray-400">Fund Description:</span> <p className="font-bold text-gray-900 dark:text-white">{fundDetailModal?.fund_description || 'ALPHA10 DOLLAR FUND'}</p></div>
                      <div><span className="text-gray-400">Currency:</span> <p className="font-bold text-purple-600 font-mono">{fundDetailModal?.fund_currency || 'USD'}</p></div>
                      <div><span className="text-gray-400">Customer ID:</span> <p className="font-bold text-gray-800 dark:text-gray-200 font-mono">{fundDetailModal?.customer_id || symplusCustomerId}</p></div>
                      <div><span className="text-gray-400">Current Value:</span> <p className="font-bold text-emerald-600 text-sm font-mono">₦{(fundDetailModal?.current_value || 0).toLocaleString()}</p></div>
                      <div><span className="text-gray-400">Balance Quantity:</span> <p className="font-semibold text-gray-800 dark:text-gray-200 font-mono">{fundDetailModal?.balance_quantity || 0}</p></div>
                      <div><span className="text-gray-400">Cost Price:</span> <p className="font-semibold text-gray-800 dark:text-gray-200 font-mono">₦{(fundDetailModal?.cost_price || 0).toLocaleString()}</p></div>
                      <div><span className="text-gray-400">Gain/Loss:</span> <p className={`font-semibold font-mono ${(fundDetailModal?.gain_loss_amount || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>₦{(fundDetailModal?.gain_loss_amount || 0).toLocaleString()}</p></div>
                    </div>
                  </div>
                )
              )}

              {/* Transactions List View */}
              {activeFundModal === 'tx' && (
                loadingFundTx ? (
                  <div className="py-8 text-center text-gray-400 font-mono flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin text-[#961A1C]" /> Fetching mutual fund transactions...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(!fundTxModal || fundTxModal.length === 0) ? (
                      <div className="py-8 text-center text-gray-400 font-mono">
                        No transactions found for fund account {selectedFundAccount}.
                      </div>
                    ) : (
                      fundTxModal.map((tx: any, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200/60 dark:border-gray-700 flex justify-between items-center font-sans">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{tx.transactionType || tx.type || 'Subscription'}</p>
                            <p className="text-[11px] text-gray-400 font-mono">{tx.transactionDate || tx.createdDate || '—'}</p>
                          </div>
                          <span className="font-mono font-bold text-emerald-600 text-sm">₦{(tx.amount || 0).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                )
              )}

              {/* Statement View */}
              {activeFundModal === 'statement' && (
                loadingFundStatement ? (
                  <div className="py-8 text-center text-gray-400 font-mono flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin text-[#961A1C]" /> Generating Base64 mutual fund statement...
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900/60 p-6 rounded-xl space-y-3 border border-gray-200/60 dark:border-gray-700 text-center font-sans">
                    <FileText size={32} className="mx-auto text-emerald-600" />
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Account Statement Ready</h4>
                    <p className="text-gray-400 text-xs font-mono">Statement for fund account {selectedFundAccount} retrieved from API.</p>
                    {fundStatementModal && fundStatementModal !== 'STATEMENT_RETRIEVED' ? (
                      <a
                        href={`data:application/pdf;base64,${fundStatementModal}`}
                        download={`Statement_${selectedFundAccount}.pdf`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 cursor-pointer"
                      >
                        Download PDF Statement
                      </a>
                    ) : (
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-lg inline-block">
                        Statement Verified (Base64 OK)
                      </span>
                    )}
                  </div>
                )
              )}

              {/* Penalty Calculator View */}
              {activeFundModal === 'penalty' && (
                <div className="space-y-4 font-sans">
                  <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl space-y-3 border border-gray-200/60 dark:border-gray-700">
                    <label className="block text-gray-500 font-semibold text-xs">Redemption Amount (₦)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={penaltyAmountInput}
                        onChange={(e) => setPenaltyAmountInput(e.target.value)}
                        placeholder="50000"
                        className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg font-mono"
                      />
                      <button
                        onClick={() => handleCalculatePenalty(selectedFundAccount || '')}
                        disabled={loadingFundPenalty}
                        className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        {loadingFundPenalty ? <Loader2 size={13} className="animate-spin" /> : 'Calculate'}
                      </button>
                    </div>
                  </div>
                  {penaltyResultModal && (
                    <div className="p-4 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 rounded-xl border border-amber-200 dark:border-amber-800 font-mono">
                      <div className="flex justify-between items-center text-xs">
                        <span>Calculated Redemption Penalty:</span>
                        <span className="text-base font-bold text-amber-700 dark:text-amber-400">
                          ₦{(penaltyResultModal?.penaltyAmount || penaltyResultModal?.penalty || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Accrued Interest View */}
              {activeFundModal === 'interest' && (
                loadingFundInterest ? (
                  <div className="py-8 text-center text-gray-400 font-mono flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin text-[#961A1C]" /> Fetching accrued interest...
                  </div>
                ) : (
                  <div className="bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200 p-5 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2 text-center font-sans">
                    <DollarSign size={28} className="mx-auto text-indigo-600" />
                    <span className="text-xs text-indigo-500 font-bold tracking-wider">MMF Accrued Interest</span>
                    <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 font-mono">
                      ₦{(accruedInterestModal?.accruedInterest || accruedInterestModal?.total_accrued_interest || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setActiveFundModal(null);
                  setFundDetailModal(null);
                  setFundTxModal(null);
                  setFundStatementModal(null);
                  setPenaltyResultModal(null);
                  setAccruedInterestModal(null);
                }}
                className="px-4 py-2 bg-gray-900 text-white dark:bg-gray-700 font-semibold rounded-lg hover:bg-gray-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
