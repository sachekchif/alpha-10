'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Search, Filter, Plus, Eye, MoreHorizontal, TrendingUp, Users, CreditCard, ChevronRight, X, Clock, XCircle, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Drawer, Form, Select, DatePicker, Space, Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';

const companies = [
  { id: 1, name: 'TechCorp Innovations Ltd', rc: 'RC-2024-001', industry: 'Technology', accounts: 3, balance: '₦ 45,200,000', kyc: 'Approved', joined: '12 Jan 2025', status: 'Active' },
  { id: 2, name: 'Globex Manufacturing', rc: 'RC-2024-045', industry: 'Manufacturing', accounts: 1, balance: '₦ 12,800,000', kyc: 'Approved', joined: '03 Feb 2025', status: 'Active' },
  { id: 3, name: 'Alpha Retail Group', rc: 'RC-2023-812', industry: 'Retail', accounts: 2, balance: '₦ 8,340,000', kyc: 'Pending', joined: '19 Feb 2025', status: 'Pending' },
  { id: 4, name: 'Omega Logistics', rc: 'RC-2024-102', industry: 'Logistics', accounts: 1, balance: '₦ 2,950,000', kyc: 'Approved', joined: '22 Mar 2025', status: 'Active' },
  { id: 5, name: 'Nexus Capital Partners', rc: 'RC-2022-500', industry: 'Finance', accounts: 5, balance: '₦ 210,400,000', kyc: 'Approved', joined: '07 Apr 2025', status: 'Active' },
  { id: 6, name: 'XYZ Imports', rc: 'RC-2024-388', industry: 'Import/Export', accounts: 2, balance: '₦ 5,100,000', kyc: 'Rejected', joined: '28 Apr 2025', status: 'Suspended' },
];

const kycStyles: Record<string, string> = {
  Approved: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
  Pending: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
  Rejected: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
};

const statusStyles: Record<string, string> = {
  Active: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
  Pending: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
  Suspended: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
};

export default function ExploreCompaniesPage() {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Explore Companies</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all corporate accounts on the platform</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-lg text-sm transition shadow-sm">
          <Plus size={16} /> Add Company
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Companies"
          value={String(companies.length)}
          subtitle="Registered entities"
          trend="up"
          icon={<Building2 size={18} />}
        />
        <MetricCard
          title="Virtual Accounts Active"
          value="14"
          subtitle="Across all companies"
          trend="up"
          icon={<CreditCard size={18} />}
        />
        <MetricCard
          title="Pending Accounts"
          value={String(companies.filter(c => c.status === 'Pending').length)}
          subtitle="Awaiting approval"
          isAmber
          icon={<Clock size={18} />}
        />
        <MetricCard
          title="Blocked Accounts"
          value={String(companies.filter(c => c.status === 'Suspended').length)}
          subtitle="Requires attention"
          isAlert
          icon={<XCircle size={18} />}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search company or industry..."
              className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>
          <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition w-fit">
            <Filter size={16} /> Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Company</th>
                <th className="px-6 py-3 font-medium">RC Number</th>
                <th className="px-6 py-3 font-medium">Industry</th>
                <th className="px-6 py-3 font-medium">Accounts</th>
                <th className="px-6 py-3 font-medium">Total Balance</th>
                <th className="px-6 py-3 font-medium">KYC</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filtered.map(company => (
                <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {company.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{company.name}</p>
                        <p className="text-xs text-gray-400">Joined {company.joined}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{company.rc}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{company.industry}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{company.accounts}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{company.balance}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${kycStyles[company.kyc]}`}>{company.kyc}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${statusStyles[company.status]}`}>{company.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Filter Drawer */}
      <Drawer
        title={<span className="font-bold text-xl text-gray-900 dark:text-white">Filter Companies</span>}
        placement="right"
        onClose={() => setIsFilterOpen(false)}
        open={isFilterOpen}
        width={400}
        classNames={{
          header: "border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50",
          body: "p-6",
          footer: "border-t border-gray-100 dark:border-gray-800 p-6"
        }}
        footer={
          <Space className="w-full flex justify-between gap-3">
            <Button onClick={() => setIsFilterOpen(false)} size="large" className="w-full flex-1 font-semibold rounded-xl border-gray-200 text-gray-700 hover:text-gray-900">Clear Filters</Button>
            <Button type="primary" onClick={() => setIsFilterOpen(false)} size="large" className="w-full flex-1 bg-[#961A1C] hover:bg-[#7a1517] font-semibold rounded-xl">Apply Filters</Button>
          </Space>
        }
      >
        <Form layout="vertical" className="flex flex-col gap-4">
          <Form.Item label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date Range</span>} className="mb-0">
            <DatePicker.RangePicker className="w-full py-2" />
          </Form.Item>
          
          <Form.Item label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Industry</span>} className="mb-0">
            <Select
              mode="multiple"
              allowClear
              placeholder="Select Industries"
              size="large"
              options={[
                { value: 'Technology', label: 'Technology' },
                { value: 'Manufacturing', label: 'Manufacturing' },
                { value: 'Retail', label: 'Retail' },
                { value: 'Logistics', label: 'Logistics' },
                { value: 'Finance', label: 'Finance' },
              ]}
            />
          </Form.Item>

          <Form.Item label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">KYC Status</span>} className="mb-0">
            <Select
              mode="multiple"
              allowClear
              placeholder="Select KYC Status"
              size="large"
              options={[
                { value: 'Approved', label: 'Approved' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Rejected', label: 'Rejected' },
              ]}
            />
          </Form.Item>

          <Form.Item label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Account Status</span>} className="mb-0">
            <Select
              mode="multiple"
              allowClear
              placeholder="Select Account Status"
              size="large"
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Suspended', label: 'Suspended' },
              ]}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}

function MetricCard({ title, value, subtitle, trend, icon, isAlert, isAmber, linkHref }: any) {
  const router = useRouter();
  
  const menuItems: MenuProps['items'] = [
    {
      key: 'refresh',
      icon: <RefreshCw size={14} />,
      label: 'Refresh Data',
      onClick: (e) => { e.domEvent.stopPropagation(); console.log('Refreshing data for:', title); }
    },
    {
      key: 'filter',
      icon: <Filter size={14} />,
      label: 'Filter Page',
      onClick: (e) => { e.domEvent.stopPropagation(); console.log('Applying filter for:', title); }
    }
  ];

  if (linkHref) {
    menuItems.push({
      key: 'view',
      icon: <Eye size={14} />,
      label: 'View Details',
      onClick: (e) => { e.domEvent.stopPropagation(); router.push(linkHref); }
    });
  }
  
  let bgColorClass = 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500';
  let iconBgClass = 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
  let valueColorClass = 'text-gray-900 dark:text-white';
  let subtitleColorClass = 'text-gray-400';

  if (isAlert) {
    bgColorClass = 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30 hover:border-red-300 dark:hover:border-red-700';
    iconBgClass = 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    valueColorClass = 'text-red-600 dark:text-red-500';
    subtitleColorClass = 'text-red-500 font-semibold';
  } else if (isAmber) {
    bgColorClass = 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700';
    iconBgClass = 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    valueColorClass = 'text-amber-600 dark:text-amber-500';
    subtitleColorClass = 'text-amber-500 font-semibold';
  }

  return (
    <div
      onClick={() => linkHref && router.push(linkHref)}
      className={`p-5 rounded-xl border shadow-sm flex flex-col justify-center relative transition-all hover:shadow-md cursor-pointer ${bgColorClass}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {icon && <div className={`p-1.5 rounded-lg ${iconBgClass}`}>{icon}</div>}
          <p className="text-sm text-gray-500 font-medium">{title}</p>
        </div>
        <div className="relative" onClick={e => e.stopPropagation()}>
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <MoreHorizontal size={16} />
            </button>
          </Dropdown>
        </div>
      </div>
      <h3 className={`text-2xl font-bold mb-1 mt-2 ${valueColorClass}`}>{value}</h3>
      <div className="flex items-center gap-1.5">
        {trend === 'up' && <ArrowUpRight size={16} className="text-green-500" />}
        {trend === 'down' && <ArrowDownRight size={16} className="text-red-500" />}
        <span className={`text-xs ${subtitleColorClass}`}>{subtitle}</span>
      </div>
    </div>
  );
}
