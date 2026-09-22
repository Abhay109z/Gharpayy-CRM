import React, { useState, useEffect } from 'react';
import { Lead, DailyCarePromise } from '../types.js';
import {
  CalendarCheck,
  Target,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  Flame,
  Copy,
  Check,
  Send,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  PhoneCall,
  CheckSquare
} from 'lucide-react';
import { formatCurrency, formatDeadline } from '../utils/formatters.js';

interface Props {
  leads: Lead[];
  onUpdateLead: (updatedLead: Lead) => void;
  activeOperator: string;
  onOpenMPowerCall: (lead: Lead) => void;
}

export const MovementCareView: React.FC<Props> = ({
  leads,
  onUpdateLead,
  activeOperator,
  onOpenMPowerCall
}) => {
  const [promise, setPromise] = useState<DailyCarePromise | null>(null);
  const [activeQueueIndex, setActiveQueueIndex] = useState(0);
  const [targetCalls, setTargetCalls] = useState(30);
  const [targetTours, setTargetTours] = useState(6);
  const [targetClosings, setTargetClosings] = useState(2);
  const [promiseNote, setPromiseNote] = useState(
    'Will convert Rohan Varma to tour, lock Vikram Rathore deposit, and run 30 qualified conversations.'
  );
  const [isEditingPromise, setIsEditingPromise] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch daily care data from backend
  const fetchCareData = async () => {
    try {
      const res = await fetch('/api/movement-care');
      const data = await res.json();
      if (data.promise) {
        setPromise(data.promise);
        setTargetCalls(data.promise.targetCalls);
        setTargetTours(data.promise.targetTours);
        setTargetClosings(data.promise.targetClosings);
        setPromiseNote(data.promise.promisedClosingNotes);
      }
    } catch (err) {
      console.error('Failed to load Movement CARE data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCareData();
  }, []);

  const handleSavePromise = async () => {
    try {
      const res = await fetch('/api/movement-care/promise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCalls,
          targetTours,
          targetClosings,
          promisedClosingNotes: promiseNote,
          operatorName: activeOperator
        })
      });
      const data = await res.json();
      if (data.success && data.promise) {
        setPromise(data.promise);
        setIsEditingPromise(false);
      }
    } catch (err) {
      console.error('Failed to save promise:', err);
    }
  };

  const handleWorkLead = async (leadId: string, actionNote: string, nextStage?: Lead['stage']) => {
    try {
      const res = await fetch('/api/movement-care/complete-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          operatorName: activeOperator,
          notes: actionNote,
          nextStage
        })
      });
      const data = await res.json();
      if (data.success && data.promise) {
        setPromise(data.promise);
        // Refresh local lead state if changed
        if (nextStage) {
          const target = leads.find((l) => l.id === leadId);
          if (target) {
            onUpdateLead({ ...target, stage: nextStage, isOverdue: false });
          }
        }
        // Auto-advance to next lead in sprint queue
        if (activeQueueIndex < queueLeads.length - 1) {
          setActiveQueueIndex((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error('Failed to mark lead worked:', err);
    }
  };

  const queueLeads = promise?.leadIds
    ? promise.leadIds.map((id) => leads.find((l) => l.id === id)).filter(Boolean) as Lead[]
    : leads.slice(0, 30);

  const currentLead = queueLeads[activeQueueIndex] || queueLeads[0];
  const completedCount = promise?.completedLeadIds?.length || 0;
  const progressPercent = Math.min(100, Math.round((completedCount / (promise?.targetCalls || 30)) * 100));

  // Compute live EOD WhatsApp report
  const toursScheduled = queueLeads.filter(
    (l) => l.stage === 'tour_scheduled' || l.stage === 'tour_completed'
  ).length;
  const closingsWon = queueLeads.filter(
    (l) => l.stage === 'booking_confirmed' || l.stage === 'check_in_done'
  ).length;

  const generatedWhatsAppReport =
    promise?.whatsappSummaryText ||
    `*Movement CARE — Daily Operations Update*\nDate: ${new Date().toISOString().split('T')[0]}\nOperator: ${activeOperator}\n• Leads Worked: ${completedCount} / ${
      promise?.targetCalls || 30
    }\n• Tours Scheduled: ${toursScheduled} / ${promise?.targetTours || 6}\n• Closings Locked: ${closingsWon} / ${
      promise?.targetClosings || 2
    }\n• SLA Status: ${completedCount >= (promise?.targetCalls || 30) ? 'COMPLETED' : 'IN PROGRESS'}`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generatedWhatsAppReport);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const isCurrentLeadCompleted = currentLead && promise?.completedLeadIds.includes(currentLead.id);
  const deadlineInfo = currentLead ? formatDeadline(currentLead.deadline) : { text: '', isOverdue: false };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-base font-bold text-zinc-950 tracking-tight flex items-center gap-2">
            <span>Movement CARE — Daily 30-Lead Sprint & Result Commitment</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Commit daily goals at morning standup, work 30 prioritized customer records sequentially, and generate the end-of-day team summary.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-700 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded font-mono font-medium">
            Operator: {activeOperator}
          </span>
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded font-semibold">
            {completedCount} / {promise?.targetCalls || 30} Completed
          </span>
        </div>
      </div>

      {/* 1-Line Prominent Module Outcome Banner */}
      <div className="px-4 py-2 bg-gradient-to-r from-emerald-950 via-zinc-900 to-teal-950 text-white rounded-xl text-xs flex items-center justify-between shadow-2xs border border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-800">
            Module Outcome
          </span>
          <span className="font-semibold text-white">
            Operators lock daily sprint targets, execute 30 customer touchpoints, and auto-generate EOD WhatsApp proof.
          </span>
        </div>
        <span className="text-[11px] text-emerald-200 hidden sm:inline">
          Daily Result Commitment &bull; 100% Accountable Execution
        </span>
      </div>

      {/* DAILY RESULT PROMISE CARD (Top Banner) */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-900">Today's Result Promise</h2>
                <span className="text-[11px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-mono">
                  {new Date().toDateString()}
                </span>
                <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">
                  Operator: {activeOperator}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Every operator commits target outcomes at 9:30 AM and delivers the verified WhatsApp update at 7:30 PM.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditingPromise ? (
              <button
                onClick={handleSavePromise}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Save Promise
              </button>
            ) : (
              <button
                onClick={() => setIsEditingPromise(true)}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Edit Target
              </button>
            )}
          </div>
        </div>

        {/* Target Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3">
          <div className="p-3.5 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-emerald-50/60 rounded-xl border border-emerald-200/80 shadow-2xs flex flex-col justify-between">
            <div className="text-[11px] text-emerald-800 uppercase font-bold tracking-wider">Leads to Work</div>
            {isEditingPromise ? (
              <input
                type="number"
                value={targetCalls}
                onChange={(e) => setTargetCalls(Number(e.target.value))}
                className="text-lg font-bold w-20 px-2 py-1 bg-white border border-emerald-300 rounded-md mt-1"
              />
            ) : (
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-emerald-950">{completedCount}</span>
                <span className="text-xs text-emerald-700 font-semibold">/ {promise?.targetCalls || 30}</span>
              </div>
            )}
            <div className="w-full bg-emerald-200/80 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300 shadow-2xs"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-50/60 rounded-xl border border-amber-200/80 shadow-2xs flex flex-col justify-between">
            <div className="text-[11px] text-amber-800 uppercase font-bold tracking-wider">Tours Promised</div>
            {isEditingPromise ? (
              <input
                type="number"
                value={targetTours}
                onChange={(e) => setTargetTours(Number(e.target.value))}
                className="text-lg font-bold w-20 px-2 py-1 bg-white border border-amber-300 rounded-md mt-1"
              />
            ) : (
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-amber-900">{toursScheduled}</span>
                <span className="text-xs text-amber-700 font-semibold">/ {promise?.targetTours || 6}</span>
              </div>
            )}
            <div className="text-[10px] text-amber-700 font-medium mt-1">Locked physical & video visits</div>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-violet-50 via-purple-50/40 to-violet-50/60 rounded-xl border border-violet-200/80 shadow-2xs flex flex-col justify-between">
            <div className="text-[11px] text-violet-800 uppercase font-bold tracking-wider">Closings Promised</div>
            {isEditingPromise ? (
              <input
                type="number"
                value={targetClosings}
                onChange={(e) => setTargetClosings(Number(e.target.value))}
                className="text-lg font-bold w-20 px-2 py-1 bg-white border border-violet-300 rounded-md mt-1"
              />
            ) : (
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-violet-950">{closingsWon}</span>
                <span className="text-xs text-violet-700 font-semibold">/ {promise?.targetClosings || 2}</span>
              </div>
            )}
            <div className="text-[10px] text-violet-700 font-medium mt-1">Token paid / Check-in done</div>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-indigo-50 via-sky-50/40 to-indigo-50/60 border border-indigo-200/80 rounded-xl shadow-2xs flex flex-col justify-between">
            <div className="text-[11px] text-indigo-900 font-bold uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-indigo-600" />
              <span>Operator Pledge</span>
            </div>
            {isEditingPromise ? (
              <textarea
                value={promiseNote}
                onChange={(e) => setPromiseNote(e.target.value)}
                className="text-xs w-full p-1.5 bg-white border border-indigo-300 rounded mt-1"
                rows={2}
              />
            ) : (
              <p className="text-xs text-indigo-950 font-medium leading-tight mt-1 line-clamp-2 italic">
                "{promiseNote}"
              </p>
            )}
            <div className="text-[10px] text-indigo-700 font-bold mt-1">
              {progressPercent}% FULFILLED
            </div>
          </div>
        </div>
      </div>

      {/* SPRINT QUEUE RUNNER: Work 30 Leads One-by-One */}
      {currentLead && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Active Lead Dossier Runner Card (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-zinc-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-full font-mono">
                    Lead {activeQueueIndex + 1} of {queueLeads.length}
                  </span>
                  <h3 className="text-base font-bold text-zinc-900">{currentLead.name}</h3>
                  <span className="text-xs text-zinc-400 font-mono">{currentLead.phone}</span>
                </div>

                {/* Overdue alert in Red */}
                <div className="flex items-center gap-2">
                  {deadlineInfo.isOverdue ? (
                    <span className="text-xs font-bold bg-red-600 text-white px-2.5 py-0.5 rounded animate-pulse flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      LATE: {deadlineInfo.text}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {deadlineInfo.text}
                    </span>
                  )}

                  {isCurrentLeadCompleted && (
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Worked
                    </span>
                  )}
                </div>
              </div>

              {/* Lead Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Locality & Workplace</span>
                  <strong className="text-zinc-800 text-sm mt-0.5 block">{currentLead.locality}</strong>
                  <span className="text-zinc-500 mt-1 block">{currentLead.whatIsAlreadyKnown.workplace}</span>
                </div>

                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Budget & Room</span>
                  <strong className="text-emerald-700 text-sm mt-0.5 block">
                    {formatCurrency(currentLead.budget)}/mo
                  </strong>
                  <span className="text-zinc-500 mt-1 block">
                    {currentLead.propertyType} • {currentLead.occupancyType}
                  </span>
                </div>

                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Accountable Owner</span>
                  <strong className="text-zinc-800 text-sm mt-0.5 block">{currentLead.owner}</strong>
                  <span className="text-zinc-500 mt-1 block">Move-in: {currentLead.moveInDate}</span>
                </div>
              </div>

              {/* Why we are calling */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-950 mb-3">
                <span className="font-bold block mb-1">Intent / Inquiry Trigger:</span>
                {currentLead.whyWeAreCalling}
              </div>

              {/* Matched Property */}
              {currentLead.recommendedProperty && (
                <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">Matched Property:</span>
                    <div className="font-semibold text-zinc-900 mt-0.5">
                      {currentLead.recommendedProperty.title}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700">
                      {formatCurrency(currentLead.recommendedProperty.monthlyRent)}/mo
                    </span>
                    <div className="text-[11px] text-zinc-500">
                      {currentLead.recommendedProperty.walkingToMetro}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick 1-Click Action Buttons for this Lead */}
            <div className="pt-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => onOpenMPowerCall(currentLead)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Launch M-POWER CALL</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleWorkLead(currentLead.id, 'Tour scheduled in daily sprint', 'tour_scheduled')}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Lock Tour & Next
                </button>

                <button
                  onClick={() => handleWorkLead(currentLead.id, 'Follow up scheduled for afternoon', 'contacted')}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Follow-up & Next
                </button>

                <button
                  onClick={() => {
                    if (activeQueueIndex < queueLeads.length - 1) {
                      setActiveQueueIndex((p) => p + 1);
                    }
                  }}
                  className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Skip</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* SPRINT QUEUE NAVIGATOR & EOD WHATSAPP REPORT (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* 30-Lead Sprint Queue Selector */}
            <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <span className="font-bold text-xs text-zinc-800 uppercase tracking-wider">
                  30-Lead Sprint Queue
                </span>
                <span className="text-xs text-emerald-700 font-semibold">
                  {completedCount}/30 Done
                </span>
              </div>

              <div className="grid grid-cols-6 gap-1.5 pt-3 max-h-40 overflow-y-auto">
                {queueLeads.map((item, idx) => {
                  const isDone = promise?.completedLeadIds.includes(item.id);
                  const isCurrent = idx === activeQueueIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveQueueIndex(idx)}
                      className={`h-8 rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isCurrent
                          ? 'ring-2 ring-indigo-600 bg-indigo-50 text-indigo-700 font-black'
                          : isDone
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.isOverdue
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                      title={`${item.name} (${item.stage})`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AUTOMATED END-OF-DAY WHATSAPP REPORT GENERATOR */}
            <div className="bg-zinc-900 text-zinc-100 rounded-xl p-4 border border-zinc-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs text-white uppercase tracking-wider">
                    EOD WhatsApp Summary
                  </span>
                </div>
                <button
                  onClick={handleCopyReport}
                  className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer"
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReport ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap border border-zinc-800">
                {generatedWhatsAppReport}
              </div>

              <div className="text-[11px] text-zinc-400">
                Auto-written directly from verified CRM events. Ready to broadcast to founders & operators.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
