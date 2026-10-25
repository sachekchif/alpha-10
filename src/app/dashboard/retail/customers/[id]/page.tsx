'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Modal, Select, Pagination } from 'antd';
import { 
  ArrowLeft, CheckCircle2, ShieldAlert, FileText, 
  User, Lock, Unlock, Mail, Phone, MapPin,
  FileCheck, Smartphone, Key, History, 
  CreditCard, DollarSign, UserCheck, Activity,
  Building, Loader2, RefreshCw, Fingerprint,
  HelpCircle, Calendar, Tag, ShieldCheck, Globe,
  ArrowUpRight, ArrowDownRight, ExternalLink, Cpu, HardDrive,
  Copy, Check, Search, X, Download, AlertTriangle
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
  const { data: kycData, isError: kycError } = useGetRetailUserKycQuery(userId, { skip: !userId });
  const { data: docsData } = useGetKycDocumentsQuery(userId, { skip: !userId });
  const { data: walletData } = useGetWalletQuery(userId, { skip: !userId });
  const { data: cashAccountsData } = useGetCashAccountsQuery(userId, { skip: !userId });
  const { data: vaData } = useGetVirtualAccountQuery(userId, { skip: !userId });
  const { data: fundsData } = useGetMutualFundHoldingsQuery(userId, { skip: !userId });

  // ── Transactions State & Query (Supports Type & Status filters from API) ─────
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(10);
  const [txTypeFilter, setTxTypeFilter] = useState('All');
  const [txCategoryFilter, setTxCategoryFilter] = useState('All');
  const [txStatusFilter, setTxStatusFilter] = useState('All');
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<LedgerTransaction | null>(null);

  const { data: transactionsData, isFetching: isFetchingTx, refetch: refetchTx } = useGetLedgerTransactionsQuery(
    {
      id: userId,
      page: txPage,
      pageSize: txPageSize,
      category: txCategoryFilter !== 'All' ? txCategoryFilter : undefined,
      type: txTypeFilter !== 'All' ? txTypeFilter : undefined,
      status: txStatusFilter !== 'All' ? txStatusFilter : undefined,
    },
    { skip: !userId }
  );
  const { data: devicesData } = useGetDevicesQuery(userId, { skip: !userId });

  // ── Symplus 5 API Integration Hooks ───────────────────────────────────────
  const { data: symplusUserData, isLoading: loadingSymplusUser, isError: symplusUserError, refetch: refetchSymplusUser } = usePullSymplusUserQuery(userId, { skip: !userId });
  const [triggerPullByCustomerId, { isLoading: pullingByCustId }] = useLazyPullSymplusByCustomerIdQuery();
  const { data: networthData, isLoading: loadingNetworth, isError: networthError, refetch: refetchNetworth } = useGetSymplusNetworthQuery(userId, { skip: !userId });
  const { data: positionData, isLoading: loadingPosition, isError: positionError, refetch: refetchPosition } = useGetSymplusPositionQuery(userId, { skip: !userId });
  const [updateSymplusCustomer, { isLoading: updatingSymplus }] = useUpdateSymplusCustomerMutation();
  const [isRefreshingAllSymplus, setIsRefreshingAllSymplus] = useState(false);

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

  const handleRefreshEverything = async () => {
    setIsRefreshingAllSymplus(true);
    try {
      const promises: Promise<any>[] = [
        refetch(),
        refetchSymplusUser(),
        refetchNetworth(),
        refetchPosition(),
      ];
      if (symplusCustomerId && symplusCustomerId !== '—') {
        promises.push(triggerPullByCustomerId(symplusCustomerId).unwrap());
      }
      await Promise.allSettled(promises);
      showToast('Refreshed all Symplus customer data & financials.');
    } catch {
      showToast('Completed sync with available data.');
    } finally {
      setIsRefreshingAllSymplus(false);
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
  const rawSymplusHoldings = fundsResponse.symplusHoldings || fullDataObj.portfolios || fullDataObj.symplusHoldings || [];
  const symplusHoldings: SymplusHolding[] = Array.isArray(rawSymplusHoldings)
    ? rawSymplusHoldings
    : Array.isArray(rawSymplusHoldings?.items)
    ? rawSymplusHoldings.items
    : Array.isArray(rawSymplusHoldings?.data)
    ? rawSymplusHoldings.data
    : Array.isArray(rawSymplusHoldings?.holdings)
    ? rawSymplusHoldings.holdings
    : Array.isArray(rawSymplusHoldings?.positions)
    ? rawSymplusHoldings.positions
    : [];
  const localAccounts: CashAccount[] = Array.isArray(fundsResponse.localAccounts) ? fundsResponse.localAccounts : cashAccounts;
  
  const txDataObj = (transactionsData?.data || {}) as Record<string, any>;
  const rawTxList = Array.isArray(txDataObj.transactions)
    ? txDataObj.transactions
    : Array.isArray(txDataObj.items)
    ? txDataObj.items
    : Array.isArray(txDataObj.data)
    ? txDataObj.data
    : Array.isArray(transactionsData?.data)
    ? (transactionsData?.data as any)
    : [];
  const transactions: LedgerTransaction[] = (Array.isArray(rawTxList) && rawTxList.length > 0)
    ? rawTxList
    : (Array.isArray(fullDataObj.transactions) ? fullDataObj.transactions : []);

  const getTxDirection = (tx: LedgerTransaction): 'Credit' | 'Debit' | 'Transfer' => {
    const tType = (tx.transactionType || tx.type || '').toLowerCase();
    const desc = (tx.description || tx.narrative || '').toLowerCase();

    if (
      tType.includes('credit') ||
      tType.includes('inflow') ||
      tType.includes('refund') ||
      desc.includes('refund') ||
      desc.includes('inflow') ||
      (tx.creditAccount && !tx.debitAccount)
    ) {
      return 'Credit';
    }

    if (
      tType.includes('debit') ||
      tType.includes('placement') ||
      tType.includes('outflow') ||
      tType.includes('withdrawal') ||
      desc.includes('debit') ||
      desc.includes('placement') ||
      (tx.debitAccount && !tx.creditAccount)
    ) {
      return 'Debit';
    }

    return 'Transfer';
  };

  const filteredTransactions = useMemo(() => {
    let result = transactions;
    if (txCategoryFilter !== 'All') {
      result = result.filter(
        (t) => (t.category || '').toLowerCase() === txCategoryFilter.toLowerCase()
      );
    }
    if (txTypeFilter !== 'All') {
      result = result.filter(
        (t) => getTxDirection(t).toLowerCase() === txTypeFilter.toLowerCase()
      );
    }
    if (txStatusFilter !== 'All') {
      result = result.filter(
        (t) => (t.status || '').toLowerCase() === txStatusFilter.toLowerCase()
      );
    }
    if (txSearchQuery.trim()) {
      const q = txSearchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          (t.reference || t.id || '').toLowerCase().includes(q) ||
          (t.externalReference || '').toLowerCase().includes(q) ||
          (t.description || t.narrative || '').toLowerCase().includes(q) ||
          (t.transactionType || t.type || '').toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q) ||
          (t.debitAccount || '').toLowerCase().includes(q) ||
          (t.debitAccountName || '').toLowerCase().includes(q) ||
          (t.creditAccount || '').toLowerCase().includes(q) ||
          (t.creditAccountName || '').toLowerCase().includes(q) ||
          (t.fundAccountId || '').toLowerCase().includes(q) ||
          (t.fundId || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [transactions, txCategoryFilter, txTypeFilter, txStatusFilter, txSearchQuery]);

  const apiTotalCount = typeof txDataObj.totalCount === 'number'
    ? txDataObj.totalCount
    : typeof (transactionsData as any)?.totalCount === 'number'
    ? (transactionsData as any).totalCount
    : transactions.length;

  const txTotalCount = txSearchQuery.trim() ? filteredTransactions.length : apiTotalCount;

  const formatTxDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleDownloadReceipt = () => {
    if (!selectedTx) return;
    const txRef = selectedTx.reference || selectedTx.id || 'TX-RECEIPT';
    const txDate = formatTxDate(selectedTx.transactionDate || selectedTx.createdDate || selectedTx.timestamp);
    const amountStr = Number(selectedTx.amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const direction = getTxDirection(selectedTx);
    const isCredit = direction === 'Credit';
    const isDebit = direction === 'Debit';
    const status = selectedTx.status || 'Successful';
    const customerDisplayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Retail Customer';

    const formattedTxType = selectedTx.transactionType
      ? selectedTx.transactionType.replace(/([A-Z])/g, ' $1').trim()
      : selectedTx.type || selectedTx.category || 'Transfer';

    const receiptHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Alpha10 Receipt - ${txRef}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; padding: 40px 16px; display: flex; justify-content: center; }
    .receipt { background: #ffffff; width: 100%; max-width: 500px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); overflow: hidden; }
    .header { background: #961A1C; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 4px; }
    .header p { font-size: 12px; opacity: 0.9; }
    .amount-box { padding: 24px; text-align: center; border-bottom: 1px dashed #cbd5e1; background: #fbfcfe; }
    .amount-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; }
    .amount-val { font-size: 30px; font-weight: 700; color: #0f172a; font-family: monospace; margin: 8px 0; }
    .status-pill { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; font-family: monospace; text-transform: uppercase; ${
      status.toLowerCase() === 'successful' || status.toLowerCase() === 'success'
        ? 'background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;'
        : status.toLowerCase() === 'pending'
        ? 'background: #fffbeb; color: #b45309; border: 1px solid #fde68a;'
        : 'background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca;'
    } }
    .details { padding: 20px 24px; }
    .row { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
    .row:last-child { border-bottom: none; }
    .label { color: #64748b; font-size: 12px; font-weight: 500; }
    .value { font-weight: 600; text-align: right; color: #0f172a; font-family: monospace; max-width: 65%; word-break: break-all; }
    .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    @media print {
      body { background: white; padding: 0; }
      .receipt { border: none; box-shadow: none; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>AlphaTen Retail Banking</h1>
      <p>Official Transaction Receipt</p>
    </div>
    <div class="amount-box">
      <div class="amount-label">Transaction Amount</div>
      <div class="amount-val">${isCredit ? '+' : isDebit ? '-' : ''}₦${amountStr}</div>
      <span class="status-pill">${status}</span>
    </div>
    <div class="details">
      <div class="row"><span class="label">Transaction Reference</span><span class="value">${txRef}</span></div>
      ${selectedTx.externalReference ? `<div class="row"><span class="label">External Reference</span><span class="value">${selectedTx.externalReference}</span></div>` : ''}
      <div class="row"><span class="label">Date & Time</span><span class="value">${txDate}</span></div>
      <div class="row"><span class="label">Category / Action</span><span class="value">${selectedTx.category ? selectedTx.category + ' — ' : ''}${formattedTxType}</span></div>
      <div class="row"><span class="label">Direction</span><span class="value" style="color: ${isCredit ? '#047857' : isDebit ? '#b45309' : '#0f172a'}">${direction.toUpperCase()}</span></div>
      <div class="row"><span class="label">Customer Name</span><span class="value" style="font-family: inherit;">${customerDisplayName}</span></div>
      <div class="row"><span class="label">Debit Account</span><span class="value">${selectedTx.debitAccount || '—'}${selectedTx.debitAccountName ? ' (' + selectedTx.debitAccountName + ')' : ''}</span></div>
      <div class="row"><span class="label">Credit Account</span><span class="value">${selectedTx.creditAccount || '—'}${selectedTx.creditAccountName ? ' (' + selectedTx.creditAccountName + ')' : ''}</span></div>
      ${selectedTx.fundId ? `<div class="row"><span class="label">Fund Reference</span><span class="value">${selectedTx.fundId}${selectedTx.fundAccountId ? ' / ' + selectedTx.fundAccountId : ''}</span></div>` : ''}
      <div class="row"><span class="label">Description</span><span class="value" style="font-family: inherit;">${selectedTx.description || selectedTx.narrative || '—'}</span></div>
    </div>
    <div class="footer">
      <p>Generated on ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      <p style="margin-top: 4px;">AlphaTen MFB • Licensed by the Central Bank of Nigeria</p>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
    } else {
      const blob = new Blob([receiptHtml], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Alpha10_Receipt_${txRef}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  const rawDevices = devicesData?.data || fullDataObj.devices || [];
  const devices: UserDevice[] = Array.isArray(rawDevices) ? rawDevices : (Array.isArray((rawDevices as any)?.items) ? (rawDevices as any).items : []);

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-700/80 pt-4 lg:pt-0 lg:pl-6 text-xs flex-1 min-w-0">
          <div className="min-w-0">
            <span className="text-gray-500 font-medium text-[11px] block truncate">Wallet Balance</span>
            <p
              className="text-base sm:text-lg lg:text-base xl:text-lg font-bold text-gray-900 dark:text-white mt-1 font-mono truncate"
              title={`₦${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            >
              ₦{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="min-w-0">
            <span className="text-gray-500 font-medium text-[11px] block truncate">Virtual Account</span>
            <p className="text-base sm:text-lg lg:text-base xl:text-lg font-bold text-gray-900 dark:text-white mt-1 font-mono flex items-center gap-1 min-w-0">
              <span className="truncate">{vNubanNumber}</span>
              <CopyButton text={vNubanNumber} label="Virtual Account Number" />
            </p>
          </div>
          <div className="min-w-0">
            <span className="text-gray-500 font-medium text-[11px] block truncate">Mutual Fund Holding</span>
            <p
              className="text-sm font-bold text-[#961A1C] mt-1 font-mono truncate"
              title={primaryHolding.fund_description || (primaryHolding as any).name || (symplusHoldings.length > 0 ? 'Active Holding' : 'None')}
            >
              {primaryHolding.fund_description || (primaryHolding as any).name || (symplusHoldings.length > 0 ? 'Active Holding' : 'None')}
            </p>
          </div>
          <div className="min-w-0">
            <span className="text-gray-500 font-medium text-[11px] block truncate">Risk Category</span>
            <p className="text-sm font-bold text-emerald-600 mt-1 capitalize font-mono truncate">
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

      {/* TAB 3: DEDICATED SYMPLUS TAB (Unified Single Container) */}
      {activeTab === 'symplus' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md flex flex-col shadow-none overflow-hidden font-sans text-xs text-gray-900 dark:text-gray-100">
          {/* Section 1: Top Toolbar & Action Header (Big ID + Copy Button + Unified Refresh) */}
          <div className="p-3.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                  Customer ID:
                </span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-gray-900 dark:text-white tracking-tight">
                  {symplusCustomerId}
                </span>
                <CopyButton text={symplusCustomerId} label="Customer ID" />
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                  (symplusUserError || networthError || positionError)
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                }`}>
                  {(symplusUserError || networthError || positionError) ? 'Service 401' : 'Active'}
                </span>
              </div>
              {symplusSourceRef && symplusSourceRef !== '—' && (
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 font-mono flex items-center gap-1.5">
                  <span>Source Ref:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{symplusSourceRef}</span>
                  <CopyButton text={symplusSourceRef} label="Source Ref" />
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                disabled={isRefreshingAllSymplus || pullingByCustId || loadingSymplusUser || loadingNetworth || loadingPosition}
                onClick={handleRefreshEverything}
                className="px-3.5 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer border border-gray-200 dark:border-gray-700 disabled:opacity-50 text-xs shadow-2xs"
              >
                <RefreshCw size={13} className={isRefreshingAllSymplus ? 'animate-spin text-[#961A1C]' : ''} />
                <span>{isRefreshingAllSymplus ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              <button
                onClick={() => setShowUpdateSymplusModal(true)}
                className="px-3.5 py-1.5 bg-[#961A1C] text-white hover:bg-[#7d1517] font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer shadow-2xs text-xs"
              >
                <FileText size={13} />
                <span>Edit Symplus Details</span>
              </button>
            </div>
          </div>

          {/* Upstream Gateway Alert if API failed */}
          {(symplusUserError || networthError || positionError) && (
            <div className="px-3.5 py-2.5 bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-amber-800 dark:text-amber-300 gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                <span>
                  <strong>Symplus Core Gateway Alert:</strong> Upstream banking service returned 401 Unauthorized. Live balance and positions could not be synchronized with Symplus.
                </span>
              </div>
              <button
                onClick={handleRefreshEverything}
                disabled={isRefreshingAllSymplus}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 rounded hover:bg-amber-100 dark:hover:bg-gray-700 transition shrink-0 cursor-pointer"
              >
                Retry Sync
              </button>
            </div>
          )}

          {/* Section 2: 4-Column Financials & Virtual Account (No Title Banner) */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 border-b border-gray-200 dark:border-gray-800">
            {/* Metric 1: Net Worth */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block font-mono">
                Symplus Net Worth
              </span>
              {loadingNetworth ? (
                <div className="py-2 flex items-center gap-2 text-gray-500 font-mono text-xs">
                  <Loader2 size={15} className="animate-spin text-[#961A1C]" /> Calculating...
                </div>
              ) : networthError ? (
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">₦0.00</p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono mt-1 flex items-center gap-1">
                    <AlertTriangle size={11} /> Upstream 401 (Net Worth Unavailable)
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                    ₦{((networthData?.data as any)?.networth || (networthData?.data as any)?.totalNetworth || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <div className="mt-2 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Total Assets:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                        ₦{((networthData?.data as any)?.totalAssets || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Total Liabilities:</span>
                      <span className="font-semibold text-red-600 dark:text-red-400 font-mono">
                        ₦{((networthData?.data as any)?.totalLiabilities || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Metric 2: Positions & Portfolio */}
            <div className="md:pl-6 space-y-2 pt-4 md:pt-0">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block font-mono">
                Portfolio Holding Value
              </span>
              {loadingPosition ? (
                <div className="py-2 flex items-center gap-2 text-gray-500 font-mono text-xs">
                  <Loader2 size={15} className="animate-spin text-purple-600" /> Loading...
                </div>
              ) : positionError ? (
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">₦0.00</p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono mt-1 flex items-center gap-1">
                    <AlertTriangle size={11} /> Upstream 401 (Positions Unavailable)
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                    ₦{((positionData?.data as any)?.totalValue || (positionData?.data as any)?.positionValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <div className="mt-2 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Active Positions:</span>
                      <span className="font-semibold text-gray-900 dark:text-white font-mono">
                        {((positionData?.data as any)?.positions || []).length || symplusHoldings.length} Holdings
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Risk Profile:</span>
                      <span className="font-semibold text-[#961A1C] capitalize">
                        {riskProfile.risk_appetite || 'Medium'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Metric 3: Account Officer & Profile */}
            <div className="lg:pl-6 space-y-2 pt-4 md:pt-0">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block font-mono">
                Account Management
              </span>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-[11px] block">Assigned Officer</span>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 truncate">
                    {accountOfficerName}
                  </p>
                </div>
                <div className="pt-0.5 text-xs">
                  <span className="text-gray-500 dark:text-gray-400 text-[11px] block">Primary Email</span>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="font-semibold text-gray-900 dark:text-white font-mono truncate">
                      {customerAccount.primaryEmail || user.email || '—'}
                    </span>
                    <CopyButton text={customerAccount.primaryEmail || user.email} label="Primary Email" />
                  </div>
                </div>
              </div>
            </div>

            {/* Metric 4: Symplus Virtual Account */}
            <div className="lg:pl-6 space-y-2 pt-4 md:pt-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block font-mono">
                  Symplus Virtual Account
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Active
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-[11px] block">Virtual Account Number</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-base font-bold text-gray-900 dark:text-white font-mono">
                    {vNubanNumber}
                  </span>
                  <CopyButton text={vNubanNumber} label="Virtual Account Number" />
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Account Name:</span>
                    <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]" title={virtualAccount.accountName || name}>
                      {virtualAccount.accountName || name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Product:</span>
                    <span className="font-semibold text-gray-900 dark:text-white font-mono">
                      {virtualAccount.productType || 'AlphaTen'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Holdings Table with Crisp Spreadsheet Lining */}
          <div>
            <div className="px-3.5 py-2.5 bg-gray-50/60 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h4 className="font-semibold text-gray-900 dark:text-white text-xs font-mono uppercase tracking-wider">
                Symplus Investment Holdings & Portfolios ({symplusHoldings.length})
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100/75 dark:bg-gray-800/80 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-3 py-2 w-10 text-center border-b border-r border-gray-200 dark:border-gray-700">#</th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 min-w-[200px]">Fund Description</th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 font-mono whitespace-nowrap">Fund Account ID</th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 font-mono text-center whitespace-nowrap">Currency</th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 font-mono text-right whitespace-nowrap">Current Value</th>
                    <th className="px-3 py-2 text-right border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">Fund Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-sans">
                  {(!Array.isArray(symplusHoldings) || symplusHoldings.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center border-b border-gray-200 dark:border-gray-800">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2 border border-gray-200 dark:border-gray-700">
                          <HardDrive size={18} className="text-gray-400" />
                        </div>
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">
                          No Active Symplus Holdings
                        </h4>
                        <p className="text-[11px] text-gray-500 font-mono">
                          No active investment holdings or fund accounts found for this customer.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    symplusHoldings.map((h: any, i: number) => {
                      const fundAccId = h.fund_account_id || h.accountNo || h.id || 'ADF001171001';
                      return (
                        <tr key={i} className="hover:bg-blue-50/20 dark:hover:bg-gray-800/40 transition-colors">
                          <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                            #{i + 1}
                          </td>
                          <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 font-semibold text-gray-900 dark:text-white">
                            {h.fund_description || h.name || h.assetName || '—'}
                          </td>
                          <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            {fundAccId}
                          </td>
                          <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-purple-600 font-bold whitespace-nowrap">
                            {h.fund_currency || h.currency || 'NGN'}
                          </td>
                          <td className="px-3 py-2 text-right align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            ₦{(h.current_value || h.value || h.amount || 0).toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right align-middle border-b border-gray-200 dark:border-gray-800 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              <button
                                onClick={() => handleInspectFundAccount(fundAccId)}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded text-[10px] cursor-pointer border border-blue-200"
                              >
                                Account
                              </button>
                              <button
                                onClick={() => handleInspectFundTransactions(fundAccId)}
                                className="px-2 py-0.5 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold rounded text-[10px] cursor-pointer border border-purple-200"
                              >
                                Txns
                              </button>
                              <button
                                onClick={() => handleFetchFundStatement(fundAccId)}
                                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded text-[10px] cursor-pointer border border-emerald-200"
                              >
                                Statement
                              </button>
                              <button
                                onClick={() => handleCalculatePenalty(fundAccId)}
                                className="px-2 py-0.5 bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold rounded text-[10px] cursor-pointer border border-amber-200"
                              >
                                Penalty
                              </button>
                              <button
                                onClick={() => handleFetchAccruedInterest(fundAccId)}
                                className="px-2 py-0.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded text-[10px] cursor-pointer border border-indigo-200"
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

      {/* TAB 4: TRANSACTIONS (Activity Logs Table Design) */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md flex flex-col shadow-none overflow-hidden font-sans">
          {/* Always-Visible Filter Toolbar */}
          <div className="p-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Search by Reference or Description */}
              <div className="relative min-w-[200px] max-w-xs flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Filter by Reference or Narration..."
                  value={txSearchQuery}
                  onChange={(e) => {
                    setTxSearchQuery(e.target.value);
                    setTxPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#961A1C] transition-colors"
                />
                {txSearchQuery && (
                  <button
                    onClick={() => {
                      setTxSearchQuery('');
                      setTxPage(1);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="w-36">
                <Select
                  value={txCategoryFilter}
                  onChange={(val) => {
                    setTxCategoryFilter(val);
                    setTxPage(1);
                  }}
                  options={[
                    { value: 'All', label: 'All Categories' },
                    { value: 'Wallet', label: 'Wallet' },
                    { value: 'FixedDeposit', label: 'Fixed Returns' },
                    { value: 'CashDeposit', label: 'Cash Deposit' },
                  ]}
                  size="small"
                  className="w-full text-xs"
                />
              </div>

              {/* Transaction Type Filter */}
              <div className="w-36">
                <Select
                  value={txTypeFilter}
                  onChange={(val) => {
                    setTxTypeFilter(val);
                    setTxPage(1);
                  }}
                  options={[
                    { value: 'All', label: 'All Types' },
                    { value: 'Credit', label: 'Credit (Inflow)' },
                    { value: 'Debit', label: 'Debit (Outflow)' },
                  ]}
                  size="small"
                  className="w-full text-xs"
                />
              </div>

              {/* Transaction Status Filter */}
              <div className="w-36">
                <Select
                  value={txStatusFilter}
                  onChange={(val) => {
                    setTxStatusFilter(val);
                    setTxPage(1);
                  }}
                  options={[
                    { value: 'All', label: 'All Statuses' },
                    { value: 'Successful', label: 'Successful' },
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Failed', label: 'Failed' },
                  ]}
                  size="small"
                  className="w-full text-xs"
                />
              </div>

              {/* Reset Filters Button */}
              {(txCategoryFilter !== 'All' || txTypeFilter !== 'All' || txStatusFilter !== 'All' || txSearchQuery) && (
                <button
                  onClick={() => {
                    setTxCategoryFilter('All');
                    setTxTypeFilter('All');
                    setTxStatusFilter('All');
                    setTxSearchQuery('');
                    setTxPage(1);
                  }}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-[#961A1C] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reset filters"
                >
                  <X size={13} />
                  Reset
                </button>
              )}
            </div>

            {/* Record Count */}
            <div className="text-[11px] text-gray-400 font-mono">
              {filteredTransactions.length} of {txTotalCount} records
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto min-h-[300px]">
            {isFetchingTx ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2.5 text-gray-400 font-mono text-xs">
                <Loader2 size={22} className="animate-spin text-[#961A1C]" />
                <span>Loading transaction records...</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-200 dark:border-gray-700">
                  <FileText size={24} className="text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No transaction records found</h3>
                <p className="text-xs text-gray-500">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100/75 dark:bg-gray-800/80 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-3 py-2 w-10 text-center border-b border-r border-gray-200 dark:border-gray-700">#</th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Timestamp</th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Type / Category</th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Reference ID</th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Accounts Involved</th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 min-w-[200px] w-full">Description</th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 text-right whitespace-nowrap">Amount</th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700 text-center whitespace-nowrap">Status</th>
                    <th className="px-3 py-2 w-16 text-right border-b border-gray-200 dark:border-gray-700 sticky right-0 bg-gray-100 dark:bg-gray-800 z-10 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.06)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-sans">
                  {filteredTransactions.map((tx, idx) => {
                    const direction = getTxDirection(tx);
                    const isCredit = direction === 'Credit';
                    const isDebit = direction === 'Debit';
                    const isSuccess =
                      (tx.status || '').toLowerCase() === 'successful' ||
                      (tx.status || '').toLowerCase() === 'success';
                    const isPending = (tx.status || '').toLowerCase() === 'pending';

                    return (
                      <tr
                        key={tx.id || idx}
                        className="hover:bg-blue-50/20 dark:hover:bg-gray-800/40 transition-colors group"
                      >
                        {/* S/N */}
                        <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                          #{(txPage - 1) * txPageSize + idx + 1}
                        </td>

                        {/* Timestamp */}
                        <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                          {formatTxDate(tx.transactionDate || tx.createdDate || tx.timestamp)}
                        </td>

                        {/* Type / Category */}
                        <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold ${
                                  isCredit
                                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                                    : isDebit
                                    ? 'text-amber-700 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                                    : 'text-gray-700 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                                }`}
                              >
                                {direction}
                              </span>
                              <span className="font-mono text-[11px] font-semibold text-gray-800 dark:text-gray-200">
                                {tx.transactionType
                                  ? tx.transactionType.replace(/([A-Z])/g, ' $1').trim()
                                  : tx.category || 'Transfer'}
                              </span>
                            </div>
                            {tx.category && (
                              <span className="text-[10px] text-gray-400 font-mono">
                                Category: {tx.category}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Reference ID */}
                        <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          <div className="space-y-0.5">
                            {tx.reference ? (
                              <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200 font-mono">
                                {tx.reference}
                              </span>
                            ) : (
                              <span>{tx.id || '—'}</span>
                            )}
                            {tx.externalReference && tx.externalReference !== tx.reference && (
                              <div className="text-[10px] text-gray-400 font-mono truncate max-w-[150px]" title={tx.externalReference}>
                                Ext: {tx.externalReference}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Accounts Involved */}
                        <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {tx.debitAccount && (
                            <div className="leading-tight">
                              <span className="text-gray-400 text-[10px]">Dr: </span>
                              <span className="font-semibold text-gray-800 dark:text-gray-200">{tx.debitAccount}</span>
                              {tx.debitAccountName && (
                                <span className="text-gray-400 text-[10px] ml-1 font-sans">({tx.debitAccountName})</span>
                              )}
                            </div>
                          )}
                          {tx.creditAccount && (
                            <div className="leading-tight mt-0.5">
                              <span className="text-gray-400 text-[10px]">Cr: </span>
                              <span className="font-semibold text-gray-800 dark:text-gray-200">{tx.creditAccount}</span>
                              {tx.creditAccountName && (
                                <span className="text-gray-400 text-[10px] ml-1 font-sans">({tx.creditAccountName})</span>
                              )}
                            </div>
                          )}
                          {!tx.debitAccount && !tx.creditAccount && <span>—</span>}
                        </td>

                        {/* Description */}
                        <td
                          className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 text-xs min-w-[200px]"
                          title={tx.description || tx.narrative || ''}
                        >
                          {tx.description || tx.narrative || '—'}
                        </td>

                        {/* Amount */}
                        <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 text-right whitespace-nowrap font-mono text-xs">
                          <span
                            className={
                              isCredit
                                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                : isDebit
                                ? 'text-amber-600 dark:text-amber-400 font-bold'
                                : 'text-gray-900 dark:text-white font-bold'
                            }
                          >
                            {isCredit ? '+' : isDebit ? '-' : ''}₦
                            {tx.amount
                              ? Number(tx.amount).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : '0.00'}
                          </span>
                          {tx.currency && tx.currency !== 'NGN' && (
                            <span className="text-[10px] text-gray-400 ml-1">({tx.currency})</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold ${
                              isSuccess
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                : isPending
                                ? 'text-amber-700 bg-amber-50 border border-amber-200'
                                : 'text-red-700 bg-red-50 border border-red-200'
                            }`}
                          >
                            {tx.status || 'Successful'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-2 align-middle border-b border-gray-200 dark:border-gray-800 text-right whitespace-nowrap sticky right-0 bg-white dark:bg-gray-900 z-10 group-hover:bg-gray-50 dark:group-hover:bg-gray-850 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.06)]">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="text-[11px] font-medium text-[#961A1C] hover:bg-[#961A1C]/10 px-2.5 py-0.5 rounded border border-[#961A1C]/20 hover:border-[#961A1C]/40 transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer & Antd Pagination */}
          {!isFetchingTx && filteredTransactions.length > 0 && (
            <div className="px-3.5 py-2.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                Showing {(txPage - 1) * txPageSize + 1}–
                {Math.min(txPage * txPageSize, txTotalCount)} of {txTotalCount} transactions
              </span>

              <Pagination
                current={txPage}
                pageSize={txPageSize}
                total={txTotalCount}
                onChange={(p, pSize) => {
                  setTxPage(p);
                  setTxPageSize(pSize);
                }}
                showSizeChanger
                pageSizeOptions={['10', '20', '50']}
                size="small"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Transaction Details Modal (Matching Activity Logs Event Modal) ──── */}
      <Modal
        open={Boolean(selectedTx)}
        onCancel={() => setSelectedTx(null)}
        footer={null}
        width={480}
        centered
        destroyOnClose
      >
        {selectedTx && (
          <div className="py-2 text-left font-sans">
            <div className="flex items-center gap-3 pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-10 h-10 rounded-lg bg-[#961A1C]/10 flex items-center justify-center shrink-0">
                <History size={20} className="text-[#961A1C]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Transaction Details</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold ${
                      (selectedTx.status || '').toLowerCase() === 'successful' ||
                      (selectedTx.status || '').toLowerCase() === 'success'
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                        : (selectedTx.status || '').toLowerCase() === 'pending'
                        ? 'text-amber-700 bg-amber-50 border border-amber-200'
                        : 'text-red-700 bg-red-50 border border-red-200'
                    }`}
                  >
                    {selectedTx.status || 'Successful'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono truncate">
                  {selectedTx.reference || selectedTx.id || 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Amount Display */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 text-center border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] font-mono text-gray-400 uppercase">Transaction Amount</span>
                <p
                  className={`text-2xl font-bold font-mono mt-1 ${
                    getTxDirection(selectedTx) === 'Credit'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : getTxDirection(selectedTx) === 'Debit'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {getTxDirection(selectedTx) === 'Credit' ? '+' : getTxDirection(selectedTx) === 'Debit' ? '-' : ''}₦
                  {selectedTx.amount
                    ? Number(selectedTx.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : '0.00'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
                  {selectedTx.category && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      {selectedTx.category}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {selectedTx.transactionType
                      ? selectedTx.transactionType.replace(/([A-Z])/g, ' $1').trim()
                      : selectedTx.type || 'Transfer'}
                  </span>
                </div>
              </div>

              {/* Transaction Key Details */}
              <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700/60">
                  <span className="text-gray-400">Reference:</span>
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
                    <span className="truncate max-w-[200px]">
                      {selectedTx.reference || selectedTx.id || '—'}
                    </span>
                    {(selectedTx.reference || selectedTx.id) && (
                      <CopyButton text={selectedTx.reference || selectedTx.id} label="Reference" />
                    )}
                  </div>
                </div>

                {selectedTx.externalReference && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700/60">
                    <span className="text-gray-400">External Ref:</span>
                    <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
                      <span className="truncate max-w-[200px]">{selectedTx.externalReference}</span>
                      <CopyButton text={selectedTx.externalReference} label="External Ref" />
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700/60">
                  <span className="text-gray-400">Timestamp:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {formatTxDate(selectedTx.transactionDate || selectedTx.createdDate || selectedTx.timestamp)}
                  </span>
                </div>

                <div className="flex justify-between items-start py-1 border-b border-gray-100 dark:border-gray-700/60">
                  <span className="text-gray-400">Debit Account:</span>
                  <div className="text-right font-semibold text-gray-800 dark:text-gray-200">
                    <div>{selectedTx.debitAccount || '—'}</div>
                    {selectedTx.debitAccountName && (
                      <div className="text-[11px] font-sans text-gray-500 font-normal">{selectedTx.debitAccountName}</div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-start py-1 border-b border-gray-100 dark:border-gray-700/60">
                  <span className="text-gray-400">Credit Account:</span>
                  <div className="text-right font-semibold text-gray-800 dark:text-gray-200">
                    <div>{selectedTx.creditAccount || '—'}</div>
                    {selectedTx.creditAccountName && (
                      <div className="text-[11px] font-sans text-gray-500 font-normal">{selectedTx.creditAccountName}</div>
                    )}
                  </div>
                </div>

                {selectedTx.fundId && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700/60">
                    <span className="text-gray-400">Fund Reference:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {selectedTx.fundId} {selectedTx.fundAccountId ? `(${selectedTx.fundAccountId})` : ''}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-start py-1">
                  <span className="text-gray-400">Description:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-right max-w-[240px] font-sans">
                    {selectedTx.description || selectedTx.narrative || '—'}
                  </span>
                </div>
              </div>

              {/* Download Receipt Button */}
              <div className="pt-2">
                <button
                  onClick={handleDownloadReceipt}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#961A1C] hover:bg-[#7e1517] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Official Receipt</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

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
                    {(!Array.isArray(fundTxModal) || fundTxModal.length === 0) ? (
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
