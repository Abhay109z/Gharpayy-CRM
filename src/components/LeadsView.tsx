import React, { useState } from 'react';
import { Lead } from '../types.js';
import {
  PhoneCall,
  Search,
  Filter,
  AlertTriangle,
  User,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  Calendar,
  Building,
  SplitSquareVertical,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatDeadline, STAGE_CONFIG } from '../utils/formatters.js';

interface Props {
  leads: Lead[];
  onOpenMPowerCall: (lead: Lead) => void;
  onOpenBookingSplit: (lead: Lead) => void;
  activeOperator: string;
}

export const LeadsView: React.FC<Props> = ({
  leads,
  onOpenMPowerCall,
  onOpenBookingSplit,
  activeOperator
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all');

  const filteredLeads = leads.filter((lead) => {
    if (filterStage !== 'all' && lead.stage !== filterStage) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        lead.locality.toLowerCase().includes(q) ||
        lead.owner.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || filteredLeads[0];
  const overdueCount = leads.filter((l) => l.isOverdue).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-base font-bold text-zinc-950 tracking-tight flex items-center gap-2">
            <span>Incoming Inquiries & M-POWER Call Cockpit</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Select a customer inquiry to review context, confirm criteria, and launch the M-POWER Call Conversation Engine.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {overdueCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>{overdueCount} Overdue (Immediate Dialing Required)</span>
            </span>
          )}
          <span className="text-zinc-600 font-medium bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded font-mono">
            {filteredLeads.length} Leads
          </span>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white rounded-xl border border-zinc-200/80 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by customer name, phone, locality, or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-50/80 border border-zinc-200/90 rounded-lg text-xs focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden transition-all"
            />
          </div>

          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-3 py-1.5 bg-zinc-50 border border-zinc-200/90 rounded-lg text-zinc-700 font-semibold focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Pipeline Stages ({leads.length})</option>
            <option value="new_lead">New Inquiries</option>
            <option value="contacted">Contacted</option>
            <option value="tour_scheduled">Tour Scheduled</option>
            <option value="tour_completed">Tour Completed</option>
            <option value="decision_pending">Decision Pending</option>
            <option value="booking_confirmed">Booking Confirmed</option>
          </select>
        </div>
      </div>

      {/* TWO COLUMN VIEW: Leads Queue on Left + Lead Preview Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Leads Table / Cards (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-zinc-200/90 shadow-xs overflow-hidden flex flex-col">
          <div className="p-3 bg-gradient-to-r from-zinc-50 to-indigo-50/20 border-b border-zinc-200/80 flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Incoming WhatsApp Inquiries
            </span>
            <span className="text-zinc-600 font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-[11px]">{filteredLeads.length} Leads</span>
          </div>

          <div className="divide-y divide-zinc-100 overflow-y-auto max-h-[580px]">
            {filteredLeads.map((lead, idx) => {
              const isSelected = lead.id === selectedLead?.id;
              const stageBadge = STAGE_CONFIG[lead.stage] || STAGE_CONFIG.new_lead;
              const deadlineInfo = formatDeadline(lead.deadline);
              const avatarColors = [
                'from-emerald-500 to-teal-600',
                'from-indigo-500 to-violet-600',
                'from-sky-500 to-blue-600',
                'from-amber-500 to-orange-600',
                'from-rose-500 to-pink-600'
              ];
              const avatarGrad = avatarColors[idx % avatarColors.length];

              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`p-3.5 transition-all duration-150 cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-transparent border-l-4 border-emerald-500 shadow-2xs'
                      : 'hover:bg-zinc-50/80 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${avatarGrad} text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0`}>
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-zinc-900">{lead.name}</span>
                        <span className="text-zinc-400 font-mono text-[11px] ml-1.5">{lead.phone}</span>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md shadow-2xs">
                      {formatCurrency(lead.budget)}/mo
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-600 pl-9">
                    <span className="truncate">{lead.locality}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${stageBadge.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${stageBadge.dotClass}`}></span>
                      {stageBadge.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 pl-9">
                    <div className="flex items-center gap-1 text-zinc-500">
                      <User className="w-3 h-3 text-zinc-400" />
                      <span>{lead.owner}</span>
                    </div>

                    {deadlineInfo.isOverdue ? (
                      <span className="text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse shadow-2xs">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        LATE: {deadlineInfo.text}
                      </span>
                    ) : (
                      <span className="text-zinc-500 font-medium bg-zinc-100/80 px-2 py-0.5 rounded-full">
                        {deadlineInfo.text}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Lead Preview & M-POWER Action Station (5 cols) */}
        {selectedLead ? (
          <div className="lg:col-span-5 bg-white rounded-xl border border-zinc-200/90 shadow-xs p-5 flex flex-col justify-between space-y-4">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-zinc-200/80">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center shadow-xs shadow-emerald-500/20 shrink-0">
                    {selectedLead.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-950">{selectedLead.name}</h3>
                    <div className="text-xs text-zinc-500 font-mono mt-0.5">
                      {selectedLead.phone} &bull; {selectedLead.email}
                    </div>
                    <div className="text-xs text-zinc-600 mt-1 flex items-center gap-1 font-medium">
                      <span className="text-emerald-700 font-semibold">{selectedLead.locality}</span>
                      <span>&bull;</span>
                      <span>{selectedLead.propertyType} ({selectedLead.occupancyType})</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${
                      STAGE_CONFIG[selectedLead.stage]?.badgeClass || ''
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${STAGE_CONFIG[selectedLead.stage]?.dotClass || 'bg-zinc-400'}`}></span>
                    {STAGE_CONFIG[selectedLead.stage]?.label || selectedLead.stage}
                  </span>
                </div>
              </div>

              {/* Overdue Alert in Red */}
              {selectedLead.isOverdue && (
                <div className="mt-3 p-3 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-bold animate-pulse shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>OVERDUE ACTION: SLA breach in progress — Dial immediately!</span>
                </div>
              )}

              {/* Why we are calling */}
              <div className="mt-3 p-3.5 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-50/90 border border-amber-200/80 rounded-xl text-xs text-amber-950 shadow-2xs">
                <span className="font-bold block text-amber-900 mb-1 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Why We Are Calling:</span>
                </span>
                <p className="leading-relaxed">{selectedLead.whyWeAreCalling}</p>
              </div>

              {/* Known attributes */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50/90 rounded-lg border border-slate-200/80">
                  <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Budget</span>
                  <strong className="text-emerald-700 text-sm font-bold block mt-0.5">{formatCurrency(selectedLead.budget)}/mo</strong>
                </div>
                <div className="p-2.5 bg-slate-50/90 rounded-lg border border-slate-200/80">
                  <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Workplace</span>
                  <strong className="text-zinc-800 text-xs font-semibold block mt-0.5 truncate">{selectedLead.whatIsAlreadyKnown.workplace}</strong>
                </div>
                <div className="p-2.5 bg-slate-50/90 rounded-lg border border-slate-200/80">
                  <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Duration</span>
                  <strong className="text-zinc-800 text-xs font-semibold block mt-0.5 truncate">{selectedLead.whatIsAlreadyKnown.stayDuration}</strong>
                </div>
              </div>

              {/* Matched Property */}
              {selectedLead.recommendedProperty && (
                <div className="mt-3 p-3.5 bg-gradient-to-br from-indigo-50/90 to-violet-50/60 border border-indigo-200/80 rounded-xl text-xs shadow-2xs">
                  <div className="flex items-center justify-between font-bold text-indigo-900">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Matched Recommendation</span>
                    </span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs font-mono">
                      {formatCurrency(selectedLead.recommendedProperty.monthlyRent)}/mo
                    </span>
                  </div>
                  <div className="font-semibold text-zinc-900 mt-1.5 text-sm">
                    {selectedLead.recommendedProperty.title}
                  </div>
                  <div className="text-[11px] text-indigo-700 mt-1 font-medium">
                    {selectedLead.recommendedProperty.walkingToMetro}
                  </div>
                </div>
              )}
            </div>

            {/* Launch M-POWER CALL CTA */}
            <div className="pt-3 border-t border-zinc-200/80 space-y-2">
              <button
                onClick={() => onOpenMPowerCall(selectedLead)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/25 transition-all duration-150 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Start M-POWER Call</span>
              </button>

              <button
                onClick={() => onOpenBookingSplit(selectedLead)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-indigo-200 shadow-2xs"
              >
                <SplitSquareVertical className="w-3.5 h-3.5 text-indigo-600" />
                <span>Open in Booking Flow Split</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-5 bg-white rounded-xl border border-zinc-200 p-8 text-center text-zinc-400">
            Select a lead to preview dossier.
          </div>
        )}
      </div>
    </div>
  );
};
