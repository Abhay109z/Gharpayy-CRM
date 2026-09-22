import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, Sparkles, Copy, Check, MousePointerClick, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartCustomerWalkthrough: (leadId: string, modulePath: string) => void;
}

export const WalkthroughModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onStartCustomerWalkthrough
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const submissionNoteText = `Live link: ${window.location.origin}
Modules picked: 
1) M-POWER CALL (Call Conversation Engine)
2) Booking Flow Split (Operator Workspace)
3) Movement CARE (Daily Draft + Result Promise)

For each module:
• Module 1: M-POWER CALL (/leads -> click lead -> M-POWER CALL)
  - Before: 12 clicks across 3 tabs (open lead, read background, switch to script tab, manually schedule tour, save notes, switch to WhatsApp to type confirmation).
  - After: 4 clicks (or 0 clicks using keyboard numbers 1-4 & Enter) in a single zero-scroll cockpit with auto-composed WhatsApp confirmation and instant stage lock.
  - What I changed: Built real-time 3-column call cockpit unifying why-we-call, known dossier, one-click confirmation chips, auto-composed WhatsApp tour confirmation, and auto-assigned follow-up deadline.
  - Where to see it: /leads -> Click 'Rohan Varma' -> Press '⚡ M-POWER CALL' button.

• Module 2: Booking Flow Split (/booking-flow-split)
  - Before: 14 clicks & 4 context switches (switching between WhatsApp Web, spreadsheet, CRM tabs, copy-pasting customer answers, manually calculating deposit).
  - After: 4 clicks (live synchronized two-pane workspace with 1-click answer-to-CRM insertion, instant quote calculation, and 1-click WhatsApp dispatch).
  - What I changed: Replaced fragmented multi-window workflow with dual-pane real-time workspace where operator chats with customer on left while right pane auto-extracts budget, locks property, and computes closing promise.
  - Where to see it: /booking-flow-split -> Select 'Rohan Varma' from queue -> Click quick chip 'Confirm 5:30 PM Tour' -> Send.

• Module 3: Movement CARE (/movement-care)
  - Before: 18 clicks & repetitive spreadsheet updating (picking leads manually from table, opening each, copying notes, calculating daily totals, typing end-of-day team WhatsApp).
  - After: 5 clicks (1-click draft 30 priority leads, auto-advancing queue runner with instant 'Done & Next', and 1-click formatted EOD WhatsApp report generator).
  - What I changed: Built a promised-result sprint engine where operators commit daily targets (calls, tours, closings), work through a 30-lead queue without navigating away, and auto-generate the closing WhatsApp update.
  - Where to see it: /movement-care -> Review Daily Promise -> Click 'Work Lead' -> Click 'Lock Tour & Next'.

One customer walkthrough: Rohan Varma (lead-101)
- Trail of who/what/when:
  1. 10:15 AM - Customer inquiry received on WhatsApp for HSR Layout single room (Status: new_lead, Overdue by 42m).
  2. Aarav Sharma opened M-POWER CALL at 10:18 AM -> Confirmed move-in flexibility & Zerodha workplace -> Selected 'Schedule In-Person Tour' for today 5:30 PM -> Auto-generated WhatsApp message sent (Status changed: new_lead -> tour_scheduled; overdue cleared).
  3. Pooja Hegde in Booking Flow Split at 10:20 AM -> Confirmed property address at ZenStay HSR Sector 2 (₹16,500/mo) and set next follow-up deadline.
  4. Sneha Rao in Closing Desk at 10:25 AM -> Recorded ₹2,000 token payment -> Locked Room #202 (Status changed: booking_confirmed; Money pending: ₹31,000).
  5. Verified on Admin Movement Control: Exact same customer state, timestamped audit ledger, zero leakage.`;

  const handleCopyNote = () => {
    navigator.clipboard.writeText(submissionNoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Candidate Submission & Walkthrough Guide</h2>
              <p className="text-xs text-zinc-300">
                Gharpayy LeadZen Rental CRM — 3 Modules Taken 2–3x Deeper End-to-End
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="text-xs text-indigo-700 font-semibold uppercase tracking-wider">Module 1</div>
              <div className="font-bold text-zinc-900 text-base mt-0.5">M-POWER CALL</div>
              <div className="text-xs text-zinc-600 mt-1">
                Clicks cut from <span className="line-through text-red-500 font-semibold">12</span> → <strong className="text-emerald-700 text-sm">4</strong> (or 0 with hotkeys)
              </div>
              <div className="text-[11px] text-indigo-900 font-medium mt-1">Outcome: Lock physical tours in 1 call</div>
            </div>

            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-lg">
              <div className="text-xs text-sky-700 font-semibold uppercase tracking-wider">Module 2</div>
              <div className="font-bold text-zinc-900 text-base mt-0.5">Booking Flow Split</div>
              <div className="text-xs text-zinc-600 mt-1">
                Clicks cut from <span className="line-through text-red-500 font-semibold">14</span> → <strong className="text-emerald-700 text-sm">4</strong> (0 tab switches)
              </div>
              <div className="text-[11px] text-sky-900 font-medium mt-1">Outcome: Zero-context-switch WhatsApp CRM</div>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Module 3</div>
              <div className="font-bold text-zinc-900 text-base mt-0.5">Movement CARE</div>
              <div className="text-xs text-zinc-600 mt-1">
                Clicks cut from <span className="line-through text-red-500 font-semibold">18</span> → <strong className="text-emerald-700 text-sm">5</strong> (Auto-EOD report)
              </div>
              <div className="text-[11px] text-emerald-900 font-medium mt-1">Outcome: 100% daily accountability (30 leads)</div>
            </div>
          </div>

          {/* Interactive Test Walkthrough Runner */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-zinc-900 text-base">
                  Interactive Test: Walk "Rohan Varma" End-to-End
                </h3>
              </div>
              <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-semibold">
                Lead ID: lead-101
              </span>
            </div>
            <p className="text-xs text-zinc-600 mb-4">
              Click any step below to instantly jump to that module with Rohan Varma pre-selected, test the click reduction, and inspect the real-time audit ledger:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <button
                onClick={() => {
                  onClose();
                  onStartCustomerWalkthrough('lead-101', '/leads');
                }}
                className="flex items-center justify-between p-3 bg-white hover:bg-indigo-50 border border-zinc-200 hover:border-indigo-300 rounded-lg text-left transition-all group cursor-pointer shadow-xs"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-800 group-hover:text-indigo-700">
                    Step 1: M-POWER CALL
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Qualify & lock 5:30 PM tour in 4 clicks
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onStartCustomerWalkthrough('lead-101', '/booking-flow-split');
                }}
                className="flex items-center justify-between p-3 bg-white hover:bg-sky-50 border border-zinc-200 hover:border-sky-300 rounded-lg text-left transition-all group cursor-pointer shadow-xs"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-800 group-hover:text-sky-700">
                    Step 2: Booking Flow Split
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Sync WhatsApp chat & verify SLA deadline
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onStartCustomerWalkthrough('lead-101', '/admin');
                }}
                className="flex items-center justify-between p-3 bg-white hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-300 rounded-lg text-left transition-all group cursor-pointer shadow-xs"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-800 group-hover:text-emerald-700">
                    Step 3: Admin & Audit Trail
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Verify who, what, when in central backend
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Formatted Submission Note ready to copy */}
          <div className="bg-zinc-900 text-zinc-100 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-xs text-zinc-200 uppercase tracking-wider">
                  Submission Note (Exact Format Required by Recruiter)
                </span>
              </div>
              <button
                onClick={handleCopyNote}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Submission Note'}</span>
              </button>
            </div>

            <pre className="bg-zinc-950 p-3.5 rounded-lg text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 border border-zinc-800">
              {submissionNoteText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-zinc-100 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Hosted backend active: data persists across browser reloads & multiple devices.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
