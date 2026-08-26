'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, TrendingUp, ChevronRight } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

type ChartPeriod = '24H' | '7D' | '30D' | '90D';

interface FlowDataPoint {
  time: string;
  inflow: number;
  outflow: number;
}

const DATA_SETS: Record<ChartPeriod, {
  summary: { totalInflow: string; inflowTrend: string; totalOutflow: string; outflowTrend: string; netFlow: string; netTrend: string };
  points: FlowDataPoint[];
}> = {
  '24H': {
    summary: {
      totalInflow: '₦84,250,000',
      inflowTrend: '+12.4%',
      totalOutflow: '₦61,800,000',
      outflowTrend: '+4.8%',
      netFlow: '+₦22,450,000',
      netTrend: '+18.2%',
    },
    points: [
      { time: '00:00', inflow: 4200000, outflow: 2100000 },
      { time: '04:00', inflow: 2800000, outflow: 3500000 },
      { time: '08:00', inflow: 14500000, outflow: 8900000 },
      { time: '12:00', inflow: 25400000, outflow: 18200000 },
      { time: '16:00', inflow: 22100000, outflow: 16400000 },
      { time: '20:00', inflow: 15250000, outflow: 12700000 },
    ],
  },
  '7D': {
    summary: {
      totalInflow: '₦542,100,000',
      inflowTrend: '+8.6%',
      totalOutflow: '₦398,500,000',
      outflowTrend: '+2.1%',
      netFlow: '+₦143,600,000',
      netTrend: '+14.5%',
    },
    points: [
      { time: 'Mon', inflow: 68000000, outflow: 45000000 },
      { time: 'Tue', inflow: 82000000, outflow: 58000000 },
      { time: 'Wed', inflow: 71000000, outflow: 62000000 },
      { time: 'Thu', inflow: 94000000, outflow: 67000000 },
      { time: 'Fri', inflow: 110000000, outflow: 81000000 },
      { time: 'Sat', inflow: 62000000, outflow: 48000000 },
      { time: 'Sun', inflow: 55100000, outflow: 37500000 },
    ],
  },
  '30D': {
    summary: {
      totalInflow: '₦2,450,000,000',
      inflowTrend: '+15.2%',
      totalOutflow: '₦1,820,000,000',
      outflowTrend: '+6.4%',
      netFlow: '+₦630,000,000',
      netTrend: '+22.1%',
    },
    points: [
      { time: 'Week 1', inflow: 520000000, outflow: 410000000 },
      { time: 'Week 2', inflow: 610000000, outflow: 440000000 },
      { time: 'Week 3', inflow: 590000000, outflow: 430000000 },
      { time: 'Week 4', inflow: 730000000, outflow: 540000000 },
    ],
  },
  '90D': {
    summary: {
      totalInflow: '₦7,890,000,000',
      inflowTrend: '+21.0%',
      totalOutflow: '₦5,410,000,000',
      outflowTrend: '+11.3%',
      netFlow: '+₦2,480,000,000',
      netTrend: '+28.4%',
    },
    points: [
      { time: 'Month 1', inflow: 2200000000, outflow: 1600000000 },
      { time: 'Month 2', inflow: 2650000000, outflow: 1850000000 },
      { time: 'Month 3', inflow: 3040000000, outflow: 1960000000 },
    ],
  },
};

const formatNairaShort = (val: number): string => {
  if (val >= 1_000_000_000) {
    return `₦${(val / 1_000_000_000).toFixed(1)}B`;
  }
  if (val >= 1_000_000) {
    return `₦${(val / 1_000_000).toFixed(1)}M`;
  }
  if (val >= 1_000) {
    return `₦${(val / 1_000).toFixed(0)}k`;
  }
  return `₦${val}`;
};

const FlowTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const inflow = payload[0]?.value || 0;
    const outflow = payload[1]?.value || 0;
    const net = inflow - outflow;
    const isNetPositive = net >= 0;

    return (
      <div className="bg-gray-900/95 dark:bg-gray-950/95 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-gray-800 text-xs w-60 z-50">
        <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b border-gray-800">
          <span className="font-semibold text-gray-400">{label}</span>
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Volume</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              Inflows
            </span>
            <span className="font-mono font-bold text-emerald-400">
              ₦{inflow.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-gray-300">
              <span className="w-2 h-2 rounded-full bg-[#961A1C] shrink-0" />
              Outflows
            </span>
            <span className="font-mono font-bold text-red-400">
              ₦{outflow.toLocaleString()}
            </span>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-800/80 flex justify-between items-center">
            <span className="text-gray-400 font-medium">Net Flow</span>
            <span className={`font-mono font-bold ${isNetPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isNetPositive ? '+' : ''}₦{net.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function TransactionFlowSection() {
  const [period, setPeriod] = useState<ChartPeriod>('24H');
  const activeDataset = DATA_SETS[period];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700/80 shadow-xs flex flex-col gap-6">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-700/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Transaction Flow</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300">
              Analytics
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Monitor incoming and outgoing transaction activity across the platform
          </p>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          {/* Range Selector Pill */}
          <div className="flex bg-gray-100 dark:bg-gray-900/90 rounded-lg p-1 border border-gray-200/60 dark:border-gray-700/50">
            {(['24H', '7D', '30D', '90D'] as ChartPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                  period === p
                    ? 'bg-[#961A1C] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <Link
            href="/dashboard/transactions"
            className="text-xs font-semibold text-[#961A1C] dark:text-red-400 hover:underline inline-flex items-center gap-1 shrink-0"
          >
            View Transactions <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Financial Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Inflow */}
        <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span className="font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              Total Inflow
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-900/40">
              <ArrowUpRight size={12} />
              {activeDataset.summary.inflowTrend}
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white tracking-tight font-mono">
            {activeDataset.summary.totalInflow}
          </div>
        </div>

        {/* Total Outflow */}
        <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span className="font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#961A1C] shrink-0" />
              Total Outflow
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded border border-red-200/60 dark:border-red-900/40">
              <ArrowDownRight size={12} />
              {activeDataset.summary.outflowTrend}
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white tracking-tight font-mono">
            {activeDataset.summary.totalOutflow}
          </div>
        </div>

        {/* Net Flow */}
        <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span className="font-semibold flex items-center gap-1.5">
              <TrendingUp size={14} className="text-[#961A1C]" />
              Net Flow
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-900/40">
              <ArrowUpRight size={12} />
              {activeDataset.summary.netTrend}
            </span>
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
            {activeDataset.summary.netFlow}
          </div>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={activeDataset.points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#961A1C" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#961A1C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              dx={-8}
              tickFormatter={formatNairaShort}
            />
            <RechartsTooltip content={<FlowTooltip />} />
            <Area
              type="monotone"
              name="Inflow"
              dataKey="inflow"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#inflowGrad)"
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
            />
            <Area
              type="monotone"
              name="Outflow"
              dataKey="outflow"
              stroke="#961A1C"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#outflowGrad)"
              activeDot={{ r: 6, stroke: '#961A1C', strokeWidth: 2, fill: '#ffffff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
