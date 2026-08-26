'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Modal } from 'antd';
import {
  ArrowLeft, PieChart, Pencil, Trash2, X, Loader2, AlertCircle,
  Plus, Check, Star, GripVertical, Palette, Sparkles,
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

const RISK_LEVELS = ['Low', 'Medium', 'High', 'Very High'];
type Tab = 'overview' | 'allocations' | 'holdings';

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
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  // Allocations state — managed as a local list, saved on submit
  const [allocations, setAllocations] = useState<AllocationItem[]>([]);
  const [allocDirty, setAllocDirty] = useState(false);

  // Holdings state
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [holdingsDirty, setHoldingsDirty] = useState(false);

  // Seed local state from API data when it arrives
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
      riskLevel: fund.riskLevel ?? 'Low',
      isRecommended: fund.isRecommended ?? false,
      durationLabel: fund.durationLabel ?? '',
      expectedYieldLabel: fund.expectedYieldLabel ?? '',
      howYouEarnText: fund.howYouEarnText ?? '',
      isActive: fund.isActive ?? true,
      displayOrder: fund.displayOrder ?? 0,
    });
    setFormErrors({});
    setIsEditing(true);
  }

  function validateEditForm() {
    if (!editForm) return false;
    const errors: Record<string, string> = {};
    if (!editForm.fundId?.trim()) errors.fundId = 'Fund ID is required';
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

  // ── Allocations helpers ──────────────────────────────────────────────────
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

  // ── Holdings helpers ─────────────────────────────────────────────────────
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

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500">
      <div>
        <button onClick={() => router.push('/dashboard/retail/mutual-funds')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Mutual Funds
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mutual Fund Details</h1>
        <p className="text-gray-500 text-sm mt-1">Manage fund content, allocations, and holdings</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin text-[#961A1C]" />
          <span className="text-sm font-medium">Loading fund details...</span>
        </div>
      ) : isError ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 flex flex-col items-center gap-3 text-gray-400">
          <AlertCircle size={28} className="text-[#961A1C]" />
          <p className="text-sm font-medium">Failed to load fund.</p>
          <button onClick={() => refetch()} className="text-xs text-[#961A1C] hover:underline font-semibold">Try again</button>
        </div>
      ) : !fund ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 flex flex-col items-center gap-3 text-gray-400">
          <PieChart size={32} className="opacity-40" />
          <p className="text-sm font-medium">Fund not found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Fund header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/40 dark:to-gray-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#961A1C]/10 flex items-center justify-center">
                <PieChart size={22} className="text-[#961A1C]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{fund.displayName}</h2>
                  {fund.isRecommended && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      <Star size={10} fill="currentColor" /> Recommended
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">{fund.fundId}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={openEdit} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <Pencil size={14} /> Edit
              </button>
              <button onClick={() => setIsConfirmDelete(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg hover:bg-red-100 transition">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700 px-6 pt-4 bg-gray-50/50 dark:bg-gray-900/20">
            {(['overview', 'allocations', 'holdings'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors capitalize whitespace-nowrap ${activeTab === tab ? 'border-[#961A1C] text-[#961A1C]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                {tab}
                {tab === 'allocations' && allocDirty && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />}
                {tab === 'holdings' && holdingsDirty && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <InfoChip label="Risk Level" value={fund.riskLevel || '—'} />
                  <InfoChip label="Display Order" value={String(fund.displayOrder ?? 0)} />
                  <InfoChip label="Status" value={fund.isActive ? 'Active' : 'Inactive'} highlight={fund.isActive} />
                  <InfoChip label="Duration" value={fund.durationLabel || '—'} />
                </div>
                {fund.expectedYieldLabel && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-lg">
                    <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider mb-1">Expected Yield</p>
                    <p className="text-lg font-bold text-green-800 dark:text-green-300">{fund.expectedYieldLabel}</p>
                  </div>
                )}
                {fund.shortDescription && <TextField label="Short Description" value={fund.shortDescription} />}
                {fund.howYouEarnText && <TextField label="How You Earn" value={fund.howYouEarnText} />}
              </div>
            )}

            {activeTab === 'allocations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Asset Allocations</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Define the asset mix shown in the mobile app</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addAllocation} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <Plus size={13} /> Add Asset
                    </button>
                    {allocDirty && (
                      <button onClick={saveAllocations} disabled={isSavingAlloc} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg transition disabled:opacity-60">
                        {isSavingAlloc ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : <><Check size={12} /> Save Allocations</>}
                      </button>
                    )}
                  </div>
                </div>

                {allocations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <PieChart size={28} className="opacity-40" />
                    <span className="text-sm">No allocations yet.</span>
                    <button onClick={addAllocation} className="text-xs text-[#961A1C] hover:underline font-semibold">Add first asset</button>
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
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="col-span-1 flex items-center justify-center text-gray-300 dark:text-gray-600">
                          <GripVertical size={14} />
                        </div>
                        <div className="col-span-3">
                          <input type="text" value={alloc.assetName} onChange={(e) => updateAllocation(idx, 'assetName', e.target.value)}
                            placeholder="e.g. Equities"
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
                        </div>
                        <div className="col-span-2">
                          <input type="number" min={0} max={100} value={alloc.minPercent} onChange={(e) => updateAllocation(idx, 'minPercent', Number(e.target.value))}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
                        </div>
                        <div className="col-span-2">
                          <input type="number" min={0} max={100} value={alloc.maxPercent} onChange={(e) => updateAllocation(idx, 'maxPercent', Number(e.target.value))}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5">
                          <input type="color" value={alloc.colorHex || '#961A1C'} onChange={(e) => updateAllocation(idx, 'colorHex', e.target.value)}
                            className="w-8 h-8 rounded border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5 bg-white dark:bg-gray-800" />
                          <input type="text" value={alloc.colorHex || ''} onChange={(e) => updateAllocation(idx, 'colorHex', e.target.value)}
                            className="flex-1 min-w-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C] font-mono" placeholder="#961A1C" />
                        </div>
                        <div className="col-span-1">
                          <input type="number" min={0} value={alloc.displayOrder ?? 0} onChange={(e) => updateAllocation(idx, 'displayOrder', Number(e.target.value))}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button onClick={() => removeAllocation(idx)} className="text-gray-400 hover:text-red-600 transition p-1">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {allocDirty && (
                      <div className="flex justify-end pt-2">
                        <button onClick={saveAllocations} disabled={isSavingAlloc} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg transition disabled:opacity-60">
                          {isSavingAlloc ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Check size={14} /> Save Allocations</>}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'holdings' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Fund Holdings</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Individual security holdings within this fund</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addHolding} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <Plus size={13} /> Add Holding
                    </button>
                    {holdingsDirty && (
                      <button onClick={saveHoldings} disabled={isSavingHoldings} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg transition disabled:opacity-60">
                        {isSavingHoldings ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : <><Check size={12} /> Save Holdings</>}
                      </button>
                    )}
                  </div>
                </div>

                {holdings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <PieChart size={28} className="opacity-40" />
                    <span className="text-sm">No holdings yet.</span>
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
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="col-span-1 flex items-center justify-center text-gray-300 dark:text-gray-600">
                          <GripVertical size={14} />
                        </div>
                        <div className="col-span-4">
                          <input type="text" value={holding.holdingName} onChange={(e) => updateHolding(idx, 'holdingName', e.target.value)}
                            placeholder="e.g. FGN Bonds"
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
                        </div>
                        <div className="col-span-2">
                          <input type="number" min={0} max={100} value={holding.minPercent} onChange={(e) => updateHolding(idx, 'minPercent', Number(e.target.value))}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
                        </div>
                        <div className="col-span-2">
                          <input type="number" min={0} max={100} value={holding.maxPercent} onChange={(e) => updateHolding(idx, 'maxPercent', Number(e.target.value))}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
                        </div>
                        <div className="col-span-2">
                          <input type="number" min={0} value={holding.displayOrder ?? 0} onChange={(e) => updateHolding(idx, 'displayOrder', Number(e.target.value))}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button onClick={() => removeHolding(idx)} className="text-gray-400 hover:text-red-600 transition p-1">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {holdingsDirty && (
                      <div className="flex justify-end pt-2">
                        <button onClick={saveHoldings} disabled={isSavingHoldings} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg transition disabled:opacity-60">
                          {isSavingHoldings ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : <><Check size={12} /> Save Holdings</>}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Fund Modal (Ant Design Modal) */}
      <Modal
        open={Boolean(isEditing && editForm)}
        onCancel={() => setIsEditing(false)}
        footer={null}
        width={680}
        centered
        destroyOnClose
        maskClosable={false}
        className="rounded-2xl overflow-hidden"
        title={
          <div className="flex items-center gap-3 py-1 text-gray-900 dark:text-white">
            <div className="w-9 h-9 rounded-xl bg-[#961A1C]/10 flex items-center justify-center">
              <PieChart size={17} className="text-[#961A1C]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Edit Mutual Fund Content</h3>
              <p className="text-[11px] text-gray-400 font-normal mt-0.5">Update fund specifications and yield details</p>
            </div>
          </div>
        }
      >
        {editForm && (
          <form onSubmit={handleUpdateFund} className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[72vh] overflow-y-auto px-1 pt-1">
            
            {/* Background Sync Notice */}
            <div className="my-3 p-3.5 rounded-xl bg-gray-900 text-white dark:bg-black border border-gray-800 shadow-xs relative overflow-hidden">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#961A1C]" /> Background System Sync
                  </span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-mono px-1.5 py-0.5 rounded">Active</span>
                </div>
                <p className="text-xs text-gray-200 font-medium leading-relaxed">
                  Fund details are processed in the background and synchronized with retail mobile clients.
                </p>
              </div>
            </div>

            <div className="py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Display Name *</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  className={`w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${formErrors.displayName ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                />
                {formErrors.displayName && <p className="text-xs text-red-500 mt-1">{formErrors.displayName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Short Description</label>
                <textarea
                  rows={2}
                  value={editForm.shortDescription}
                  onChange={(e) => setEditForm({ ...editForm, shortDescription: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Expected Yield Label</label>
                  <input
                    type="text"
                    value={editForm.expectedYieldLabel}
                    onChange={(e) => setEditForm({ ...editForm, expectedYieldLabel: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Duration Label</label>
                  <input
                    type="text"
                    value={editForm.durationLabel}
                    onChange={(e) => setEditForm({ ...editForm, durationLabel: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">How You Earn Text</label>
                <textarea
                  rows={3}
                  value={editForm.howYouEarnText}
                  onChange={(e) => setEditForm({ ...editForm, howYouEarnText: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] resize-none"
                />
              </div>
            </div>

            <div className="py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Risk Level</label>
                  <select
                    value={editForm.riskLevel}
                    onChange={(e) => setEditForm({ ...editForm, riskLevel: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                  >
                    <option value="Low Risk">Low Risk</option>
                    <option value="Moderate Risk">Moderate Risk</option>
                    <option value="High Risk">High Risk</option>
                    <option value="Very High Risk">Very High Risk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.displayOrder ?? 0}
                    onChange={(e) => setEditForm({ ...editForm, displayOrder: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-300 transition">
                  <input
                    type="checkbox"
                    checked={!!editForm.isRecommended}
                    onChange={(e) => setEditForm({ ...editForm, isRecommended: e.target.checked })}
                    className="w-4 h-4 accent-[#961A1C]"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Featured / Recommended</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-300 transition">
                  <input
                    type="checkbox"
                    checked={!!editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#961A1C]"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Active Status</span>
                </label>
              </div>
            </div>

            <div className="py-4 flex gap-3 bg-white dark:bg-gray-900 sticky bottom-0 z-10 border-t border-gray-100 dark:border-gray-800 mt-4 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 px-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 py-2.5 px-4 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isUpdating ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

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
            <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500">
              <Trash2 size={24} />
            </div>
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Delete Mutual Fund</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm">
            Are you sure you want to delete:
          </p>
          <p className="text-sm font-bold text-gray-800 dark:text-white mb-4">
            &ldquo;{fund?.displayName}&rdquo;
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

function InfoChip({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-100 dark:border-gray-700">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-semibold ${highlight === true ? 'text-green-600 dark:text-green-400' : highlight === false ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>{value}</p>
    </div>
  );
}

function TextField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg border border-gray-100 dark:border-gray-700">{value}</p>
    </div>
  );
}
