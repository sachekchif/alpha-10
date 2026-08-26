'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Button, Tag, Modal, Input, message, Dropdown, MenuProps, Tooltip 
} from 'antd';
import { 
  ArrowLeft, Wallet, Shield, Lock, Unlock, PauseCircle, RotateCcw, 
  UserCheck, AlertTriangle, ArrowUpRight, ArrowDownRight, Eye, Download, 
  FileText, CheckCircle2, Clock, XCircle, CreditCard, User, Building2, 
  History, MessageSquare, Plus, AlertCircle, Trash2, Edit3, ChevronRight,
  ShieldCheck, Layers, FileSpreadsheet, Send, HelpCircle, Ban, Settings,
  MoreVertical, ChevronDown
} from 'lucide-react';
import { StatusBadge, StateBadge } from '../page';

// MOCK DETAILED WALLET DATA (ALPHA 10 BANK ONLY)
const mockWalletDetails: Record<string, any> = {
  'W-9182': {
    id: 'W-9182',
    walletNumber: '0123456789',
    walletType: 'Personal',
    currency: 'NGN',
    status: 'Active',
    state: 'Healthy',
    createdDate: '12 Jan 2025, 09:30 AM',
    lastUpdated: '29 Jul 2026, 14:15 PM',
    lastTransaction: '29 Jul 2026, 12:10 PM (₦50,000.00 Credit)',
    dailyLimit: '₦5,000,000.00',
    monthlyLimit: '₦50,000,000.00',
    branch: 'Victoria Island HQ',
    
    // Balances
    currentBalance: 450000.00,
    availableBalance: 400000.00,
    heldBalance: 50000.00,
    frozenBalance: 0.00,
    reservedBalance: 0.00,
    dailyVolume: 125000.00,
    monthlyVolume: 3450000.00,

    // Customer Relationship
    customer: {
      id: 'CUST-8291',
      name: 'Oluwaseun Adeleke',
      type: 'Retail Individual',
      email: 'seun.adeleke@gmail.com',
      phone: '+234 801 234 5678',
      primaryAccountNumber: '0123456789',
      linkedAccounts: '2 Active Accounts (Savings & Current)',
      linkedCards: '1 Virtual Debit Card (Active)',
      virtualAccount: '0123456789 (Alpha 10)',
    },

    // Transactions
    recentTransactions: [
      {
        id: 'TXN-901823',
        type: 'Credit / Deposit',
        description: 'Direct Debit Inflow via Alpha 10',
        amount: '+₦50,000.00',
        amountVal: 50000,
        channel: 'Web App API',
        status: 'Completed',
        datetime: '29 Jul 2026, 12:10 PM',
      },
      {
        id: 'TXN-901755',
        type: 'Debit / Transfer',
        description: 'Outward Transfer to Amara Nwosu (Alpha 10)',
        amount: '-₦15,000.00',
        amountVal: -15000,
        channel: 'Mobile Banking',
        status: 'Completed',
        datetime: '28 Jul 2026, 18:45 PM',
      },
      {
        id: 'TXN-901610',
        type: 'Credit / Yield',
        description: 'Monthly Flexi-Save Interest Payout',
        amount: '+₦12,450.00',
        amountVal: 12450,
        channel: 'System Interest Engine',
        status: 'Completed',
        datetime: '25 Jul 2026, 00:01 AM',
      },
      {
        id: 'TXN-901402',
        type: 'Debit / Card',
        description: 'POS Payment at Shoprite Victoria Island',
        amount: '-₦34,500.00',
        amountVal: -34500,
        channel: 'Virtual Card Terminal',
        status: 'Completed',
        datetime: '22 Jul 2026, 15:20 PM',
      },
    ],

    // Operational Timeline
    activityTimeline: [
      {
        date: '29 Jul 2026',
        time: '14:15 PM',
        event: 'Wallet Viewed by Admin',
        performedBy: 'System Administrator (You)',
        remarks: 'Navigated to wallet detail view for compliance audit.',
      },
      {
        date: '25 Jul 2026',
        time: '00:01 AM',
        event: 'System Interest Credit Applied',
        performedBy: 'Automated Yield Engine',
        remarks: 'Credited ₦12,450.00 interest yield to available balance.',
      },
      {
        date: '10 May 2026',
        time: '11:30 AM',
        event: 'Wallet Limit Updated',
        performedBy: 'Compliance Officer (Babajide S.)',
        remarks: 'Upgraded daily transaction limit to ₦5,000,000.00 following Tier 3 KYC approval.',
      },
      {
        date: '12 Jan 2025',
        time: '09:30 AM',
        event: 'Wallet Created & Activated',
        performedBy: 'Customer Self-Registration API',
        remarks: 'Wallet provisioned with dedicated Alpha 10 virtual account.',
      },
    ],

    // Compliance Audit Trail
    auditTrail: [
      {
        timestamp: '29 Jul 2026, 14:15:02',
        administrator: 'SuperAdmin (You)',
        role: 'Global Admin',
        action: 'INSPECT_WALLET_PROFILE',
        reason: 'Routine operational audit',
        ipAddress: '197.210.64.12',
        device: 'Chrome v126 (Windows 11)',
      },
      {
        timestamp: '10 May 2026, 11:30:15',
        administrator: 'Babajide S.',
        role: 'Compliance Manager',
        action: 'UPDATE_TRANSACTION_LIMIT',
        reason: 'Tier 3 BVN & Proof of Address Verified',
        ipAddress: '102.89.44.11',
        device: 'Safari v17 (MacOS)',
      },
      {
        timestamp: '12 Jan 2025, 09:30:00',
        administrator: 'SYSTEM_BOT',
        role: 'Automated System',
        action: 'CREATE_WALLET_RECORD',
        reason: 'Onboarding API Triggered',
        ipAddress: '127.0.0.1',
        device: 'Internal Gateway',
      },
    ],

    // Admin Notes
    initialNotes: [
      {
        id: '1',
        author: 'Babajide S. (Compliance Manager)',
        datetime: '10 May 2026, 11:32 AM',
        text: 'Tier 3 KYC verification completed. Proof of address matched utility bill dated April 2026. Approved limit increase.',
      },
      {
        id: '2',
        author: 'Support Admin (Chidinma E.)',
        datetime: '15 Feb 2026, 09:10 AM',
        text: 'Customer requested virtual card binding assistance. Resolved in Ticket #3902.',
      },
    ],
  },
};

export default function WalletDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const walletId = (params?.id as string) || 'W-9182';

  // Get data or fallback
  const rawWallet = mockWalletDetails[walletId] || {
    ...mockWalletDetails['W-9182'],
    id: walletId,
  };

  const [wallet, setWallet] = useState(rawWallet);
  const [notes, setNotes] = useState<any[]>(rawWallet.initialNotes);
  const [newNoteText, setNewNoteText] = useState('');
  
  // Action Modals State
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [newLimit, setNewLimit] = useState('5000000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Note Submission
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const created = {
      id: String(Date.now()),
      author: 'SuperAdmin (You)',
      datetime: 'Just now',
      text: newNoteText,
    };
    setNotes([created, ...notes]);
    setNewNoteText('');
    message.success('Internal administrator note added successfully.');
  };

  // Handle Action Execution
  const handleExecuteAction = (actionName: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      let updatedStatus = wallet.status;
      let updatedState = wallet.state;

      if (actionName === 'Freeze Wallet') {
        updatedStatus = 'Frozen';
        updatedState = 'Frozen Funds';
      } else if (actionName === 'Unfreeze Wallet' || actionName === 'Reactivate Wallet') {
        updatedStatus = 'Active';
        updatedState = 'Healthy';
      } else if (actionName === 'Suspend Wallet') {
        updatedStatus = 'Suspended';
        updatedState = 'Restricted';
      } else if (actionName === 'Close Wallet') {
        updatedStatus = 'Closed';
      }

      setWallet({
        ...wallet,
        status: updatedStatus,
        state: updatedState,
        dailyLimit: actionName === 'Adjust Limits' ? `₦${Number(newLimit).toLocaleString()}` : wallet.dailyLimit,
      });

      setIsSubmitting(false);
      setActiveModal(null);
      setActionReason('');
      message.success(`Action "${actionName}" executed successfully on wallet ${wallet.id}.`);
    }, 600);
  };

  // More Actions Dropdown Menu
  const getMoreMenu = (): MenuProps => ({
    items: [
      {
        key: 'limits',
        label: (
          <span className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
            <Settings size={14} className="text-gray-500" /> Adjust Limits
          </span>
        ),
        onClick: () => setActiveModal('Adjust Limits'),
      },
      {
        key: 'statement',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Download size={14} className="text-gray-500" /> Export Wallet Statement
          </span>
        ),
        onClick: () => message.info('Downloading full wallet statement...'),
      },
      {
        key: 'audit',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <ShieldCheck size={14} className="text-gray-500" /> Download Audit Log
          </span>
        ),
        onClick: () => message.info('Downloading audit report...'),
      },
      { type: 'divider' },
      {
        key: 'close',
        label: (
          <span className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
            <Trash2 size={14} /> Close Wallet (Danger)
          </span>
        ),
        onClick: () => setActiveModal('Close Wallet'),
      },
    ],
  });

  return (
    <div className="h-full flex flex-col space-y-5 max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER SECTION (DESIGNED EXACTLY LIKE CUSTOMER DETAILS PAGE) */}
      <div className="flex flex-col space-y-3 pt-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
          <div className="flex flex-col">
            
            {/* Back Icon Link */}
            <Link 
              href="/dashboard/retail/wallets" 
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black dark:hover:text-white font-medium transition-colors mb-2"
            >
              <ArrowLeft size={16} /> Back to Wallet Directory
            </Link>

            {/* Wallet ID Title & Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-normal font-mono text-gray-900 dark:text-white tracking-tight">
                {wallet.id}
              </h1>
              <StatusBadge status={wallet.status} />
              <StateBadge state={wallet.state} />
              <Tag color="purple" className="font-semibold text-xs rounded-md">
                {wallet.walletType} Wallet
              </Tag>
              <Tag className="font-bold text-xs bg-gray-100 dark:bg-gray-700">
                {wallet.currency}
              </Tag>
            </div>

            {/* Subtitle Info Under Title with Dots • */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-mono mt-2 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="text-gray-400 font-sans font-medium">Customer:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{wallet.customer.name}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="text-gray-400 font-sans font-medium">Virtual Acc:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{wallet.customer.virtualAccount}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="text-gray-400 font-sans font-medium">Last Activity:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{wallet.lastActivity}</span>
              </span>
            </div>

          </div>
          
          {/* Action Buttons (Top Right) */}
          <div className="flex items-center gap-2 self-start md:self-end">
            {wallet.status === 'Active' ? (
              <button
                onClick={() => setActiveModal('Freeze Wallet')}
                className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-1.5 shadow-2xs"
              >
                <Lock size={14} className="text-red-500" /> Freeze Wallet
              </button>
            ) : (
              <button
                onClick={() => setActiveModal('Unfreeze Wallet')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition flex items-center gap-1.5 shadow-sm"
              >
                <Unlock size={14} /> Unfreeze Wallet
              </button>
            )}

            {wallet.status === 'Suspended' ? (
              <button
                onClick={() => setActiveModal('Reactivate Wallet')}
                className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition flex items-center gap-1.5 shadow-2xs"
              >
                <RotateCcw size={14} /> Reactivate Wallet
              </button>
            ) : (
              <button
                onClick={() => setActiveModal('Suspend Wallet')}
                className="px-3.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition flex items-center gap-1.5 shadow-2xs"
              >
                <PauseCircle size={14} /> Suspend Wallet
              </button>
            )}

            <Dropdown menu={getMoreMenu()} trigger={['click']} placement="bottomRight">
              <button className="px-3.5 py-2 text-xs font-semibold text-white bg-black hover:bg-gray-800 rounded-lg transition flex items-center gap-1.5 shadow-sm">
                Actions <ChevronDown size={14} />
              </button>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* 2. BALANCE & VOLUME CARDS (DIRECT DISPLAY WITHOUT SECTION TEXT) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <BalanceCard title="Current Balance" value={wallet.currentBalance} currency={wallet.currency} highlight="red" />
        <BalanceCard title="Available Balance" value={wallet.availableBalance} currency={wallet.currency} highlight="green" />
        <BalanceCard title="Held Balance" value={wallet.heldBalance} currency={wallet.currency} highlight="amber" />
        <BalanceCard title="Frozen Balance" value={wallet.frozenBalance} currency={wallet.currency} highlight="gray" />
        <BalanceCard title="Reserved Balance" value={wallet.reservedBalance} currency={wallet.currency} highlight="gray" />
        <VolumeCard title="Daily Volume" value={wallet.dailyVolume} currency={wallet.currency} />
        <VolumeCard title="Monthly Volume" value={wallet.monthlyVolume} currency={wallet.currency} />
      </div>

      {/* MAIN TWO-COLUMN LAYOUT (LEFT 8 COLS, RIGHT 4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* WALLET INFORMATION */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText size={18} className="text-[#961A1C]" />
                Wallet Information
              </span>
              <button
                onClick={() => setActiveModal('Adjust Limits')}
                className="text-xs font-semibold text-[#961A1C] hover:underline flex items-center gap-1"
              >
                <Edit3 size={13} /> Edit Limits
              </button>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <InfoRow label="Wallet ID" value={<span className="font-mono font-bold text-[#961A1C]">{wallet.id}</span>} />
              <InfoRow label="Wallet Number" value={<span className="font-mono font-semibold">{wallet.walletNumber}</span>} />
              <InfoRow label="Wallet Type" value={wallet.walletType} />
              <InfoRow label="Currency" value={`${wallet.currency} (ISO Code)`} />
              <InfoRow label="Lifecycle Status" value={<StatusBadge status={wallet.status} />} />
              <InfoRow label="Operational State" value={<StateBadge state={wallet.state} />} />
              <InfoRow label="Created Date" value={wallet.createdDate} />
              <InfoRow label="Last Updated" value={wallet.lastUpdated} />
              <InfoRow label="Last Transaction" value={wallet.lastTransaction} />
              <InfoRow label="Branch Designation" value={wallet.branch} />
              <InfoRow label="Daily Limit" value={<span className="font-bold text-gray-900 dark:text-white">{wallet.dailyLimit}</span>} />
              <InfoRow label="Monthly Limit" value={<span className="font-bold text-gray-900 dark:text-white">{wallet.monthlyLimit}</span>} />
            </div>
          </div>

          {/* CUSTOMER RELATIONSHIPS */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User size={18} className="text-[#961A1C]" />
                Customer Relationships
              </h3>
              <Link
                href={`/dashboard/retail/customers/${wallet.customer.id}`}
                className="flex items-center gap-1 bg-[#961A1C] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#7a1517] transition shadow-xs"
              >
                View Customer Profile <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
                <span className="text-gray-400 font-medium text-[11px] block">Customer Name</span>
                <span className="font-bold text-gray-900 dark:text-white block text-sm">{wallet.customer.name}</span>
                <span className="text-gray-400 text-[11px] font-mono">{wallet.customer.id}</span>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
                <span className="text-gray-400 font-medium text-[11px] block">Primary Account</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white block">{wallet.customer.primaryAccountNumber}</span>
                <span className="text-gray-400 text-[11px]">{wallet.customer.type}</span>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
                <span className="text-gray-400 font-medium text-[11px] block">Virtual Dedicated Account</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white block">{wallet.customer.virtualAccount}</span>
                <span className="text-emerald-600 font-semibold text-[11px]">Auto-Provisioned</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs">
              <div>
                <span className="text-gray-500">Linked Accounts: </span>
                <strong className="text-gray-800 dark:text-gray-200">{wallet.customer.linkedAccounts}</strong>
              </div>
              <div>
                <span className="text-gray-500">Linked Cards: </span>
                <strong className="text-gray-800 dark:text-gray-200">{wallet.customer.linkedCards}</strong>
              </div>
            </div>
          </div>

          {/* RECENT TRANSACTIONS (HIDDEN SCROLLBAR) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard size={18} className="text-[#961A1C]" />
                Recent Transactions
              </h3>
              <Link
                href={`/dashboard/transactions?wallet=${wallet.id}`}
                className="text-xs font-semibold text-[#961A1C] hover:underline flex items-center gap-1"
              >
                View All Transactions <ChevronRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Channel</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {wallet.recentTransactions.map((txn: any) => (
                    <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition">
                      <td className="px-5 py-3 font-mono font-bold text-gray-900 dark:text-white">{txn.id}</td>
                      <td className="px-5 py-3">{txn.type}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">{txn.description}</td>
                      <td className={`px-5 py-3 font-bold ${txn.amountVal > 0 ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                        {txn.amount}
                      </td>
                      <td className="px-5 py-3 text-gray-500">{txn.channel}</td>
                      <td className="px-5 py-3">
                        <Tag color="success" className="font-semibold text-[10px]">
                          {txn.status}
                        </Tag>
                      </td>
                      <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{txn.datetime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ADMINISTRATIVE COMPLIANCE AUDIT TRAIL (HIDDEN SCROLLBAR) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#961A1C]" />
              Administrative Compliance Audit Trail
            </h3>

            <div className="overflow-x-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2.5">Timestamp</th>
                    <th className="px-4 py-2.5">Administrator</th>
                    <th className="px-4 py-2.5">Role</th>
                    <th className="px-4 py-2.5">Action Code</th>
                    <th className="px-4 py-2.5">Reason / Context</th>
                    <th className="px-4 py-2.5">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-mono">
                  {wallet.auditTrail.map((audit: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{audit.timestamp}</td>
                      <td className="px-4 py-2.5 font-sans font-bold text-gray-900 dark:text-white">{audit.administrator}</td>
                      <td className="px-4 py-2.5 font-sans text-gray-500">{audit.role}</td>
                      <td className="px-4 py-2.5 font-bold text-[#961A1C]">{audit.action}</td>
                      <td className="px-4 py-2.5 font-sans text-gray-600 dark:text-gray-300">{audit.reason}</td>
                      <td className="px-4 py-2.5 text-gray-400">{audit.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-6">

          {/* OPERATIONAL ACTIVITY TIMELINE */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 mb-4 flex items-center gap-2">
              <History size={18} className="text-[#961A1C]" />
              Operational Activity Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
              {wallet.activityTimeline.map((item: any, idx: number) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#961A1C] ring-4 ring-white dark:ring-gray-800" />
                  <div className="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-xl space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="font-bold text-xs text-gray-900 dark:text-white">{item.event}</span>
                      <span className="text-[11px] text-gray-400">{item.date} at {item.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{item.remarks}</p>
                    <div className="text-[11px] text-gray-400 pt-1">
                      Performed by: <strong className="text-gray-700 dark:text-gray-200">{item.performedBy}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INTERNAL ADMIN NOTES */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <span className="flex items-center gap-2">
                <MessageSquare size={18} className="text-[#961A1C]" />
                Internal Admin Notes
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full font-bold">
                {notes.length}
              </span>
            </h3>

            {/* New Note Form */}
            <div className="space-y-2">
              <Input.TextArea
                rows={3}
                placeholder="Add an internal administrator note (e.g. customer reported suspicious login, wallet frozen pending review)..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="text-xs"
              />
              <Button
                type="primary"
                icon={<Send size={13} />}
                onClick={handleAddNote}
                style={{ backgroundColor: '#961A1C', borderColor: '#961A1C' }}
                className="!bg-[#961A1C] font-semibold text-xs h-8 rounded-lg w-full flex items-center justify-center gap-1"
              >
                Post Internal Note
              </Button>
            </div>

            {/* Notes List */}
            <div className="space-y-3 pt-2">
              {notes.map((note) => (
                <div key={note.id} className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl space-y-1 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between text-[11px]">
                    <strong className="text-gray-900 dark:text-white">{note.author}</strong>
                    <span className="text-gray-400">{note.datetime}</span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

      {/* --- ACTION CONFIRMATION MODALS --- */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <AlertTriangle className={activeModal?.includes('Close') || activeModal?.includes('Delete') ? 'text-red-500' : 'text-amber-500'} size={20} />
            Confirm Operational Action: {activeModal}
          </div>
        }
        open={activeModal !== null}
        onCancel={() => setActiveModal(null)}
        footer={[
          <Button key="cancel" onClick={() => setActiveModal(null)}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger={activeModal?.includes('Close') || activeModal?.includes('Freeze') || activeModal?.includes('Delete')}
            loading={isSubmitting}
            onClick={() => handleExecuteAction(activeModal || '')}
            className="font-semibold"
          >
            Confirm & Execute
          </Button>,
        ]}
        width={460}
        centered
      >
        {activeModal && (
          <div className="py-2 space-y-3 text-xs">
            <p className="text-gray-700 dark:text-gray-300">
              You are executing <strong>{activeModal}</strong> on wallet <strong className="text-[#961A1C]">{wallet.id}</strong> belonging to <strong>{wallet.customer.name}</strong>.
            </p>

            {activeModal === 'Adjust Limits' ? (
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  New Daily Limit (NGN)
                </label>
                <Input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="5000000"
                />
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Action / Compliance Reference <span className="text-red-500">*</span>
                </label>
                <Input.TextArea
                  rows={3}
                  placeholder="Enter administrative reason or ticket reference..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}

// --- HELPER BALANCE CARD ---
function BalanceCard({ title, value, currency, highlight }: { title: string; value: number; currency: string; highlight: string }) {
  const sym = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '₦';
  const borderColors: Record<string, string> = {
    red: 'border-l-4 border-l-[#961A1C]',
    green: 'border-l-4 border-l-emerald-500',
    amber: 'border-l-4 border-l-amber-500',
    gray: 'border-l-4 border-l-gray-300 dark:border-l-gray-600',
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700/80 shadow-2xs ${borderColors[highlight]}`}>
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block truncate">{title}</span>
      <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight block mt-1">
        {sym}{value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
}

// --- HELPER VOLUME CARD ---
function VolumeCard({ title, value, currency }: { title: string; value: number; currency: string }) {
  const sym = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '₦';
  return (
    <div className="bg-gray-50 dark:bg-gray-800/90 p-3.5 rounded-xl border border-gray-200/60 dark:border-gray-700 shadow-2xs">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block truncate">{title}</span>
      <span className="text-base font-bold text-[#961A1C] dark:text-red-400 tracking-tight block mt-1">
        {sym}{value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
}

// --- HELPER INFO ROW ---
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-50 dark:border-gray-700/40 gap-1">
      <span className="text-gray-500 dark:text-gray-400 font-medium">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-white text-right">{value}</span>
    </div>
  );
}
