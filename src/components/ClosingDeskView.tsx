import React, { useState } from 'react';
import { Lead } from '../types.js';
import {
  Building2,
  DollarSign,
  CheckCircle2,
  Clock,
  User,
  AlertTriangle,
  CreditCard,
  FileCheck,
  Key,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import { formatCurrency, formatDeadline, STAGE_CONFIG } from '../utils/formatters.js';

interface Props {
  leads: Lead[];
  onUpdateLead: (updatedLead: Lead) => void;
  activeOperator: string;
  onOpenMPowerCall: (lead: Lead) => void;
}

export const ClosingDeskView: React.FC<Props> = ({
  leads,
  onUpdateLead,
  activeOperator,
  onOpenMPowerCall
}) => {
  const closingStages: Lead['stage'][] = [
    'tour_completed',
    'quote_sent',
    'decision_pending',
    'booking_confirmed',
    'money_pending',
    'check_in_done'
  ];

  const closingLeads = leads.filter((l) => closingStages.includes(l.stage));
  const [selectedLeadId, setSelectedLeadId] = useState<string>(closingLeads[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentLead = closingLeads.find((l) => l.id === selectedLeadId) || closingLeads[0];

  // Metrics for closing desk
  const totalMoneyPending = closingLeads.reduce((acc, l) => acc + (l.moneyPending || (l.depositRequired || l.budget * 2) - (l.tokenPaid || 0)), 0);
  const bookingsConfirmed = closingLeads.filter((l) => l.stage === 'booking_confirmed' || l.stage === 'check_in_done').length;

  const handleRecordToken = async (amount: number) => {
    if (!currentLead) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/leads/${currentLead.id}/closing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'RECORD_TOKEN',
          tokenAmount: amount,
          operatorName: activeOperator
        })
      });
      const data = await res.json();
      if (data.success && data.lead) {
        onUpdateLead(data.lead);
      }
    } catch (err) {
      console.error('Failed to record token:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteCheckIn = async () => {
    if (!currentLead) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/leads/${currentLead.id}/closing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'CHECK_IN_COMPLETE',
          operatorName: activeOperator,
          checkInDate: new Date().toISOString().split('T')[0]
        })
      });
      const data = await res.json();
      if (data.success && data.lead) {
        onUpdateLead(data.lead);
      }
    } catch (err) {
      console.error('Failed to complete check-in:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const deadlineInfo = currentLead ? formatDeadline(currentLead.deadline) : { text: '', isOverdue: false };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-base font-bold text-zinc-950 tracking-tight flex items-center gap-2">
            <span>Closing Desk — Post-Tour Conversion & Move-In</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage customers past property inspection: track quote decisions, collect advance token deposits, and execute move-in check-ins.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded font-semibold">
            {formatCurrency(totalMoneyPending)} Balance Due
          </span>
          <span className="text-zinc-600 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded font-mono font-medium">
            {closingLeads.length} Customers in Closing
          </span>
        </div>
      </div>

      {/* 1-Line Prominent Module Outcome Banner */}
      <div className="px-4 py-2 bg-gradient-to-r from-purple-950 via-zinc-900 to-rose-950 text-white rounded-xl text-xs flex items-center justify-between shadow-2xs border border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-purple-400 uppercase tracking-wider text-[10px] bg-purple-950/90 px-2 py-0.5 rounded border border-purple-800">
            Module Outcome
          </span>
          <span className="font-semibold text-white">
            Collect pending move-in token deposits and execute room check-ins without revenue leakage.
          </span>
        </div>
        <span className="text-[11px] text-purple-200 hidden sm:inline">
          1-Click Token Deposit &bull; Digital Move-In Key Handover
        </span>
      </div>

      {/* METRIC RIBBON: Revenue at Risk vs Bookings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-gradient-to-br from-rose-50 via-red-50/40 to-rose-50/80 border border-rose-200/90 rounded-xl shadow-2xs">
          <div className="text-xs text-rose-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-rose-600" />
            <span>Pending Deposits at Risk</span>
          </div>
          <div className="text-2xl font-black text-rose-950 mt-1">
            {formatCurrency(totalMoneyPending)}
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-0.5">
            Uncollected move-in deposits requiring closing follow-up
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-emerald-50/80 border border-emerald-200/90 rounded-xl shadow-2xs">
          <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Locked Bookings</span>
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-1">
            {bookingsConfirmed}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
            Tokens collected & move-in dates committed
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-indigo-50 via-sky-50/40 to-indigo-50/80 border border-indigo-200/90 rounded-xl shadow-2xs">
          <div className="text-xs text-indigo-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Active Closings in Queue</span>
          </div>
          <div className="text-2xl font-black text-indigo-950 mt-1">
            {closingLeads.length}
          </div>
          <div className="text-[11px] text-indigo-700 font-medium mt-0.5">
            Customers past initial property inspection
          </div>
        </div>
      </div>

      {/* SPLIT CLOSING DESK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Customer Cards in Closing Stages (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-zinc-200/90 shadow-xs overflow-hidden flex flex-col">
          <div className="p-3 bg-gradient-to-r from-zinc-50 to-purple-50/30 border-b border-zinc-200/80 flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              Post-Tour Pipeline
            </span>
            <span className="text-zinc-600 font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-[11px]">{closingLeads.length} Customers</span>
          </div>

          <div className="divide-y divide-zinc-100 overflow-y-auto max-h-[560px]">
            {closingLeads.map((lead, idx) => {
              const isSelected = lead.id === currentLead?.id;
              const stageBadge = STAGE_CONFIG[lead.stage] || STAGE_CONFIG.new_lead;
              const leadDeadline = formatDeadline(lead.deadline);
              const deposit = lead.depositRequired || (lead.budget * 2);
              const pending = Math.max(0, deposit - (lead.tokenPaid || 0));
              const avatarGradients = [
                'from-purple-500 to-indigo-600',
                'from-rose-500 to-pink-600',
                'from-amber-500 to-orange-600',
                'from-emerald-500 to-teal-600',
                'from-sky-500 to-blue-600'
              ];
              const grad = avatarGradients[idx % avatarGradients.length];

              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`p-3.5 transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-50/90 via-indigo-50/40 to-transparent border-l-4 border-purple-600 shadow-2xs'
                      : 'hover:bg-zinc-50/80 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${grad} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                        {lead.name.charAt(0)}
                      </div>
                      <span className="font-bold text-xs text-zinc-900">{lead.name}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {formatCurrency(lead.budget)}/mo
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-600 pl-9">
                    <span>{lead.locality.split(',')[0]}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${stageBadge.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${stageBadge.dotClass}`}></span>
                      {stageBadge.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 pl-9">
                    <span className="text-zinc-500">
                      Owner: <strong className="text-zinc-700">{lead.owner.split(' ')[0]}</strong>
                    </span>
                    <span className="font-mono text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/80">
                      Pending: {formatCurrency(pending)}
                    </span>
                  </div>

                  {leadDeadline.isOverdue && (
                    <div className="text-[10px] text-rose-700 font-bold flex items-center gap-1 animate-pulse pl-9">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>CLOSING SLA LATE: {leadDeadline.text}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Closing Station (7 cols) */}
        {currentLead ? (
          <div className="lg:col-span-7 bg-white rounded-xl border border-zinc-200/90 shadow-xs p-5 flex flex-col justify-between space-y-4">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-zinc-200/80">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shadow-purple-500/20 shrink-0">
                    {currentLead.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-zinc-950">{currentLead.name}</h3>
                      <span className="text-xs text-zinc-400 font-mono">{currentLead.phone}</span>
                    </div>
                    <div className="text-xs text-zinc-600 mt-0.5 font-medium">
                      <span className="text-purple-700 font-semibold">{currentLead.locality}</span> &bull; Moving in {currentLead.moveInDate}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-zinc-400">Accountable: <strong className="text-zinc-800">{currentLead.owner}</strong></div>
                  <div className="mt-1">
                    {deadlineInfo.isOverdue ? (
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full animate-pulse">
                        LATE: {deadlineInfo.text}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {deadlineInfo.text}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Breakdown Table */}
              <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-zinc-50 rounded-xl border border-zinc-200/90 shadow-2xs">
                <div className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Closing Financial Ledger</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Zero Brokerage
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center my-3">
                  <div className="p-3 bg-white rounded-xl border border-zinc-200/80 shadow-2xs">
                    <div className="text-[10px] text-zinc-400 uppercase font-semibold">Monthly Rent</div>
                    <div className="text-base font-bold text-zinc-900 mt-0.5 font-mono">
                      {formatCurrency(currentLead.budget)}
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 shadow-2xs">
                    <div className="text-[10px] text-emerald-700 uppercase font-semibold">Advance Token Paid</div>
                    <div className="text-base font-bold text-emerald-800 mt-0.5 font-mono">
                      {formatCurrency(currentLead.tokenPaid || 0)}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/70 shadow-2xs">
                    <div className="text-[10px] text-rose-700 uppercase font-semibold">Balance Due</div>
                    <div className="text-base font-bold text-rose-800 mt-0.5 font-mono">
                      {formatCurrency(
                        Math.max(
                          0,
                          (currentLead.depositRequired || currentLead.budget * 2) - (currentLead.tokenPaid || 0)
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Matched Property Room Card */}
              {currentLead.recommendedProperty && (
                <div className="mt-3 p-3.5 bg-gradient-to-br from-indigo-50/90 to-purple-50/40 border border-indigo-200/80 rounded-xl flex items-center justify-between text-xs shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">Allocated Inventory:</span>
                    <div className="font-semibold text-zinc-900 mt-0.5 text-sm">
                      {currentLead.recommendedProperty.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      {currentLead.recommendedProperty.walkingToMetro}
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenMPowerCall(currentLead)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Customer</span>
                  </button>
                </div>
              )}
            </div>

            {/* ONE-CLICK CLOSING ACTIONS */}
            <div className="pt-3 border-t border-zinc-200/80 space-y-2">
              <div className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Fast One-Click Execution
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleRecordToken(3000)}
                  disabled={isProcessing}
                  className="flex items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Record ₹3,000 Advance Token</span>
                </button>

                <button
                  onClick={() => handleCompleteCheckIn()}
                  disabled={isProcessing}
                  className="flex items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-700/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  <span>Issue Smart Key & Complete Check-in</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-xl border border-zinc-200 p-8 text-center text-zinc-400">
            Select a customer on the left to review closing terms.
          </div>
        )}
      </div>
    </div>
  );
};
