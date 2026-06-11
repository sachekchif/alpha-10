'use client';

import React from 'react';
import { Download, FileText, Filter, Search, Calendar } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Generate, view, and export system-wide financial records</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg shadow-sm transition">
            <Download size={16} /> Generate New Report
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden p-8 text-center items-center justify-center min-h-[400px]">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-full mb-4">
          <FileText size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Reports Generated Yet</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
          You haven't generated any financial reports for this period. Click the button above to run a custom query on the ledger.
        </p>
        <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#961A1C] bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition">
          <Calendar size={16} /> Run End of Day Report
        </button>
      </div>

    </div>
  );
}
