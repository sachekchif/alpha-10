'use client';

import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
  PieChart, Pie, Cell
} from 'recharts';

export default function ChartsRow({ role }: { role: string }) {
  // Mock Data: Transactions Trend (7 days)
  const transactionData = [
    { name: 'Mon', inflow: 4000, outflow: 2400 },
    { name: 'Tue', inflow: 3000, outflow: 1398 },
    { name: 'Wed', inflow: 2000, outflow: 9800 },
    { name: 'Thu', inflow: 2780, outflow: 3908 },
    { name: 'Fri', inflow: 1890, outflow: 4800 },
    { name: 'Sat', inflow: 2390, outflow: 3800 },
    { name: 'Sun', inflow: 3490, outflow: 4300 },
  ];

  // Mock Data: User Growth
  const userGrowthData = [
    { name: 'Week 1', retail: 400, corporate: 24 },
    { name: 'Week 2', retail: 800, corporate: 48 },
    { name: 'Week 3', retail: 1200, corporate: 72 },
    { name: 'Week 4', retail: 2780, corporate: 120 },
  ];

  // Mock Data: Currency Distribution
  const distributionData = [
    { name: 'NGN Wallets', value: 75 },
    { name: 'USD Wallets', value: 15 },
    { name: 'GBP/EUR Wallets', value: 10 },
  ];
  const COLORS = ['#cc0000', '#1a1a2e', '#4d4d66'];

  const showFinancials = role === 'Super Admin' || role === 'Finance/Admin Ops';
  const showUsers = role === 'Super Admin' || role === 'Compliance Officer';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      
      {/* Transaction Trend */}
      {showFinancials && (
        <div className="bg-white p-6 justify-center rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Transaction Trend</h3>
              <p className="text-gray-500 text-sm">Inflows vs Outflows (Last 7 Days)</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-md px-3 py-1.5 focus:outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={transactionData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} tickFormatter={(val) => `₦${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" name="Inflow" dataKey="inflow" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                <Line type="monotone" name="Outflow" dataKey="outflow" stroke="#f43f5e" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Side Charts Stack */}
      <div className={`flex flex-col gap-6 ${!showFinancials ? 'lg:col-span-3 lg:grid lg:grid-cols-2' : ''}`}>
        
        {/* User Growth */}
        {showUsers && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1">
            <h3 className="font-bold text-gray-800 text-lg mb-1">User Growth</h3>
            <p className="text-gray-500 text-sm mb-6">New accounts per week</p>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="retail" name="Retail" stackId="a" fill="#1a1a2e" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="corporate" name="Corporate" stackId="a" fill="#cc0000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Currency Distribution */}
        {showFinancials && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1 relative">
            <h3 className="font-bold text-gray-800 text-lg mb-1">Wallet Distribution</h3>
            <p className="text-gray-500 text-sm mb-2">Balances by currency type</p>
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip wrapperStyle={{ outline: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Custom Legend for Pie */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 flex flex-col gap-2 pointer-events-none">
                {distributionData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                    <span className="text-[10px] text-gray-600 font-medium">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
