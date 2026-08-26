'use client';

import React, { useState } from 'react';
import { 
  PackageSearch, PackageX, TrendingUp, Users, Search, Filter, 
  MoreVertical, Plus, ChevronLeft, ChevronRight, Edit, Tag, Percent
} from 'lucide-react';

const mockProducts = [
  { id: 'PRD-01', name: 'Alpha Premium', category: 'Fixed Income', interest: '15% p.a.', investors: '12,450', aum: '₦5.2B', status: 'Active' },
  { id: 'PRD-02', name: 'Fixed Deposit', category: 'Fixed Income', interest: '12% p.a.', investors: '24,105', aum: '₦8.4B', status: 'Active' },
  { id: 'PRD-03', name: 'Alpha Saver', category: 'Savings', interest: '8% p.a.', investors: '45,210', aum: '₦1.2B', status: 'Active' },
  { id: 'PRD-04', name: 'Real Estate Fund', category: 'Alternative', interest: '22% p.a.', investors: '8,420', aum: '₦12.5B', status: 'Active' },
  { id: 'PRD-05', name: 'Crypto Yield', category: 'Digital Assets', interest: '35% p.a.', investors: '0', aum: '₦0', status: 'Inactive' },
  { id: 'PRD-06', name: 'Student Saver', category: 'Savings', interest: '10% p.a.', investors: '5,120', aum: '₦450M', status: 'Active' },
];

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState('Product List');

  const tabs = ['Product List', 'Categories', 'Interest Rates', 'Product Availability', 'Analytics'];

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investment Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage retail investment offerings, rates, and availability.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 bg-[#961A1C] text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-[#7a1517] transition shadow-sm">
            <Plus size={16} /> Create Product
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Active Products" value="12" icon={<PackageSearch className="text-emerald-500" />} trend="2 new this quarter" trendUp={true} />
        <KpiCard title="Inactive Products" value="4" icon={<PackageX className="text-red-500" />} trend="Pending launch" trendUp={false} />
        <KpiCard title="Total Investors" value="95,305" icon={<Users className="text-blue-500" />} trend="+12% this month" trendUp={true} />
        <KpiCard title="Product Performance" value="18.5%" icon={<TrendingUp className="text-purple-500" />} trend="Avg ROI across all" trendUp={true} />
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
                placeholder="Search products..."
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
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Interest Rate</th>
                <th className="px-6 py-4">Total Investors</th>
                <th className="px-6 py-4">AUM</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-800">
              {mockProducts.map((product, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <PackageSearch size={16} className="text-gray-500 dark:text-gray-400" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      <Tag size={12} /> {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <Percent size={14} /> {product.interest}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{product.investors}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{product.aum}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded transition">
                      <Edit size={16} />
                    </button>
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
          <div>Showing <span className="font-medium text-gray-900 dark:text-white">1</span> to <span className="font-medium text-gray-900 dark:text-white">6</span> of <span className="font-medium text-gray-900 dark:text-white">16</span> products</div>
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
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}
