'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { Loader2, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetRetailGLsQuery,
  useUpdateRetailGLsMutation,
  useGetSystemDateQuery,
  useUpdateSystemDateMutation,
  RetailGLMapping,
  ApiProblemDetails,
} from '@/auth/services/adminApi';
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

  // Today's real calendar date formatted as YYYY-MM-DD
  const todayCalendarDate = useMemoDateString();

  useEffect(() => {
    if (systemDateData?.data?.systemDate) {
      setSystemDateInput(systemDateData.data.systemDate.split('T')[0]);
    } else {
      setSystemDateInput(todayCalendarDate);
    }
  }, [systemDateData, todayCalendarDate]);

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

  // Calculate day difference between calendar date and system date
  const dateDriftDays = calculateDateDrift(todayCalendarDate, systemDateInput);

  return (
    <div className="flex flex-col gap-6 pb-16 w-full font-sans">
      
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase font-mono">
          Retail Controls & CORE Settings
        </h1>
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
          Retail cash-inflow GL and CORE system-date settings. Restricted to SuperAdmin and Control.
        </p>
      </div>

      {/* ── PANEL 1: Retail Cash-Inflow GL Mapping (Full Width) ──────────────── */}
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

        {/* Inline Error Details */}
        {glErrorDetails && (
          <div className="mx-6 mt-4 p-3 rounded bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-mono">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
              <AlertTriangle size={14} className="text-gray-700 dark:text-gray-300" />
              <span>[{glErrorDetails.status || 400}] {glErrorDetails.title || 'Validation Error'}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{glErrorDetails.detail}</p>
            {glErrorDetails.instance && <p className="text-[10px] text-gray-400 mt-0.5">Instance: {glErrorDetails.instance}</p>}
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
              
              {/* Mutual Funds GL */}
              <GLFieldInput
                label="MUTUAL FUNDS GL ACCOUNT"
                productType="Mutual Funds"
                value={glForm.mutualFundsGL ?? ''}
                onChange={(val) => setGlForm({ ...glForm, mutualFundsGL: val })}
                placeholder="e.g. GL-102948-MF"
              />

              {/* Fixed Deposit GL */}
              <GLFieldInput
                label="FIXED DEPOSIT GL ACCOUNT"
                productType="Fixed Deposit"
                value={glForm.fixedDepositGL ?? ''}
                onChange={(val) => setGlForm({ ...glForm, fixedDepositGL: val })}
                placeholder="e.g. GL-102949-FD"
              />

              {/* Bonds GL */}
              <GLFieldInput
                label="BONDS GL ACCOUNT"
                productType="Bonds"
                value={glForm.bondsGL ?? ''}
                onChange={(val) => setGlForm({ ...glForm, bondsGL: val })}
                placeholder="e.g. GL-102950-BND"
              />

              {/* Stocks GL */}
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

      {/* ── PANEL 2: CORE System Date (High-Impact Amber/Red Signal Border) ──── */}
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

        {/* Inline Error Details */}
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
              {/* Signature Element — Side-by-Side Date Comparison & Drift Indicator */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
                
                {/* Today's Real Calendar Date */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase block">
                    CALENDAR DATE (REAL-TIME)
                  </span>
                  <div className="font-mono text-lg font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded">
                    {todayCalendarDate}
                  </div>
                  <span className="text-[10px] text-gray-400 block font-mono">Real-world wall clock date</span>
                </div>

                {/* CORE System Business Date Input */}
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

              {/* Drift Status Banner */}
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

      {/* ── CORE System Date Confirmation Modal ──────────────────────────────── */}
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
            Updating the CORE system business date alters transaction processing timestamps, interest posting schedules, and day-end operations across all retail accounts. This action has real processing consequences and cannot be automatically rolled back.
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

// ── GL Field Component with Configure Button for Unconfigured Fields ──────────
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

// ── Helper Utilities ──────────────────────────────────────────────────────────
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
