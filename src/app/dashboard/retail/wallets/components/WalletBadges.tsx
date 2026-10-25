import React from 'react';
import { Tag } from 'antd';
import { CheckCircle2, PauseCircle, Clock, Lock, XCircle } from 'lucide-react';

export type WalletStatus = 'Active' | 'Suspended' | 'Dormant' | 'Frozen' | 'Closed';
export type WalletState = 'Healthy' | 'Under Review' | 'Frozen Funds' | 'Restricted' | 'Pending Activation' | 'Compliance Hold' | 'AML Investigation';

export function StatusBadge({ status }: { status: WalletStatus }) {
  const styles: Record<WalletStatus, { color: string; label: string; icon: React.ReactNode }> = {
    Active: { color: 'success', label: 'Active', icon: <CheckCircle2 size={12} /> },
    Suspended: { color: 'warning', label: 'Suspended', icon: <PauseCircle size={12} /> },
    Dormant: { color: 'default', label: 'Dormant', icon: <Clock size={12} /> },
    Frozen: { color: 'error', label: 'Frozen', icon: <Lock size={12} /> },
    Closed: { color: 'default', label: 'Closed', icon: <XCircle size={12} /> },
  };

  const current = styles[status] || styles.Active;
  return (
    <Tag color={current.color} className="inline-flex items-center gap-1 px-2 py-0.5 font-semibold text-[11px] rounded-md">
      {current.icon}
      {current.label}
    </Tag>
  );
}

export function StateBadge({ state }: { state: WalletState }) {
  const styles: Record<WalletState, { color: string; label: string }> = {
    Healthy: { color: 'green', label: 'Healthy' },
    'Under Review': { color: 'processing', label: 'Under Review' },
    'Frozen Funds': { color: 'volcano', label: 'Frozen Funds' },
    Restricted: { color: 'warning', label: 'Restricted' },
    'Pending Activation': { color: 'purple', label: 'Pending Activation' },
    'Compliance Hold': { color: 'red', label: 'Compliance Hold' },
    'AML Investigation': { color: 'magenta', label: 'AML Investigation' },
  };

  const current = styles[state] || styles.Healthy;
  return (
    <Tag color={current.color} className="font-medium text-[11px] rounded-md border-none">
      {current.label}
    </Tag>
  );
}
