'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Wallet,
  CreditCard,
  PieChart,
  History,
  Smartphone,
  ShieldAlert,
  Edit,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  Building,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Lock,
} from 'lucide-react';
import {
  useGetRetailUserFullQuery,
  useGetRetailUserKycQuery,
  useGetNextOfKinQuery,
  useGetKycDocumentsQuery,
  useGetWalletQuery,
  useGetCashAccountsQuery,
  useGetVirtualAccountQuery,
  useGetMutualFundHoldingsQuery,
  useGetLedgerTransactionsQuery,
  useGetSymplusNetworthQuery,
  useGetSymplusPositionQuery,
  useGetDevicesQuery,
  useGetLoginLogsQuery,
  useGetSecurityQuestionsQuery,
  useRevokeDeviceMutation,
  useUpdateSymplusCustomerMutation,
  useDisableBiometricsMutation,
  useResetSecurityQuestionsMutation,
  RetailUser,
  KycProfile,
  Wallet as WalletModel,
  VirtualAccount,
  SymplusNetworth,
} from '@/auth/services/retailApi';

type TabType =
  | 'overview'
  | 'kyc'
  | 'accounts'
  | 'mutual-funds'
  | 'transactions'
  | 'symplus'
  | 'security';

export default function RetailUserDetailPage() {
  const params = useParams();
  const userId = params?.id as string;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // RTK Queries
  const { data: fullUserData, isLoading: loadingFull } = useGetRetailUserFullQuery(userId, { skip: !userId });
  const { data: kycData } = useGetRetailUserKycQuery(userId, { skip: !userId });
  const { data: nokData } = useGetNextOfKinQuery(userId, { skip: !userId });
  const { data: docsData } = useGetKycDocumentsQuery(userId, { skip: !userId });
  const { data: walletData } = useGetWalletQuery(userId, { skip: !userId });
  const { data: cashAccountsData } = useGetCashAccountsQuery(userId, { skip: !userId });
  const { data: vaData } = useGetVirtualAccountQuery(userId, { skip: !userId });
  const { data: fundsData } = useGetMutualFundHoldingsQuery(userId, { skip: !userId });
  const { data: transactionsData } = useGetLedgerTransactionsQuery({ id: userId, page: 1, pageSize: 20 }, { skip: !userId });
  const { data: networthData } = useGetSymplusNetworthQuery(userId, { skip: !userId });
  const { data: positionData } = useGetSymplusPositionQuery(userId, { skip: !userId });
  const { data: devicesData } = useGetDevicesQuery(userId, { skip: !userId });
  const { data: logsData } = useGetLoginLogsQuery(userId, { skip: !userId });
  const { data: securityQuestionsData } = useGetSecurityQuestionsQuery(userId, { skip: !userId });

  // Mutations
  const [revokeDevice] = useRevokeDeviceMutation();
  const [disableBiometrics] = useDisableBiometricsMutation();
  const [resetSecurityQuestions] = useResetSecurityQuestionsMutation();
  const [updateSymplusCustomer, { isLoading: updatingSymplus }] = useUpdateSymplusCustomerMutation();

  // Local Symplus update modal state
  const [showSymplusModal, setShowSymplusModal] = useState(false);
  const [symplusForm, setSymplusForm] = useState({
    employerName: '',
    jobTitle: '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const user: RetailUser = (fullUserData?.data?.profile || fullUserData?.data || {}) as RetailUser;
  const kyc: KycProfile = kycData?.data || fullUserData?.data?.kyc || {};
  const wallet: WalletModel = walletData?.data || fullUserData?.data?.wallet || {};
  const cashAccounts = cashAccountsData?.data || [];
  const virtualAccount: VirtualAccount = vaData?.data || fullUserData?.data?.virtualAccount || {};
  const holdings = fundsData?.data || [];
  const transactions = transactionsData?.data?.items || transactionsData?.data?.data || [];
  const networth: SymplusNetworth = networthData?.data || {};
  const devices = devicesData?.data || [];
  const logs = logsData?.data || [];
  const securityQuestions = securityQuestionsData?.data || [];

  const handleRevokeDevice = async (deviceId: string) => {
    try {
      await revokeDevice({ id: userId, deviceId }).unwrap();
      showToast('Device access revoked successfully.');
    } catch {
      showToast('Failed to revoke device.');
    }
  };

  const handleDisableBiometrics = async () => {
    try {
      await disableBiometrics(userId).unwrap();
      showToast('Biometrics disabled for customer.');
    } catch {
      showToast('Failed to disable biometrics.');
    }
  };

  const handleResetSecurityQuestions = async () => {
    try {
      await resetSecurityQuestions(userId).unwrap();
      showToast('Security questions cleared. Customer must reset them.');
    } catch {
      showToast('Failed to reset security questions.');
    }
  };

  const handleUpdateSymplus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSymplusCustomer({ id: userId, body: symplusForm }).unwrap();
      showToast('Symplus customer details updated successfully.');
      setShowSymplusModal(false);
    } catch {
      showToast('Failed to update Symplus details.');
    }
  };

  if (loadingFull) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
        <Loader2 className="animate-spin text-[#961A1C]" size={36} />
        <p className="text-gray-500 text-sm mt-3">Loading retail customer details...</p>
      </div>
    );
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Retail Customer';

  return (
    <div className="flex flex-col gap-6 pb-12 w-full animate-in fade-in duration-500 relative">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700">
          <CheckCircle className="text-green-400" size={18} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header & Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/retail/users')}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
          <p className="text-xs text-gray-500">ID: {userId} | Customer ID: {user.customerId || 'N/A'}</p>
        </div>
      </div>

      {/* Profile Overview Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#961A1C] to-[#4d0000] flex items-center justify-center text-white text-2xl font-bold">
            {fullName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{fullName}</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                {user.status || 'Active'}
              </span>
            </div>
            <p className="text-sm text-gray-500">{user.email || 'No email registered'}</p>
            <p className="text-xs text-gray-400 mt-1">
              Phone: {user.phoneNumber || '—'} | BVN: {user.bvn || '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
          <div>
            <span className="text-xs text-gray-400 font-medium">Wallet Balance</span>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ₦{wallet.balance ? wallet.balance.toLocaleString() : '0.00'}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Symplus Net Worth</span>
            <p className="text-lg font-bold text-[#961A1C]">
              ₦{networth.totalNetworth ? networth.totalNetworth.toLocaleString() : '0.00'}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">KYC Status</span>
            <div className="mt-1">
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                {user.kycStatus || 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto gap-2 text-sm font-medium">
        {[
          { id: 'overview', label: 'Overview', icon: <User size={15} /> },
          { id: 'kyc', label: 'KYC & Verification', icon: <ShieldCheck size={15} /> },
          { id: 'accounts', label: 'Cash & Wallets', icon: <Wallet size={15} /> },
          { id: 'mutual-funds', label: 'Mutual Funds', icon: <PieChart size={15} /> },
          { id: 'transactions', label: 'Transactions', icon: <History size={15} /> },
          { id: 'symplus', label: 'Symplus Core', icon: <Building size={15} /> },
          { id: 'security', label: 'Security & Devices', icon: <ShieldAlert size={15} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'border-[#961A1C] text-[#961A1C] font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Profile Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400">First Name</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{user.firstName || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">Last Name</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{user.lastName || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">Gender</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{user.gender || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">Date of Birth</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{user.dateOfBirth || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">Username</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{user.username || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">Referral Code</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{user.referralCode || '—'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Contact & Address
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400">Street</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{user.addressStreet || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">City</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{user.addressCity || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">State</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{user.addressState || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">Country</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{user.addressCountry || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'kyc' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              KYC Profile Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-400">Marital Status</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{kyc.maritalStatus || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">Nationality</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{kyc.nationality || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">Occupation</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{kyc.occupation || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">Employer Name</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{kyc.employerName || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">Bank Account</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{kyc.bankAccountNumber || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">Bank Name</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{kyc.bankName || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">ID Document Type</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{kyc.identityDocType || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">ID Document Number</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{kyc.identityDocNumber || '—'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              KYC Documents ({docsData?.data?.length || 0})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(docsData?.data || []).map((doc) => (
                <div key={doc.id || doc.documentId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <FileText size={16} className="text-[#961A1C]" />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-50 text-yellow-600">
                        {doc.status || 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white mt-2">{doc.documentName || doc.documentType}</p>
                    <p className="text-[11px] text-gray-400">{doc.documentNumber || 'No Doc #'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase">In-App Wallet</span>
              <Wallet size={18} className="text-[#961A1C]" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ₦{wallet.balance ? wallet.balance.toLocaleString() : '0.00'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Wallet No: {wallet.walletNumber || '—'}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase">Virtual Account</span>
              <CreditCard size={18} className="text-blue-600" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {virtualAccount.accountNumber || 'N/A'}
            </p>
            <p className="text-xs text-gray-400 mt-1">{virtualAccount.bankName || 'Virtual NUBAN'}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase">Symplus Accounts</span>
              <Building size={18} className="text-green-600" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {cashAccounts.length} Cash Account(s)
            </p>
          </div>
        </div>
      )}

      {activeTab === 'mutual-funds' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
            Mutual Fund Holdings ({holdings.length})
          </h3>
          {holdings.length === 0 ? (
            <p className="text-xs text-gray-400 py-4">No active mutual fund holdings for this customer.</p>
          ) : (
            <div className="space-y-3">
              {holdings.map((h, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 rounded-lg text-xs">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{h.fundName || 'Mutual Fund'}</p>
                    <p className="text-gray-400">Units: {h.units || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">₦{h.currentValue?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
            Ledger Transactions ({transactions.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
                <tr>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Category</th>
                  <th className="p-3 font-medium">Amount</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {transactions.map((tx, i) => (
                  <tr key={i}>
                    <td className="p-3 font-medium text-gray-900 dark:text-white">{tx.type || 'Transaction'}</td>
                    <td className="p-3 text-gray-500">{tx.category || 'General'}</td>
                    <td className="p-3 font-bold">₦{tx.amount?.toLocaleString() || 0}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600">
                        {tx.status || 'Successful'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400">{tx.createdDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'symplus' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Symplus Core Integration</h3>
              <p className="text-xs text-gray-400">Push changes directly to Symplus Core Banking</p>
            </div>
            <button
              onClick={() => setShowSymplusModal(true)}
              className="px-3 py-1.5 bg-[#961A1C] hover:bg-[#7a1517] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Edit size={14} /> Update Symplus Details
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="text-xs font-bold text-gray-400">Net Worth Breakdown</span>
              <p className="text-2xl font-bold text-[#961A1C] mt-2">
                ₦{networth.totalNetworth?.toLocaleString() || '0.00'}
              </p>
              <div className="mt-4 text-xs space-y-2 text-gray-500">
                <div className="flex justify-between">
                  <span>Cash Balance</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">₦{networth.cashBalance?.toLocaleString() || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Investments Balance</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">₦{networth.investmentsBalance?.toLocaleString() || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Security Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDisableBiometrics}
                className="px-3 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold rounded-lg flex items-center gap-2"
              >
                <Lock size={14} /> Disable Biometrics
              </button>
              <button
                onClick={handleResetSecurityQuestions}
                className="px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold rounded-lg flex items-center gap-2"
              >
                <ShieldAlert size={14} /> Clear Security Questions
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Registered Devices ({devices.length})
            </h3>
            <div className="space-y-3">
              {devices.map((d) => (
                <div key={d.id} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 rounded-lg text-xs">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{d.deviceName || d.deviceModel || 'Mobile Device'}</p>
                    <p className="text-gray-400">IP: {d.ipAddress || '—'}</p>
                  </div>
                  <button
                    onClick={() => handleRevokeDevice(d.id)}
                    className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 text-[11px] font-bold rounded"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Symplus Update Modal */}
      {showSymplusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Update Symplus Customer</h3>
            <form onSubmit={handleUpdateSymplus} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-500 font-medium">Employer Name</label>
                <input
                  type="text"
                  value={symplusForm.employerName}
                  onChange={(e) => setSymplusForm({ ...symplusForm, employerName: e.target.value })}
                  className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-gray-500 font-medium">Job Title</label>
                <input
                  type="text"
                  value={symplusForm.jobTitle}
                  onChange={(e) => setSymplusForm({ ...symplusForm, jobTitle: e.target.value })}
                  className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-gray-500 font-medium">Street Address</label>
                <input
                  type="text"
                  value={symplusForm.addressStreet}
                  onChange={(e) => setSymplusForm({ ...symplusForm, addressStreet: e.target.value })}
                  className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSymplusModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingSymplus}
                  className="px-4 py-2 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-lg flex items-center gap-2"
                >
                  {updatingSymplus ? <Loader2 className="animate-spin" size={14} /> : 'Save & Sync'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
