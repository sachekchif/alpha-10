'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Modal, Drawer, Select, Switch } from 'antd';
import {
  ArrowLeft, BookOpen, Pencil, Trash2, X, Loader2, AlertCircle,
  Check, Shield, BarChart2, TrendingUp, Clock, Eye, Sparkles,
  Wifi, Play, Plus, Upload, Users, Award, Zap,
} from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetInvestmentEducationQuery,
  useUpdateInvestmentEducationMutation,
  useDeleteInvestmentEducationMutation,
  CreateInvestmentEducationRequest,
} from '@/auth/services/adminApi';
import { useToast } from '@/auth/components/ToastContainer';

const RISK_LEVELS = ['Low', 'Medium', 'High', 'Very High'] as const;
type RiskLevel = typeof RISK_LEVELS[number];

const RISK_META: Record<RiskLevel, { color: string; bg: string; dot: string }> = {
  Low: { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', dot: 'bg-emerald-500' },
  Medium: { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', dot: 'bg-amber-500' },
  High: { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30', dot: 'bg-orange-500' },
  'Very High': { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', dot: 'bg-red-500' },
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
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  const { data, isLoading, isError, refetch } = useGetInvestmentEducationQuery(id);
  const [updateItem, { isLoading: isUpdating }] = useUpdateInvestmentEducationMutation();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteInvestmentEducationMutation();

  const item = data?.data;

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
      riskLevel: item.riskLevel ?? 'Low',
      capitalGuaranteed: item.capitalGuaranteed ?? false,
      returnsGuaranteed: item.returnsGuaranteed ?? false,
      withdrawalRestrictions: item.withdrawalRestrictions ?? false,
      isActive: item.isActive ?? true,
      displayOrder: item.displayOrder ?? 0,
      category: 'Fixed Income',
      tags: 'Intermediate',
    });
    setSteps(rawSteps.length > 0 ? rawSteps : ['Choose an investment product that matches your financial goals.']);
    setCoverImage(null);
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
      toast.success('Investment product updated successfully.', 'Updated');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Update failed.', 'Error');
    }
  }

  async function handleDelete() {
    try {
      await deleteItem(id).unwrap();
      toast.success('Product deleted successfully.', 'Deleted');
      router.push('/dashboard/retail/investments');
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Delete failed.', 'Delete Failed');
    }
  }

  const risk = (item?.riskLevel || 'Low') as RiskLevel;
  const meta = RISK_META[risk] ?? RISK_META['Low'];

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
            <ArrowLeft size={14} /> Back to Investment Products
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
              <Pencil size={14} /> Edit Product
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
      ) : (
        /* ── 70% / 30% Split Layout ──────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">

          {/* ── 70% Left Main Content Area (lg:col-span-8) ───────────── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Level Badge & Video Cover Media Box */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/30">
                  Intermediate
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.color}`}>
                  <Wifi size={12} />
                  {item.riskLevel || 'Low'}
                </span>
              </div>

              <div className="relative w-full h-64 sm:h-80 bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 flex items-center justify-center shadow-sm group">
                <div className="w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition cursor-pointer">
                  <Play size={28} className="ml-1 fill-white" />
                </div>
                <div className="absolute bottom-4 left-4 text-xs font-semibold text-white/90 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  12 min watch · Retail investor mobile hero video preview
                </div>
              </div>
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
                How It Works — Step-by-Step Investor Guide
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

            {/* Engagement & Viewer Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 p-5 space-y-4 shadow-xs">
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
                    Would the user need capital to understand this lecture?
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
                    The customer would get ROI after taking this lecture
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
                    Would the user have restrictions on withdrawal?
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
                  <Wifi size={15} className="text-[#961A1C]" />
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                    Risk Level Profile
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.color}`}>
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
                    Retail users can now have access to this investment product
                  </p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Edit Drawer (Ant Design Drawer) */}
      <Drawer
        open={Boolean(isEditing && form)}
        onClose={() => setIsEditing(false)}
        width={560}
        destroyOnClose
        maskClosable={false}
        className="dark:bg-gray-900"
        title={
          <div className="flex items-center justify-between text-gray-900 dark:text-white">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white">
              Edit Investment Product
            </h3>
          </div>
        }
      >
        {form && (
          <form onSubmit={handleUpdate} className="flex flex-col h-full">

            <div className="flex-1 overflow-y-auto space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {/* Cover Image Uploading & Preview Area */}
              <div className="relative w-full h-48 bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 flex flex-col items-center justify-center group">
                {coverImage ? (
                  <>
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover opacity-85" />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                        <Play size={20} className="ml-1 fill-white" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCoverImage(null)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full p-4 hover:bg-gray-800/60 transition text-gray-400">
                    <div className="w-12 h-12 rounded-full bg-red-600/20 text-[#961A1C] flex items-center justify-center mb-2">
                      <Play size={20} className="ml-1 fill-[#961A1C]" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200">
                      <Upload size={14} /> Click or drop cover media thumbnail
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">App thumbnail preview placeholder (UI Only)</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCoverImage(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                )}
              </div>

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
                  placeholder="Product Title (e.g. Fixed Deposit Portfolio)"
                  className={`w-full text-xl sm:text-2xl font-bold bg-transparent text-gray-900 dark:text-white border-b-2 border-dashed focus:border-solid border-gray-300 dark:border-gray-700 py-1.5 focus:border-[#961A1C] outline-none transition placeholder:text-gray-300 dark:placeholder:text-gray-600 ${
                    formErrors.title ? 'border-red-500' : ''
                  }`}
                />
                {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
                <p className="text-[11px] text-gray-400 mt-1">Retail investor app header</p>
              </div>

              {/* Education / Investment Type Dropdown & Category Type Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Education Type *
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
                    placeholder="Investment product summary..."
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
                    placeholder="On Alpha10, mutual funds and fixed deposits are a good starting point..."
                  />
                </div>
              </div>

              {/* How It Works Section - Connected Steps */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                    How It Works (Steps)
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

              {/* Risk Level with Wifi icon */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Wifi size={16} className="text-[#961A1C]" />
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                    Risk Level
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {RISK_LEVELS.map((r) => {
                    const active = form.riskLevel === r;
                    const wifiColors: Record<RiskLevel, string> = {
                      Low: 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800',
                      Medium: 'text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800',
                      High: 'text-orange-700 bg-orange-50 border-orange-300 dark:bg-orange-950/40 dark:border-orange-800',
                      'Very High': 'text-red-700 bg-red-50 border-red-300 dark:bg-red-950/40 dark:border-red-800',
                    };
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm({ ...form, riskLevel: r })}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          active
                            ? `${wifiColors[r]} ring-2 ring-current shadow-xs`
                            : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Wifi size={13} className={active ? 'animate-pulse' : 'opacity-60'} />
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
                      Would the user need capital to understand this lecture?
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
                      The customer would get ROI after taking this lecture
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
                      Would the user have restrictions on withdrawal?
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
                      Retail users can now have access to this investment product
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
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Delete Product</h3>
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
