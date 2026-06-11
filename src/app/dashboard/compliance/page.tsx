'use client';

import React, { useState } from 'react';
import { ShieldAlert, UserCheck, Search, Filter, CheckCircle, XCircle, FileQuestion, AlertTriangle, Eye, X, FileText, Image as ImageIcon } from 'lucide-react';

export default function ComplianceKYCPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'aml'>('pending');
  const [selectedUser, setSelectedUser] = useState<any>(null); // For KYC Drawer

  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compliance & KYC</h1>
          <p className="text-gray-500 text-sm mt-1">Manage user verification and anti-money laundering alerts</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
            <AlertTriangle size={16} /> 4 Active AML Alerts
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Tab Header */}
        <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700 px-6 pt-4 bg-gray-50/50 dark:bg-gray-900/20 custom-scrollbar">
          <TabButton id="pending" label="Pending KYC (23)" active={activeTab} set={setActiveTab} />
          <TabButton id="approved" label="Approved" active={activeTab} set={setActiveTab} />
          <TabButton id="rejected" label="Rejected" active={activeTab} set={setActiveTab} />
          <TabButton id="aml" label="AML Alerts" active={activeTab} set={setActiveTab} isAlert />
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by Name or Company..."
              className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition w-fit">
            <Filter size={16} /> Filter by Level
          </button>
        </div>

        {/* Content */}
        <div className="overflow-x-auto min-h-[400px]">
          {activeTab !== 'aml' ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Name / Company</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">KYC Level</th>
                  <th className="px-6 py-4 font-medium">Date Submitted</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {activeTab === 'pending' && (
                  <>
                    <KycRow user={{name: "Globex Corp", type: "Corporate", level: "Tier 3", date: "2 Hrs Ago", status: "Pending"}} onOpenDrawer={setSelectedUser} />
                    <KycRow user={{name: "Michael Chen", type: "Retail", level: "Tier 2", date: "5 Hrs Ago", status: "Pending"}} onOpenDrawer={setSelectedUser} />
                    <KycRow user={{name: "Alpha Retailers", type: "Corporate", level: "Tier 3", date: "Yesterday", status: "Pending"}} onOpenDrawer={setSelectedUser} />
                  </>
                )}
                {activeTab === 'approved' && (
                  <>
                    <KycRow user={{name: "David Lee", type: "Retail", level: "Tier 2", date: "24 Apr 2024", status: "Approved"}} onOpenDrawer={setSelectedUser} />
                    <KycRow user={{name: "Acme Logistics", type: "Corporate", level: "Tier 3", date: "22 Apr 2024", status: "Approved"}} onOpenDrawer={setSelectedUser} />
                  </>
                )}
                {activeTab === 'rejected' && (
                  <>
                    <KycRow user={{name: "Anita Patel", type: "Retail", level: "Tier 1", date: "25 Apr 2024", status: "Rejected"}} onOpenDrawer={setSelectedUser} />
                  </>
                )}
              </tbody>
            </table>
          ) : (
            <AMLSection />
          )}
        </div>

      </div>
      {/* --- KYC Details Drawer Overlay --- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex justify-end animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <div>
                <h2 className="font-bold text-xl text-gray-900 dark:text-white">{selectedUser.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedUser.type} • {selectedUser.level}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              {/* Documents Section */}
              <div>
                <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">Submitted Documents</h3>
                <div className="flex flex-col gap-3">
                  <DocumentCard title="Government ID" status="Verified" icon={<ImageIcon className="text-blue-500"/>} />
                  <DocumentCard title="Proof of Address" status="Pending Review" icon={<FileText className="text-purple-500"/>} />
                  <DocumentCard title="Selfie Match" status="Verified" icon={<UserCheck className="text-green-500"/>} />
                  {selectedUser.type === 'Corporate' && (
                    <DocumentCard title="Certificate of Incorporation" status="Pending Review" icon={<FileText className="text-orange-500"/>} />
                  )}
                </div>
              </div>

              {/* Risk Profile */}
              <div>
                <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">Risk Profile</h3>
                <div className="bg-green-50 border border-green-100 dark:bg-green-900/10 dark:border-green-900/30 p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-0.5" size={18} />
                  <div>
                    <p className="font-bold text-green-800 dark:text-green-500">Low Risk</p>
                    <p className="text-sm text-green-700 dark:text-green-400/80 mt-1">No AML flags detected across internal or external databases.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            {selectedUser.status === 'Pending' && (
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col gap-3">
                <button className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition">
                  <CheckCircle size={18} /> Approve KYC
                </button>
                <div className="flex gap-3">
                  <button className="flex-1 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold py-3 rounded-xl transition flex justify-center items-center gap-2">
                    <XCircle size={18} /> Reject
                  </button>
                  <button className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold py-3 rounded-xl transition flex justify-center items-center gap-2">
                    <FileQuestion size={18} /> Request Info
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// --- Subcomponents ---

function TabButton({ id, label, active, set, isAlert }: any) {
  const isActive = active === id;
  return (
    <button 
      onClick={() => set(id)}
      className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
        isActive 
          ? (isAlert ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-[#961A1C] text-[#961A1C]') 
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {isAlert && <AlertTriangle size={14} className={isActive ? 'text-red-500' : 'text-gray-400'} />}
      {label}
    </button>
  );
}

function KycRow({ user, onOpenDrawer }: { user: any, onOpenDrawer: (u: any) => void }) {
  const statusStyles: Record<string, string> = {
    Approved: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    Pending: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
    Rejected: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{user.name}</td>
      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.type}</td>
      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{user.level}</td>
      <td className="px-6 py-4 text-gray-500 text-sm">{user.date}</td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${statusStyles[user.status]}`}>{user.status}</span>
      </td>
      <td className="px-6 py-4 text-right">
        <button 
          onClick={() => onOpenDrawer(user)}
          className="text-[#961A1C] bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 ml-auto transition"
        >
          <Eye size={14} /> Review
        </button>
      </td>
    </tr>
  );
}

function DocumentCard({ title, status, icon }: any) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-xl flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition">
      <div className="flex items-center gap-3">
        <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-white text-sm">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{status}</p>
        </div>
      </div>
      <Eye size={16} className="text-gray-400" />
    </div>
  );
}

function AMLSection() {
  return (
    <div className="p-6">
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-6 mb-6">
         <h3 className="font-bold text-red-800 dark:text-red-400 text-lg mb-2 flex items-center gap-2">
           <ShieldAlert /> High Priority Alerts
         </h3>
         <p className="text-red-700 dark:text-red-300 text-sm">The following transactions or users have tripped the automated AML thresholds. Immediate review is required to prevent compliance breaches.</p>
      </div>

      <table className="w-full text-left text-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
          <tr>
            <th className="px-6 py-4 font-medium">Flag Type</th>
            <th className="px-6 py-4 font-medium">Entity</th>
            <th className="px-6 py-4 font-medium">Details</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
            <td className="px-6 py-4">
              <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-1 rounded-md text-xs font-bold">Velocity Violation</span>
            </td>
            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">User: James Smith</td>
            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">5 transfers exceeding ₦1M in 2 hours.</td>
            <td className="px-6 py-4 text-right">
              <button className="text-[#961A1C] font-semibold hover:underline text-xs">Investigate</button>
            </td>
          </tr>
          <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
            <td className="px-6 py-4">
              <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2.5 py-1 rounded-md text-xs font-bold">Sanction List Match</span>
            </td>
            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Corp: XYZ Imports</td>
            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">Director name partial match with OFAC database.</td>
            <td className="px-6 py-4 text-right">
              <button className="text-[#961A1C] font-semibold hover:underline text-xs">Investigate</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
