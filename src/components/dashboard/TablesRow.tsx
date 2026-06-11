'use client';

import React from 'react';
import { DownloadCloud, ExternalLink } from 'lucide-react';

export default function TablesRow({ role }: { role: string }) {
  const showTransactions = role === 'Super Admin' || role === 'Finance/Admin Ops';
  const showUsers = role === 'Super Admin' || role === 'Compliance Officer';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
      {/* Transactions Snapshot */}
      {showTransactions && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-lg">Transactions Snapshot</h3>
            <button className="text-sm font-semibold text-[#cc0000] hover:text-[#990000] flex items-center gap-1">
               View All <ExternalLink size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 whitespace-nowrap">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-l-lg">User</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold rounded-r-lg">Date</th>
                </tr>
              </thead>
              <tbody>
                <TransactionRow user="David Miller" type="Transfer" amount="₦140,500" status="Success" date="Today, 11:20 AM" />
                <TransactionRow user="Nexus Corp" type="Funding" amount="₦2,500,000" status="Success" date="Today, 09:12 AM" />
                <TransactionRow user="Emily Stone" type="Investment" amount="₦500,000" status="Pending" date="Yesterday" />
                <TransactionRow user="John Adams" type="Loan" amount="₦1,200,000" status="Success" date="Yesterday" />
                <TransactionRow user="FinTech LLC" type="Transfer" amount="₦8,400,000" status="Failed" date="2 Days Ago" />
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Users / Accounts */}
      {showUsers && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-lg">Recent Accounts</h3>
            <button className="text-sm font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1">
               Download CSV <DownloadCloud size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 whitespace-nowrap">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-l-lg">Name / Company</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">KYC Status</th>
                  <th className="px-4 py-3 font-semibold rounded-r-lg">Date Joined</th>
                </tr>
              </thead>
              <tbody>
                <UserRow name="Sarah Jenkins" type="Retail" kyc="Approved" date="Today" />
                <UserRow name="Alpha Traders Ltd" type="Corporate" kyc="Pending" date="Today" />
                <UserRow name="TechCorp NG" type="Corporate" kyc="Approved" date="Yesterday" />
                <UserRow name="Michael Obi" type="Retail" kyc="Rejected" date="Yesterday" />
                <UserRow name="Global Logistics" type="Corporate" kyc="Approved" date="3 Days Ago" />
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionRow({ user, type, amount, status, date }: any) {
  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'Success': return 'bg-emerald-100 text-emerald-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Failed': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition">
      <td className="px-4 py-3 font-medium text-gray-800">{user}</td>
      <td className="px-4 py-3">{type}</td>
      <td className="px-4 py-3 font-semibold text-[#1a1a2e]">{amount}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(status)}`}>{status}</span>
      </td>
      <td className="px-4 py-3 text-xs">{date}</td>
    </tr>
  );
}

function UserRow({ name, type, kyc, date }: any) {
  const getKycBadge = (k: string) => {
    switch (k) {
      case 'Approved': return 'bg-emerald-100 text-emerald-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Rejected': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition">
      <td className="px-4 py-3 font-medium text-gray-800">{name}</td>
      <td className="px-4 py-3">
        <span className="px-2 py-1 border border-gray-200 rounded text-xs font-medium text-gray-600 bg-white shadow-sm">{type}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getKycBadge(kyc)}`}>{kyc}</span>
      </td>
      <td className="px-4 py-3 text-xs">{date}</td>
    </tr>
  );
}
