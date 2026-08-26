'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Modal, Drawer, Select, Switch } from 'antd';
import {
  ArrowLeft, BookOpen, Pencil, Trash2, X, Loader2, AlertCircle,
  Check, Shield, BarChart2, TrendingUp, Clock, Eye, Sparkles,
  Plus, Upload, Users, Award, Zap, PieChart, Star, RefreshCw, Filter, Search,
  Layers, GripVertical, ShieldCheck, DollarSign, ArrowUpRight
} from 'lucide-react';
import { 
  PiCellSignalMediumFill, PiCellSignalHighFill, PiCellSignalFullFill 
} from 'react-icons/pi';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetInvestmentEducationQuery,
  useUpdateInvestmentEducationMutation,
  useDeleteInvestmentEducationMutation,
  CreateInvestmentEducationRequest,
  useGetMutualFundContentsQuery,
  useCreateMutualFundContentMutation,
  useUpdateMutualFundContentMutation,
  useDeleteMutualFundContentMutation,
  useGetMutualFundContentQuery,
  useUpdateMutualFundAllocationsMutation,
  useUpdateMutualFundHoldingsMutation,
  MutualFundContent,
  CreateMutualFundRequest,
  AllocationItem,
  HoldingItem,
} from '@/auth/services/adminApi';
import { useToast } from '@/auth/components/ToastContainer';

const RISK_LEVELS = ['Low', 'Medium', 'High'] as const;
type RiskLevel = typeof RISK_LEVELS[number];

const RISK_META: Record<RiskLevel, { color: string; bg: string; icon: React.ReactNode }> = {
  Low: {
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200',
    icon: <PiCellSignalMediumFill className="text-emerald-600 text-sm" />,
  },
  Medium: {
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200',
    icon: <PiCellSignalHighFill className="text-amber-600 text-sm" />,
  },
  High: {
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/30 border border-red-200',
    icon: <PiCellSignalFullFill className="text-red-600 text-sm" />,
  },
};

const INVESTMENT_TYPES = [
  { value: 'mutual_funds', label: 'Mutual Funds' },
  { value: 'investment_banking', label: 'Investment Banking' },
  { value: 'treasury_bills', label: 'Treasury Bills' },
  { value: 'fixed_deposit', label: 'Fixed Deposit' },
  { value: 'bonds', label: 'Bonds' },
  { value: 'equities', label: 'Equities' },
  { value: 'savings', label: 'Savings' },
  { value: 'eurobonds', label: 'Eurobonds' },
];

const TAG_OPTIONS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Expert', label: 'Expert' },
];

const CATEGORY_OPTIONS = [
  'Fixed Income', 'Equity', 'Money Market', 'Savings', 'Alternative', 'USD Investment', 'Investment Banking',
];

const emptyMutualFundForm = (): CreateMutualFundRequest => ({
  fundId: '',
  displayName: '',
  shortDescription: '',
  riskLevel: 'Low Risk',
  isRecommended: false,
  durationLabel: '12 – 36 months',
  expectedYieldLabel: '14.5% p.a.',
  howYouEarnText: 'Yield is calculated daily and paid monthly into your investment wallet.',
  isActive: true,
  displayOrder: 0,
});

export default function InvestmentDetailPage() {
  return (
    <RoleGuard allowedRoles={['SuperAdmin', 'Control']}>
      <InvestmentDetailContent />
    </RoleGuard>
  );
}

function InvestmentDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<(CreateInvestmentEducationRequest & { category?: string; tags?: string }) | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [steps, setSteps] = useState<string[]>([]);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  const { data, isLoading, isError, refetch } = useGetInvestmentEducationQuery(id);
  const [updateItem, { isLoading: isUpdating }] = useUpdateInvestmentEducationMutation();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteInvestmentEducationMutation();

  const item = data?.data;

  // Check if this module is Mutual Funds
  const isMutualFundsModule = 
    item?.code === 'mutual_funds' || 
    item?.code === 'muritual_funds' || 
    item?.title?.toLowerCase().includes('mutual fund');

  function openEdit() {
    if (!item) return;
    const rawSteps = item.howItWorksText
      ? item.howItWorksText.split('\n').map((s) => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)
      : [];

    setForm({
      code: item.code ?? 'mutual_funds',
      title: item.title ?? '',
      heroText: item.heroText ?? '',
      detailsText: item.detailsText ?? '',
      howItWorksText: item.howItWorksText ?? '',
      riskLevel: (item.riskLevel as RiskLevel) ?? 'Low',
      capitalGuaranteed: item.capitalGuaranteed ?? false,
      returnsGuaranteed: item.returnsGuaranteed ?? false,
      withdrawalRestrictions: item.withdrawalRestrictions ?? false,
      isActive: item.isActive ?? true,
      displayOrder: item.displayOrder ?? 0,
      category: 'Fixed Income',
      tags: 'Intermediate',
    });
    setSteps(rawSteps.length > 0 ? rawSteps : ['Choose an investment product that matches your financial goals.']);
    setFormErrors({});
    setIsEditing(true);
  }

  function validateForm() {
    if (!form) return false;
    const errors: Record<string, string> = {};
    if (!form.code.trim()) errors.code = 'Investment type is required';
    if (!form.title.trim()) errors.title = 'Title is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !validateForm()) return;
    try {
      const formattedSteps = steps
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s, idx) => `${idx + 1}. ${s}`)
        .join('\n');

      const { category, tags, ...apiPayload } = form;
      const formattedBody: CreateInvestmentEducationRequest = {
        ...apiPayload,
        code: form.code.trim().toLowerCase().replace(/\s+/g, '_'),
        title: form.title.trim(),
        heroText: form.heroText?.trim() || '',
        detailsText: form.detailsText?.trim() || '',
        howItWorksText: formattedSteps || form.howItWorksText?.trim() || '',
      };
      await updateItem({ id, body: formattedBody }).unwrap();
      toast.success('Investment updated successfully.', 'Updated');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Update failed.', 'Error');
    }
  }

  async function handleDelete() {
    try {
      await deleteItem(id).unwrap();
      toast.success('Investment deleted successfully.', 'Deleted');
      router.push('/dashboard/retail/investments');
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Delete failed.', 'Delete Failed');
    }
  }

  const riskKey = (item?.riskLevel || 'Low') as RiskLevel;
  const meta = RISK_META[riskKey] ?? RISK_META['Low'];

  const parsedSteps = item?.howItWorksText
    ? item.howItWorksText.split('\n').filter((s) => s.trim().length > 0)
    : [];

  const formatModuleCode = (code?: string) => {
    if (!code) return '—';
    const found = INVESTMENT_TYPES.find((t) => t.value === code);
    if (found) return found.label;
    return code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="flex flex-col gap-6 pb-12 w-full animate-in fade-in duration-500">
      {/* ── Top Header Section (No background & simplified) ───────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-transparent pb-3 border-b border-gray-200/60 dark:border-gray-800">
        <div>
          <button
            onClick={() => router.push('/dashboard/retail/investments')}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors mb-1.5 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Investments
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {item?.title || 'Loading Product Details...'}
          </h1>
          {item && (
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
              {formatModuleCode(item.code)}
            </p>
          )}
        </div>

        {item && (
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={openEdit}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-xs transition cursor-pointer"
            >
              <Pencil size={14} /> Edit Module
            </button>
            <button
              onClick={() => setIsConfirmDelete(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition cursor-pointer"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin text-[#961A1C]" />
          <span className="text-sm font-medium">Loading investment product analysis...</span>
        </div>
      ) : isError || !item ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 flex flex-col items-center gap-3 text-gray-400">
          <AlertCircle size={28} className="text-[#961A1C]" />
          <p className="text-sm font-medium">Failed to load investment details.</p>
          <button onClick={() => refetch()} className="text-xs text-[#961A1C] hover:underline font-semibold">Try again</button>
        </div>
      ) : isMutualFundsModule ? (
        /* ── IF MUTUAL FUNDS: RENDER FULL MUTUAL FUNDS MANAGEMENT SYSTEM ───────── */
        <MutualFundsManagementSuite />
      ) : (
        /* ── STANDARD INVESTMENT PRODUCT MODULE DETAILS ──────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">

          {/* ── 70% Left Main Content Area (lg:col-span-8) ───────────── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Level Badge & Risk Badge Bar */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/30">
                Intermediate
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.color}`}>
                {meta.icon}
                {item.riskLevel || 'Low'}
              </span>
            </div>

            {/* Title Heading & Description Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 p-6 space-y-4 shadow-xs">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Product Headline & Hero Summary
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
                  {item.title}
                </h2>
                {item.heroText && (
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2 leading-relaxed bg-gray-50 dark:bg-gray-900/40 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    {item.heroText}
                  </p>
                )}
              </div>

              {item.detailsText && (
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Comprehensive Investment Details
                  </span>
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-2">
                    {item.detailsText}
                  </div>
                </div>
              )}
            </div>

            {/* How It Works Connected Steps */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 p-6 shadow-xs">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                How It Works — Step-by-Step Investment Guide
              </h3>

              {parsedSteps.length > 0 ? (
                <div className="relative pl-6 space-y-4">
                  {parsedSteps.length > 1 && (
                    <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  )}
                  {parsedSteps.map((step, idx) => (
                    <div key={idx} className="relative flex items-center gap-3">
                      <div className="absolute -left-6 z-10 w-6 h-6 rounded-full bg-[#961A1C] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                        {idx + 1}
                      </div>
                      <div className="flex-1 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-medium">
                        {step.replace(/^\d+\.\s*/, '')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : item.howItWorksText ? (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {item.howItWorksText}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No step-by-step guide provided for this investment product yet.</p>
              )}
            </div>

          </div>

          {/* ── 30% Right Sidebar: Analytics & Conditions (lg:col-span-4) ─ */}
          <div className="lg:col-span-4 space-y-6">

            {/* Engagement & Viewer Analytics (Test Data Overlay) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 p-5 space-y-4 shadow-xs relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-gray-900/90 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs z-10 tracking-wider">
                TEST DATA
              </div>

              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                <BarChart2 size={16} className="text-[#961A1C]" />
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Product Engagement Analysis
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <Users size={13} />
                    <span className="text-[10px] font-semibold uppercase">Total Viewers</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">48,200</p>
                  <p className="text-[10px] text-emerald-600 font-medium">+18% this month</p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <Award size={13} />
                    <span className="text-[10px] font-semibold uppercase">Completion</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">71.4%</p>
                  <p className="text-[10px] text-emerald-600 font-medium">+4.2% completion</p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <Clock size={13} />
                    <span className="text-[10px] font-semibold uppercase">Avg Watch Time</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">4.2 min</p>
                  <p className="text-[10px] text-gray-400 font-medium">Per session</p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <Zap size={13} />
                    <span className="text-[10px] font-semibold uppercase">Active Now</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">1,420</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Viewing live</p>
                </div>
              </div>
            </div>

            {/* Separate Cards for Capital, ROI, and Withdrawal */}
            <div className="space-y-3">
              {/* Capital Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 shadow-xs flex flex-col gap-2">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Capital Requirement</span>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Would the customer need capital for this investment?
                  </p>
                </div>
                <div>
                  {item.capitalGuaranteed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Check size={14} className="stroke-[3]" /> Capital Guaranteed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 dark:text-red-400">
                      <X size={14} className="stroke-[2.5]" /> No Capital Needed
                    </span>
                  )}
                </div>
              </div>

              {/* ROI Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 shadow-xs flex flex-col gap-2">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">ROI & Returns</span>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Will the customer receive guaranteed ROI for this investment?
                  </p>
                </div>
                <div>
                  {item.returnsGuaranteed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Check size={14} className="stroke-[3]" /> ROI Guaranteed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 dark:text-red-400">
                      <X size={14} className="stroke-[2.5]" /> No ROI Guaranteed
                    </span>
                  )}
                </div>
              </div>

              {/* Withdrawal Restrictions Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 shadow-xs flex flex-col gap-2">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Withdrawal Restrictions</span>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Are there withdrawal restrictions on this investment?
                  </p>
                </div>
                <div>
                  {item.withdrawalRestrictions ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <X size={14} className="stroke-[2.5]" /> Restricted Withdrawal
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Check size={14} className="stroke-[3]" /> Flexible Withdrawal
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Risk Profile Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#961A1C] text-lg"><PiCellSignalHighFill /></span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                    Risk Level Profile
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.color}`}>
                  {meta.icon}
                  {item.riskLevel || 'Low'}
                </span>
              </div>
            </div>

            {/* Active Status Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                    Active
                  </span>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                    Retail users can now access this investment offering
                  </p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Edit Drawer (Ant Design Drawer: maskClosable=true) */}
      <Drawer
        open={Boolean(isEditing && form)}
        onClose={() => setIsEditing(false)}
        width={560}
        destroyOnClose
        maskClosable={true}
        className="dark:bg-gray-900"
        title={
          <div className="flex items-center justify-between text-gray-900 dark:text-white">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white">
              Edit Investment
            </h3>
          </div>
        }
      >
        {form && (
          <form onSubmit={handleUpdate} className="flex flex-col h-full">

            <div className="flex-1 overflow-y-auto space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

              {/* Tag Badge Display & Dropdown */}
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/30">
                  {form.tags || 'Intermediate'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Tag Level:</span>
                  <Select
                    value={form.tags || 'Intermediate'}
                    onChange={(val) => setForm({ ...form, tags: val })}
                    options={TAG_OPTIONS}
                    className="w-36 text-xs"
                    size="small"
                  />
                </div>
              </div>

              {/* Title Field (Large heading style like on app) */}
              <div>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Investment Title (e.g. Fixed Deposit High Yield Portfolio)"
                  className={`w-full text-xl sm:text-2xl font-bold bg-transparent text-gray-900 dark:text-white border-b-2 border-dashed focus:border-solid border-gray-300 dark:border-gray-700 py-1.5 focus:border-[#961A1C] outline-none transition placeholder:text-gray-300 dark:placeholder:text-gray-600 ${
                    formErrors.title ? 'border-red-500' : ''
                  }`}
                />
                {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
                <p className="text-[11px] text-gray-400 mt-1">Retail investor app header title</p>
              </div>

              {/* Investment Type Dropdown & Category Type Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Investment Type *
                  </label>
                  <Select
                    value={form.code || 'mutual_funds'}
                    onChange={(val) => setForm({ ...form, code: val })}
                    options={INVESTMENT_TYPES}
                    className="w-full"
                  />
                  {formErrors.code && <p className="text-xs text-red-500 mt-1">{formErrors.code}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Category Type
                  </label>
                  <Select
                    value={form.category || CATEGORY_OPTIONS[0]}
                    onChange={(val) => setForm({ ...form, category: val })}
                    options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Hero & Overview Text */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Hero Headline
                  </label>
                  <textarea
                    rows={2}
                    value={form.heroText}
                    onChange={(e) => setForm({ ...form, heroText: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
                    placeholder="Investment product summary for retail investors..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Details & Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.detailsText}
                    onChange={(e) => setForm({ ...form, detailsText: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
                    placeholder="Full investment terms, security backing, and strategy..."
                  />
                </div>
              </div>

              {/* How It Works Section - Connected Steps */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                    How It Works — Step-by-Step Investment Guide
                  </label>
                  <button
                    type="button"
                    onClick={() => setSteps([...steps, ''])}
                    className="flex items-center gap-1 text-xs text-[#961A1C] hover:underline font-semibold cursor-pointer"
                  >
                    <Plus size={13} /> Add Step
                  </button>
                </div>

                <div className="relative pl-6 space-y-4">
                  {steps.length > 1 && (
                    <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  )}

                  {steps.map((stepText, idx) => (
                    <div key={idx} className="relative flex items-center gap-3 group">
                      <div className="absolute -left-6 z-10 w-6 h-6 rounded-full bg-[#961A1C] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                        {idx + 1}
                      </div>

                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={stepText}
                          onChange={(e) => {
                            const updated = [...steps];
                            updated[idx] = e.target.value;
                            setSteps(updated);
                          }}
                          placeholder={`Step ${idx + 1} description...`}
                          className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                        />
                        {steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Level Selection: 3 Levels (Low, Medium, High) */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#961A1C] text-lg"><PiCellSignalHighFill /></span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                    Risk Level Profile
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {RISK_LEVELS.map((r) => {
                    const active = form.riskLevel === r;
                    const meta = RISK_META[r];
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm({ ...form, riskLevel: r })}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          active
                            ? `${meta.bg} ${meta.color} ring-2 ring-current shadow-xs`
                            : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {meta.icon}
                        <span>{r}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Capital, Returns, Withdrawal Questions */}
              <div className="space-y-3">
                {/* Capital */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="pr-3">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      Would the customer need capital for this investment?
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Capital Guaranteed</p>
                  </div>
                  <Switch
                    checked={form.capitalGuaranteed}
                    onChange={(checked) => setForm({ ...form, capitalGuaranteed: checked })}
                  />
                </div>

                {/* Returns */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="pr-3">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      Will the customer receive guaranteed ROI for this investment?
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Returns Guaranteed</p>
                  </div>
                  <Switch
                    checked={form.returnsGuaranteed}
                    onChange={(checked) => setForm({ ...form, returnsGuaranteed: checked })}
                  />
                </div>

                {/* Withdrawal */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="pr-3">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      Are there withdrawal restrictions on this investment?
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Withdrawal Restrictions</p>
                  </div>
                  <Switch
                    checked={form.withdrawalRestrictions}
                    onChange={(checked) => setForm({ ...form, withdrawalRestrictions: checked })}
                  />
                </div>
              </div>

              {/* Active Status Section */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                      Active
                    </span>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                      Retail users can now access this investment offering
                    </p>
                  </div>
                  <Switch
                    checked={form.isActive}
                    onChange={(checked) => setForm({ ...form, isActive: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Sticky Bottom Action Button */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-4 pb-1 mt-4">
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-3.5 px-4 bg-[#961A1C] hover:bg-[#7a1517] text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isUpdating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}
      </Drawer>

      {/* Delete confirmation (Ant Design Modal) */}
      <Modal
        open={Boolean(isConfirmDelete)}
        onCancel={() => setIsConfirmDelete(false)}
        footer={null}
        width={420}
        centered
        destroyOnClose
        maskClosable={false}
      >
        <div className="py-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
              <Trash2 size={22} />
            </div>
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Delete Investment</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Are you sure you want to delete <strong className="text-gray-800 dark:text-white">&ldquo;{item?.title}&rdquo;</strong>? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsConfirmDelete(false)}
              className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-xl transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── MUTUAL FUNDS MANAGEMENT SUITE (Rendered inside Investments Details page for Mutual Funds) ──
function MutualFundsManagementSuite() {
  const router = useRouter();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [pageNumber, setPageNumber] = useState(1);
  const PAGE_SIZE = 20;

  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<MutualFundContent | null>(null);
  const [form, setForm] = useState<CreateMutualFundRequest>(emptyMutualFundForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<MutualFundContent | null>(null);

  const { data, isFetching, isError, refetch } = useGetMutualFundContentsQuery({ pageNumber, pageSize: PAGE_SIZE });
  const [createFund, { isLoading: isCreating }] = useCreateMutualFundContentMutation();
  const [updateFund, { isLoading: isUpdating }] = useUpdateMutualFundContentMutation();
  const [deleteFund, { isLoading: isDeleting }] = useDeleteMutualFundContentMutation();

  const rawData = data?.data;
  const items: MutualFundContent[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray((rawData as any)?.items)
    ? (rawData as any).items
    : Array.isArray((rawData as any)?.data)
    ? (rawData as any).data
    : [];
  const totalCount: number = (rawData as any)?.totalCount ?? items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const activeCount = items.filter((i) => i.isActive).length;
  const recommendedCount = items.filter((i) => i.isRecommended).length;

  const maxDisplayOrder = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.max(...items.map((i) => i.displayOrder ?? 0));
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchSearch =
        !searchQuery ||
        i.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRisk = riskFilter === 'All' || i.riskLevel === riskFilter || (riskFilter === 'High Risk' && i.riskLevel?.includes('High'));
      const matchStatus =
        statusFilter === 'All'
          ? true
          : statusFilter === 'Active'
          ? i.isActive === true
          : i.isActive === false;
      return matchSearch && matchRisk && matchStatus;
    });
  }, [items, searchQuery, riskFilter, statusFilter]);

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.displayName.trim()) errors.displayName = 'Display name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function openCreate() {
    setForm({
      ...emptyMutualFundForm(),
      displayOrder: maxDisplayOrder + 1,
    });
    setFormErrors({});
    setSelectedItem(null);
    setDrawerMode('create');
  }

  function openEdit(fundItem: MutualFundContent) {
    setForm({
      fundId: fundItem.fundId ?? '',
      displayName: fundItem.displayName ?? '',
      shortDescription: fundItem.shortDescription ?? '',
      riskLevel: fundItem.riskLevel ?? 'Low Risk',
      isRecommended: fundItem.isRecommended ?? false,
      durationLabel: fundItem.durationLabel ?? '12 – 36 months',
      expectedYieldLabel: fundItem.expectedYieldLabel ?? '14.5% p.a.',
      howYouEarnText: fundItem.howYouEarnText ?? '',
      isActive: fundItem.isActive ?? true,
      displayOrder: fundItem.displayOrder ?? 0,
    });
    setFormErrors({});
    setSelectedItem(fundItem);
    setDrawerMode('edit');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const autoFundId = form.fundId.trim() || `AMF-MF-${String(Date.now()).slice(-6)}`;
      const formattedPayload: CreateMutualFundRequest = {
        ...form,
        fundId: autoFundId,
        displayName: form.displayName.trim(),
        shortDescription: form.shortDescription?.trim() || '',
        durationLabel: form.durationLabel?.trim() || '',
        expectedYieldLabel: form.expectedYieldLabel?.trim() || '',
        howYouEarnText: form.howYouEarnText?.trim() || '',
        displayOrder: drawerMode === 'create' ? maxDisplayOrder + 1 : form.displayOrder,
      };

      if (drawerMode === 'create') {
        await createFund(formattedPayload).unwrap();
        toast.success('Mutual fund content created successfully.', 'Created');
      } else if (selectedItem) {
        await updateFund({ id: selectedItem.id, body: formattedPayload }).unwrap();
        toast.success('Mutual fund content updated successfully.', 'Updated');
      }
      setDrawerMode(null);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Operation failed.', 'Error');
    }
  }

  async function handleToggleActive(fundItem: MutualFundContent) {
    try {
      const payload: CreateMutualFundRequest = {
        fundId: fundItem.fundId ?? '',
        displayName: fundItem.displayName ?? '',
        shortDescription: fundItem.shortDescription ?? '',
        riskLevel: fundItem.riskLevel ?? 'Low Risk',
        isRecommended: fundItem.isRecommended ?? false,
        durationLabel: fundItem.durationLabel ?? '',
        expectedYieldLabel: fundItem.expectedYieldLabel ?? '',
        howYouEarnText: fundItem.howYouEarnText ?? '',
        isActive: !fundItem.isActive,
        displayOrder: fundItem.displayOrder ?? 0,
      };
      await updateFund({ id: fundItem.id, body: payload }).unwrap();
      toast.success(
        `"${fundItem.displayName}" ${!fundItem.isActive ? 'activated' : 'deactivated'}.`,
        !fundItem.isActive ? 'Active' : 'Inactive'
      );
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Toggle status failed.', 'Error');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteFund(deleteTarget.id).unwrap();
      toast.success(`"${deleteTarget.displayName}" deleted successfully.`, 'Deleted');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Delete failed.', 'Delete Failed');
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#961A1C]/10 flex items-center justify-center">
            <PieChart size={20} className="text-[#961A1C]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Mutual Funds Offerings & Portfolio
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Manage retail mutual fund options, allocations, yield projections, and holdings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus size={15} /> Add Mutual Fund
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-medium text-gray-400 block mb-1">Total Mutual Funds</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{isFetching ? '—' : totalCount}</h3>
          <span className="text-[11px] text-emerald-600 font-semibold">{activeCount} Active in catalog</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-medium text-gray-400 block mb-1">Recommended Funds</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{recommendedCount}</h3>
          <span className="text-[11px] text-amber-600 font-semibold">Featured for retail investors</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-medium text-gray-400 block mb-1">Average Yield</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">14.8% p.a.</h3>
          <span className="text-[11px] text-blue-600 font-semibold">+2.4% return projection</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-medium text-gray-400 block mb-1">App LMS Sync</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Live Sync</h3>
          <span className="text-[11px] text-emerald-600 font-semibold">Real-time mobile API</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-xs overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700/80 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search mutual funds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="All">All Risk Levels</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Moderate Risk">Moderate Risk</option>
              <option value="High Risk">High Risk</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table content */}
        <div className="min-h-[300px]">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
              <Loader2 size={24} className="animate-spin text-[#961A1C]" />
              <span className="text-xs font-medium">Loading mutual funds from API...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
              <PieChart size={30} className="opacity-40" />
              <span className="text-xs font-medium">No mutual fund items found.</span>
              <button onClick={openCreate} className="text-xs text-[#961A1C] font-semibold hover:underline">
                Create First Mutual Fund
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">S/N</th>
                  <th className="px-4 py-3">Display Name & ID</th>
                  <th className="px-4 py-3">Risk Level</th>
                  <th className="px-4 py-3">Yield & Tenor</th>
                  <th className="px-4 py-3 text-center">Recommended</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filtered.map((fundItem, idx) => (
                  <tr key={fundItem.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-gray-700 dark:text-gray-300">
                      #{idx + 1}
                    </td>

                    <td className="px-4 py-3.5">
                      <div>
                        <span className="font-bold text-sm text-gray-900 dark:text-white block">
                          {fundItem.displayName}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          {fundItem.fundId || fundItem.id}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200">
                        <PiCellSignalHighFill className="text-amber-600" />
                        {fundItem.riskLevel || 'Low Risk'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {fundItem.expectedYieldLabel || '14.5% p.a.'}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {fundItem.durationLabel || '12-36 months'}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {fundItem.isRecommended ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          <Star size={10} className="fill-amber-500 text-amber-500" /> Featured
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <Switch
                        size="small"
                        checked={fundItem.isActive}
                        onChange={() => handleToggleActive(fundItem)}
                      />
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(fundItem)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(fundItem)}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Drawer for Create / Edit Mutual Fund (maskClosable=true) */}
      <Drawer
        open={Boolean(drawerMode)}
        onClose={() => setDrawerMode(null)}
        width={560}
        destroyOnClose
        maskClosable={true}
        className="dark:bg-gray-900"
        title={
          <h3 className="text-md font-semibold text-gray-900 dark:text-white">
            {drawerMode === 'create' ? 'Add Mutual Fund' : 'Edit Mutual Fund'}
          </h3>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-4">
          <div className="flex-1 overflow-y-auto space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="e.g. ARM Ethical Fund"
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
              />
              {formErrors.displayName && <p className="text-xs text-red-500 mt-1">{formErrors.displayName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Short Description
              </label>
              <textarea
                rows={2}
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                placeholder="Brief summary of fund strategy..."
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Expected Yield Label
                </label>
                <input
                  type="text"
                  value={form.expectedYieldLabel}
                  onChange={(e) => setForm({ ...form, expectedYieldLabel: e.target.value })}
                  placeholder="e.g. 14.5% p.a."
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Duration Label
                </label>
                <input
                  type="text"
                  value={form.durationLabel}
                  onChange={(e) => setForm({ ...form, durationLabel: e.target.value })}
                  placeholder="e.g. 12 – 36 months"
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Risk Level
              </label>
              <Select
                value={form.riskLevel || 'Low Risk'}
                onChange={(val) => setForm({ ...form, riskLevel: val })}
                options={[
                  { value: 'Low Risk', label: 'Low Risk' },
                  { value: 'Moderate Risk', label: 'Moderate Risk' },
                  { value: 'High Risk', label: 'High Risk' },
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                How You Earn Text
              </label>
              <textarea
                rows={2}
                value={form.howYouEarnText}
                onChange={(e) => setForm({ ...form, howYouEarnText: e.target.value })}
                placeholder="Details on returns calculation and payout schedule..."
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Featured Recommendation</span>
              <Switch
                checked={form.isRecommended}
                onChange={(checked) => setForm({ ...form, isRecommended: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Active Status</span>
              <Switch
                checked={form.isActive}
                onChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="w-full py-3 bg-[#961A1C] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#7a1517] transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isCreating || isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            <span>{drawerMode === 'create' ? 'Create Mutual Fund' : 'Save Changes'}</span>
          </button>
        </form>
      </Drawer>

      {/* Delete Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onOk={handleDelete}
        confirmLoading={isDeleting}
        okText="Delete Fund"
        okButtonProps={{ danger: true }}
        width={380}
        centered
      >
        <div className="py-2 text-xs text-gray-600 dark:text-gray-300">
          Are you sure you want to delete mutual fund <strong>&ldquo;{deleteTarget?.displayName}&rdquo;</strong>?
        </div>
      </Modal>

    </div>
  );
}
