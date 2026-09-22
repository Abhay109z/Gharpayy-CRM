import React, { useState } from 'react';
import { Lead, AuditLog, MongoDbStatus } from '../types.js';
import {
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  Users,
  Clock,
  ArrowRight,
  History,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Database
} from 'lucide-react';
import { formatCurrency, formatTimeAgo, STAGE_CONFIG } from '../utils/formatters.js';

interface Props {
  leads: Lead[];
  auditLogs: AuditLog[];
  onResetDemo: () => void;
  isResetting: boolean;
  onOpenLead: (lead: Lead) => void;
  dbStatus?: MongoDbStatus | null;
}

export const AdminMovementView: React.FC<Props> = ({
  leads,
  auditLogs,
  onResetDemo,
  isResetting,
  onOpenLead,
  dbStatus
}) => {
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('all');
  const [searchLog, setSearchLog] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/db-sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncMessage('Atlas synchronized successfully');
      } else {
        setSyncMessage(data.error || 'Sync failed');
      }
    } catch (err: any) {
      setSyncMessage(err.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  // 1. Calculate Overdue Bottlenecks by Operator
  const operatorStats = ['Aarav Sharma', 'Pooja Hegde', 'Rohan Mehta', 'Sneha Rao'].map((opName) => {
    const opLeads = leads.filter((l) => l.owner.toLowerCase() === opName.toLowerCase());
    const overdue = opLeads.filter((l) => l.isOverdue).length;
    const tours = opLeads.filter((l) => l.stage === 'tour_scheduled' || l.stage === 'tour_completed').length;
    const closings = opLeads.filter((l) => l.stage === 'booking_confirmed' || l.stage === 'check_in_done').length;
    const moneyLeaking = opLeads
      .filter((l) => l.stage === 'decision_pending' || l.stage === 'quote_sent' || l.stage === 'money_pending')
      .reduce((acc, l) => acc + (l.depositRequired || l.budget * 2) - (l.tokenPaid || 0), 0);

    return {
      name: opName,
      totalLeads: opLeads.length,
      overdue,
      tours,
      closings,
      moneyLeaking
    };
  });

  // 2. High-level aggregates
  const totalLeads = leads.length;
  const totalOverdue = leads.filter((l) => l.isOverdue).length;
  const totalMoneyAtRisk = operatorStats.reduce((acc, op) => acc + op.moneyLeaking, 0);
  const totalTours = leads.filter((l) => l.stage === 'tour_scheduled' || l.stage === 'tour_completed').length;

  // Filter logs
  const filteredLogs = auditLogs.filter((log) => {
    if (selectedModuleFilter !== 'all' && log.module !== selectedModuleFilter) return false;
    if (searchLog) {
      const q = searchLog.toLowerCase();
      return (
        log.leadName.toLowerCase().includes(q) ||
        log.operatorName.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-base font-bold text-zinc-950 tracking-tight flex items-center gap-2">
            <span>Admin Movement Control — Executive Oversight</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Team workload analytics, SLA delinquency monitoring, pipeline revenue at risk, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 px-3 py-1.5 rounded text-xs font-medium cursor-pointer disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Records</span>
          </button>
        </div>
      </div>

      {/* 1-Line Prominent Module Outcome Banner */}
      <div className="px-4 py-2 bg-gradient-to-r from-zinc-950 via-slate-900 to-indigo-950 text-white rounded-xl text-xs flex items-center justify-between shadow-2xs border border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] bg-amber-950/90 px-2 py-0.5 rounded border border-amber-800">
            Module Outcome
          </span>
          <span className="font-semibold text-white">
            Total operational transparency: audit every state transition, monitor SLA breaches, and protect pipeline revenue.
          </span>
        </div>
        <span className="text-[11px] text-zinc-300 hidden sm:inline">
          Immutable Multi-Operator Audit Log &bull; Live MongoDB Truth
        </span>
      </div>

      {/* FOUNDER EXECUTIVE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-xs">
          <div className="text-xs text-rose-600 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Money Leaking (At Risk)</span>
            <DollarSign className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-1">
            {formatCurrency(totalMoneyAtRisk)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Pending deposit agreements awaiting follow-up
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-xs">
          <div className="text-xs text-red-600 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Overdue Work Items</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600 mt-1 flex items-baseline gap-2">
            <span>{totalOverdue}</span>
            <span className="text-xs text-zinc-400 font-normal">/ {totalLeads} total</span>
          </div>
          <div className="text-[11px] text-red-600 font-semibold mt-0.5">
            Requires immediate operator action
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-xs">
          <div className="text-xs text-amber-600 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Tours Locked</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-1">
            {totalTours}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Physical & video tours locked on calendar
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-xs">
          <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Audit Trail Entries</span>
            <History className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-1">
            {auditLogs.length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Immutable server-verified transactions
          </div>
        </div>
      </div>

      {/* PERSISTENCE & DATABASE STATUS PANEL */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Persistent Storage Engine
                </h3>
                {dbStatus?.connected ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    MongoDB Atlas Connected
                  </span>
                ) : dbStatus?.uriConfigured ? (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                    MongoDB Atlas Configured (Dual-Mirror Active)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                    Local Disk Storage
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Cluster: <span className="font-mono text-zinc-700">cluster0.ywwx1dd.mongodb.net</span> &bull; Database: <span className="font-mono text-zinc-700">{dbStatus?.dbName || 'rental_crm'}</span> &bull; Collections: <span className="font-mono text-zinc-700">leads ({leads.length}), audit_logs ({auditLogs.length}), care_promises</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {syncMessage && (
              <span className="text-xs text-emerald-600 font-medium">
                {syncMessage}
              </span>
            )}
            <button
              onClick={handleForceSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs px-3 py-1.5 rounded font-medium cursor-pointer transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Force Atlas Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* TEAM VELOCITY & BOTTLENECK ANALYSIS */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs">
        <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-3">
          Operator Velocity & Overdue Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {operatorStats.map((op) => (
            <div
              key={op.name}
              className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between font-bold text-zinc-900">
                <span>{op.name}</span>
                <span className="text-[11px] text-zinc-500 font-normal">
                  {op.totalLeads} leads
                </span>
              </div>

              <div className="space-y-1 text-zinc-600 text-[11px]">
                <div className="flex justify-between">
                  <span>Overdue Tasks:</span>
                  <strong className={op.overdue > 0 ? 'text-red-600 font-bold' : 'text-emerald-600'}>
                    {op.overdue} late
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>Tours Scheduled:</span>
                  <strong className="text-amber-700">{op.tours}</strong>
                </div>

                <div className="flex justify-between">
                  <span>Closings Locked:</span>
                  <strong className="text-emerald-700">{op.closings}</strong>
                </div>

                <div className="flex justify-between pt-1 border-t border-zinc-200">
                  <span>Pending Deposit:</span>
                  <strong className="text-rose-600 font-mono">
                    {formatCurrency(op.moneyLeaking)}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IMMUTABLE CENTRAL AUDIT TRAIL */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        {/* Header & Filter */}
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-zinc-900 uppercase tracking-wider">
              Central Audit Trail Ledger (Who, What, When)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search log, customer, operator..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="pl-8 pr-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-hidden"
              />
            </div>

            <select
              value={selectedModuleFilter}
              onChange={(e) => setSelectedModuleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-700 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Modules</option>
              <option value="M-POWER CALL">M-POWER CALL</option>
              <option value="Booking Flow Split">Booking Flow Split</option>
              <option value="Movement CARE">Movement CARE</option>
              <option value="Closing Desk">Closing Desk</option>
              <option value="Movement OS">Movement OS</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100/70 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold sticky top-0">
              <tr>
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-3 py-2.5">Module</th>
                <th className="px-3 py-2.5">Operator</th>
                <th className="px-3 py-2.5">Customer</th>
                <th className="px-3 py-2.5">Action</th>
                <th className="px-4 py-2.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredLogs.map((log) => {
                const date = new Date(log.timestamp);
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                return (
                  <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-zinc-500 font-mono text-[11px]">
                      {timeStr} ({formatTimeAgo(log.timestamp)})
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-semibold text-[10px] border border-zinc-200">
                        {log.module}
                      </span>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap font-medium text-zinc-900">
                      {log.operatorName}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap font-medium text-zinc-800">
                      {log.leadName}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap font-bold text-zinc-900 font-mono text-[11px]">
                      {log.action}
                    </td>

                    <td className="px-4 py-3 text-zinc-600 leading-relaxed max-w-md">
                      {log.details}
                      {log.previousValue && log.newValue && (
                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5 text-zinc-500">
                          <span className="font-mono text-zinc-400">{log.previousValue}</span>
                          <ArrowRight className="w-3 h-3 text-zinc-400" />
                          <span className="font-mono font-bold text-emerald-700">{log.newValue}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
