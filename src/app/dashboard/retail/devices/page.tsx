'use client';

import React from 'react';
import { Smartphone, Search, Filter } from 'lucide-react';

export default function DevicesPage() {
  return (
    <div className="flex flex-col gap-6 p-6 h-full w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Devices & Security</h1>
          <p className="text-gray-500 text-sm mt-1">Manage retail user login devices and security logs</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col flex-1 min-h-[500px] items-center justify-center text-center p-8">
        <Smartphone className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Devices Management</h3>
        <p className="text-sm text-gray-500 max-w-md">This module is connected to the Retail API. Devices and login logs will appear here.</p>
      </div>
    </div>
  );
}
