'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Drawer } from 'antd';
import { 
  ArrowLeft, CheckCircle2, ShieldAlert, FileText, 
  ChevronDown, User, Shield, AlertTriangle, 
  Lock, Clock, Mail, Phone, MapPin, Globe,
  Eye, AlertCircle, Briefcase, FileCheck, Smartphone, 
  Key, HelpCircle, MessageSquare, History, Send, 
  Laptop, X, XCircle, Check, CreditCard, DollarSign,
  UserCheck, ShieldCheck, Activity, Search
} from 'lucide-react';

// Mock Customer Profile
const customer = {
  id: 'CUST-8291',
  cif: 'CIF-0992348',
  name: 'John O. Doe',
  email: 'john.doe@example.com',
  phone: '+234 801 234 5678',
  bvn: '22345678901',
  nin: '12345678901',
  tier: 'Tier 3',
  status: 'Active',
  riskScore: 12,
  amlStatus: 'Passed',
  fraudScore: 'Low',
  pepStatus: 'No (Standard AML)',
  eddRequired: false,
  riskAttitude: 'Medium Risk (Balanced)',
  investmentHorizon: 'Medium Term (1-3 yrs)',
  pinStatus: 'Active (4-Digit PIN Set)',
  onboardingProgress: '100% Completed (5/5 Steps)',
  joined: '12 May 2026',
  branch: 'Victoria Island HQ',
  rm: 'Sarah Jenkins',
  lastLogin: 'Today, 14:32 (Lagos, NG)',
  balances: {
    totalAvailable: '₦2,450,000.00',
    totalLedger: '₦2,500,000.00',
  },
};

// Overview Activity Logs
const overviewActivities = [
  { id: 'ACT-01', action: 'Transferred ₦15,000.00 to Jane Doe (GTBank)', time: 'Today, 14:30', category: 'Transaction', status: 'Success' },
  { id: 'ACT-02', action: 'Logged in via iOS Mobile App (iPhone 15 Pro)', time: 'Today, 14:28', category: 'Security', status: 'Success' },
  { id: 'ACT-03', action: 'Received Salary Credit +₦150,000.00', time: 'Oct 22, 2026, 09:15', category: 'Transaction', status: 'Success' },
  { id: 'ACT-04', action: 'Support ticket TKT-8902 resolved by agent', time: 'Oct 19, 2026, 16:40', category: 'Support', status: 'Resolved' },
  { id: 'ACT-05', action: 'Tier 3 KYC Upgrade Approved by Compliance', time: 'May 12, 2026, 11:00', category: 'Compliance', status: 'Approved' },
];

// Accounts Data
const accounts = [
  { no: '0123456789', product: 'Savings Current', currency: 'NGN', ledger: '₦2,500,000.00', available: '₦2,450,000.00', status: 'Active' },
  { no: '0123456790', product: 'Domiciliary Account', currency: 'USD', ledger: '$1,250.50', available: '$1,250.50', status: 'Active' },
  { no: '0123456791', product: 'Fixed Target Savings', currency: 'NGN', ledger: '₦500,000.00', available: '₦500,000.00', status: 'Active' },
];

// Transactions Data
const transactions = [
  { id: 'TRX-1029', type: 'Transfer', amount: '-₦15,000.00', status: 'Success', date: 'Oct 24, 2026 14:30', counterparty: 'Jane Doe (GTBank)' },
  { id: 'TRX-1030', type: 'Deposit', amount: '+₦150,000.00', status: 'Success', date: 'Oct 22, 2026 09:15', counterparty: 'Salary Credit' },
  { id: 'TRX-1031', type: 'Bill Pay', amount: '-₦5,500.00', status: 'Success', date: 'Oct 21, 2026 18:20', counterparty: 'IKEDC Prepaid' },
  { id: 'TRX-1032', type: 'Transfer', amount: '-₦250,000.00', status: 'Failed', date: 'Oct 20, 2026 11:05', counterparty: 'James Smith (Access)' },
  { id: 'TRX-1033', type: 'Airtime', amount: '-₦2,000.00', status: 'Success', date: 'Oct 19, 2026 16:12', counterparty: 'MTN NG' },
];

// Loans Data
const loans = [
  { id: 'LOAN-4091', type: 'Personal Cash Loan', amount: '₦500,000.00', rate: '12% p.a.', monthly: '₦45,200.00', tenure: '12 Months', status: 'Active' },
  { id: 'LOAN-3012', type: 'Device Finance Loan', amount: '₦180,000.00', rate: '10% p.a.', monthly: '₦16,000.00', tenure: '6 Months', status: 'Paid Off' },
];

// Beneficiaries Data
const beneficiaries = [
  { name: 'Jane Doe', bank: 'Guaranty Trust Bank', accountNo: '0123984712', type: 'Saved Bank Transfer', addedDate: '14 Jun 2025', status: 'Verified' },
  { name: 'IKEDC Prepaid', bank: 'Ikeja Electric', accountNo: '45091238901', type: 'Utility Bill Payment', addedDate: '02 Jan 2026', status: 'Verified' },
  { name: 'Michael Johnson', bank: 'Access Bank', accountNo: '0091823746', type: 'Saved Bank Transfer', addedDate: '18 Mar 2026', status: 'Verified' },
];

// Devices Data
const devices = [
  { id: 'DEV-01', model: 'iPhone 15 Pro Max', os: 'iOS 17.4.1', ip: '102.89.23.11 (Lagos, NG)', lastActive: 'Today, 14:32', type: 'Primary Mobile App', status: 'Active' },
  { id: 'DEV-02', model: 'MacBook Pro 16"', os: 'macOS Sonoma', ip: '102.89.23.11 (Lagos, NG)', lastActive: 'Yesterday, 09:15', type: 'Web Browser', status: 'Active' },
  { id: 'DEV-03', model: 'Samsung Galaxy S23', os: 'Android 14', ip: '197.210.45.2 (Abuja, NG)', lastActive: '12 May 2026', type: 'Secondary Mobile App', status: 'Inactive' },
];

// Support Tickets Data
const supportTickets = [
  { id: 'TKT-8902', subject: 'Failed Airtime Purchase (₦2,000)', category: 'Transactions', priority: 'Medium', status: 'Resolved', date: 'Oct 19, 2026' },
  { id: 'TKT-7821', subject: 'Limit Upgrade Request to Tier 3', category: 'KYC & Limits', priority: 'High', status: 'Closed', date: 'May 12, 2026' },
  { id: 'TKT-6540', subject: 'Card Replacement Inquiry', category: 'Debit Cards', priority: 'Low', status: 'Closed', date: 'Jan 14, 2026' },
];

// Notes / Admin Approval Conversations
const initialNotes = [
  { id: 1, author: 'Sarah Jenkins', role: 'Relationship Manager', time: 'May 12, 2026 at 10:45 AM', text: 'Customer requested Tier 3 limit upgrade. Verified utility bill and national ID. Documents are clear and authentic.', badge: 'Verified' },
  { id: 2, author: 'Compliance Lead', role: 'Compliance Officer', time: 'May 12, 2026 at 11:00 AM', text: 'Reviewed BVN, NIN, and face matching scores (98.1%). Tier 3 upgrade approved.', badge: 'Approved' },
];

// Timeline Events
const timelineEvents = [
  { title: 'Transferred ₦15,000.00 to Jane Doe', time: 'Oct 24, 2026 - 14:30', cat: 'Transaction', desc: 'Transfer completed via Mobile Banking App.', icon: ArrowLeft, color: 'text-blue-500 bg-blue-50' },
  { title: 'Salary Deposit +₦150,000.00 Received', time: 'Oct 22, 2026 - 09:15', cat: 'Deposit', desc: 'Direct credit from Employer Payroll.', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
  { title: 'Support Ticket TKT-8902 Resolved', time: 'Oct 19, 2026 - 16:40', cat: 'Support', desc: 'Issue resolved: Airtime value re-queried and delivered.', icon: HelpCircle, color: 'text-purple-500 bg-purple-50' },
  { title: 'Tier 3 KYC Upgrade Approved', time: 'May 12, 2026 - 11:00', cat: 'Compliance', desc: 'Account tier upgraded to Tier 3 with ₦5M daily limit.', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-100' },
  { title: 'Customer Profile Created', time: 'Jan 15, 2025 - 09:00', cat: 'Onboarding', desc: 'Account registered at Victoria Island Branch.', icon: UserCheck, color: 'text-gray-600 bg-gray-100' },
];

// Audit Logs Data
const auditLogs = [
  { id: 'AUD-9012', actor: 'Sarah Jenkins (RM)', action: 'VIEW_CUSTOMER_PROFILE', ip: '102.89.23.11', module: 'Retail Customers', time: 'Today, 14:32', status: 'SUCCESS' },
  { id: 'AUD-8821', actor: 'System Automated', action: '2FA_VERIFICATION_CHECK', ip: '102.89.23.11', module: 'Security', time: 'Today, 14:28', status: 'SUCCESS' },
  { id: 'AUD-7712', actor: 'Compliance Officer', action: 'APPROVE_KYC_TIER3', ip: '197.210.45.2', module: 'Compliance', time: 'May 12, 2026', status: 'SUCCESS' },
  { id: 'AUD-6610', actor: 'John O. Doe (Client)', action: 'PASSWORD_CHANGE_SUCCESS', ip: '102.89.23.11', module: 'Auth', time: 'Jan 10, 2026', status: 'SUCCESS' },
];

// Tabs (Cards Removed)
const tabs = [
  'Overview', 'Accounts', 'Transactions', 'Loans', 
  'Beneficiaries', 'Compliance', 'Security', 'Devices', 
  'Support', 'Notes', 'Timeline', 'Audit Logs'
];

export default function AdvancedCustomerProfile() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [kycDrawerOpen, setKycDrawerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [notes, setNotes] = useState(initialNotes);
  const [newNoteText, setNewNoteText] = useState('');

  const openDocDrawer = (docName: string) => {
    setSelectedDoc(docName);
    setKycDrawerOpen(true);
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote = {
      id: Date.now(),
      author: 'Admin User',
      role: 'Super Admin',
      time: 'Just now',
      text: newNoteText,
      badge: 'Internal Note',
    };
    setNotes([newNote, ...notes]);
    setNewNoteText('');
  };

  return (
    <div className="h-full flex flex-col min-h-0 bg-transparent space-y-4 max-w-[1600px] mx-auto pb-12">
      
      {/* 1. MERGED HEADER & TABS CONTAINER */}
      <div className="flex flex-col space-y-4 pt-1">
        
        {/* Header Content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
          <div className="flex flex-col">
            
            {/* Back Icon on Top of Name */}
            <Link 
              href="/dashboard/retail/customers" 
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black dark:hover:text-white font-medium transition-colors mb-2"
            >
              <ArrowLeft size={16} /> Back to Customer Directory
            </Link>

            {/* Customer Name: Large size, font-normal */}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-normal text-gray-900 dark:text-white tracking-tight">
                {customer.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-xs font-semibold uppercase">
                {customer.status}
              </span>
            </div>

            {/* BVN and Account Number Under Name */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-mono mt-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="text-gray-400 font-sans font-medium">BVN:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{customer.bvn}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="text-gray-400 font-sans font-medium">Account No:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">0123456789</span>
              </span>
              <span>•</span>
              <span className="text-gray-400 font-sans font-medium">{customer.tier}</span>
            </div>

          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <button className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 shadow-2xs">
              <Lock size={14} className="text-red-500" /> Freeze Account
            </button>
            <button className="px-3.5 py-2 text-xs font-semibold text-white bg-black hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
              Actions <ChevronDown size={14}/>
            </button>
          </div>
        </div>

        {/* Merged Tab Strip (Cards Removed) */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-transparent shrink-0">
          <div className="flex overflow-x-auto hide-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-black text-black dark:text-white dark:border-white font-bold' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 2. TAB WORKSPACE */}
      <div className="flex-1 min-h-0">
        
        {/* TAB 1: OVERVIEW (ALL IN ONE UNIFIED PANEL WITH ACTIVITY LOGS) */}
        {activeTab === 'Overview' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-2xs space-y-8">
            
            {/* Unified 3-Column Overview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800">
              
              {/* Column 1: Identity & Contact */}
              <div className="md:col-span-4 space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-800 dark:text-gray-200 font-bold text-lg">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">Customer ID: {customer.id}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Joined {customer.joined}</div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <Mail size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate">{customer.email}</span>
                    <CheckCircle2 size={12} className="text-emerald-500 ml-auto shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <Phone size={14} className="text-gray-400 shrink-0" />
                    <span>{customer.phone}</span>
                    <CheckCircle2 size={12} className="text-emerald-500 ml-auto shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 font-mono">
                    <span className="text-gray-400 font-sans font-medium text-[11px]">BVN:</span>
                    <span>{customer.bvn}</span>
                    <CheckCircle2 size={12} className="text-emerald-500 ml-auto shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 font-mono">
                    <span className="text-gray-400 font-sans font-medium text-[11px]">NIN:</span>
                    <span>{customer.nin}</span>
                    <CheckCircle2 size={12} className="text-emerald-500 ml-auto shrink-0" />
                  </div>
                </div>
              </div>

              {/* Column 2: Health & Status */}
              <div className="md:col-span-4 md:pl-8 space-y-4 pt-6 md:pt-0">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Briefcase size={14} className="text-gray-400" /> Customer Health & Status
                </h3>
                
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-800">
                    <span className="text-gray-500">Tier Level</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{customer.tier}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-800">
                    <span className="text-gray-500">Risk Score</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                      {customer.riskScore} / 100 (Low)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-800">
                    <span className="text-gray-500">AML Clearance</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{customer.amlStatus}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-800">
                    <span className="text-gray-500">Fraud Flag</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{customer.fraudScore}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500">Preferred Branch</span>
                    <span className="font-semibold text-gray-900 dark:text-white truncate">{customer.branch}</span>
                  </div>
                </div>
              </div>

              {/* Column 3: Personal Details */}
              <div className="md:col-span-4 md:pl-8 space-y-4 pt-6 md:pt-0">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <User size={14} className="text-gray-400" /> Personal Details
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-800">
                    <span className="text-gray-500">Gender</span>
                    <span className="font-semibold text-gray-900 dark:text-white">Male</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-800">
                    <span className="text-gray-500">Date of Birth</span>
                    <span className="font-semibold text-gray-900 dark:text-white">14 Aug 1985 (40 yrs)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-800">
                    <span className="text-gray-500">Nationality</span>
                    <span className="font-semibold text-gray-900 dark:text-white">Nigerian</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-800">
                    <span className="text-gray-500">Occupation</span>
                    <span className="font-semibold text-gray-900 dark:text-white">Software Engineer</span>
                  </div>
                  <div className="flex justify-between items-start py-1">
                    <span className="text-gray-500 shrink-0">Address</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-right ml-2">14 Adeola Odeku St, VI, Lagos</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Financial Balances Ribbon */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Total Available Balance</span>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{customer.balances.totalAvailable}</h4>
              </div>
              <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Total Ledger Balance</span>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{customer.balances.totalLedger}</h4>
              </div>
              <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Assigned RM</span>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1">{customer.rm}</h4>
              </div>
              <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Last Login Location</span>
                <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1 truncate">{customer.lastLogin}</h4>
              </div>
            </div>

            {/* ONBOARDING & RISK SUITABILITY PROFILE (FROM CUSTOMER SIGNUP FLOW) */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={14} className="text-gray-400" /> Onboarding & Risk Suitability Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">PEP Declaration</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{customer.pepStatus}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">Cleared</span>
                  </div>
                </div>
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Risk Profile Attitude</span>
                  <div className="text-xs font-bold text-gray-900 dark:text-white mt-1">{customer.riskAttitude}</div>
                </div>
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Investment Horizon</span>
                  <div className="text-xs font-bold text-gray-900 dark:text-white mt-1">{customer.investmentHorizon}</div>
                </div>
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Transaction PIN</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{customer.pinStatus}</span>
                    <button className="text-[10px] text-red-600 hover:underline font-semibold">Reset PIN</button>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIVITY LOGS (INCLUDED IN OVERVIEW AS REQUESTED) */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity size={16} className="text-black dark:text-white" /> Recent Activity Logs
                </h3>
                <span className="text-xs font-semibold text-gray-400">Showing last 5 events</span>
              </div>
              
              <div className="overflow-x-auto border border-gray-100 dark:border-gray-800 rounded-xl">
                <table className="w-full text-left whitespace-nowrap text-xs">
                  <thead className="bg-gray-50/80 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Log ID</th>
                      <th className="px-4 py-2.5 font-semibold">Activity Description</th>
                      <th className="px-4 py-2.5 font-semibold">Category</th>
                      <th className="px-4 py-2.5 font-semibold">Timestamp</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {overviewActivities.map(act => (
                      <tr key={act.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                        <td className="px-4 py-2.5 font-mono text-[11px] text-gray-400">{act.id}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{act.action}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px]">
                            {act.category}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">{act.time}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={10} /> {act.status}
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

        {/* TAB 2: ACCOUNTS (WHITE BACKGROUND TABLE CONTAINER) */}
        {activeTab === 'Accounts' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Customer Account Directory</h2>
              <span className="text-xs text-gray-500 font-medium">3 Linked Accounts</span>
            </div>
            <table className="w-full text-left whitespace-nowrap text-xs">
              <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <tr className="font-semibold uppercase tracking-wider text-[11px]">
                  <th className="px-6 py-3">Account No</th>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Currency</th>
                  <th className="px-6 py-3 text-right">Ledger Balance</th>
                  <th className="px-6 py-3 text-right">Available Balance</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {accounts.map(acc => (
                  <tr key={acc.no} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                    <td className="px-6 py-3.5 font-mono font-bold text-gray-900 dark:text-white">{acc.no}</td>
                    <td className="px-6 py-3.5 text-gray-700 dark:text-gray-300 font-medium">{acc.product}</td>
                    <td className="px-6 py-3.5 text-gray-500">{acc.currency}</td>
                    <td className="px-6 py-3.5 text-right font-medium text-gray-900 dark:text-white">{acc.ledger}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-gray-900 dark:text-white">{acc.available}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {acc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: TRANSACTIONS (WHITE BACKGROUND TABLE CONTAINER) */}
        {activeTab === 'Transactions' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Transaction History</h2>
              <span className="text-xs text-gray-500 font-medium">Showing last 5 transactions</span>
            </div>
            <table className="w-full text-left whitespace-nowrap text-xs">
              <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <tr className="font-semibold uppercase tracking-wider text-[11px]">
                  <th className="px-6 py-3">Transaction ID</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Counterparty / Details</th>
                  <th className="px-6 py-3">Date & Time</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {transactions.map(trx => (
                  <tr key={trx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                    <td className="px-6 py-3.5 font-mono text-gray-500">{trx.id}</td>
                    <td className="px-6 py-3.5 font-semibold text-gray-900 dark:text-white">{trx.type}</td>
                    <td className="px-6 py-3.5 text-gray-700 dark:text-gray-300">{trx.counterparty}</td>
                    <td className="px-6 py-3.5 text-gray-500">{trx.date}</td>
                    <td className={`px-6 py-3.5 text-right font-bold tabular-nums ${trx.amount.startsWith('+') ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                      {trx.amount}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        trx.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: LOANS (TABLE FORMAT WITH WHITE BACKGROUND) */}
        {activeTab === 'Loans' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Credit & Loan Facilities</h2>
              <span className="text-xs text-gray-500 font-medium">2 Active/Historical Facilities</span>
            </div>
            <table className="w-full text-left whitespace-nowrap text-xs">
              <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <tr className="font-semibold uppercase tracking-wider text-[11px]">
                  <th className="px-6 py-3">Loan ID</th>
                  <th className="px-6 py-3">Facility Type</th>
                  <th className="px-6 py-3 text-right">Principal Amount</th>
                  <th className="px-6 py-3">Interest Rate</th>
                  <th className="px-6 py-3 text-right">Monthly Repayment</th>
                  <th className="px-6 py-3">Tenure</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loans.map(loan => (
                  <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                    <td className="px-6 py-3.5 font-mono text-gray-500">{loan.id}</td>
                    <td className="px-6 py-3.5 font-semibold text-gray-900 dark:text-white">{loan.type}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-gray-900 dark:text-white">{loan.amount}</td>
                    <td className="px-6 py-3.5 text-gray-600 dark:text-gray-300">{loan.rate}</td>
                    <td className="px-6 py-3.5 text-right font-semibold text-gray-800 dark:text-gray-200">{loan.monthly}</td>
                    <td className="px-6 py-3.5 text-gray-500">{loan.tenure}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        loan.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: BENEFICIARIES (TABLE FORMAT WITH WHITE BACKGROUND) */}
        {activeTab === 'Beneficiaries' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Saved Beneficiaries</h2>
              <span className="text-xs text-gray-500 font-medium">3 Saved Beneficiaries</span>
            </div>
            <table className="w-full text-left whitespace-nowrap text-xs">
              <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <tr className="font-semibold uppercase tracking-wider text-[11px]">
                  <th className="px-6 py-3">Beneficiary Name</th>
                  <th className="px-6 py-3">Bank / Institution</th>
                  <th className="px-6 py-3">Account Number</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Added Date</th>
                  <th className="px-6 py-3">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {beneficiaries.map((b, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                    <td className="px-6 py-3.5 font-bold text-gray-900 dark:text-white">{b.name}</td>
                    <td className="px-6 py-3.5 text-gray-700 dark:text-gray-300 font-medium">{b.bank}</td>
                    <td className="px-6 py-3.5 font-mono text-gray-900 dark:text-white">{b.accountNo}</td>
                    <td className="px-6 py-3.5 text-gray-500">{b.type}</td>
                    <td className="px-6 py-3.5 text-gray-500">{b.addedDate}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={10} /> {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 6: COMPLIANCE & COMPREHENSIVE KYC DRAWER */}
        {activeTab === 'Compliance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* KYC Documents */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileCheck size={16} /> Verified KYC Documents
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Tier 3 Verified
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:border-black transition">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md">
                        <FileText size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900 dark:text-white">National Identity Card (NIN)</div>
                        <div className="text-[11px] text-gray-400">Doc No: 12345678901 • Uploaded 12 May 2026</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => openDocDrawer('National Identity Card (NIN)')}
                      className="flex items-center gap-1 text-xs font-semibold bg-black text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition"
                    >
                      <Eye size={13} /> View File
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:border-black transition">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md">
                        <FileText size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900 dark:text-white">Utility Bill (Lagos Water Corp)</div>
                        <div className="text-[11px] text-gray-400">Doc No: LWC-90812 • Verified Address</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => openDocDrawer('Utility Bill (Lagos Water Corp)')}
                      className="flex items-center gap-1 text-xs font-semibold bg-black text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition"
                    >
                      <Eye size={13} /> View File
                    </button>
                  </div>
                </div>
              </div>

              {/* AML & Watchlist Checks */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xs">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ShieldAlert size={16} /> Automated AML & Sanctions Screening
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                    <span className="text-gray-600 dark:text-gray-400">UN & OFAC Sanctions Screening</span>
                    <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Clear (0 Matches)</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                    <span className="text-gray-600 dark:text-gray-400">Politically Exposed Persons (PEP) Check</span>
                    <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Clear</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                    <span className="text-gray-600 dark:text-gray-400">Adverse Media & Negative News</span>
                    <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Clear</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">BVN & Biometric Match Score</span>
                    <span className="font-bold text-gray-900 dark:text-white">99.4% Match</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 7: SECURITY (2FA STATUS, SECURITY QUESTIONS, ETC.) */}
        {activeTab === 'Security' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xs space-y-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={16} /> Customer Security & Authentication Credentials
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 2FA Status */}
              <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Smartphone size={15} /> Two-Factor Authentication (2FA)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active & Configured
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Primary Method: <span className="font-semibold text-gray-800 dark:text-gray-200">Google Authenticator (TOTP)</span></div>
                  <div>Secondary Fallback: <span className="font-semibold text-gray-800 dark:text-gray-200">SMS OTP (+234 801 *** 5678)</span></div>
                </div>
                <button className="text-xs font-semibold text-red-600 hover:underline pt-1">
                  Reset 2FA Configuration
                </button>
              </div>

              {/* Security Questions */}
              <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Key size={15} /> Security Questions
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    3 Configured
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Last Updated: <span className="font-semibold text-gray-800 dark:text-gray-200">12 Jan 2026</span></div>
                  <div>Status: <span className="font-semibold text-gray-800 dark:text-gray-200">Encrypted in Vault</span></div>
                </div>
                <button className="text-xs font-semibold text-gray-900 dark:text-white hover:underline pt-1">
                  Require Security Question Reset
                </button>
              </div>

            </div>

            {/* Password & Biometrics Info */}
            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-gray-500">Password Last Changed</span>
                <div className="font-bold text-gray-900 dark:text-white mt-0.5">14 Days Ago (Oct 10, 2026)</div>
              </div>
              <div>
                <span className="text-gray-500">Biometric Authentication</span>
                <div className="font-bold text-emerald-600 mt-0.5">FaceID & Fingerprint Active</div>
              </div>
              <div>
                <span className="text-gray-500">Failed Login Attempts</span>
                <div className="font-bold text-gray-900 dark:text-white mt-0.5">0 Failed Attempts (Clean)</div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 8: DEVICES (TABLE OF DEVICES WITH WHITE BACKGROUND) */}
        {activeTab === 'Devices' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Registered Customer Devices</h2>
              <span className="text-xs text-gray-500 font-medium">3 Registered Devices</span>
            </div>
            <table className="w-full text-left whitespace-nowrap text-xs">
              <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <tr className="font-semibold uppercase tracking-wider text-[11px]">
                  <th className="px-6 py-3">Device Model</th>
                  <th className="px-6 py-3">Operating System</th>
                  <th className="px-6 py-3">IP Address & Location</th>
                  <th className="px-6 py-3">Device Type</th>
                  <th className="px-6 py-3">Last Active</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {devices.map(dev => (
                  <tr key={dev.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                    <td className="px-6 py-3.5 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Laptop size={14} className="text-gray-400" /> {dev.model}
                    </td>
                    <td className="px-6 py-3.5 text-gray-700 dark:text-gray-300">{dev.os}</td>
                    <td className="px-6 py-3.5 font-mono text-gray-500">{dev.ip}</td>
                    <td className="px-6 py-3.5 text-gray-600 dark:text-gray-300">{dev.type}</td>
                    <td className="px-6 py-3.5 text-gray-500">{dev.lastActive}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        dev.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {dev.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button className="text-xs font-semibold text-red-600 hover:underline">Revoke</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 9: SUPPORT (TABLE OF TICKETS WITH WHITE BACKGROUND) */}
        {activeTab === 'Support' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Customer Support Tickets</h2>
              <span className="text-xs text-gray-500 font-medium">3 Raised Tickets</span>
            </div>
            <table className="w-full text-left whitespace-nowrap text-xs">
              <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <tr className="font-semibold uppercase tracking-wider text-[11px]">
                  <th className="px-6 py-3">Ticket ID</th>
                  <th className="px-6 py-3">Subject / Issue</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Created Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {supportTickets.map(tkt => (
                  <tr key={tkt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                    <td className="px-6 py-3.5 font-mono text-gray-500">{tkt.id}</td>
                    <td className="px-6 py-3.5 font-bold text-gray-900 dark:text-white">{tkt.subject}</td>
                    <td className="px-6 py-3.5 text-gray-600 dark:text-gray-300">{tkt.category}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700">
                        {tkt.priority}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500">{tkt.date}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {tkt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 10: NOTES (ADMIN APPROVAL CONVERSATIONS & INTERNAL NOTES) */}
        {activeTab === 'Notes' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xs space-y-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={16} /> Admin Approval Conversations & Internal Audit Notes
            </h2>

            {/* Add Note Input Box */}
            <div className="space-y-2">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Write an internal note or approval message..."
                rows={3}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs focus:outline-none focus:border-black transition"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddNote}
                  className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                >
                  <Send size={13} /> Post Note
                </button>
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-4 pt-2">
              {notes.map(note => (
                <div key={note.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{note.author}</span>
                      <span className="text-[11px] text-gray-400">({note.role})</span>
                    </div>
                    <span className="text-[11px] text-gray-400">{note.time}</span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{note.text}</p>
                  <div>
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      {note.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 11: TIMELINE (NICE VISUAL TIMELINE) */}
        {activeTab === 'Timeline' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xs">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <History size={16} /> Customer Lifecycle & Activity Timeline
            </h2>

            <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-800 space-y-8">
              {timelineEvents.map((evt, idx) => {
                const IconComponent = evt.icon;
                return (
                  <div key={idx} className="relative group">
                    {/* Circle Node */}
                    <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-2 border-black dark:border-white flex items-center justify-center shadow-xs">
                      <IconComponent size={12} className="text-black dark:text-white" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{evt.title}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                          {evt.cat}
                        </span>
                        <span className="text-[11px] text-gray-400 ml-auto">{evt.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{evt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 12: AUDIT LOGS (NICE ENTERPRISE AUDIT TRAIL TABLE) */}
        {activeTab === 'Audit Logs' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Security & Administrative Audit Logs</h2>
              <span className="text-xs text-gray-500 font-medium">Immutable System Event Logs</span>
            </div>
            <table className="w-full text-left whitespace-nowrap text-xs">
              <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <tr className="font-semibold uppercase tracking-wider text-[11px]">
                  <th className="px-6 py-3">Log ID</th>
                  <th className="px-6 py-3">Actor / Admin</th>
                  <th className="px-6 py-3">Action Performed</th>
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3">Module</th>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                    <td className="px-6 py-3.5 font-mono text-gray-400">{log.id}</td>
                    <td className="px-6 py-3.5 font-bold text-gray-900 dark:text-white">{log.actor}</td>
                    <td className="px-6 py-3.5 font-mono font-semibold text-gray-800 dark:text-gray-200">{log.action}</td>
                    <td className="px-6 py-3.5 font-mono text-gray-500">{log.ip}</td>
                    <td className="px-6 py-3.5 text-gray-600 dark:text-gray-300">{log.module}</td>
                    <td className="px-6 py-3.5 text-gray-500">{log.time}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* COMPREHENSIVE KYC DOCUMENT DRAWER */}
      <Drawer
        title={<span className="text-sm font-bold text-gray-900 dark:text-white">KYC Document & Verification Audit File</span>}
        placement="right"
        width={540}
        onClose={() => setKycDrawerOpen(false)}
        open={kycDrawerOpen}
        extra={
          <button 
            onClick={() => setKycDrawerOpen(false)}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        }
      >
        <div className="space-y-6 text-xs text-gray-700 dark:text-gray-300">
          
          {/* Header Banner */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 space-y-1">
            <div className="text-xs font-bold text-gray-900 dark:text-white">{selectedDoc}</div>
            <div className="text-[11px] text-gray-500">Document ID: KYC-DOC-908123 • Verified by Compliance Officer</div>
          </div>

          {/* User Photo & Biometric Box */}
          <div className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
            <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-xl text-gray-600 dark:text-gray-300 shrink-0">
              JD
            </div>
            <div className="space-y-1">
              <div className="font-bold text-sm text-gray-900 dark:text-white">{customer.name}</div>
              <div className="text-xs text-gray-500">BVN: {customer.bvn} • NIN: {customer.nin}</div>
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                <CheckCircle2 size={11} /> Face Match Score: 98.1% (High Confidence)
              </div>
            </div>
          </div>

          {/* Document Metadata Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">Verification Details</h4>
            
            <div className="space-y-2 border border-gray-100 dark:border-gray-800 rounded-xl p-3.5">
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-800">
                <span className="text-gray-500">Document Type</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedDoc}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-800">
                <span className="text-gray-500">Document Number</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">12345678901</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-800">
                <span className="text-gray-500">Issuing Authority</span>
                <span className="font-semibold text-gray-900 dark:text-white">NIMC Federal Republic of Nigeria</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-800">
                <span className="text-gray-500">Address Match</span>
                <span className="font-semibold text-emerald-600">Verified (14 Adeola Odeku St)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Sanctions / PEP Status</span>
                <span className="font-semibold text-emerald-600">Clear (0 Hits)</span>
              </div>
            </div>
          </div>

          {/* Document Preview Box */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">Document Image Preview</h4>
            <div className="h-44 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center p-4">
              <FileText size={36} className="text-gray-400 mb-2" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedDoc} Preview</span>
              <span className="text-[11px] text-gray-400 mt-0.5">High-Resolution Encrypted File (PDF/PNG)</span>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button className="flex-1 py-2 bg-black text-white hover:bg-gray-800 text-xs font-semibold rounded-lg transition">
              Download Audit File
            </button>
            <button className="py-2 px-4 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 text-xs font-semibold rounded-lg transition">
              Re-Verify
            </button>
          </div>

        </div>
      </Drawer>

    </div>
  );
}
