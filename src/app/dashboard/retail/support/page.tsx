'use client';

import React, { useState } from 'react';
import { 
  HeadphonesIcon, MessageSquare, CheckCircle, Clock, 
  Search, Filter, MoreVertical, Plus, ChevronLeft, ChevronRight, AlertCircle, AlertTriangle
} from 'lucide-react';

const mockTickets = [
  { id: 'TKT-10492', subject: 'Unable to fund wallet', customer: 'John Doe', priority: 'High', status: 'Open', updated: '10 mins ago' },
  { id: 'TKT-10493', subject: 'KYC Verification taking too long', customer: 'Jane Smith', priority: 'Medium', status: 'Pending', updated: '1 hour ago' },
  { id: 'TKT-10494', subject: 'Investment maturity inquiry', customer: 'Michael Johnson', priority: 'Low', status: 'Resolved', updated: '2 hours ago' },
  { id: 'TKT-10495', subject: 'Account locked after failed PIN', customer: 'Sarah Williams', priority: 'Critical', status: 'Escalated', updated: '5 mins ago' },
  { id: 'TKT-10496', subject: 'Transaction failed but debited', customer: 'David Brown', priority: 'High', status: 'Open', updated: '3 hours ago' },
  { id: 'TKT-10497', subject: 'How to upgrade to Tier 3?', customer: 'Emily Davis', priority: 'Low', status: 'Pending', updated: '4 hours ago' },
];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('Ticket List');

  const tabs = ['Ticket List', 'Escalated Tickets', 'Resolved Tickets', 'FAQ Management'];

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Center</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer inquiries, complaints, and support tickets.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 bg-[#961A1C] text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-[#7a1517] transition shadow-sm">
            <Plus size={16} /> Create Ticket
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Open Tickets" value="24" icon={<MessageSquare className="text-blue-500" />} trend="+3 today" trendUp={false} />
        <KpiCard title="Pending Tickets" value="12" icon={<Clock className="text-yellow-500" />} trend="-5 since yesterday" trendUp={true} />
        <KpiCard title="Resolved Today" value="86" icon={<CheckCircle className="text-emerald-500" />} trend="+12% vs avg" trendUp={true} />
        <KpiCard title="Avg Response Time" value="14m" icon={<HeadphonesIcon className="text-purple-500" />} trend="-2m this week" trendUp={true} />
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col flex-1 min-h-0">
        
        {/* Tabs & Search */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar border-b border-transparent lg:border-none">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap pb-2 lg:pb-0 text-sm font-medium transition-colors relative ${
                  activeTab === tab 
                    ? 'text-[#961A1C]' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-[-17px] lg:bottom-[-25px] left-0 right-0 h-0.5 bg-[#961A1C] rounded-t-full"></span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
              />
            </div>
            <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900/80 backdrop-blur z-10">
              <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-800">
              {mockTickets.map((ticket, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group cursor-pointer">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{ticket.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white max-w-xs truncate" title={ticket.subject}>
                    {ticket.subject}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{ticket.customer}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
                      ticket.priority === 'Critical' ? 'text-red-700 bg-red-50 dark:bg-red-500/10 dark:text-red-400' :
                      ticket.priority === 'High' ? 'text-orange-700 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400' :
                      ticket.priority === 'Medium' ? 'text-blue-700 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400' :
                      'text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {ticket.priority === 'Critical' && <AlertTriangle size={10} />}
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{ticket.updated}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded transition">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
          <div>Showing <span className="font-medium text-gray-900 dark:text-white">1</span> to <span className="font-medium text-gray-900 dark:text-white">6</span> of <span className="font-medium text-gray-900 dark:text-white">36</span> tickets</div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition">
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 text-gray-900 dark:text-white font-medium">1</span>
            <button className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, trend, trendUp }: { title: string, value: string, icon: React.ReactNode, trend: string, trendUp: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
        <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'Open':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
          <AlertCircle size={12} /> Open
        </span>
      );
    case 'Pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20">
          <Clock size={12} /> Pending
        </span>
      );
    case 'Escalated':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
          <AlertTriangle size={12} /> Escalated
        </span>
      );
    case 'Resolved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
          <CheckCircle size={12} /> Resolved
        </span>
      );
    default:
      return null;
  }
}
