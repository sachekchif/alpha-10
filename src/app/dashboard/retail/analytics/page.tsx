'use client';

import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { Download, Calendar, Filter, ChevronDown } from 'lucide-react';

const COLORS = ['#961A1C', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#64748B'];

const customerGrowthData = [
  { name: 'Jan', active: 4000, inactive: 2400 },
  { name: 'Feb', active: 5000, inactive: 2200 },
  { name: 'Mar', active: 6000, inactive: 2100 },
  { name: 'Apr', active: 7500, inactive: 2600 },
  { name: 'May', active: 9000, inactive: 2800 },
  { name: 'Jun', active: 11000, inactive: 3000 },
  { name: 'Jul', active: 13500, inactive: 3200 },
];

const tierDistributionData = [
  { name: 'Tier 1', value: 45000 },
  { name: 'Tier 2', value: 30000 },
  { name: 'Tier 3', value: 15000 },
];

const revenueData = [
  { name: 'Mon', revenue: 4000, fees: 2400 },
  { name: 'Tue', revenue: 3000, fees: 1398 },
  { name: 'Wed', revenue: 2000, fees: 9800 },
  { name: 'Thu', revenue: 2780, fees: 3908 },
  { name: 'Fri', revenue: 1890, fees: 4800 },
  { name: 'Sat', revenue: 2390, fees: 3800 },
  { name: 'Sun', revenue: 3490, fees: 4300 },
];

const geoData = [
  { name: 'Lagos', users: 45000 },
  { name: 'Abuja', users: 25000 },
  { name: 'Port Harcourt', users: 15000 },
  { name: 'Kano', users: 10000 },
  { name: 'Others', users: 5000 },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('Last 30 Days');

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Intelligence</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive analytics and insights for retail banking operations.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center justify-between gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition min-w-[160px]">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              {dateRange}
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          <button className="flex items-center gap-2 bg-[#961A1C] text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-[#7a1517] transition shadow-sm">
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* Grid Layout for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Customer Analytics - Growth */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm lg:col-span-2 xl:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white">Customer Growth & Retention</h3>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><Filter size={16} /></button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={customerGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#961A1C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#961A1C" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInactive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#64748B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="active" name="Active Customers" stroke="#961A1C" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                <Area type="monotone" dataKey="inactive" name="Inactive Customers" stroke="#64748B" strokeWidth={2} fillOpacity={1} fill="url(#colorInactive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Analytics - Tier Distribution */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">KYC Tier Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tierDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Analytics - Revenue & Fees */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm lg:col-span-1 xl:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white">Revenue vs Fees</h3>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><Filter size={16} /></button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Total Revenue" fill="#961A1C" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="fees" name="Platform Fees" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographic Analytics */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm lg:col-span-2 xl:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white">Customer Distribution by Region</h3>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><Filter size={16} /></button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={geoData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(150, 26, 28, 0.05)' }}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="users" name="Active Users" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Operational Analytics Summary */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm xl:col-span-3">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">Operational Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Average KYC Processing Time</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">12m</span>
                <span className="text-sm font-medium text-emerald-500 mb-1">-2m this week</span>
              </div>
            </div>
            <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Support Ticket Resolution Rate</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">94%</span>
                <span className="text-sm font-medium text-emerald-500 mb-1">+1.5% this week</span>
              </div>
            </div>
            <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Transaction Success Rate</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">99.8%</span>
                <span className="text-sm font-medium text-emerald-500 mb-1">+0.1% this week</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
