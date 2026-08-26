'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight, ArrowDownRight, Clock, Building2, Users,
  AlertCircle, CheckCircle2, XCircle, ChevronRight,
  MoreHorizontal, RefreshCw, Eye, UserCheck, Shield, Calendar, Layers
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import TransactionFlowSection from '@/components/dashboard/TransactionFlowSection';
import LiveActivitySection from '@/components/dashboard/LiveActivitySection';
import QuickActionsSection from '@/components/dashboard/QuickActionsSection';
import { Dropdown, Tag, Select, MenuProps } from 'antd';

type Period = 'Today' | 'This Week' | 'This Month';

const getCardMenu = (cardTitle: string): MenuProps => ({
  items: [
    { key: '1', label: `View ${cardTitle} Details` },
    { key: '2', label: 'Export Dataset' },
    { key: '3', label: 'Configure Thresholds' },
  ],
});

export default function BankingDashboardOverview() {
  const router = useRouter();
  const [activePeriod, setActivePeriod] = useState<Period>('Today');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [txnSegment, setTxnSegment] = useState<'Corporate' | 'Retail'>('Corporate');
  const [txnDirection, setTxnDirection] = useState<'Inflow' | 'Outflow'>('Inflow');
  const [accountSegment, setAccountSegment] = useState<'all' | 'corporate' | 'retail'>('all');

  const periodLabel = dateFrom && dateTo ? `${dateFrom} – ${dateTo}` : activePeriod;

  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time system health and operational metrics</p>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1 items-center">
            {(['Today', 'This Week', 'This Month'] as Period[]).map((p) =>
              activePeriod === p && !dateFrom ? (
                <Tag
                  key={p}
                  color="red"
                  className="!bg-[#961A1C] !text-white !border-none font-semibold text-xs px-3 py-1 rounded-md cursor-pointer m-0 shadow-xs"
                  onClick={() => {
                    setActivePeriod(p);
                    setDateFrom('');
                    setDateTo('');
                  }}
                >
                  {p}
                </Tag>
              ) : (
                <button
                  key={p}
                  onClick={() => {
                    setActivePeriod(p);
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="px-3 py-1 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
                >
                  {p}
                </button>
              )
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
            <Calendar size={13} className="text-gray-400" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="text-xs text-gray-600 dark:text-gray-300 bg-transparent border-none outline-none w-28" />
            <span className="text-gray-300 text-xs">–</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="text-xs text-gray-600 dark:text-gray-300 bg-transparent border-none outline-none w-28" />
          </div>
        </div>
      </div>

      {/* Metric Cards (Styled like /dashboard/retail with left bar, tag, and dropdowns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: COMBINED CORPORATE & RETAIL ACCOUNTS WITH SELECT DROPDOWN */}
        <div
          onClick={() => {
            if (accountSegment === 'corporate') router.push('/dashboard/corporate/companies');
            else if (accountSegment === 'retail') router.push('/dashboard/retail/users');
            else router.push('/dashboard/corporate/companies');
          }}
          className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-[#961A1C] rounded-r-md" />

          {/* Top Row: Today Tag + Account Dropdown Selector + Options Menu */}
          <div className="flex items-center justify-between pl-2 gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
              <Tag color="volcano" className="!bg-[#961A1C]/10 !text-[#961A1C] !border-[#961A1C]/20 font-semibold text-xs rounded-md m-0">
                {periodLabel}
              </Tag>
              <Select
                value={accountSegment}
                onChange={(val) => setAccountSegment(val)}
                size="small"
                className="w-32 text-xs font-semibold"
                options={[
                  { value: 'all', label: 'All Accounts' },
                  { value: 'corporate', label: 'Corporate' },
                  { value: 'retail', label: 'Retail' },
                ]}
              />
            </div>

            <Dropdown menu={getCardMenu('Accounts Overview')} trigger={['click']} placement="bottomRight">
              <button onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md transition shrink-0">
                <MoreHorizontal size={18} />
              </button>
            </Dropdown>
          </div>

          {/* Middle: Numeric Display */}
          <div className="my-3 pl-2">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight font-sans">
              {accountSegment === 'all' ? '1,251' : accountSegment === 'corporate' ? '6' : '1,245'}
            </h2>
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400 pl-2 pt-2 border-t border-gray-50 dark:border-gray-700/40">
            <div className="flex items-center gap-1.5 truncate">
              {accountSegment === 'corporate' ? (
                <Building2 size={15} className="text-gray-400 shrink-0" />
              ) : accountSegment === 'retail' ? (
                <Users size={15} className="text-gray-400 shrink-0" />
              ) : (
                <Layers size={15} className="text-gray-400 shrink-0" />
              )}
              <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                {accountSegment === 'all' ? 'Total Accounts' : accountSegment === 'corporate' ? 'Corporate' : 'Retail'}
              </span>
            </div>
            <span className="text-[11px] text-green-600 dark:text-green-400 font-semibold shrink-0">
              {accountSegment === 'all' ? '+89' : accountSegment === 'corporate' ? '+2' : '+87'}
            </span>
          </div>
        </div>

        {/* CARD 2: TRANSACTIONS WITH SEGMENT & DIRECTION SELECTORS */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-[#961A1C] rounded-r-md" />

          {/* Top Row: Today Tag + Segment/Direction buttons + Options Menu */}
          <div className="flex items-center justify-between pl-2 gap-1.5">
            <div className="flex items-center gap-1 flex-wrap">
              <Tag color="volcano" className="!bg-[#961A1C]/10 !text-[#961A1C] !border-[#961A1C]/20 font-semibold text-xs rounded-md m-0">
                {periodLabel}
              </Tag>
              <div className="flex gap-0.5 bg-gray-100 dark:bg-gray-700 p-0.5 rounded-md">
                {(['Corporate', 'Retail'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setTxnSegment(s)}
                    className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${txnSegment === s ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-0.5 bg-gray-100 dark:bg-gray-700 p-0.5 rounded-md">
                {(['Inflow', 'Outflow'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setTxnDirection(d)}
                    className={`px-1.5 py-0.5 text-[10px] font-semibold rounded transition ${
                      txnDirection === d
                        ? d === 'Inflow'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-600 text-white'
                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    {d === 'Inflow' ? <ArrowUpRight size={10} className="inline mr-0.5" /> : <ArrowDownRight size={10} className="inline mr-0.5" />}
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <Dropdown menu={getCardMenu('Transactions')} trigger={['click']} placement="bottomRight">
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md transition shrink-0">
                <MoreHorizontal size={18} />
              </button>
            </Dropdown>
          </div>

          {/* Middle: Numeric Display */}
          <div className="my-3 pl-2">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight font-sans">
              {txnSegment === 'Corporate' && txnDirection === 'Inflow' ? '23,500' :
               txnSegment === 'Corporate' && txnDirection === 'Outflow' ? '7,900' :
               txnSegment === 'Retail' && txnDirection === 'Inflow' ? '2,500' : '7,300'}
            </h2>
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 pt-2 border-t border-gray-50 dark:border-gray-700/40">
            <div className="flex items-center gap-1.5 truncate">
              <Eye size={15} className="text-gray-400 shrink-0" />
              <span className="truncate">{txnSegment} {txnDirection}</span>
            </div>
            <Link href="/dashboard/transactions" className="text-[11px] text-[#961A1C] font-semibold hover:underline shrink-0">
              View &rarr;
            </Link>
          </div>
        </div>

        {/* CARD 3: STAFF / ADMINS */}
        <MetricCard
          title="Staff / Admins"
          value="14"
          subtitle="Active platform users"
          trendText="+1 from last month"
          periodText={periodLabel}
          icon={<Shield size={15} className="text-gray-400 shrink-0" />}
          linkHref="/dashboard/users"
        />

        {/* CARD 4: FAILED TRANSACTIONS */}
        <MetricCard
          title="Failed Transactions"
          value="12"
          subtitle="Requires attention"
          periodText={periodLabel}
          isAlert
          icon={<AlertCircle size={15} className="text-red-500 shrink-0" />}
          linkHref="/dashboard/transactions"
        />

      </div>

      {/* Transaction Flow Chart */}
      <TransactionFlowSection />

      {/* Activity Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveActivitySection />
        <QuickActionsSection />
      </div>

      {/* Recent Transactions & Recent KYC Submissions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Recent Transactions</h3>
            <Link href="/dashboard/transactions" className="text-sm text-[#961A1C] font-semibold hover:underline flex items-center gap-1">View All <ChevronRight size={16} /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                <TransactionRow user="Alex Johnson" type="Transfer" amount="150,000" status="Success" date="Today, 10:45 AM" />
                <TransactionRow user="Maria Garcia" type="Funding" amount="50,000" status="Pending" date="Today, 09:12 AM" />
                <TransactionRow user="Tech Innovators" type="Loan" amount="2,000,000" status="Success" date="Yesterday, 14:30 PM" />
                <TransactionRow user="James Smith" type="Investment" amount="500,000" status="Failed" date="Yesterday, 11:20 AM" />
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent KYC Submissions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Recent KYC Submissions</h3>
            <Link href="/dashboard/compliance" className="text-sm text-[#961A1C] font-semibold hover:underline flex items-center gap-1">View All <ChevronRight size={16} /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Name / Company</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">KYC Level</th>
                  <th className="px-6 py-3 font-medium">Submitted</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                <KycSubmissionRow name="Globex Corp" type="Corporate" level="Tier 3" date="2 Hrs Ago" status="Pending" />
                <KycSubmissionRow name="Michael Chen" type="Retail" level="Tier 2" date="5 Hrs Ago" status="Pending" />
                <KycSubmissionRow name="Alpha Retailers" type="Corporate" level="Tier 3" date="Yesterday" status="Pending" />
                <KycSubmissionRow name="David Lee" type="Retail" level="Tier 2" date="24 Apr" status="Approved" />
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Subcomponents ---

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  trendText?: string;
  periodText?: string;
  icon: React.ReactNode;
  isAlert?: boolean;
  linkHref?: string;
  extraHeader?: React.ReactNode;
}

function MetricCard({
  title,
  value,
  subtitle,
  trendText,
  periodText = 'Today',
  icon,
  isAlert,
  linkHref,
  extraHeader,
}: MetricCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => linkHref && router.push(linkHref)}
      className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200 ${
        isAlert
          ? 'border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/10'
          : 'border-gray-100 dark:border-gray-700/80'
      } ${linkHref ? 'cursor-pointer' : ''}`}
    >
      {/* Small bar at middle left of the card in dark red (#961A1C) */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3.5px] bg-[#961A1C] rounded-r-md" />

      {/* Top Row: Tag / Extra Header on Left + Options Menu on Right */}
      <div className="flex items-center justify-between pl-2 gap-1.5 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tag color="volcano" className="!bg-[#961A1C]/10 !text-[#961A1C] !border-[#961A1C]/20 font-semibold text-xs rounded-md m-0">
            {periodText}
          </Tag>
          {extraHeader}
          {trendText && (
            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
              {trendText}
            </span>
          )}
        </div>

        <Dropdown menu={getCardMenu(title)} trigger={['click']} placement="bottomRight">
          <button
            onClick={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md transition shrink-0"
          >
            <MoreHorizontal size={18} />
          </button>
        </Dropdown>
      </div>

      {/* Middle: Numeric Display */}
      <div className="my-3 pl-2">
        <h2 className={`text-3xl font-semibold tracking-tight font-sans ${isAlert ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
          {value}
        </h2>
      </div>

      {/* Bottom Row: Icon + Subtitle text */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pl-2 pt-2 border-t border-gray-50 dark:border-gray-700/40">
        <div className="shrink-0">{icon}</div>
        <span className="truncate">{subtitle || title}</span>
      </div>
    </div>
  );
}

function ActivityItem({ text, time, type }: any) {
  const icons: Record<string, any> = {
    success: <CheckCircle2 size={16} className="text-green-500" />,
    danger: <XCircle size={16} className="text-red-500" />,
    info: <AlertCircle size={16} className="text-blue-500" />,
    neutral: <Clock size={16} className="text-gray-400" />
  };
  return (
    <div className="flex gap-3">
      <div className="mt-0.5">{icons[type]}</div>
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{text}</p>
        <p className="text-xs text-gray-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

function TransactionRow({ user, type, amount, status, date }: any) {
  const statusStyles: Record<string, string> = {
    Success: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    Pending: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
    Failed: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
  };
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer">
      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{user}</td>
      <td className="px-6 py-4 text-gray-500">{type}</td>
      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{amount}</td>
      <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-bold rounded-md ${statusStyles[status]}`}>{status}</span></td>
      <td className="px-6 py-4 text-gray-400 text-xs">{date}</td>
    </tr>
  );
}

function KycSubmissionRow({ name, type, level, date, status }: any) {
  const statusStyles: Record<string, string> = {
    Approved: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    Pending: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
    Rejected: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
  };
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer">
      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{name}</td>
      <td className="px-6 py-4">
        <span className="text-gray-500 flex items-center gap-1.5">
          {type === 'Corporate' ? <Building2 size={14} /> : <UserCheck size={14} />} {type}
        </span>
      </td>
      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{level}</td>
      <td className="px-6 py-4 text-gray-400 text-xs">{date}</td>
      <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-bold rounded-md ${statusStyles[status]}`}>{status}</span></td>
    </tr>
  );
}
