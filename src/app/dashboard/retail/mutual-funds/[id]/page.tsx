'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Modal, Drawer, Select, Switch } from 'antd';
import {
  ArrowLeft, PieChart, Pencil, Trash2, X, Loader2, AlertCircle,
  Plus, Check, Star, GripVertical, Sparkles, Wifi, TrendingUp,
  BarChart2, Users, DollarSign, Clock, ShieldCheck, Layers, Award, Zap, Upload,
} from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetMutualFundContentQuery,
  useUpdateMutualFundContentMutation,
  useDeleteMutualFundContentMutation,
  useUpdateMutualFundAllocationsMutation,
  useUpdateMutualFundHoldingsMutation,
  CreateMutualFundRequest,
  AllocationItem,
  HoldingItem,
} from '@/auth/services/adminApi';
import { useToast } from '@/auth/components/ToastContainer';

const RISK_LEVELS = ['Low Risk', 'Moderate Risk', 'High Risk', 'Very High Risk'];
type Tab = 'overview' | 'allocations' | 'holdings';

const RISK_META: Record<string, { color: string; bg: string }> = {
  'Low Risk': { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  'Moderate Risk': { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  'High Risk': { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800' },
  'Very High Risk': { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800' },
};

export default function MutualFundDetailPage() {
  return (
    <RoleGuard allowedRoles={['SuperAdmin', 'Control']}>
      <MutualFundDetailContent />
    </RoleGuard>
  );
}

function MutualFundDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data, isLoading, isError, refetch } = useGetMutualFundContentQuery(id);
  const [updateFund, { isLoading: isUpdating }] = useUpdateMutualFundContentMutation();
  const [deleteFund, { isLoading: isDeleting }] = useDeleteMutualFundContentMutation();
  const [updateAllocations, { isLoading: isSavingAlloc }] = useUpdateMutualFundAllocationsMutation();
  const [updateHoldings, { isLoading: isSavingHoldings }] = useUpdateMutualFundHoldingsMutation();

  const fund = data?.data;

  // Edit overview state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<CreateMutualFundRequest | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  // Allocations & Holdings state
  const [allocations, setAllocations] = useState<AllocationItem[]>([]);
  const [allocDirty, setAllocDirty] = useState(false);
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [holdingsDirty, setHoldingsDirty] = useState(false);

  useEffect(() => {
    if (fund) {
      const fundAny = fund as any;
      setAllocations(fundAny.allocations ?? []);
      setHoldings(fundAny.holdings ?? []);
    }
  }, [fund]);

  function openEdit() {
    if (!fund) return;
    setEditForm({
      fundId: fund.fundId ?? '',
      displayName: fund.displayName ?? '',
      shortDescription: fund.shortDescription ?? '',
      riskLevel: fund.riskLevel ?? 'Low Risk',
      isRecommended: fund.isRecommended ?? false,
      durationLabel: fund.durationLabel ?? '12 – 36 months',
      expectedYieldLabel: fund.expectedYieldLabel ?? '14.5% p.a.',
      howYouEarnText: fund.howYouEarnText ?? '',
      isActive: fund.isActive ?? true,
      displayOrder: fund.displayOrder ?? 0,
    });
    setCoverImage(null);
    setFormErrors({});
    setIsEditing(true);
  }

  function validateEditForm() {
    if (!editForm) return false;
    const errors: Record<string, string> = {};
    if (!editForm.displayName?.trim()) errors.displayName = 'Display name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleUpdateFund(e: React.FormEvent) {
    e.preventDefault();
    if (!editForm || !validateEditForm()) return;
    try {
      const formattedBody: CreateMutualFundRequest = {
        ...editForm,
        displayName: editForm.displayName.trim(),
        shortDescription: editForm.shortDescription?.trim() || '',
        durationLabel: editForm.durationLabel?.trim() || '',
        expectedYieldLabel: editForm.expectedYieldLabel?.trim() || '',
        howYouEarnText: editForm.howYouEarnText?.trim() || '',
      };
      await updateFund({ id, body: formattedBody }).unwrap();
      toast.success('Mutual fund updated successfully.', 'Updated');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Update failed.', 'Error');
    }
  }

  async function handleDelete() {
    try {
      await deleteFund(id).unwrap();
      toast.success('Fund deleted.', 'Deleted');
      router.push('/dashboard/retail/mutual-funds');
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Delete failed.', 'Delete Failed');
    }
  }

  // Allocations helpers
  function addAllocation() {
    setAllocations((prev) => [...prev, { assetName: '', minPercent: 0, maxPercent: 0, colorHex: '#961A1C', displayOrder: prev.length }]);
    setAllocDirty(true);
  }

  function updateAllocation(idx: number, field: keyof AllocationItem, value: string | number) {
    setAllocations((prev) => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
    setAllocDirty(true);
  }

  function removeAllocation(idx: number) {
    setAllocations((prev) => prev.filter((_, i) => i !== idx));
    setAllocDirty(true);
  }

  async function saveAllocations() {
    try {
      await updateAllocations({ id, items: allocations }).unwrap();
      toast.success('Allocations saved successfully.', 'Saved');
      setAllocDirty(false);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Save failed.', 'Error');
    }
  }

  // Holdings helpers
  function addHolding() {
    setHoldings((prev) => [...prev, { holdingName: '', minPercent: 0, maxPercent: 0, displayOrder: prev.length }]);
    setHoldingsDirty(true);
  }

  function updateHolding(idx: number, field: keyof HoldingItem, value: string | number) {
    setHoldings((prev) => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
    setHoldingsDirty(true);
  }

  function removeHolding(idx: number) {
    setHoldings((prev) => prev.filter((_, i) => i !== idx));
    setHoldingsDirty(true);
  }

  async function saveHoldings() {
    try {
      await updateHoldings({ id, items: holdings }).unwrap();
      toast.success('Holdings saved successfully.', 'Saved');
      setHoldingsDirty(false);
    } catch (err: any) {
      toast.error(err?.data?.statusMessage || 'Save failed.', 'Error');
    }
  }

  const riskMeta = RISK_META[fund?.riskLevel || 'Low Risk'] ?? RISK_META['Low Risk'];

  return (
    <div className="flex flex-col gap-6 pb-12 w-full animate-in fade-in duration-500">
      
      {/* ── Top Header Section (No background) ────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-transparent pb-3 border-b border-gray-200/60 dark:border-gray-800">
        <div>
          <button
            onClick={() => router.push('/dashboard/retail/mutual-funds')}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors mb-1.5 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Mutual Funds
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {fund?.displayName || 'Loading Fund Details...'}
          </h1>
          {fund && (
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
                {fund.fundId}
              </span>
              <span>·</span>
              <span className={fund.isActive ? 'text-emerald-600 font-semibold' : 'text-gray-400'}>
                {fund.isActive ? 'Active (Retail users have access)' : 'Draft Mode'}
              </span>
            </p>
          )}
        </div>

        {fund && (
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={openEdit}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-xs transition cursor-pointer"
            >
              <Pencil size={14} /> Edit Fund
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
          <span className="text-sm font-medium">Loading mutual fund analysis...</span>
        </div>
      ) : isError || !fund ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 flex flex-col items-center gap-3 text-gray-400">
          <AlertCircle size={28} className="text-[#961A1C]" />
          <p className="text-sm font-medium">Failed to load fund details.</p>
          <button onClick={() => refetch()} className="text-xs text-[#961A1C] hover:underline font-semibold">Try again</button>
        </div>
      ) : (
        /* ── 70% / 30% Split Layout ──────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">

          {/* ── 70% Left Main Content Area (lg:col-span-8) ───────────── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Retail App Hero Yield & Chart Performance Preview */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white border border-gray-800 shadow-md space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Retail Mobile Portfolio Preview
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">{fund.displayName}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {fund.isRecommended && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                      <Star size={12} fill="currentColor" /> Recommended
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${riskMeta.bg} ${riskMeta.color}`}>
                    <Wifi size={11} /> {fund.riskLevel || 'Low Risk'}
                  </span>
                </div>
              </div>

              {/* Yield Stat Big Number */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
                  {fund.expectedYieldLabel || '14.5% p.a.'}
                </span>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <TrendingUp size={12} /> +17.42% YTD
                </span>
              </div>

              {/* Chart Performance Line Visual Indicator */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Performance Trend</span>
                  <div className="flex gap-2 text-[10px] font-bold">
                    <span className="text-white bg-gray-800 px-2 py-0.5 rounded">1W</span>
                    <span className="text-gray-400 px-2 py-0.5">1M</span>
                    <span className="text-gray-400 px-2 py-0.5">6M</span>
                    <span className="text-gray-400 px-2 py-0.5">1Y</span>
                  </div>
                </div>

                {/* Simulated Growth Chart Curve */}
                <div className="relative w-full h-24 bg-gray-850/50 rounded-xl overflow-hidden border border-gray-800/80 flex items-end p-2">
                  <svg className="w-full h-full text-emerald-400/80 overflow-visible" viewBox="0 0 400 60" fill="none">
                    <path
                      d="M0 50 Q 50 40, 100 45 T 200 30 T 300 20 T 400 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0 50 Q 50 40, 100 45 T 200 30 T 300 20 T 400 5 L 400 60 L 0 60 Z"
                      fill="currentColor"
                      fillOpacity="0.1"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Navigation Tabs (Overview / Allocations / Holdings) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-xs overflow-hidden">
              <div className="flex border-b border-gray-100 dark:border-gray-700/80 px-6 pt-2 bg-gray-50/50 dark:bg-gray-900/30">
                {(['overview', 'allocations', 'holdings'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors capitalize whitespace-nowrap cursor-pointer ${
                      activeTab === tab
                        ? 'border-[#961A1C] text-[#961A1C]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab === 'overview' ? 'Overview & Terms' : tab === 'allocations' ? 'Asset Allocations' : 'Fund Holdings'}
                    {tab === 'allocations' && allocDirty && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />}
                    {tab === 'holdings' && holdingsDirty && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-5">
                    {/* Short Description */}
                    {fund.shortDescription && (
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                          Fund Overview & Strategy
                        </span>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                          {fund.shortDescription}
                        </div>
                      </div>
                    )}

                    {/* How You Earn */}
                    {fund.howYouEarnText && (
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                          How You Earn & Interest Mechanics
                        </span>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {fund.howYouEarnText}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'allocations' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                          Asset Allocations
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">Define asset breakdown mix displayed in the mobile app</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={addAllocation}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                        >
                          <Plus size={13} /> Add Asset
                        </button>
                        {allocDirty && (
                          <button
                            onClick={saveAllocations}
                            disabled={isSavingAlloc}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-xl transition disabled:opacity-60 cursor-pointer"
                          >
                            {isSavingAlloc ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : <><Check size={12} /> Save Allocations</>}
                          </button>
                        )}
                      </div>
                    </div>

                    {allocations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                        <PieChart size={28} className="opacity-40" />
                        <span className="text-sm">No allocations defined yet.</span>
                        <button onClick={addAllocation} className="text-xs text-[#961A1C] hover:underline font-semibold">Add first asset allocation</button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-12 gap-2 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <div className="col-span-1"></div>
                          <div className="col-span-3">Asset Name</div>
                          <div className="col-span-2">Min %</div>
                          <div className="col-span-2">Max %</div>
                          <div className="col-span-2">Color</div>
                          <div className="col-span-1">Order</div>
                          <div className="col-span-1"></div>
                        </div>
                        {allocations.map((alloc, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                            <div className="col-span-1 flex items-center justify-center text-gray-300 dark:text-gray-600">
                              <GripVertical size={14} />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="text"
                                value={alloc.assetName}
                                onChange={(e) => updateAllocation(idx, 'assetName', e.target.value)}
                                placeholder="e.g. Fixed Income"
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={alloc.minPercent}
                                onChange={(e) => updateAllocation(idx, 'minPercent', Number(e.target.value))}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={alloc.maxPercent}
                                onChange={(e) => updateAllocation(idx, 'maxPercent', Number(e.target.value))}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                              />
                            </div>
                            <div className="col-span-2 flex items-center gap-1.5">
                              <input
                                type="color"
                                value={alloc.colorHex || '#961A1C'}
                                onChange={(e) => updateAllocation(idx, 'colorHex', e.target.value)}
                                className="w-7 h-7 rounded border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5 bg-white dark:bg-gray-800"
                              />
                              <input
                                type="text"
                                value={alloc.colorHex || ''}
                                onChange={(e) => updateAllocation(idx, 'colorHex', e.target.value)}
                                className="flex-1 min-w-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-[11px] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C] font-mono"
                                placeholder="#961A1C"
                              />
                            </div>
                            <div className="col-span-1">
                              <input
                                type="number"
                                min={0}
                                value={alloc.displayOrder ?? 0}
                                onChange={(e) => updateAllocation(idx, 'displayOrder', Number(e.target.value))}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                              />
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <button
                                onClick={() => removeAllocation(idx)}
                                className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'holdings' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                          Security Holdings
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">Individual security holdings within this mutual fund</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={addHolding}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                        >
                          <Plus size={13} /> Add Holding
                        </button>
                        {holdingsDirty && (
                          <button
                            onClick={saveHoldings}
                            disabled={isSavingHoldings}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-xl transition disabled:opacity-60 cursor-pointer"
                          >
                            {isSavingHoldings ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : <><Check size={12} /> Save Holdings</>}
                          </button>
                        )}
                      </div>
                    </div>

                    {holdings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                        <PieChart size={28} className="opacity-40" />
                        <span className="text-sm">No holdings added yet.</span>
                        <button onClick={addHolding} className="text-xs text-[#961A1C] hover:underline font-semibold">Add first holding</button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-12 gap-2 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <div className="col-span-1"></div>
                          <div className="col-span-4">Holding Name</div>
                          <div className="col-span-2">Min %</div>
                          <div className="col-span-2">Max %</div>
                          <div className="col-span-2">Order</div>
                          <div className="col-span-1"></div>
                        </div>
                        {holdings.map((holding, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                            <div className="col-span-1 flex items-center justify-center text-gray-300 dark:text-gray-600">
                              <GripVertical size={14} />
                            </div>
                            <div className="col-span-4">
                              <input
                                type="text"
                                value={holding.holdingName}
                                onChange={(e) => updateHolding(idx, 'holdingName', e.target.value)}
                                placeholder="e.g. FGN Treasury Bills"
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={holding.minPercent}
                                onChange={(e) => updateHolding(idx, 'minPercent', Number(e.target.value))}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={holding.maxPercent}
                                onChange={(e) => updateHolding(idx, 'maxPercent', Number(e.target.value))}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                min={0}
                                value={holding.displayOrder ?? 0}
                                onChange={(e) => updateHolding(idx, 'displayOrder', Number(e.target.value))}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                              />
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <button
                                onClick={() => removeHolding(idx)}
                                className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ── 30% Right Sidebar: Analytics & Fund Conditions (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Investor & Portfolio Performance Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                <BarChart2 size={16} className="text-[#961A1C]" />
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Investor & AUM Analytics
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <Users size={13} />
                    <span className="text-[10px] font-semibold uppercase">Investors</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">12,450</p>
                  <p className="text-[10px] text-emerald-600 font-medium">+14% this month</p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <DollarSign size={13} />
                    <span className="text-[10px] font-semibold uppercase">Total AUM</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">₦1.25B</p>
                  <p className="text-[10px] text-emerald-600 font-medium">+8.5% growth</p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <Award size={13} />
                    <span className="text-[10px] font-semibold uppercase">Avg Deposit</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">₦100,000</p>
                  <p className="text-[10px] text-gray-400 font-medium">Per investor</p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <Zap size={13} />
                    <span className="text-[10px] font-semibold uppercase">Return YTD</span>
                  </div>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+17.4%</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Outperforming</p>
                </div>
              </div>
            </div>

            {/* Fund Yield & Duration Cards */}
            <div className="space-y-3">
              {/* Expected Yield */}
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 shadow-xs flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Expected Yield Rate
                </span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {fund.expectedYieldLabel || '14.5% p.a.'}
                </span>
                <p className="text-[11px] text-gray-500 font-medium">Calculated daily & paid monthly into investment wallet</p>
              </div>

              {/* Lock-in Duration */}
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 shadow-xs flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Lock-in Duration & Liquidity
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" /> {fund.durationLabel || '12 – 36 months'}
                </span>
                <p className="text-[11px] text-gray-500 font-medium">Flexible partial or full withdrawal options</p>
              </div>
            </div>

            {/* Risk Profile Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi size={15} className="text-[#961A1C]" />
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                    Risk Profile
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${riskMeta.bg} ${riskMeta.color}`}>
                  {fund.riskLevel || 'Low Risk'}
                </span>
              </div>
            </div>

            {/* Featured Status Card */}
            {fund.isRecommended && (
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
                    <Star size={15} fill="currentColor" /> Featured / Recommended Fund
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-md">
                    Top Rating
                  </span>
                </div>
              </div>
            )}

            {/* Active Status Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                    Active
                  </span>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                    Retail users can now have access to this mutual fund
                  </p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Edit Fund Drawer (Ant Design Drawer) */}
      <Drawer
        open={Boolean(isEditing && editForm)}
        onClose={() => setIsEditing(false)}
        width={560}
        destroyOnClose
        maskClosable={false}
        className="dark:bg-gray-900"
        title={
          <div className="flex items-center justify-between text-gray-900 dark:text-white">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white">
              Edit Mutual Fund
            </h3>
          </div>
        }
      >
        {editForm && (
          <form onSubmit={handleUpdateFund} className="flex flex-col h-full">

            <div className="flex-1 overflow-y-auto space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {/* Cover Image Uploading & Preview Area */}
              <div className="relative w-full h-48 bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 flex flex-col items-center justify-center group">
                {coverImage ? (
                  <>
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover opacity-85" />
                    <button
                      type="button"
                      onClick={() => setCoverImage(null)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full p-4 hover:bg-gray-800/60 transition text-gray-400">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                      <TrendingUp size={22} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200">
                      <Upload size={14} /> Click or drop mutual fund cover thumbnail
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">App preview placeholder (UI Only)</p>
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

              {/* Fund Title Input */}
              <div>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  placeholder="Fund Name (e.g. Fixed Income Portfolio)"
                  className={`w-full text-xl sm:text-2xl font-bold bg-transparent text-gray-900 dark:text-white border-b-2 border-dashed focus:border-solid border-gray-300 dark:border-gray-700 py-1.5 focus:border-[#961A1C] outline-none transition placeholder:text-gray-300 dark:placeholder:text-gray-600 ${
                    formErrors.displayName ? 'border-red-500' : ''
                  }`}
                />
                {formErrors.displayName && <p className="text-xs text-red-500 mt-1">{formErrors.displayName}</p>}
                <p className="text-[11px] text-gray-400 mt-1">Retail investor mobile app fund header</p>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={editForm.shortDescription}
                  onChange={(e) => setEditForm({ ...editForm, shortDescription: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
                  placeholder="Targeting long term capital appreciation through equity investments..."
                />
              </div>

              {/* Yield Label & Duration Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Expected Yield Label (% p.a.)
                  </label>
                  <input
                    type="text"
                    value={editForm.expectedYieldLabel}
                    onChange={(e) => setEditForm({ ...editForm, expectedYieldLabel: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Duration Label
                  </label>
                  <input
                    type="text"
                    value={editForm.durationLabel}
                    onChange={(e) => setEditForm({ ...editForm, durationLabel: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                  />
                </div>
              </div>

              {/* Risk Profile Selector */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Wifi size={16} className="text-[#961A1C]" />
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                    Risk Profile
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {RISK_LEVELS.map((r) => {
                    const active = editForm.riskLevel === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, riskLevel: r })}
                        className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          active
                            ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-400 ring-2 ring-current shadow-xs'
                            : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Wifi size={12} className={active ? 'animate-pulse' : 'opacity-60'} />
                        <span>{r.replace(' Risk', '')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* How You Earn Text */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  How You Earn & Interest Terms
                </label>
                <textarea
                  rows={3}
                  value={editForm.howYouEarnText}
                  onChange={(e) => setEditForm({ ...editForm, howYouEarnText: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
                />
              </div>

              {/* Switches: Recommended & Active */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="pr-3">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Star size={14} className="text-amber-500" /> Featured / Recommended Fund
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Appears in Recommended tab for investors</p>
                  </div>
                  <Switch
                    checked={!!editForm.isRecommended}
                    onChange={(checked) => setEditForm({ ...editForm, isRecommended: checked })}
                  />
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                        Active
                      </span>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                        Retail users can now have access to this mutual fund
                      </p>
                    </div>
                    <Switch
                      checked={!!editForm.isActive}
                      onChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                    />
                  </div>
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
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Delete Mutual Fund</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Are you sure you want to delete <strong className="text-gray-800 dark:text-white">&ldquo;{fund?.displayName}&rdquo;</strong>? This cannot be undone.
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
              {isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : 'Delete Fund'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
