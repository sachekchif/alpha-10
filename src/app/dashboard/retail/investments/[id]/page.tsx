'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Modal, Drawer, Select, Switch, Pagination, Progress } from 'antd';
import {
  ArrowLeft, Pencil, Trash2, X, Loader2, AlertCircle,
  Check, Plus, RefreshCw, Search
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
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800',
    icon: <PiCellSignalMediumFill className="text-emerald-600 text-sm" />,
  },
  Medium: {
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800',
    icon: <PiCellSignalHighFill className="text-amber-600 text-sm" />,
  },
  High: {
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800',
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

  const [activeTab, setActiveTab] = useState<'products' | 'details'>('products');
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
    <div className="flex flex-col gap-6 pb-12 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <button
            onClick={() => router.push('/dashboard/retail/investments')}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Investments
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {item?.title || 'Loading...'}
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
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              <Pencil size={13} /> Edit Module
            </button>
            <button
              onClick={() => setIsConfirmDelete(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg hover:bg-red-100 transition cursor-pointer"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
          <Loader2 size={24} className="animate-spin text-[#961A1C]" />
          <span className="text-xs font-medium">Loading details...</span>
        </div>
      ) : isError || !item ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center gap-2 text-gray-400">
          <AlertCircle size={24} className="text-[#961A1C]" />
          <p className="text-xs font-medium">Failed to load investment details.</p>
          <button onClick={() => refetch()} className="text-xs text-[#961A1C] hover:underline font-medium">Try again</button>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Clean Enterprise Tabs Navigation */}
          {isMutualFundsModule && (
            <div className="flex border-b border-gray-200 dark:border-gray-800 gap-8 text-sm">
              <button
                onClick={() => setActiveTab('products')}
                className={`pb-3 transition-colors relative cursor-pointer font-medium ${
                  activeTab === 'products'
                    ? 'text-[#961A1C] font-semibold border-b-2 border-[#961A1C]'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Products
              </button>

              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 transition-colors relative cursor-pointer font-medium ${
                  activeTab === 'details'
                    ? 'text-[#961A1C] font-semibold border-b-2 border-[#961A1C]'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                More Details
              </button>
            </div>
          )}

          {/* TAB 1: PRODUCTS TABLE (FOR MUTUAL FUNDS) */}
          {isMutualFundsModule && activeTab === 'products' && (
            <div>
              <MutualFundsManagementSuite />
            </div>
          )}

          {/* TAB 2: MORE DETAILS */}
          {(!isMutualFundsModule || activeTab === 'details') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">

              {/* Main Content Area */}
              <div className="lg:col-span-8 space-y-6">

                {/* Risk & Category Header */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    Intermediate
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.bg} ${meta.color}`}>
                    {meta.icon}
                    {item.riskLevel || 'Low'}
                  </span>
                </div>

                {/* Summary Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.title}
                    </h2>
                    {item.heroText && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                        {item.heroText}
                      </p>
                    )}
                  </div>

                  {item.detailsText && (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60">
                      <span className="text-xs font-semibold text-gray-400 block mb-2">
                        Details & Terms
                      </span>
                      <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {item.detailsText}
                      </div>
                    </div>
                  )}
                </div>

                {/* Step-by-Step Guide */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    How It Works
                  </h3>

                  {parsedSteps.length > 0 ? (
                    <div className="space-y-3">
                      {parsedSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                          <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                            {step.replace(/^\d+\.\s*/, '')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : item.howItWorksText ? (
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {item.howItWorksText}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No step guide provided.</p>
                  )}
                </div>

              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4 space-y-4">

                {/* Engagement Metrics (Test Data Overlay) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4 relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-gray-900/90 text-amber-400 border border-amber-500/30 text-[10px] font-medium px-2 py-0.5 rounded shadow-xs">
                    TEST DATA
                  </div>

                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Product Usage
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 font-medium block mb-0.5">Total Viewers</span>
                      <p className="text-base font-bold text-gray-900 dark:text-white">48,200</p>
                    </div>

                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 font-medium block mb-0.5">Completion</span>
                      <p className="text-base font-bold text-gray-900 dark:text-white">71.4%</p>
                    </div>

                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 font-medium block mb-0.5">Avg Watch Time</span>
                      <p className="text-base font-bold text-gray-900 dark:text-white">4.2 min</p>
                    </div>

                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 font-medium block mb-0.5">Active Now</span>
                      <p className="text-base font-bold text-gray-900 dark:text-white">1,420</p>
                    </div>
                  </div>
                </div>

                {/* Capital Card */}
                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase block">Capital Requirement</span>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">Capital Guaranteed</p>
                  </div>
                  {item.capitalGuaranteed ? (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Yes</span>
                  ) : (
                    <span className="text-xs font-medium text-gray-400">No</span>
                  )}
                </div>

                {/* ROI Card */}
                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase block">ROI & Returns</span>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">Returns Guaranteed</p>
                  </div>
                  {item.returnsGuaranteed ? (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Yes</span>
                  ) : (
                    <span className="text-xs font-medium text-gray-400">No</span>
                  )}
                </div>

                {/* Withdrawal Card */}
                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase block">Withdrawals</span>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">Restrictions</p>
                  </div>
                  {item.withdrawalRestrictions ? (
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Restricted</span>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Flexible</span>
                  )}
                </div>

                {/* Risk Level Profile */}
                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Risk Profile</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.bg} ${meta.color}`}>
                    {meta.icon}
                    {item.riskLevel || 'Low'}
                  </span>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* Edit Drawer (maskClosable=true) */}
      <Drawer
        open={Boolean(isEditing && form)}
        onClose={() => setIsEditing(false)}
        width={520}
        destroyOnClose
        maskClosable={true}
        className="dark:bg-gray-900"
        title={
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Edit Investment
          </h3>
        }
      >
        {form && (
          <form onSubmit={handleUpdate} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Investment Type
                  </label>
                  <Select
                    value={form.code || 'mutual_funds'}
                    onChange={(val) => setForm({ ...form, code: val })}
                    options={INVESTMENT_TYPES}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Risk Level
                  </label>
                  <Select
                    value={form.riskLevel || 'Low'}
                    onChange={(val) => setForm({ ...form, riskLevel: val as RiskLevel })}
                    options={RISK_LEVELS.map((r) => ({ value: r, label: r }))}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hero Text
                </label>
                <textarea
                  rows={2}
                  value={form.heroText}
                  onChange={(e) => setForm({ ...form, heroText: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Details Text
                </label>
                <textarea
                  rows={3}
                  value={form.detailsText}
                  onChange={(e) => setForm({ ...form, detailsText: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-700 dark:text-gray-300">Capital Guaranteed</span>
                  <Switch
                    checked={form.capitalGuaranteed}
                    onChange={(checked) => setForm({ ...form, capitalGuaranteed: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-700 dark:text-gray-300">Returns Guaranteed</span>
                  <Switch
                    checked={form.returnsGuaranteed}
                    onChange={(checked) => setForm({ ...form, returnsGuaranteed: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-700 dark:text-gray-300">Withdrawal Restrictions</span>
                  <Switch
                    checked={form.withdrawalRestrictions}
                    onChange={(checked) => setForm({ ...form, withdrawalRestrictions: checked })}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-2.5 mt-4 bg-[#961A1C] text-white font-medium text-xs rounded-lg hover:bg-[#7a1517] transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              <span>Save Changes</span>
            </button>
          </form>
        )}
      </Drawer>

      {/* Delete Modal */}
      <Modal
        open={Boolean(isConfirmDelete)}
        onCancel={() => setIsConfirmDelete(false)}
        footer={null}
        width={380}
        centered
      >
        <div className="py-2 text-center">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Delete Investment</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-xs">
            Are you sure you want to delete <strong>&ldquo;{item?.title}&rdquo;</strong>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsConfirmDelete(false)}
              className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white font-medium rounded-lg text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-xs disabled:opacity-60 cursor-pointer"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── MUTUAL FUNDS MANAGEMENT SUITE ───────────────────────────────────────────
function MutualFundsManagementSuite() {
  const router = useRouter();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<MutualFundContent | null>(null);
  const [form, setForm] = useState<CreateMutualFundRequest>(emptyMutualFundForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<MutualFundContent | null>(null);

  const [viewingFund, setViewingFund] = useState<MutualFundContent | null>(null);

  const { data, isFetching, refetch } = useGetMutualFundContentsQuery({ pageNumber, pageSize });
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

  // Risk badge helper
  const renderRiskBadge = (riskStr?: string) => {
    const r = (riskStr || '').toLowerCase();
    if (r.includes('low')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <PiCellSignalMediumFill className="text-emerald-600 text-xs" />
          Low Risk
        </span>
      );
    }
    if (r.includes('high')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800">
          <PiCellSignalFullFill className="text-red-600 text-xs" />
          High Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
        <PiCellSignalHighFill className="text-amber-600 text-xs" />
        {riskStr || 'Medium Risk'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Clean Minimalist Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Total Funds</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{isFetching ? '—' : totalCount}</h3>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">{activeCount} active in catalog</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Featured</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{recommendedCount}</h3>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">Recommended products</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Average Expected Yield</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">14.8% p.a.</h3>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">+2.4% return projection</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Status</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Live Sync</h3>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Mobile catalog active</span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-3 justify-between items-center bg-gray-50/50 dark:bg-gray-900/30">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search mutual funds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-1.5 pl-9 pr-8 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Risk Levels</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Moderate Risk">Moderate Risk</option>
              <option value="High Risk">High Risk</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-xs text-gray-500 bg-gray-100 dark:bg-gray-800">
              {filtered.length} products
            </span>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg transition cursor-pointer"
            >
              <Plus size={14} /> Add Investment
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="min-h-[300px]">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
              <Loader2 size={24} className="animate-spin text-[#961A1C]" />
              <span className="text-xs font-medium">Loading catalog...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
              <span className="text-xs font-medium">No mutual funds found.</span>
              <button onClick={openCreate} className="text-xs text-[#961A1C] font-semibold hover:underline mt-1">
                + Add Mutual Fund
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50/80 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">S/N</th>
                  <th className="px-5 py-3">Name & Code</th>
                  <th className="px-5 py-3">Risk Level</th>
                  <th className="px-5 py-3">Expected Yield</th>
                  <th className="px-5 py-3 text-center">Featured</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filtered.map((fundItem, idx) => (
                  <tr
                    key={fundItem.id}
                    onClick={() => setViewingFund(fundItem)}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-mono text-gray-500">
                      #{(pageNumber - 1) * pageSize + idx + 1}
                    </td>

                    <td className="px-5 py-3.5">
                      <div>
                        <span className="font-semibold text-sm text-gray-900 dark:text-white block">
                          {fundItem.displayName}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          {fundItem.fundId || fundItem.id}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {renderRiskBadge(fundItem.riskLevel)}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        {fundItem.expectedYieldLabel || '14.5% p.a.'}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {fundItem.durationLabel || '12 – 36 months'}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      {fundItem.isRecommended ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200">
                          Featured
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        size="small"
                        checked={fundItem.isActive}
                        onChange={() => handleToggleActive(fundItem)}
                      />
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(fundItem)}
                          className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded transition cursor-pointer"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(fundItem)}
                          className="p-1 text-red-500 hover:text-red-700 rounded transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
            <span className="text-xs text-gray-500 font-medium">
              Showing {filtered.length} of {totalCount} entries
            </span>

            <Pagination
              current={pageNumber}
              pageSize={pageSize}
              total={totalCount}
              onChange={(page, pSize) => {
                setPageNumber(page);
                if (pSize) setPageSize(pSize);
              }}
              showSizeChanger
              pageSizeOptions={['10', '20', '50']}
              size="small"
            />
          </div>
        )}
      </div>

      {/* Portfolio Detail Drawer (maskClosable=true) */}
      <Drawer
        open={Boolean(viewingFund)}
        onClose={() => setViewingFund(null)}
        width={560}
        destroyOnClose
        maskClosable={true}
        className="dark:bg-gray-900"
        title={
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {viewingFund?.displayName}
            </h3>
            <p className="text-[10px] text-gray-400 font-mono">{viewingFund?.fundId}</p>
          </div>
        }
      >
        {viewingFund && (
          <MutualFundDetailDrawerContent fundId={viewingFund.id} initialFund={viewingFund} />
        )}
      </Drawer>

      {/* Create / Edit Drawer (maskClosable=true) */}
      <Drawer
        open={Boolean(drawerMode)}
        onClose={() => setDrawerMode(null)}
        width={520}
        destroyOnClose
        maskClosable={true}
        className="dark:bg-gray-900"
        title={
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {drawerMode === 'create' ? 'Add Investment' : 'Edit Investment'}
          </h3>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-4">
          <div className="flex-1 overflow-y-auto space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="e.g. ARM Ethical Fund"
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
              />
              {formErrors.displayName && <p className="text-xs text-red-500 mt-1">{formErrors.displayName}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                placeholder="Brief summary..."
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expected Yield
                </label>
                <input
                  type="text"
                  value={form.expectedYieldLabel}
                  onChange={(e) => setForm({ ...form, expectedYieldLabel: e.target.value })}
                  placeholder="e.g. 14.5% p.a."
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={form.durationLabel}
                  onChange={(e) => setForm({ ...form, durationLabel: e.target.value })}
                  placeholder="e.g. 12 – 36 months"
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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

            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-700 dark:text-gray-300">Featured Recommendation</span>
              <Switch
                checked={form.isRecommended}
                onChange={(checked) => setForm({ ...form, isRecommended: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-700 dark:text-gray-300">Active Status</span>
              <Switch
                checked={form.isActive}
                onChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="w-full py-2.5 bg-[#961A1C] text-white font-semibold text-xs rounded-lg hover:bg-[#7a1517] transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isCreating || isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            <span>{drawerMode === 'create' ? 'Create Investment' : 'Save Changes'}</span>
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
          Are you sure you want to delete <strong>&ldquo;{deleteTarget?.displayName}&rdquo;</strong>?
        </div>
      </Modal>

    </div>
  );
}

// ─── MUTUAL FUND DETAIL DRAWER CONTENT ───────────────────────────────────────
function MutualFundDetailDrawerContent({ fundId, initialFund }: { fundId: string; initialFund: MutualFundContent }) {
  const toast = useToast();
  const { data } = useGetMutualFundContentQuery(fundId);
  const [updateAllocations, { isLoading: isSavingAlloc }] = useUpdateMutualFundAllocationsMutation();
  const [updateHoldings, { isLoading: isSavingHoldings }] = useUpdateMutualFundHoldingsMutation();

  const fund = data?.data || initialFund;
  const fundAny = fund as any;

  const [allocations, setAllocations] = useState<AllocationItem[]>([]);
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);

  useEffect(() => {
    if (fundAny) {
      setAllocations(fundAny.allocations ?? []);
      setHoldings(fundAny.holdings ?? []);
    }
  }, [fundAny]);

  async function handleSaveAllocations() {
    try {
      await updateAllocations({ id: fundId, items: allocations }).unwrap();
      toast.success('Asset allocations updated.', 'Saved');
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Failed to save allocations.', 'Error');
    }
  }

  async function handleSaveHoldings() {
    try {
      await updateHoldings({ id: fundId, items: holdings }).unwrap();
      toast.success('Fund holdings updated.', 'Saved');
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Failed to save holdings.', 'Error');
    }
  }

  return (
    <div className="space-y-6 text-xs overflow-y-auto max-h-full pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      
      {/* Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <span className="text-[10px] font-semibold text-gray-400 uppercase">Expected Yield</span>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{fund.expectedYieldLabel || '14.5% p.a.'}</p>
        </div>

        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <span className="text-[10px] font-semibold text-gray-400 uppercase">Tenor Duration</span>
          <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{fund.durationLabel || '12 – 36 months'}</p>
        </div>
      </div>

      {fund.shortDescription && (
        <div className="p-3.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase">Description</span>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{fund.shortDescription}</p>
        </div>
      )}

      {/* Asset Allocations */}
      <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 dark:text-white">Asset Allocation</h4>
          <button
            onClick={() => setAllocations([...allocations, { assetName: 'New Asset Class', minPercent: 0, maxPercent: 20 }])}
            className="text-[11px] font-semibold text-[#961A1C] hover:underline cursor-pointer"
          >
            + Add Asset
          </button>
        </div>

        {allocations.length === 0 ? (
          <p className="text-gray-400 italic">No asset allocations defined yet.</p>
        ) : (
          <div className="space-y-3">
            {allocations.map((alloc, idx) => (
              <div key={idx} className="space-y-1 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={alloc.assetName}
                    onChange={(e) => {
                      const updated = [...allocations];
                      updated[idx].assetName = e.target.value;
                      setAllocations(updated);
                    }}
                    className="font-medium text-gray-800 dark:text-gray-200 bg-transparent outline-none border-b border-dashed border-gray-300 dark:border-gray-700"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">Min:</span>
                    <input
                      type="number"
                      value={alloc.minPercent}
                      onChange={(e) => {
                        const updated = [...allocations];
                        updated[idx].minPercent = Number(e.target.value);
                        setAllocations(updated);
                      }}
                      className="w-10 font-bold text-right text-gray-900 dark:text-white bg-transparent outline-none border-b border-dashed border-gray-300 dark:border-gray-700"
                    />
                    <span className="text-[10px] text-gray-400">Max:</span>
                    <input
                      type="number"
                      value={alloc.maxPercent}
                      onChange={(e) => {
                        const updated = [...allocations];
                        updated[idx].maxPercent = Number(e.target.value);
                        setAllocations(updated);
                      }}
                      className="w-10 font-bold text-right text-gray-900 dark:text-white bg-transparent outline-none border-b border-dashed border-gray-300 dark:border-gray-700"
                    />
                    <span className="font-bold text-gray-400">%</span>
                    <button
                      onClick={() => setAllocations(allocations.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
                <Progress percent={alloc.maxPercent} strokeColor="#961A1C" showInfo={false} size="small" />
              </div>
            ))}

            <button
              onClick={handleSaveAllocations}
              disabled={isSavingAlloc}
              className="w-full py-2 bg-[#961A1C] text-white font-medium rounded-lg text-xs hover:bg-[#7a1517] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSavingAlloc ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              <span>Save Allocations</span>
            </button>
          </div>
        )}
      </div>

      {/* Fund Holdings */}
      <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 dark:text-white">Holdings</h4>
          <button
            onClick={() => setHoldings([...holdings, { holdingName: 'New Holding Security', minPercent: 0, maxPercent: 10 }])}
            className="text-[11px] font-semibold text-[#961A1C] hover:underline cursor-pointer"
          >
            + Add Holding
          </button>
        </div>

        {holdings.length === 0 ? (
          <p className="text-gray-400 italic">No holdings added yet.</p>
        ) : (
          <div className="space-y-2">
            {holdings.map((hold, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                <input
                  type="text"
                  value={hold.holdingName}
                  onChange={(e) => {
                    const updated = [...holdings];
                    updated[idx].holdingName = e.target.value;
                    setHoldings(updated);
                  }}
                  className="font-medium text-gray-800 dark:text-gray-200 bg-transparent outline-none border-b border-dashed border-gray-300 dark:border-gray-700"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">Max:</span>
                  <input
                    type="number"
                    value={hold.maxPercent}
                    onChange={(e) => {
                      const updated = [...holdings];
                      updated[idx].maxPercent = Number(e.target.value);
                      setHoldings(updated);
                    }}
                    className="w-10 font-bold text-right text-gray-900 dark:text-white bg-transparent outline-none border-b border-dashed border-gray-300 dark:border-gray-700"
                  />
                  <span className="font-bold text-gray-400">%</span>
                  <button
                    onClick={() => setHoldings(holdings.filter((_, i) => i !== idx))}
                    className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={handleSaveHoldings}
              disabled={isSavingHoldings}
              className="w-full py-2 bg-[#961A1C] text-white font-medium rounded-lg text-xs hover:bg-[#7a1517] transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              {isSavingHoldings ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              <span>Save Holdings</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
