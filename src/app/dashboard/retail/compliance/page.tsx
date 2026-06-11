'use client';

import React, { useState } from 'react';
import { ShieldAlert, Search, Filter, Eye, CheckCircle, XCircle, FileQuestion, AlertTriangle, X, UserCheck, ImageIcon } from 'lucide-react';

const kycEntries = [
  { name: 'Michael Chen', level: 'Tier 2', date: '5 Hrs Ago', status: 'Pending' },
  { name: 'Maria Garcia', level: 'Tier 1', date: 'Today', status: 'Pending' },
  { name: 'David Lee', level: 'Tier 2', date: '24 Apr 2025', status: 'Approved' },
  { name: 'Anita Patel', level: 'Tier 1', date: '25 Apr 2025', status: 'Rejected' },
  { name: 'Sarah Connor', level: 'Tier 2', date: '20 Apr 2025', status: 'Approved' },
];

const statusStyles: Record<string, string> = { Approved: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400', Pending: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400', Rejected: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' };

export default function RetailCompliancePage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'aml'>('pending');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const filtered = kycEntries.filter(e => activeTab === 'aml' ? true : e.status.toLowerCase() === activeTab);

  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Retail Compliance</h1>
          <p className="text-gray-500 text-sm mt-1">KYC verification and AML monitoring for retail users</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <AlertTriangle size={16} /> 2 Active AML Alerts
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700 px-6 pt-4 bg-gray-50/50 dark:bg-gray-900/20">
          {(['pending', 'approved', 'rejected', 'aml'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === tab ? (tab === 'aml' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-[#961A1C] text-[#961A1C]') : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              {tab === 'aml' && <AlertTriangle size={14} className={activeTab === 'aml' ? 'text-red-500' : 'text-gray-400'} />}
              {tab === 'pending' ? 'Pending KYC (2)' : tab === 'aml' ? 'AML Alerts' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search by user name..." className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition">
            <Filter size={16} /> Filter
          </button>
        </div>
        <div className="overflow-x-auto min-h-[300px]">
          {activeTab !== 'aml' ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">KYC Level</th>
                  <th className="px-6 py-4 font-medium">Date Submitted</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filtered.map((entry, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{entry.name}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{entry.level}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{entry.date}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-bold rounded-md ${statusStyles[entry.status]}`}>{entry.status}</span></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedUser(entry)} className="text-[#961A1C] bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 ml-auto transition">
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6">
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-6 mb-4">
                <h3 className="font-bold text-red-800 dark:text-red-400 text-lg mb-2 flex items-center gap-2"><ShieldAlert /> High Priority AML Alerts</h3>
                <p className="text-red-700 dark:text-red-300 text-sm">Retail users who have triggered automated AML thresholds.</p>
              </div>
              <div className="p-4 border border-orange-200 dark:border-orange-900/30 rounded-xl bg-orange-50/50 dark:bg-orange-900/5 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded mr-2">Velocity Violation</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">James Smith</span>
                  <p className="text-xs text-gray-500 mt-1">5 transfers exceeding ₦1M in 2 hours.</p>
                </div>
                <button className="text-[#961A1C] font-semibold hover:underline text-xs">Investigate</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex justify-end animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <div>
                <h2 className="font-bold text-xl text-gray-900 dark:text-white">{selectedUser.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Retail • {selectedUser.level}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div>
                <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">Submitted Documents</h3>
                <div className="flex flex-col gap-3">
                  {[{ title: 'Government ID', icon: <UserCheck className="text-blue-500" /> }, { title: 'Selfie Match', icon: <UserCheck className="text-green-500" /> }].map((doc, i) => (
                    <div key={i} className="border border-gray-200 dark:border-gray-700 p-4 rounded-xl flex items-center justify-between bg-white dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">{doc.icon}</div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{doc.title}</p>
                      </div>
                      <Eye size={16} className="text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {selectedUser.status === 'Pending' && (
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                <button className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"><CheckCircle size={18} /> Approve KYC</button>
                <div className="flex gap-3">
                  <button className="flex-1 bg-white dark:bg-gray-800 border border-red-200 text-red-600 hover:bg-red-50 font-bold py-3 rounded-xl transition flex justify-center items-center gap-2"><XCircle size={18} /> Reject</button>
                  <button className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 font-bold py-3 rounded-xl transition flex justify-center items-center gap-2"><FileQuestion size={18} /> Request Info</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
