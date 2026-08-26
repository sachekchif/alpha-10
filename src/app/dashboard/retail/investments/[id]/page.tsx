'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Button, Tag, Modal, Input, message, Dropdown, MenuProps, Tooltip 
} from 'antd';
import { 
  ArrowLeft, TrendingUp, Shield, Lock, Unlock, PauseCircle, RotateCcw, 
  UserCheck, AlertTriangle, ArrowUpRight, ArrowDownRight, Eye, Download, 
  FileText, CheckCircle2, Clock, XCircle, CreditCard, User, Building2, 
  History, MessageSquare, Plus, AlertCircle, Trash2, Edit3, ChevronRight,
  ShieldCheck, Layers, FileSpreadsheet, Send, HelpCircle, Ban, Settings,
  MoreVertical, ChevronDown, Calendar, RefreshCw, Award, FileCheck, DollarSign
} from 'lucide-react';
import { InvestmentStatusBadge, InvestmentStateBadge } from '../page';

// MOCK DETAILED INVESTMENT DATA
const mockInvestmentDetails: Record<string, any> = {
  'INV-7721': {
    id: 'INV-7721',
    product: 'Fixed Deposit',
    investmentType: 'Term Deposit (Compounded Quarterly)',
    currency: 'NGN',
    status: 'Active',
    state: 'Healthy',
    createdDate: '15 Aug 2025, 09:30 AM',
    startDate: '15 Aug 2025',
    maturityDate: '15 Aug 2026',
    tenure: '12 Months (365 Days)',
    daysRemaining: 17,
    relationshipManager: 'Sarah Jenkins',

    // Financial Performance
    principal: 5000000.00,
    currentValue: 5362500.00,
    interestRate: 14.5,
    compoundingMethod: 'Quarterly Compounding',
    interestEarned: 362500.00,
    projectedMaturityValue: 5725000.00,
    interestPaid: 0.00,
    remainingInterest: 362500.00,
    returnPercentage: 14.5,

    // Customer Relationship
    customer: {
      id: 'CUST-8291',
      name: 'Oluwaseun Adeleke',
      type: 'Retail Individual',
      email: 'seun.adeleke@gmail.com',
      phone: '+234 801 234 5678',
      primaryAccountNumber: '0123456789',
      relationshipManager: 'Sarah Jenkins',
    },

    // Investment Schedule Timeline
    scheduleTimeline: [
      { event: 'Investment Account Created', date: '15 Aug 2025', amount: '₦5,000,000.00', status: 'Completed', remarks: 'Principal funds received via account transfer.' },
      { event: 'Q1 Interest Accrued', date: '15 Nov 2025', amount: '+₦181,250.00', status: 'Completed', remarks: 'Quarterly interest accrued to ledger.' },
      { event: 'Q2 Interest Accrued', date: '15 Feb 2026', amount: '+₦181,250.00', status: 'Completed', remarks: 'Quarterly interest accrued to ledger.' },
      { event: 'Maturity Date Approaching', date: '15 Aug 2026', amount: '₦5,725,000.00', status: 'Upcoming', remarks: 'Scheduled maturity payout to primary account.' },
      { event: 'Final Liquidation & Payout', date: '15 Aug 2026', amount: '₦5,725,000.00', status: 'Scheduled', remarks: 'Full redemption payout.' },
    ],

    // Transaction History
    transactions: [
      { id: 'TXN-881902', type: 'Investment Creation', amount: '₦5,000,000.00', channel: 'Direct Transfer', status: 'Completed', date: '15 Aug 2025, 09:30 AM' },
      { id: 'TXN-882104', type: 'Q1 Interest Accrual', amount: '+₦181,250.00', channel: 'System Engine', status: 'Completed', date: '15 Nov 2025, 00:01 AM' },
      { id: 'TXN-883912', type: 'Q2 Interest Accrual', amount: '+₦181,250.00', channel: 'System Engine', status: 'Completed', date: '15 Feb 2026, 00:01 AM' },
    ],

    // Operational Activity Timeline
    activityTimeline: [
      { date: '29 Jul 2026', time: '14:20 PM', administrator: 'SuperAdmin (You)', remarks: 'Inspected investment performance and yield schedule.' },
      { date: '15 Feb 2026', time: '00:01 AM', administrator: 'Automated Yield Engine', remarks: 'Accrued Q2 interest of ₦181,250.00.' },
      { date: '15 Aug 2025', time: '10:00 AM', administrator: 'Sarah Jenkins (RM)', remarks: 'Investment subscription verified and compliance approved.' },
    ],

    // Audit Trail
    auditTrail: [
      { timestamp: '29 Jul 2026, 14:20:00', administrator: 'SuperAdmin (You)', role: 'Global Admin', action: 'VIEW_INVESTMENT_DETAILS', reason: 'Operational audit', ipAddress: '197.210.64.12', device: 'Chrome v126 (Windows)' },
      { timestamp: '15 Aug 2025, 10:00:00', administrator: 'Sarah Jenkins', role: 'Relationship Manager', action: 'APPROVE_INVESTMENT_SUBSCRIPTION', reason: 'Fixed Deposit Booking', ipAddress: '102.89.23.11', device: 'Safari (MacOS)' },
    ],

    // Documents
    documents: [
      { name: 'Investment Certificate.pdf', size: '1.2 MB', date: '15 Aug 2025', category: 'Certificate' },
      { name: 'Customer Terms Agreement.pdf', size: '850 KB', date: '15 Aug 2025', category: 'Agreement' },
      { name: 'Terms & Conditions (FD-2025).pdf', size: '420 KB', date: '15 Aug 2025', category: 'Terms' },
      { name: 'Pre-Redemption Notice.pdf', size: '310 KB', date: '10 Jul 2026', category: 'Notice' },
    ],

    // Internal Admin Notes
    initialNotes: [
      { id: '1', author: 'Sarah Jenkins (RM)', datetime: '15 Aug 2025, 10:05 AM', text: 'Customer booked 12-month Fixed Deposit at 14.5% p.a. Maturity set to August 2026.' },
      { id: '2', author: 'Treasury Admin', datetime: '10 Jul 2026, 11:30 AM', text: 'Pre-maturity notification sent to relationship manager.' },
    ],
  },
};

export default function InvestmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const invId = (params?.id as string) || 'INV-7721';

  // Get data or fallback
  const rawDetails = mockInvestmentDetails[invId] || {
    ...mockInvestmentDetails['INV-7721'],
    id: invId,
  };

  const [investment, setInvestment] = useState(rawDetails);
  const [notes, setNotes] = useState<any[]>(rawDetails.initialNotes);
  const [newNoteText, setNewNoteText] = useState('');
  
  // Action Modals State
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Add Note
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote = {
      id: String(Date.now()),
      author: 'SuperAdmin (You)',
      datetime: 'Just now',
      text: newNoteText,
    };
    setNotes([newNote, ...notes]);
    setNewNoteText('');
    message.success('Internal administrator note posted successfully.');
  };

  // Handle Action Execution
  const handleExecuteAction = (actionName: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      let updatedStatus = investment.status;
      let updatedState = investment.state;

      if (actionName === 'Redeem Investment') {
        updatedStatus = 'Redeemed';
        updatedState = 'Healthy';
      } else if (actionName === 'Extend Maturity') {
        updatedStatus = 'Active';
        updatedState = 'Healthy';
      } else if (actionName === 'Cancel Investment') {
        updatedStatus = 'Cancelled';
        updatedState = 'Disputed';
      }

      setInvestment({
        ...investment,
        status: updatedStatus,
        state: updatedState,
      });

      setIsSubmitting(false);
      setActiveModal(null);
      setActionReason('');
      message.success(`Action "${actionName}" executed successfully for ${investment.id}.`);
    }, 600);
  };

  // Actions Dropdown Menu
  const getMoreMenu = (): MenuProps => ({
    items: [
      {
        key: 'redeem',
        label: (
          <span className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <RotateCcw size={14} /> Redeem Investment
          </span>
        ),
        onClick: () => setActiveModal('Redeem Investment'),
      },
      {
        key: 'extend',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-blue-600">
            <Calendar size={14} /> Extend Maturity
          </span>
        ),
        onClick: () => setActiveModal('Extend Maturity'),
      },
      {
        key: 'cert',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Award size={14} className="text-gray-500" /> Download Certificate
          </span>
        ),
        onClick: () => message.info(`Downloading investment certificate for ${investment.id}...`),
      },
      {
        key: 'statement',
        label: (
          <span className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Download size={14} className="text-gray-500" /> Export Full Statement
          </span>
        ),
        onClick: () => message.info(`Exporting statement for ${investment.id}...`),
      },
      { type: 'divider' },
      {
        key: 'cancel',
        label: (
          <span className="flex items-center gap-2 text-xs font-semibold text-red-600">
            <Trash2 size={14} /> Cancel Investment (Danger)
          </span>
        ),
        onClick: () => setActiveModal('Cancel Investment'),
      },
    ],
  });

  const sym = investment.currency === 'USD' ? '$' : investment.currency === 'GBP' ? '£' : investment.currency === 'EUR' ? '€' : '₦';

  return (
    <div className="h-full flex flex-col space-y-5 max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* 1. HEADER SECTION (DESIGNED EXACTLY LIKE CUSTOMER DETAILS PAGE) */}
      <div className="flex flex-col space-y-3 pt-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
          <div className="flex flex-col">
            
            {/* Back Icon Link */}
            <Link 
              href="/dashboard/retail/investments" 
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black dark:hover:text-white font-medium transition-colors mb-2"
            >
              <ArrowLeft size={16} /> Back to Investment Directory
            </Link>

            {/* Title & Inline Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-normal font-mono text-gray-900 dark:text-white tracking-tight">
                {investment.id}
              </h1>
              <InvestmentStatusBadge status={investment.status} />
              <InvestmentStateBadge state={investment.state} />
              <Tag color="purple" className="font-semibold text-xs rounded-md">
                {investment.product}
              </Tag>
              <Tag className="font-bold text-xs bg-gray-100 dark:bg-gray-700">
                {investment.currency}
              </Tag>
            </div>

            {/* Subtitle Details Row with Dots • */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-mono mt-2 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="text-gray-400 font-sans font-medium">Customer:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{investment.customer.name}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="text-gray-400 font-sans font-medium">Principal:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{sym}{investment.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="text-gray-400 font-sans font-medium">Current Value:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{sym}{investment.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="text-gray-400 font-sans font-medium">Maturity:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{investment.maturityDate}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="text-gray-400 font-sans font-medium">Remaining:</span>
                <span className="font-semibold text-emerald-600">{investment.daysRemaining} Days</span>
              </span>
            </div>

          </div>
          
          {/* Action Buttons (Top Right) */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              onClick={() => setActiveModal('Redeem Investment')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw size={14} /> Redeem Investment
            </button>

            <button
              onClick={() => setActiveModal('Extend Maturity')}
              className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-1.5 shadow-2xs"
            >
              <Calendar size={14} className="text-blue-500" /> Extend Maturity
            </button>

            <Dropdown menu={getMoreMenu()} trigger={['click']} placement="bottomRight">
              <button className="px-3.5 py-2 text-xs font-semibold text-white bg-black hover:bg-gray-800 rounded-lg transition flex items-center gap-1.5 shadow-sm">
                Actions <ChevronDown size={14} />
              </button>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* 2. CONSOLIDATED HIGH-SIGNAL STAT CARDS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: PRINCIPAL CAPITAL */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-[#961A1C] rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Principal Capital</span>
            <Tag color="volcano" className="!bg-[#961A1C]/10 !text-[#961A1C] !border-none font-semibold text-[10px] m-0">Principal</Tag>
          </div>
          <div className="my-2 pl-2">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight font-sans">
              {sym}{investment.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pl-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <span>Tenure: <strong className="text-gray-800 dark:text-gray-200">{investment.tenure}</strong></span>
          </div>
        </div>

        {/* CARD 2: CURRENT VALUE & RETURN RATE */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-emerald-500 rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Current Value</span>
            <Tag color="emerald" className="font-semibold text-[10px] m-0">+{investment.returnPercentage}% p.a.</Tag>
          </div>
          <div className="my-2 pl-2">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight font-sans">
              {sym}{investment.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pl-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <span>Yield Rate: <strong className="text-emerald-600">+{investment.returnPercentage}% p.a.</strong></span>
          </div>
        </div>

        {/* CARD 3: ACCRUED YIELD & PROJECTED MATURITY */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-blue-500 rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Interest Accrued</span>
            <Tag color="blue" className="font-semibold text-[10px] m-0">Yield Earned</Tag>
          </div>
          <div className="my-2 pl-2">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight font-sans">
              {sym}{investment.interestEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pl-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <span>Projected Payout: <strong className="text-purple-600">{sym}{investment.projectedMaturityValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
          </div>
        </div>

        {/* CARD 4: MATURITY COUNTDOWN */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-amber-500 rounded-r-md" />
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Maturity Countdown</span>
            <Tag color="volcano" className="font-bold text-[10px] m-0">Maturity</Tag>
          </div>
          <div className="my-2 pl-2 flex items-baseline gap-2">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight font-sans">
              {investment.daysRemaining} Days
            </h2>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pl-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <span>Maturity Date: <strong className="text-gray-800 dark:text-gray-200">{investment.maturityDate}</strong></span>
          </div>
        </div>

      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SECTION 1 — INVESTMENT INFORMATION */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText size={18} className="text-[#961A1C]" />
                Investment Information
              </span>
              <button
                onClick={() => setActiveModal('Extend Maturity')}
                className="text-xs font-semibold text-[#961A1C] hover:underline flex items-center gap-1"
              >
                <Edit3 size={13} /> Modify Terms
              </button>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <InfoRow label="Investment ID" value={<span className="font-mono font-bold text-[#961A1C]">{investment.id}</span>} />
              <InfoRow label="Investment Product" value={investment.product} />
              <InfoRow label="Investment Type" value={investment.investmentType} />
              <InfoRow label="Currency" value={`${investment.currency} (ISO Code)`} />
              <InfoRow label="Principal Amount" value={<span className="font-bold text-gray-900 dark:text-white">{sym}{investment.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>} />
              <InfoRow label="Interest Rate" value={<span className="font-bold text-emerald-600">+{investment.interestRate}% p.a.</span>} />
              <InfoRow label="Compounding Method" value={investment.compoundingMethod} />
              <InfoRow label="Lifecycle Status" value={<InvestmentStatusBadge status={investment.status} />} />
              <InfoRow label="Operational State" value={<InvestmentStateBadge state={investment.state} />} />
              <InfoRow label="Created Date" value={investment.createdDate} />
              <InfoRow label="Start Date" value={investment.startDate} />
              <InfoRow label="Maturity Date" value={investment.maturityDate} />
              <InfoRow label="Investment Tenure" value={investment.tenure} />
              <InfoRow label="Relationship Manager" value={investment.relationshipManager} />
            </div>
          </div>

          {/* SECTION 3 — CUSTOMER RELATIONSHIP */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User size={18} className="text-[#961A1C]" />
                Customer Relationship
              </h3>
              <Link
                href={`/dashboard/retail/customers/${investment.customer.id}`}
                className="flex items-center gap-1 bg-[#961A1C] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#7a1517] transition shadow-xs"
              >
                View Customer Profile <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
                <span className="text-gray-400 font-medium text-[11px] block">Customer Name</span>
                <span className="font-bold text-gray-900 dark:text-white block text-sm">{investment.customer.name}</span>
                <span className="text-gray-400 text-[11px] font-mono">{investment.customer.id}</span>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
                <span className="text-gray-400 font-medium text-[11px] block">Primary Bank Account</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white block">{investment.customer.primaryAccountNumber} (Alpha 10)</span>
                <span className="text-gray-400 text-[11px]">{investment.customer.type}</span>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
                <span className="text-gray-400 font-medium text-[11px] block">Assigned Relationship Manager</span>
                <span className="font-bold text-gray-900 dark:text-white block">{investment.customer.relationshipManager}</span>
                <span className="text-emerald-600 font-semibold text-[11px]">Primary Officer</span>
              </div>
            </div>
          </div>

          {/* SECTION 4 — INVESTMENT SCHEDULE TIMELINE */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-[#961A1C]" />
              Investment Schedule & Yield Timeline
            </h3>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
              {investment.scheduleTimeline.map((item: any, idx: number) => (
                <div key={idx} className="relative group">
                  <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full ring-4 ring-white dark:ring-gray-800 ${item.status === 'Completed' ? 'bg-emerald-500' : item.status === 'Upcoming' ? 'bg-[#961A1C]' : 'bg-gray-400'}`} />
                  <div className="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-xl space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="font-bold text-xs text-gray-900 dark:text-white">{item.event}</span>
                      <span className="text-[11px] font-bold text-[#961A1C]">{item.amount}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{item.remarks}</p>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                      <span>Date: <strong className="text-gray-700 dark:text-gray-200">{item.date}</strong></span>
                      <Tag color={item.status === 'Completed' ? 'success' : item.status === 'Upcoming' ? 'warning' : 'default'} className="font-semibold text-[10px] uppercase">
                        {item.status}
                      </Tag>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5 — TRANSACTION HISTORY (HIDDEN SCROLLBAR) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard size={18} className="text-[#961A1C]" />
                Financial Transaction History
              </h3>
              <button
                onClick={() => message.info('Downloading full statement...')}
                className="text-xs font-semibold text-[#961A1C] hover:underline flex items-center gap-1"
              >
                View Full Statement <ChevronRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Channel</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {investment.transactions.map((txn: any) => (
                    <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition">
                      <td className="px-5 py-3 font-mono font-bold text-gray-900 dark:text-white">{txn.id}</td>
                      <td className="px-5 py-3 font-medium">{txn.type}</td>
                      <td className="px-5 py-3 font-bold text-emerald-600">{txn.amount}</td>
                      <td className="px-5 py-3 text-gray-500">{txn.channel}</td>
                      <td className="px-5 py-3">
                        <Tag color="success" className="font-semibold text-[10px]">{txn.status}</Tag>
                      </td>
                      <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{txn.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 7 — ADMINISTRATIVE AUDIT TRAIL (HIDDEN SCROLLBAR) */}
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
                    <th className="px-4 py-2.5">Action</th>
                    <th className="px-4 py-2.5">Reason</th>
                    <th className="px-4 py-2.5">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-mono">
                  {investment.auditTrail.map((audit: any, idx: number) => (
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

          {/* SECTION 8 — SUPPORTING DOCUMENTS */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileCheck size={18} className="text-[#961A1C]" />
                Supporting Investment Documents
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full font-bold">
                {investment.documents.length} Files
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {investment.documents.map((doc: any, idx: number) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold">
                      PDF
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{doc.name}</div>
                      <div className="text-[11px] text-gray-400">{doc.size} • {doc.date}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => message.info(`Downloading ${doc.name}...`)}
                    className="p-1.5 text-gray-500 hover:text-[#961A1C] transition rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <Download size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-6">

          {/* SECTION 6 — INVESTMENT ACTIVITY TIMELINE */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 mb-4 flex items-center gap-2">
              <History size={18} className="text-[#961A1C]" />
              Operational Activity Timeline
            </h3>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
              {investment.activityTimeline.map((item: any, idx: number) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#961A1C] ring-4 ring-white dark:ring-gray-800" />
                  <div className="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-xl space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="font-bold text-xs text-gray-900 dark:text-white">{item.administrator}</span>
                      <span className="text-[11px] text-gray-400">{item.date} at {item.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{item.remarks}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 9 — INTERNAL ADMIN NOTES */}
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

            {/* Form */}
            <div className="space-y-2">
              <Input.TextArea
                rows={3}
                placeholder="Add an internal administrator note (e.g. customer requested pre-maturity extension)..."
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
            <AlertTriangle className={activeModal?.includes('Cancel') ? 'text-red-500' : 'text-amber-500'} size={20} />
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
            danger={activeModal?.includes('Cancel')}
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
              You are executing <strong>{activeModal}</strong> for investment <strong className="text-[#961A1C]">{investment.id}</strong> belonging to <strong>{investment.customer.name}</strong>.
            </p>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Reason for Action / Treasury Reference <span className="text-red-500">*</span>
              </label>
              <Input.TextArea
                rows={3}
                placeholder="Enter administrative reason or treasury approval ticket reference..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

// --- HELPER STAT CARD ---
function StatCard({ title, value, highlight }: { title: string; value: string; highlight: string }) {
  const barColors: Record<string, string> = {
    red: 'bg-[#961A1C]',
    green: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    gray: 'bg-gray-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700/80 shadow-2xs relative overflow-hidden flex flex-col justify-between">
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] rounded-r-md ${barColors[highlight] || 'bg-[#961A1C]'}`} />
      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block truncate pl-1.5">{title}</span>
      <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight block mt-1 pl-1.5 font-sans">
        {value}
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
