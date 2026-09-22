import React, { useState, useEffect } from 'react';
import { Lead } from '../types.js';
import {
  PhoneCall,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Building,
  Send,
  Copy,
  Check,
  AlertTriangle,
  Flame,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Zap,
  MapPin,
  X
} from 'lucide-react';
import { formatCurrency, formatDeadline } from '../utils/formatters.js';

interface Props {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onCallCompleted: (updatedLead: Lead) => void;
  activeOperator: string;
}

export const MPowerCallModal: React.FC<Props> = ({
  lead,
  isOpen,
  onClose,
  onCallCompleted,
  activeOperator
}) => {
  // Form state
  const [outcome, setOutcome] = useState<'tour_scheduled' | 'quote_requested' | 'follow_up_needed' | 'not_interested'>('tour_scheduled');
  const [tourDate, setTourDate] = useState('Today');
  const [tourTime, setTourTime] = useState('5:30 PM');
  const [tourType, setTourType] = useState<'In-Person Physical' | 'Live Video Tour'>('In-Person Physical');
  const [notes, setNotes] = useState('');
  const [checkedConfirmations, setCheckedConfirmations] = useState<Record<number, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [callDurationSec, setCallDurationSec] = useState(0);
  const [isCallActive, setIsCallActive] = useState(true);

  // Timer for active call duration
  useEffect(() => {
    if (!isOpen || !isCallActive) return;
    const interval = setInterval(() => {
      setCallDurationSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isCallActive]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
      // Quick outcome select with numbers 1 to 4 if not typing in input
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        if (e.key === '1') setOutcome('tour_scheduled');
        if (e.key === '2') setOutcome('quote_requested');
        if (e.key === '3') setOutcome('follow_up_needed');
        if (e.key === '4') setOutcome('not_interested');
        if (e.key === 'Enter' && e.ctrlKey) {
          handleFinishCall();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, outcome, tourDate, tourTime, tourType, notes]);

  if (!isOpen) return null;

  const deadlineInfo = formatDeadline(lead.deadline);

  // Auto-compose message live based on current selections
  const autoComposedMessage =
    outcome === 'tour_scheduled'
      ? `Hi ${lead.name}! Great speaking with you on call. As scheduled, your ${tourType} tour for ${
          lead.recommendedProperty?.title || 'our property'
        } in ${lead.locality} is confirmed for ${tourDate} at ${tourTime}. Property Manager: Suresh (+91 98801 12345). Location: https://maps.app.goo.gl/ZenStayHSR. See you then!`
      : outcome === 'quote_requested'
      ? `Hi ${lead.name}! Per our call, here is the price quote for ${
          lead.recommendedProperty?.title || 'the private room'
        }: Rent: ₹${lead.budget.toLocaleString('en-IN')}/mo (wifi, cleaning included), Security Deposit: ₹${(
          lead.budget * 2
        ).toLocaleString('en-IN')}. Zero brokerage. Let me know if you would like me to block this!`
      : `Hi ${lead.name}, thanks for taking my call! I've noted your preferences for ${lead.locality}. Will send you 2 fresh matching options shortly.`;

  const autoNextStep =
    outcome === 'tour_scheduled'
      ? `Conduct ${tourType} at ${lead.recommendedProperty?.title || lead.locality} on ${tourDate} ${tourTime}`
      : outcome === 'quote_requested'
      ? `Follow up on quote decision within 2 hours`
      : `Re-contact customer for revised budget options`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(autoComposedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinishCall = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/mpower-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorName: activeOperator,
          callOutcome: outcome,
          callNotes: notes || `Call completed with outcome: ${outcome}`,
          tourDate: outcome === 'tour_scheduled' ? tourDate : undefined,
          tourTime: outcome === 'tour_scheduled' ? tourTime : undefined,
          tourType: outcome === 'tour_scheduled' ? tourType : undefined,
          nextStep: autoNextStep,
          nextDeadlineMinutes: outcome === 'tour_scheduled' ? 120 : 60
        })
      });
      const data = await res.json();
      if (data.success && data.lead) {
        onCallCompleted(data.lead);
        onClose();
      }
    } catch (err) {
      console.error('Failed to complete M-POWER call:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSec = (total: number) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-2xl border border-zinc-300 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Call Active Header Bar */}
        <div className="px-5 py-3 bg-zinc-950 text-white flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded">
                  Live Call
                </span>
                <h2 className="text-base font-bold text-white tracking-tight">{lead.name}</h2>
                <span className="text-xs text-zinc-400 font-mono">{lead.phone}</span>
                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                  {lead.propertyType}
                </span>
              </div>
              <div className="text-xs text-zinc-400 flex items-center gap-3 mt-0.5">
                <span>Budget: <strong className="text-emerald-400">{formatCurrency(lead.budget)}/mo</strong></span>
                <span>•</span>
                <span>Workplace: <strong className="text-zinc-200">{lead.whatIsAlreadyKnown.workplace}</strong></span>
              </div>
            </div>
          </div>

          {/* Accountable Owner, SLA & Controls */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-zinc-400 flex items-center justify-end gap-1">
                <User className="w-3 h-3 text-zinc-400" />
                <span>Owner:</span>
                <strong className="text-white font-medium">{lead.owner}</strong>
              </div>
              <div className="mt-0.5">
                {deadlineInfo.isOverdue ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-red-600 text-white px-2 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    LATE: {deadlineInfo.text}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3" />
                    SLA: {deadlineInfo.text}
                  </span>
                )}
              </div>
            </div>

            {/* Live Call Duration */}
            <div className="bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800 text-center min-w-[70px]">
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Duration</div>
              <div className="font-mono font-bold text-emerald-400 text-sm">{formatSec(callDurationSec)}</div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close dialer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1-Line Prominent Module Outcome Banner */}
        <div className="px-5 py-2 bg-gradient-to-r from-emerald-950 via-zinc-900 to-indigo-950 border-b border-zinc-800 text-xs flex items-center justify-between text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-800">
              Module Outcome
            </span>
            <span className="font-semibold text-white">
              Lock qualified customer tours on the first touchpoint with zero manual logging.
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            Hotkeys: <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300 font-mono text-[10px]">1-4</kbd> Outcome &bull; <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300 font-mono text-[10px]">Ctrl+Enter</kbd> Finish
          </span>
        </div>

        {/* 3-COLUMN ZERO-SCROLL COCKPIT */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto">
          {/* COLUMN 1: Customer Dossier & Known Facts (3.5 cols) */}
          <div className="lg:col-span-4 p-4 border-r border-zinc-200 bg-zinc-50/50 flex flex-col justify-between space-y-4">
            <div>
              {/* Why We Are Calling */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>WHY WE ARE CALLING</span>
                </div>
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  {lead.whyWeAreCalling}
                </p>
              </div>

              {/* What Is Already Known */}
              <div className="mt-3">
                <div className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>What is Already Known</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-normal">
                    Verified
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between p-2 bg-white rounded border border-zinc-200">
                    <span className="text-zinc-500">Target Locality:</span>
                    <strong className="text-zinc-800">{lead.whatIsAlreadyKnown.targetLocation}</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-white rounded border border-zinc-200">
                    <span className="text-zinc-500">Stated Budget:</span>
                    <strong className="text-zinc-800">{lead.whatIsAlreadyKnown.budget}</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-white rounded border border-zinc-200">
                    <span className="text-zinc-500">Workplace:</span>
                    <strong className="text-zinc-800">{lead.whatIsAlreadyKnown.workplace}</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-white rounded border border-zinc-200">
                    <span className="text-zinc-500">Food Habit:</span>
                    <strong className="text-zinc-800">{lead.whatIsAlreadyKnown.foodPreference}</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-white rounded border border-zinc-200">
                    <span className="text-zinc-500">Stay Duration:</span>
                    <strong className="text-zinc-800">{lead.whatIsAlreadyKnown.stayDuration}</strong>
                  </div>
                </div>
              </div>

              {/* Matched Property Card */}
              {lead.recommendedProperty && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-200 shadow-xs">
                  <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Matched Property</span>
                    <span className="text-emerald-600 font-bold">
                      {formatCurrency(lead.recommendedProperty.monthlyRent)}/mo
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-900">
                    {lead.recommendedProperty.title}
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    <span>{lead.recommendedProperty.walkingToMetro}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-zinc-400 border-t border-zinc-200 pt-2">
              Hotkeys: Press <kbd className="px-1 bg-zinc-200 rounded font-mono text-zinc-700">1-4</kbd> to set outcome, <kbd className="px-1 bg-zinc-200 rounded font-mono text-zinc-700">Ctrl+Enter</kbd> to finish.
            </div>
          </div>

          {/* COLUMN 2: Script & Confirmation Checklist (4.5 cols) */}
          <div className="lg:col-span-4 p-4 border-r border-zinc-200 flex flex-col justify-between space-y-4">
            <div>
              {/* Call Script: What to Say */}
              <div>
                <div className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Call Script (Say This Directly)</span>
                </div>
                <div className="space-y-2">
                  {lead.callScriptPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs text-indigo-950 font-normal leading-relaxed relative pl-7"
                    >
                      <span className="absolute left-2.5 top-2.5 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {point}
                    </div>
                  ))}
                </div>
              </div>

              {/* What to Confirm (1-Click Interactive Checklist) */}
              <div className="mt-4">
                <div className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>What to Confirm</span>
                  <span className="text-[10px] text-zinc-400">Click to check</span>
                </div>
                <div className="space-y-1.5">
                  {lead.whatToConfirm.map((item, idx) => {
                    const isChecked = !!checkedConfirmations[idx];
                    return (
                      <label
                        key={idx}
                        onClick={() =>
                          setCheckedConfirmations((prev) => ({ ...prev, [idx]: !prev[idx] }))
                        }
                        className={`flex items-start gap-2 p-2 rounded border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 line-through'
                            : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Operator Call Notes (Auto-saves on typing) */}
              <div className="mt-3">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Call Notes / Customer Objections
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Needs bike parking; loves the balcony; starting job on Monday..."
                  rows={2}
                  className="w-full text-xs p-2 rounded border border-zinc-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="p-2 bg-zinc-100 rounded text-[11px] text-zinc-600">
              💡 <strong>Pro Tip:</strong> Confirming tour slot before hanging up increases arrival rate by 68%.
            </div>
          </div>

          {/* COLUMN 3: Outcome, Tour Scheduling & Auto-Generated WhatsApp (4 cols) */}
          <div className="lg:col-span-4 p-4 flex flex-col justify-between space-y-3 bg-zinc-50/30">
            <div>
              <div className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">
                1. Select Outcome
              </div>

              {/* 1-Click Outcome Selector Chips */}
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                <button
                  type="button"
                  onClick={() => setOutcome('tour_scheduled')}
                  className={`p-2 rounded-lg text-left text-xs font-medium border transition-all cursor-pointer ${
                    outcome === 'tour_scheduled'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>1. Lock Tour</span>
                    {outcome === 'tour_scheduled' && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${outcome === 'tour_scheduled' ? 'text-emerald-100' : 'text-zinc-400'}`}>
                    Physical / Video
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOutcome('quote_requested')}
                  className={`p-2 rounded-lg text-left text-xs font-medium border transition-all cursor-pointer ${
                    outcome === 'quote_requested'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>2. Send Quote</span>
                    {outcome === 'quote_requested' && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${outcome === 'quote_requested' ? 'text-indigo-100' : 'text-zinc-400'}`}>
                    Price Breakdown
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOutcome('follow_up_needed')}
                  className={`p-2 rounded-lg text-left text-xs font-medium border transition-all cursor-pointer ${
                    outcome === 'follow_up_needed'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>3. Follow-up</span>
                    {outcome === 'follow_up_needed' && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${outcome === 'follow_up_needed' ? 'text-amber-100' : 'text-zinc-400'}`}>
                    Call back later
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOutcome('not_interested')}
                  className={`p-2 rounded-lg text-left text-xs font-medium border transition-all cursor-pointer ${
                    outcome === 'not_interested'
                      ? 'bg-zinc-700 text-white border-zinc-700 shadow-xs'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>4. Not Interested</span>
                    {outcome === 'not_interested' && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${outcome === 'not_interested' ? 'text-zinc-300' : 'text-zinc-400'}`}>
                    Close / Archive
                  </div>
                </button>
              </div>

              {/* Tour Scheduling Sub-box (Only if tour selected) */}
              {outcome === 'tour_scheduled' && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-2 mb-3">
                  <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Tour Slot & Mode</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="text-[10px] text-zinc-500 font-medium">Day</label>
                      <select
                        value={tourDate}
                        onChange={(e) => setTourDate(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-zinc-300 rounded font-medium focus:outline-hidden"
                      >
                        <option value="Today">Today</option>
                        <option value="Tomorrow">Tomorrow</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-500 font-medium">Time</label>
                      <select
                        value={tourTime}
                        onChange={(e) => setTourTime(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-zinc-300 rounded font-medium focus:outline-hidden"
                      >
                        <option value="4:00 PM">4:00 PM</option>
                        <option value="4:30 PM">4:30 PM</option>
                        <option value="5:00 PM">5:00 PM</option>
                        <option value="5:30 PM">5:30 PM</option>
                        <option value="6:00 PM">6:00 PM</option>
                        <option value="6:30 PM">6:30 PM</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-500 font-medium">Mode</label>
                      <select
                        value={tourType}
                        onChange={(e) => setTourType(e.target.value as any)}
                        className="w-full text-xs p-1.5 bg-white border border-zinc-300 rounded font-medium focus:outline-hidden"
                      >
                        <option value="In-Person Physical">Physical</option>
                        <option value="Live Video Tour">Video Tour</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* AUTO-WRITTEN CUSTOMER WHATSAPP MESSAGE */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Auto-Written WhatsApp Message</span>
                  </div>
                  <button
                    onClick={handleCopyMessage}
                    className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-zinc-900 text-zinc-100 rounded-lg text-xs leading-relaxed font-sans border border-zinc-800">
                  {autoComposedMessage}
                </div>
              </div>

              {/* Auto-computed Next Step & Deadline */}
              <div className="mt-2.5 p-2 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-950">
                <span className="font-bold text-[11px] text-indigo-800 block">Auto-Assigned Next Step:</span>
                <span>{autoNextStep}</span>
              </div>
            </div>

            {/* FINISH BUTTONS (One click writes back to hosted backend & updates audit trail) */}
            <div className="pt-2 border-t border-zinc-200 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded border border-zinc-300 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleFinishCall}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Saving to Backend...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finish Call & Lock State (Enter)</span>
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  autoComposedMessage
                )}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors cursor-pointer"
                title="Open in WhatsApp Web"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
