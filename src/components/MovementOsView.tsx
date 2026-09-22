import React, { useState } from 'react';
import { Lead } from '../types.js';
import {
  Layers,
  Search,
  Filter,
  AlertTriangle,
  User,
  Clock,
  PhoneCall,
  Calendar,
  Building,
  CheckCircle2,
  ChevronRight,
  SplitSquareVertical,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatDeadline, STAGE_CONFIG } from '../utils/formatters.js';

interface Props {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenMPowerCall: (lead: Lead) => void;
  onOpenBookingSplit: (lead: Lead) => void;
  activeOperator: string;
}

export const MovementOsView: React.FC<Props> = ({
  leads,
  onSelectLead,
  onOpenMPowerCall,
  onOpenBookingSplit,
  activeOperator
}) => {
  const [stageFilter, setStageFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.id || null);

  const filteredLeads = leads.filter((lead) => {
    if (stageFilter !== 'all' && lead.stage !== stageFilter) return false;
    if (ownerFilter !== 'all' && lead.owner.toLowerCase() !== ownerFilter.toLowerCase()) return false;
    if (overdueOnly && !lead.isOverdue) return false;
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

  const uniqueOwners = Array.from(new Set(leads.map((l) => l.owner)));
  const overdueCount = leads.filter((l) => l.isOverdue).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-base font-bold text-zinc-950 tracking-tight flex items-center gap-2">
            <span>Movement OS — Full Customer Pipeline</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Full-lifecycle customer directory with status progression, assigned owners, overdue work indicators, and inline action panel.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {overdueCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>{overdueCount} Overdue Leads</span>
            </span>
          )}
          <span className="text-zinc-600 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded font-mono font-medium">
            {filteredLeads.length} / {leads.length} Records
          </span>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white rounded-xl border border-zinc-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search customer, locality, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 font-medium focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Stages ({leads.length})</option>
            <option value="new_lead">New Inquiries</option>
            <option value="contacted">Contacted</option>
            <option value="tour_scheduled">Tour Scheduled</option>
            <option value="tour_completed">Tour Completed</option>
            <option value="quote_sent">Quote Sent</option>
            <option value="decision_pending">Decision Pending</option>
            <option value="booking_confirmed">Booking Confirmed</option>
            <option value="check_in_done">Check-in Done</option>
          </select>

          {/* Owner Filter */}
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 font-medium focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Owners</option>
            {uniqueOwners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>

          {/* Overdue Only Toggle (In Red) */}
          <button
            onClick={() => setOverdueOnly(!overdueOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
              overdueOnly
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Overdue Only ({overdueCount})</span>
          </button>
        </div>
      </div>

      {/* 1-Line Prominent Module Outcome Banner */}
      <div className="px-4 py-2 bg-gradient-to-r from-indigo-950 via-zinc-900 to-slate-950 text-white rounded-xl text-xs flex items-center justify-between shadow-2xs border border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] bg-indigo-950/90 px-2 py-0.5 rounded border border-indigo-800">
            Module Outcome
          </span>
          <span className="font-semibold text-white">
            Single-truth pipeline intelligence: filter bottlenecks, pinpoint overdue SLAs, and launch actions directly from the side panel.
          </span>
        </div>
        <span className="text-[11px] text-indigo-200 hidden sm:inline">
          Zero Stale Leads &bull; Real-Time Stage Progression
        </span>
      </div>

      {/* TWO COLUMN WORKSPACE: Table on Left + Side Work Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Customer List (7.5 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gradient-to-r from-zinc-50 via-slate-50 to-indigo-50/20 border-b border-zinc-200/80 text-zinc-600 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-4 py-3">Customer & Phone</th>
                  <th className="px-3 py-3">Budget & Locality</th>
                  <th className="px-3 py-3">Stage</th>
                  <th className="px-3 py-3">Owner</th>
                  <th className="px-3 py-3">SLA Deadline</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-zinc-400">
                      No matching leads found for current filters.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead, idx) => {
                    const isSelected = selectedLead?.id === lead.id;
                    const stageBadge = STAGE_CONFIG[lead.stage] || STAGE_CONFIG.new_lead;
                    const deadlineInfo = formatDeadline(lead.deadline);
                    const avatarGradients = [
                      'from-emerald-500 to-teal-600',
                      'from-indigo-500 to-violet-600',
                      'from-sky-500 to-blue-600',
                      'from-amber-500 to-orange-600',
                      'from-rose-500 to-pink-600'
                    ];
                    const grad = avatarGradients[idx % avatarGradients.length];

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-50/80 via-sky-50/30 to-transparent font-medium border-l-4 border-indigo-600'
                            : 'hover:bg-zinc-50/80 border-l-4 border-transparent'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${grad} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                              {lead.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-zinc-900">{lead.name}</div>
                              <div className="text-[11px] text-zinc-400 font-mono">{lead.phone}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70 inline-block font-mono">
                            {formatCurrency(lead.budget)}
                          </div>
                          <div className="text-[11px] text-zinc-600 truncate max-w-[140px] mt-0.5">
                            {lead.locality.split(',')[0]}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold whitespace-nowrap ${stageBadge.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${stageBadge.dotClass}`}></span>
                            {stageBadge.label}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-zinc-700 font-medium">
                          <span className="bg-zinc-100/80 px-2 py-0.5 rounded text-[11px] font-medium border border-zinc-200/60">
                            {lead.owner.split(' ')[0]}
                          </span>
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap">
                          {deadlineInfo.isOverdue ? (
                            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit animate-pulse shadow-2xs">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              {deadlineInfo.text}
                            </span>
                          ) : (
                            <span className="text-[11px] text-zinc-500 font-medium bg-zinc-100/60 px-2 py-0.5 rounded-full">
                              {deadlineInfo.text}
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenMPowerCall(lead);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-md text-[11px] font-bold transition-all cursor-pointer mr-1.5 shadow-2xs"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Call</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDE WORK PANEL (4.5 cols) */}
        {selectedLead && (
          <div className="lg:col-span-4 bg-white rounded-xl border border-zinc-200/90 shadow-xs p-5 flex flex-col justify-between space-y-4">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-zinc-200/80">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold text-sm flex items-center justify-center shadow-xs shadow-indigo-500/20 shrink-0">
                    {selectedLead.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-zinc-950">{selectedLead.name}</h3>
                    <div className="text-xs text-zinc-400 font-mono mt-0.5">
                      {selectedLead.phone} &bull; {selectedLead.email}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
                      STAGE_CONFIG[selectedLead.stage]?.badgeClass || ''
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${STAGE_CONFIG[selectedLead.stage]?.dotClass || 'bg-zinc-400'}`}></span>
                    {STAGE_CONFIG[selectedLead.stage]?.label || selectedLead.stage}
                  </span>
                </div>
              </div>

              {/* Overdue alert in Red */}
              {selectedLead.isOverdue && (
                <div className="mt-3 p-3 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-bold animate-pulse shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>OVERDUE WORK: Immediate operator touchpoint required!</span>
                </div>
              )}

              {/* Known attributes */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">Locality & Workplace</span>
                  <div className="font-semibold text-zinc-900 mt-0.5">
                    {selectedLead.locality} &bull; <span className="text-indigo-700">{selectedLead.whatIsAlreadyKnown.workplace}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">Budget & Property</span>
                  <div className="font-semibold text-emerald-700 mt-0.5 font-mono">
                    {formatCurrency(selectedLead.budget)}/mo <span className="font-sans text-zinc-700 font-normal">&bull; {selectedLead.propertyType} ({selectedLead.occupancyType})</span>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-br from-amber-50/90 to-orange-50/40 rounded-xl border border-amber-200/80">
                  <span className="text-[10px] text-amber-800 uppercase font-bold flex items-center gap-1">
                    Intent & Why We Call
                  </span>
                  <div className="font-medium text-amber-950 mt-1 leading-relaxed text-xs">
                    {selectedLead.whyWeAreCalling}
                  </div>
                </div>
              </div>

              {/* Matched Property */}
              {selectedLead.recommendedProperty && (
                <div className="mt-3 p-3.5 bg-gradient-to-br from-indigo-50/90 to-sky-50/50 border border-indigo-200/80 rounded-xl text-xs shadow-2xs">
                  <div className="flex items-center justify-between font-bold text-indigo-900">
                    <span>Matched Property Recommendation</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                      {formatCurrency(selectedLead.recommendedProperty.monthlyRent)}/mo
                    </span>
                  </div>
                  <div className="font-semibold text-zinc-900 mt-1 text-sm">
                    {selectedLead.recommendedProperty.title}
                  </div>
                  <div className="text-[11px] text-indigo-700 mt-1 font-medium">
                    {selectedLead.recommendedProperty.walkingToMetro}
                  </div>
                </div>
              )}
            </div>

            {/* Work Actions */}
            <div className="pt-3 border-t border-zinc-200/80 space-y-2">
              <button
                onClick={() => onOpenMPowerCall(selectedLead)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Launch M-POWER CALL Engine</span>
              </button>

              <button
                onClick={() => onOpenBookingSplit(selectedLead)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-indigo-50 to-sky-50 hover:from-indigo-100 hover:to-sky-100 text-indigo-700 rounded-lg text-xs font-semibold shadow-2xs border border-indigo-200 transition-colors cursor-pointer"
              >
                <SplitSquareVertical className="w-4 h-4 text-indigo-600" />
                <span>Open in Booking Flow Split</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
