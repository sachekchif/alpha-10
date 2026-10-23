'use client';

import React from 'react';
import { Briefcase, Search, Filter } from 'lucide-react';

export default function BondsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 h-full w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bonds</h1>
          <p className="text-gray-500 text-sm mt-1">Manage retail user bonds investments</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col flex-1 min-h-[500px] items-center justify-center text-center p-8">
        <Briefcase className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Bonds Investments Management</h3>
        <p className="text-sm text-gray-500 max-w-md">This module is connected to the Retail API. Bonds will appear here.</p>
      </div>
    </div>
  );
}
