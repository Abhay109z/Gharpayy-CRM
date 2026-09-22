import React from 'react';
import { AuditLog } from '../types.js';
import { X, History, User, Clock, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
  filterLeadId?: string;
  onSelectLead?: (leadId: string) => void;
}

export const AuditTrailDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  logs,
  filterLeadId,
  onSelectLead
}) => {
  if (!isOpen) return null;

  const displayLogs = filterLeadId ? logs.filter((l) => l.leadId === filterLeadId) : logs;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-zinc-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-semibold text-base">Verified Audit Ledger</h2>
              <p className="text-xs text-zinc-400">
                Immutable record of who, what, when across all modules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter subheader */}
        <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Showing <strong>{displayLogs.length}</strong> logged event{displayLogs.length === 1 ? '' : 's'}
              {filterLeadId && ` for Lead ${filterLeadId}`}
            </span>
          </div>
          {filterLeadId && onSelectLead && (
            <button
              onClick={() => onSelectLead('')}
              className="text-indigo-600 hover:underline font-medium cursor-pointer"
            >
              Show all leads
            </button>
          )}
        </div>

        {/* Timeline list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayLogs.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-sm">
              No audit records found yet.
            </div>
          ) : (
            displayLogs.map((log) => {
              const date = new Date(log.timestamp);
              const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              return (
                <div
                  key={log.id}
                  className="p-3.5 bg-white rounded-lg border border-zinc-200 shadow-xs hover:border-zinc-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                        <Tag className="w-3 h-3 text-zinc-500" />
                        {log.module}
                      </span>
                      <span className="text-xs font-bold text-zinc-900 tracking-tight">
                        {log.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      <span>{timeStr}</span>
                      <span>({formatTimeAgo(log.timestamp)})</span>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-zinc-700 leading-relaxed font-sans">
                    {log.details}
                  </p>

                  {/* Previous vs New stage changes if present */}
                  {log.previousValue && log.newValue && (
                    <div className="mt-2 flex items-center gap-2 text-xs bg-zinc-50 px-2.5 py-1.5 rounded border border-zinc-200">
                      <span className="text-zinc-500 font-mono text-[11px]">{log.previousValue}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-400" />
                      <span className="font-semibold text-emerald-700 font-mono text-[11px]">{log.newValue}</span>
                    </div>
                  )}

                  {/* Operator & Customer footer */}
                  <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-zinc-400" />
                      <span>Changed by: <strong className="text-zinc-700">{log.operatorName}</strong></span>
                    </div>
                    <div>
                      Customer:{' '}
                      <strong className="text-zinc-700">
                        {log.leadName} ({log.leadId})
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
