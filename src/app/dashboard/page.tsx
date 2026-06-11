'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight, ArrowDownRight, Clock, Building2, Users,
  AlertCircle, CheckCircle2, XCircle, ChevronRight,
  MoreHorizontal, RefreshCw, Eye, UserCheck, Shield, Calendar
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

type Period = 'Today' | 'This Week' | 'This Month';

export default function BankingDashboardOverview() {
  const [chartPeriod, setChartPeriod] = useState('7D');
  const [activePeriod, setActivePeriod] = useState<Period>('Today');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [txnSegment, setTxnSegment] = useState<'Corporate' | 'Retail'>('Corporate');
  const [txnDirection, setTxnDirection] = useState<'Inflow' | 'Outflow'>('Inflow');

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
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
            {(['Today', 'This Week', 'This Month'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => { setActivePeriod(p); setDateFrom(''); setDateTo(''); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${activePeriod === p && !dateFrom ? 'bg-[#961A1C] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
              >{p}</button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
            <Calendar size={13} className="text-gray-400" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="text-xs text-gray-600 dark:text-gray-300 bg-transparent border-none outline-none w-28" />
            <span className="text-gray-300 text-xs">–</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="text-xs text-gray-600 dark:text-gray-300 bg-transparent border-none outline-none w-28" />
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title={`Corporate Accounts (${periodLabel})`}
          value="6"
          subtitle="+2 vs previous period"
          trend="up"
          icon={<Building2 size={18} />}
          linkHref="/dashboard/corporate/companies"
        />
        <MetricCard
          title={`Retail Accounts (${periodLabel})`}
          value="1,245"
          subtitle="+87 vs previous period"
          trend="up"
          icon={<Users size={18} />}
          linkHref="/dashboard/retail/users"
        />
        <MetricCard
          title="KYC Pending Approval"
          value="23"
          subtitle="Requires immediate action"
          isAlert
          icon={<UserCheck size={18} />}
          linkHref="/dashboard/compliance"
        />

        {/* Transactions card with inline filter */}
        <div className="p-5 rounded-xl border shadow-sm bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transition-all col-span-1 md:col-span-1 cursor-default relative">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-sm text-gray-500 font-medium">Transactions</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {txnSegment === 'Corporate' && txnDirection === 'Inflow' ? '₦ 23.5M' :
                 txnSegment === 'Corporate' && txnDirection === 'Outflow' ? '₦ 7.9M' :
                 txnSegment === 'Retail' && txnDirection === 'Inflow' ? '₦ 250K' : '₦ 730K'}
              </h3>
            </div>
            <Link href="/dashboard/transactions" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <Eye size={16} />
            </Link>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(['Corporate', 'Retail'] as const).map(s => (
              <button key={s} onClick={() => setTxnSegment(s)} className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${txnSegment === s ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{s}</button>
            ))}
            <span className="text-gray-200 dark:text-gray-600 text-xs self-center">|</span>
            {(['Inflow', 'Outflow'] as const).map(d => (
              <button key={d} onClick={() => setTxnDirection(d)} className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${txnDirection === d ? (d === 'Inflow' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400') : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                {d === 'Inflow' ? <ArrowUpRight size={10} className="inline mr-0.5" /> : <ArrowDownRight size={10} className="inline mr-0.5" />}{d}
              </button>
            ))}
          </div>
        </div>

        <MetricCard
          title="Staff / Admins"
          value="14"
          subtitle="Active platform users"
          trend="up"
          icon={<Shield size={18} />}
          linkHref="/dashboard/users"
        />
        <MetricCard
          title="Failed Transactions"
          value="12"
          subtitle="Requires attention"
          isAlert
          icon={<AlertCircle size={18} />}
          linkHref="/dashboard/transactions"
        />
      </div>

      {/* Transaction Flow Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Transaction Flow</h3>
          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
            {['24H', '7D', '30D'].map(period => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${chartPeriod === period ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >{period}</button>
            ))}
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={flowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} tickFormatter={(val) => `₦${val / 1000}k`} />
              <RechartsTooltip content={<FlowTooltip />} />
              <Area type="monotone" dataKey="inflow" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" strokeWidth={2} />
              <Area type="monotone" dataKey="outflow" stroke="#ef4444" fillOpacity={1} fill="url(#colorOut)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Live Activity Feed</h3>
          </div>
          <div className="flex flex-col gap-5 overflow-y-auto pr-2 max-h-[300px]">
            <ActivityItem text="User John Doe created ₦200,000 investment" time="2 mins ago" type="success" />
            <ActivityItem text="KYC approved for ABC Ltd" time="15 mins ago" type="success" />
            <ActivityItem text="Loan request submitted by Sarah Connor" time="1 hr ago" type="info" />
            <ActivityItem text="Transfer of ₦50,000 failed (Insufficient funds)" time="2 hrs ago" type="danger" />
            <ActivityItem text="New corporate account registered (TechCorp)" time="3 hrs ago" type="neutral" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4 h-full">
            <QuickActionBtn icon={<UserCheck size={20} />} label="Approve KYC" color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" linkHref="/dashboard/compliance" />
            <QuickActionBtn icon={<Building2 size={20} />} label="View Companies" color="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" linkHref="/dashboard/corporate/companies" />
            <QuickActionBtn icon={<Users size={20} />} label="Retail Users" color="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" linkHref="/dashboard/retail/users" />
            <QuickActionBtn icon={<Shield size={20} />} label="AML Alerts" color="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" linkHref="/dashboard/compliance" />
          </div>
        </div>
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
                <TransactionRow user="Alex Johnson" type="Transfer" amount="₦ 150,000" status="Success" date="Today, 10:45 AM" />
                <TransactionRow user="Maria Garcia" type="Funding" amount="₦ 50,000" status="Pending" date="Today, 09:12 AM" />
                <TransactionRow user="Tech Innovators" type="Loan" amount="₦ 2,000,000" status="Success" date="Yesterday, 14:30 PM" />
                <TransactionRow user="James Smith" type="Investment" amount="₦ 500,000" status="Failed" date="Yesterday, 11:20 AM" />
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

function MetricCard({ title, value, subtitle, trend, icon, isAlert, linkHref }: any) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  return (
    <div
      onClick={() => linkHref && router.push(linkHref)}
      className={`p-5 rounded-xl border shadow-sm flex flex-col justify-center relative transition-all hover:shadow-md cursor-pointer ${isAlert ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30 hover:border-red-300 dark:hover:border-red-700' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {icon && <div className={`p-1.5 rounded-lg ${isAlert ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>{icon}</div>}
          <p className="text-sm text-gray-500 font-medium">{title}</p>
        </div>
        <div className="relative">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            onBlur={() => setTimeout(() => setMenuOpen(false), 200)}
            className="dropdown-btn text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          ><MoreHorizontal size={16} /></button>
          {menuOpen && (
            <div className="dropdown-menu absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 animate-in fade-in zoom-in duration-200">
              <button onClick={e => { e.stopPropagation(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"><RefreshCw size={14} /> Refresh</button>
              {linkHref && <button onClick={e => { e.stopPropagation(); router.push(linkHref); }} className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"><Eye size={14} /> View Details</button>}
            </div>
          )}
        </div>
      </div>
      <h3 className={`text-2xl font-bold mb-1 mt-2 ${isAlert ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}>{value}</h3>
      <div className="flex items-center gap-1.5">
        {trend === 'up' && <ArrowUpRight size={16} className="text-green-500" />}
        {trend === 'down' && <ArrowDownRight size={16} className="text-red-500" />}
        <span className={`text-xs ${isAlert ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>{subtitle}</span>
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

function QuickActionBtn({ icon, label, color, linkHref }: any) {
  return (
    <Link href={linkHref || '#'} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition cursor-pointer ${color}`}>
      {icon}
      <span className="text-sm font-bold">{label}</span>
    </Link>
  );
}

const FlowTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg text-sm w-44">
        <p className="font-bold text-gray-400 mb-2">{label}</p>
        <div className="flex justify-between items-center mb-1">
          <span className="text-emerald-400 font-medium">Inflow:</span>
          <span className="font-bold">₦{payload[0].value.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-red-400 font-medium">Outflow:</span>
          <span className="font-bold">₦{payload[1].value.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

const flowData = [
  { time: '08:00', inflow: 12000, outflow: 8000 },
  { time: '10:00', inflow: 25000, outflow: 15000 },
  { time: '12:00', inflow: 18000, outflow: 22000 },
  { time: '14:00', inflow: 30000, outflow: 12000 },
  { time: '16:00', inflow: 15000, outflow: 28000 },
  { time: '18:00', inflow: 40000, outflow: 19000 },
];
