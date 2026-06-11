'use client';

import React, { useState } from 'react';
import { Briefcase, FilePlus, ChevronRight, Filter, Search, CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';

export default function InvestmentsLoansPage() {
  const [activeTab, setActiveTab] = useState<'investments' | 'loans'>('investments');

  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investments & Loans</h1>
          <p className="text-gray-500 text-sm mt-1">Manage asset portfolios and credit facilities</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#961A1C] bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg hover:bg-red-100 transition">
            <FilePlus size={16} /> New Credit Facility
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg shadow-sm transition">
            <Briefcase size={16} /> Create Investment Product
          </button>
        </div>
      </div>

      {/* TOP METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Investment Value" value="₦ 8.5B" subtitle="+4.2% this month" trend="up" />
        <MetricCard title="Active Investments" value="3,450" subtitle="Across 4 products" />
        <MetricCard title="Total Loan Value" value="₦ 2.1B" subtitle="Active disbursed capital" />
        <MetricCard title="Pending Loans" value="45" subtitle="Requires approval" isAlert />
      </div>

      {/* TABS & FILTERS */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
        
        {/* Tab Header */}
        <div className="flex border-b border-gray-100 dark:border-gray-700 px-6 pt-4 bg-gray-50/50 dark:bg-gray-900/20">
          <button 
            onClick={() => setActiveTab('investments')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'investments' ? 'border-[#961A1C] text-[#961A1C]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Investments Portfolio
          </button>
          <button 
            onClick={() => setActiveTab('loans')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'loans' ? 'border-[#961A1C] text-[#961A1C]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Credit & Loans
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`}
              className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition w-fit">
            <Filter size={16} /> Filter by Status
          </button>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          {activeTab === 'investments' ? <InvestmentsTable /> : <LoansTable />}
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500">
          <span>Showing 1 to 10 of 45 entries</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md bg-[#961A1C] text-white font-medium">1</button>
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">2</button>
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Metrics Card ---
function MetricCard({ title, value, subtitle, trend, isAlert }: any) {
  return (
    <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-center relative overflow-hidden transition-all hover:shadow-md ${
      isAlert 
        ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' 
        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
    }`}>
      <p className="text-sm text-gray-500 font-medium mb-2">{title}</p>
      <h3 className={`text-2xl font-bold mb-1 ${isAlert ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}>{value}</h3>
      <span className={`text-xs ${isAlert ? 'text-red-500 font-semibold flex items-center gap-1' : 'text-gray-400'}`}>
        {isAlert && <AlertTriangle size={12}/>}
        {subtitle}
      </span>
    </div>
  );
}

// --- Investments Table ---
function InvestmentsTable() {
  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
        <tr>
          <th className="px-6 py-3 font-medium">User</th>
          <th className="px-6 py-3 font-medium">Product</th>
          <th className="px-6 py-3 font-medium">Amount</th>
          <th className="px-6 py-3 font-medium">Interest Rate</th>
          <th className="px-6 py-3 font-medium">Start Date</th>
          <th className="px-6 py-3 font-medium">Maturity Date</th>
          <th className="px-6 py-3 font-medium">Status</th>
          <th className="px-6 py-3 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
        <InvestmentRow user="Tech Innovators Ltd" product="Fixed Deposit (1yr)" amount="₦ 50,000,000" rate="12.5% p.a" start="10 Jan 2024" maturity="10 Jan 2025" status="Active" />
        <InvestmentRow user="Sarah Connor" product="Treasury Bills" amount="₦ 5,000,000" rate="9.0% p.a" start="15 Feb 2024" maturity="15 May 2024" status="Active" />
        <InvestmentRow user="John Doe" product="Target Savings" amount="₦ 250,000" rate="5.5% p.a" start="01 Mar 2024" maturity="01 Sep 2024" status="Pending" />
        <InvestmentRow user="Acme Corp" product="Commercial Paper" amount="₦ 100,000,000" rate="14.0% p.a" start="12 Dec 2023" maturity="12 Mar 2024" status="Matured" />
      </tbody>
    </table>
  );
}

function InvestmentRow({ user, product, amount, rate, start, maturity, status }: any) {
  const statusStyles: Record<string, string> = {
    Active: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    Pending: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
    Matured: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    Terminated: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{user}</td>
      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{product}</td>
      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{amount}</td>
      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{rate}</td>
      <td className="px-6 py-4 text-gray-500">{start}</td>
      <td className="px-6 py-4 text-gray-500">{maturity}</td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${statusStyles[status]}`}>{status}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          {status === 'Pending' && (
            <button className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 p-1.5 rounded" title="Approve">
              <CheckCircle size={16} />
            </button>
          )}
          {status === 'Active' && (
            <button className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded" title="Terminate">
              <XCircle size={16} />
            </button>
          )}
          <button className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded" title="View Details">
            <Eye size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// --- Loans Table ---
function LoansTable() {
  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
        <tr>
          <th className="px-6 py-3 font-medium">User</th>
          <th className="px-6 py-3 font-medium">Loan Amount</th>
          <th className="px-6 py-3 font-medium">Tenor</th>
          <th className="px-6 py-3 font-medium">Monthly Payment</th>
          <th className="px-6 py-3 font-medium">Date Requested</th>
          <th className="px-6 py-3 font-medium">Status</th>
          <th className="px-6 py-3 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
        <LoanRow user="David Lee" amount="₦ 2,500,000" tenor="12 Months" payment="₦ 230,000" date="28 Apr 2024" status="Pending" />
        <LoanRow user="Globex Logistics" amount="₦ 15,000,000" tenor="24 Months" payment="₦ 750,000" date="15 Mar 2024" status="Active" />
        <LoanRow user="Anita Patel" amount="₦ 500,000" tenor="6 Months" payment="₦ 90,000" date="02 Apr 2024" status="Active" />
        <LoanRow user="XYZ Retailers" amount="₦ 5,000,000" tenor="12 Months" payment="₦ 460,000" date="20 Feb 2024" status="Defaulted" />
      </tbody>
    </table>
  );
}

function LoanRow({ user, amount, tenor, payment, date, status }: any) {
  const statusStyles: Record<string, string> = {
    Active: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    Pending: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
    Defaulted: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    Completed: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{user}</td>
      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{amount}</td>
      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{tenor}</td>
      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{payment}</td>
      <td className="px-6 py-4 text-gray-500">{date}</td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${statusStyles[status]}`}>{status}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          {status === 'Pending' && (
            <>
              <button className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 p-1.5 rounded" title="Approve">
                <CheckCircle size={16} />
              </button>
              <button className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded" title="Reject">
                <XCircle size={16} />
              </button>
            </>
          )}
          {status !== 'Pending' && (
            <button className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1.5 rounded text-xs font-semibold" title="View Schedule">
              Schedule
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
