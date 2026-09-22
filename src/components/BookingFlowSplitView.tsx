import React, { useState, useEffect } from 'react';
import { Lead } from '../types.js';
import {
  SplitSquareVertical,
  Send,
  User,
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Check,
  Copy,
  Sparkles,
  MapPin,
  ExternalLink,
  PhoneCall,
  Search,
  MessageSquare
} from 'lucide-react';
import { formatCurrency, formatDeadline, STAGE_CONFIG } from '../utils/formatters.js';

interface Props {
  leads: Lead[];
  onUpdateLead: (updatedLead: Lead) => void;
  activeOperator: string;
  selectedLeadId?: string;
  onOpenMPowerCall: (lead: Lead) => void;
}

export const BookingFlowSplitView: React.FC<Props> = ({
  leads,
  onUpdateLead,
  activeOperator,
  selectedLeadId,
  onOpenMPowerCall
}) => {
  const [activeLeadId, setActiveLeadId] = useState<string>(selectedLeadId || leads[0]?.id || '');
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Synchronize if selectedLeadId changes externally
  useEffect(() => {
    if (selectedLeadId && leads.some((l) => l.id === selectedLeadId)) {
      setActiveLeadId(selectedLeadId);
    }
  }, [selectedLeadId, leads]);

  const currentLead = leads.find((l) => l.id === activeLeadId) || leads[0];

  if (!currentLead) {
    return (
      <div className="p-8 text-center text-zinc-500">
        No leads available in workspace.
      </div>
    );
  }

  const deadlineInfo = formatDeadline(currentLead.deadline);

  // Quick WhatsApp templates for 1-click answer dispatch
  const quickTemplates = [
    {
      label: 'Confirm 5:30 PM Tour',
      text: `Hi ${currentLead.name}, I have locked the 5:30 PM slot today for ${currentLead.recommendedProperty?.title || 'the private room'}. Property Manager Suresh (+91 98801 12345) will receive you. Google Pin: https://maps.app.goo.gl/ZenStayHSR. Confirming?`,
      advanceStage: 'tour_scheduled' as const
    },
    {
      label: 'Send Quote & Breakdown',
      text: `Hi ${currentLead.name}, per our discussion, monthly rent is ₹${currentLead.budget.toLocaleString('en-IN')} (wifi, food, power backup included). Deposit is 2 months rent. Zero brokerage. Can I send the token link?`,
      advanceStage: 'quote_sent' as const
    },
    {
      label: 'Token Link (₹3,000)',
      text: `Hi ${currentLead.name}, please pay ₹3,000 token to lock Room #202 via UPI: https://pay.gharpayy.com/token/${currentLead.id}. Receipt will be issued on WhatsApp instantly!`,
      advanceStage: 'decision_pending' as const
    },
    {
      label: 'Ask Move-in Date',
      text: `Hi ${currentLead.name}, just confirming: would you be moving in on the 1st or this weekend? We have a unit freeing up immediately.`,
      advanceStage: undefined
    }
  ];

  const handleSendCustomMessage = async (textToSend: string, advanceStage?: Lead['stage']) => {
    if (!textToSend.trim()) return;
    setIsSending(true);
    try {
      const res = await fetch(`/api/leads/${currentLead.id}/whatsapp-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          senderName: activeOperator,
          advanceToStage: advanceStage,
          nextStepDeadlineMinutes: 180
        })
      });
      const data = await res.json();
      if (data.success && data.lead) {
        onUpdateLead(data.lead);
        setChatInput('');
      }
    } catch (err) {
      console.error('Failed to send WhatsApp message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleAdvanceStage = async (newStage: Lead['stage']) => {
    try {
      const res = await fetch(`/api/leads/${currentLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: newStage,
          operatorName: activeOperator,
          module: 'Booking Flow Split',
          reason: `Operator moved lead to ${newStage} via Booking Flow Split`
        })
      });
      const data = await res.json();
      if (data.success && data.lead) {
        onUpdateLead(data.lead);
      }
    } catch (err) {
      console.error('Failed to advance stage:', err);
    }
  };

  const handleCopyChatText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredQueue = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.locality.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.owner.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-base font-bold text-zinc-950 tracking-tight flex items-center gap-2">
            <span>Booking Flow Split — Operator Console</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Unified dual-pane workspace: live WhatsApp communications on the left, CRM qualification dossier & closing terms on the right.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-700 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded font-mono font-medium">
            Active: {currentLead.name}
          </span>
          <span className="text-zinc-500 font-medium">
            {filteredQueue.length} Active in Queue
          </span>
        </div>
      </div>

      {/* 1-Line Prominent Module Outcome Banner */}
      <div className="px-4 py-2 bg-gradient-to-r from-sky-950 via-zinc-900 to-indigo-950 text-white rounded-xl text-xs flex items-center justify-between shadow-2xs border border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sky-400 uppercase tracking-wider text-[10px] bg-sky-950/90 px-2 py-0.5 rounded border border-sky-800">
            Module Outcome
          </span>
          <span className="font-semibold text-white">
            Turn WhatsApp inquiries into scheduled tours and deposit payments without switching tabs.
          </span>
        </div>
        <span className="text-[11px] text-sky-200 hidden sm:inline">
          1-Click WhatsApp Quick Replies &bull; Live Two-Way CRM Sync
        </span>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-220px)] min-h-[620px]">
        {/* LEFT COLUMN A: Mini Lead Queue Navigator (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-zinc-200 flex flex-col overflow-hidden shadow-xs">
          {/* Header */}
          <div className="p-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
            <span className="font-bold text-xs text-zinc-800 uppercase tracking-wider">
              Operator Lead Queue
            </span>
            <span className="text-[11px] text-zinc-500 font-medium">
              {filteredQueue.length} Active
            </span>
          </div>

          {/* Search box */}
          <div className="p-2 border-b border-zinc-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search customer, location..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full text-xs pl-8 pr-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Queue list */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
            {filteredQueue.map((lead) => {
              const isSelected = lead.id === activeLeadId;
              const leadDeadline = formatDeadline(lead.deadline);
              const stageBadge = STAGE_CONFIG[lead.stage] || STAGE_CONFIG.new_lead;

              return (
                <button
                  key={lead.id}
                  onClick={() => setActiveLeadId(lead.id)}
                  className={`w-full p-3 text-left transition-colors cursor-pointer flex flex-col gap-1 ${
                    isSelected ? 'bg-sky-50/80 border-l-4 border-sky-600' : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-900 truncate">
                      {lead.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {formatCurrency(lead.budget)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="truncate">{lead.locality.split(',')[0]}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${stageBadge.badgeClass}`}
                    >
                      {stageBadge.label}
                    </span>
                  </div>

                  {/* Overdue alert in Red */}
                  {leadDeadline.isOverdue && (
                    <div className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{leadDeadline.text}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* MIDDLE COLUMN B: Live WhatsApp Conversation Pane (4.5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-zinc-200 flex flex-col overflow-hidden shadow-xs">
          {/* Chat Header */}
          <div className="p-3 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs">
                {currentLead.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-xs flex items-center gap-2">
                  <span>{currentLead.name}</span>
                  <span className="text-[10px] text-emerald-300 font-mono">
                    {currentLead.phone}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-200">
                  WhatsApp Conversation • Synced with CRM
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenMPowerCall(currentLead)}
              className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3 h-3" />
              <span>M-POWER CALL</span>
            </button>
          </div>

          {/* Quick Template Response Chips (1-Click Insertion & Dispatch) */}
          <div className="p-2.5 bg-zinc-50 border-b border-zinc-200">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Quick Responses & Actions
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendCustomMessage(tmpl.text, tmpl.advanceStage)}
                  disabled={isSending}
                  className="text-[11px] px-2.5 py-1 bg-white hover:bg-sky-50 text-zinc-700 hover:text-sky-700 border border-zinc-300 hover:border-sky-300 rounded-md font-medium transition-colors cursor-pointer disabled:opacity-50"
                  title={tmpl.text}
                >
                  + {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]/30">
            {currentLead.whatsappMessages.length === 0 ? (
              <div className="text-center py-10 text-xs text-zinc-400">
                No messages yet. Send a fast reply above to start conversation!
              </div>
            ) : (
              currentLead.whatsappMessages.map((msg) => {
                const isCustomer = msg.sender === 'customer';
                const isSystem = msg.sender === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-2">
                      <span className="inline-block text-[11px] bg-zinc-200/90 text-zinc-700 px-3 py-1 rounded-full font-mono border border-zinc-300">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-xs shadow-xs relative group ${
                        isCustomer
                          ? 'bg-white text-zinc-900 rounded-tl-none border border-zinc-200'
                          : 'bg-emerald-100 text-emerald-950 rounded-tr-none border border-emerald-200'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-zinc-500 mb-0.5">
                        {msg.senderName}
                      </div>
                      <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                      <div className="text-[9px] text-zinc-400 text-right mt-1">
                        {msg.timestamp}
                      </div>

                      {/* Quick copy bubble button */}
                      <button
                        onClick={() => handleCopyChatText(msg.text)}
                        className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-700 bg-white/80 rounded transition-opacity"
                        title="Copy message"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input Field */}
          <div className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type message to send on WhatsApp (or press quick chip above)..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendCustomMessage(chatInput);
                }
              }}
              className="flex-1 text-xs px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={() => handleSendCustomMessage(chatInput)}
              disabled={isSending || !chatInput.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              title="Send WhatsApp Message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN C: Live CRM Questions, Answers & Next Step (4.5 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-zinc-200 flex flex-col overflow-y-auto shadow-xs p-4 space-y-4">
          {/* Top Accountable Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Accountable Owner</div>
              <div className="font-bold text-xs text-zinc-900 flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-zinc-500" />
                <span>{currentLead.owner}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider">SLA Deadline</div>
              <div className="mt-0.5">
                {deadlineInfo.isOverdue ? (
                  <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded animate-pulse">
                    LATE: {deadlineInfo.text}
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {deadlineInfo.text}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Qualification Questions & Verified Answers */}
          <div>
            <div className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Qualification Dossier</span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                Live Truth
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200">
                <div className="text-[11px] text-zinc-500">Target Locality & Workplace:</div>
                <div className="font-semibold text-zinc-900 mt-0.5">
                  {currentLead.locality} • {currentLead.whatIsAlreadyKnown.workplace}
                </div>
              </div>

              <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200">
                <div className="text-[11px] text-zinc-500">Stated Budget & Type:</div>
                <div className="font-semibold text-zinc-900 mt-0.5">
                  {formatCurrency(currentLead.budget)}/mo • {currentLead.propertyType} ({currentLead.occupancyType})
                </div>
              </div>

              <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200">
                <div className="text-[11px] text-zinc-500">Move-in Date:</div>
                <div className="font-semibold text-zinc-900 mt-0.5">
                  {currentLead.moveInDate} ({currentLead.whatIsAlreadyKnown.stayDuration})
                </div>
              </div>
            </div>
          </div>

          {/* Matched Property Card */}
          {currentLead.recommendedProperty && (
            <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900 mb-1">
                <span>Matched Property Recommendation</span>
                <span className="text-emerald-700 font-bold">
                  {formatCurrency(currentLead.recommendedProperty.monthlyRent)}/mo
                </span>
              </div>
              <div className="text-xs font-semibold text-zinc-900">
                {currentLead.recommendedProperty.title}
              </div>
              <div className="text-[11px] text-zinc-600 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-zinc-400" />
                <span>{currentLead.recommendedProperty.walkingToMetro}</span>
              </div>
            </div>
          )}

          {/* Stage Fast Progression Buttons */}
          <div>
            <div className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">
              Advance Customer Stage
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => handleAdvanceStage('tour_scheduled')}
                className={`p-2 rounded border font-medium transition-colors cursor-pointer ${
                  currentLead.stage === 'tour_scheduled'
                    ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                    : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700'
                }`}
              >
                Tour Scheduled
              </button>
              <button
                onClick={() => handleAdvanceStage('quote_sent')}
                className={`p-2 rounded border font-medium transition-colors cursor-pointer ${
                  currentLead.stage === 'quote_sent'
                    ? 'bg-purple-100 border-purple-300 text-purple-900 font-bold'
                    : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700'
                }`}
              >
                Quote Sent
              </button>
              <button
                onClick={() => handleAdvanceStage('decision_pending')}
                className={`p-2 rounded border font-medium transition-colors cursor-pointer ${
                  currentLead.stage === 'decision_pending'
                    ? 'bg-orange-100 border-orange-300 text-orange-900 font-bold'
                    : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700'
                }`}
              >
                Decision Pending
              </button>
              <button
                onClick={() => handleAdvanceStage('booking_confirmed')}
                className={`p-2 rounded border font-medium transition-colors cursor-pointer ${
                  currentLead.stage === 'booking_confirmed'
                    ? 'bg-teal-100 border-teal-300 text-teal-900 font-bold'
                    : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700'
                }`}
              >
                Booking Confirmed
              </button>
            </div>
          </div>

          {/* Auto-written Next Step & Closing Promise */}
          <div className="p-3 bg-zinc-900 text-white rounded-lg space-y-2 mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Closing Promise</span>
              </span>
              <span className="text-[10px] text-zinc-400">Auto-calculated</span>
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed">
              {currentLead.autoNextStep || 'Confirm tour slot and send property photos on WhatsApp'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
