'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { Loader2, AlertTriangle, CheckCircle2, RefreshCw, Building, Plus, Trash2, Edit3, Search } from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetRetailGLsQuery,
  useUpdateRetailGLsMutation,
  useGetSystemDateQuery,
  useUpdateSystemDateMutation,
  RetailGLMapping,
  ApiProblemDetails,
} from '@/auth/services/adminApi';
import {
  useGetTransferBanksQuery,
  useCreateTransferBankMutation,
  useUpdateTransferBankMutation,
  useDeleteTransferBankMutation,
  TransferBank,
} from '@/auth/services/retailApi';
import { useToast } from '@/auth/components/ToastContainer';

export default function RetailSettingsPage() {
  return (
    <RoleGuard allowedRoles={['SuperAdmin', 'Control']}>
      <RetailSettingsContent />
    </RoleGuard>
  );
}

function RetailSettingsContent() {
  const toast = useToast();

  // ── GL Mapping State ────────────────────────────────────────────────────────
  const {
    data: glData,
    isLoading: isGlLoading,
    refetch: refetchGLs,
  } = useGetRetailGLsQuery();

  const [updateGLs, { isLoading: isGlUpdating }] = useUpdateRetailGLsMutation();

  const [glForm, setGlForm] = useState<RetailGLMapping>({
    mutualFundsGL: '',
    fixedDepositGL: '',
    bondsGL: '',
    stocksGL: '',
  });

  const [glErrorDetails, setGlErrorDetails] = useState<ApiProblemDetails | null>(null);

  useEffect(() => {
    if (glData?.data) {
      setGlForm({
        mutualFundsGL: glData.data.mutualFundsGL ?? '',
        fixedDepositGL: glData.data.fixedDepositGL ?? '',
        bondsGL: glData.data.bondsGL ?? '',
        stocksGL: glData.data.stocksGL ?? '',
      });
    }
  }, [glData]);

  // ── CORE System Date State ──────────────────────────────────────────────────
  const {
    data: systemDateData,
    isLoading: isDateLoading,
    refetch: refetchDate,
  } = useGetSystemDateQuery();

  const [updateSystemDate, { isLoading: isDateUpdating }] = useUpdateSystemDateMutation();

  const [systemDateInput, setSystemDateInput] = useState<string>('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [dateErrorDetails, setDateErrorDetails] = useState<ApiProblemDetails | null>(null);

  const todayCalendarDate = useMemoDateString();

  useEffect(() => {
    if (systemDateData?.data?.systemDate) {
      setSystemDateInput(systemDateData.data.systemDate.split('T')[0]);
    } else {
      setSystemDateInput(todayCalendarDate);
    }
  }, [systemDateData, todayCalendarDate]);

  // ── Transfer Banks State ────────────────────────────────────────────────────
  const [bankSearch, setBankSearch] = useState('');
  const { data: banksData, isLoading: isBanksLoading, refetch: refetchBanks } = useGetTransferBanksQuery({ search: bankSearch });
  const [createBank, { isLoading: isCreatingBank }] = useCreateTransferBankMutation();
  const [updateBank, { isLoading: isUpdatingBank }] = useUpdateTransferBankMutation();
  const [deleteBank] = useDeleteTransferBankMutation();

  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<TransferBank | null>(null);
  const [bankForm, setBankForm] = useState({ bankName: '', bankCode: '', cbnCode: '' });

  const bankList: TransferBank[] = banksData?.data?.items || banksData?.data?.data || [];

  // ── Handlers ────────────────────────────────────────────────────────────────
  async function handleSaveGLs(e: React.FormEvent) {
    e.preventDefault();
    setGlErrorDetails(null);
    try {
      const payload: RetailGLMapping = {
        mutualFundsGL: glForm.mutualFundsGL?.trim() || null,
        fixedDepositGL: glForm.fixedDepositGL?.trim() || null,
        bondsGL: glForm.bondsGL?.trim() || null,
        stocksGL: glForm.stocksGL?.trim() || null,
      };

      await updateGLs(payload).unwrap();
      toast.success('GL account mappings updated successfully.', 'GL Mappings Saved');
      refetchGLs();
    } catch (err: any) {
      const problem = extractProblemDetails(err);
      setGlErrorDetails(problem);
      toast.error(problem.detail || 'Failed to update GL account mappings.', 'Update Failed');
    }
  }

  async function handleConfirmUpdateSystemDate() {
    setDateErrorDetails(null);
    try {
      await updateSystemDate({ systemDate: systemDateInput }).unwrap();
      toast.success(`CORE system date updated to ${systemDateInput}.`, 'System Date Updated');
      setIsConfirmModalOpen(false);
      refetchDate();
    } catch (err: any) {
      const problem = extractProblemDetails(err);
      setDateErrorDetails(problem);
      setIsConfirmModalOpen(false);
      toast.error(problem.detail || 'Failed to update CORE system date.', 'Date Update Failed');
    }
  }

  const handleOpenAddBank = () => {
    setEditingBank(null);
    setBankForm({ bankName: '', bankCode: '', cbnCode: '' });
    setBankModalOpen(true);
  };

  const handleOpenEditBank = (b: TransferBank) => {
    setEditingBank(b);
    setBankForm({ bankName: b.bankName, bankCode: b.bankCode, cbnCode: b.cbnCode });
    setBankModalOpen(true);
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBank) {
        await updateBank({ id: editingBank.id, body: bankForm }).unwrap();
        toast.success(`Bank ${bankForm.bankName} updated successfully.`);
      } else {
        await createBank(bankForm).unwrap();
        toast.success(`Bank ${bankForm.bankName} added successfully.`);
      }
      setBankModalOpen(false);
      refetchBanks();
    } catch {
      toast.error('Failed to save transfer bank details.');
    }
  };

  const handleDeleteBank = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete bank "${name}"?`)) return;
    try {
      await deleteBank(id).unwrap();
      toast.success(`Bank "${name}" removed.`);
      refetchBanks();
    } catch {
      toast.error('Failed to delete transfer bank.');
    }
  };

  const dateDriftDays = calculateDateDrift(todayCalendarDate, systemDateInput);

  return (
    <div className="flex flex-col gap-6 pb-16 w-full font-sans">
      
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase font-mono">
          Retail Controls & CORE Settings
        </h1>
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
          Retail cash-inflow GL, transfer banks, and CORE system-date settings. Restricted to SuperAdmin and Control.
        </p>
      </div>

      {/* ── PANEL 1: Retail Cash-Inflow GL Mapping ──────────────────────────── */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden w-full">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-gray-900 dark:text-white">
              Retail Cash-Inflow GL Mapping
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              GL account each product type&apos;s cash inflow posts to.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetchGLs()}
            className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 rounded transition cursor-pointer"
            title="Refresh GL Mappings"
          >
            <RefreshCw size={13} className={isGlLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {glErrorDetails && (
          <div className="mx-6 mt-4 p-3 rounded bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-mono">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
              <AlertTriangle size={14} className="text-gray-700 dark:text-gray-300" />
              <span>[{glErrorDetails.status || 400}] {glErrorDetails.title || 'Validation Error'}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{glErrorDetails.detail}</p>
          </div>
        )}

        <form onSubmit={handleSaveGLs} className="p-6 space-y-6">
          {isGlLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400 gap-2 text-xs font-mono">
              <Loader2 size={16} className="animate-spin" />
              <span>Fetching GL account mappings...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GLFieldInput
                label="MUTUAL FUNDS GL ACCOUNT"
                productType="Mutual Funds"
                value={glForm.mutualFundsGL ?? ''}
                onChange={(val) => setGlForm({ ...glForm, mutualFundsGL: val })}
                placeholder="e.g. GL-102948-MF"
              />
              <GLFieldInput
                label="FIXED DEPOSIT GL ACCOUNT"
                productType="Fixed Deposit"
                value={glForm.fixedDepositGL ?? ''}
                onChange={(val) => setGlForm({ ...glForm, fixedDepositGL: val })}
                placeholder="e.g. GL-102949-FD"
              />
              <GLFieldInput
                label="BONDS GL ACCOUNT"
                productType="Bonds"
                value={glForm.bondsGL ?? ''}
                onChange={(val) => setGlForm({ ...glForm, bondsGL: val })}
                placeholder="e.g. GL-102950-BND"
              />
              <GLFieldInput
                label="STOCKS GL ACCOUNT"
                productType="Stocks & Equities"
                value={glForm.stocksGL ?? ''}
                onChange={(val) => setGlForm({ ...glForm, stocksGL: val })}
                placeholder="e.g. GL-102951-STK"
              />
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700/80 flex items-center justify-end">
            <button
              type="submit"
              disabled={isGlUpdating || isGlLoading}
              className="px-4 py-2 bg-gray-900 dark:bg-gray-100 hover:bg-black dark:hover:bg-white text-white dark:text-gray-900 font-semibold text-xs rounded transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isGlUpdating ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              <span>Save changes</span>
            </button>
          </div>
        </form>
      </section>

      {/* ── PANEL 2: Retail Transfer Banks Management ───────────────────────── */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden w-full">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-gray-900 dark:text-white flex items-center gap-2">
              <Building size={14} className="text-[#961A1C]" /> Transfer Banks Directory
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Supported financial institutions shown to retail customers for interbank transfers.
            </p>
          </div>
          <button
            onClick={handleOpenAddBank}
            className="px-3 py-1.5 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition shadow-xs"
          >
            <Plus size={14} /> Add Bank
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              placeholder="Search bank name or code..."
              className="w-full text-xs bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-4 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-mono">
              <tr>
                <th className="px-6 py-3 font-semibold uppercase">Bank Name</th>
                <th className="px-6 py-3 font-semibold uppercase">Bank Code</th>
                <th className="px-6 py-3 font-semibold uppercase">CBN Code</th>
                <th className="px-6 py-3 font-semibold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 font-sans">
              {isBanksLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    <Loader2 size={18} className="animate-spin inline mr-2" /> Loading transfer banks...
                  </td>
                </tr>
              ) : bankList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No transfer banks found in directory.
                  </td>
                </tr>
              ) : (
                bankList.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition">
                    <td className="px-6 py-3.5 font-semibold text-gray-900 dark:text-white">{b.bankName}</td>
                    <td className="px-6 py-3.5 font-mono text-gray-600 dark:text-gray-400">{b.bankCode}</td>
                    <td className="px-6 py-3.5 font-mono text-gray-600 dark:text-gray-400">{b.cbnCode}</td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditBank(b)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition"
                        title="Edit Bank"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteBank(b.id, b.bankName)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                        title="Delete Bank"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── PANEL 3: CORE System Date ────────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border-2 border-amber-500/40 dark:border-amber-600/50 shadow-2xs overflow-hidden w-full">
        <div className="px-6 py-4 border-b border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-gray-900 dark:text-white">
                CORE System Date
              </h2>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                HIGH-STAKES CONTROL
              </span>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">
              Business date used by CORE, independent of the calendar date.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetchDate()}
            className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 rounded transition cursor-pointer"
            title="Refresh System Date"
          >
            <RefreshCw size={13} className={isDateLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {dateErrorDetails && (
          <div className="mx-6 mt-4 p-3 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs font-mono">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
              <AlertTriangle size={14} />
              <span>[{dateErrorDetails.status || 400}] {dateErrorDetails.title || 'System Date Error'}</span>
            </div>
            <p className="text-red-600 dark:text-red-300 mt-1">{dateErrorDetails.detail}</p>
          </div>
        )}

        <div className="p-6 space-y-6">
          {isDateLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-400 gap-2 text-xs font-mono">
              <Loader2 size={16} className="animate-spin" />
              <span>Fetching CORE system business date...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase block">
                    CALENDAR DATE (REAL-TIME)
                  </span>
                  <div className="font-mono text-lg font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded">
                    {todayCalendarDate}
                  </div>
                  <span className="text-[10px] text-gray-400 block font-mono">Real-world wall clock date</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-amber-700 dark:text-amber-400 uppercase block">
                    CORE SYSTEM BUSINESS DATE
                  </span>
                  <input
                    type="date"
                    value={systemDateInput}
                    onChange={(e) => setSystemDateInput(e.target.value)}
                    className="w-full font-mono text-lg font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-2 border-amber-500 dark:border-amber-600 px-3 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-mono">Active date for ledger posting</span>
                </div>
              </div>

              <div className="p-3 rounded border flex items-center justify-between text-xs font-mono bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 uppercase text-[10px] font-bold">DATE DRIFT STATUS:</span>
                {dateDriftDays === 0 ? (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    System Date matches Calendar Date (0 days drift)
                  </span>
                ) : (
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    Drift: {dateDriftDays > 0 ? `+${dateDriftDays} days ahead` : `${dateDriftDays} days behind`} calendar
                  </span>
                )}
              </div>
            </>
          )}

          <div className="pt-4 border-t border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
              Requires SuperAdmin or Control confirmation
            </span>
            <button
              type="button"
              disabled={isDateUpdating || isDateLoading || !systemDateInput}
              onClick={() => setIsConfirmModalOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <AlertTriangle size={13} />
              <span>Update CORE Date</span>
            </button>
          </div>
        </div>
      </section>

      {/* Add / Edit Bank Modal */}
      {bankModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              {editingBank ? 'Edit Transfer Bank' : 'Add Transfer Bank'}
            </h3>
            <form onSubmit={handleSaveBank} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-500 font-medium">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  placeholder="e.g. Zenith Bank"
                  className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="text-gray-500 font-medium">Bank Code</label>
                <input
                  type="text"
                  required
                  value={bankForm.bankCode}
                  onChange={(e) => setBankForm({ ...bankForm, bankCode: e.target.value })}
                  placeholder="e.g. 057"
                  className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="text-gray-500 font-medium">CBN Code</label>
                <input
                  type="text"
                  required
                  value={bankForm.cbnCode}
                  onChange={(e) => setBankForm({ ...bankForm, cbnCode: e.target.value })}
                  placeholder="e.g. 000015"
                  className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setBankModalOpen(false)}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBank || isUpdatingBank}
                  className="px-4 py-1.5 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-lg flex items-center gap-1.5"
                >
                  {isCreatingBank || isUpdatingBank ? <Loader2 className="animate-spin" size={14} /> : 'Save Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CORE System Date Confirmation Modal */}
      <Modal
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        footer={null}
        width={460}
        centered
        destroyOnClose
        maskClosable={false}
      >
        <div className="py-2 text-left font-sans">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-3">
            <AlertTriangle size={20} />
            <h3 className="text-sm font-mono font-bold uppercase text-gray-900 dark:text-white">
              Confirm CORE System Date Update
            </h3>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Updating the CORE system business date alters transaction processing timestamps, interest posting schedules, and day-end operations.
          </p>
          <div className="p-3 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-mono space-y-1 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Current CORE Date:</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {systemDateData?.data?.systemDate?.split('T')[0] || todayCalendarDate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-600 font-bold">New CORE Date:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{systemDateInput}</span>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmUpdateSystemDate}
              disabled={isDateUpdating}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded cursor-pointer transition flex items-center gap-1.5 disabled:opacity-60"
            >
              {isDateUpdating ? <Loader2 size={13} className="animate-spin" /> : null}
              <span>Confirm System Date Update</span>
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

function GLFieldInput({
  label,
  productType,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  productType: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isConfigured = Boolean(value && value.trim().length > 0);

  function handleStartEditing() {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-mono font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
          {label}
        </label>
        {isConfigured ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Configured
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-gray-100 dark:bg-gray-800 text-gray-500">
            Not configured
          </span>
        )}
      </div>

      {!isConfigured && !isEditing ? (
        <div className="relative">
          <input
            type="text"
            readOnly
            disabled
            placeholder="Not configured"
            className="w-full font-mono text-xs text-gray-400 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded p-2.5 pr-24 cursor-pointer"
            onClick={handleStartEditing}
          />
          <button
            type="button"
            onClick={handleStartEditing}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 dark:bg-gray-100 hover:bg-black dark:hover:bg-white text-white dark:text-gray-900 font-mono font-bold text-[10px] uppercase rounded transition cursor-pointer shadow-xs"
          >
            Configure
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            onBlur={() => {
              if (!value.trim()) setIsEditing(false);
            }}
            className="w-full font-mono text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100"
          />
          {isConfigured && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsEditing(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-[10px] font-mono p-1 cursor-pointer"
              title="Clear GL Mapping"
            >
              Clear
            </button>
          )}
        </div>
      )}
      <span className="text-[10px] text-gray-400 block font-mono">{productType} inflow ledger code</span>
    </div>
  );
}

function useMemoDateString(): string {
  const [dateStr, setDateStr] = useState<string>('');
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDateStr(today);
  }, []);
  return dateStr || new Date().toISOString().split('T')[0];
}

function calculateDateDrift(calDate: string, sysDate: string): number {
  if (!calDate || !sysDate) return 0;
  const d1 = new Date(calDate).getTime();
  const d2 = new Date(sysDate).getTime();
  if (isNaN(d1) || isNaN(d2)) return 0;
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

function extractProblemDetails(err: any): ApiProblemDetails {
  if (err?.data && typeof err.data === 'object') {
    return {
      type: err.data.type || err.data.statusMessage || 'Error',
      title: err.data.title || 'Request Failed',
      status: err.status || err.data.statusCode || 400,
      detail: err.data.detail || err.data.statusMessage || 'An unexpected error occurred.',
      instance: err.data.instance,
    };
  }
  return {
    status: err?.status || 400,
    title: 'Update Error',
    detail: err?.message || 'Operation failed. Please check inputs and retry.',
  };
}
